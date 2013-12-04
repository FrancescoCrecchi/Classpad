var routes ={};
var auth;
var database;
var PDFDocument = require('pdfkit');

//Create User (registration)
routes.createUser = function(req,res){
  console.log("============ REGISTER ============ ");
  console.log(req.body);
  if(req.body.username && req.body.password)
  {
    var newUser = new database.User({username: req.body.username, password:req.body.password});
    newUser.save(function(err,obj){
      if(err)
	res.send(500,"couldn't create new user! - #0");
      else if(!obj)
	res.send(404,"couldn't create new user! - #1");
      else
	res.redirect('/');
    });
  }
  else
    res.send(500,"couldn't create new user! - #99");
}

//Create class
routes.createClass = function(req,res){
  console.log("======== CREATE CLASS ===========");
  console.log(req.body);
  
  if(req.user && req.user.username && req.body.title && req.body.visibility)
  {
    var clss = new database.Classes(); //new instance of Classes obj schema
    
    //database.Classes
    clss.author = req.user.username;
//     database.User.findOne({'username':req.user.username},function(err,obj){
//       if(err)
// 	res.send(500,"couldn't find your user! - #0");
//       if(!obj)
// 	res.send(404,"couldn't find your user! - #1");
//       else
// 	{
// 	   console.log(obj.username);
// 	   return obj.username;
// 	}
//     });
    //console.log(clss.author);
    clss.title = req.body.title;
    clss.date = Date.now();
    clss.visibility = req.body.visibility;
    
    clss.save(function(err,obj){
      if(err)
	res.send(500,err);
    });
    res.redirect('/myclasses');
  }
  else
    res.send(500,"couldn't create a new class!- #1");
}

//Delete classes
routes.deleteClasses = function(req,res){
  console.log("====== DELETE CLASSES ======");   
  if(req.body)
  {
    for(var o in req.body) {
	database.Classes.findByIdAndRemove(o,function(err,obj){
	if(err)
	  res.send(500,"couldn't delete classes! - #0");
	else if(!obj)
	  res.send(404,"couldn't find classes to delete! - #0");
	});
      }
     res.redirect('/myclasses');
   }
   else
    res.send(500,"couldn't delete classes!- #1");
}

//Set Private/Public
routes.changeVisibility = function(req,res){
  console.log("====== CHANGE VISIBILITY ======");
  if(req.body && req.body.id)
  {
      database.Classes.findById(req.body.id,function(err,obj){
      if(err)
	  res.send(500,"couldn't find the class! - #0");
      else if(!obj)
	  res.send(404,"couldn't find the class! - #1");
      else
      {
	if(obj.visibility == "private")
	  obj.visibility = "public";
	else
	  obj.visibility = "private";
	//saving modifies
	obj.save(function(err,obj){
	  if(err)
	    res.send(500,err);
	});
	//redirecting..
	res.redirect('/myclasses');
      }
    });
  }
}



//List class per user
routes.listClasses = function(req,res){
  console.log("======= LIST MY CLASSES ========");  
  if(req.user && req.user.id && req.user.username)
  {
    //listing classes per user
    var clssPU = database.Classes.find({'author': req.user.username},function(err,obj){
      //debug purpose only
      if(err)
	res.send(500,"couldn't find anything!- #0"); 
      if(!obj)
	res.send(404,"couldn't find anything!- #1");
      else
	res.render('myclasses',{'list':obj});
    });
  }
  else
    res.send(500,"couldn't find anything!- #2");
}

//List public classes
routes.listPublicClasses = function(req,res){
  database.Classes.find({'visibility': 'public'},function(err,obj){
    if(err)
      res.send(500,err);
    else
      res.render('home',{'classes':obj});
  });
}

//Export the pad as PDF document
routes.exportAsPdf = function(req,res){
  console.log("======= EXPORT AS PDF REQUEST RECEIVED ========");  
  if(req.body &&  req.body.pad && req.body.classTitle){
    //create a new pdf document
    var doc = new PDFDocument({size:'letter',layout:'portrait'}); //the first page of the docuemnt is added automatically
//     doc.info['Title'] = req.body.title;
//     doc.info['Author'] = req.user.username;
    //in the req.body i expect to find the page array of the pad so for every page in the pad
    var pad = JSON.parse(req.body.pad);
    //for each page in pad
    for(var i = 0; i < pad.pages.length; i++)
    {
      if(i > 0)
	doc.addPage();
	//PgArray (JSON SVG strings)
	for(var j = 0; j < pad.pages[i].length; j++)
	{
	  var pg = pad.pages[i][j];
	  console.log(pg);
	  //the graphics primitive exported in SVG format from Paper.js
	  if(pg != null && pg.d != null) //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
	  {
	    doc.strokeColor(pg["mix-blend-mode"] == 'destination-out' ? 'white' : pg.stroke)
	      .lineWidth(pg["stroke-width"])
	      .path(pg.d)
	      .stroke();
	  }
	 }
      }
    res.setHeader('Content-Type', 'application/pdf');
    
    var preamble = "";
    if(req.user && req.user.username)
      preamble = req.body.classTitle +"_"+ req.user.username +"_"+ new Date().toJSON();
    else
      preamble = req.body.classTitle +"_"+ "unknownUser" +"_"+ new Date().toJSON();
    doc.write('files/' + preamble + '.pdf');
    res.redirect('files/' + preamble +'.pdf');
  }
  else
    res.send(500,"couldn't create PDF!- #0");
}

module.exports = function(a, d, pdf) { auth = a; database = d; return routes; }