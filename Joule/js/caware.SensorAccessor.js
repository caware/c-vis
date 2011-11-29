function SensorAccessor(indexUrl, sensorloc) {
    // A Class for defining a controller object for plots
    
    //var sensorindex = getJson(indexUrl);
    this.elecsensors = getJson(indexUrl).sensors.elec;
    this.sensorlocation = sensorloc;
    
    
    this.getLatestReading = function(sensorurl){
        var indexentry = this.getIndexEntry(sensorurl);
        var sensorpath = indexentry.path.match(/^.*\//)[0];
        var key = "monthly-readings";
        var fullurl = this.sensorlocation+sensorpath+indexentry[key][0];
        return getJson(fullurl);
    };
    
    this.getEarliestReading = function(sensorurl){
        var indexentry = this.getIndexEntry(sensorurl);
        var sensorpath = indexentry.path.match(/^.*\//)[0];
        var key = "monthly-readings";
        var monthlyreadings = indexentry[key];
        console.log(monthlyreadings);
        var fullurl = this.sensorlocation+sensorpath+monthlyreadings[monthlyreadings.length-1];
        return getJson(fullurl);
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
            return this.getAverage(getJson(fullurl));
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
        var found = false;
        for (var i=0;i<arr.length;i++){
            if (yearmonth == arr[i].match(/[0-9]{4}-[0-9]{2}/)[0]){
                found = arr[i];
                break;
            }
        }
        return found;
    };
}