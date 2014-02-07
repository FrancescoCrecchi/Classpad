// My library consts by Groups, Paths and PDFs providing a binary three data structure
// in wich nodes are Groups and Paths/PDFs stay at the bottom, in the leaves.
// The entire document can be seen as a Group of Paths and PDFs.

/* function Node(){
	this.left = null;
	this.right = null;
	this.obj = null; //Obj (see above)
}
Node.prototype.addChild = function(o){ // i just need insertions
	if(this.left == null)
		this.left = o;
	else
		this.right = o;
}*/

// Path
function Path(props){
	this.points = new Array();
	this.strokeColor = props.strokeColor; //String
	this.strokeWidth = props.strokeWidth; //String
	this.blendMode = props.blendMode; 	 //String
	this.zoomFactor = props.zoomFactor;
	//this.selected = props.selected || false;
}
Path.prototype.add = function(point){
	this.points.push(point);
}
Path.prototype.contains = function(point){

	var i = 0;
	var found = false;

	while(this.points[i] && this.points[i+1] && !found)
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
	return found;
}
Path.prototype.move = function(deltaX,deltaY){
	for(var i=0; i < this.points.length; i++)
		this.points[i] = new Point(this.points[i].x + deltaX,this.points[i].y + deltaY);
}

//Point
function Point(x,y){
	this.x = x;
	this.y = y;
}
Point.prototype.getDistance = function(p){
	return Math.sqrt(((p.x - this.x)*(p.x - this.x)) + ((p.y - this.y)*(p.y - this.y)));
}

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
		this.children[i].move(delta.x,delta.y);
}

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
	this.bounds = props.bounds, // Rectangle
	this.zoom = props.zoomFactor || 1, //Number
	this.center = props.center,
	this.viewSize = { //init with the same dimensions of the canvas
		width: this.bounds.width,
		height: this.bounds.height
	}
}