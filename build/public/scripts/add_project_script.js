$.ajax({
  type: 'get',
  url: '/getlist',
  success: function(data) {
    getInfo(data);
  }
});

let getInfo = function(data) {
  let ul = document.querySelector('.list-of-waiters');
  for (let i = 0; i < data.length; i++) {
    let litem = document.createElement('li');
    let link = document.createElement('a');
    link.textContent = data[i].title;
    link.href = '/about/' + data[i].idProject;
    link.style.display = 'inline-block';
    litem.appendChild(link);
    let ulink = document.createElement('a');
    ulink.textContent = data[i].first_name + ' ' + data[i].last_name;
    ulink.href = '/profile/' + data[i].userId;
    ulink.style.display = 'inline-block';
    litem.appendChild(ulink);
    let jobName = document.createElement('div');
    jobName.textContent = data[i].name;
    jobName.style.display = 'inline-block';
    litem.appendChild(jobName);

    let submit = document.createElement('button');
    submit.textContent = 'Принять';
    submit.id = data[i].userId;
    submit.addEventListener('click', () => {
      let send = {idProject: data[i].idProject, idUser: data[i].userId, jobId: data[i].jobId };
      window.location.replace('/addstudent/' + send.idUser + '/' + send.jobId);
    });
    litem.appendChild(submit);

    let unsubmit = document.createElement('button');
    unsubmit.addEventListener('click', () => {
      let send = {idProject: data[i].idProject, idUser: data[i].userId, jobId: data[i].jobId };
      window.location.replace('/dropstudent/' + send.idUser + '/' + send.jobId);
    });
    
    unsubmit.textContent = 'Отказать';
    unsubmit.id = data[i].userId;

    litem.appendChild(unsubmit);

    ul.appendChild(litem);
  }
}


$(document).ready(function() {
  $('#add-project').on('click', function() {
    $('.add-project-form').css('display', 'block');
  });


  $('.admin-monitor').on('click', function() {
    $('.list-of-waiters').css('display', 'block');
  });
});






