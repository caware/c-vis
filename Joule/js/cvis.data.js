// New data object
function data() {
  
  // Pubblic variables
  this.metricType = "power";
  this.plotData = {};
  this.viewRange = {
    "start" : new Date(Date.today().getFullYear(), Date.today().getMonth(), 1),
    "end" : new Date()
  };
  
  // Private variables
  var that = this;
  var powerSuffixes = [];
  var carbonSuffixes = [];
  var dateZero = new Date (2013, 0, 1, 0, 0, 0, 0);
  var table = [];
  var carbon = new timeSeries();
  var meterReadings = new Array();
  
  // Public methods

  this.invalidatePlotLines = function () { // Sets all plot line descriptions to valid = false;
      for (var i=0; i< cvis.tree.plotLineDesc.length; i++) cvis.tree.plotLineDesc[i].valid = false;
  }

  this.resetSelection = function (all) {
      for (var i=0; i< cvis.tree.plotLineDesc.length; i++) cvis.tree.plotLineDesc[i].selected = false;
      if (!all) cvis.tree.plotLineDesc[0].selected = true;
      cvis.tree.selected = _.filter(cvis.tree.plotLineDesc, function(d) { return d.selected; });
  }
   
  var createTable = function () {
    
    var table = [];
    
    for (var i=0; i < cvis.tree.selected.length; i++) {
    
    var pL = cvis.tree.selected[i];
    
    if (that.metricType == "carbon") { // Create data for the table
	    table.push({
	      "colour": cvis.chart.col(pL.id),
	      "description" : pL.description,
	      "startmonthyear": yearMonthFormatter(new Date(pL.start)), 
	      "endmonthyear" : yearMonthFormatter(new Date(pL.end)),
	      "avgtotal" : pwrFormatter(pL.avg),
	      "totalcarbon": carbonFormatter(pL.sum),
	      "id" : pL.id
	    });
	} else {
	    table.push({
	      "colour": cvis.chart.col(pL.id),
	      "description" : pL.description,
	      "startmonthyear": yearMonthFormatter(new Date(pL.start)), 
	      "endmonthyear" : yearMonthFormatter(new Date(pL.end)),
	      "avgtotal" : pwrFormatter(pL.avg),
	      "totalenergy": engFormatter(pL.sum),  
	      "id" : pL.id
	    });
	} 
    }
    
    return table;
    
  }
  
  this.createPoints = function () {
    
    // Private methods
    
    function validateData (pL) { // Provide plot lines with final readings

	function getPlotLineData (name){ // Get plot line data from meterReadings[] or if it's not a meter call validatePlotLineData to go down one level

		var data;
		if (isMeter(name)) {
		    if (meterReadings[name].hasOwnProperty("data")){
			data = meterReadings[name].data.clone();
		    }
		    else {
			data = [];
		    }
		}
		else {
		    var compPL = _.findWhere(cvis.tree.plotLineDesc, {"pLName" : name});
		    validateData(compPL);
		    data = compPL.data;
		}

		return data;
		
	}
	    
	if (pL.valid) return;
	pL.processed = false;
	  
	if (isMeter(pL.pLName)) {
	    pL.data = getPlotLineData(pL.pLName);
	    pL.valid = true;
	    return;
	}

	if (pL.hasOwnProperty ("components")){ // Do summations if needed
	    var comps = pL.components;
	    pL.data = getPlotLineData(comps[0]).clone();
	    for (var k=1; k<comps.length; k++){
		accumDataReadings(pL.data, getPlotLineData(comps[k]).clone(), 1);
	    }
		  
	    if (pL.hasOwnProperty ("minus")){
		var minus = pL.minus;
		for (var k=0; k<minus.length; k++){
		    accumDataReadings(pL.data, getPlotLineData(minus[k]), -1);
		}
	    }
	    pL.valid = true;
	    return;
	}
      
	if (pL.hasOwnProperty ("primary")){ 
	    var prim = pL.primary [0];
	    pL.data = getPlotLineData(prim).clone();
	    pL.valid = true;
	    return;
	}
    }  
    
    // Private variables
  
    var pAA = {};
    pAA.data = [];
    var maxA = [];
    var end = new Date();
    var start = new Date();
    var invalid = true;
    table = [];
    
    // Function code
    
    for (var p=0; p<cvis.tree.plotLineDesc.length; p++) { // For each plot line in plotLineDesc
	var pL = cvis.tree.plotLineDesc[p];
	pL.processed = false;
	if (!pL.selected) continue;
	invalid = false;
	pL.error = true;
	pL.selected = false;

	validateData(pL);

	if (!pL.processed) { // Process data to set start and end dates and fix bad data
	    if (!pL.hasOwnProperty ("data")) continue;
	    if (pL.data === null) continue;
	    if (pL.data.readings.length < 2) continue;
	    
	    pL.error = false;
	    pL.selected = true;
	    pL.points = {};
	    pL.points.data = [];

	    pL.end = new Date();
	    pL.start = new Date ();
	    var x = pL.data.start;

	    var yMax = 0.0;
	    var sum = 0.0;
	    var points = 0;
	    var avg = 0;
	    var duration;

	    for (var i=0;i<pL.data.readings.length; i++) {
		var y = pL.data.readings[i];
		if (!(typeof y === "number") || (y < 0) || (y > 1000)){
		    var fakeY = 0;
		    if (pL.points.data.length > 0) {
			fakeY = (pL.points.data[pL.points.data.length - 1].y);
		    }
		    pL.points.data.push ({"bad" : true, "x": new Date (x), "y" : fakeY});
		}
		else{
		    y = carbonate(x, y);
		    if (y >= 0){
			sum += y;
			points++;
			if (yMax < y) yMax = y;
			pL.points.data.push ({"x": new Date (x), "y":y});
		    }
		    else pL.points.data.push ({"bad" : true, "x": new Date (x), "y" : fakeY});
		}
		x += pL.data.step; // Problem when data is not complete
	    }

	    pL.points.id = p;
	    pL.start = pL.points.data[0].x;

	    pL.end = pL.points.data[pL.points.data.length - 1].x;

	
	    if (points > 0) avg = sum/points;
	    duration = (pL.end - pL.start) / 1000 / 60 / 60;   // milliseconds to hours
	
	    // calculate sum using duration
	

	    if (this.metricType == "carbon") {
		sum = avg * duration * 3600 / 1000 / 1000;      // CO2 in tonnes is g/s * duration in hours * 3600 / 1000 / 1000        
	    }
	    else {
		sum = avg * duration;         // Energy in kW hr is just avg power in kW times hours
	    }

	    pL.yMax = yMax;
	    pL.sum = sum;
	    pL.avg = avg;

	    pL.processed = true;
	}

	if (p === 0){ // Make sure all data is available by limiting the start and end date
	    start = pL.start;
	    end = pL.end;
	} else {
	    if (start > pL.start) start = pL.start;
	    if (end < pL.end) end = pL.end;
	}	
	
	pAA.data.push(pL.points);
	maxA.push(pL.yMax);

    }
    
    if (invalid) return;
    if (pAA.data.length === 0){
      backTrackMonth();
    }

    if (end < this.viewRange.end)
      this.viewRange.end = end;
    if (start > this.viewRange.start)
      this.viewRange.start = start;

  }
  
  this.lineData = function () {
    
    var data = [];
    var yMax = [];
    
    _.each(cvis.tree.selected, function(v) {
      
      data.push(v.points);
      yMax.push(v.yMax);
      
    });
    
    this.plotData = {
      "start" : this.viewRange.start,
      "end" : this.viewRange.end,
      "data" : data,
      "yMax" : _.max(yMax),
      "table" : createTable()
    };

  }
  
  this.sankeyTree = function (rootId, maxDepth) {

	  var sData = new Object();
	  sData.nodes = new Array();
	  sData.links = new Array();
	  var subPlot = [];
	  var minDepth = 0;
	  var drill = false;
	  
	  if (typeof rootId == 'undefined') {
	    if (typeof this.plotData.rootId != 'undefined')
	      rootId = this.plotData.rootId;
	    else 
	      rootId = 0;
	  }
	  
	  if (typeof cvis.tree.plotLineDesc[rootId] != 'undefined')
	    minDepth = cvis.tree.plotLineDesc[rootId].depth;

	  if (typeof maxDepth == 'undefined' || maxDepth <= minDepth)
	    maxDepth = cvis.tree.absMaxDepth;
	  else
	    var maxDepth = parseInt(maxDepth);

	  this.resetSelection(true);

	  if (cvis.tree.plotLineDesc[rootId].hasOwnProperty("children")) {
	    cvis.tree.plotLineDesc[rootId].selected = true;
	    subPlot = cvis.tree.plotLineDesc[rootId].children;
	    drill = true;
	  } else {
	    cvis.tree.plotLineDesc[rootId].selected = true;
	    subPlot = cvis.tree.plotLineDesc;
	  }

	  function selectPL (v) {
	    if (v.depth > minDepth && v.depth <= maxDepth) v.selected = true;
	    if (v.hasOwnProperty("children") && drill) v.children.forEach(selectPL);
	  }
	  
	  function createStructure(v) {
	    if (v.depth > maxDepth) maxDepth = v.depth;
	    if (v.selected && v.avg != 0 && !v.error) {
	      sData.nodes.push({"node" : v.id, "name" : v.nodeName, "description" : v.description, "depth" : v.depth});
	      if (v.depth > minDepth) {
		if ((v.components.length > 1 || v.hasOwnProperty("minus")) && typeof v.children != 'undefined') // Node
		    sData.links.push({"source" : v.parent.id == -1 ? 1 : v.parent.id, "target" : v.id, "value" : v.avg});
		else if ((v.components.length > 1 || v.hasOwnProperty("minus")) && typeof v.children == 'undefined') // Composite leaf
		    sData.links.push({"source" : v.parent.id == -1 ? 0 : v.parent.id, "target" : v.id, "value" : v.avg});
		else if (v.components.length == 1) // Simple leaf
		    sData.links.push({"source" : v.parent.id, "target" : v.id, "value" : v.avg});
	      }
	    }
	  }
	  
	  subPlot.forEach(selectPL);
	  cvis.tree.selected = _.filter(cvis.tree.plotLineDesc, function(d) { return d.selected; });
	  // Get data for the selected nodes
	  this.update();
	  maxDepth = 0;
	  cvis.tree.selected.forEach(createStructure);
	  sData.minDepth = minDepth;
	  sData.maxDepth = maxDepth;
	  sData.rootId = rootId;
	  this.plotData = sData;
	  
  }
  
  this.hPieData = function () {
    
	  var pData = new Object();
	  pData.slices = [];
	  var subPlot = [];
	  var slice = {};

	  this.resetSelection(true);

	  if (cvis.tree.plotLineDesc[rootId].hasOwnProperty("children")) {
	    subPlot = cvis.tree.plotLineDesc[rootId].children;
	  } else if (cvis.tree.plotLineDesc[rootId].hasOwnProperty("parent")) {
	    subPlot = cvis.tree.plotLineDesc[rootId].parent.children;
	    rootId = cvis.tree.plotLineDesc[rootId].parent.id;
	  }

	  function selectPL (v) {
	    v.selected = true;
	  }
	  
	  function createStructure(v) {
	    if (v.selected && v.avg != 0 && !v.error) {
	      slice = {"id" : v.id, "name" : v.nodeName, "description" : v.description, "depth" : v.depth, "value" : v.avg};
	      if (v.hasOwnProperty("children"))
		slice.children = createStructure(v.children);
	      if (depth > 2)
		slice.parent = v.parent;
	      else if (depth == 2)
		slice.parent = cvis.tree.plotLineDesc[1];
	      else if (depth == 1)
		slice.parent = cvis.tree.plotLineDesc[0];
	      pData.slices.push(slice);
	    }
	  }
	  
	  subPlot.forEach(selectPL);
	  cvis.tree.selected = _.filter(cvis.tree.plotLineDesc, function(d) { return d.selected; });
	  // Get data for the selected nodes
	  this.update();

	  cvis.tree.selected.forEach(createStructure);
	  pData.depth = cvis.tree.plotLineDesc[rootId].depth + 1;
	  pData.rootId = rootId;
	  this.plotData = pData;
    
  }
  
  this.pieData = function () {
    
	  var pData = new Object();
	  pData.values = [];
	  var subPlot = [];
	  var minDepth = 0;
	  var drill = false;
	  
	  if (typeof rootId == 'undefined') {
	    if (typeof this.plotData.rootId != 'undefined')
	      rootId = this.plotData.rootId;
	    else 
	      rootId = 2;
	  }

	  if (typeof cvis.tree.plotLineDesc[rootId] != 'undefined')
	    minDepth = cvis.tree.plotLineDesc[rootId].depth;

	  this.resetSelection(true);

	  if (cvis.tree.plotLineDesc[rootId].hasOwnProperty("children")) {
	    subPlot = cvis.tree.plotLineDesc[rootId].children;
	  } else if (cvis.tree.plotLineDesc[rootId].hasOwnProperty("parent")) {
	    subPlot = cvis.tree.plotLineDesc[rootId].parent.children;
	    rootId = cvis.tree.plotLineDesc[rootId].parent.id;
	  }

	  function selectPL (v) {
	    v.selected = true;
	  }
	  
	  function createStructure(v) {
	    if (v.selected && v.avg != 0 && !v.error) {
	      pData.values.push({"id" : v.id, "name" : v.nodeName, "description" : v.description, "depth" : v.depth, "value" : v.avg});
	    }
	  }
	  
	  subPlot.forEach(selectPL);
	  cvis.tree.selected = _.filter(cvis.tree.plotLineDesc, function(d) { return d.selected; });
	  // Get data for the selected nodes
	  this.update();

	  cvis.tree.selected.forEach(createStructure);
	  pData.depth = cvis.tree.plotLineDesc[rootId].depth + 1;
	  pData.rootId = rootId;
	  this.plotData = pData;
    
  }
  
  this.update = function () {
    
    loadMeterData(getMeterNames());
    loadCarbonData();
    
    this.createPoints();
    
  }
  
  this.plot = function (options) {

    if (typeof options == 'undefined') options = {};
    
    this.update();
    
    this.chart.draw(options);
    
    cvis.ui.update();
    
  }
  
  this.changeRange = function (range) { // Add or subtract limiting months from the range :: Dependencies: [getViewRangeMonths, loadNeeded, findNeeded. plotPlotLines, loadNewCarbon], arguments: [months], globals: [viewrange, plotLineDesc, meterReadings]

// 	  if (this.viewRange.end.isBefore(this.viewRange.start.clone().addMonths(months))) return false; // Make sure range remains consistent
// 	  this.viewRange.start.addMonths(months)
// 	  updateSuffixes();
// 	  for (var i=0; i< cvis.tree.plotLineDesc.length; i++) cvis.tree.plotLineDesc[i].valid = false;
// 	  for (var k in meterReadings) if (meterReadings.hasOwnProperty(k)) meterReadings[k].valid = false;
// 
// 	  this.plot();
// 
// 	  return !this.viewRange.end.isBefore(this.viewRange.start.clone().addMonths(months));
	  
	  if (range[1].isBefore(range[0])) return false; // Make sure range remains consistent
	  this.viewRange.start = range[0];
	  this.viewRange.end = range[1];
	  updateSuffixes();
	  for (var i=0; i< cvis.tree.plotLineDesc.length; i++) cvis.tree.plotLineDesc[i].valid = false;
	  for (var k in meterReadings) if (meterReadings.hasOwnProperty(k)) meterReadings[k].valid = false;

	  this.plot();

	  return true;
	  
  }; // backTrackMonth to be integrated
  
  // Private methods
  
  var fetchSeg = function (urlStem, segSuf) { // Fetch data from cache or via JSON request :: Dependencies: [ui, cache], arguments: [urlStem, segSuf], globals: [emptyTimeSeries, ui]
      
      var tmpURL = urlStem + segSuf + ".json";
      var tempJSON = null;
      var returnObj = new Object();
      tempJSON = cvis.ui.catchError(ui, cache.getObject, tmpURL);
      if (tempJSON !== undefined) {
	  if (tempJSON.hasOwnProperty ("data")) { 
	    returnObj.result = new timeSeries(tempJSON.data.start, tempJSON.data.step, tempJSON.data.readings);
	  }
      } else {
	    returnObj.error = true;
      }
      return returnObj;
      
  };

  var loadMeterData = function (meterNames) { // Get meter data if missing :: Dependencies: [ensureTimeInterval], arguments: [needed, meterReadings], globals: [config]

    // Private methods
    
    function createMeterData (meter) { // Create meter data :: Dependencies: [ConcatTimeSeries, fetchTimeSeriesSeg], arguments: [meter, segmentSuffixes], globals: [null]

      var returnObj = new Object();
      var ts;
      meter.data.readings = []; // Reset meter readings to allow for range contraction

      if (meter.data.readings.length === 0) {
	  for (var i = 0 ; i<powerSuffixes.length; i++) {
	      ts = fetchSeg(meter.urlDir, powerSuffixes[i].year + "-" + powerSuffixes[i].month);
	      if (ts.error) {
		  ts = new timeSeries();
		  returnObj.error = true;
	      }
	      else
		  ts = new timeSeries(ts.result.start, ts.result.step, ts.result.readings);
	      if (ts !== null) {
		  meter.data = meter.data.concat(ts);
	      }
	  }
	  return returnObj;
      }

    };
    
    var returnObj = new Object();
    returnObj.result = new Array();

    for (var i=0; i<meterNames.length; i++){
	  var m = meterNames[i];
	  if (!meterReadings.hasOwnProperty(m)){
	      var path = config.sensorRootUrl.value + "/" + m  + "/" + m + "-";  // Base path, 
	      meterReadings[m] = {"urlDir": path, "valid": false, "data" : new timeSeries()};
	  }
	  createMeterData(meterReadings[m]).error ? meterReadings[m].valid = false : meterReadings[m].valid = true;
    }

    return returnObj;
    
  };

  var loadCarbonData = function () {
    
    carbon = fetchSeg(config.carbonRootUrl.value, carbonSuffixes[0].year).result.concat(carbon);

  };

  var carbonate = function (x, y) {

      if (that.metricType != "carbon") return y;

      // Find the carbon intensity for this time

      var start = carbon.start;
      var step = carbon.step;
      var offset = (x - carbon.start)/carbon.step;

      if ((offset >= 0) && (offset < carbon.readings.length)){
	  // grams of CO2/kWHr * kW -> g/s : divide by 3600   
	  return y * carbon.readings[offset] / 3600;    
      }
      return -1;
      
  }

  var getSuffixes = function (interval) { // Create suffixes for JSON requests :: Dependencies: [zero], arguments: null, globals: viewrange
      
      //* Produce an array of month segment suffixes for the viewrange
      
      var runningDate = new Date(that.viewRange.start);
      var monthStr;
      var yearStr; 
      var suffixes = new Array();
      var monthString = new String();

	  switch (interval) {
	    case "monthly":
	      while (runningDate.getMonth() <= that.viewRange.end.getMonth()) {
		yearStr = runningDate.getFullYear().toString();
		monthStr = zero(runningDate.getMonth()+1);
		suffixes.push({"year" : yearStr, "month" : monthStr});
		runningDate.addMonths(1);
	      }
	      break;
	    case "yearly":
	      while (runningDate.getFullYear() <= that.viewRange.end.getFullYear()) {
		yearStr = runningDate.getFullYear().toString();
		monthStr = zero(runningDate.getMonth()+1);
		suffixes.push({"year" : yearStr});
		runningDate.addYears(1);
	      }
	      break;
	    default:
	      while (runningDate.getMonth() <= that.viewRange.end.getMonth()) {
		yearStr = runningDate.getFullYear().toString();
		monthStr = zero(runningDate.getMonth()+1);
		suffixes.push({"year" : yearStr, "month" : monthStr});
		runningDate.addMonths(1);
	      }
	      break;
	  }
	  
      return suffixes;
      
  };

  var updateSuffixes = function () {
    
    powerSuffixes = getSuffixes("monthly");
    carbonSuffixes = getSuffixes("yearly");
    
  };

  var backTrackMonth = function () { // Shift range back by one month :: Dependencies: [changeRange], arguments: null, globals: [DateZero, viewrange]
      if (that.viewRange.end < dateZero) return;
      that.viewRange.end.addMonths(-1);
      that.changeRange(-1);
  }
 
  var getMeterNames = function () {
    
      // Update plotLineDesc to show which plot lines are needed (even if not selected) and produce array of meters that are needed
      
      function descendNeeded (pL, needed) {
	    
	    function neededComponents (comps, needed) {
		  
	      for (var i=0; i<comps.length; i++){
			  if (isMeter(comps[i])){
			      needed = _.union(needed, [comps[i]]);
			      }
			  else {
			      newPL = _.findWhere(cvis.tree.plotLineDesc, {"pLName" : comps[i]});
			      if (newPL !== null) {
				  if (!newPL.needed){
				      newPL.needed = true;
				      needed = descendNeeded(newPL, needed);
				  }
			      }
			  }
	      }

	      return needed;
		      
	    };
	
	    // mark all components of this plotline as needed, and if any are plotLines, descend into them
	    
	    if (pL.hasOwnProperty ("components")) needed = _.union(needed, neededComponents(pL.components, needed.slice()));
	    if (pL.hasOwnProperty ("minus")) needed = _.union(needed, neededComponents(pL.minus, needed.slice()));
	    if (pL.hasOwnProperty ("primary")) needed = _.union(needed, neededComponents(pL.primary, needed.slice()));
	    if (pL.hasOwnProperty ("secondary")) needed = _.union(needed, neededComponents(pL.secondary, needed.slice()));
	    
	    return needed;
	    
      }
      
      var needed = [];
      var i;

      for (i = 0 ; i < cvis.tree.plotLineDesc.length ; i++) cvis.tree.plotLineDesc[i].needed = false;

      for (i = 0 ; i < cvis.tree.plotLineDesc.length ; i++){
	  var pL = cvis.tree.plotLineDesc[i];
	  if (pL.selected) pL.needed = !pL.valid;
	  if (pL.needed) needed = _.union(needed, descendNeeded(pL, needed));
      }

      return needed;
      
  };

  // Initilisation calls
   
  updateSuffixes();
  
}