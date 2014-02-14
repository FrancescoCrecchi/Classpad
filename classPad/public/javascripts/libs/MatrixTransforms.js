function Matrix(a, b, c, d, e, f) {
  this.a = a ? a : 1; // (1, 1)
  this.b = b ? b : 0; // (2, 1)
  this.c = c ? c : 0; // (1, 2)
  this.d = d ? d : 1; // (2, 2)
  this.e = e ? e : 0; // (1, 3)
  this.f = f ? f : 0; // (2, 3)
  // Last row is 0 0 1

  this.mul = function (m) {
    return      new Matrix(this.a * m.a + this.c * m.b,
                          this.b * m.a + this.d * m.b,
                          this.a * m.c + this.c * m.d,
                          this.b * m.c + this.d * m.d,
                          this.a * m.e + this.c * m.f + this.e,
                          this.b * m.e + this.d * m.f + this.f);
  };
  
  this.transform = function (ctx) { ctx.setTransform(this.a, this.b, this.c, this.d, this.e, this.f); };
  this.transformPoint = function (x, y) { 
    return { 'x': this.a * x + this.c * y + this.e, 'y': this.b * x + this.d * y + this.f }; }; 
}

var identity = new Matrix();

function createTranslateMatrix(tx, ty) { return new Matrix(1, 0, 0, 1, tx, ty); }
function createScaleMatrix(sx, sy) { return new Matrix(sx, 0, 0, sy, 0, 0); }
function createRotateMatrix(alpha) { return new Matrix(Math.cos(alpha), Math.sin(alpha), -Math.sin(alpha), Math.cos(alpha), 0, 0); }

function WorldTransform() {
  this.w2v = new Matrix();
  this.v2w = new Matrix();

  this. reset = function() {
    this.w2v = new Matrix();
    this.v2w = new Matrix();
  };

  this.transform = function (m, im) {
    this.w2v = m.mul(this.w2v);
    this.v2w = this.v2w.mul(im);
  };
  
  this.rotate = function (alpha) {
    this.transform(createRotateMatrix(alpha), createRotateMatrix(-alpha)); 
  };
  
  this.rotateAt = function (x, y, alpha) { 
    this.translate(-x, -y); //??????????????????????????????????
    this.rotate(alpha);
    this.translate(x, y);
  };

  this.translate = function (tx, ty) { 
    this.transform(createTranslateMatrix(tx, ty), createTranslateMatrix(-tx, -ty));
  };
  
  this.scale = function (sx, sy) { 
    this.transform(createScaleMatrix(sx, sy), createScaleMatrix(1/sx, 1/sy)); 
  };

  this.scaleAt = function(x,y,sx,sy){
    this.translate(-x,-y);    //??????????????????????????????????
    this.scale(sx,sy);
    this.translate(x,y);
  };
}