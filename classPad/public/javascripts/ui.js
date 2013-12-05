$(window).ready(function(){
	
  
  //================ Buttons ============================
  //size
  $("#small").on("click", function (){
    window.pen.sW = 7;
    bind2(window.pen);
    window.activeTool = window.pen;
    window.pad.drwScope.activate();
  });

  $("#medium").on("click", function (){
    window.pen.sW = 12;
    bind2(window.pen);
    window.activeTool = window.pen;
    window.pad.drwScope.activate();
  });

  $("#big").on("click", function (){
    window.pen.sW = 17;
    bind2(window.pen);
    window.activeTool = window.pen;
    window.pad.drwScope.activate();
  });
  //colors
  $("#black").on("click",function (){
    window.pen.sC = "black";
    bind2(window.pen);
    window.activeTool = window.pen;
    window.pad.drwScope.activate();
  });

  $("#red").on("click", function (){
    window.pen.sC = "red";
    bind2(window.pen);
    window.activeTool = window.pen;
    window.pad.drwScope.activate();
  });

  $("#green").on("click", function (){
    window.pen.sC = "green";
    bind2(window.pen);
    window.activeTool = window.pen;
    window.pad.drwScope.activate();
  });

  $("#blue").on("click", function (){
    window.pen.sC = "blue";
    bind2(window.pen);
    window.activeTool = window.pen;
    window.pad.drwScope.activate();
  });

 $("#yellow").on("click", function (){
    window.pen.sC = "yellow";
    bind2(window.pen);
    window.activeTool = window.pen;
    window.pad.drwScope.activate();
  });
  // ============== Tools =================================
  //eraser
  $("#eraser").on("click", function(){
    bind2(window.eraser);
    window.pad.drwScope.activate();
  });

  //pen
  $("#pen").on("click", function(){
    bind2(window.pen);
    window.pad.drwScope.activate();
  });
  
  $("#select").on("click",function(){
    bind2(window.selector);
    window.pad.drwScope.activate();
  });
  //============== Background ============================= 
  $("#grid").on("click", function(){
    clearBg();
    drawGrid(window.interLines,window.interLines);
    window.bgnd = "grid";
    refresh();
    window.pad.drwScope.activate();
  });

  $("#rows").on("click", function(){
    clearBg();
    drawGrid(window.interLines);
    window.bgnd = "rows";
    refresh();
    window.pad.drwScope.activate();
  });

 $("#none").on("click", function(){
    clearBg();
    window.bgnd = "none";
    refresh();
    window.pad.drwScope.activate();
  });
 
  // ===================== Undo / Redo ========================
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
    document.getElementById("redo").disabled = false;
  else
    document.getElementById("redo").disabled = true;
  if(window.thisPage().restored.length === 0 && window.thisPage().drawed.length === 0)
    document.getElementById("undo").disabled = true;
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
     document.getElementById("undo").disabled = false;
    else
      document.getElementById("undo").disabled = true;
    if(window.thisPage().saved.length === 0)
     document.getElementById("redo").disabled = true;
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
  // ============================================================================================
   //disable previous page button at the start-up
  document.getElementById("rwd").disabled = true;
  //disable undo & redo button at startup
  document.getElementById("undo").disabled = true;
  document.getElementById("redo").disabled = true;
});
