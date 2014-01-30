function Pen(sColor,sWidth,blendMode){
	this.sC = sColor;
	this.sW = sWidth;
	this.bM = blendMode || "source-over"; //if blendMode is set use that else use "source-over" as default.
	var mythis = this;
	var pressed = false;
  
	//Event listener
	this.onMouseDown = function(point){
	  // GraphLib object 
	  window.thisPage().drawed.push(new Path({
	  	strokeColor: mythis.sC,
	  	strokeWidth: mythis.sW, ///window.pad.drwScope.view.zoom,
	  	blendMode: mythis.bM
	  }));
	  // Canvas
	  dCtx.beginPath(); //new Path()
	  dCtx.strokeStyle = mythis.sC;
	  dCtx.lineWidth = mythis.sW;
	  dCtx.globalCompositeOperation = mythis.bM;
	  dCtx.moveTo(point.x,point.y);
	  // setting pressed to true
	  pressed = true;
	}

	this.onMouseDrag = function(point){
	  if(pressed)
	  {
		//GraphLib
		window.thisPage().drawed.last().add(point);
		//Canvas elements
		dCtx.lineTo(point.x,point.y);
		dCtx.stroke();
		// say to not redraw!
		//window.toRedraw = false;
	  }
	}

	this.onMouseUp = function(){
	  //window.thisPage().drawed.last().simplify();
	  //paper.view.draw();
	  //undo/redo variabile
	  //window.iWasDrawing = true;
	  /*if(window.thisPage().drawed.length > 0)
	  {
				document.getElementById("undo").disabled = false;
				if($("#undo").hasClass("disabled"))
					$("#undo").removeClass("disabled");
	  }*/
	  //Save the page content
	  window.thisPage().PgArray.push(window.thisPage().drawed.last().toString()); //toString metod defined in helpers
	  //Close canvas path
	  dCtx.closePath();
	  pressed = false;
	}
}

function Selector(){
  /* this.selectGroup;
  this.rectangle;
  this.rectPath;
  var selArray = new Array();
  var upPoint;
  var pressed = false;
  var dragging = false;
  var mythis = this;
  var startPoint;
  var groupRef;
  
  with(paper) {
    //Event listeners
    
    this.onMouseDown = function(point){
      //check hitTest on Group items (if they exists)
      if(typeof mythis.selectGroup != "undefined" && mythis.selectGroup.hasChildren() && typeof mythis.selectGroup.hitTest(new Point(point.x,point.y)) != "undefined")
      {
	//saving the startPoint
	startPoint = new Point(point.x,point.y);
	//i have to remember that translation!
	groupRef = new Array();
	for(var i = 0; i < window.selector.selectGroup.children.length; i++)
	{
	  var thisPath = window.selector.selectGroup.children[i];
	  groupRef.push(window.thisPage().PgArray.getIndexOf(thisPath.toString())); //pushing the index
	}
	//i'm dragging!
	dragging = true;
	pressed = false;
      }
      else
      {
	//deselect eventual paths selected
	if(typeof mythis.selectGroup != "undefined" && mythis.selectGroup.children.length > 0)
	{
	  for(var i = 0; i < mythis.selectGroup.children.length; i++)
	    mythis.selectGroup.children[i].selected = false; 
	}
	
	mythis.selectGroup = new Group();
	upPoint = new Point(point.x,point.y);
	pressed = true;
	dragging = false;
      }
    }
    
    this.onMouseDrag = function(point){
      if(pressed)
      {
	if(typeof mythis.rectPath != "undefined")
	  mythis.rectPath.removeSegments();
	mythis.rectangle = new Rectangle(upPoint,new Point(point.x,point.y));
	mythis.rectPath = new Path.Rectangle({
	rectangle: mythis.rectangle,
	strokeColor: "blue",
	strokeWidth: 2/window.pad.drwScope.view.zoom,
	dashArray: [10,4]
	});
      }
      else if(dragging)
      {
	  var dlt = calculateDelta(point,startPoint);
	  startPoint = new Point(startPoint.x + dlt.x, startPoint.y + dlt.y);
	  mythis.selectGroup.translate(dlt);
      }
    }
    
    this.onMouseUp = function(){
      if(pressed)
      {
	//grouping contained paths
	//listing drawed paths
	for(var i = 0; i < window.thisPage().drawed.length; i++)
	{
	  var thisPath = window.thisPage().drawed[i];
	  if(isIn(thisPath,mythis.rectangle))
	  {
	    thisPath.selected = true;
	    //Adding path to the group
	    mythis.selectGroup.addChild(thisPath);
	  }
	}
	//listing loaded paths
	for(var i = 0; i < window.thisPage().loaded.length; i++)
	{
	  var thisPath = window.thisPage().loaded[i];
	  if(isIn(thisPath,mythis.rectangle) && thisPath.blendMode != "destination-out")
	  {
	    thisPath.selected = true;
	    //Adding path to the group
	    mythis.selectGroup.addChild(thisPath);
	  }
	}
	//deleting the rectangle
	mythis.rectPath.removeSegments();
	pressed = false;
      }
      else if(dragging)
      {
	//updating the thisPage().PgArray
	for(var i = 0; i < groupRef.length; i++)
	  window.thisPage().PgArray[groupRef[i]] = mythis.selectGroup.children[i].toString(); //hope that works!
	//deselect
	for(var i = 0; i < mythis.selectGroup.children.length; i++)
	  mythis.selectGroup.children[i].selected = false;
	
	//empting the groupref array
	var len = groupRef.length;
	for(var i = 0; i < len; i++)
	  groupRef.pop();
	
	mythis.selectGroup.onMouseUp = null;
	mythis.selectGroup.onMouseDrag = null;
	//rebinding selec tool
	bind2(window.selector); 
	dragging = false;
      }
    }
  }*/
}