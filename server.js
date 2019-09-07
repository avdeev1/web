const express = require('express');
const app = express();
const port = '4200';
const fs = require('fs');
const dbconfig = require('./config/database.js');
const mysql = require('mysql');
 
const bodyParser = require('body-parser');

let connection = mysql.createConnection({
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database
});

connection.connect(function(error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log('success');
  }
});

app.use(bodyParser.urlencoded({ extended: true, }));

require('./app/routes')(app,connection);

app.listen(port, () => {
  console.log('start port ' + port);
});


app.use(express.static(__dirname + '/build/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/build/projects_list.html');
});

app.get('/about/:id', (req, res) => {
    res.sendFile(__dirname + '/build/about_project.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/build/login_page.html')
});

app.get('/logout', (req, res) => {
  res.clearCookie("id");
  res.sendFile(__dirname + '/build/login_page.html')
}); 

app.get('/registration', (req, res) => {
  res.sendFile(__dirname + '/build/registration.html');
});

app.get('/registration/ue', (req, res) => {
  res.sendFile(__dirname + '/build/registration.html');
});

app.get('/registration/up', (req, res) => {
  res.sendFile(__dirname + '/build/registration.html');
});

app.get('/reg/:id', (req, res) => {
  res.sendFile(__dirname + '/build/projects_list.html');
});

app.get('/profile/:id', (req, res) => {
  res.sendFile(__dirname + '/build/profile.html');
});
