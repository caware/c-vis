var plotInfo = [];
var myChart;
var col = d3.scale.category10();
function getColour (){
    for (var i=0; i<myColourPool.length; i++){
        if (myColourPool[i] === 0){
            myColourPool[i]++;
            return i;
        }
    }
    return myColourPool.length;
}

function freeColour (id){
    if (id < myColourPool.length) {
        myColourPool[id] = 0;
    }
}

function makeCopyReadings (data){
    var res = [];
    for (var i=0;i<data.length; i++){
        res.push ([data[i][0], data[i][1]]);
    }
    return res;
}

function accumDataReadings (accum, next, sign){
    if (next === null) return;

    if ((next.start != accum.start) ||
	(next.step != accum.step) ||
	(next.readings.length != accum.readings.length)){
	console.log ("ERROR: unmatched time series");
    }
    for (var i=0; i<next.readings.length; i++){
        accum.readings[i] += sign * next.readings[i];
    }
}
        
function invalidatePlotLines(){
    for (var i=0; i< plotLineDesc.length; i++) plotLineDesc[i].valid = false;
}

function validatePlotLineData(pL){

    function getPlotLineData (name){
        var data;
        if (isMeter (name)){
            if (meterReadings[name].hasOwnProperty("data")){
                data = CopyTimeSeries (meterReadings[name].data);
            }
            else {
                data = [];
            }
        }
        else {
            var compPL = findPL (plotLineDesc, name);
            validatePlotLineData (compPL);
            data = compPL.data;
        }
        return data;
    }

    if (pL.valid) return;
    pL.processed = false;
    
        
    if (isMeter (pL.pLName)) {
        pL.data = getPlotLineData(pL.pLName);
        pL.valid = true;
        return;
    }

    if (pL.hasOwnProperty ("components")){
        var comps = pL.components;
        pL.data = CopyTimeSeries (getPlotLineData(comps[0]));
        for (var k=1; k<comps.length; k++){
            accumDataReadings(pL.data, getPlotLineData(comps[k]), 1);
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
        pL.data = CopyTimeSeries (getPlotLineData(prim));
        pL.valid = true;
        return;
        }
}
  
function plotPlotLines (){
    
    var pAA = new Object();
    pAA.data = new Array();
    var pA;
    var maxA = [];
    var cols = [];
    var end = new Date();
    var start = new Date();
    var numSelected = 0;
    var treeObj = new Array();
    plotInfo = [];
    
    for (var p=0; p< plotLineDesc.length; p++){
        var pL = plotLineDesc[p];
        if (!pL.selected) {
            if (pL.colour !== "none"){
                freeColour (pL.colour);
                pL.colour = "none";
            }
            continue;
        }
        treeObj.push(pL);
        numSelected++;
        
	validatePlotLineData (pL);
	
        if (!pL.processed) {
	    if (!pL.hasOwnProperty ("data")) continue;
            if (pL.data === null) continue;
            if (pL.data.readings.length < 2) continue;
	    pL.pA = new Object();
            pL.pA.data = new Array();

            pL.end = new Date();
	    pL.start = new Date ();
	    var x = pL.data.start;

            var maxy = 0.0;
            var sum = 0.0;
            var points = 0;
            var avg = 0;
            var duration;

            for (var i=0;i<pL.data.readings.length; i++){
                var y = pL.data.readings[i];
                if (!(typeof y === "number") || (y < 0) || (y > 1000)){
                    var fakeY = 0;
		    if (pL.pA.data.length > 0) {
		        fakeY = (pL.pA.data[pL.pA.data.length - 1].y);
		    }
		    pL.pA.data.push ({"bad" : true, "x": new Date (x), "y" : fakeY});
                }
                else{
		    y = Carbonate (x ,y);		// Hideous (in many respects) but hides it away... 
		    if (y > 0){
                        sum += y;
                        points++;
                        if (maxy < y) maxy = y;
               	        pL.pA.data.push ({"x": new Date (x), "y":y});
		    }
		    else pL.pA.data.push ({"bad" : true, "x": new Date (x), "y" : fakeY});
	        }
	        x += pL.data.step; // Problem when data is not complete
            
            }
            pL.pA.id = p;
            pL.start = pL.pA.data[0].x;

            pL.end = pL.pA.data[pL.pA.data.length - 1].x;

        
            if (points > 0) avg = sum/points;
            duration = (pL.end - pL.start) / 1000 / 60 / 60;   // milliseconds to hours
        
            // calculate sum using duration
        

	    if (carbonOn) {
	        sum = avg * duration * 3600 / 1000 / 1000;      // CO2 in tonnes is g/s * duration in hours * 3600 / 1000 / 1000        
	    }
	    else {
	        sum = avg * duration;         // Energy in kW hr is just avg power in kW times hours
	    }


	    pL.maxy = maxy;
	    pL.sum = sum;
	    pL.avg = avg;

	    pL.processed = true;
	}


        if (pL.colour === "none"){
               pL.colour = getColour();
        }

	if (p === 0){
	    start = pL.start;
	    end = pL.end;
	}
	else {
	    if (start > pL.start) start = pL.start;
	    if (end < pL.end) end = pL.end;
	}	
	

        pAA.data.push(pL.pA);
        maxA.push(pL.maxy);
        cols.push(colourpool[pL.colour]);
	if (carbonOn){
	    
            plotInfo.push({"colour": col(pL.id),
			    "description" : pL.description,
			    "startmonthyear": yearMonthFormatter(new Date(pL.start)), 
			    "endmonthyear" : yearMonthFormatter(new Date(pL.end)),
			    "avgtotal" : pwrFormatter(pL.avg),
			    "totalcarbon": carbonFormatter(pL.sum),
			    "id" : pL.id});
	}
	else {

            plotInfo.push({"colour": col(pL.id),
			    "description" : pL.description,
			    "startmonthyear": yearMonthFormatter(new Date(pL.start)), 
			    "endmonthyear" : yearMonthFormatter(new Date(pL.end)),
			    "avgtotal" : pwrFormatter(pL.avg),
			    "totalenergy": engFormatter(pL.sum),  
			    "id" : pL.id});
	}
    }
    if (numSelected === 0) return;
    if (pAA.data.length === 0){
        backTrackMonth();
    }
    else {
      console.log(treeObj);
	pAA.table = plotInfo;
	pAA.yMax = d3.max(maxA);
	pAA.start = start;
	pAA.end = end;
	if (typeof myChart == "undefined") {
	  myChart = new chart(pAA, cols);
	  myChart.tree(visTree);
	  myChart.draw();
	} else {
	  myChart.redraw(pAA, cols);
	}
    }
    
}
