function setCookie(name, value, options) {
  options = options || {};

  let expires = options.expires;

  if (typeof expires == "number" && expires) {
    let d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  let updatedCookie = name + "=" + value;

  for (let propName in options) {
    updatedCookie += "; " + propName;
    let propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteCookie(name) {
  setCookie(name, "", {
    expires: -1
  })
}

$(document).ready(function() {
  deleteCookie('id');
  $('#login_btn').on('click', function(e) {
    e.preventDefault();
    if ($('#inputEmail').val() == '') {
      alert('Uncorrect email');
    } else if ($('#inputPassword').val() == '') {
      alert('Введите пороль');
    }
    else {
      data = {
        email:$('#inputEmail').val(),
        password:$('#inputPassword').val()
      };

      $.ajax({
        type: 'POST',
        data: data,
        url: '/login',
        dataType: 'json',
        success: function(data) {
          if (data.status === 'ok') {
            document.cookie = 'id=' + data.id + ';path=/;';
            window.location.replace('/');
          } else if (data.status == 'uncorrect_password') {
            $('.mb-4').attr('src', '/images/sticker.png');
            $('#password').css('border', '1px solid red');
            alert('Неправильный пороль');
          } else {
            $('.mb-4').attr('src', '/images/sticker.png');
            $('#inputEmail').css('border', '1px solid red');
            alert('Такого логина в нашей базе данных нет');
          }
        }
      });
    }
  });

});