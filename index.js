var express = require('express');
var multer  = require('multer');
var path = require('path');
const http = require('http');
const url = require('url');

require('dotenv').config()

const app = express();
var expressWs = require('express-ws')(app);

var apiKey = process.env.API_KEY;

app.use(express.static('public'));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
})

var upload = multer({ storage: storage });

app.ws('/socket', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log('socket', req.testing);
});

app.post('/upload', upload.single('upload'), function (req, res, next) {
  console.log(req.body);
  if ( ! req.body.api_key || req.body.api_key !== apiKey ) {
    res.send('bad api key!');
  }
  else {
    res.send('');

    console.log(req.file);
    var dest = 'uploads/' + req.file.filename;
  
    var listeners = expressWs.getWss('/socket');
    listeners.clients.forEach(function each(client) {
      client.send(JSON.stringify({file: dest}));
    });
  }
});


app.listen(8888, function () {
  console.log('Example app listening on port 8888!');
});

