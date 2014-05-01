
/**
 * Module dependencies.
 */

var express = require('express');
//var express2 = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');

var app = express();
//var app2 = express();

var options = {
    key: fs.readFileSync(__dirname + '/crypt/tas.key'),
    cert: fs.readFileSync(__dirname + '/crypt/tas.crt')
};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + '3000');
});


https.createServer(options, app).listen(3003, function(){
  console.log('Express secure server listening on port ' + '3003');
});

