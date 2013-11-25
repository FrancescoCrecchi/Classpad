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
  //broadcast the sync adv
  socket.on('hello',function(id){
    console.log("DEBUG MESSAGE: -> HELLO MESSAGE RECEIVED!");
    socket.join(id); //joining a room
    var findClass = function(callback){
      database.Classes.findById(id,function(err,obj){
      if(err)
	socket.emit('ERROR',err);
      else if(!obj)
	socket.emit('ERROR',"Not found!");
      else
	callback(obj);
    })};
      
//    findClass(function(classe){
//       socket.on('sync', function(data){
// 	console.log("DEBUG MESSAGE: -> SYNC MESSAGE RECEIVED!");
	findClass(function(clss){
	  socket.on('sync', function(data){
	  //saving data
	  clss.pad.Pages.set(data.n, {pathsDrawed: data.PgArray});
	  clss.pad.currPg = data.n;
	  clss.save(function(err,obj){
	    if(err)
	      socket.emit('ERROR',err);
	    else if(!obj)
	      socket.emit('ERROR',"Not found!");
	    else
	    {   
	      socket.broadcast.to(id).emit('mDraw',{'data': data,'id':id}); //data = array di primitive grafiche del mCanvas
	      console.log("MDRAW MESSAGE SENT IN BROADCAST!"); 
	    }
	  });
	});
//       });
      //sync number of pages
//       socket.on('changePage', function(n){
// 	console.log("DEBUG MESSAGE: -> ADDPAGE MESSAGE RECEIVED!");
// 	findClass(function(clss){
// 	  //saving data
// 	  clss.pad.currPg = n;
// 	  clss.save(function(err,obj){
// 	    if(err)
// 	      socket.emit('ERROR',err);
// 	    else if(!obj)
// 	      socket.emit('ERROR',"Not found!");
// 	  });
// 	});
//       });
      socket.emit('HELLO',clss.pad);
      });
//       socket.on('fwd', function(n){
// 	findClass(function(clss){
// 	  //saving data
// 	  clss.pad.n = n;
// 	  clss.save(function(err,obj){
// 	    if(err)
// 	      socket.emit('ERROR',err);
// 	    else if(!obj)
// 	      socket.emit('ERROR',"Not found!");
// 	    else
// 	    {
// 	      socket.broadcast.emit('+',n); //data = array di primitive grafiche del mCanvas
// 	      console.log("+ MESSAGE SENT IN BROADCAST!");
// 	    }
// 	  });
// 	});
// 	//saving master's paths
// 	session.class.pad
// // 	console.log("DEBUG MESSAGE: -> FWD MESSAGE RECEIVED!");
// // 	socket.emit('FWD',n); //data = array di primitive grafiche del mCanvas
// // 	console.log("FWD MESSAGE SENT TO HIMSELF!");
//       });
//       socket.on('rwd', function(n){
// 	console.log("DEBUG MESSAGE: -> RWD MESSAGE RECEIVED!");
// 	socket.emit('RWD',n); //data = array di primitive grafiche del mCanvas
// 	console.log("RWD MESSAGE SENT TO HIMSELF!");
//       });
      /////////////////////////////////
    });
  });
}