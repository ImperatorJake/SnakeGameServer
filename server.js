console.log('Game Server is running...');

const port = 4000;
const path = require('path');
const ngrok = require('ngrok');
const localAddress = require('my-local-ip')();

const scorelimit = 3;
var highscores = [];

const express = require('express');
const session = require('express-session');
const body_parser = require('body-parser');
const app = express();

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

// this section is only required when viewing the game on locolhost:port
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://'+localAddress+':'+port+'/');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });

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
    if (req.body.highscore &&
	     (highscores.every((score) => { return score < req.body.highscore }) ||
       (highscores.length === 0))) {
      if (highscores.length < scorelimit) {
          highscores.push(req.body.highscore);
      } else {
          highscores[scorelimit-1] = req.body.highscore;
      }
      console.log('Added a Highscore of: '+req.body.highscore);
      highscores = highscores.sort((score1, score2) => { return score2 - score1; });
      req.session.highscores = highscores;
      res.send(req.session);
    } else {
      console.log('Score Rejected!');
    }
  res.end();
});

app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port '+port+'...');
  // Prints Local Address url
  console.log('Local Address: '+'http://'+localAddress+':'+port);
  // Start Tunneler, Prints Tunnel Address url
  (async () => {
    var url = await ngrok.connect(port, (err, url) => {
      if (err) {
        console.log('Something went wrong with ngrok: '+err);
      }
    });
    console.log('Tunnel Address: '+url);
  })();
});
