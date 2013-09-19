function JouleUIController(){ 
  var that = this;  
  
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
    
    this.toggleFilter = function () {
	cvis.chart.filter = !cvis.chart.filter;
	cvis.chart.redraw();
	$("#filter").toggleClass("active", cvis.chart.filter);
    }
    
    this.toggleAreas = function () {
	cvis.chart.areas = !cvis.chart.areas;
	$(".f-area path").toggle(cvis.chart.areas);
	$("#areas").toggleClass("active", cvis.chart.areas);
    }
    
    this.loadSpin = function(io, callback){
        if (io == "in"){
            this.spinner = new Spinner(this.spinVar).spin();
            //$('#divSpinner').hide();
            $('#loading').append(this.spinner.el);
            $('#loading').fadeIn("fast", callback())
        }
        else if (io == "out"){
            $('#loading').hide();
            this.spinner.stop();
        }
    };
    
    this.treeNodeClick = function(d){

	var returnObj = new Object();
	var options = new Object();
	
	switch (cvis.chart.type) {
	  case "line":
	    if (cvis.tree.selected.length == 10 && !d.selected && d.type != "node") {
		  ui.showError(null, "You have reached the maximum 10 lines", "warning", 1.5, ui);
		  return;
	    }
	    if (cvis.tree.plotLineDesc[d.id].selected) {
	      cvis.tree.selected.length > 1 ? cvis.tree.plotLineDesc[d.id].selected = false : ui.showError(null, "At least one sensor has to be selected", "warning", 1, ui);
	    } else {
	      cvis.tree.plotLineDesc[d.id].selected = true;
	      cvis.data.update();
	    }
	    break;
	  case "sankey":
	    if ((cvis.tree.plotLineDesc[d.id].depth == cvis.data.plotData.maxDepth) || (cvis.tree.plotLineDesc[d.id].depth < cvis.data.plotData.maxDepth && !cvis.tree.plotLineDesc[d.id].hasOwnProperty("children") && d.id != 1)) return;
	    if (d.id == cvis.data.plotData.rootId && d.id != 0)
	      options = {
		"rootId" : cvis.tree.plotLineDesc[d.id].parent.id,
		"maxDepth" : $("input[name=maxDepth]").val(),
	      };
	    else
	      options = {
		"rootId" : d.id,
		"maxDepth" : $("input[name=maxDepth]").val(),
	      };
	    break;
	  default:
	    return;
	}
	
	cvis.tree.selected = _.filter(cvis.tree.plotLineDesc, function(d) { return d.selected; });
	cvis.data.plot(options);

	return returnObj;
	
    };
    
    this.reset = function () {
      
      cvis.data.resetSelection();
      cvis.chart.treeUpdate();
      cvis.data.plot();
      
    }
    
    this.graph = function(button, type) {
      
	$(button).hasClass("btn-success") ? null : $(button).toggleClass("btn-success", true).toggleClass("btn-default", false).siblings().toggleClass("btn-default", true).toggleClass("btn-success", false);
	
	$(".btn-toolbar").hide();
	
	switch (type) {
	  case "line":
	    if (cvis.chart.type == "line") return;
	    cvis.chart.changing = true;
	    cvis.chart.type = "line";
	    $(".line-toolbar").show();
	    cvis.data.resetSelection();
	    cvis.chart.treeUpdate();
	    cvis.data.plot();
	    break;
	  case "sankey":
	    if (cvis.chart.type == "sankey") return;
	    cvis.chart.changing = true;
	    cvis.chart.type = "sankey";
	    $(".sankey-toolbar").show();
	    cvis.data.plot();
	    break;
	  case "pie":
	    if (cvis.chart.type == "pie") return;
	    cvis.chart.changing = true;
	    cvis.chart.type = "pie";
	    $(".pie-toolbar").show();
	    cvis.data.plot();
	    break;
	}
      
    }
    
    this.units = function (button) {

	var unit = $(button).attr("unit");

	if (cvis.data.metricType != unit) {
	  switch (unit) {
	    case "carbon":
	      cvis.data.metricType = unit;
	      $(".btn-units").html($("li[unit=" + unit + "] a").html());
	      break;
	    case "power":
	      cvis.data.metricType = unit;
	      $(".btn-units").html($("li[unit=" + unit + "] a").html());
	      break;
	    default:
	      return;
	  }
	} else return;
	
	$("li[role=unit]").toggleClass("active", false);
	$(button).toggleClass("active", true);
	
	cvis.data.invalidatePlotLines();
	cvis.data.plot();
	
    }

    this.addMonth = function(button){
        this.loadSpin("in", function(){
	  console.log("INCREASE RANGE");
            $("#rangeDown").toggleClass("disabled", !cvis.data.changeRange(-1));
            //useri.loadSpin("out");
        });
    };
    
    this.changeRange = function (e) {
      
      var start = Date.parse($("input.date[name=startDate]").val());
      var end = Date.parse($("input.date[name=endDate]").val());
      
      if (start.isBefore(end))
	cvis.data.changeRange([start, end]);
      
      $("input.date[name=startDate]").datepicker("setEndDate", end);
      $("input.date[name=endDate]").datepicker("setStartDate", start);
      
    }
    
    this.changeDepth = function (input) {
      
      cvis.data.plot({"maxDepth" : $(input).val()});
      
    }
    
    this.levelUp = function () {
      
      if (cvis.data.plotData.minDepth > 0) {
	
	cvis.data.plot({"rootId" : cvis.tree.plotLineDesc[cvis.data.plotData.rootId].parent.id, "maxDepth" : $("input[name=maxDepth]").val()});
      } else
	return;
      
    }
    
    this.update = function () {
      
      switch(cvis.chart.type) {
	case "line":
	  break;
	case "sankey":
	  $("button[name=levelUp]").toggleClass("disabled", cvis.data.plotData.minDepth < 1);
	  var canProgress = _.some(_.filter(cvis.tree.selected, function(v) { return v.depth == cvis.data.plotData.maxDepth; }), function (v) { return v.hasOwnProperty("children") || v.depth == 1; });// Hardcoded 1
	  console.log(canProgress);
	  $("input[name=maxDepth]").attr("min", cvis.data.plotData.minDepth + 1)
	    .attr("max", canProgress ? cvis.tree.absMaxDepth : cvis.data.plotData.maxDepth)
	    .attr("value", cvis.data.plotData.maxDepth)
	    .prop("disabled", !canProgress && cvis.data.plotData.maxDepth == cvis.data.plotData.minDepth + 1);
	  break;
	default:
	  return;
      }
      
    }
    
    this.removeMonth = function(button){
        this.loadSpin("in", function(){
	    console.log("DECREASE RANGE");
            $("#rangeDown").toggleClass("disabled", !cvis.data.changeRange(1));
            //useri.loadSpin("out");
        });
    };
        
    this.jouleFinishedLoading = function(useri, uiType){
      $("button, a.noLink").click(function(e) { e.preventDefault(); }); 
      $("input.date[name=startDate]").val(dateFormat(new Date(Date.today().getFullYear(), Date.today().getMonth(), 1))); // first day of month
      $("input.date[name=endDate]").val(dateFormat(new Date()));
      $("input.date").datepicker({
	"format" : "dd-mm-yyyy",
	"startDate" : new Date(2012, 11, 1),// to be set from config.json file
	"endDate" : new Date(),
	"todayHighlight" : true
      }).change(that.changeRange);
      this.loadSpin("in", function(){
	    cvis.data.chart.tree();
	    cvis.data.plot();
            useri.loadSpin("out");
        });
    };
    
    this.jouleStopLoading = function(useri){
        useri.loadSpin("out");
    };
        
    this.jouleScaleSelectionToggle = function(useri, scaleType){
      
      $('#scaleAllButton').toggleClass('active', scaleType == 'all');
      $('#scaleSelectionButton').toggleClass('active', scaleType =='scale');
      $('#zoomButton').toggleClass('active', scaleType =='zoom');

      switch (scaleType) {
          case 'all': 
            this.scaleSelection = 'all';
            break;
          case 'scale':
            this.scaleSelection = 'scale';
            break;
          case 'zoom':
            this.scaleSelection = 'zoom';
            break;
	  default:
	    this.scaleSelection = 'scale';
        }
        cvis.data.plot();
	
    };
       
    this.showError = function(error, errorText, errorType, timeout, useri){
        var id = new Date().getTime().toString();
        var genHTML = "<div class='alert alert-" + errorType + "' id='" + id + "'><strong>";
        switch(errorType) {
          case "warning":
            genHTML += "Warning: ";
            break;
          case "danger":
            genHTML += "Error: ";
            break;
          case "success":
            genHTML += "Success: ";
            break;
          case "info":
            genHTML += "Info: ";
            break;
        }
        genHTML += "</strong>" + errorText + "</div>";
        $('#alert-bar').prepend(genHTML);
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
        if (obj.error) {
            useri.showError(obj.error, obj.errorText, obj.errorType, useri.errorTimeout, useri);
        }
        return obj.result;
    };
}