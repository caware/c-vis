function JouleUIController(){
    
    this.errorIds = [];
    this.errorTimeout = 4;
    
    this.useWeather = false;
    
    this.spinVar = {
        lines: 12, // The number of lines to draw
        length: 5, // The length of each line
        width: 2, // The line thickness
        radius: 5, // The radius of the inner circle
        color: '#000', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false // Whether to render a shadow
    };
    
    this.spinner = null;
    
    this.loadSpin = function(io, callback){
        if (io == "in"){
            this.spinner = new Spinner(this.spinVar).spin();
            //$('#divSpinner').hide();
            $('#divSpinner').append(this.spinner.el);
            $('#divSpinner').fadeIn("fast", callback())
        }
        else if (io == "out"){
            $('#divSpinner').hide();
            this.spinner.stop();
        }
    };
    
    this.treeNodeClick = function(node, useri){
        var ploturl = new Array();
        var sensorurl = treeIndex.getItem(node.nodeValue)[1];
        colourpool.toggleColour(sensorurl);
        console.log(sensorurl);
        
        this.loadSpin("in", function(){
            if (plotController.togglePlotByUrl(sensorurl) < 0){
                colourpool.toggleColour(sensorurl);
            }
            
            plotController.calculateData(useri.useWeather);
            useri.loadSpin("out");
        });
    };
    
    this.addMonth = function(useri){
        //console.log("One");
        this.loadSpin("in", function(){
            //console.log("Two");
            plotController.addMonth();
            //console.log("Three");
            plotController.calculateData(useri.useWeather);
            //console.log("Four");
            useri.loadSpin("out");
            //console.log("Five");
        });
    };
    
    //console.log(this.useWeather);
    
    this.jouleFinishedLoading = function(useri, uiType){
        this.loadSpin("in", function(){
            weather = new WeatherJSONBridge();
            plotArray = new Array();
            treeIndex = new IntValueStore();
            plotController = new PlotController(config.maxNumberPlots.value,config.indexUrl.value,ui,weather);
            sensorAccess = new SensorAccessor(config.indexUrl.value,config.sensorFilesUrl.value);
            colourpool = new ColourPool(config.plotColour.value);
            
            switch (uiType) {
              case 'line':   
                useri.changeTree(config.indexUrl.value, "treeuse");
                var startplot = ["/elec/S-m257-"];
                colourpool.toggleColour(startplot);
                plotController.togglePlotByUrl(startplot);
                plotController.calculateData(useri.useWeather);
                refreshTree();
                break;
                
              case 'stacked':
                useri.changeTree(config.indexUrl.value, "treeuse");
                var startplot = ["/elec/primary-cs2-riser/F-lighting/S-m15-", "/elec/primary-cs1-riser/F-lighting/S-m23-", "/elec/primary-cs4-riser/F-lighting/S-m30-"];
                colourpool.toggleColour(startplot);
                plotController.togglePlotByUrl(startplot);
                
                var startplot = ["/elec/primary-cs2-riser/G-lighting/S-m17-", "/elec/primary-G-exr/S-m20-", "/elec/primary-cs1-riser/G-lighting/S-m22-", "/elec/primary-cs4-riser/G-lighting/S-m34-", "/elec/primary-smb2/G-lighting/S-m33-"];
                colourpool.toggleColour(startplot);
                plotController.togglePlotByUrl(startplot);
                
                var startplot = ["/elec/primary-cs3-riser/S-lighting/S-m11-", "/elec/primary-cs2-riser/S-lighting/S-m13-", "/elec/primary-cs1-riser/S-lighting/S-m42-", "/elec/primary-cs4-riser/S-lighting/S-m28-"];
                colourpool.toggleColour(startplot);
                plotController.togglePlotByUrl(startplot);
                
                plotController.calculateData(useri.useWeather);
                refreshTree();
                break;
            }
               
            useri.loadSpin("out");
        });
    };
    
    this.jouleStopLoading = function(useri){
        useri.loadSpin("out");
    };
    
    this.jouleTempToggle = function(useri){
      this.loadSpin("in", function(){});
        if (useri.useWeather == true){
            //$('#temperButton').addClass('Default');
            $('#temperButton').removeClass('success');
            useri.useWeather = false;
        }
        else if (useri.useWeather == false){
            $('#temperButton').addClass('success');
            //$('#temperButton').addClass('Default');
            useri.useWeather = true
        }
        plotController.calculateData(useri.useWeather);
        useri.loadSpin("out");
      //});
    };
      
    
    this.toggleTabs = function(){
    
    };
    
    this.changeTree = function(indexUrl,treeType){
        if (treeType == 'treegeo'){
            $('#geobutton').addClass('success');
            $('#functbutton').removeClass('success');
        }
        else if (treeType == 'treeuse'){
            $('#geobutton').removeClass('success');
            $('#functbutton').addClass('success');
        }
        buildTree(indexUrl, treeType);
        
    };
    
    this.showError = function(error, errorText, errorType, timeout, useri){
        var id = new Date().getTime().toString();
        var genHTML = "<div class=\"alert-message "+errorType+"\" id=\""+id+"\"><p><strong>";
        switch(errorType) {
        case "warn":
            genHTML += "Warning ";
            break;
        case "error":
            genHTML += "Error ";
            break;
        case "success":
            genHTML += "Success ";
            break;
        case "info":
            genHTML += "Info ";
            break;
        }
        genHTML += "</strong> "+errorText+" </p></div>";
        $('#notify-bar').prepend(genHTML);
        var time = timeout*1000;
        var t = setTimeout('ui.hideError('+id+')', time);
        console.log(genHTML);
        // takes an error discription, and passes it to a class that generates the proper error text, class of error and timeout.
        // then recives text, and appends HTML to the errorbar div.
    };
    
    this.hideError = function(id){
        jQid = '#'+id;
        $(jQid).hide("fast", function(){
            $(jQid).remove();
        });
        //$(jQid).remove();
    };
    
    this.catchError = function(useri, call, arg){
        //console.log(call);
        var obj = call(arg);
        
        if (obj.error){
            useri.showError(obj.error, obj.errorText, obj.errorType, useri.errorTimeout, useri);
        }
        
        return obj.result;
    };
}