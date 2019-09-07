var id_us = document.location.pathname.substring(document.location.pathname.lastIndexOf('/') + 1);
var usId = parseInt(id_us);


function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}



var realId = getCookie('id');
if (realId == usId) {
  $('#editInfo').css('display', 'block');
}

$('#userId').val(realId);

$('#profile').attr('href', '/profile/' + realId);

if (!realId) {
  window.location.replace('/');
}

$(document).ready(function() {
  data = {id:usId};
  $.ajax({
    type: 'get',
    url: '/info/' + usId,
    dataType: 'json',
    success: function(data) {
      console.log(data);
      run(data);
    }
  });
});

var run = function(data) {
  $('#iname').text('Имя: ' + data.first_name);
  $('#ilname').text('Фамилия: ' + data.last_name);
  $('#iemail').text('Почта: ' + data.email);
  $('#ifac').text('Факультет: ' + data.faculty);
  if (data.faculty == null) {
    $('#ifac').text('Факультет: Не указано');
  }
  $('#icourse').text('Курс: ' + data.course);
  if (data.course == null) {
    $('#icourse').text('Курс: Не указан');
  }
  $('#iabout').text(data.about);
  if (data.status == 'joined') {
    $('#iproject').append('Участие в проекте: <a href="/about/' + data.id + '">' + data.name + '</a>')
  }
  $('.profile-box-div').css('height', $('.info-div').css('height'));

  $('.name').val(data.first_name);
  $('.lname').val(data.last_name);
  $('.fac').val(data.faculty);
  $('.course').val(data.course);
  $('.about').val(data.about);
}

$('#editInfo').on('click', function() {
  $('.edit-info').css('display', 'block');
  $('.profile-box-div').css('display', 'none');
  $('#editInfo').css('display', 'none');
});

$('.save').on('click', function() {
  window.location.replace('save/' + realId);
});


