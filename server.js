var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(process.env.PORT ? parseInt(process.env.PORT, 10) : 8080, function () {
  console.log('Example app listening on port 8080!');
});
