let dom = document.location.pathname.substring(document.location.pathname.lastIndexOf('/') + 1);


$(document).ready(function() {
  if (dom == 'ue') {
    $('.mb-4').attr('src', '/images/sticker.png');
    $('#inputEmail').css('border', '1px solid red');
    alert('Такой email уже занят!');
  }

  if (dom == 'up') {
    $('.mb-4').attr('src', '/images/sticker.png');
    $('#password').css('border', '1px solid red');
    $('#inputPassword').css('border', '1px solid red');
    alert('Пароли не совпадают!');
  }
});