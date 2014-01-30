function lazyInit(){
  var socket = io.connect("/");
  if(typeof socket != "undefined")
  {
    //hello message
    socket.emit("hello",window.classId);

    //registering on HELLO message callback 
    socket.on('HELLO',function(pad){
      for(var i = 0; i < pad.Pages.length; i++)
      {
        window.pad.Pages[i] = new Page();
        window.pad.Pages[i].received = pad.Pages[i].pathsDrawed;
      }
      window.pad.currPg = pad.currPg;
      loadCanvas(window.thisPage().received,window.thisPage().ofMaster,mCtx);

      //refresh();
      if(window.pad.currPg > 0)
      {
       document.getElementById("rwd").disabled = false;
       if($("#rwd").hasClass("disabled"))
         $("#rwd").removeClass("disabled");
      }

      //check last page
      if(window.pad.currPg == window.pad.Pages.length - 1)
      {
        document.getElementById("fwd").disabled = true;
        if(!$("#fwd").hasClass("disabled"))
          $("#fwd").addClass("disabled");
      }

      //mDraw message
      socket.on('mDraw', function(obj){
        console.log("MESSAGE DRAWING ACQUIRED!!!!!!!!!!!!!!!!!");
        if(obj.id != window.classId)
          return; //ignoro il messaggio non e' per me!
        var data = obj.data;
        //integrating
        while(window.pad.Pages.length <= data.cPg)
          window.pad.addPage();
        if(data.cPg > window.pad.currPg)
        {
          document.getElementById("fwd").disabled = false;
          if($("#fwd").hasClass("disabled"))
            $("#fwd").removeClass("disabled");
        }

        //ASSEGNAMENTO RISORSE PRIMITIVO!
        window.pad.Pages[data.cPg].received = data.PgArray;   //!!!!!!!!!!!!!!!!!!!!!!!!
        console.log("Pad integrated!");

        //clearing the ofMaster paths
        var ofML_i = window.pad.Pages[data.cPg].ofMaster.length;
        for(var j=0; j < ofML_i; j++)
          window.pad.Pages[data.cPg].ofMaster.pop();

        if(window.pad.currPg == data.cPg)
        {
         //redrawing the middle canvas
      	 loadCanvas(window.thisPage().received,window.thisPage().ofMaster,mCtx);
      	 //refresh();
        }
        console.log("Pad updated!");
      });
    });
  }
  else
  {
    console.log("ERROR CONNECTING TO THE SERVER");
    return;
  }

  // =================== FWD ===================================================
  $("#fwd").on("click", function(){
    //check if some restored paths to save
    /*if(window.thisPage().restored.length > 0)
    {
      for(var i = 0; i < window.thisPage().restored.length; i++)
       window.thisPage().PgArray.push(window.thisPage().restored[i].toString());
    }*/

    //clearing
    clearCanvas(bCnvs);
    clearCanvas(mCnvs);
    clearCanvas(dCnvs);
    restoreCleanPage();

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
        loadCanvas(window.thisPage().received,window.thisPage().ofMaster,window.mCtx);
        //load the previously drawed content
        loadCanvas(window.thisPage().PgArray,window.thisPage().loaded,window.dCtx);
        //refresh();
    }
    else
    {
      document.getElementById("fwd").disabled = true;
      if(!$("#fwd").hasClass("disabled"))
       $("#fwd").addClass("disabled");
    }
    document.getElementById("rwd").disabled = false;
    if($("#rwd").hasClass("disabled"))
      $("#rwd").removeClass("disabled");

    if((pad.currPg + 1) >= pad.Pages.length)
    {
      document.getElementById("fwd").disabled = true;
      if(!$("#fwd").hasClass("disabled"))
       $("#fwd").addClass("disabled");
    }

    console.log("DEBUG PRINT: Cambiato la pagina corrente in:" + pad.currPg);


    /*//buttons
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

// ================= Rwd =============================
$("#rwd").on("click", function(){
  document.getElementById("fwd").disabled = false;
  if($("#fwd").hasClass("disabled"))
   $("#fwd").removeClass("disabled");
  //check if some restored paths to save
  if(window.thisPage().restored.length > 0)
  {
    for(var i = 0; i < window.thisPage().restored.length; i++)
     window.thisPage().PgArray.push(window.thisPage().restored[i].toString());
  }

  //clear the canvas
  
  //clearing
  clearCanvas(bCnvs);
  clearCanvas(mCnvs);
  clearCanvas(dCnvs);
  restoreCleanPage();

  // step back on the pages array
  if(window.pad.currPg > 0)
    window.pad.currPg--;
  if(window.pad.currPg === 0)
  {
    //disable the button
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
  //load the master canvas content
  loadCanvas(window.thisPage().received,window.thisPage().ofMaster,window.mCtx);
  //refresh();
  /*// buttons
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
  }*/
  });
}