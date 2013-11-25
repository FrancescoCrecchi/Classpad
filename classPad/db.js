var DB = function(){
  var self = this;
  self.mongoose = require('mongoose');
  self.db = self.mongoose.connection;
  self.db.on('error',console.error.bind(console,'connection error'));
  self.db.once('open',function() {
    //login table
    self.userSchema = self.mongoose.Schema({
      username:String,
      password:String
    });
    //classes
    self.classesSchema = self.mongoose.Schema({
      author: String,//self.mongoose.Schema.Types.ObjectId,
      title: String,
      date: Date,
      visibility: String, //"private" vs "public"
      pad: {
	Pages:[{
	  //paths
	  pathsDrawed: [ String ],
	  }],
	currPg: {type:Number,default:0}
      }
    });
  //defining interface  
  self.User = self.mongoose.model('User',self.userSchema);
  self.Classes = self.mongoose.model('Classes',self.classesSchema);
  
  if(self.onConnect)
    return self.onConnect();
  });
}

DB.prototype = {
  connect:function(dbstring,callback) {
    var self = this;
    self.onConnect = callback;
    var res = self.mongoose.connect(dbstring);
  }
}

module.exports = function() {return new DB()}