console.log('Game Server is running...');

var publicIp = require('public-ip');
var path = require('path');
var port = 4000;
var highscores = [];

var express = require('express');
var session = require('express-session');
var body_parser = require('body-parser');
var app = express();

app.use(session({
  secret: 'Much Secret',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}))

app.use(body_parser.urlencoded({
  extended: true
}));

app.use(body_parser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://'+(require('my-local-ip')())+':'+port+'/');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(express.static(path.join(__dirname, '../../p5Projects/SnakeGame/')));

app.get('/getSession', (req, res) => {
  // console.log('GET');
  res.setHeader('content-type','application/json');
  req.session.greeting = 'This is your session variable!';
  if (req.session.refreshCounter) {
  	req.session.refreshCounter++;
  } else {
   	req.session.refreshCounter = 1;
  }
  req.session.highscores = highscores;
  req.session.sessionInfo = 'You have refreshed your session ' + req.session.refreshCounter + ' times!';
  res.send(req.session);
  res.end();
})

app.post('/postToSession', (req, res) => {
  console.log('POST');
  if (req.body.highscore) {
    if (highscores.every((score) => { return score < req.body.highscore })) {
      if (highscores.length < 3) {
        highscores.push(req.body.highscore);
        console.log('Added a high score of : '+req.body.highscore);
      } else {
        highscores[highscores.indexOf(Math.min(...highscores))] = req.body.highscore;
        console.log('Added a high score of : '+req.body.highscore);
      }
    }
    highscores = highscores.sort((score1, score2) => { return score2 - score1; });
    req.session.highscores = highscores;
    res.send(req.session);
  }
  res.end();
});

app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port '+port+'...');
  publicIp.v4().then(ip => console.log('Public Address: '+'http://'+ip+':'+port));
  console.log('Local Address: '+'http://'+require('my-local-ip')()+':'+port);
})
