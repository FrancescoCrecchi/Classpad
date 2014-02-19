// Adding methods to Array object
Array.prototype.last = function(){
  return this[this.length - 1];
};

Array.prototype.remove = function(el){
  var index = this.indexOf(el);
  if(index > -1)
    this.splice(index,1);
};

//my indexOf() prototype: first occurrence
Array.prototype.getIndexOf = function(obj){
  var found = false;
  var i = 0;
  while(i < this.length && !found)
  {
    if(this[i] === obj)
      found = true;
    else
      i++;
  }
  if(found)
    return i;
  return -1;
};

//Overload toString methods to obtain a JSON string
Path.prototype.toString = function () {
  return JSON.stringify(this);
};


//function to draw a path
function drawPath(path,ctx) {
  //drawing
  ctx.beginPath();
  if(path.points.length > 0)
  {
    //init
    var pts = path.points;
    ctx.strokeStyle = path.strokeColor;
    ctx.lineWidth = path.strokeWidth;
    ctx.globalCompositeOperation = path.blendMode;
    //drawing
    ctx.moveTo( pts[0].x, pts[0].y);
    for(var i = 0; i < pts.length; i++)
    {
      ctx.lineTo( pts[i].x,pts[i].y);
    }
    ctx.stroke();
    ctx.closePath();
  }  
};

function drawGrid(offsetY,offsetX){
  var inv_zoom = 1.0 / window.view.zoom;

  var mid_pixel_coord = 0.5 * inv_zoom;

  console.log("drawGrid");

  var bgCanvas = window.bCnvs;
  var TOPLEFT = W.v2w.transformPoint(0,0);
  var BOTTOMRIGTH = W.v2w.transformPoint(bgCanvas.clientWidth,bgCanvas.clientHeight);
  
  if(typeof offsetX != "undefined")
  {
    //vertical lines
    for(var i=TOPLEFT.x; i < BOTTOMRIGTH.x; i+=offsetX)
      drawPath(new Path({
        points: [new Point(i, TOPLEFT.y), new Point(i,BOTTOMRIGTH.y)],
        strokeColor: 'gray',
        strokeWidth: 1 * inv_zoom
      }),bCtx);
    /*for(var i=mid_pixel_coord - offsetX; i > TOPLEFT.x; i-=offsetX)
      drawPath(new Path({
         points: [new Point(i, TOPLEFT.y), new Point(i,BOTTOMRIGTH.y)],
        strokeColor: 'gray',
        strokeWidth: 1 * inv_zoom
      }),bCtx);*/
  }
  else
    offsetY *=1.5; //rows only
  //horizontal lines
  for(var i=TOPLEFT.y; i < BOTTOMRIGTH.y; i+=offsetY)
   drawPath(new Path({
      points: [new Point(TOPLEFT.x,i), new Point(BOTTOMRIGTH.x,i)],
      strokeColor: 'gray',
      strokeWidth: 1 * inv_zoom
    }),bCtx);
  /*for(var i=mid_pixel_coord-offsetY; i > TOPLEFT.x; i-=offsetY)
    drawPath(new Path({
      points: [new Point(TOPLEFT.x,i), new Point(BOTTOMRIGTH.x,i)],
      strokeColor: 'gray',
      strokeWidth: 1 * inv_zoom
    }),bCtx);*/
 }

//clear/load canvas (background/paper/fromMaster)
function clearCanvas(cnvs){
  var ctx = cnvs.getContext("2d");
  var XY = W.v2w.transformPoint(cnvs.clientLeft,cnvs.clientTop);
  var WH = W.v2w.transformPoint(cnvs.clientWidth,cnvs.clientHeight);

  ctx.clearRect(XY.x,XY.y,WH.x - XY.x,WH.y - XY.y);
}

function restoreCleanPage(){
  //variables
  var dwL = window.thisPage().drawed.length;
  var ldL = window.thisPage().loaded.length;
  var rsL = window.thisPage().restored.length;
  var ofML = window.thisPage().ofMaster.length;
  //cleaning drawed paths
  if(dwL > 0)
    for(var i=0; i < dwL; i++)
      window.thisPage().drawed.pop();

  //cleaning loaded paths
  if(ldL > 0)
    for(var i=0; i < ldL; i++)
      window.thisPage().loaded.pop();

  //cleaning restored paths
  if(rsL > 0)
    for(var i=0; i < rsL; i++)
      window.thisPage().restored.pop();

  //cleaning ofMaster paths
  if(ofML > 0)
    for(var i=0; i < ofML; i++)
      window.thisPage().ofMaster.pop();
}


function loadCanvas(jsonArray,dstArray,ctx){
  // load the content previously created
  for(var i=0;i < jsonArray.length ; i++)
  {
    var path_i_str = jsonArray[i];
    var obj = JSON.parse(path_i_str); //Object
    // casting the generic object
    var path = new Path({
      strokeColor: obj.strokeColor,
      strokeWidth: obj.strokeWidth,
      blendMode: obj.blendMode,
    });
    //path.points = obj.points.slice(); 
    for(var j=0; j < obj.points.length; j++)
      path.points.push(new Point(obj.points[j].x,obj.points[j].y));
    //drawing path
    drawPath(path,ctx);
    //saving it into memory
    dstArray.push(path);
  }
}

//master sync paths function
function sendData(socket){
  if(typeof socket != "undefined")
  {
    console.log("Connected to the server!");
    // sending to the server
    socket.emit('sync', {"PgArray":window.thisPage().PgArray,"cPg":window.pad.currPg});
    //logging
    console.log("Sending data to the server... ");
  }
  else
    console.log("ERROR CONNECTING TO THE SERVER");
}

// GestIT bind
function bind2(tool){
  if(typeof window.activeTool != "undefined")
  {
    //removing older event handlers
    window.td1.gesture.remove(window.mdCb);
    
    //check if i had selected something
    if(window.activeTool === window.selector && typeof window.selector.selectGroup != "undefined" && window.selector.selectGroup.hasChildren())
    {
      //deselect them
      var l = window.selector.selectGroup.children.length;
      for(var i = 0; i < l; i++)
        window.selector.selectGroup.children.pop(); 
   }
   refresh();
 }
 else
    //init multitouch
  multitouchInit();  
  
  //setting the activeTool
  window.activeTool = tool;
  //adding new events
  window.mdCb = window.td1.gesture.add(returnViewPoint(window.activeTool.onMouseDown));
}

// Redraw the page function!
function refresh(){
  //clearing canvases
  clearCanvas(window.bCnvs);
  clearCanvas(window.mCnvs);
  clearCanvas(window.dCnvs);
  //clearing page data
  restoreCleanPage();
  //redraw
  redrawBackground();
  loadCanvas(window.thisPage().received,window.thisPage().ofMaster,mCtx);
  loadCanvas(window.thisPage().PgArray,window.thisPage().drawed,dCtx);
}


//isIn function: check if a path is contained into a rectangle
function isIn(path,rectangle){
  //ricerca incerta di un punto del path contenuto nel rettangolo
  var j = 0;
  var found = false;
  while(j < path.points.length && !found)
  {
    if(rectangle.contains(path.points[j]))
      found = true;
    j++;
  }
  if(found)
    return true;
  return false;
}

//function to parse event (mouse/touch event) into a [x,y] point
function parseEvent(e){
  var x = e.evt.clientX - e.evt.target.getBoundingClientRect().left;
  var y = e.evt.clientY - e.evt.target.getBoundingClientRect().top;
  return {x: x, y: y};
}

//gets an event and a callback, then register the callback with the parsed point
function returnViewPoint(callback){
  return function(event) {
    var point = parseEvent(event); //parsing event
    callback(point); //calling the callback
  };
}

//calculate delta
function calculateDelta(newPoint,startPoint){
  return {x: newPoint.x - startPoint.x, y: newPoint.y - startPoint.y};
}

//we have to scale all of 3 layers canvas!
function zoomAndPan(sF,sP){
  //Registering transformations
  saveTransform(sF,sP);
}

//saving transform point and factor to lazy redraw
function saveTransform(sF,sP){
  window.view.zoom *= sF;   // set zoom
  //console.log("window.view.zoom AGGIORNATO A: ");
  //console.log(window.view.zoom);

  //window.view.center = sP;  // set center
  //window.toRedraw = true;
  transformView(window.view,sF,sP);
}

function redrawBackground(){
  //   Redrawing the background
  if(window.bgnd != "none")
  {
    if(window.bgnd == "grid")
      drawGrid(window.interLines,window.interLines);
    else
      drawGrid(window.interLines);
  }
}


//update the view
function transformView(view,sF,sP){
  //var ctx = view.canvas.getContext("2d");
  
  //make clean
  clearCanvas(window.bCnvs);
  //identity.transform(window.dCtx);
  clearCanvas(view.canvas);
  restoreCleanPage();

  W.scaleAt(sP,sF);

  W.w2v.transform(window.bCtx);
  W.w2v.transform(window.dCtx);

  //drawing
  redrawBackground();
  loadCanvas(window.thisPage().PgArray,window.thisPage().drawed,dCtx);

  //just redrawed!
  //window.toRedraw = false;
  //view.setCenter(new Point(view.center.x + sP.x, view.center.y + sP.y));
}

/*//transform!
function TransformAll(){
  //   Redrawing the background
  if(window.bgnd != "none")
  {
    clearCanvas(bCnvs);
    if(window.bgnd == "grid")
      drawGrid(window.interLines,window.interLines);
    else
      drawGrid(window.interLines);
  }
  refresh();
}*/

//watchdog function to check toRedraw variable 
/*function watchDogTransform(){
  if(window.toRedraw != false && finishTransform)
    transformView(window.view,window.scaleFactor,window.scalePoint);
}

function transMonitor(){
  setInterval(watchDogTransform,33.33); //execute the function 30 times in a second
}*/


//function to fit the zoom to the view
/*function fitzoom(){
  var wGroup = new paper.Group();
  //listing drawed paths
  for(var i = 0; i < window.thisPage().drawed.length; i++)
  {
    var thisPath = window.thisPage().drawed[i];
    wGroup.addChild(thisPath);
  }
  //listing loaded paths
  for(var i = 0; i < window.thisPage().loaded.length; i++)
  {
    var thisPath = window.thisPage().loaded[i];
    wGroup.addChild(thisPath);
  }
  //listing loaded paths
  for(var i = 0; i < window.thisPage().ofMaster.length; i++)
  {
    var thisPath = window.thisPage().ofMaster[i];
    wGroup.addChild(thisPath);
  }
  //now that we have added all paths in view...
  //paper.view.setCenter(wGroup.bounds.center);
  //paper.view.setZoom(Math.min(paper.view.zoom,Math.min((paper.view.bounds.width/wGroup.bounds.width),(paper.view.bounds.height/wGroup.bounds.height))));
  //saving the new center and the new zoom factor into global variables
  window.scalePoint = wGroup.bounds.center.subtract(paper.view.center);
  window.scaleFactor = Math.min((paper.view.bounds.width/wGroup.bounds.width),(paper.view.bounds.height/wGroup.bounds.height));
  saveTransform();
}*/

/*//function to ask node server to generate pdf
function paths2send(source_array){
  var retObj = [];
  for(var i = 0; i < source_array.length; i++)
  {
    var dom_obj = source_array[i].exportSVG({asString:true});
    if(dom_obj != null)
    {
      var expr = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
      var color = expr.exec(source_array[i].strokeColor.toCSS());//expr.exec(dom_obj.getAttribute("stroke"));
      var rgb_color = [color[1],color[2],color[3]];
      retObj[i] = {"d": dom_obj.getAttribute("d"), "stroke": rgb_color , "stroke-width": source_array[i].strokeWidth, "mix-blend-mode": dom_obj.getAttribute("mix-blend-mode")}; 
    }
  }
  return retObj;
}*/

function pdfRequester(){
  var pad = {"pages": []};
  for(var i = 0; i < window.pad.Pages.length; i++)
  {
    var this_page = window.pad.Pages[i];
    pad.pages[i] = exportTempCanvas(this_page);
  }
  // Send data as POST request to node server
  var form = document.createElement('form');
  form.setAttribute('method', 'post');
  form.setAttribute('action', '/exportAsPdf');
  form.style.display = 'hidden';
  //id
  var PAD = document.createElement('input');
  PAD.setAttribute('type',"hidden");
  PAD.setAttribute('name',"pad");
  PAD.setAttribute('value',JSON.stringify(pad));
  form.appendChild(PAD);
  
  var TITLE = document.createElement('input');
  TITLE.setAttribute('type',"hidden");
  TITLE.setAttribute('name',"classTitle");
  TITLE.setAttribute('value',window.classTitle);
  form.appendChild(TITLE);
  
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

//Create a temporary canvas with the content of the current page
function exportTempCanvas(page){
  /*//creating group
  var gruppo = Group();*/
  //create an HIDDEN html temporary canvas to render the content of the page
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.setAttribute('id','tmpCanvas');
  canvas.setAttribute('style','visibility: hidden;');
  document.body.appendChild(canvas);

  //now render the content of the page to the canvas using the loadCanvas function
  loadCanvas(page.received,page.ofMaster,ctx);
  loadCanvas(page.PgArray,page.drawed,ctx);

  /*//now that i have group i should fit the view to landscape A4 page format
  var A4Layout = new Rectangle(0,0,8.27 * 72,11.69 * 72); //in inch 8.27 × 11.69 at 72dpi	
  // gruppo.fitBounds(A4Layout);*/

  /*var res = paths2send(gruppo.children);
  //Deleting groups paths
  gruppo.removeChildren();*/

  var res = page.ofMaster.concat(page.drawed);

  //remove temporary canvas
  document.body.removeChild(canvas);

  return res;
}

/*//Upload a PDF document in background
function uploadPdf(){

  var url = 'http://www.lamma.rete.toscana.it/previ/ita/bollettino.pdf';
  
  // Disable workers to avoid yet another cross-origin issue (workers need the URL of
  // the script to be loaded, and currently do not allow cross-origin scripts)
  //
  PDFJS.disableWorker = true;
  //   PDFJS.workerSrc = '/javascripts/libs/pdf.js'

	var pdfDoc = null;
	var pageNum = 1;
	var scale = 1.5;

  //create a temporary canvas to put before the background canvas
  var pdfCanvas = document.getElementById('forPdf');
  //   pdfCanvas.setAttribute('id','pdfCanvas');
	//   pdfCanvas.setAttribute('style','position: absolute;');
	//   pdfCanvas.setAttribute('style','position: absolute; left: 0px; top: 0px; z-index: 1;');
	//   pdfCanvas.setAttribute('width', 8.27 * 72); //72dpi
	//   pdfCanvas.setAttribute('height', 11.69 * 72); //72dpi
	var ctx = pdfCanvas.getContext('2d');
  //appending the new canvas before the background
	//   var cvsBg = document.getElementById('cnvsBg');
	//   cvsBg.insertBefore(pdfCanvas,cvsBg.childNodes[1]); //insert before 'background' canvas
	
  //
  // Get page info from document, resize canvas accordingly, and render page
  //
  function renderPage(num) {
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
      var viewport = page.getViewport(pdfCanvas.clientWidth / page.getViewport(scale).width); // VIEWPORT BASATO SOLO SU WIDTH MA IO LO VORREI ANCHE SU HEIGHT
      pdfCanvas.height = viewport.height;
      pdfCanvas.width = viewport.width;
      
      // Render PDF page into canvas context
      var renderContext = {
       canvasContext: ctx,
       viewport: viewport
     };
     page.render(renderContext);
   });
  }
}
//
// Asynchronously download PDF as an ArrayBuffer
//
PDFJS.getDocument(url).then(function getPdfHelloWorld(_pdfDoc) {
  pdfDoc = _pdfDoc;
  renderPage(pageNum);
  refresh();
});
*/

//Prevent browser scrolling function
function stopScrolling(touchEvent)
{
  touchEvent.preventDefault();
}

//Return the this page function
function thisPage(){
  return window.pad.Pages[window.pad.currPg];
}

//Commodity function to set the canvas size based on page lauyout
function setCanvasDims(id){
  $("#" + id)[0].width = $("#" + id).css("width").replace('px','');
  $("#" + id)[0].height = $("#" + id).css("height").replace('px','');
}

//Init canvases funcion
function initCanvasElements(){

  //canvas elements
  window.bCnvs = $("#background")[0];
  window.mCnvs = $("#fromMaster")[0];
  window.pdfCnvs = $("#forPdf")[0];
  window.dCnvs = $("#paper")[0];
  
  // contexts
  window.bCtx = window.bCnvs.getContext("2d");
  window.mCtx = window.mCnvs.getContext("2d");
  window.pdfCtx = window.pdfCnvs.getContext("2d");
  window.dCtx = window.dCnvs.getContext("2d");
  
  //initializing dimensions
  setCanvasDims("background");
  setCanvasDims("fromMaster");
  setCanvasDims("forPdf");
  setCanvasDims("paper");
  $("#paper")[0].height = 518;

  //init view
  window.view = new View({
    canvas: window.dCnvs,
    bounds: new Rectangle({ //ACHTUNG! Probably we should use a view per canvas so 3/4 views at all.
                  x: dCnvs.clientLeft,
                  y: dCnvs.clientTop,
                  width: dCnvs.clientWidth,
                  height: dCnvs.clientHeight
    }),
    center: new Point(window.dCnvs.clientLeft + window.dCnvs.clientWidth/2, window.dCnvs.clientTop + window.dCnvs.clientHeight/2)
  });
}