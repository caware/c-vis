/* Javascript formatters */

var zero = d3.format("02d");
var yearMonthFormatter = d3.time.format("%b %Y");
var pwrFormatter = d3.format(".2f");
var engFormatter = d3.format(",f");
var carbonFormatter = d3.format(",f");
var zoomDateFormat = d3.time.format("%a %d %b");
var zoomTimeFormat = d3.time.format("%H:%M");
var overallDateFormat = d3.time.format("%d %b '%y");
var dateFormat = d3.time.format("%d-%m-%Y");
var col = d3.scale.category10();


function makeCopyReadings (data){ // Duplicate a bi-dimensional array
    var res = [];
    for (var i=0;i<data.length; i++){
        res.push ([data[i][0], data[i][1]]);
    }
    return res;
}

function accumDataReadings (accum, next, sign){ // Sums or subtracts correspondent values of accum and next
   
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

function isMeter (comp){
    return (comp.indexOf("S-m") === 0);
}

function getUrlArgs() {
	var args = {};
	var hashes = window.location.hash.substr(1).split('&');
	for(var i = 0; i < hashes.length; i++) {
	    var hash = hashes[i].split('=');
	    args[hash[0]] = hash[1];
	}
	return args;
}

function mapper2(treeObj, j) {
    
	typeof j == 'undefined' ? j=1 : j++;
    
	var remappedTree = new Array();
	var i = 100;
	
	_.map(treeObj, function (value, key, list) { 
		  
		var temp = new Object();

		if (typeof value == 'number') {
			temp.name = key;
			temp.id = value;
			key == 'Building' ? temp.show = true : temp.show = false; // to be set at tree generation stage
			remappedTree.push(temp);
		} else if (typeof value == 'object') {
			temp.name = key;
			temp.id = j*i; // solve ID problem on non-leaves
			temp._children = mapper(value, j);
			remappedTree.push(temp);
		}
		
		i++;
		
	});

	return remappedTree;
	
}

function nulls(l) {
  
  if (typeof l != 'number') return;
  
  l = Math.abs(parseInt(l));
  
  var output = new Array(l);
  
  for (var i=0; i<l; i++) output[i] = null;
  
  return output;
  
}

function mapper(treeObj, depth) {

	typeof depth == 'undefined' ? depth = 2 : depth++;
  
	var remappedTree = new Array();

	treeObj.forEach(function (v, k, l) {

	  if ((v.depth > 2 && v.depth == depth) || (v.depth < 3)) {
	    if (v.hasOwnProperty("children")) {
	      var childrenArray = mapper(v.children, depth);
	      childrenArray.unshift({"id" : v.id, "name" : v.nodeName + " Total", "description" : v.description + ": Total", "selected" : v.selected, "type" : "leaf"})
	      remappedTree.push({
		  "id" : v.id + "n",
		  "name" : v.nodeName,
		  "description" : v.description,
		  "type" : "node",
		  "_children" : childrenArray,
		  "children" : new Array()
	      });
	    } else {
	      remappedTree.push({"id" : v.id, "name" : v.nodeName, "description" : v.description, "selected" : v.selected, "type" : "leaf"});
	    }
	  }
	  
	});

	return remappedTree;

}

function updater(treeObj, plotLineDesc) {

	var remappedTree = new Array();

	treeObj.forEach(function (v, k, l) {
	  if (v.type == "leaf") {
	    v.selected = plotLineDesc[v.id].selected;
	    v.error = plotLineDesc[v.id].error;
	  }
	  if (v.hasOwnProperty("children") && v.children.length > 0)
	    updater(v.children, plotLineDesc);
	  else if (v.hasOwnProperty("_children") && v._children.length > 0)
	    updater(v._children, plotLineDesc);
	});
 
}

// function twoDigits (thing){
//     if (thing < 10) return "0"+thing.toString();
//     return thing.toString();
// }

// function getViewRangeDays(viewrange){
// 
//     //* Produce an array of day segment suffixes for the viewrange
//     
//     var runningDate = new Date(viewrange.startdate);
//     var daystr;
//     var monthStr;
//     var yearStr; 
//     var outputarray = new Array();
//     var loopLimit = 200;
//     var monthString = "";
//     for (var i=0;i<loopLimit;i++){
//         if (runningDate > viewrange.enddate) break;
//         yearStr = runningDate.getFullYear().toString();
//         monthStr = zero(runningDate.getMonth()+1);
//         dayStr = zero(runningDate.getDate());
//         outputarray.push(yearStr + "-" + monthStr + "-" + dayStr);
//         advanceDay(runningDate);
//     }
//     return outputarray;
// }

// function advanceDay (date){
//   console.log("advanceDay");
//     // This should be fool proof.  Advance by the milliseconds in a day
//     date.setTime(date.valueOf()+24*60*60*1000);
// }