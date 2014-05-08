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
  if(path.points.length > 1)
  {
    var i;
    //init
    var pts = path.points; 
    ctx.strokeStyle = path.strokeColor;
    ctx.lineWidth = path.strokeWidth;
    ctx.globalCompositeOperation = path.blendMode;
    ctx.setLineDash([]);
    //drawing
    ctx.moveTo( pts[0].x, pts[0].y);
    for (i = 0; i < pts.length - 2; i ++)
    {
      var xc = (pts[i].x + pts[i + 1].x) / 2;
      var yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    // curve through the last two points
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, pts[i+1].x,pts[i+1].y);

    ctx.stroke();
    ctx.closePath();
  }  
};

function drawGrid(offsetY,offsetX){
  var inv_zoom;

  if(window.view.zoom < 1)
    inv_zoom =  window.view.zoom;
  else
    inv_zoom = 1;

  //var mid_pixel_coord = 0.5 * inv_zoom;
  //var W_mpc = W.v2w.transformDistance(mid_pixel_coord,mid_pixel_coord);
  W_mpc = new Point(0,0);

  console.log("drawGrid");

  var bgCanvas = window.bCnvs;
  var TOPLEFT = W.v2w.transformPoint(0,0);
  console.log(TOPLEFT);
  var BOTTOMRIGTH = W.v2w.transformPoint(bgCanvas.clientWidth,bgCanvas.clientHeight);
  
  if(typeof offsetX != "undefined")
  {
    //vertical lines
    for(var i=W_mpc.x; i < BOTTOMRIGTH.x; i+=offsetX)
      drawPath(new Path({
        points: [new Point(i, TOPLEFT.y), new Point(i,BOTTOMRIGTH.y)],
        strokeColor: 'gray',
        strokeWidth: inv_zoom
      }),window.bCtx);
    for(var i=W_mpc.x - offsetX; i > TOPLEFT.x; i-=offsetX)
      drawPath(new Path({
         points: [new Point(i, TOPLEFT.y), new Point(i,BOTTOMRIGTH.y)],
        strokeColor: 'gray',
        strokeWidth: inv_zoom
      }),window.bCtx);
  }
  else
    offsetY *=1.5; //rows only
  //horizontal lines
  for(var i=W_mpc.y; i < BOTTOMRIGTH.y; i+=offsetY)
   drawPath(new Path({
      points: [new Point(TOPLEFT.x,i), new Point(BOTTOMRIGTH.x,i)],
      strokeColor: 'gray',
      strokeWidth: inv_zoom
    }),window.bCtx);
  for(var i=W_mpc.y-offsetY; i > TOPLEFT.y; i-=offsetY)
    drawPath(new Path({
      points: [new Point(TOPLEFT.x,i), new Point(BOTTOMRIGTH.x,i)],
      strokeColor: 'gray',
      strokeWidth: inv_zoom
    }),window.bCtx);
 }

//clear/load canvas (background/paper/fromMaster)
function clearCanvas(cnvs){
  var ctx = cnvs.getContext("2d");
  var XY = W.v2w.transformPoint(cnvs.clientLeft,cnvs.clientTop);
  var WH = W.v2w.transformDistance(cnvs.clientWidth,cnvs.clientHeight);

  ctx.clearRect(XY.x,XY.y,WH.x,WH.y);
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
      blendMode: obj.blendMode
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
  //loadCanvas(window.thisPage().saved, window.thisPage().restored,dCtx);
  loadCanvas(window.thisPage().PgArray,window.thisPage().drawed,dCtx);
  window.toRedraw = false;
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

//we have to scale all of 3 layers canvas!
function zoomAndPan(sF,sP){
  //Registering transformations
  saveTransform(sF,sP);
}

//saving transform point and factor to lazy redraw
function saveTransform(sF,sP){
  window.toRedraw = true;
  transformView(sF,sP);
}

//update the view
function transformView(sF,sP){
  //var ctx = view.canvas.getContext("2d");
  
  //make clean
  // clearCanvas(window.bCnvs);
  // clearCanvas(window.mCnvs);
  // clearCanvas(window.dCnvs);
  // restoreCleanPage();

  //transorm matrix
  W.scaleAt(sP,sF);

  //apply the transformation to canvases contexts
  W.w2v.transform(window.bCtx);
  W.w2v.transform(window.mCtx);
  W.w2v.transform(window.dCtx);

  //re-drawing
  // redrawBackground();
  // loadCanvas(window.thisPage().received,window.thisPage().ofMaster,dCtx);
  // loadCanvas(window.thisPage().PgArray,window.thisPage().drawed,dCtx);

  //adjust view parameters
  window.view.zoom *= sF;   // set zoom
  //just redrawed!
  //window.toRedraw = false;
}

//transform!
function TransformAll(){ 
  refresh();
}

//watchdog function to check toRedraw variable 
function watchDogTransform(){
  if(window.toRedraw != false)
    TransformAll();
}

function transMonitor(){
  setInterval(watchDogTransform,33.33); //execute the function 30 times in a second
}


//function to fit the zoom to the view
function fitzoom(){
  var wGroup = new Group();
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
  

  var XY = W.v2w.transformPoint(window.dCnvs.clientLeft,window.dCnvs.clientTop);
  var WH = W.v2w.transformDistance(window.dCnvs.clientWidth,window.dCnvs.clientHeight);
  var r = new Rectangle({
    x: XY.x,
    y: XY.y,
    width: WH.x,
    height: WH.y
  });
  wGroup.fitBounds(r);
  window.toRedraw = true;
}

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
  //creating group
  var gruppo = new Group();
  //adding to the group eveny element drawed in the page
  for(var i = 0; i < page.drawed.length; i++)
    gruppo.addChild(page.drawed[i]);
  for(var i = 0; i < page.loaded.length; i++)
    gruppo.addChild(page.loaded[i]);
  for(var i = 0; i < page.restored.length; i++)
    gruppo.addChild(page.restored[i]);
  for(var i = 0; i < page.ofMaster.length; i++)
    gruppo.addChild(page.ofMaster[i]);

  //create an HIDDEN html temporary canvas to render the content of the page
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.setAttribute('id','tmpCanvas');
  canvas.setAttribute('style','visibility: hidden;');
  document.body.appendChild(canvas);

  //recreating the scene
  loadCanvas(page.received,page.ofMaster,ctx);
  loadCanvas(page.PgArray,page.drawed,ctx);
  loadCanvas(page.saved,page.restored,ctx);

  /*//now that i have group i should fit the view to landscape A4 page format
  var A4Layout = new Rectangle(0,0,8.27 * 72,11.69 * 72); //in inch 8.27 × 11.69 at 72dpi	
  gruppo.fitBounds(A4Layout);*/

  /*var res = paths2send(gruppo.children);
  //Deleting groups paths
  gruppo.removeChildren();*/

  var res = (page.ofMaster.concat(page.drawed)).concat(page.restored);

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
  window.dCnvs.height = window.bCnvs.height;

  //init view
  window.view = new View({
    canvas: window.dCnvs,
    worldBounds: new Rectangle({ 
                  x: dCnvs.clientLeft,
                  y: dCnvs.clientTop,
                  width: dCnvs.clientWidth,
                  height: dCnvs.clientHeight
    }),
    worldCenter: new Point(window.dCnvs.clientLeft + window.dCnvs.clientWidth/2, window.dCnvs.clientTop + window.dCnvs.clientHeight/2)
  });
}