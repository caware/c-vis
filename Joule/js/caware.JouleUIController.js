function JouleUIController(){
    
    this.errorIds = [];
    this.errorTimeout = 4;
    
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
            $('#divSpinner').hide();
            $('#divSpinner').append(this.spinner.el);
            $('#divSpinner').fadeIn("fast", callback())
        }
        else if (io == "out"){
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
            
            plotController.calculateData();
            useri.loadSpin("out");
        });
    };
    
    this.addMonth = function(useri){
        //console.log("One");
        this.loadSpin("in", function(){
            //console.log("Two");
            plotController.addMonth();
            //console.log("Three");
            plotController.calculateData();
            //console.log("Four");
            useri.loadSpin("out");
            //console.log("Five");
        });
    };
    
    this.jouleFinishedLoading = function(useri){
        this.loadSpin("in", function(){
            //$('#loading-message').fadeOut("fast");
            useri.changeTree(config.indexUrl.value, "treeuse");
            var startplot = ["/elec/S-m257-"];
            colourpool.toggleColour(startplot);
            plotController.togglePlotByUrl(startplot);
            plotController.calculateData();
            refreshTree();
            useri.loadSpin("out");
            //console.log('done');
        });
    };
    
    this.toggleTabs = function(){
    
    };
    
    this.changeTree = function(indexUrl,treeType){
        if (treeType == 'treegeo'){
            $('#geobutton').addClass('active');
            $('#functbutton').removeClass('active');
        }
        else if (treeType == 'treeuse'){
            $('#geobutton').removeClass('active');
            $('#functbutton').addClass('active');
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