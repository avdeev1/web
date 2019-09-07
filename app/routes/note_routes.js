const updateMetrics = require('./updateMetrics');
const encodePassword = require('./encodePassword');

module.exports = function(app,connection){
  app.get('/current_projects_list', (req, res) => {
    connection.query('select id, name, shortDescription, status, tags from project order by id desc;', function(error, rows, fields) {
      if (!error) {
        res.json(rows);
      }
    });
  });

  app.get('/about/id/:id', (req, res) => {
    let id = parseInt(req.params.id);
    connection.query('select project.name, project.description, project.tags, customer.name as cust, customer.link, project.hard_level, project.githubRepo, project.status from project inner join customer on customer.id = project.customer_id where project.id = ' + id, function(error, rows, fields) {
      if (!error) {
        res.json(rows);
      }
    });
  });

  app.get('/metrics/:id', (req, res) => {
    let id = req.params.id;
    connection.query('select * from metrics where project_id = ' + id, function(error, rows, fields) {
      if (!error) {
        res.json(rows);
      }
    });
  });

  app.post('/login', (req, res) => {
    let note = {username:req.body.email,password:req.body.password};
    connection.query('select user_id,email, password from user_data where email = "' + note.username + '"', function(error, rows, field) {
      if (error) {
        console.log(error);
      } else {
        if (rows.length == 1) {
          let hash = encodePassword(note.password);
          if (rows[0].password == hash) {
            let ok = {'status':'ok', 'id':rows[0].user_id};
            res.json(ok);
          } else {
            let ok = {'status':'uncorrect_password'};
            res.json(ok);
          }
        } else {
          let ok = {'status': 'uncorrect_email'};
          res.json(ok);
        }
      }
    });
  });

  app.post('/addproject', (req, res) => {

    let project = {name:req.body.name, customer: req.body.customer, cust_link: req.body.customer_link, shortdesc: req.body.short_description, desc: req.body.description, ghRepo: req.body.ghRepo, difficulty:req.body.difficulty, startedAt:req.body.startedAt, metrics: req.body.metrics, tags: req.body.tags, jobs: req.body.jobs};
    
    setCustomer(project.customer, project.cust_link, project.desc, project.difficulty, project.ghRepo, project.name, project.shortdesc, project.tags, project.startedAt, project.metrics, project.jobs);

    res.redirect('/');
  });

  let setCustomer = function(customer, custLink, description, difficulty, ghRepo, title, shortDesc, tags, date, metric, jobs) {
    let result_cust_id;
    connection.query('select count(name) as cnt from customer union (select name from customer where name="' + customer + '");',function(error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        if (rows.length == 1) {
          result_cust_id = parseInt(rows[0].cnt) + 1;
          connection.query('insert into customer (name, link) values("' + customer +  '", "' + custLink + '");', function(err, res, f) {
            if (err) {
              console.log(error);
            }
          });
        setProject(result_cust_id, description, difficulty, ghRepo, title, shortDesc, tags, date, metric, jobs);
        } else {
          connection.query('select id from customer where name = "' + customer + '";', function(err, res, fi) {
            if (err) {
              console.log(err);
            } else {
              result_cust_id = parseInt(res[0].id);
              setProject(result_cust_id, description, difficulty, ghRepo, title, shortDesc, tags, date, metric, jobs);
            }
          })
        }
      }

    });
    
  }

  let setProject = function(customerId, description, difficulty, ghRepo, title, shortDesc, tags, date, metric, jobs){
    let idProject;
    connection.query('select max(id) as cnt from project;', function(error, rows, f) {
      if (error) {
        console.log(error);
      } else {
        idProject = parseInt(rows[0].cnt);
        idProject++;
        connection.query('insert into project (customer_id,description,hard_level,githubRepo,name,shortDescription,tags,status) values(' + customerId + ',"' + description +'", "' + difficulty + '","' + ghRepo + '","' + title + '","' + shortDesc + '", "' + tags + '", 0);', function(err, r, fi) {
          if (err) {
            console.log(err);
          } else {
            setMetrics(idProject, date, metric, jobs);
          }
        });
      }
    });
    
  }

  let setMetrics = function(idProject, date, metric, jobs) {
    console.log(date +'    ' + metric);
    connection.query('insert into metrics values(' + idProject + ',"' + date + '","' + metric +'");', function(error, rows, f) {
      if (error) {
        console.log(error);
      } else {
        setJobs(idProject, jobs);
      }
    });
  }

  let setJobs = function(idProject, jobs) {
    let arr_jobs = jobs.split(' ');
    for (let i = 0; i < arr_jobs.length; i++) {
      job(idProject, arr_jobs[i]);
    }
  }

  let job = function(idProject, job) {
    connection.query('insert into jobs (project_id, name) values (' + idProject + ', "' + job + '");', function(error, rows, res){
      if (error) {
        console.log(error);
      }
    });
  }

  app.post('/setmetrics', (req, res) => {
    let metric = {id:req.body.id, date: req.body.date, data: req.body.data};
    console.log(metric.id + '   ' + metric.date + '   ' + metric.data);
    connection.query('insert into metrics values(' + metric.id + ',"' + (metric.date + ' 07:00') + '","' + metric.data + '");', function(error, rows, field) {
      if (error) {
        console.log(error);
      } else {
        getStartMetric(metric.id, metric.data);
        res.redirect('/about/' + metric.id);
      }
    });
  });

  let getStartMetric = function(idProject, last) {
    connection.query('select max(data) as max, min(data) as min from metrics where project_id = ' + idProject + ';', function(error, rows, field){
      if (error) {
        console.log(error);
      } else {
        let status = updateMetrics(rows[0].max, rows[0].min);
        updateStatusOnProject(idProject, status);
      }
    });
  }

  let updateStatusOnProject = function(idProject, status) {
    connection.query('update project set status=' + status + ' where id = ' + idProject + ';', function(error, rows, field){
      if (error) {
        console.log(error);
      }
    });
  }

  app.post('/registrationuser', (req, res) => {
    let user = {name: req.body.name, lastname: req.body.lastname, email: req.body.email, password: req.body.password, secpassword: req.body.secondpassword};
    if (user.password != user.secpassword) {
      res.redirect('/registration/up');
    } else {
      connection.query('select email from user_data where email = "' + user.email + '";', function(error, rows, fields) {
        if (error) {
          console.log(error);
        } else {
          if (rows.length == 0) {
            connection.query('insert into user (first_name, last_name) values("' + user.name + '","' + user.lastname + '");', function(error, rows, field) {
              if (error) {
                console.log(error);
              } else {
                connection.query('select count(id) as cnt from user', function(err, resquer, f){
                  if (err) {
                    console.log(err);
                  } else {
                    let hash = encodePassword(user.password);
                    connection.query('insert into user_data values(' + resquer[0].cnt + ', "' + user.email + '", "' + hash + '");', function(e, r, f) {
                      if (e) {
                        console.log(e);
                      } else {
                        res.redirect('/reg/' + resquer[0].cnt);
                      }
                    })
                  }
                });
              }
            });
            
          } else {
            res.redirect('/registration/ue');
          }
        }
        
      });
    }
  });

  app.get('/info/:id', (req, res) => {
    let id = req.params.id;
    connection.query('select user.first_name, user.id as usid, user.last_name, user.faculty, user.course, user.about, user_data.email, project.id, project.name, project_has_user.status from user inner join user_data on user_data.user_id = user.id left join project_has_user on project_has_user.user_id = user.id left join project on project.id = project_has_user.project_id where user.id = ' + id + ';', function(error, rows, field){
      if (error) {
        console.log(error);
      } else {
        res.json(rows[0]);
      }
    });
  });

  app.post('/infoedit', (req, res) => {
    let user = {id: req.body.userId, name:req.body.name, lname: req.body.lname, fac: req.body.fac, course: req.body.course, about: req.body.about};
    connection.query('update user set first_name="' + user.name + '", last_name = "' + user.lname + '",faculty="' + user.fac + '", course="' + user.course + '", about="' + user.about + '" where id = ' + user.id + ';', function(error, rows, field) {
      if (error) {
        console.log(error);
      } else {
        res.redirect('/profile/' + user.id);
      }
    });
  });


  app.get('/jobs/:id', (req, res) => {
    let id = req.params.id;
    connection.query('select jobs.id, jobs.name, project_has_user.user_id, project_has_user.status, user.first_name, user.last_name from jobs  left outer join project_has_user on jobs.id = project_has_user.jobs_id left join user on user.id = project_has_user.user_id where jobs.project_id =' + id + ' order by jobs.id;', function(error, rows, field) {
      if (error) {
        console.log(error);
      } else {
        res.json(rows);
      }
    });
  });

  app.post('/join', (req, res) => {
    let info = {idProject: req.body.projId, idUser: req.body.userId, idJob: req.body.job};
    connection.query('select * from project_has_user inner join user on project_has_user.user_id = user.id where user.id = ?', [info.idUser], function(err, result, f) {
      if (err) {
        console.log(err);
      } else if (result.length != 0) {
        res.redirect('/');
      } else {
        connection.query('select * from project_has_user inner join jobs on project_has_user.jobs_id = jobs.id where jobs.id = ? and project_has_user.status = "joined"', [info.idJob], function(error, resultat, fi) {
          if (error) {
            console.log(error);
          } else if (resultat.length != 0) {
              res.redirect('/');
            } else {
              connection.query('insert into project_has_user values(' + info.idProject + ', ' + info.idUser + ', "wait", ' + info.idJob + ');', function(error, rows, field) {
                if (error) {
                  console.log(error);
                } else {
                  res.redirect('/about/' + info.idProject);
                }
              });
            }
        });
      }
    });
  });

  app.get('/statusUser/:id/:proj', (req, res) => {
    let idUser = req.params.id;
    let idProj = req.params.proj;
    connection.query('select project_has_user.status, project.id from project_has_user inner join project on project_has_user.project_id = project.id where project_has_user.user_id =' + idUser + ' and project.status != 100;', function(error, rows, field) {
      if (error) {
        console.log(error);
      } else {
        res.json(rows);
      }
    });
  });

  app.get('/getlist', (req, res) => {
    connection.query('select project.name as title, jobs.id as jobId, project.id as idProject, user.first_name, user.last_name, user.id as userId, jobs.name from project_has_user  inner join user on project_has_user.user_id = user.id inner join jobs on jobs.id = project_has_user.jobs_id inner join project on project.id = project_has_user.project_id where project_has_user.status = "wait" order by project.id;', function(error, rows, field) {
      if (error) {
        console.log(error);
      } else {
        res.json(rows);
      }
    });
  });

  app.get('/addstudent/:id/:name', (req, res) => {
    const userId = req.params.id;
    const jobId = req.params.name;

    connection.query('update project_has_user set status="joined" where project_has_user.user_id =' + userId + ';', function(error, rows, field) {
      if (error) {
        console.log(error);
      } else {
        connection.query('delete from project_has_user where status = "wait" and project_has_user.jobs_id =' + jobId + ';', function(err, r, f) {
          if (err) {
            console.log(err);
          } else {
            res.redirect('/');
          }
        })
      }
    });
   
  });

  app.get('/dropstudent/:id/:name', (req, res) => {
    let userId = req.params.id;
    let jobId = req.params.name;
    connection.query('delete from project_has_user where status = "wait" and project_has_user.jobs_id = ' + jobId + ' and project_has_user.user_id = ' + userId + ';', function(err, r, f) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  });

  app.post('/addcomment', (req, res) => {
    let com = {idProject: req.body.idProject, idUser: req.body.idUser, comment: req.body.comment};
    if (com.idUser == undefined) {
      res.redirect('/about/' + com.idProject);
    } else {
      connection.query('insert into comments (project_id, user_id, date, text) values(' + com.idProject + ',' + com.idUser + ',NOW(),"' + com.comment + '");', function(error, rows, f) {
        if (error) {
          console.log(error);
        } else {
          res.redirect('/about/' + com.idProject);
        }
      })
    }
  });

  app.get('/getcomments/:id', (req, res) => {
    let id = req.params.id;
    connection.query('select user.id, user.first_name, user.last_name, comments.text, comments.id as cid, comments.date from comments inner join user on user.id = comments.user_id where comments.project_id = ' + id + ';', function(error, rows, f) {
      if (error) {
        console.log(error);
      } else {
        res.json(rows);
      }
    });
  });

  app.get('/deletecomment/:id/:name/:com', (req, res) => {
    let idProject = req.params.name;
    let com = req.params.com;
    
    connection.query('delete from comments where id = ' + com + ';', function(error, rows) {
      if (error) {
        console.log(error);
      } else {
        res.redirect('/about/' + idProject);
      }
    });
  });
}
