var express = require('express');
var multer  = require('multer');
var path = require('path');
const http = require('http');
const url = require('url');


const app = express();
var expressWs = require('express-ws')(app);

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
  //console.log(req, res, next);
  res.send('');
  // req.file is the `upload` file
  // req.body will hold the text fields, if there were any

  console.log(req.file);
  var dest = 'uploads/' + req.file.filename;
  
  var listeners = expressWs.getWss('/socket');
  console.log("HEY!", listeners.clients);
  listeners.clients.forEach(function each(client) {
    client.send(JSON.stringify({file: dest}));
  });
});


app.listen(8888, function () {
  console.log('Example app listening on port 8888!');
});

