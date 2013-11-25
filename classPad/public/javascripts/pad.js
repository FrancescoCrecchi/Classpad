//Classes
function Pad(){
  this.Pages = new Array(); //array di pagine
  this.Pages[0] = new Page();
  this.currPg = 0;
  //Paper.js scopes
  this.bgdScope = new paper.PaperScope(); //background scope
  this.rcvScope = new paper.PaperScope(); //received scope
  this.drwScope = new paper.PaperScope(); //drawing scope
}
Pad.prototype.addPage = function(){
  this.Pages.push(new Page());
};

//Class
function Page(){
  //paper.Path
  this.drawed = new Array(); //array di path creati
  this.loaded = new Array(); //array di path caricati
  this.restored = new Array(); //array di path per il redo
  this.ofMaster = new Array(); //array di path ricevuti dal master
  this.background = new Array(); //array di path per lo sfondo
  //JSON Paths
  this.PgArray = new Array(); //array di Path per fwd/rwd
  this.saved = new Array(); //array di path per l'undo
  this.received = new Array(); //array di path ricevuti
}