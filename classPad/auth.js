var LocalStrategy = require('passport-local').Strategy;

var AuthModule = function (express,User) {
  var self = this;
  self.passport = require('passport');
  self.local = new LocalStrategy(
    function(username, password, done) {
      console.log('Authentication using local strategy');
      console.log(username);
      console.log(password);
      User.findOne({'username':username, 'password':password},function(err,user) {
      if(err)
      {
	console.log("auth err");
	done(err);
      }
      if(!user)
	{
	  console.log("auth err");
	  return done(null, false, { message: 'Incorrect username.' });
	}
      console.log("auth OKAY " + user);
      return done(null,user);
    });
  });
  
  self.passport.use(self.local);
  
  //In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
  self.passport.serializeUser(function(user,done) {
    console.log('serialized user into session: ' + user )
    done(null,user._id);
  });
  self.passport.deserializeUser(function(uid,done) {
    console.log('deserialized user into session: ' + uid );
    User.findById(uid,done);
  });
  
  //telling express to use passport
  express.configure(function() {
    //getting values from form
    express.post('/login',function(req,res,next) {
	console.log(req.body);
	console.log("======= REDIRECT TO MYCLASSES =========");
        self.passport.authenticate('local',{
          successRedirect: '/myclasses',
          failureRedirect: '/' //redirect to login
        })(req,res,next);
    });
  });
};

module.exports.start = function (express,User) {return new AuthModule(express,User);}