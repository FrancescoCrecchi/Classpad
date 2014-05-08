function multitouchInit() {
  var canvas = document.getElementById("paper");
  var sensor = listenTouch(canvas);
  var Abort = sensor.createFeature();
  sensor.defineFeature(Abort);
  var ab = new GroundTerm(Abort);
  
  // Attach a gesture to a sensor and detach it as soon as it is complete
  var trackNet = function (trackExpr){
    var net = trackExpr.toInternalGestureNet(sensor);
    net.addTokens([new Token()]);
  };

  //to track each finger separately
  var sameid = function (id){
    return function(e) { return e.identifier == id };
  };

  var draw = function(id){
    var tm1 = new GroundTerm(TouchFeature.TouchMove, sameid(id));
    var tu1 = new GroundTerm(TouchFeature.TouchUp, sameid(id));
    //bind
    tm1.gesture.add(returnViewPoint(window.activeTool.onMouseDrag));
    tu1.gesture.add(returnViewPoint(window.activeTool.onMouseUp));
    //Draw Net
    return new Choice([new Choice([new Iter(tm1), tu1]), ab]);
  };

  var pinch = function(id,sp1,ep1){
   var td2 = new GroundTerm(TouchFeature.TouchDown);
   var startP2,endP2;
   
   td2.gesture.add(returnViewPoint(function(point){
      startP2 = new Point(point.x, point.y);
      endP2 = startP2;
      sensor.trigger(Abort,{});
    }));
   td2.gesture.add(function(e){trackNet(bind_pinch(id,e.evt.identifier,{s1:sp1,s2:startP2,e1:ep1,e2:endP2}));});
   
   var tu1 = new GroundTerm(TouchFeature.TouchUp, sameid(id));
   
   return new Choice([td2, tu1]);
  }
  
  window.td1 = new GroundTerm(TouchFeature.TouchDown);
  //Start recognising the nets
  window.td1.gesture.add(function(e) {
    //attaching the draw net
    trackNet(draw(e.evt.identifier));
    
    // two fingers..
    returnViewPoint(function(point){
    var startP1 = new Point(point.x, point.y);
    var endP1 = startP1;
    //attaching the pinch net
    trackNet(pinch(e.evt.identifier,startP1,endP1));
    })(e);

  });
  window.td1.toGestureNet(sensor);

 //pinch functionality
 function bind_pinch(id1,id2,obj){
  
   var tm1 = new GroundTerm(TouchFeature.TouchMove, sameid(id1));
   var tm2 = new GroundTerm(TouchFeature.TouchMove, sameid(id2));
   var tu2 = new GroundTerm(TouchFeature.TouchUp, sameid(id2));
   
  
  tm1.gesture.add(returnViewPoint(function(point){
    obj.e1 = new Point(point.x,point.y);
    zoom(obj);
    obj.s1 = obj.e1;
  }));
  tm2.gesture.add(returnViewPoint(function(point){
    obj.e2 = new Point(point.x,point.y);
    zoom(obj);
    obj.s2 = obj.e2;
  }));
  
  return new Choice([new Iter(new Choice([tm1,tm2])),tu2]);  
 }

 //zoom
 function zoom(o){
   //console.log((o.s1).getDistance(o.s2));
   var sF = (o.e1).getDistance(o.e2) / (o.s1).getDistance(o.s2);
   //calculating the scale factor
   if((window.view.zoom * sF) < 1/5 || (window.view.zoom * sF) > 5)
    sF = 1;

   var mp1 = new Point((o.s2.x + o.s1.x)/2,(o.s2.y + o.s1.y)/2);
   var mp2 = new Point((o.e2.x + o.e1.x)/2,(o.e2.y + o.e1.y)/2);

   var sP = new Point(mp2.x - mp1.x, mp2.y - mp1.y);

   zoomAndPan(sF, sP);
  }

  sensor.listen(canvas, TouchFeature.TouchDown, 'mousedown');
  sensor.listen(canvas, TouchFeature.TouchUp, 'mouseup');
  sensor.listen(canvas, TouchFeature.TouchMove, 'mousemove');
}