var express = require('express');
var app = express();

var URL = require('./url');
var marked = require('marked');
var fs = require('fs');

var mongoose = require('mongoose');
var mongoURI = process.env.MONGO_URI || 'mongodb://localhost/urlshortener';
mongoose.connect(mongoURI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.set("trust proxy", true);

app.get('/', function (req, res) {
  var readme = fs.readFileSync(__dirname + "/README.md", "utf8");
  res.send(marked(readme));
});

app.get(/^\/new\/(.*)$/, function (req, res) {
  var raw = URL.validate(req.params[0]);
  if (raw === false) {
    res.status(400).json({error: "URL invalid"});
    return;
  }
  function sendResult (result) {
    res.json({raw: result.raw, shortened: "https://" + req.hostname + "/" + result.shortCode});
  }
  URL.findRaw(raw, function (err, dup) {
    if (err) {
      console.error("Error:", err);
      res.status(500).send(err);
      return;
    }
    if (dup !== null) {
      sendResult(dup);
    } else {
      URL.genCode(function (err, shortCode) {
        if (err) {
          console.error("Error:", err);
          res.status(500).send(err);
          return;
        }
        var newURL = new URL({raw: raw, shortCode: shortCode});
        newURL.save(function (err, newURL) {
          if (err) {
            console.error("Error:", err);
            res.status(500).send(err);
            return;
          }
          sendResult(newURL);
        });
      });
    }
  });
});

app.get('/:shortCode', function (req, res) {
  var shortCode = req.params.shortCode;
  URL.findCode(shortCode, function (err, url) {
    if (err) {
      console.error("Error:", err);
      res.status(500).send(err);
      return;
    }
    if (url !== null) {
      res.redirect(301, url.raw);
    } else {
      res.status(404).send("No such short URL exists");
    }
  });
});

db.once('open', function () {
  app.listen(parseInt(process.env.PORT, 10) || 8080, function () {
    console.log('Example app listening on port 8080!');
  });
});
