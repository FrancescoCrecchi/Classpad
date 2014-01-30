function lazyInit(){
  //we won't provide the Selector tool to Master
  document.getElementById("select").style.visibility = 'hidden';
  
  //start handshake
  var socket = io.connect("/");
  socket.emit("hello",window.classId);
  socket.on("HELLO",function(pad){
    for(var i = 0 ; i < pad.Pages.length; i++)
    {
      window.pad.Pages[i] = new Page();
      window.pad.Pages[i].PgArray = pad.Pages[i].pathsDrawed;
    }
    window.pad.currPg = pad.currPg;
    loadCanvas(window.thisPage().PgArray,window.thisPage().loaded,window.dCtx);
    //refresh();
    if(window.pad.currPg > 0)
    {
      document.getElementById("rwd").disabled = false;
      if($("#rwd").hasClass("disabled"))
      $("#rwd").removeClass("disabled");
    }
    console.log("Connected to the server!");
});
  
// =================== FWD ===================================================
  document.getElementById("fwd").onclick = function(){
  /*//check if some restored paths to save
  if(window.thisPage().restored.length > 0)
  {
    for(var i = 0; i < window.thisPage().restored.length; i++)
      window.thisPage().PgArray.push(window.thisPage().restored[i].toString());
  }*/
  //clearing
  clearCanvas(window.bCnvs);
  clearCanvas(window.mCnvs);
  clearCanvas(window.dCnvs);
  restoreCleanPage();

  //increase the currPg number
  window.pad.currPg++;
  if(window.pad.currPg === window.pad.Pages.length )
    window.pad.addPage();
  else
  {
    //load the background
    if(window.bgnd != "none")
    {
      if(window.bgnd === "rows")
        drawGrid(20);
      else
        drawGrid(20,20);
    }
    //load the previously drawed content
    loadCanvas(window.thisPage().PgArray,window.thisPage().loaded,window.dCtx);
    //refresh();
  }
  document.getElementById("rwd").disabled = false;
  if($("#rwd").hasClass("disabled"))
      $("#rwd").removeClass("disabled");
  
  console.log("DEBUG PRINT: Cambiato la pagina corrente in:" + pad.currPg);
  
  //sync the slave pages
  sendData(socket);

  /*//ui look
  document.getElementById("undo").disabled = true;
  if(!$("#undo").hasClass("disabled"))
    $("#undo").addClass("disabled");

  //buttons
  if(window.thisPage().saved.length > 0)
  {
    document.getElementById("redo").disabled = false;
    if($("#redo").hasClass("disabled"))
      $("#redo").removeClass("disabled");
  }
  else
  {
    document.getElementById("redo").disabled = true; 
    if(!$("#redo").hasClass("disabled"))
      $("#redo").addClass("disabled");
  }*/
}

// ================= Rwd =============================
$("#rwd").on("click", function(){
  /*//check if some restored paths to save
  if(window.thisPage().restored.length > 0)
  {
    for(var i = 0; i < window.thisPage().restored.length; i++)
      window.thisPage().PgArray.push(window.thisPage().restored[i].toString());
  }*/
  
  //clearing
  clearCanvas(window.bCnvs);
  clearCanvas(window.mCnvs);
  clearCanvas(window.dCnvs);
  restoreCleanPage();

  // step back on the pages array
  if(window.pad.currPg > 0)
    window.pad.currPg--;
  if(window.pad.currPg === 0)
  { //disable the button
    document.getElementById("rwd").disabled = true;
    if(!$("#rwd").hasClass("disabled"))
      $("#rwd").addClass("disabled");
  }
  console.log("DEBUG PRINT: Cambiato la pagina corrente in:" + window.pad.currPg);
  //load the background
  if(window.bgnd != "none")
  {
    if(window.bgnd === "rows")
      drawGrid(20);
    else
      drawGrid(20,20);
  }
  //load the previously drawed contents
  loadCanvas(window.thisPage().PgArray,window.thisPage().loaded,window.dCtx);
  //refresh();
  //buttons
  /*document.getElementById("undo").disabled = true;
  if(!$("#undo").hasClass("disabled"))
      $("#undo").addClass("disabled");
  if(window.thisPage().saved.length > 0)
  {
    document.getElementById("redo").disabled = false; 
    if($("#redo").hasClass("disabled"))
      $("#redo").removeClass("disabled");
  }
  else
  {
    document.getElementById("redo").disabled = true;
    if(!$("#redo").hasClass("disabled"))
      $("#redo").addClass("disabled");
  }*/
});
  
 setInterval(function(){sendData(socket);},3*1000); //SYNCING DATA EVERY 3 SECONDS!
}