function PlotController(maximumplots) {
    // A Class for defining a controller object for plots
    
    this.plotarray = new Array();
    this.maxplots = maximumplots;
    
    this.getPlots = function(){
        return this.plotarray;
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
    
    this.togglePlotByUrl = function(ploturl){
        // Adds a new plot to the store from an array of ploturls
        var todaydate = new Date();
        var year = todaydate.getFullYear();
        var month = (todaydate.getMonth()+1);
        if (month<10) month = "0"+month;
        
        var plotline = {"id":0,"url":ploturl,"description":"",
                        "startmonth":month.toString(), "startyear":year.toString(),
                        "endmonth":month.toString(), "endyear":year.toString(),
                        "colour":"Colour", "sensor":"Sensor", "room":"Room",
                        "circuit":"Circuit", "avgselected":10.0,
                        "avgtotal":15.0, "totalenergy":20.0,
                        "maxtime":0, "mintime":0,
                        "maxenergy":0.0, "minenergy":0.0,
                        "data":new Array()}
        var found = false;
        
        for (var i in this.plotarray){
            if (this.plotarray.hasOwnProperty(i)){
                if (plotline.url.compare(this.plotarray[i].url)){
                    found = true;
                    this.plotarray.splice(i,1);
                    break;
                }
            }
        }
        
        if (!found){
            if (this.plotarray.length == this.maxplots) console.log("Maximum amount of plots already drawn.");
            else {
                this.plotarray.push(plotline);
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
        for (var p in this.plotarray){
            if (this.plotarray.hasOwnProperty(p)){
                var mnth = parseInt(this.plotarray[p].startmonth);
                var year = parseInt(this.plotarray[p].startyear);
                if (mnth > 1) mnth -= 1;
                else if (mnth = 1){
                    mnth = 12;
                    year -= 1;
                }
                if (mnth < 10) mnth = "0"+mnth;
                this.plotarray[p].startmonth = mnth.toString();
                this.plotarray[p].startyear = year.toString();
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
        
        var plotArray = this.plotarray;
        
        //console.log(plotArray[0].url[0]+plotArray[0].startmonth+"-"+plotArray[0].startyear+".json");
        
        //For each plot in plotArray
        for(var i=0;i<plotArray.length;i++){
        //If the plot contains more than one URL, add up the data in the multiple URLs
            if (plotArray[i].url.length > 1){
                //Create array to store the summed data
                var totaldata = new Array();
                //For each URL belonging to the plot
                for (var k=0; k<plotArray[i].url.length; k++){
                    //Add the json object of that array to the array in jsonArray
                    //jsonArray[i][k] = null;
                    console.log(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                    montharray = getMonthsBetween(plotArray[i].startmonth,plotArray[i].startyear,plotArray[i].endmonth,plotArray[i].endyear);
                    console.log("####Month Stuff####");
                    console.log(montharray);
                    for (var t=0;t<montharray.length;t++){
                        if (t == 0){
                            jsonArray[i][k] = getJson(plotArray[i].url[k]+montharray[t]+".json");
                        }
                        else{
                            var tjson = getJson(plotArray[i].url[k]+montharray[t]+".json");
                            jsonArray[i][k].data = jsonArray[i][k].data.concat(tjson.data);
                            console.log('tjson.data length');
                            console.log(jsonArray[i][k].data.length);
                        }
                        
                        //console.log(tjson);
                    }
                    console.log("////Month Stuff####");
                    //jsonArray.concat();
                    //jsonArray[i][k] = getJson(plotArray[i].url[k]+plotArray[i].startyear+"-"+plotArray[i].startmonth+".json");
                    ////var tmpjson = getJson(plotArray[i].url[k]+"2011-05.json");
                    //console.log(tmpjson.data);
                    //Add the room to the description
                    jsonArray[i][0].description += ", "+jsonArray[i][k].room;
                    
                    //jsonArray[i][k].data = jsonArray[i][k].data.concat(tmpjson.data);
                    ////tmpjson.data = tmpjson.data.concat(jsonArray[i][k].data);
                    ////jsonArray[i][k].data = tmpjson.data;
                    
                    
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
                                console.log('Not all sensors similar length, request update?');
                                //push new data onto the totaldata array
                                //totaldata.splice(m,0,jsonArray[i][0].data[m]);
                                totaldata.push(jsonArray[i][k].data[m]);
                            }
                            else{
                                totaldata[m][1] += jsonArray[i][k].data[m][1];
                            }
                        }
                    }
                    
                    //identify an jsonArray[i][?] that is big enough to hold totaldata, and then place in there, 
                    //before copying that array to jsonArray[i][0].data
                    
                    //OR
                    
                    //have totaldata as a 2D array of timestamps and kws, and replace each time stamp when it gets bigger.
                    //Then copy the whole lot to jsonArray[i][0].data?
                    
                    
                    //for(var m=0; m<totaldata.length; m++){
                    //    
                    //    console.log('i:'+i+', m:'+m+'.data[m][1]: '+jsonArray[i][0].data[m][1]+'totaldata[m]:'+totaldata[m]);
                    //    console.log('datam.length = '+jsonArray[i][0].data.length);
                    //    if(m+1 >= jsonArray[i][0].data.length){console.log('WUPS!');}
                    //    jsonArray[i][0].data[m][1] = totaldata[m];
                    //}
                }
                jsonArray[i][0].data = totaldata;
                totaldata = null;
                jsonArray[i][0].room = "--";
                
            }
            else{
                //console.log("plotArray"+plotArray[i].url[0]);
                jsonArray[i][0] = getJson(plotArray[i].url[0]+plotArray[i].startyear+"-"+plotArray[i].startmonth+".json");
                ////var tmpjson = getJson(plotArray[i].url[0]+"2011-05.json");
                //console.log(tmpjson);
                //jsonArray[i][0].data = jsonArray[i][0].data.concat(tmpjson.data);
                ////tmpjson.data = tmpjson.data.concat(jsonArray[i][0].data);
                ////jsonArray[i][0].data = tmpjson.data;
                //console.log(jsonArray[i][0]);
                //return 0;
            }
            
            var tmptotal = 0;
            var tmpdata = new Array();                
            plotArray[i].description = jsonArray[i][0].description;
            plotArray[i].room = jsonArray[i][0].room;
            plotArray[i].colour = plotColours[i];
            
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
            console.log('sensor '+plotArray[i].description+' datalen:'+tmpdata.length+' total:'+tmptotal);
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
        
        for (var i=0; i<plotArray.length; i++){
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
        console.log('Fin');
        var chartcount = plotArray.length;
        actuallyChart(dataArray,start,end,chartmax,chartcount);
    };
    
    
    this.clearPlots = function(){
        this.plotarray = new Array();
    };
}