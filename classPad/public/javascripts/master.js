// // save as pdf button onclick
// document.getElementById("save").onclick = function(){
//   var pdf = new BytescoutPDF();
//   pdf.pageSetSize(BytescoutPDF.A4);
//   pdf.pageSetOrientation(BytescoutPDF.PORTRAIT);
//   pdf.pageAdd();
//   var tmp = document.createElement('canvas');
//   tmp.width = 320;
//   tmp.height = 240;
// //   load image from canvas into BytescoutPDF
//   pdf.imageLoadFromCanvas(canvas); 
// //   place this image at given X, Y coordinates on the page
//   pdf.imagePlace(20, 40);
// //   return BytescoutPDF object instance
//     return pdf;
// };

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
      loadCanvas(window.thisPage().PgArray,window.thisPage().loaded,window.pad.drwScope);
      refresh();
      if(window.pad.currPg > 0)
      {
	document.getElementById("rwd").disabled = false;
	if($("#rwd").hasClass("disabled"))
	  $("#rwd").removeClass("disabled");
      }
    console.log("Connected to the server!");
  });

// ====== Sync paths every 3 seconds (time is in milliseconds) ================
function sD()
{
  var i = 0;
  var empty = true;
  while(i < window.pad.Pages.length && empty)
  {
    if(window.pad.Pages[i].drawed.length > 0 || window.pad.Pages[i].restored.length > 0)
      empty = false;
    i++;
  }
  if(!empty)
    sendData(socket);
}   
  
// =================== FWD ===================================================
  document.getElementById("fwd").onclick = function(){
  //check if some restored paths to save
  if(window.thisPage().restored.length > 0)
  {
    for(var i = 0; i < window.thisPage().restored.length; i++)
      window.thisPage().PgArray.push(window.thisPage().restored[i].toString());
  }
  //clearing
  clearCanvas();
  clearBg();
  //increase the currPg number
  sD();
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
    loadCanvas(window.thisPage().PgArray,window.thisPage().loaded,window.pad.drwScope);
    refresh();
  }
  document.getElementById("rwd").disabled = false;
  
  console.log("DEBUG PRINT: Cambiato la pagina corrente in:" + pad.currPg);
  
  //sync the slave pages
  sD();
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
  }
  //reactivating the drawing scope
  window.pad.drwScope.activate();
}

// ================= Rwd =============================
$("#rwd").on("click", function(){
  //check if some restored paths to save
  if(window.thisPage().restored.length > 0)
  {
    for(var i = 0; i < window.thisPage().restored.length; i++)
      window.thisPage().PgArray.push(window.thisPage().restored[i].toString());
  }
  //clear the canvas
  clearCanvas();
  clearBg();
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
  loadCanvas(window.thisPage().PgArray,window.thisPage().loaded,window.pad.drwScope);
  refresh();
  //buttons
  document.getElementById("undo").disabled = true;
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
  }
  //reactivating the drawing scope
  window.pad.drwScope.activate();
});
  
 setInterval(sD,3*1000);
}