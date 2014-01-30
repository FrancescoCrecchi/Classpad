
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var connect_mongo = require('connect-mongo')(express);
var passport = require('passport');
var fs = require('fs');

var app = express();
var database = require('./db.js')();
var httpServer = http.createServer(app);

// added to implement data-sessions
var sessionconf = {
db: {
  db: 'classPadDB',
  host: '127.0.0.1',
  port: '27017',
  username: '',
  password: '',
  collection: 'sessions'
  }
,secret: 'u47r4ms2im2sm4r74u'
};
var sessionStore = new connect_mongo(sessionconf.db);
var cookieParser = express.cookieParser(sessionconf.secret);


// ------------------LOGIN MIDDLEWARE--------------------------------
  var midLogin = function(req,res,next){
    //check if the user's credentials are saved in a cookie
    //console.log(req.session);
    if (req.path != "/login" && req.session.passport.user == undefined)
      res.render('login');
    else
      next();
  };
//------------------------------------------------------------------
  
app.configure(function() { 
  // all environments
  //setLocalStrategy
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.locals.pretty=true;
  //use
  app.use(express.favicon());
  app.use(express.static(path.join(__dirname, 'public')));
  // ---------------------------------------------------------------------------
  app.use(cookieParser);
  app.use(express.bodyParser());
  app.use(express.session({secret:sessionconf.secret, store:sessionStore}));
  app.use(passport.initialize());
  app.use(passport.session());
  //Routing
  app.use(app.router); //try to match a req with a route
//   app.use(redirectUnmatched); //redirect if nothing else sent a response
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// //function redirect unmatched
// function redirectUnmatched(req,res){
//   res.redirect('/');
// }

//Connecting to mongodb
//configuration which needs database, we do it last
database.connect('mongodb://localhost/classPadDB',function() {
    var auth = require('./auth.js').start(app,database.User);
    var routes = require('./routes.js')(auth,database);
    var sockets = require('./sockets.js')(database,httpServer,sessionStore,cookieParser);
    
    //ROUTES
    
    /* testEvents path
    app.get("/testEvents",function(req,res){
      res.render('testEvents');
    });
    app.get("/testWOG",function(req,res){
      res.render('testWOG');
    });
	*/

    //Home Page
    app.get("/", routes.listPublicClasses);
    //Login Page
    app.get("/login", function(req,res){
      if(req.session.passport.user)
						res.redirect('/myclasses');
      else
						res.render('login');
    });
    //Class
    app.get("/class/:id", function(req,res){
      database.Classes.findById(req.params.id,function(err,obj){
        if(err)
            res.send(500,"Internal server error: " + err);
        else if(!obj)
            res.send(404,"couldn't find your class! - #0");
        else{
            if(req.user && req.user.username == obj.author)
                res.render('master',{"id":req.params.id, "title": obj.title});
            else
                res.render('slave',{"id":req.params.id, "title": obj.title});
        }
      });
    });
    //Master
    app.get("/master", midLogin, function(req,res){
      res.render('master');
    });
    //Slave
    app.get("/slave", function(req,res){
      res.render('slave');
    });
    //Create User
    app.get("/register",function(req,res){
      res.render('registration');
    });
    app.post("/register",routes.createUser);
    //MyClasses
    app.get("/myclasses", midLogin, routes.listClasses);
    //Create class
    app.get("/create_class", midLogin, function(req,res){
      res.render('create_class');
    });
    app.post("/create_class", routes.createClass);
    //Logout
    app.get("/logout",function(req,res){
      req.logout();
      res.redirect('/');
    });
    //Delete selected classes
    app.post("/deleteSelected", routes.deleteClasses);
    //Change the visibility of the class
    app.post("/changeVisibility", routes.changeVisibility);
    //Render Pdf
    app.post("/exportAsPdf",routes.exportAsPdf);
    //Download Pdf
    app.get("/:file(*)",function(req,res){
      var file = req.params.file;
      res.download(file, function(){
      });
    });          
    
    //Starting server
    httpServer.listen(app.get('port'));
});
