let id_proj = document.location.pathname.substring(document.location.pathname.lastIndexOf('/') + 1);
let dates = [];
let metrics_chart = [];
let jobsPr = [];

let statusUser;

let comments;


function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

let id = getCookie('id');
if (id) {
  $('.iu').val(id);
  $('.ip').val(id_proj);
  $('.mes').css('display', 'none');
  $('.create-comment').css('display', 'block');
  $.ajax({
    type: 'get',
    url: '/statusUser/' + id + '/' + id_proj,
    success: function(data) {
      if (data.length == 0) {
        statusUser = 'free';
      } else if (data[0].status == 'wait') {
        statusUser = 'wait';
      } else {
        if (data[0].id == id_proj) {
          $('.add-metrics').css('display', 'block');
        }
        statusUser = 'joined';
      }

      if (statusUser == 'wait') {
        $('.join-to-project').text('Вы уже подали заявку на проект! Больше одной заявки подавать нельзя!');
        $('.join-to-project').attr('disabled', true);
      } else if (statusUser == 'joined') {
        $('.join-to-project').text('Вы уже участвуете в одном проектет! Больше одного активного проекта нельзя!');
        $('.join-to-project').attr('disabled', true);
      } else {
        $('.join-to-project').addClass('valid-button');
        $('.join-to-project').on('click', () => {
          $('.joined-form').css('display', 'block');
        });
      }
    }
  });

  $('.registration-div').css('display', 'none');
  $('.profile-div').css('display', 'block');
} else {
  $('.join-to-project').prop('disabled', true);
  $('.registration-div').css('display', 'block');
  $('.profile-div').css('display', 'none');
}

$('#userId').val(id);
$('#projId').val(id_proj);

if (id == '1') {
  
  $('.add-metrics').css('display', 'block');
}

$('#profile').attr('href', '/profile/' + id);


$('.add-metric-button').on('click', () => {
  $('.add-metrics-div').css('display', 'block');
  $('.idform').val(id_proj);
});



$(document).ready(function() {
  $.ajax({
    type: "GET",
    url: '/about/id/' + id_proj,
    success: function(data) {
      project = data;
      $.ajax({
        type: "GET",
        
        url: '/metrics/' + id_proj,
        dataType: "json",
        success: function(met) {
          $.ajax({
            type: 'get',
            url: '/jobs/' + id_proj,
            dataType: 'json',
            success: function(jobs) {
              $.ajax({
                type: 'get', 
                dataType: 'json',
                url: '/getcomments/' + id_proj,
                success: function(com) {
                  createJobs(jobs);
                  createDates(met);
                  createOpenCount(met);
                  run(project, com);
                }
              });
            }
          });
        }
      });
    }
  });
});


let createJobs = function(jobs) {
  jobsPr.push(jobs[0]);
  for (let i = 1; i < jobs.length; i++) {
    if (jobs[i].id != jobs[i-1].id) {
      jobsPr.push(jobs[i]);
    }
  }
}

let createDates = function(metrics_graph) {
  for (let i = 0; i < metrics_graph.length; i++) {
    let element = metrics_graph[i].date.substring(0,10);
    dates.push(element);
  }
}

let createOpenCount = function(metrics_graph) {
  for (let i = 0; i < metrics_graph.length; i++) {
    let element = metrics_graph[i].data;
    metrics_chart.push(element);
  }
}

let makeElement = function(tagName, className, text) {
  let element = document.createElement(tagName);
  element.classList.add(className);

  if (text) 
    element.textContent = text;

  return element;
};


let run = function(project, comments) {
  let desc = document.querySelector('.project-description');

  let title = makeElement('div', 'title-of-project', project[0].name);
  let graphic = document.querySelector('.chart1');
  desc.insertBefore(title, graphic);
  
  let customer_div = document.createElement('div');
  let customer = makeElement('a', 'customer-link');
  let custom = document.createElement('em');
  custom.textContent = 'Заказчик: ',
  customer.appendChild(custom);
  customer.textContent += project[0].cust;
  customer.setAttribute('href', '');
  customer_div.appendChild(customer);
  desc.insertBefore(customer_div, graphic);

  let h2 = document.createElement('h2');
  h2.textContent = 'О проекте:';
  desc.insertBefore(h2, graphic);

  let project_desc = makeElement('p', 'description', project[0].description);
  desc.insertBefore(project_desc, graphic);


  let graph = makeElement('div', 'graphic');
  graph.textContent += 'Зелёным цветом отмечены ожидаемые результаты, ';
  graph.textContent += 'красным - результаты реальной работы.';

  let gh = makeElement('div', 'github', 'Github: ');
  let a_gh = document.createElement('a');
  a_gh.href = project[0].githubRepo;
  a_gh.textContent = 'Ссылка на репозиторий';
  let com = document.querySelector('.comments');
  gh.appendChild(a_gh);
  desc.insertBefore(gh, com);

  let content;
  let class_status;


  if (project[0].status == 100) { 
    content = 'Завершён'; 
    class_status = 'finished';
  } else if (project[0].status == 0) {
    content = 'Не начат'; 
    class_status = 'in-future';
  } else { 
    content = 'В процессе'; 
    class_status = 'in-proccess';
  }
  

  document.getElementById('status').innerHTML = content;
  document.getElementById('status').classList.add(class_status);

  let color;
  let project_level;
  if (project[0].hard_level == '1') { 
    color = 'easy'; 
    project_level = 'Низкая';
  } else if (project[0].hard_level === '2') {
    color = 'medium';
    project_level = 'Средняя';
  } else { 
    color = "hard";
    project_level = 'Высокая';
  }

  document.getElementById('level').innerHTML = project_level;
  document.getElementById('level').classList.add(color);
  
  let tags = document.querySelector('.tags');
  let arr_tags = project[0].tags.split(' ');
  for (let i = 0; i < arr_tags.length; i++) {
    let litem = document.createElement('li');
    litem.textContent = arr_tags[i];
    tags.appendChild(litem);
  }

  let jobs = document.querySelector('.list-of-jobs .list');
  for (let i = 0; i < jobsPr.length; i++) {
    let litem = document.createElement('li');
    let link = document.createElement('a');
    link.textContent = jobsPr[i].name;
    
    if (jobsPr[i].status == 'joined') {
      link.textContent += ' - ' + jobsPr[i].first_name + ' ' + jobsPr[i].last_name;
      if (id) {
        link.href = '/profile/' + jobsPr[i].user_id;
        link.style.cursor = 'pointer';
      }
    }

    litem.appendChild(link);
    jobs.appendChild(litem);
    
  }

  let select = document.querySelector('.job');
  let counterSelect = 0;
  for (let i = 0; i < jobsPr.length; i++) {
    if (jobsPr[i].status != 'joined') {
      counterSelect++;
      let opt = document.createElement('option');
      opt.textContent = jobsPr[i].name;
      opt.value = jobsPr[i].id;
      select.appendChild(opt);
    }
  }

  if (!id) {
    $('.join-to-project').text('Чтобы подать заявку на проект, авторизуйтесь.');
  }

  if (counterSelect == 0) {
    $('.join-to-project').prop('disabled', true);
    $('.join-to-project').removeClass('valid-button');
    $('.join-to-project').text('Все места на проекте заняты!');
  }

  let chart = new Chartist.Line('.ct-chart', {
        labels: dates,
        series: [
          metrics_chart
        ]
      }, {
        low: 0
      });
    
      // Let's put a sequence number aside so we can use it in the event callbacks
      let seq = 0,
        delays = 80,
        durations = 500;
    
      // Once the chart is fully created we reset the sequence
      chart.on('created', function() {
        seq = 0;
      });
    
      // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
      chart.on('draw', function(data) {
        seq++;
    
        if(data.type === 'line') {
          // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
          data.element.animate({
            opacity: {
              // The delay when we like to start the animation
              begin: seq * delays + 1000,
              // Duration of the animation
              dur: durations,
              // The value where the animation should start
              from: 0,
              // The value where it should end
              to: 1
            }
          });
        } else if(data.type === 'label' && data.axis === 'x') {
          data.element.animate({
            y: {
              begin: seq * delays,
              dur: durations,
              from: data.y + 100,
              to: data.y,
              // We can specify an easing function from Chartist.Svg.Easing
              easing: 'easeOutQuart'
            }
          });
        } else if(data.type === 'label' && data.axis === 'y') {
          data.element.animate({
            x: {
              begin: seq * delays,
              dur: durations,
              from: data.x - 100,
              to: data.x,
              easing: 'easeOutQuart'
            }
          });
        } else if(data.type === 'point') {
          data.element.animate({
            x1: {
              begin: seq * delays,
              dur: durations,
              from: data.x - 10,
              to: data.x,
              easing: 'easeOutQuart'
            },
            x2: {
              begin: seq * delays,
              dur: durations,
              from: data.x - 10,
              to: data.x,
              easing: 'easeOutQuart'
            },
            opacity: {
              begin: seq * delays,
              dur: durations,
              from: 0,
              to: 1,
              easing: 'easeOutQuart'
            }
          });
        } else if(data.type === 'grid') {
          // Using data.axis we get x or y which we can use to construct our animation definition objects
          let pos1Animation = {
            begin: seq * delays,
            dur: durations,
            from: data[data.axis.units.pos + '1'] - 30,
            to: data[data.axis.units.pos + '1'],
            easing: 'easeOutQuart'
          };
    
          let pos2Animation = {
            begin: seq * delays,
            dur: durations,
            from: data[data.axis.units.pos + '2'] - 100,
            to: data[data.axis.units.pos + '2'],
            easing: 'easeOutQuart'
          };
    
          let animations = {};
          animations[data.axis.units.pos + '1'] = pos1Animation;
          animations[data.axis.units.pos + '2'] = pos2Animation;
          animations['opacity'] = {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'easeOutQuart'
          };
    
          data.element.animate(animations);
        }
      });
    
      // For the sake of the example we update the chart every time it's created with a delay of 10 seconds
      chart.on('created', function() {
        if(window.__exampleAnimateTimeout) {
          clearTimeout(window.__exampleAnimateTimeout);
          window.__exampleAnimateTimeout = null;
        }
      });


      let ulCom = document.querySelector('.comments ul');
      for (let i = 0; i < comments.length; i++) {
        let litem = document.createElement('li');
        let date = document.createElement('div');
        date.classList.add('date-comment');
        date.textContent = comments[i].date.substring(0, 10) + ' ' + comments[i].date.substring(11, 16);
        litem.appendChild(date);
        let d = document.createElement('a');
        d.classList.add('name-of-comment');
        if (id) {
          d.href = '/profile/' + comments[i].id;
        }
        d.classList.add('name');
        d.textContent = comments[i].first_name + ' ' + comments[i].last_name;
        litem.appendChild(d);
        d = document.createElement('div');
        d.classList.add('comment-text');
        d.textContent = comments[i].text;
        litem.appendChild(d);
        

        let del = document.createElement('button');
        del.textContent = 'Удалить';
        del.classList.add('delete');
        del.addEventListener('click', () => {
          window.location.replace('/deletecomment/' + comments[i].id + '/' + id_proj + '/' + comments[i].id);
        });
        litem.appendChild(del);
        ulCom.appendChild(litem);

        if (id == 1) {
          $('.delete').css('display', 'block');
        }

      }


      if (project.status == 100) {
        $('.add-metrics').css('display', 'none');
      }
};

