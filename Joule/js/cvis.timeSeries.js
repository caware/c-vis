/*
 
	This function (or class) creates a timeSeries object.
	
	TO DO:
	 * Set change all variables to private and use accessors to set or get their values

*/
function timeSeries(start, step, readings) {
	
	typeof start == 'number' ? this.start = parseInt(start) : this.start = 0;
	typeof step == 'number' ? this.step = parseInt(Math.abs(step)) : this.step = 1;
	Object.prototype.toString.call(readings) === '[object Array]' ? this.readings = readings.slice() : this.readings = new Array();
	this.end = this.start + this.step * this.readings.length;

}

timeSeries.prototype = {

set : function (start, step, readings) {

	typeof start == 'number' ? this.start = parseInt(start) : null;
	typeof step == 'number' ? this.step = parseInt(Math.abs(step)) : null;
	Object.prototype.toString.call(readings) === '[object Array]' ? this.readings = readings.slice() : null;
	this.end = this.start + this.step * this.readings.length;

},

getStart: function () {
	
	return this.start;
	
},

getEnd: function () {
	
	return this.start;
	
},

getStart: function () {
	
	return this.start;
	
},

concat : function (seg2) {
	
	var concat = new timeSeries();

	if (this.empty() && !seg2.empty()) {
		concat = _.clone(seg2);
	} else if (seg2.empty() && !this.empty()) {
		concat = _.clone(this);
	} else if (this.empty() && seg2.empty()) {
		return concat;
	} else {
		if (this.end == seg2.start && this.step == seg2.step) {
			concat.set(this.start, this.step, this.readings.concat(seg2.readings));
		} else {
			if (this.step != seg2.step) {
			//console.log("Different timestep");
			}
			if (this.end != seg2.start) {
				//console.log("Data is missing");
				var extra = new Array();
				var diff = (seg2.start - this.end) / this.step;
				for (diff; diff > 0; diff--) extra.push(-1);
				if (new Date(this.end).getHours() < 23) {
					concat.set(this.start, this.step, this.readings.concat(extra).concat(seg2.readings));
				} else if (new Date(this.start).getHours() != 0) {
					concat.set(this.start, this.step, extra.concat(this.readings).concat(seg2.readings));
				} else {
					// Handle data missing in the middle: impossible wihout timestamp
					console.error("Data is probably missing in the middle of the file. Can't find out without per-reading timestamp.")
				}
			}
		}
	}

	return concat;
	
},

clone : function () {
	
	var clone = new timeSeries(this.start, this.step, this.readings.slice(0));
	
	return clone;

},

clear : function () {

	this.start = 0;
	this.step = 0;
	this.readings = new Array();

},

empty : function () {

	return this.readings.length == 0 ? true : false;

}

}