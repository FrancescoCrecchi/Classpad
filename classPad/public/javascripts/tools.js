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
	  dCtx.setLineDash([]);
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
   	this.selectGroup;
   	this.rectangle;
   	this.rectPath;
   	var selArray = new Array();
    var upPoint;
    var pressed = false;
 	var dragging = false;
  	var mythis = this;
  	var startPoint;
  	var groupRef;

    //Event listeners
    
    this.onMouseDown = function(point){
      //check hitTest on Group items (if they exists) to drag and drop elements
      if(typeof mythis.selectGroup != "undefined" && mythis.selectGroup.hasChildren() && mythis.selectGroup.hitTest(new Point(point.x,point.y)) != false)
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
      else //start creating a new group
      {
		//deselect eventual paths selected
		if(typeof mythis.selectGroup != "undefined" && mythis.selectGroup.children.length > 0)
		{
	  		/*for(var i = 0; i < mythis.selectGroup.children.length; i++)
	    		mythis.selectGroup.children[i].selected = false;*/
	    	//deselect them
			var l = window.selector.selectGroup.children.length;
			for(var i = 0; i < l; i++)
				window.selector.selectGroup.children.pop(); 
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
		/*if(typeof mythis.rectPath != "undefined")
	  		mythis.rectPath.removeSegments();*/

		//in memory
		mythis.rectangle = new Rectangle({
			x: upPoint.x,
			y: upPoint.y,
			width: point.x - upPoint.x,
			height: point.y - upPoint.y
		});
		//on canvas
		clearCanvas(window.dCnvs);
		while(window.thisPage().drawed.length != 0)
			window.thisPage().drawed.pop();

		dCtx.setLineDash([]);
		loadCanvas(window.thisPage().PgArray,window.thisPage().drawed,dCtx);
		dCtx.strokeStyle = "blue";
		dCtx.lineWidth= 2;///window.pad.drwScope.view.zoom,
		dCtx.setLineDash([10,4]);
		dCtx.strokeRect(upPoint.x,upPoint.y,point.x - upPoint.x,point.y - upPoint.y);
      }
      else if(dragging)
      {
	  	var dlt = calculateDelta(point,startPoint);
	  	startPoint = new Point(startPoint.x + dlt.x, startPoint.y + dlt.y);
	  	console.log("DEVO TRANSLARE DI:" + dlt);
	  	mythis.selectGroup.translate(dlt);
	  	dCtx.setLineDash([]);
		//updating the thisPage().PgArray
		for(var i = 0; i < groupRef.length; i++)
	 		window.thisPage().PgArray[groupRef[i]] = mythis.selectGroup.children[i].toString(); //hope that works!
	 	clearCanvas(window.dCnvs);
		loadCanvas(window.thisPage().PgArray,window.thisPage().drawed,dCtx);
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
	    		//thisPath.selected = true;
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
	    		//thisPath.selected = true;
	    		//Adding path to the group
	    		mythis.selectGroup.addChild(thisPath);
	 		 }
		}
		//deleting the rectangle
		// mythis.rectPath.removeSegments();
		pressed = false;
      }
      else if(dragging)
      {
		//deselect
		//for(var i = 0; i < mythis.selectGroup.children.length; i++)
	  	//	mythis.selectGroup.children[i].selected = false;

	  	//deselect them
     	var l = window.selector.selectGroup.children.length;
      	for(var i = 0; i < l; i++)
        	window.selector.selectGroup.children.pop(); 
	
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
  }