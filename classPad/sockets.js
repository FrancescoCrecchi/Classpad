var session_socketio = require('session.socket.io');

module.exports = function(database,httpServer,sessionStore,cookieParser){
  var io = require('socket.io').listen(httpServer, function() {
	    console.log("Express server listening on port " + app.get('port'));
    });
  
  var sessionSockets = new session_socketio(io,sessionStore,cookieParser);
  
  //A user connects to the server (opens a socket)
  sessionSockets.on('connection', function(err,socket,session) {
    if(err)
    {
      console.log('error');
      console.log(err);
      return;
    }
    console.log("===================================================");
    console.log(socket);
    console.log("===================================================");

    //broadcast the sync adv
    socket.on('hello',function(id){
      console.log("DEBUG MESSAGE: -> HELLO MESSAGE RECEIVED!");
      socket.join(id); //joining a room
      
      // Defining findclass function!
      var findClass = function(callback){
        database.Classes.findById(id,function(err,obj){
        if(err)
        	socket.emit('ERROR',err);
        else if(!obj)
        	socket.emit('ERROR',"Not found!");
        else
        	callback(obj);
        });
      }
      
      //calling findclass function!
  	  findClass(function(clss){
    	  socket.on('sync', function(data){
          console.log("===================================================");
          console.log("SYNC MESSAGE RECEIVED:");
          console.log(data);
          console.log("===================================================");
          //saving data
      	  clss.pad.Pages.set(data.cPg,{pathsDrawed: data.PgArray});
      	  clss.pad.currPg = data.cPg;
      	  clss.save(function(err,obj){
      	    if(err)
      	      socket.emit('ERROR',err);
      	    else if(!obj)
      	      socket.emit('ERROR',"Not found!");
      	    else
      	    { 
              console.log("===================================================");
              console.log(clss);
              console.log("===================================================");
      	      socket.broadcast.to(id) .emit('mDraw',{'data': data,'id':id}); //data = array di primitive grafiche del mCanvas
      	      console.log("MDRAW MESSAGE SENT IN BROADCAST!"); 
      	    }
    	    });
    	  });
        socket.emit('HELLO',clss.pad);
      });
    });
  });
}