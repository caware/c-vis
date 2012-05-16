function SensorAccessor(indexUrl, sensorloc, config) {
    // A Class for defining a controller object for plots
    
    //ui.catchError(ui, cache.getObject, ["http://www.cl.cam.ac.uk/~cce25/config.json"]).config;
    this.elecsensors = ui.catchError(ui, cache.getObject, [indexUrl]).sensors.elec;
    this.sensorlocation = sensorloc;
    this.config = config;
    this.diffObj = {};
    
    
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
    
    this.checkReadingExists = function(sensorurl,yearMonth){
        var indexentry = this.getIndexEntry(sensorurl);
        var key = "monthly-readings";
        var arr = indexentry[key];
        //if (arr == undefined) {return false;}
        var found = false;
        for (var i=0;i<arr.length;i++){
            if (yearMonth == arr[i].match(/[0-9]{4}-[0-9]{2}/)[0]){
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
    
    this.getMissingMonitored = function(yearMonth){
        if (this.diffObj[yearMonth]) return this.diffObj[yearMonth];
        var overall = [];
        var monitored = [];
        for(var sen in this.elecsensors){
            if (this.elecsensors.hasOwnProperty(sen)){
                var sense = this.elecsensors[sen];
                var ignoreSensor = false;
                
                for(var ig in this.config.sensorNoAverage.value){
                    if (sense.sensor === this.config.sensorNoAverage.value[ig]){
                        ignoreSensor = true;
                    }
                }
                
                for(var ig in this.config.sensorIgnore.value){
                    if (sense.sensor === this.config.sensorIgnore.value[ig]){
                        ignoreSensor = true;
                    }
                }
                
                if (!ignoreSensor){ 
                    var key = "monthly-readings";
                    var found = false;
                    for (var i=0;i<sense[key].length;i++){
                        if (yearMonth == sense[key][i].match(/[0-9]{4}-[0-9]{2}/)[0]){
                            found = sense[key][i];
                            break;
                        }
                    }
                    if(found){
                        //console.log(found);
                        var sensorpath = sense.path.match(/^.*\//)[0];
                        var fullurl = this.sensorlocation+sensorpath+found;
                        //console.log(fullurl);
                        var file = ui.catchError(ui, cache.getObject, fullurl);
                        
                        if (sense.sensor === "S-m36"){
                            for(var d in file.data){
                                if (file.data.hasOwnProperty(d)){
                                    overall.push({"x":file.data[d][0], "y":file.data[d][1]})
                                }
                            }
                        }
                        else if (sense.sensor !== "S-m257"){
                            for(var d in file.data){
                                if (file.data.hasOwnProperty(d)){
                                    var alreadyHere = false
                                    for (var m in monitored){
                                        if (monitored.hasOwnProperty(m)){
                                            if (monitored[m].x === file.data[d][0]){
                                                monitored[m].y += file.data[d][1];
                                                alreadyHere = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (!alreadyHere){
                                        monitored.push({"x":file.data[d][0], "y":file.data[d][1]});
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        //console.log(overall);  
        //console.log(monitored);
        var diff = [];
        for (var m in monitored){
            if (monitored.hasOwnProperty(m)){
                for (var o in overall){
                    if (overall.hasOwnProperty(o)){
                        if (overall[o].x === monitored[m].x){
                            var diffY = overall[o].y - monitored[m].y;
                            diff.push({"x":overall[o].x, "y":diffY});
                            break;
                        }
                    }
                }
            }
        }
        this.diffObj[yearMonth] = diff;
        return diff;
    };
}