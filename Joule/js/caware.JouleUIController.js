function JouleUIController(){
    
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
            //var div = document.getElementById('divSpinner');
            this.spinner = new Spinner(this.spinVar).spin();
            $('#divSpinner').hide();
            $('#divSpinner').append(this.spinner.el);
            $('#divSpinner').fadeIn("fast", callback)
            //div.appendChild(this.spinner.el);
        }
        else if (io == "out"){
            this.spinner.stop();
        }
    };
    
    this.treeNodeClick = function(node, layout){
        var ploturl = new Array();
        var sensorurl = treeIndex.getItem(node.nodeValue)[1];
        colourpool.toggleColour(sensorurl);
        
        this.loadSpin("in", function(){
            if (plotController.togglePlotByUrl(sensorurl) < 0){
                colourpool.toggleColour(sensorurl);
            }
            
            plotController.calculateData();
            ui.loadSpin("out");
        });
    };
    
    this.addMonth = function(){
        console.log("spun");
        //this.loadSpin("in", function(){
        //    plotController.addMonth();
        //    plotController.calculateData();
        //    this.loadSpin("out");
        //});
        //console.log("unspun");
        this.loadSpin("in");
        plotController.addMonth();
        plotController.calculateData();
        this.loadSpin("out");
    };
    
    this.jouleFinishedLoading = function(){
        this.loadSpin("in");
        //checkCookie("WGBToolVisit");
        $('#loading-message').fadeOut("fast");
        this.changeTree(config.indexUrl.value, "treeuse");
        var startplot = ["/elec/S-m257-"];
        colourpool.toggleColour(startplot);
        plotController.togglePlotByUrl(startplot);
        plotController.calculateData();
        refreshTree();
        this.loadSpin("out");
        console.log('done');
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
    
    this.showError = function(error){
        // takes an error discription, and passes it to a class that generates the proper error text, class of error and timeout.
        // then recives text, and appends HTML to the errorbar div.
    };
}