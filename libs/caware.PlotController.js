function PlotController(maximumplots) {
    // A Class for defining a controller object for plots
    
    this.plotarray = new Array();
    this.maxplots = maximumplots;
    
    this.togglePlotByUrl = function(ploturl){
        // Adds a new plot to the store from an array of ploturls
        var todaydate = new Date();
        var year = todaydate.getFullYear();
        var month = (todaydate.getMonth()+1);
        if (month<10) month = "0"+month;
        
        var plotline = {"id":0,"url":ploturl,"description":"",
                        "startmonthyear":year+"-"+month, "endmonthyear":year+"-"+month,
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
                    plotarray.splice(i,1);
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
    };
    
    this.removeMonth = function(){
        //
    };
    
    this.calculateData = function(){
        // Calculate and return the data points, start, end and maximum values used for drawing the plots.
    };
    
    this.clearPlots = function(){
        this.plotarray = new Array();
    };
}