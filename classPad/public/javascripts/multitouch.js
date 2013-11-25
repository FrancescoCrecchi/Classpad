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
    return new Choice([new Choice([new Iter(tm1), tu1]), ab]); // !!!!!!!!!!!!!!
  };

  var pinch = function(id,sp1,ep1){
   var td2 = new GroundTerm(TouchFeature.TouchDown);
   var startP2,endP2;
   
   td2.gesture.add(returnPagePoint(function(point){
     with(paper)
     {
        startP2 = new Point(point.x, point.y);
	endP2 = startP2;
        sensor.trigger(Abort,{});
     }
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
    
    with(paper)
    {
      returnPagePoint(function(point){
      var startP1 = new Point(point.x, point.y);
      var endP1 = startP1;
      //attaching the pinch net
      trackNet(pinch(e.evt.identifier,startP1,endP1));
      })(e);
    }
  });
  window.td1.toGestureNet(sensor);

 //pinch functionality
 function bind_pinch(id1,id2,obj){
   var tm1 = new GroundTerm(TouchFeature.TouchMove, sameid(id1));
   var tm2 = new GroundTerm(TouchFeature.TouchMove, sameid(id2));
   var tu2 = new GroundTerm(TouchFeature.TouchUp, sameid(id2));
   
  
  tm1.gesture.add(returnPagePoint(function(point){
    obj.e1 = new paper.Point(point.x,point.y);
    zoom(obj);
    obj.s1 = obj.e1;
  }));
  tm2.gesture.add(returnPagePoint(function(point){
    obj.e2 = new paper.Point(point.x,point.y);
    zoom(obj);
    obj.s2 = obj.e2;
  }));
  
  return new Choice([new Iter(new Choice([tm1,tm2])),tu2]);  
 }

 //zoom
 function zoom(o){
   with(paper){
     //calculating the scale factor
     window.scaleFactor = (o.e1).getDistance(o.e2) / (o.s1).getDistance(o.s2);
     //now we have to scale(zoom) the group by that value from a point that is in the middle of the ideal path from s1 to s2
     window.scalePoint = new paper.Point((o.s1.x - o.e1.x + o.s2.x - o.e2.x)/(2*paper.view.zoom),(o.s1.y - o.e1.y + o.s2.y - o.e2.y)/(2*paper.view.zoom));
     zoomAndPan(window.scaleFactor, window.scalePoint);
   }
 }
}