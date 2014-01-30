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
    tm1.gesture.add(returnPagePoint(window.activeTool.onMouseDrag)); // ?????????????????????????????????
    tu1.gesture.add(returnPagePoint(window.activeTool.onMouseUp)); // ?????????????????????????????????
    //Draw Net
    return new Choice([new Choice([new Iter(tm1), tu1]), ab]);
  };

  window.td1 = new GroundTerm(TouchFeature.TouchDown);
  //Start recognising the nets
  window.td1.gesture.add(function(e){
    //attaching the draw net
    trackNet(draw(e.evt.identifier));
    //attaching the pinch net
    //trackNet(pinch(e.evt.identifier,point.x,point.y));
    //}
  });
  //binding draw
  //window.td1.gesture.add(returnPagePoint(window.activeTool.onMouseDown));
  window.td1.toGestureNet(sensor);
}