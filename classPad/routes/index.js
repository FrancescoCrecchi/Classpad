module.exports = function(app){
  //master
  app.get("/master", function(req,res){
    res.render('master');
  });
  //slave
  app.get("/slave", function(req,res){
    res.render('slave');
  });
}