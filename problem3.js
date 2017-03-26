const fs = require('fs') ,
      xml2js = require('xml2js'),
      geolib = require('geolib'),
      express = require('express');
var filename = '/data/Problem.gpx.xml';

var parser = new xml2js.Parser();

var app = express();
app.set('views' , __dirname);
app.set('view engine', 'ejs')
app.get('/', function(req, res){
  res.render('index');
});

app.get('/api/data' , function(req, res){
  createData(res);
});

app.listen(3000);
function createData(res){
  fs.readFile(__dirname + filename, function(err, data) {
    if(err)throw err;
    parser.parseString(data, function (err, result) {
      try{
  //       var json = JSON.stringify(result);
      }catch(e){
        console.error('Exception While parsing data to json');
        throw e;
      }

      var tracker = result.gpx.trk[0].trkseg[0].trkpt;
      var totalDistance = 0;
      var maxSpeed = 0;
      var startTime = Date.parse(tracker[0].time);
      var endTime = Date.parse(tracker[tracker.length-1].time);
      var elevationGained = 0 ;
      var activeTime = 0;
      var data = {
        maxLat: 0,
        minLat: Infinity,
        maxLon: 0,
        minLon: Infinity
      };
      for(var i =0 ; i<tracker.length; i++){
        data.maxLat = Math.max(data.maxLat , tracker[i].$.lat);
        data.minLat = Math.min(data.minLat , tracker[i].$.lat);
        data.maxLon = Math.max(data.maxLon , tracker[i].$.lon);
        data.minLon = Math.min(data.minLon , tracker[i].$.lon);
        if(i){

          var prevPt = tracker[i-1];
          var thisPt = tracker[i];

          var obj = {latitude: prevPt.$.lat , longitude: prevPt.$.lon , time: Date.parse(prevPt.time)};
          var obj2 = {latitude: thisPt.$.lat , longitude: thisPt.$.lon , time: Date.parse(thisPt.time)};
          var dist = geolib.getDistance(
              prevPt.$,
              thisPt.$
          );

          var speed = geolib.getSpeed(obj , obj2 );
          if(speed > maxSpeed){
            maxSpeed = speed;
          }

          var elevation = thisPt.ele - prevPt.ele;
          if(elevation >0){
            elevationGained+= elevation;
          }

          if(dist!==0){ // some distance travelled
            activeTime += (Date.parse(thisPt.time) - Date.parse(prevPt.time))/1000;
          }

          console.log(dist , typeof dist);
          totalDistance+=dist;

        }
       }
      var totalTime = (endTime - startTime)/1000;
      var averageSpeed =(totalDistance )/  (totalTime); // in meters per millisecond
      console.log('total distance is', totalDistance/1000 , ' kilometers');
      console.log('max speed is ', maxSpeed , ' km/h');
      console.log('average speed is ', averageSpeed  * 3.6, 'km/h' );
      console.log('elevation gained is ', elevationGained);
      console.log('total time is ', totalTime , ' seconds');
      console.log('active time is ', activeTime , ' seconds');
      res.json(data);
     });
  });
}
// fs.readFile(__dirname + filename, function(err, data) {
//   if(err)throw err;
//   parser.parseString(data, function (err, result) {
//     try{
// //       var json = JSON.stringify(result);
//     }catch(e){
//       console.error('Exception While parsing data to json');
//       throw e;
//     }
//
//     var tracker = result.gpx.trk[0].trkseg[0].trkpt;
//     var totalDistance = 0;
//     var maxSpeed = 0;
//     var startTime = Date.parse(tracker[0].time);
//     var endTime = Date.parse(tracker[tracker.length-1].time);
//     var elevationGained = 0 ;
//     var activeTime = 0;
//     for(var i =0 ; i<tracker.length; i++){
//       if(i){
//         var prevPt = tracker[i-1];
//         var thisPt = tracker[i];
//
//         var obj = {latitude: prevPt.$.lat , longitude: prevPt.$.lon , time: Date.parse(prevPt.time)};
//         var obj2 = {latitude: thisPt.$.lat , longitude: thisPt.$.lon , time: Date.parse(thisPt.time)};
//         var dist = geolib.getDistance(
//             prevPt.$,
//             thisPt.$
//         );
//
//         var speed = geolib.getSpeed(obj , obj2 );
//         if(speed > maxSpeed){
//           maxSpeed = speed;
//         }
//
//         var elevation = thisPt.ele - prevPt.ele;
//         if(elevation >0){
//           elevationGained+= elevation;
//         }
//
//         if(dist!==0){ // some distance travelled
//           activeTime += (Date.parse(thisPt.time) - Date.parse(prevPt.time))/1000;
//         }
//
//         console.log(dist , typeof dist);
//         totalDistance+=dist;
//
//       }
//      }
//     var totalTime = (endTime - startTime)/1000;
//     var averageSpeed =(totalDistance )/  (totalTime); // in meters per millisecond
//     console.log('total distance is', totalDistance/1000 , ' kilometers');
//     console.log('max speed is ', maxSpeed , ' km/h');
//     console.log('average speed is ', averageSpeed  * 3.6, 'km/h' );
//     console.log('elevation gained is ', elevationGained);
//     console.log('total time is ', totalTime , ' seconds');
//     console.log('active time is ', activeTime , ' seconds');
//    });
// });
