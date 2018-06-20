var express = require('express');
var path = require('path');
var request = require('request')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var users = require('./routes/players');

var app = express();

request.post("http://naming-service:4000/register?name=cartola-data-processor&host=http://processor:3000")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/players', users);

module.exports = app;
