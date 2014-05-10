//Point
function Point(x,y){
	this.x = x;
	this.y = y;
}
Point.prototype.getDistance = function(p){
	return Math.sqrt(((p.x - this.x)*(p.x - this.x)) + ((p.y - this.y)*(p.y - this.y)));
}

Point.prototype.getDistanceAlongAxes = function(p){
	return {
		x: (p.x - this.x),
		y: (p.y - this.y)
	};
}

//help functionality to get the convex hull algo to work
Point.prototype.toArray = function(){
	return [this.x,this.y];
}


// Path
function Path(props){
	this.points = props.points || [];
	this.strokeColor = props.strokeColor; //String
	this.strokeWidth = props.strokeWidth; //String
	this.blendMode = props.blendMode || "source-over"; 	 //String
	//this.selected = props.selected || false;
}
Path.prototype.add = function(point){
	this.points.push(point);
}
Path.prototype.contains = function(point){

	var i = 0;
	var found = false;

	/*while(this.points[i] && this.points[i+1] && !found)
	{
		//si tratta di determinare se il punto appartiene o meno alla retta passante per due punti consecutivi
		function testPointContained(p1,p2,pTest){
			if((p2.y - p1.y)/(p2.x - p1.x)*(pTest.x - p1.x) + p1.y - pTest.y == 0)
				return true;
			else
				return false;
		}

		//check the stroked point so i have to check even more other two points!
		if(testPointContained(this.points[i],this.points[i+1],point) || testPointContained(this.points[i],this.points[i+1],new Point(point.x + this.strokeWidth,point.y + this.strokeWidth)) || testPointContained(this.points[i],this.points[i+1], new Point(point.x - this.strokeWidth,point.y - this.strokeWidth)))
			found = true;
		i++;
	}
	return found;*/
	while(this.points[i] && !found)
	{
		if(this.points[i].getDistance(point) < (this.strokeWidth*3)) //*3 cause the touch point is not precise as the mouse input
			found = true;
		i++;
	}
	return found;
}
Path.prototype.move = function(deltaX,deltaY){
	for(var i=0; i < this.points.length; i++)
		this.points[i] = new Point(this.points[i].x + deltaX,this.points[i].y + deltaY);
}

//Overload toString methods to obtain a JSON string
Path.prototype.toString = function () {
  return JSON.stringify(this);
};

//PDF
function PDF(){
	this.url = null; //String
	this.lenght = null; //Integer
	this.numPage = null; //Integer
}

// Group
function Group(){
	this.children = new Array(); //array of Paths
}
Group.prototype.hasChildren = function(){
	if(this.children.length > 0)
		return true;
	else
		return false;
}

Group.prototype.addChild = function(path){
	this.children.push(path);
}
Group.prototype.hitTest = function(point){
  	var i = 0;
  	var found = false;

  	while(this.children[i] && !found)
  	{
		found = this.children[i].contains(point); 
		i++;
  	}
  	return found;  
}
Group.prototype.translate = function(delta){
	for(var i = 0; i < this.children.length; i++)
		{
			/*//create a temp copy of the object
			var p = new Path({
				points: this.children[i].points.slice(),
				strokeColor: this.children[i].strokeColor,
				strokeWidth: this.children[i].strokeWidth,
				blendMode: this.children[i].blendMode
			});*/
			var p = this.children[i];
			//translate by delta each point
			p.move(delta.x,delta.y);
			//append the new path at the end of the group
			//this.addChild(p);
			//append the new path to the PgArray (JSON)
			//window.thisPage().PgArray.push(p.toString());
			//deleting the old version from the PgArray
			//window.thisPage().PgArray.remove(this.children[i].toString());
			//remove the old version of the path
			//this.children.remove(this.children[i]);
		}
}

//implementing the convex hull algorithm
Group.prototype.getBounds = function(){
	//commodity functions
	function getDistant(cpt, bl) {
    	var Vy = bl[1][0] - bl[0][0];
    	var Vx = bl[0][1] - bl[1][1];
    	return (Vx * (cpt[0] - bl[0][0]) + Vy * (cpt[1] -bl[0][1]))
	}


	function findMostDistantPointFromBaseLine(baseLine, points) {
    	var maxD = 0;
    	var maxPt = new Array();
    	var newPoints = new Array();
    	for (var idx in points) {
        	var pt = points[idx];
        	var d = getDistant(pt, baseLine);
        
        	if ( d > 0) {
           		newPoints.push(pt);
        	} else {
            	continue;
        	}
        
        	if ( d > maxD ) {
            	maxD = d;
            	maxPt = pt;
        	}
    	} 
   		return {'maxPoint':maxPt, 'newPoints':newPoints}
	}

	//recursive quickhull algo
	var allBaseLines = new Array();
	function buildConvexHull(baseLine, points) {
	    
	    allBaseLines.push(baseLine)
	    var convexHullBaseLines = new Array();
	    var t = findMostDistantPointFromBaseLine(baseLine, points);
	    if (t.maxPoint.length) // if there is still a point "outside" the base line
	    { 
	    	convexHullBaseLines = convexHullBaseLines.concat(buildConvexHull( [baseLine[0],t.maxPoint], t.newPoints));
	    	convexHullBaseLines = convexHullBaseLines.concat(buildConvexHull( [t.maxPoint,baseLine[1]], t.newPoints));
	        return convexHullBaseLines;
	    } else {  // if there is no more point "outside" the base line, the current base line is part of the convex hull
	        return [baseLine];
	    }    
	}

	function getConvexHull(points) {
	    //find first baseline
	    var maxX, minX;
	    var maxPt, minPt;
	    for (var idx in points) {
	        var pt = points[idx];
	        if (pt[0] > maxX || !maxX) {
	            maxPt = pt;
	            maxX = pt[0];
	        }
	        if (pt[0] < minX || !minX) {
	            minPt = pt;
	            minX = pt[0];
	        }
	    }
	    var ch = [].concat(buildConvexHull([minPt, maxPt], points),
	                       buildConvexHull([maxPt, minPt], points))
	    return ch;
	}

	//getting the points on the perimeter of the convex hull of the group
	var pts = []; //ALL POINTS ARE IN WORLD COORDINATES
	for(var i=0; i < this.children.length; i++)
	 pts = pts.concat(this.children[i].points.slice());
	for(var i=0; i < pts.length; i++)
	 pts[i] = pts[i].toArray();
	//getting the convex hull on the perimeter of the group!
	var perimeter = getConvexHull(pts);
	//try to represent that perimeter!
	//perimeter is an array of 2 points (i think segments)
	var PtsPerimeter = [];
	for(var i = 0; i < perimeter.length; i++)
	{
		var pnts = [];
		for(var j = 0; j < perimeter[i].length; j++)
			pnts.push(new Point(perimeter[i][j][0],perimeter[i][j][1]));

		/*var p = new Path({
		points: pnts,
		strokeColor : "orange",
		strokeWidth : 5
		});
		
		drawPath(p,window.dCtx);*/
		PtsPerimeter = PtsPerimeter.concat(pnts);
	}
	//in PtsPerimeter now i should find the points of the convex hull polygon that i have to transform into a rectangle
	var min = new Point(1000000,1000000),
		max = new Point(-1,-1);
	for(var i = 0; i < PtsPerimeter.length; i++)
	{	
		var p = PtsPerimeter[i];
		if(p.x < min.x)
			min.x = p.x;
		if(p.y < min.y)
			min.y = p.y;
		if(p.x > max.x)
			max.x = p.x;
		if(p.y > max.y)
			max.y = p.y;
	}
	//now i should have into the max & min points the two points of the diagonal of the rects so
	/*window.dCtx.strokeStyle = "purple";
	window.dCtx.strokeRect(min.x,min.y,max.x - min.x, max.y - min.y);*/
	return new Rectangle({
		x: min.x,
		y: min.y,
		width: max.x - min.x, 
		height: max.y - min.y
	});
};

//fitbounds method, rect in View coordinates
Group.prototype.fitBounds = function(rectangle){

	/*window.dCtx.strokeWidth = 3;
	window.dCtx.strokeStyle = 'red';
	window.dCtx.strokeRect(rectangle.x,rectangle.y,rectangle.width,rectangle.height);
*/
	//obtaining bounds of the group of paths in WORLD coordinates
	var bounds = this.getBounds();

	/*window.dCtx.strokeStyle = 'green';
	window.dCtx.strokeRect(bounds.x,bounds.y,bounds.width,bounds.height);
*/
	//calculating ratios
	/*var sF = Math.min(rectangle.width / bounds.width, rectangle.height / bounds.height);*/
	var itemRatio = bounds.height / bounds.width,
		rectRatio = rectangle.height / rectangle.width,
		scale = (itemRatio < rectRatio) ? rectangle.width / bounds.width : rectangle.height / bounds.height;
	var sF = scale;

	var gCenter = new Point(bounds.x + bounds.width/2,bounds.y + bounds.height/2);
	var rCenter = new Point(rectangle.x + rectangle.width/2,rectangle.y + rectangle.height/2);
	/*var vgCenter = W.w2v.transformPoint(gCenter.x,gCenter.y);
	var vrCenter = W.w2v.transformPoint(rCenter.x,rCenter.y);*/

	var sP = new Point(rCenter.x - gCenter.x, rCenter.y - gCenter.y);
	sP = W.w2v.transformDistance(sP.x,sP.y);

  	//transorm matrix
  	W.translate(sP.x,sP.y);

  	W.w2v.transform(window.bCtx);
	W.w2v.transform(window.mCtx);
 	W.w2v.transform(window.dCtx);

  	transformView(sF,new Point(0,0));
};


// Rectangle
function Rectangle(props){
	this.x = props.x;
	this.y = props.y;
	this.width = props.width;
	this.height = props.height;
}
Rectangle.prototype.contains = function(point){
	var x = point.x,
		y = point.y;
	return x >= this.x && y >= this.y
		&& x <= this.x + this.width
		&& y <= this.y + this.height;
}

//View
function View(props){
	this.canvas = props.canvas;
	this.worldBounds = props.worldBounds,
	this.worldCenter = props.worldCenter,
	this.zoom = props.zoomFactor || 1 //Number
}

View.prototype.getViewBounds = function(){
	var XY = W.w2v.transformPoint(this.worldBounds.x,this.worldBounds.y);
	var WH = W.w2v.transformDistance(this.worldBounds.width,this.worldBounds.height);
	return bounds = new Rectangle({
		x: XY.x,
		y: XY.y,
		width: WH.x,
		height: WH.y
	});
}

View.prototype.getViewCenter = function(){
	var vBnds = this.getViewBounds();
	return new Point(vBnds.x + vBnds.width/2, vBnds.y + vBnds.height/2);
}

//Image
function URLImage(props){
	this.URL = props.URL;
	this.topLeft = props.topLeft;
	this.bottomRight = props.bottomRight;
}
URLImage.prototype.insertInCtx = function(ctx){
	var mythis = this;
	var img = new Image();
	img.src = this.URL;
	img.onload = function(){
		var delta = mythis.topLeft.getDistanceAlongAxes(mythis.bottomRight);
		ctx.drawImage(img,mythis.topLeft.x,mythis.topLeft.y,delta.x,delta.y);
	};
};

//Overload toString methods to obtain a JSON string
URLImage.prototype.toString = function () {
  return JSON.stringify(this);
};