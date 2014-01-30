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

// Objs
function Path(props){
	this.points = new Array();
	this.strokeColor = props.strokeColor; //String
	this.strokeWidth = props.strokeWidth; //String
	this.blendMode = props.blendMode; 	 //String
}
Path.prototype.add = function(point){
	this.points.push(point);
}

function Point(x,y){
	this.x = x;
	this.y = y;
}


function PDF(){
	this.url = null; //String
	this.lenght = null; //Integer
	this.numPage = null; //Integer
}

function Group(){
	this.elements = new Array(); //array of Paths
}