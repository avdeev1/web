const expect = require('chai').expect;
const should = require('should');
const supertest = require('supertest')

const $ = require('jquery');

const encodePassword = require('./app/routes/encodePassword')
const updateMetrics = require('./app/routes/updateMetrics');


describe('Тест хэш-функции', function() {

  it('Пароль - Admin12345, должно вернуть 145983609341153', function() {
    const res = encodePassword('Admin12345');
    expect(res).equal(145983609341153);
  });

  it('Пароль - Bdfy131198, должно вернуть 154450040390946', function() {
    const res = encodePassword('Bdfy131198');
    expect(res).equal(154450040390946);
  });

  it('Пароль - пустая строка, вывод - 0', function() {
    const res = encodePassword('');
    expect(res).equal(0);
  });
  
});

describe('Тест обновления метрик', function() {
  it('Максимальное значение - 10, минимальное - 5. Должно вернуть 50', function*() {
    expect(updateMetrics(10, 5).equal(50));
  });

  it('Максимальное значение - 55, минимальное - 15. Должно вернуть 73', function*() {
    expect(updateMetrics(55, 15).equal(73));
  });

  it('Максимальное значение - 50, минимальное - 47. Должно вернуть 6', function*() {
    expect(updateMetrics(50, 47).equal(6));
  });
});

describe('Тест подключения', function() {

  it('Проверка статуса главной страницы', function(done){
    supertest('http://localhost:8080')
        .get('/')
        .expect(200)
        .end(function(err, res){
            res.status.should.equal(200);
            done();
        });

  });

  it('Проверка подключения к бд', function(done){
    this.timeout(5000);
    supertest('http://localhost:8080')
        .get('/current_projects_list')
        .expect(200)
        .end(function(err, res){
            res.status.should.equal(200);
            done();
        });
  });

  it('Всего в базе 3 проекта', function(done){
    this.timeout(5000);
    supertest('http://localhost:8080')
        .get('/current_projects_list')
        .expect(200)
        .end(function(err, res){
          res.body.length.should.equal(3);
          res.status.should.equal(200);
          done();
        });
  });
});

describe('Тестирование авторизации', function() {

  it('Ввод верного логина и пароля', function(done) {
    supertest('http://localhost:8080')
        .post('/login')
        .type('form')
        .send({email: 'admin@spbu.ru', password: 'Admin12345'})
        .end(function(err, res) {
            res.body.should.have.property('status');
            res.body.should.have.property('status').eql('ok');            
            res.status.should.equal(200);
            done();
        });
  });

  it('Просмотр профиля', function(done) {
    supertest('http://localhost:8080')
        .post('/login')
        .type('form')
        .send({email: 'admin@spbu.ru', password: 'Admin12345'})
        .end(function(err, res) {
          // console.log(res.body);
          supertest('http://localhost:8080').get('/info/' + res.body.id).expect(200).end(function(error, result) {
              // console.log(result.body);
              res.status.should.equal(200);
              res.body.id.should.equal(result.body.usid);  
              done();
            });
        });
  });

  it('Ввод неверного логина', function(done) {
    supertest('http://localhost:8080')
        .post('/login')
        .type('form')
        .send({email: 'aadmin@spbu.ru', password: 'Admin12345'})
        .end(function(err, res) {
            res.body.should.have.property('status');
            res.body.should.have.property('status').eql('uncorrect_email');            
            res.status.should.equal(200);
            done();
        });
  });

  it('Ввод неверного пароля', function(done) {
    supertest('http://localhost:8080')
        .post('/login')
        .type('form')
        .send({email: 'admin@spbu.ru', password: 'Admin112345'})
        .end(function(err, res) {
            res.body.should.have.property('status');
            res.body.should.have.property('status').eql('uncorrect_password');            
            res.status.should.equal(200);
            done();
        });
  });
});

describe('Тест регистрации', function() {
  it('Ввод занятого логина', function(done) {
    supertest('http://localhost:8080')
        .post('/registrationuser')
        .type('form')
        .send({name: 'Oleg', lastname: 'Ivanov', email: 'oleggood@spbu.ru', password: 'oleg', secondpassword: 'oleg'})
        .end(function(err, res) {       
            // console.log(res.headers.location);    
            res.headers.location.should.equal('/registration/ue');
            done();
        });
  });

  it('Ввод разных паролей', function(done) {
    supertest('http://localhost:8080')
        .post('/registrationuser')
        .type('form')
        .send({name: 'Oleg', lastname: 'Ivanov', email: 'oleggood@spbu.ru', password: 'oleg', secondpassword: 'oleg1'})
        .end(function(err, res) {       
            // console.log(res.headers.location);    
            res.headers.location.should.equal('/registration/up');
            done();
        });
  });
});


describe('Вакансии', function() {
  it('Число вакансия для первого проекта = 2', function(done) {
    supertest('http://localhost:8080')
      .get('/jobs/1')
      .end(function(err, res) {
        res.body.length.should.equal(2);
        res.status.should.equal(200);
        done();
      });
  });
    it('Число вакансия для второго проекта = 3', function(done) {
      supertest('http://localhost:8080')
        .get('/jobs/2')
        .end(function(err, res) {
          res.body.length.should.equal(3);
          res.status.should.equal(200);
          done();
        });
    });

  it('Запись занятого человека', function(done) {
    supertest('http://localhost:8080')
      .post('/join')
      .type('form')
      .send({projId: '1', userId: '2', job: '1'})
      .end(function(err, res) {
        res.headers.location.should.equal('/');
        done();
      });
  });

  it('Запись еще одного занятого человека', function(done) {
    supertest('http://localhost:8080')
      .post('/join')
      .type('form')
      .send({projId: '1', userId: '3', job: '2'})
      .end(function(err, res) {
        res.headers.location.should.equal('/');
        done();
      });
  });

  it('Запись еще одного занятого человека', function(done) {
    supertest('http://localhost:8080')
      .post('/join')
      .type('form')
      .send({projId: '3', userId: '4', job: '6'})
      .end(function(err, res) {
        res.headers.location.should.equal('/');
        done();
      });
  });

  it('Запись на занятую должность', function(done) {
    supertest('http://localhost:8080')
      .post('/join')
      .type('form')
      .send({projId: '1', userId: '6', job: '1'})
      .end(function(err, res) {
        res.headers.location.should.equal('/');
        done();
      });
  });
});

describe('Проверка недоступности кнопок для неавторизованных юзеров', function() {
  var sw = require('selenium-webdriver');
  it('Кнопка добавления проектов недоступна', function() {
    var driver = new sw.Builder()
    .withCapabilities(sw.Capabilities.chrome())
    .build()
    var chai = require('chai');
    var chaiWebdriver = require('chai-webdriver');
    chai.use(chaiWebdriver(driver));
    driver.get('http://localhost:8080');
    chai.expect('.add-project-div').dom.to.have.style('display', 'none');
  });

  it('Кнопка добавления метрик недоступна', function() {
    for (let i = 1; i <= 3; i++) {

      var driver = new sw.Builder()
      .withCapabilities(sw.Capabilities.chrome())
      .build()

      var chai = require('chai');
      var chaiWebdriver = require('chai-webdriver');
      chai.use(chaiWebdriver(driver));
      driver.get('http://localhost:8080/about/' + i);
      chai.expect('.add-metrics').dom.to.have.style('display', 'none');
    }
  });

  it('Кнопка добавления комментариев недоступна', function() {
    for (let i = 1; i <= 3; i++) {

      var driver = new sw.Builder()
      .withCapabilities(sw.Capabilities.chrome())
      .build()
      
      var chai = require('chai');
      var chaiWebdriver = require('chai-webdriver');
      chai.use(chaiWebdriver(driver));
      driver.get('http://localhost:8080/about/' + i);
      chai.expect('.create-comment').dom.to.have.style('display', 'none');
    }
  });

  it('Кнопка подачи заявки на проект недоступна', function() {
    for (let i = 1; i <= 3; i++) {
      
      var driver = new sw.Builder()
      .withCapabilities(sw.Capabilities.chrome())
      .build()
      
      var chai = require('chai');
      var chaiWebdriver = require('chai-webdriver');
      chai.use(chaiWebdriver(driver));
      driver.get('http://localhost:8080/about/' + i);
      // chai.expect('.join-to-project').dom.not.to.have.htmlClass('valid-button');
      chai.expect('.join-to-project').dom.have.attribute('disabled', 'true');
    }
  });

  
});

