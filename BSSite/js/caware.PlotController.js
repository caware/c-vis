function PlotController(maximumplots, indexUrl) {
    // A Class for defining a controller object for plots
    
    this.plotarray = new Array();
    this.maxplots = maximumplots;
    
    this.viewrange = {"startdate":new Date(),"enddate":new Date()};
    
    var sensorindex = getJson(indexUrl);
    
    
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
            ploturl[x] = "http://www.cl.cam.ac.uk/meters"+sensorurl[x];
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
                if (plotline.url.compare(this.plotarray[i].url)){
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
                
                var tmpstart = new Date.parse(this.plotarray[0].startyear+"-01-"+this.plotarray[0].startmonth);
                var tmpend = new Date.parse(this.plotarray[0].endyear+"-01-"+this.plotarray[0].endmonth);
                
                for (var p in this.plotarray){
                    if (this.plotarray.hasOwnProperty(p)){
                        //console.log(this.plotarray);
                        var plotstart = new Date.parse(this.plotarray[p].startyear+"-01-"+this.plotarray[p].startmonth);
                        var plotend = new Date.parse(this.plotarray[p].endyear+"-01-"+this.plotarray[p].endmonth);
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
        
        for (var p in this.plotarray){
            if (this.plotarray.hasOwnProperty(p)){
                this.plotarray[p].startyear = this.viewrange.startdate.getFullYear().toString();
                var tmpmonth = (this.viewrange.startdate.getMonth()+1);
                if (tmpmonth < 10) tmpmonth = "0"+tmpmonth;
                this.plotarray[p].startmonth = tmpmonth.toString();
                
                //FIXME: Shouldn't need this!
                this.plotarray[p].startmonthyear = tmpmonth.toString()+'-'+this.viewrange.startdate.getFullYear().toString();
                
                
                //var mnth = parseInt();
                //var year = parseInt(;
                //if (mnth > 1) mnth -= 1;
                //else if (mnth = 1){
                //    mnth = 12;
                //    year -= 1;
                //}
                //if (mnth < 10) mnth = "0"+mnth;
                //this.plotarray[p].startmonth = mnth.toString();
                //this.plotarray[p].startyear = year.toString();
            }
        }
    };
    
    this.removeMonth = function(){
        //
        return false
    };
    
    this.calculateData = function(){
        // Calculate and return the data points, start, end and maximum values used for drawing the plots.
        
        //  Create and initialise an array for storing the json data from the sensors
        var jsonArray = new Array();
        for (var x=0;x<this.maxplots;x++){
            jsonArray.push([]);
        }
        
        if (this.plotarray.length == 0) return 0;
        
        var plotArray = this.plotarray;
        
        //var earlieststartdate;
        //for (var i=0; i<plotArray.length;i++){
        //    if (i==0){
        //        earlieststartdate = new Date(plotArray[i].startyear, plotArray[i].startmonth, 0,0,0,0,0);
        //    }
        //    else{
        //        var plotarraydate = new Date(plotArray[i].startyear, plotArray[i].startmonth, 0,0,0,0,0);
        //        
        //        if (plotarraydate.getTime() < earlieststartdate.getTime()){
        //            earlieststartdate = plotarraydate;
        //            plotarraydate = null;
        //        }
        //    }
        //}
        
        //console.log('Earliest date:');
        //console.log(earlieststartdate);
        //console.log(plotArray[0].url[0]+plotArray[0].startmonth+"-"+plotArray[0].startyear+".json");
        
        //For each plot in plotArray
        for(var i=0;i<plotArray.length;i++){
        //If the plot contains more than one URL, add up the data in the multiple URLs
            if (plotArray[i].url.length > 1){
                //Create array to store the summed data
                var totaldata = new Array();
                var totalobj = {};
                //For each URL belonging to the plot
                for (var k=0; k<plotArray[i].url.length; k++){
                    //console.log(plotArray[i].url.length);
                    //Add the json object of that array to the array in jsonArray
                    //console.log(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                    montharray = getMonthsBetween(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                    //console.log(montharray);
                    
                    
                    for (var t=0;t<montharray.length;t++){
                        if (t == 0){
                            jsonArray[i][k] = getJson(plotArray[i].url[k]+montharray[t]+".json");
                        }
                        else{
                            var tjson = getJson(plotArray[i].url[k]+montharray[t]+".json");
                            jsonArray[i][k].data = jsonArray[i][k].data.concat(tjson.data);
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
                    //console.log(jsonArray[i][0].coverage);
                    
                    
                    if(k == 0){
                        //in the first iteration, just copy the first sensor data accross.
                        totaldata = jsonArray[i][k].data;
                    }
                    else{
                        //For each datum in the data array of the sensor
                        for(var m=0; m<jsonArray[i][k].data.length; m++){
                            //for the first lot of data initailise to zero first so we can add to it
                            
                            //Add each data point to the exsisting one in the total data array
                            //totaldata[m] += jsonArray[i][k].data[m][1];
                            if(m+1 > jsonArray[i][0].data.length){
                                //console.log('Not all sensors similar length, request update?');
                                //push new data onto the totaldata array
                                //totaldata.splice(m,0,jsonArray[i][0].data[m]);
                                totaldata.push(jsonArray[i][k].data[m]);
                            }
                            else{
                                totaldata[m][1] += jsonArray[i][k].data[m][1];
                            }
                        }
                    }
                    
                    var tmpdata = jsonArray[i][k].data;
                    for(var p=0; p<tmpdata.length; p++){
                        var key = tmpdata[p][0];
                        //console.log(tmpdata[p][1]);
                        if (!totalobj.hasOwnProperty(key)){
                            //console.log("New date: "+new Date(key));
                            totalobj[key] = 0;
                        }
                        totalobj[key]+=tmpdata[p][1];
                    }
                    
                    
                }
                
                var totalarr = [];
                for (var dat in totalobj){
                    totalarr.push([parseInt(dat, 10),totalobj[dat]]);
                    //console.log(dat);
                }
                totalarr.sort(sortArrayNum);
                //console.log(totalarr);
                
                for (var dat in totalarr){
                    var tmpdate = new Date(totalarr[dat][0]);
                    //console.log(tmpdate+" - "+totalarr[dat][1]);
                }
                
                
                //console.log(totalarr);
                //console.log(totaldata);
                jsonArray[i][0].data = totalarr;
                totaldata = null;
                jsonArray[i][0].room = "--";
                
            }
            else{
                //jsonArray[i][0] = getJson(plotArray[i].url[0]+plotArray[i].startyear+"-"+plotArray[i].startmonth+".json");
                montharray = getMonthsBetween(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                //console.log(montharray);
                for (var t=0;t<montharray.length;t++){
                        if (t == 0){
                            jsonArray[i][0] = getJson(plotArray[i].url[0]+montharray[t]+".json");
                        }
                        else{
                            var tjson = getJson(plotArray[i].url[0]+montharray[t]+".json");
                            jsonArray[i][0].data = jsonArray[i][0].data.concat(tjson.data);
                        }
                    }
            }
            
            var tmptotal = 0;
            var tmpdata = new Array();                
            plotArray[i].description = jsonArray[i][0].description;
            plotArray[i].room = jsonArray[i][0].room;
            //plotArray[i].colour = plotColours[i];
            //plotArray[i].colour = colourpool.getColour(plotArray[i].sensor);
            //this.plotarray[i].colour = plotColours[i];
            
            for (var j=0; j<jsonArray[i][0].data.length; j++){
                var tmpx = jsonArray[i][0].data[j][0];
                var tmpy = jsonArray[i][0].data[j][1];
                tmptotal += tmpy;
                if (tmpdata.length == 0){
                    plotArray[i].maxtime = tmpx;
                    plotArray[i].mintime = tmpx;
                    plotArray[i].maxenergy = tmpy;
                    plotArray[i].minenergy = tmpy;
                }
                else {
                    if (tmpx > plotArray[i].maxtime){plotArray[i].maxtime = tmpx;}
                    else if (tmpx < plotArray[i].mintime){plotArray[i].mintime = tmpx;}
                    if (tmpy > plotArray[i].maxenergy){plotArray[i].maxenergy = tmpy;}
                    else if (tmpy < plotArray[i].minenergy){plotArray[i].minenergy = tmpy;}
                }
                
                tmpdata.push({x:new Date(tmpx),y: tmpy});
            }
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
        var chartmax = 0;
        var plotcolours = [];
        
        for (var i=0; i<plotArray.length; i++){
            plotcolours[i] = plotArray[i].colour;
            if (i == 0){
                start = new Date(plotArray[0].data[0].x);
                end = new Date(plotArray[0].data[plotArray[0].data.length - 1].x);
                chartmax = plotArray[0].data[0].y
            }
            else {
                if (plotArray[i].data[0].x < start){
                    start = new Date(plotArray[i].data[0].x);
                }
                if (plotArray[i].data[plotArray[i].data.length - 1].x > end){
                    end = new Date(plotArray[i].data[plotArray[i].data.length - 1].x);
                }
            }
            for (var j=0; j<plotArray[i].data.length; j++){
                if (plotArray[i].data[j].y > chartmax){
                    chartmax = plotArray[i].data[j].y;
                }
            }
            dataArray.push(plotArray[i].data);
        }
        
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
        
        var chartcount = plotArray.length;
        actuallyChart(dataArray,start,end,chartmax,chartcount,plotcolours);
    };
    
    
    this.clearPlots = function(){
        this.plotarray = new Array();
    };
}