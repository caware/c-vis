function WeatherJSONBridge(url) {
  if (url) { this.tempurl = url; }
  else this.tempurl = 'http://www.cl.cam.ac.uk/research/dtg/weather/daily-text.cgi?'
  this.getTemp = function (tempdate){
    var readobj = {
      "resource":"Temperature",
      "units":null,
      "description":"Outside temperature at the CL",
      "data":[]
    }
    
    theurl = this.tempurl+tempdate;
    var readings = $.ajax({ type: "GET", url: theurl,async: false }).responseText.split('\n');
    readobj.units = readings[7].split('\t')[1];
    for (i=8; i<readings.length-1;i++){
      var reading = readings[i].split('\t')[1];
      var time = readings[i].split('\t')[0].split(':');
      
      var da = tempdate.split('-');
      var year = parseInt(da[0], 10);
      var month = parseInt(da[1], 10);
      var day = parseInt(da[2], 10);
      var hour = parseInt(time[0], 10);
      var min = parseInt(time[1], 10);
      
      var dateobj = new Date(year,month,day,hour,min);
      readobj.data.push([dateobj,reading]);
    }
    
    return readobj;
  };
}