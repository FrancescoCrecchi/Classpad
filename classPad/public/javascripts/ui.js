$(window).ready(function(){
  var inGlowing; //what button is glowing
  
  //glowing
  function setGlow(elName){
    if(inGlowing != null)
    {
      if($(inGlowing).hasClass("glowing"))
	$(inGlowing).removeClass("glowing");
    }
    if(!$(elName).hasClass("glowing"))
      $(elName).addClass("glowing");
    inGlowing = elName;
  }
  
  //================ Buttons ============================
  //size
  $("#small").on("click", function (){
    window.pen.sW = 7;
    bind2(window.pen);
    setGlow("#small");
  });

  $("#medium").on("click", function (){
    window.pen.sW = 12;
    bind2(window.pen);
    setGlow("#medium");
  });

  $("#big").on("click", function (){
    window.pen.sW = 17;
    bind2(window.pen);
    setGlow("#big");
  });
  //colors
  $("#black").on("click",function (){
    window.pen.sC = "black";
    bind2(window.pen);
    setGlow("#black");
  });

  $("#red").on("click", function (){
    window.pen.sC = "red";
    bind2(window.pen);
    setGlow("#red");
  });

  $("#green").on("click", function (){
    window.pen.sC = "green";
    bind2(window.pen);
    setGlow("#green");
  });

  $("#blue").on("click", function (){
    window.pen.sC = "blue";
    bind2(window.pen);
    setGlow("#blue");
  });

 $("#yellow").on("click", function (){
    window.pen.sC = "yellow";
    bind2(window.pen);
    setGlow("#yellow");
  });
  // ============== Tools =================================
  //eraser
  $("#eraser").on("click", function(){
    bind2(window.eraser);
    setGlow("#eraser");
  });

  //pen
  $("#pen").on("click", function(){
    bind2(window.pen);
    setGlow("#pen");
  });
  
  $("#select").on("click",function(){
    bind2(window.selector);
    setGlow("#select");
  });
  //============== Background ============================= 
  $("#grid").on("click", function(){
    clearCanvas(window.bCnvs);
    drawGrid(window.interLines,window.interLines);
    window.bgnd = "grid";
    // refresh();
  });

  $("#rows").on("click", function(){
    clearCanvas(window.bCnvs);
    drawGrid(window.interLines);
    window.bgnd = "rows";
    // refresh();
  });

 $("#none").on("click", function(){
    clearCanvas(window.bCnvs);
    window.bgnd = "none";
    // refresh();
  });
 
  /*// ===================== Undo / Redo ========================
  $("#undo").on("click", function(){
  if((!window.iWasDrawing && window.thisPage().restored.length > 0) || (window.iWasDrawing && window.thisPage().drawed.length === 0 && window.thisPage().restored.length > 0))
  {
    if(window.iWasDrawing)
      window.iWasDrawing = false;
    //salvo l'elemento da eliminare
    window.thisPage().saved.push(window.thisPage().restored.last().toString());
    //cancello l'ultimo path disegnato
    window.thisPage().restored.last().removeSegments();
    window.thisPage().restored.pop();
  }
  else if((window.iWasDrawing && window.thisPage().drawed.length > 0) || (!window.iWasDrawing && window.thisPage().restored.length === 0 && window.thisPage().drawed.length > 0 ))
  {
    if(!window.iWasDrawing)
      window.iWasDrawing = true;
    //salvo l'elemento da cancellare dalla vista
    window.thisPage().saved.push(window.thisPage().drawed.last().toString());
    //cancello l'ultimo path disegnato
    window.thisPage().drawed.last().removeSegments();
    window.thisPage().drawed.pop();
    //anche dalla memoria
    window.thisPage().PgArray.pop();
  }
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
  if(window.thisPage().restored.length === 0 && window.thisPage().drawed.length === 0)
  {
    document.getElementById("undo").disabled = true; 
    if(!$("#undo").hasClass("disabled"))
	$("#undo").addClass("disabled");
  }
  paper.view.draw();
  });
  
  var tmpArray = new Array();
  var counter = 0;

  $("#redo").on("click", function(){
    window.iWasDrawing = false;
    //hack to reuse loadCanvas code....
    tmpArray.push(window.thisPage().saved.pop()); //tmpArray e' un array di paths in formato json
    loadCanvas(tmpArray.slice(counter,counter + 1),window.thisPage().restored,window.pad.drwScope);
    // e anche nella memoria
    window.thisPage().PgArray.push(tmpArray.slice(counter,counter + 1));
    //incremento il counter
    counter++;
    //buttons
    if(window.thisPage().restored.length > 0)
    {
      document.getElementById("undo").disabled = false;
//       $("#undo").click(false);
      if($("#undo").hasClass("disabled"))
	$("#undo").removeClass("disabled");
    }
    else
    {
      document.getElementById("undo").disabled = true;
//       $("#undo").click(true);
      if(!$("#undo").hasClass("disabled"))
	$("#undo").addClass("disabled");
    }
    if(window.thisPage().saved.length === 0)
    {
      document.getElementById("redo").disabled = true;
//       $("#redo").click(false);
      if(!$("#redo").hasClass("disabled"))
	$("#redo").addClass("disabled");
    }
    paper.view.draw();
  });
  // ========================================= FIT ZOOM ========================================
  $("#fitzoom").on("click", function(){
    fitzoom();
  });
  // ========================================= PDF =============================================
  $("#saveAsPdf").on("click",function(){
    pdfRequester();
  });
  $("#uploadPdf").on("click",function(){
    uploadPdf();
  });
  // ============================================================================================*/
   //disable previous page button at the start-up
  document.getElementById("rwd").disabled = true;
//   $("#rwd").click(false);
  $("#rwd").addClass("disabled");
 /* //disable undo & redo button at startup
  document.getElementById("undo").disabled = true;
//   $("#undo").click(false);
  $("#undo").addClass("disabled");
  document.getElementById("redo").disabled = true;
//   $("#redo").click(false);
  $("#redo").addClass("disabled");*/
});
