function SensorAccessor(indexUrl, sensorloc) {
    // A Class for defining a controller object for plots
    
    //ui.catchError(ui, cache.getObject, ["http://www.cl.cam.ac.uk/~cce25/config.json"]).config;
    this.elecsensors = ui.catchError(ui, cache.getObject, [indexUrl]).sensors.elec;
    this.sensorlocation = sensorloc;
    
    
    this.getLatestReading = function(sensorurl){
        var indexentry = this.getIndexEntry(sensorurl);
        var sensorpath = indexentry.path.match(/^.*\//)[0];
        var key = "monthly-readings";
        var fullurl = this.sensorlocation+sensorpath+indexentry[key][0];
        //return getJson(fullurl);
        return ui.catchError(ui, cache.getObject, fullurl);
    };
    
    this.getEarliestReading = function(sensorurl){
        var indexentry = this.getIndexEntry(sensorurl);
        var sensorpath = indexentry.path.match(/^.*\//)[0];
        var key = "monthly-readings";
        var monthlyreadings = indexentry[key];
        //console.log(monthlyreadings);
        var fullurl = this.sensorlocation+sensorpath+monthlyreadings[monthlyreadings.length-1];
        return ui.catchError(ui, cache.getObject, fullurl);
    };
    
    this.getLatestReadingDate = function(sensorurl){
        var indexentry = this.getIndexEntry(sensorurl);
        var key = "monthly-readings";
        return indexentry[key][0].match(/[0-9]{4}-[0-9]{2}/)[0];
    };
    
    this.getEarliestReadingDate = function(sensorurl){
        var indexentry = this.getIndexEntry(sensorurl);
        var key = "monthly-readings";
        var monthlyreadings = indexentry[key];
        return monthlyreadings[monthlyreadings.length-1].match(/[0-9]{4}-[0-9]{2}/)[0];
    };
    
    this.getLatestAverage = function(sensorurl){
        var reading = this.getLatestReading(sensorurl);
        return this.getAverage(reading);
    };
    
    this.getMonthAverage = function(sensorurl, yearmonth){
        var indexentry = this.getIndexEntry(sensorurl);
        var file = this.checkReadingExists(sensorurl, yearmonth)
        if (indexentry != 0 && file != false){
            var sensorpath = indexentry.path.match(/^.*\//)[0];
            var key = "monthly-readings";
            var monthlyreadings = indexentry[key];
            //console.log(monthlyreadings);
            var fullurl = this.sensorlocation+sensorpath+file;
            //console.log(sensorurl);
            return this.getAverage(ui.catchError(ui, cache.getObject, fullurl));
        }
        else{
            return 0;
        }
    };
    
    this.getAverage = function(reading){
        var total = 0;
        for (var i=0; i<reading.data.length; i++){
            total += reading.data[i][1];
        }
        return (total / reading.data.length);
    };
    
    this.getIndexEntry = function(sensorurl){
        for (var i=0;i<this.elecsensors.length;i++){
            if (this.elecsensors[i].path == sensorurl){
                return this.elecsensors[i];
            }
        }
        return 0;
    };
    
    this.checkReadingExists = function(sensorurl,yearmonth){
        var indexentry = this.getIndexEntry(sensorurl);
        var key = "monthly-readings";
        var arr = indexentry[key];
        //if (arr == undefined) {return false;}
        var found = false;
        for (var i=0;i<arr.length;i++){
            if (yearmonth == arr[i].match(/[0-9]{4}-[0-9]{2}/)[0]){
                found = arr[i];
                break;
            }
        }
        return found;
    };
    
    this.getSensorPath = function(sensor){
        for (var i=0;i<this.elecsensors.length;i++){
            if (this.elecsensors[i].sensor === sensor){
                return this.elecsensors[i].path;
            }
        }
        return false;
    };
}