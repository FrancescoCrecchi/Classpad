// ================== UI ================================================
//document.onready = function(){
  //disable fwd button
//}

// ===================== Communication ==================================== 

function lazyInit()
{
  document.getElementById("fwd").disabled = true;
  var socket = io.connect("/");
  if(typeof socket != "undefined")
  {
    //hello message
    socket.on('HELLO',function(pad){
      for(var i = 0 ; i < pad.Pages.length; i++)
      {
	 window.pad.Pages[i] = new Page();
	 window.pad.Pages[i].received = pad.Pages[i].pathsDrawed;
      }
      window.pad.currPg = pad.currPg;
      loadCanvas(window.thisPage().received,window.thisPage().ofMaster,window.pad.rcvScope);
      refresh();
      if(window.pad.currPg > 0)
	document.getElementById("rwd").disabled = false;
      //+ message
      socket.on('+',function(n){
	console.log("SYNC THE MASTER PAD #PAGES...");
	if(n > window.pad.Pages.length) //il master sta andando avanti, ovvero ha aggiunto una pagina alla fine
	{
	  var dim = window.pad.Pages.length;
	  for(var i=0;i<(n - dim);i++)
	    window.pad.addPage();
	}
	else if(n === window.pad.Pages.length)
	  window.pad.addPage();
	
	document.getElementById("fwd").disabled = false;
	console.log("#pages = " + pad.Pages.length);
	console.log("...Done :D");
      });
    //mDraw message
    socket.on('mDraw', function(obj){
      console.log("MESSAGE DRAWING ACQUIRED!!!!!!!!!!!!!!!!!");
      if(obj.id != window.classId)
	return; //ignoro il messaggio con id sbagliato
      var data = obj.data;
      //integrating
      while(window.pad.Pages.length <= data.n)
	window.pad.addPage();
      if(data.n > window.pad.currPg)
	document.getElementById("fwd").disabled = false;
     
//       window.pad.Pages[data.n].received = window.pad.Pages[data.n].received.integrate(data.PgArray); //1:1 master's page/slave's pages
      window.pad.Pages[data.n].received = data.PgArray;
      console.log("Pad integrated!");
      
      //clearing the ofMaster paths
      
      var ofML_i = window.pad.Pages[data.n].ofMaster.length;
      for(var j=0; j < ofML_i; j++)
	window.pad.Pages[data.n].ofMaster[j].removeSegments();
      for(var j=0; j < ofML_i; j++)
	window.pad.Pages[data.n].ofMaster.pop();
      
      if(window.pad.currPg == data.n)
      {
	//redrawing the middle canvas
	loadCanvas(window.thisPage().received,window.thisPage().ofMaster,window.pad.rcvScope);
	//reactivating the drawing scope
	window.pad.drwScope.activate();
	refresh();
      }
      console.log("Pad updated!");
      });
    }); 
    socket.emit("hello",window.classId);
  }
  else
    console.log("ERROR CONNECTING TO THE SERVER");

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
    if((window.pad.currPg + 1) < window.pad.Pages.length)
    //load the previously drawed content
    {
      window.pad.currPg++;
      
      //load the background
      if(window.bgnd != "none")
      {
	if(window.bgnd === "rows")
	  drawGrid(20);
	else
	  drawGrid(20,20);
      }
      //load the master canvas content
      loadCanvas(window.thisPage().received,window.thisPage().ofMaster,window.pad.rcvScope);
      //load the previously drawed content
      loadCanvas(window.thisPage().PgArray,window.thisPage().loaded,window.pad.drwScope);
      refresh();
    }
    else
      document.getElementById("fwd").disabled = true;
    document.getElementById("rwd").disabled = false;
    if((pad.currPg + 1) >= pad.Pages.length)
      document.getElementById("fwd").disabled = true;
    
    console.log("DEBUG PRINT: Cambiato la pagina corrente in:" + pad.currPg);
    
    //buttons
    if(window.thisPage().saved.length > 0)
      document.getElementById("redo").disabled = false;
    else
      document.getElementById("redo").disabled = true;
    
    //reactivating the drawing scope
    window.pad.drwScope.activate();
  }

  // ================= Rwd =============================
  $("#rwd").on("click", function(){
    document.getElementById("fwd").disabled = false;
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
      //disable the button
      document.getElementById("rwd").disabled = true;  
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
    //load the master canvas content
    loadCanvas(window.thisPage().received,window.thisPage().ofMaster,window.pad.rcvScope);
    refresh();
    //buttons
    document.getElementById("undo").disabled = true;
    if(window.thisPage().saved.length > 0)
      document.getElementById("redo").disabled = false;
    else
      document.getElementById("redo").disabled = true;
    
    //reactivating the drawing scope
    window.pad.drwScope.activate();
  });
}