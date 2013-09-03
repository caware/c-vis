function JouleUIController(){ 
    this.errorIds = [];
    this.errorTimeout = 4;
    this.scaleSelection = 'scale';
    
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
    
    this.toggleFilter = function (myChart) {
	myChart.filterOn = !myChart.filterOn;
	myChart.redraw();
	$("#filter").toggleClass("success");
    }
    
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
    
    this.treeNodeClick = function(plotLineInd, useri){
 
        plotLineDesc[plotLineInd].selected = !plotLineDesc[plotLineInd].selected;
	if (plotLineDesc[plotLineInd].selected) {
            loadNeeded (findNeeded(plotLineDesc));
	}
        plotPlotLines();

    };
    
    this.jouleCarbonToggle = function (button){
	carbonOn = !carbonOn;
	if (carbonOn){
           button.value = "Change to Power";
           $('#charttitle h1').text('C02 (g/s)');
	}
	else {
           button.value = "Change to Carbon";
           $('#charttitle h1').text('Power (kW)');
	}
	invalidatePlotLines();
	plotPlotLines();
    }

    this.addMonth = function(useri){
        this.loadSpin("in", function(){
            addMonthData();
            useri.loadSpin("out");
        });
    };
        
    this.jouleFinishedLoading = function(useri, uiType){
        this.loadSpin("in", function(){
            plotArray = new Array();
            colourpool = config.plotColour.value;
            loadNeeded (findNeeded(plotLineDesc));
            plotPlotLines();
            useri.loadSpin("out");
        });
    };
    
    this.jouleStopLoading = function(useri){
        useri.loadSpin("out");
    };
    
    
    this.jouleScaleSelectionToggle = function(useri, scaleType){
        switch (scaleType) {
          case 'all': 
            $('#scaleAllButton').addClass('success');
            $('#scaleSelectionButton').removeClass('success');
            $('#zoomButton').removeClass('success');
            this.scaleSelection = 'all';
            break;
          case 'scale':
            $('#scaleAllButton').removeClass('success');
            $('#scaleSelectionButton').addClass('success');
            $('#zoomButton').removeClass('success');
            this.scaleSelection = 'scale'
            break;
          case 'zoom':
            $('#scaleAllButton').removeClass('success');
            $('#scaleSelectionButton').removeClass('success');
            $('#zoomButton').addClass('success');
            this.scaleSelection = 'zoom'
            break;
        }
        plotPlotLines();
    };
      
    
    this.toggleTabs = function(){
    
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
    };
    
    this.hideError = function(id){
        jQid = '#'+id;
        $(jQid).hide("fast", function(){
            $(jQid).remove();
        });
    };
    
    this.catchError = function(useri, call, arg){
        var obj = call(arg);
        if (obj.error){
            useri.showError(obj.error, obj.errorText, obj.errorType, useri.errorTimeout, useri);
        }
        return obj.result;
    };
}