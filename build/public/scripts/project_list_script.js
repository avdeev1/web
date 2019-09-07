let projects;
let tags_for_bar = [];

let count = 0;

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

let id_us = document.location.pathname.substring(document.location.pathname.lastIndexOf('/') + 1);
if (id_us) {
  document.cookie = 'id=' + id_us  + ';path=/;';
  $('#profile').attr('href', '/profile/' + id_us);
  $('.registration-div').css('display', 'none');
  $('.profile-div').css('display', 'block');
} else {
  let id = getCookie('id');
  if (id) {
    $('.registration-div').css('display', 'none');
    $('.profile-div').css('display', 'block');
  } else {
    $('.registration-div').css('display', 'block');
    $('.profile-div').css('display', 'none');
  }

  if (id == 1) {
    $('.add-project-div').css('display', 'block');
    $('.admin-monitor').css('display', 'block');
  }

  $('#profile').attr('href', '/profile/' + id);
}


$(document).ready(function() {
    $.ajax({
    type: 'GET',
    url: '/current_projects_list',
    dataType: "json",
    success: function(data) {
      projects = data;
      preloader();
      createTags(data);
      create(data);
    }
  });
});

let createTags = function(projects) {
  let reset = document.querySelector('.reset');
  reset.onclick = Reset;
  for (let i = 0; i < projects.length; i++) {
    let tags = projects[i].tags.split(' ');
    for (let j = 0; j < projects[i].tags.length; j++) {
      let element = tags[j];
      if (element != null) {
        let new_el = element.replace('-', ' ');
        tags_for_bar.push(new_el);
      }
    }
  }


  tags_for_bar = new Set(tags_for_bar);
  tags_for_bar = Array.from(tags_for_bar);


  let ulist = document.querySelector('.type-of-tags .first-type-of-tags');
  for (let i = 0; i < tags_for_bar.length; i++) {
    let lItem = document.createElement('li');
    let liBtn = document.createElement('button');
    liBtn.textContent = tags_for_bar[i];
    liBtn.onclick = tags_listener;
    lItem.appendChild(liBtn);
    ulist.appendChild(lItem);
  }
};

function preloader() {
  setInterval(() => {
    let p = $('.preloader');
    p.css('opacity', 0);

    setInterval(() => 
      p.remove(),
      parseInt(p.css('--duration')) * 1000
    );

  }, 500);
}

let create = function(data) {
  let boxList = document.querySelector('.list-of-projects');
  for (let i = 0; i < data.length; i++) {
    let boxItem = createBox(data[i]);
    boxList.appendChild(boxItem);
  }
}

let makeElement = function(tagName, className, text) {
  let element = document.createElement(tagName);
  element.classList.add(className);

  if (text) {
    element.textContent = text;
  }
  return element;
};

let createBox = function(project) {

  let listItem = makeElement('li', 'project-box');
  let title_box = makeElement('div', 'title-box', project.name);
  let title = makeElement('div', 'title');
  title.appendChild(title_box);
  listItem.appendChild(title);

  let btn = document.createElement('div');
  let on_project_link = makeElement('a', 'on-project-page', 'На страницу проекта');
  on_project_link.id = project.id;
  on_project_link.setAttribute('href', '/about/' + on_project_link.id);

  btn.appendChild(on_project_link);
  listItem.appendChild(btn);

  let foo = document.createElement('div');
  foo.classList.add('foo');
  foo.textContent = project.status + '%';

  let st_bar = document.createElement('div');
  st_bar.classList.add('status-bar');
  st_bar.style.width = foo.textContent;

  foo.appendChild(st_bar);
  listItem.appendChild(foo);

  let desc = makeElement('div', 'short-description', project.shortDescription);
  listItem.appendChild(desc);

  let divTags = document.createElement('div');
  divTags.classList.add('tags');

  let tags = document.createElement('ul');
  tags.classList.add('topmenu-tags');

  let tags_for_box = project.tags.split(' ');

  for (let i = 0; i < project.tags.length; i++) {
    let tags_top = document.createElement('li');
    if (tags_for_box[i] != null) {
      let new_tag = tags_for_box[i].replace('-', ' ');
      tags_top.textContent = new_tag;
      tags.appendChild(tags_top);
    }
  }


  divTags.appendChild(tags);
  listItem.appendChild(divTags);

  return listItem;
};

let tags_listener = function() {
    if (count < 3) {
      let reset = document.querySelector('.reset');
      reset.style.display = 'block';

      count++;

      document.querySelectorAll('.project-box').forEach(box => {
        let tags = box.querySelectorAll('.topmenu-tags li');
        let flag = false;
        tags.forEach(tag => {
          if (tag.textContent.toLowerCase() == this.textContent.toLowerCase()) {
            flag = true;
            count_projects++;
          } 
        });
        if (flag == false) {
          box.style.display = 'none';
        }
      });

      let hidden_count = 0;
      document.querySelectorAll('.project-box').forEach(box => {
        if (box.style.display == 'none') {
          hidden_count++;
        }
      });
      if (hidden_count == projects.length) {
          document.querySelector('.message').style.display = 'block';
        }
      hidden_count = 0;
      
      let ull = document.querySelector('.selected-tags');
      let tag = document.createElement('div');
      tag.textContent = this.textContent;
      tag.style.backgroundColor = window.getComputedStyle( this , null).getPropertyValue('background-color');
      tag.classList.add('pressed');
      ull.appendChild(tag);
      this.disabled = true;

    } else {
      alert('Максимум 3 тега!!!')
    }
}


let array_tags = [];

let Reset = function() {
  document.querySelectorAll('.project-box').forEach(element => {
    array_tags.push(element);
  });
  count = 0;
  this.style.display = 'none';
  document.querySelectorAll('.type-of-tags button').forEach(elem => {
    elem.disabled = false;
  });

  document.querySelectorAll('.project-box').forEach(elem => {
    elem.style.display = 'block';
  });
  
  document.querySelector('.message').style.display = 'none';

  document.querySelectorAll('.selected-tags div').forEach(element => {

    element.parentNode.removeChild(element);
  });
};
