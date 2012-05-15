function PlotController(config, useri, weather) {
    // A Class for defining a controller object for plots
    
    this.autoFilter = config.autoFilter.value;
    this.weather = weather;
    this.ui = useri;
    this.plotarray = new Array();
    this.maxplots = config.maxNumberPlots.value;
    this.badUrls = [];
    
    this.viewrange = {"startdate":new Date(),"enddate":new Date()};
    
    var sensorindex = ui.catchError(ui, cache.getObject, config.indexUrl.value);
    
    
    this.getPlots = function(){
        return this.plotarray;
    };
    
    this.getColourByUrl = function(ploturl){
        for (var i in this.plotarray){
            if (this.plotarray.hasOwnProperty(i)){
                if (ploturl.compare(this.plotarray[i].url)){
                    found = true;
                    return this.plotarray[i].colour;
                    break;
                }
            }
        }
        //if (!found) return -1;
        //else if (found) return 1;
    };
    
    this.updateAvgSelected = function(ploturl, avgsel){
        for (var i in this.plotarray){
            if (this.plotarray.hasOwnProperty(i)){
                if (ploturl.compare(this.plotarray[i].url)){
                    found = true;
                    this.plotarray[i].avgselected = avgsel;
                    break;
                }
            }
        }
        if (!found) return -1;
        else if (found) return 1;
    };
    
    this.updateAvgByIndex = function (id, avgsel){
        this.plotarray[id].avgselected = avgsel;
    };
    
    this.togglePlotByUrl = function(sensorurl){
        // Adds a new plot to the store from an array of ploturls
        //var todaydate = new Date();
        //console.log(sensorurl);
        //var year = this.viewrange.startdate.getFullYear();
        //var month = (this.viewrange.startdate.getMonth()+1);
        //if (month<10) month = "0"+month;
        
        //var endyear = this.viewrange.enddate.getFullYear();
        //var endmonth = (this.viewrange.enddate.getMonth()+1);
        //if (endmonth<10) endmonth = "0"+endmonth;
        
        var elecsensors = sensorindex.sensors.elec;
        //var valid = false;
        
        var monthread = 'monthly-readings';
        
        
        var year, month, endyear, endmonth;
        
        var startmax, endmax;
        
        //console.log(sensorurl);
        for(var i=0;i<elecsensors.length;i++){
            for(var z=0;z<sensorurl.length;z++){
        //        //console.log(elecsensors[i].path);
        //        //console.log(sensorurl[z]);
                if (elecsensors[i].path == sensorurl[z]){
                    var key = "monthly-readings";
                    var recentreading = elecsensors[i][key][0];
                    var endmax = elecsensors[i][key][0].match(/[0-9]{4}-[0-9]{2}/)[0];
                    var tmplen = elecsensors[i][key].length-1;
                    var startmax = elecsensors[i][key][tmplen].match(/[0-9]{4}-[0-9]{2}/)[0];
                    //console.log(recentreading);
                    //var recentyear = recentreading.slice(7,11);
                    var mymatch = recentreading.match(/-[0-9]{4}-[0-9]{2}/)[0];
                    var recentyear = mymatch.slice(1,5);
                    var recentmonth = mymatch.slice(6,8);
                    //var recentmonth = recentreading.match(/-[0-9]{4}/-);
                    
                    year = recentyear;
                    month = recentmonth;
                    endyear = recentyear;
                    endmonth = recentmonth;
                    //console.log(year.toString());
                    //console.log(endyear.toString());
                    //console.log(month.toString());
                    //console.log(endmonth.toString());
                }
            }
        }
        
        
        //if (!valid){
        //    //console.log('No data!');
        //return -1;
        //}
        
        ploturl = [];
        for (var x=0; x<sensorurl.length; x++){
            ploturl[x] = config.sensorFilesUrl.value+sensorurl[x];
        }
        
        var plotline = {"id":0,"url":ploturl,"description":"","sensor":sensorurl,
                        "startmonth":month.toString(), "startyear":year.toString(),
                        "endmonth":endmonth.toString(), "endyear":endyear.toString(),
                        "startmonthyear":month.toString()+'-'+year.toString(),
                        "endmonthyear":endmonth.toString()+'-'+endyear.toString(),
                        "startmax":startmax, "endmax":endmax,
                        "colour":colourpool.getColour(sensorurl), "sensor":"Sensor", "room":"Room",
                        "circuit":"Circuit", "avgselected":10.0,
                        "avgtotal":15.0, "totalenergy":20.0,
                        "maxtime":0, "mintime":0,
                        "maxenergy":0.0, "minenergy":0.0,
                        "data":new Array()}
        var found = false;
        
        //console.log(plotline);
        
        //return -1;
        
        for (var i in this.plotarray){
            if (this.plotarray.hasOwnProperty(i)){
                if (cmpArray(plotline.url, this.plotarray[i].url)){
                    found = true;
                    this.plotarray.splice(i,1);
                    //console.log("Removed: "+plotline.url);
                    break;
                }
            }
        }
        
        if (!found){
            if (this.plotarray.length == this.maxplots){
                //console.log("Maximum amount of plots already drawn.");
            }
            else {
                this.plotarray.push(plotline);
                //Get starting dates from first plot in array, and iterate to find the earliest / latest dates.
                var tmpstart = new Date.parse(this.plotarray[0].startyear+"-01-"+this.plotarray[0].startmonth);
                var tmpend = new Date.parse(this.plotarray[0].endyear+"-01-"+this.plotarray[0].endmonth);
                
                for (var p in this.plotarray){
                    if (this.plotarray.hasOwnProperty(p)){
                        //console.log(this.plotarray);
                        var plotstart = new Date.parse(this.plotarray[p].startyear+"-01-"+this.plotarray[p].startmonth);
                        var plotend = new Date.parse(this.plotarray[p].endyear+"-01-"+this.plotarray[p].endmonth);
                        
                        //for (var p in tmpstart){
                        //    if (this.plotarray.hasOwnProperty(p)){
                        //        console.log(tmpstart.p);
                        //    }
                        //}
                        
                        //console.log(tmpstart);
                        //console.log(tmpend);
                        if (plotstart.isBefore(tmpstart)){
                            tmpstart = Date.parse(this.plotarray[p].startyear+"-01-"+this.plotarray[p].startmonth);
                        }
                        if (plotend.isAfter(tmpend)){
                            tmpend = Date.parse(this.plotarray[p].endyear+"-01-"+this.plotarray[p].endmonth);
                        }
                    }
                }
                //console.log("Start: "+tmpstart);
                //console.log("End: "+tmpend);
                
                this.viewrange.startdate = tmpstart;
                this.viewrange.enddate = tmpend;
                
                for (var p in this.plotarray){
                    if (this.plotarray.hasOwnProperty(p)){
                        //make start max into data before isbefore stuff.
                        var tmpstartmax = Date.parse(this.plotarray[p].startmax.slice(0,4)+"-01-"+this.plotarray[p].startmax.slice(5,7));
                        var tmpendmax = Date.parse(this.plotarray[p].endmax.slice(0,4)+"-01-"+this.plotarray[p].endmax.slice(5,7));
                        //console.log(tmpstartmax);
                        //console.log(tmpendmax);
                        if (tmpstartmax.isBefore(this.viewrange.startdate)){
                            //If the sensors history goes back further than the view range, use the viewrange as the start
                            //console.log("sensor has more history data than view");
                            this.plotarray[p].startyear = this.viewrange.startdate.getFullYear().toString();
                            this.plotarray[p].startmonth = this.viewrange.startdate.getMonth()+1;
                            this.plotarray[p].startmonth = this.plotarray[p].startmonth.toString();
                        }
                        else {
                            //Else, use the sensor's earliest data set
                            //console.log("sensor has less data than view, restricting start data to last possible.");
                            this.plotarray[p].startyear = tmpstartmax.getFullYear().toString();
                            this.plotarray[p].startmonth = tmpstartmax.getMonth()+1;
                            this.plotarray[p].startmonth = this.plotarray[p].startmonth.toString();
                        }
                        if (tmpendmax.isAfter(this.viewrange.enddate)){
                            //If the sensors most recent data is after the viewport, use the viewport as the end point
                            //console.log("sensor has more current data than view");
                            this.plotarray[p].endyear = this.viewrange.enddate.getFullYear().toString();
                            this.plotarray[p].endmonth = this.viewrange.enddate.getMonth()+1;
                            this.plotarray[p].endmonth = this.plotarray[p].endmonth.toString();
                        }
                        else {
                            //Else, use the most recent data availible from the sensor.
                            //console.log("sensor has less data than view, restricting start data to earliest possible.");
                            this.plotarray[p].endyear = tmpendmax.getFullYear().toString();
                            this.plotarray[p].endmonth = tmpendmax.getMonth()+1;
                            this.plotarray[p].endmonth = this.plotarray[p].endmonth.toString();
                        }
                    }
                }
            }
        }
        
        if (this.plotarray.length == 0) return 0;
        else {
            for (var p in this.plotarray){
                if (this.plotarray.hasOwnProperty(p)){
                    this.plotarray[p].id = p;
                }
            }
            return this.plotarray;
        }
    };
    
    this.getPlotByUrl = function(ploturl){
        // Gets a new plot from the store
        return false;
    };
    
    this.replacePlotByUrl = function(plot){
        // Replaces a plot already in the store.
        return false;
    };
    
    this.addMonth = function(){
        //
        this.viewrange.startdate = new Date(this.viewrange.startdate).addMonths(-1);
        //console.log(this.viewrange.startdate);
        var noDataPlotCount = 0;
        var noDataSensors = [];
        //this.badUrls = [];
        
        for (var p in this.plotarray){
            if (this.plotarray.hasOwnProperty(p)){
                //this.plotarray[p].startyear = this.viewrange.startdate.getFullYear().toString();
                var tmpmonth = (this.viewrange.startdate.getMonth()+1); // get current month
                //console.log(tmpmonth);
                if (tmpmonth < 10) tmpmonth = "0"+tmpmonth;
                //this.plotarray[p].startmonth = tmpmonth.toString();
                
                //FIXME: Shouldn't need this!
                //this.plotarray[p].startmonthyear = tmpmonth.toString()+'-'+this.viewrange.startdate.getFullYear().toString();
                
                //console.log(this.plotarray[p]);
                
                
                for (var u=0; u< this.plotarray[p].url.length; u++){
                    var noDataCount = 0;
                    var tmpstr = this.plotarray[p].url[u].substring(30);
                    //console.log(tmpstr);
                    //console.log(this.viewrange.startdate.getFullYear().toString()+'-'+tmpmonth.toString());
                    if (sensorAccess.checkReadingExists(tmpstr, this.viewrange.startdate.getFullYear().toString()+'-'+tmpmonth.toString())){
                        //console.log("Reading OK");
                        //at least one URL has data for the month so extend the plot date.
                        this.plotarray[p].startyear = this.viewrange.startdate.getFullYear().toString();
                        //var tmpmonth = (this.viewrange.startdate.getMonth()+1);
                        //if (tmpmonth < 10) tmpmonth = "0"+tmpmonth;
                        this.plotarray[p].startmonth = tmpmonth.toString();
                        this.plotarray[p].startmonthyear = tmpmonth.toString()+'-'+this.viewrange.startdate.getFullYear().toString();
                    }
                    else {
                        noDataSensors.push(tmpstr);
                        //this.ui.showError("Error", "No Reading for "+tmpstr, "warn", 5, ui);
                        //this.badUrls.push(config.sensorFilesUrl.value+tmpstr+this.viewrange.startdate.getFullYear().toString()+'-'+tmpmonth.toString());
                        var badstr = config.sensorFilesUrl.value+tmpstr+this.viewrange.startdate.getFullYear().toString()+'-'+tmpmonth.toString();
                        console.log("No Reading for "+tmpstr);
                        this.badUrls.push(badstr);
                        //console.log(this.badUrls);
                        noDataCount++;
                        
                    }
                }
                if (this.plotarray[p].url.length == noDataCount){
                    //console.log("No Data Found for plot "+this.plotarray[p].url);
                    //this.ui.showError("Error", "No reading for "+tmpstr, "warn", 5, ui);
                    noDataPlotCount++;
                }
                else if (noDataSensors.length > 0){
                    var sensorString = "";
                    for (warn in noDataSensors){
                        if (noDataSensors.hasOwnProperty(warn)){
                            sensorString += noDataSensors[warn].split("/S-")[1].split("-")[0]+", ";
                        }
                    }
                    this.ui.showError("Warning:", "No readings available for sensors "+sensorString, "warn", 8, ui);
                }
                
            }
        }
        if (this.plotarray.length == noDataPlotCount){
            //console.log("No data for all plots! Not extending viewport!");
            this.ui.showError("Info:", "No more history data availble for currently displayed sensors.", "info", 8, ui);
            this.viewrange.startdate = new Date(this.viewrange.startdate).addMonths(1);
        }
        //else if (noDataSensors.length = 1){
        //    this.ui.showError("Error", "No reading for "+noDataSensors[0], "warn", 5, ui);
        //}
        //else if (noDataSensors.length > 0){
        //    var sensorString = "";
        //   for (warn in noDataSensors){
        //        if (noDataSensors.hasOwnProperty(warn)){
        //            sensorString += noDataSensors[warn].split("/S-")[1].split("-")[0]+", ";
        //       }
        //    }
        //    this.ui.showError("Warning:", "No readings for sensors "+sensorString, "warn", 8, ui);
        //}
        console.log("Bad URLS:");
        console.log(this.badUrls);
    };
    
    this.removeMonth = function(){
        //
        return false
    };
    
    this.calculateData = function(useWeather){
        //console.log("Calc");
        // Calculate and return the data points, start, end and maximum values used for drawing the plots.
        
        //  Create and initialise an array for storing the json data from the sensors
        var jsonArray = new Array();
        for (var x=0;x<this.maxplots;x++){
            jsonArray.push([]);
        }
        
        //for each plot, sift through URLs and remove badLiusted ones?
        
        
        //console.log("initialised");
        
        if (this.plotarray.length == 0) return 0;
        
        //console.log(plotArray);
        
        var plotArray = this.plotarray;
        console.log("plot URLs:");
        var errorArr = [];
        //FIXME:  if a file DL fails, substitute with zero'ed data.
        
        this.testURL = function(url){
            for (item in this.badUrls){
                if (this.badUrls.hasOwnProperty(item)){
                    if (url === this.badUrls[item]+".json"){
                        console.log('bad item stopped');
                        console.log(url);
                        return false;
                    }
                }
            }
            return true;
        };
        
        //console.log('Earliest date:');
        //console.log(earlieststartdate);
        //console.log(plotArray[0].url[0]+plotArray[0].startmonth+"-"+plotArray[0].startyear+".json");
        
        //For each plot in plotArray
        for(var i=0;i<plotArray.length;i++){
        //console.log("plot worked: "+i);
        //If the plot contains more than one URL, add up the data in the multiple URLs
            if (plotArray[i].url.length > 1){
                //console.log("length is more than one");
                //Create array to store the summed data
                var totaldata = new Array();
                var totalobj = {};
                //For each URL belonging to the plot
                //console.log(plotArray[i].url.length);
                //console.log(i)
                for (var k=0; k<plotArray[i].url.length; k++){
                    //console.log("url worked: "+k);
                    //console.log(plotArray[i].url.length);
                    //Add the json object of that array to the array in jsonArray
                    //console.log(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                    montharray = getMonthsBetween(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                    //console.log(plotArray[i].url+"Month:"+montharray);
                    
                    var initialised = false;
                    for (var t=0;t<montharray.length;t++){
                        if (!initialised){
                            var tmpURL = plotArray[i].url[k]+montharray[t]+".json";
                            if (this.testURL(tmpURL)){
                                var tempJSON = ui.catchError(ui, cache.getObject, tmpURL);
                                var fileName = "S-m"+plotArray[i].url[k].split("/S-m")[1]+montharray[t]+".json";
                                //console.log(fileName);
                                for (var sen in errorList){
                                    if(errorList.hasOwnProperty(sen)){
                                        for (var z=0; z<errorList[sen].length; z++){
                                            var error = errorList[sen][z];
                                            //console.log(error);
                                            if(fileName === error.filename){
                                                //console.log(fileName+" has errors!");
                                                //console.log(error);
                                                for (var err in error.errors){
                                                    var str = "Data Index";
                                                    var dI = error.errors[err][str];
                                                    tempJSON.data[dI][1] = "BAD:"+tempJSON.data[dI][1].toString();
                                                    //console.log(tempJSON.data[dI]);
                                                }
                                            }
                                        } 
                                    }
                                }
                                jsonArray[i][k] = tempJSON
                                initialised = true;
                            }
                            //console.log("2 T: "+t);
                        }
                        else{
                            //console.log("3 T: "+t);
                            var tmpURL = plotArray[i].url[k]+montharray[t]+".json";
                            if (this.testURL(tmpURL)){
                                var tempJSON = ui.catchError(ui, cache.getObject, tmpURL);
                                //console.log(tempJSON);
                                var fileName = "S-m"+plotArray[i].url[k].split("/S-m")[1]+montharray[t]+".json";
                                //console.log(fileName)
                                for (var sen in errorList){
                                    if(errorList.hasOwnProperty(sen)){
                                        for (var z=0; z<errorList[sen].length; z++){
                                            var error = errorList[sen][z];
                                            //console.log(error);
                                            if(fileName === error.filename){
                                                //console.log(fileName+" has errors!");
                                                //console.log(error);
                                                for (var err in error.errors){
                                                    var str = "Data Index";
                                                    var dI = error.errors[err][str];
                                                    tempJSON.data[dI][1] = "BAD:"+tempJSON.data[dI][1].toString();
                                                    //console.log(tempJSON.data[dI]);
                                                }
                                            }
                                        } 
                                    }
                                }
                                jsonArray[i][k].data = jsonArray[i][k].data.concat(tempJSON.data);
							}
							//console.log("5 T: "+t);
                        }
                    }
                    //Add the room to the description
                    //Use coverage if availible
                    var coveravail = false;
                    if (jsonArray[i][k].coverage){
                        if (jsonArray[i][k].coverage != 'cOVERAGE'){
                            jsonArray[i][0].description += ", "+jsonArray[i][k].coverage;
                            coveravail = true;
                        }
                    }
                    
                    if (!coveravail){
                        jsonArray[i][0].description += ", "+jsonArray[i][k].room;
                    }
                    //console.log("6 Coverage: "+jsonArray[i][0].coverage);
                    //console.log(jsonArray[i][0].coverage);
                    
                    
                    // Go through the array, add up sums of meters if their TS already exist, or add them
                    // at the end if not (we sort them later)
//                     if(k == 0){
//                         //in the first iteration, just copy the first sensor data accross.
//                         totaldata = jsonArray[i][k].data;
//                     }
//                     else{
//                         //For each datum in the data array of the sensor
//                         for(var m=0; m<jsonArray[i][k].data.length; m++){
//                             if(m+1 > jsonArray[i][0].data.length){
//                                 // If the array we are trying to add is larger, add the extra item on the end
//                                 totaldata.push(jsonArray[i][k].data[m]);
//                             }
//                             else{
//                                 // If we are adding energy amounts together, if they are bad, change to numbers to
//                                 // do summation, and add bad indicator on again afterwards.
//                                 var bad = false;
//                                 if (typeof totaldata[m][1] == "string"){
//                                     console.log(totaldata[m][1]);
//                                     totaldata[m][1] = parseFloat(totaldata[m][1].split(':')[1]);
//                                     console.log(totaldata[m][1]);
//                                     bad = true;
//                                 }
//                                 if (typeof jsonArray[i][k].data[m][1] == "string"){
//                                     console.log(jsonArray[i][k].data[m][1]);
//                                     jsonArray[i][k].data[m][1] = parseFloat(jsonArray[i][k].data[m][1].split(':')[1]);
//                                     console.log(jsonArray[i][k].data[m][1]);
//                                     bad = true;
//                                 }
//                                 
//                                 //if (bad) {console.log(jsonArray[i][k].data[m][1]);}
//                                 totaldata[m][1] += jsonArray[i][k].data[m][1];
//                                 //if (bad) {console.log(jsonArray[i][k].data[m][1]);}
//                                 
//                                 if (bad){
//                                     jsonArray[i][k].data[m][1] = "BAD:"+jsonArray[i][k].data[m][1].toString()
//                                 }
//                             }
//                         }
//                     }
                    
                    
                    //go through dataset, and add in any dates we found that aren't in the
                    //total data set, and initialise them to 0.
                    var tmpdata = jsonArray[i][k].data;
                    for(var p=0; p<tmpdata.length; p++){
                        var key = tmpdata[p][0];
                        
                        if (!totalobj.hasOwnProperty(key)){
                            totalobj[key] = 0;
                        }
                        
                        var bad = false;
                        if (typeof totalobj[key] == "string"){
                            bad = true;
                            totalobj[key] = parseFloat(totalobj[key].split(':')[1]);
                        }
                        if (typeof tmpdata[p][1] == "string"){
                            bad = true;
                            tmpdata[p][1] = parseFloat(tmpdata[p][1].split(':')[1]);
                        }
                        
                        totalobj[key]+=tmpdata[p][1];
                        
                        if (bad){
                            totalobj[key] = "BAD:"+totalobj[key].toString();
                        }
                    }
                }
                
                // Convert string of epoch date into int, and sort dates.
                var totalarr = [];
                for (var dat in totalobj){
                    totalarr.push([parseInt(dat, 10),totalobj[dat]]);
                }
                totalarr.sort(sortArrayNum);
                
                for (var dat in totalarr){
                    var tmpdate = new Date(totalarr[dat][0]);
                    //console.log(tmpdate+" - "+totalarr[dat][1]);
                }
                
                
                //console.log(totalarr);
                //console.log(totaldata);
                jsonArray[i][0].data = totalarr;
                totaldata = null;
                jsonArray[i][0].room = "--";
                //console.log("11 rooms added");
            }
            else{
                //jsonArray[i][0] = getJson(plotArray[i].url[0]+plotArray[i].startyear+"-"+plotArray[i].startmonth+".json");
                montharray = getMonthsBetween(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                //console.log("mntharray= "+montharray);
                var initialised = false;
                for (var t=0;t<montharray.length;t++){
                        if (!initialised){
                            //console.log("getting JSONS");
                            var tmpURL = plotArray[i].url[0]+montharray[t]+".json";
                            if (this.testURL(tmpURL)){
                                var tempJSON = ui.catchError(ui, cache.getObject, tmpURL);
                                var fileName = "S-m"+plotArray[i].url[0].split("/S-m")[1]+montharray[t]+".json";
                                
                                for (var sen in errorList){
                                    if(errorList.hasOwnProperty(sen)){
                                        for (var e=0; e<errorList[sen].length; e++){
                                            var error = errorList[sen][e];
                                            //console.log(error);
                                            if(fileName === error.filename){
                                                //console.log(fileName+" has errors!");
                                                //console.log(error);
                                                for (var err in error.errors){
                                                    var str = "Data Index";
                                                    var dI = error.errors[err][str];
                                                    tempJSON.data[dI][1] = "BAD:"+tempJSON.data[dI][1].toString();
                                                    //console.log(tempJSON.data[dI]);
                                                }
                                            }
                                        } 
                                    }
                                }
                                jsonArray[i][0] = tempJSON;
                                initialised = true;
                            }
                        }
                        else{
                            //console.log("B");
                            var tmpURL = plotArray[i].url[0]+montharray[t]+".json";
                            if (this.testURL(tmpURL)){
                                var tempJSON = ui.catchError(ui, cache.getObject, tmpURL);
                                var fileName = "S-m"+plotArray[i].url[0].split("/S-m")[1]+montharray[t]+".json";
                                
                                for (var sen in errorList){
                                    if(errorList.hasOwnProperty(sen)){
                                        for (var e=0; e<errorList[sen].length; e++){
                                            var error = errorList[sen][e];
                                            //console.log(error);
                                            if(fileName === error.filename){
                                                //console.log(fileName+" has errors!");
                                                //console.log(error);
                                                for (var err in error.errors){
                                                    var str = "Data Index";
                                                    var dI = error.errors[err][str];
                                                    tempJSON.data[dI][1] = "BAD:"+tempJSON.data[dI][1].toString();
                                                    //console.log(tempJSON.data[dI]);
                                                }
                                            }
                                        } 
                                    }
                                }
                                jsonArray[i][0].data = jsonArray[i][0].data.concat(tempJSON.data);
                                //console.log("D");
                            }
                        }
                    }
            }
            //console.log("E");
            //console.log(jsonArray);
            var tmptotal = 0;
            var tmpdata = new Array();
            //console.log("i:"+i);
            //console.log(plotArray);
            //console.log(jsonArray);
            plotArray[i].description = jsonArray[i][0].description;
            plotArray[i].room = jsonArray[i][0].room;
            
            var plotBadData = false;
            var badPoints = 0;
            
            for (var j=0; j<jsonArray[i][0].data.length; j++){
                var tmpx = jsonArray[i][0].data[j][0];
                var tmpy = jsonArray[i][0].data[j][1];
                var bad = false;
                
                if (!plotBadData){
                    if (typeof tmpy == "number"){
                        if (tmpy > this.autoFilter.maxY) bad = true;
                        else if (tmpy < this.autoFilter.minY) bad = true;
                    }
                }
                if (typeof tmpy == "string"){
                    //console.log(parseFloat(tmpy.split(':')[1]));
                    tmpy = parseFloat(tmpy.split(':')[1]);
                    var bad = true;
                }
                
                if (!bad) tmptotal += tmpy;
                
                if (tmpdata.length == 0){
                    plotArray[i].maxtime = tmpx;
                    plotArray[i].mintime = tmpx;
                    if (!bad){
                        plotArray[i].maxenergy = tmpy;
                        plotArray[i].minenergy = tmpy;
                    }
                    else{
                        plotArray[i].maxenergy = 0;
                        plotArray[i].minenergy = 0;
                    }
                }
                else {
                    if (tmpx > plotArray[i].maxtime){plotArray[i].maxtime = tmpx;}
                    else if (tmpx < plotArray[i].mintime){plotArray[i].mintime = tmpx;}
                    if (!bad){
                        if (tmpy > plotArray[i].maxenergy){plotArray[i].maxenergy = tmpy;}
                        else if (tmpy < plotArray[i].minenergy){plotArray[i].minenergy = tmpy;}
                    }
                }
                
                var tmpDataPoint = {x:new Date(tmpx), y: tmpy};
                
                //if(tmpy < 6){
                //    console.log('tmpy: '+tmpy);
                //    console.log('bad: '+bad);
                //    console.log('j: '+j);
                //    if (j>0) console.log(tmpdata[j-badPoints-1]);
                //}
                
                if(bad){
                    if(plotBadData){
                        //console.log("Plotting Bad data!");
                        tmpDataPoint.bad = true;
                        tmpdata.push(tmpDataPoint);
                    }
                    else{
                        //console.log("Bad data!");
                        //console.log(tmpDataPoint);
                        //onsole.log(j);
                        if(j>0){
                            tmpdata[j-badPoints-1].bad = true;
                            //console.log('not added, and labeled last point bad.');
                            //tmpdata.push(tmpDataPoint);
                            //tmpdata[0].bad = true;
                        }
                    }
                    ++badPoints;
                }
                else{
                    tmpdata.push(tmpDataPoint);
                }
            }
            //console.log("13 max min");
            //console.log('sensor '+plotArray[i].description+' datalen:'+tmpdata.length+' total:'+tmptotal);
            plotArray[i].avgtotal = Math.round((tmptotal / tmpdata.length)*1000)/1000;
            plotArray[i].totalenergy = Math.round(tmptotal*1000)/1000;
            plotArray[i].data = tmpdata;
            //console.log(tmpdata);
            tmpdata = null;
            tmptotal = 0;
        }
        
        var dataArray = new Array();
        var start = null;
        var end = null;
        var chartmax = [];
        var plotcolours = [];
        //console.log("14 set colours");
        
        for (var i=0; i<plotArray.length; i++){
            //console.log('i: '+i);
            plotcolours[i] = plotArray[i].colour;
            if (i == 0){
                start = new Date(plotArray[0].data[0].x);
                end = new Date(plotArray[0].data[plotArray[0].data.length - 1].x);
            }
            else {
                if (plotArray[i].data[0].x < start){
                    start = new Date(plotArray[i].data[0].x);
                }
                if (plotArray[i].data[plotArray[i].data.length - 1].x > end){
                    end = new Date(plotArray[i].data[plotArray[i].data.length - 1].x);
                }
            }
            chartmax[i] = plotArray[i].data[0].y
            for (var j=0; j<plotArray[i].data.length; j++){
                if (plotArray[i].data[j].y > chartmax[i]){
                    chartmax[i] = plotArray[i].data[j].y;
                }
            }
            //console.log('chartmax[i]: '+chartmax[i]);
            //console.log('chartmax: '+chartmax);
            dataArray.push(plotArray[i].data);
        }
        
        //calculate average , and order plots in that average. (Remember colours.
        
        //else if (type == "multiple"){
        //console.log(plotline);
        //$('#chartdiv').empty();
        // plotArray.length = 0;
        // drawgrid();
        //  $('#tablediv').empty();
        //   return 0;
        //}
        //console.log('Fin');
        //for (var i=0; i<jsonArray.length; i++){
        //    console.log(jsonArray[i][0].coverage);
        //}
        //console.log("14 working length");
        
        var chartcount = plotArray.length;
        
        if (useWeather){
            //console.log('Using Weather');
            //console.log(dataArray);
            //console.log(start);
            //console.log(end);
            //console.log(chartmax);
            var sDate = new Date(start);
            var eDate = new Date(end);
            
            var fin = true;
            var days = 0;
            var weatherarr = [];
            while (fin){
                if (Date.compare(sDate.clearTime(), eDate.clearTime()) > 0){
                    fin = false;
                }
                else{
                    var weatherString = sDate.getFullYear().toString()+'-';
                    weatherString += (sDate.getMonth()).toString()+'-';
                    weatherString += sDate.getDate().toString();
                    //if (days === 0){
                    var temp = weather.getTemp(weatherString);
                    for (datum in temp.data){
                        var wrk = temp.data[datum];
                        weatherarr.push({'x':wrk[0],'y':parseInt(wrk[1], 10)});
                    }

                days++;
                sDate.add(1).days();
                }
            
            }
            //console.log("Days: "+days.toString());
            //console.log(weatherobj);
            //weather
        }
        
        //2D array of points where bad data starts
        
        
        //console.log(dataArray);
        
        //console.log("s / e"+start.toString()+end.toString());
        actuallyChart(dataArray,start,end,chartmax,chartcount,plotcolours,weatherarr,errorArr);
        //console.log("16 chart!");
    };
    
    
    this.clearPlots = function(){
        this.plotarray = new Array();
    };
}