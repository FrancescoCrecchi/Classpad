//Adding methods to Array object
Array.prototype.last = function(){
  return this[this.length - 1];
};

//Overload toString methods to obtain a JSON string
with(paper){
  Path.prototype.toString = function () {
    return JSON.stringify(this);
  };
}

//Background
function clearBg(){
  window.pad.bgdScope.activate(); //activate the rigth paperscopes
  console.log("clear background: " + paper);
  for(var i=0; i < window.thisPage().background.length; i++)
    window.thisPage().background[i].removeSegments();
  for(var i=0; i < window.thisPage().background.length; i++)
    window.thisPage().background.pop();
  //reactivate the drawing scope 
  window.pad.drwScope.activate();
}

function drawGrid(offsetY,offsetX){
  with(paper) {
    var the_view = window.pad.bgdScope.view;
    window.pad.bgdScope.activate(); //activate the rigth paperscopes

    var inv_zoom = 1.0 / the_view.zoom;
    
    var drawLine = function (s, e) {
      var bg = window.thisPage().background;
      bg.push(new Path({
       strokeWidth: inv_zoom,
       strokeColor: new Color(0.5, Math.min(1.0, the_view.zoom))
     }));
      bg.last().add(s);
      bg.last().add(e);
    };

    var mid_pixel_coord = 0.5 * inv_zoom;

    console.log("drawGrid: " + paper);
    if(typeof offsetX != "undefined")
    {
      //vertical lines
      for(var i=mid_pixel_coord; i < the_view.bounds.right; i+=offsetX)
       drawLine(new Point(i,the_view.bounds.top), new Point(i,the_view.bounds.bottom));
     for(var i=mid_pixel_coord-offsetX; i > the_view.bounds.left; i-=offsetX)
       drawLine(new Point(i,the_view.bounds.top), new Point(i,the_view.bounds.bottom));
   }
   else
      offsetY *=1.5; //rows only
      //horizontal lines
      for(var i=mid_pixel_coord; i < the_view.bounds.bottom; i+=offsetY)
       drawLine(new Point(the_view.bounds.left,i), new Point(the_view.bounds.right,i));
     for(var i=mid_pixel_coord-offsetY; i > the_view.bounds.top; i-=offsetY)
       drawLine(new Point(the_view.bounds.left,i), new Point(the_view.bounds.right,i));
   }
   window.pad.drwScope.activate();
 }

//clear/load canvas
function clearCanvas(){
  window.pad.drwScope.activate();
  //variables
  var dwL = window.thisPage().drawed.length;
  var ldL = window.thisPage().loaded.length;
  var rsL = window.thisPage().restored.length;
  var ofML = window.thisPage().ofMaster.length;
  
  console.log("clear canvas: " + paper);
  //clear the canvas to simulate the change
  var upCanvas = document.getElementById("paper");
  upCanvas.width = upCanvas.width; //this should clear the canvas
  //cleaning drawed paths
  if(dwL > 0)
  {
    for(var i=0; i < dwL; i++)
      window.thisPage().drawed[i].removeSegments();
    for(var i=0; i < dwL; i++)
      window.thisPage().drawed.pop();
  }
  //cleaning loaded paths
  if(ldL > 0)
  {
    for(var i=0; i < ldL; i++)
      window.thisPage().loaded[i].removeSegments();
    for(var i=0; i < ldL; i++)
      window.thisPage().loaded.pop();
  }
  //cleaning restored paths
  if(rsL > 0)
  {
    for(var i=0; i < rsL; i++)
      window.thisPage().restored[i].removeSegments();
    for(var i=0; i < rsL; i++)
      window.thisPage().restored.pop();
  }
  //cleaning ofMaster paths
  if(ofML > 0)
  {
    for(var i=0; i < ofML; i++)
      window.thisPage().ofMaster[i].removeSegments();
    for(var i=0; i < ofML; i++)
      window.thisPage().ofMaster.pop();
  }
}

function loadCanvas(jsonArray,dstArray,scope){
  scope.activate();
  console.log("load canvas: " + paper);
  with(paper) {
    // load the content previously created
    for(var i=0;i < jsonArray.length ; i++)
    {
      var path_i_str = jsonArray[i];
      var objs = JSON.parse(path_i_str); //Object
      var nPath = new Path({
       strokeColor: objs[1].strokeColor,
       strokeWidth: objs[1].strokeWidth
     });
      if(typeof objs[1].segments != "undefined")
       nPath["segments"] = objs[1].segments.slice();
     if(typeof objs[1].blendMode != "undefined")
       nPath["blendMode"] = objs[1].blendMode;
     dstArray.push(nPath);
   }
 }
}

//master sync paths function
function sendData(socket){
  if(typeof socket != "undefined")
  {
    console.log("Connected to the server!");
    // sending to the server
    socket.emit('sync', {"PgArray":window.thisPage().PgArray,"n":window.pad.currPg});
    //logging
    console.log("Sending data to the server... ");
  }
  else
    console.log("ERROR CONNECTING TO THE SERVER");
}

//integrate slave pad
function array_diff(aOld, aNew){
  var res = [];
  for(var i = 0; i < aNew.length; i++){
    if(aOld.indexOf(aNew[i]) === -1)
      res.push(aNew[i]);
  }
  return res;
}

Array.prototype.integrate = function(newArray){
  var res = array_diff(this,newArray);
  return this.concat(res); //concateno il risultato della differenza tra le nuove pG e le vecchie
};

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
      for(var i = 0; i < window.selector.selectGroup.children.length; i++)
       window.selector.selectGroup.children[i].selected = false; 
   }
 }
 else
    //init multitouch
  multitouchInit();  
  
  //setting the activeTool
  window.activeTool = tool;
  //adding new events
  window.mdCb = window.td1.gesture.add(returnViewPoint(window.activeTool.onMouseDown));       //?????????????? RETURN VIEWPOINT E' PER IL SELECTOR?!
}

//isIn function: check if a path is contained into a rectangle
function isIn(path,rectangle){
  //ricerca incerta di un punto del path contenuto nel rettangolo
  var j = 0;
  var found = false;
  while(j < path.segments.length && !found)
  {
    if(rectangle.contains(path.segments[j].point))
      found = true;
    j++;
  }
  if(found)
    return true;
  return false;
}

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

//function to parse event (mouse/touch event) into a [x,y] point
function parseEvent(e){
  var x = e.evt.clientX - e.evt.target.getBoundingClientRect().left;
  var y = e.evt.clientY - e.evt.target.getBoundingClientRect().top;
  return {x: x, y: y};
}

//gets an event and a callback, then register the callback with the parsed point
function returnPagePoint(callback){
  return function(event) {
    var point = parseEvent(event); //parsing event
    callback(point); //calling the callback
  };
}

//gets an event and a callback, then register the callback with the parsed point
function returnViewPoint(callback){
  return returnPagePoint(function(point) {
    point.x = paper.view.bounds.x + point.x * paper.view.bounds.width / paper.view.viewSize.width;
    point.y = paper.view.bounds.y + point.y * paper.view.bounds.height / paper.view.viewSize.height;
    callback(point); //calling the callback
  });
}
//calculate delta
function calculateDelta(newPoint,startPoint){
  return {x: newPoint.x - startPoint.x, y: newPoint.y - startPoint.y};
}

// refesh the 3 layers
function refresh(){
   window.pad.bgdScope.view._handlingFrame = false; //HACK TO MAKE DRAW GOING SMOOTH
   window.pad.rcvScope.view._handlingFrame = false; //HACK TO MAKE DRAW GOING SMOOTH
   window.pad.drwScope.view._handlingFrame = false; //HACK TO MAKE DRAW GOING SMOOTH
 
   window.pad.bgdScope.view.draw();
   window.pad.rcvScope.view.draw();
   window.pad.drwScope.view.draw();
 	
   window.toRedraw = false;
}

//we have to scale all of 3 layers canvas!
function zoomAndPan(sF,sP){
  //Registering transformations
  saveTransform(sF,sP);
}

//saving transform point and factor to lazy redraw
function saveTransform(sF,sP){
  window.pad.bgdScope.view._handlingFrame = true;   //HACK TO MAKE DRAW GOING SMOOTH
  window.pad.rcvScope.view._handlingFrame = true;   //HACK TO MAKE DRAW GOING SMOOTH
  window.pad.drwScope.view._handlingFrame = true;   //HACK TO MAKE DRAW GOING SMOOTH

  //bgnd scope
  transformView(window.pad.bgdScope.view,window.scaleFactor,window.scalePoint);
  //middle one
  transformView(window.pad.rcvScope.view,window.scaleFactor,window.scalePoint);
  //top one
  transformView(window.pad.drwScope.view,window.scaleFactor,window.scalePoint);
  window.toRedraw = true;
}

//update the view
function transformView(view,sF,sP){
  view.setZoom(view.zoom * sF);
  view.setCenter(new paper.Point(view.center.x + sP.x, view.center.y + sP.y));
  //check if a pdf has been loaded to the "forPdf" canvas
//   if(window.pdfLoaded )
//   {

//   }
}

//transform!
function TransformAll(){
  //   Redrawing the background
  if(window.bgnd != "none")
  {
    clearBg();
    if(window.bgnd == "grid")
      drawGrid(window.interLines,window.interLines);
    else
      drawGrid(window.interLines);
  }
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
}

//function to ask node server to generate pdf
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
}

function pdfRequester(){
  var pad = {"pages":[]};
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
  window.pad.drwScope.activate();
}

//Create a temporary canvas with the content of the current page
function exportTempCanvas(page){
  //attaching paper to the new canvas
  var tmpScope = new paper.PaperScope();
  tmpScope.setup(canvas);
  //creating group
  var gruppo = new tmpScope.Group();
  //create an HIDDEN html temporary canvas to render the content of the page
  var canvas = document.createElement('canvas'); //visibility = 'hidden' ??????????????????
  canvas.setAttribute('id','tmpCanvas');
  canvas.setAttribute('style','visibility: hidden;');
  document.body.appendChild(canvas);
  //now render the content of the page to the canvas using paper.js
  for(var i=0; i < page.received.length; i++) //received paths
    gruppo.addChild(tmpScope.Path.importJSON(page.received[i])); //to Object
  for(var j=0; j < page.PgArray.length; j++) //received paths
   gruppo.addChild(tmpScope.Path.importJSON(page.PgArray[j])); //to Object
  //now that i have group i should fit the view to landscape A4 page format
  var A4Layout = new tmpScope.Rectangle(0,0,8.27 * 72,11.69 * 72); //in inch 8.27 × 11.69 at 72dpi	
  gruppo.fitBounds(A4Layout);
  var res = paths2send(gruppo.children);
  //Deleting groups paths
  gruppo.removeChildren();
  //remove temporary canvas
  document.body.removeChild(canvas);

  return res;
}

//Upload a PDF document in background
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

  //
  // Asynchronously download PDF as an ArrayBuffer
  //
  PDFJS.getDocument(url).then(function getPdfHelloWorld(_pdfDoc) {
    pdfDoc = _pdfDoc;
    renderPage(pageNum);
    refresh();
  });
}