var DateZero = new Date (2013, 0, 1, 0, 0, 0, 0);
console.log(DateZero);
var viewrange;
var segmentSuffixes;
var carbon;
var emptyTimeSeries = {"start": 0,
	      "step": 1,
	      "readings" : []};

function fetchTimeSeriesSeg (urlStem, segSuf){
    var tmpURL = urlStem + segSuf + ".json";
    var tempJSON = null;
    tempJSON = ui.catchError(ui, cache.getObject, tmpURL);
    if (tempJSON !== undefined)
    	if (tempJSON.hasOwnProperty ("data")) { 
	  return tempJSON.data;
    	}
    return emptyTimeSeries;
}

function CopyTimeSeries (ts){
    return {start: ts.start, step: ts.step, readings : ts.readings.slice(0)}
}

function ConcatTimeSeries (seg1, seg2){

    // This needs to add check that the timeseries are consecutive and have same step
    // Check timeseries are consecutive
      
    
    var nonEmpty = seg1;
    if (nonEmpty.readings.length === 0) nonEmpty = seg2;
    return {"start" : nonEmpty.start,
	    "step" : nonEmpty.step,
	    "readings" : seg1.readings.concat(seg2.readings)};
}

function initMeterReadings(){
    viewrange = {"startdate": new Date(), "enddate": new Date()};
    segmentSuffixes = getViewRangeMonths (viewrange);
    carbon = emptyTimeSeries;
    loadNewCarbon();
} 

function addMonthData (){
	var oldStartYear = viewrange.startdate.getFullYear();
        viewrange.startdate.addMonths(-1);
	if (oldStartYear != viewrange.startdate.getFullYear()){
		loadNewCarbon();
	}
        segmentSuffixes = getViewRangeMonths(viewrange);
        for (var i=0; i<plotLineDesc.length; i++) plotLineDesc[i].valid = false;
        for (var k in meterReadings) if (meterReadings.hasOwnProperty(k)) meterReadings[k].valid = false;
        loadNeeded(findNeeded(plotLineDesc)); 
        plotPlotLines();
}

function removeMonthData (){
	var oldStartYear = viewrange.startdate.getFullYear();
        viewrange.startdate.addMonths(1);
	if (oldStartYear != viewrange.startdate.getFullYear()){
		loadNewCarbon();
	}
        segmentSuffixes = getViewRangeMonths(viewrange);
        for (var i=0; i<plotLineDesc.length; i++) plotLineDesc[i].valid = false;
        for (var k in meterReadings) if (meterReadings.hasOwnProperty(k)) meterReadings[k].valid = false;
        loadNeeded(findNeeded(plotLineDesc)); 
        plotPlotLines();
}

function backTrackMonth(){
    if (viewrange.enddate < DateZero) return;
    viewrange.enddate.addMonths(-1);
    addMonthData();
}

function twoDigits (thing){
    if (thing < 10) return "0"+thing.toString();
    return thing.toString();
}

function advanceDay (date){
    // This should be fool proof.  Advance by the milliseconds in a day
    date.setTime(date.valueOf()+24*60*60*1000);
}

function advanceMonth (date){
    date.setMonth (date.getMonth()+1);
}

function getLastPathComponent (url){
        var comps = url.split("/");
        return comps[comps.length - 1];
}
        
function getViewRangeMonths(viewrange){

    //* Produce an array of month segment suffixes for the viewrange
    
    var runningDate = new Date(viewrange.startdate);
    var monthStr;
    var yearStr; 
    var outputarray = new Array();
    var loopLimit = 200;
    var monthString = "";
    for (var i=0;i<loopLimit;i++){
        if (runningDate > viewrange.enddate) break;
        yearStr = runningDate.getFullYear().toString();
        monthStr = twoDigits(runningDate.getMonth()+1);
        outputarray.push({"year" : yearStr, "month" : monthStr});
        runningDate.addMonths(1);
    }
    return outputarray;
}

function PreviousMonth (timeStamp){
    var dateStamp = new Date (timeStamp);
    dateStamp.addMonths (-1);
    return dateStamp.getFullYear().toString() + "-" + twoDigits (dateStamp.getMonth() + 1);
}

function getViewRangeDays(viewrange){

    //* Produce an array of day segment suffixes for the viewrange
    
    var runningDate = new Date(viewrange.startdate);
    var daystr;
    var monthStr;
    var yearStr; 
    var outputarray = new Array();
    var loopLimit = 200;
    var monthString = "";
    for (var i=0;i<loopLimit;i++){
        if (runningDate > viewrange.enddate) break;
        yearStr = runningDate.getFullYear().toString();
        monthStr = twoDigits(runningDate.getMonth()+1);
        dayStr = twoDigits(runningDate.getDate());
        outputarray.push(yearStr + "-" + monthStr + "-" + dayStr);
        advanceDay(runningDate);
    }
    return outputarray;
}

function sameMonth (timeStamp, d){
    var tsDate = new Date (timeStamp);
    return (tsDate.getFullYear() === d.getFullYear()) && (tsDate.getMonth() === d.getMonth());
}

function ensureTimeInterval (meter){
    // check start and end time for the meter
    // against the view interval
    var ts;
    meter.data.readings = []; // Reset meter readings to allow for range contraction
    if (meter.data.readings.length === 0){
	for (var i = 0 ; i<segmentSuffixes.length; i++){
	    ts = fetchTimeSeriesSeg (meter.urlDir, segmentSuffixes[i].year + "-" + segmentSuffixes[i].month);
	    // Make sure data is available for all days in the month, if not fill empty spaces with negative values so as to trigger "bad" in plotPlotLines
	    if (i != segmentSuffixes.length - 1 && ts.readings.length < 24 * Date.getDaysInMonth(segmentSuffixes[i].year, parseInt(segmentSuffixes[i].month) - 1)) {
		//var mean = d3.mean(ts.readings)
		while (ts.readings.length < 24 * Date.getDaysInMonth(segmentSuffixes[i].year, parseInt(segmentSuffixes[i].month) - 1))
			ts.readings.push(-1);
	    }
	    if (ts !== null) {
	        meter.data = ConcatTimeSeries (meter.data, ts);
	    }
	}
	return;
    }

    // Append data until the whole viewrange is filled :: TO BE REMOVED? never triggered as meter readings always start from empty and segment suffixes fill the whole range
    while (!sameMonth (meter.data.start, viewrange.startdate)) {
      console.log("while");
	ts = fetchTimeSeriesSeg (meter.urlDir, PreviousMonth (meter.data.start)   );
	if (ts.readings.length <= 0) break;
	meter.data = ConcatTimeSeries (ts, meter.data);
    }
}
 
function loadNeeded(needed){
    for (var i=0; i<needed.length; i++){
        var m = needed[i];
        if (!meterReadings.hasOwnProperty (m)){
	    var path = config.sensorRootUrl.value + "/" + m  + "/" + m + "-"; 
	    meterReadings[m] = {"urlDir": path, "valid": false, "data" :emptyTimeSeries};
        }
        ensureTimeInterval (meterReadings[m]);
    }
}

function getViewRangeCarbonYears(viewrange){

    //* Produce an array of annual segment suffixes for the viewrange

    var outputarray = [];

    var startYear = viewrange.startdate.getFullYear();
    var endYear = viewrange.enddate.getFullYear();

    for (var y=startYear; y<=endYear; y++){
        outputarray.push(y.toString());
    }

    return outputarray;
}

function Carbonate(x, y){
    if (!carbonOn) return y;

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

function loadNewCarbon(){

    // Add the earliest year required to what we have.

    var carbonSuffixes = getViewRangeCarbonYears(viewrange);
    var seg = fetchTimeSeriesSeg (config.carbonRootUrl.value, carbonSuffixes[0])
    carbon = ConcatTimeSeries (seg, carbon); 
}