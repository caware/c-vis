function SensorAccessor(indexUrl) {
    // A Class for defining a controller object for plots
    
    var sensorindex = getJson(indexUrl);
    this.elecsensors = sensorindex.sensors.elec;
    
    
    this.getLatestReading = function(sensorurl){
        var indexentry = this.getIndexEntry(sensorurl);
        var sensorpath = indexentry.path.match(/^.*\//)[0];
        var key = "monthly-readings";
        var sensorurl = "http://www.cl.cam.ac.uk/meters"+sensorpath+indexentry[key][0];
        return getJson(sensorurl);
    };
    
    this.getEarliestReading = function(sensor){
        return 1;
    };
    
    this.getLatestReadingDate = function(sensorurl){
        var indexentry = this.getIndexEntry(sensorurl);
        var key = "monthly-readings";
        return indexentry[key][0].match(/[0-9]{4}-[0-9]{2}/)[0];
    };
    
    this.getEarliestReadingDate = function(sensor){
        return 1;
    };
    
    this.getLatestAverage = function(sensor){
        return 1;
    };
    
    this.getMonthAverage = function(sensor){
        return 1;
    };
    
    this.getIndexEntry = function(sensorurl){
        for (var i=0;i<this.elecsensors.length;i++){
            if (this.elecsensors[i].path == sensorurl){
                return this.elecsensors[i];
            }
        }
        return 0;
    };
}