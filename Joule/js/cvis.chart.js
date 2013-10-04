/*
 
	This function creates a chart object.
	The distinction between public and private variables and methods is employed to make the code clearer
	
	TO DO:
	 * Set change all variables to private and use accessors to set or get their values

*/

function chart(options) {
	
// Public variables

	this.filter = false;
	this.areas = typeof options.areas == 'boolean' ? options.areas : true;
	this.scaleSelection = "scale";
	this.cols = utils.nulls(10);
	this.type = options.type || "sankey";
	this.changing = true;
	this.data = {};
	this.rootData = {};
	this.dim = {
	      "w" : parseInt(options.w) || 750,
	      "h1" : parseInt(options.h1) || 400,
	      "spacing" : parseInt(options.spacing) || 30,
	      "h2" : parseInt(options.h2) || 50,
	      "margin" : {
			"top" : parseInt(options.margin_top) || 30,
			"right" : parseInt(options.margin_right) || 20,
			"bottom" : parseInt(options.margin_bottom) || 20,
			"left" : parseInt(options.margin_left) || 30
	      }
	};
	
// Private variables
	
	var that = this;
	// chartTemp is a temporary object reset any time a new chart type is created, it carries methods and properties that are used by the chart and the tree
	var chartTemp = {};
	var dim = this.dim;
	var duration = 400;
	
	// This is the main SVG container, every chart is appended to this container
	var main = d3.select("#chartBody").append("svg")
		  .attr("width", dim.w + dim.margin.left + dim.margin.right)
		  .attr("height", dim.margin.top + dim.margin.bottom + dim.h1 + dim.spacing + dim.h2);
	// Outer border	  
	main.append("svg:rect").attr("width", dim.w + dim.margin.left + dim.margin.right)
				.attr("height", dim.margin.top + dim.h1 + dim.spacing + dim.h2 + dim.margin.bottom)
				.attr("stroke", "lightgray")
				.attr("stroke-width", 1)
				.attr("fill", "none");

// Public methods				
				
	this.draw = function (options) { //  Initialise a chart

		if (!that.changing) {
			that.redraw(options);
			return;
		}

		switch (that.type) {
			case "line":
				d3.select(".chart").remove();
				that.removeGrid();
				line();
				that.changing = false;
				break;
			case "sankey":
				d3.select(".chart").remove();
				that.removeGrid();
				sankey();
				that.changing = false;
				break;
			case "treeMap":
				d3.select(".chart").remove();
				that.removeGrid();
				treeMap();
				that.changing = false;
				break;
			default:
				line();
				that.changing = false;
		}
		
		cvis.ui.update();
	
	}

	this.redraw = function (options) { // Refresh a chart
		
		cvis.ui.loading(true);
		
		cvis.data.createPlotData(that.type, options).then(function() {
		
			switch (that.type) {
				case "line":
					lineUpdate(options);
					break;
				case "sankey":
					sankeyUpdate(options);
					break;
				case "treeMap":
					treeMapUpdate(options);
					break;
				default:
					return;
			}
			
			cvis.ui.update();
			cvis.ui.loading(false);
			
		});
	
	}
	
	this.removeGrid = function () { // Remove the data table
	
		var parent = $("#data-table").parent();
		
		$("#data-table").remove();
		
		delete this.grid;
		
		parent.append("<div id='data-table'></div>");
		
	}

	this.tree = function (sensorTree) { // Initialise the tree
			
		var treeDim = {
			w : 300,
			elHeight : 20,
			elWidth : 170,
			h : 800,
			margin : {
				top : 30,
				bottom : 30,
				left : 5
			}
		};
		
		this.tree = d3.layout.tree()
				.size([dim.h, 40]);
							
		this.vis = d3.select("#tree").append("svg:svg")
				.attr("class", "tree")
				.attr("width", dim.w)
				.append("svg:g")
				.attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");
		
		this.rootData.name = cvis.tree.title;
		this.rootData.x0 = 0;
		this.rootData.y0 = 0;
		this.rootData.treeDim = treeDim;
		this.rootData.children = cvis.utils.mapper(cvis.tree.plotLineDesc);
		
	}

	this.treeUpdate = function (options) { // Update the tree
		
		if (typeof options == 'undefined') {
			options = {};
		}
		
		if (typeof options.source == 'undefined') {
			source = that.rootData;
		} else source = options.source;

		cvis.utils.updater(that.rootData, cvis.tree.plotLineDesc, options.expand); // Update the tree data depending on the selected plot lines

		var treeDim = that.rootData.treeDim;
		var nodes = that.tree.nodes(that.rootData);

		nodes.forEach(function(n, i) {
			n.x = i * treeDim.elHeight;
		});

		var node = that.vis.selectAll("g.node")
				.data(nodes, function(d) { return d.id; });
				
		var nodeEnter = node.enter().append("svg:g")
					.attr("class", "node")
					.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
					.style("opacity", 1e-6);    
		
		nodeEnter.append("svg:rect")
			.attr("y", -treeDim.elHeight)
			.attr("height", treeDim.elHeight)
			.attr("width", treeDim.elWidth)
			.style("fill", color)
			.style("fill-opacity", function(d) { return d.selected ? 0.65 : (d.children || d._children) ? 0.65 : 0.3; })
			.attr("rx", 3)
			.attr("ry", 3)
			.on("click", click)
			.on("over", function(d) {
				console.log(d);
			});
			
		nodeEnter.filter(function (d) { return !(d.children || d._children); }).append("svg:rect")
			.attr("class", "colorRect")
			.attr("y", -treeDim.elHeight + 3)
			.attr("x", 150)
			.attr("rx", 3)
			.attr("ry", 3)
			.attr("height", 0.7 * treeDim.elHeight)
			.attr("width", 0.7 * treeDim.elHeight)
			.on("click", click);
		
		var arrows = nodeEnter.filter(function (d) { return d.children || d._children; }).append("svg:polygon")
				.attr("class", "arrow")
				.attr("fill", "black")
				.attr("points", "5,5 13,10 5,15")
				.on("click", click);
				
		arrows.filter(function (d) { return d._children; })
				.attr("transform", "translate(0, -20)");
			
		arrows.filter(function (d) { return d.children; })
				.attr("transform", "translate(0, -20) rotate(90)");
				
		nodeEnter.append("svg:text")
			.attr("dy", -6.5)
			.attr("dx", 20)
			.style("fill", function(d) { return d.selected ? "white" : "gray"; })
			.text(function(d) { return d.name; });
			
		nodeEnter.append("svg:title")
			.text(function(d) { return d.description; });
			
		nodeEnter.transition()
			.duration(duration/2)
			.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
			.style("opacity", 1);
			
		var nodeUpdate = node.transition()
			.duration(duration/2)
			.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
			.style("opacity", 1);

		nodeUpdate.select("rect")
			.style("fill", color)
			.style("fill-opacity", function(d) { return d.selected ? 0.65 : (d.children || d._children) ? 0.65 : 0.3;  });
		
		nodeUpdate.select("text")
			.style("fill", function(d) { return d.selected ? "white" : "black"; })
			
		nodeUpdate.select(".colorRect")
			.style("fill", color);
		
		var arrowsUpdate = nodeUpdate.select("polygon.arrow");
		
		arrowsUpdate.filter(function (d) { return d.children; })
				.attr("transform", "translate(20, -20) rotate(90)");
		
		arrowsUpdate.filter(function (d) { return d._children; })
				.attr("transform", "translate(0, -20)");		
				
		node.exit().transition()
			.duration(duration/2)
			.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
			.style("opacity", 1e-6)
			.remove();
			
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});

		d3.select("svg.tree").attr("height", treeDim.elHeight * nodes.length + treeDim.margin.top + treeDim.margin.bottom);
		
		function click(d) {
			if (d.error) {
				that.treeUpdate(d);
				return;
			}
			if (d.hasOwnProperty("children") && d.children.length) {
				d._children = d.children;
				delete d.children;
			} else if (d.hasOwnProperty("_children") && d._children.length) {
				d.children = d._children;
				delete d._children;
			} else {
				cvis.ui.tree.nodeClick(d);
			}
			that.treeUpdate({"source" : d});
		}

		function color(d) { // Find the right color for tree elements
			if (d._children || d.children)
				return null;
			else if (d.error)
				return "LightGray";
			else if (d.selected)
				switch(that.type) {
					case "sankey":
						return chartTemp.color(d.description);
						break;
					case "line":
						return chartTemp.color(d.id);
						break;
					case "treeMap":
						return chartTemp.color(d);
						break;
					default:
						return "lightgray";
				}
			else return null;
		}	
	}
	
// Private methods
	
	var sliceData = function (range) { // Slices the data so that the focus only shows the selected range. It also filters data by sampling and applying a gaussian filter
		// Set the focus data
		if (typeof range == 'undefined') {
			console.error("Undefined range");
			chartTemp.focusData = cvis.data.plotData.data;
			chartTemp.fx.domain([cvis.data.plotData.start, cvis.data.plotData.end]);
		} else {
			// Set the X domain to range
			chartTemp.fx.domain(range);
			// Slice the data array to include data within range
			var slicedData = [];
			for(var j=0; j<cvis.data.plotData.data.length; j++){
				slicedData[j] = [];
				var remapped = _.map(_.pluck(cvis.data.plotData.data[j].data, "x"), function (d) { return d.getTime(); }); // Map elements by x property and convert to timestamp
				slicedData[j].data = (cvis.data.plotData.data[j].data.slice(
				Math.max(0, _.sortedIndex(remapped, range[0].getTime(), null, true) - 1), // Take one extra value on each side of the range to show data at limits
				_.sortedIndex(remapped, range[1].getTime(), null, true) +1
				));
				that.filter ? slicedData[j].data = gaussian(5, 3, slicedData[j].data) : null;
				slicedData[j].id = cvis.data.plotData.data[j].id;
				slicedData[j].avg = cvis.data.plotData.data[j].avg;
			}
			// Sample the data if more than 600 points are being displayed
			if (slicedData[0].data.length > 600) {
				var mydiv = slicedData[0].data.length / 600;
				var rounddiv = Math.round(mydiv*1)/1;
				
				for(var p=0; p<slicedData.length; p++){
					var temp = [];
					for(var q=0; q<slicedData[p].data.length;q++){
						if (q%rounddiv == 0) {
							temp.push(slicedData[p].data[q]);
						}
					}
					slicedData[p].data = temp;
				}
			}
			
			chartTemp.focusData = {};
			chartTemp.focusData.data = slicedData;

		}
		chartTemp.focusData.yMax = d3.max(chartTemp.focusData.data, function (d) { return d3.max(d.data, function (e) { return typeof e.y === 'number' ? e.y : 0; }); });
		chartTemp.focusData.yMin = d3.min(chartTemp.focusData.data, function (d) { return d3.min(d.data, function (e) { return typeof e.y === 'number' ? e.y : 0; }); });
		
		// Set the context data
		var trimmedData = [];
		if (cvis.data.plotData.data.length > 0) {
			// Sample the data for the context if more than 600 points are being displayed
			if (cvis.data.plotData.data[0].data.length < 600) {
				for (var i=0; i < cvis.data.plotData.data.length; i++) {
					trimmedData[i] = new Object();
					trimmedData[i].id = cvis.data.plotData.data[i].id;
					trimmedData[i].data = [];
					that.filter ? trimmedData[i].data = gaussian(5, 3, cvis.data.plotData.data[i].data) : trimmedData[i].data = cvis.data.plotData.data[i].data;
				}
			} else {
				var mydiv = cvis.data.plotData.data[0].data.length / 600;
				var rounddiv = Math.round(mydiv*1)/1;
				
				for(var p=0; p<cvis.data.plotData.data.length; p++){
					for(var q=0; q<cvis.data.plotData.data[p].data.length;q++){
						if (q == 0) {
							trimmedData[p] = {};
							trimmedData[p].data = [];
						}
						if (q%rounddiv == 0) {
							trimmedData[p].data.push(cvis.data.plotData.data[p].data[q]);
						}
					}
					that.filter ? trimmedData[p].data = gaussian(5, 3, trimmedData[p].data) : null;
					trimmedData[p].id = cvis.data.plotData.data[p].id;
					trimmedData[p].avg = cvis.data.plotData.data[p].avg;
				}
			}
		}

		chartTemp.contextData = {};
		chartTemp.contextData.data = trimmedData;

	}

	var line = function () { // Initiliase a line chart
		
		chartTemp = {};    
		
		chartTemp.color = function (id) {

			_.each(that.cols, function (v, k, l) { _.some(cvis.tree.selected, function (d) { return d.id == v; }) ? l[k] = v : l[k] = null; });

			var index =_.indexOf(that.cols, id) == -1 ? _.indexOf(that.cols, null) :  _.indexOf(that.cols, id);

			that.cols[index] = id;

			return d3.scale.category10().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(index);

		};
		
		that.treeUpdate();
		
		chartTemp.cx = d3.time.scale().clamp(true).range([dim.margin.left, dim.w + dim.margin.left]);
		chartTemp.cy = d3.scale.linear().range([dim.margin.top + dim.h1 + dim.spacing + dim.h2, dim.margin.top + dim.h1 + dim.spacing]);
		
		chartTemp.fx = d3.time.scale().clamp(true).range([dim.margin.left, dim.w + dim.margin.left]);
		chartTemp.fy = d3.scale.linear().range([dim.margin.top + dim.h1, dim.margin.top]);
		chartTemp.ft = d3.scale.linear().range([0, dim.h1]);

		chartTemp.container = main.append("g").attr("class", "lineChart chart");
		chartTemp.defs = chartTemp.container.append("defs");
		
		chartTemp.defs.append("clipPath")
				.attr("id", "focusViewport")
				.append("rect")
				.attr("width", dim.w)
				.attr("height", dim.h1)
				.attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");
		
		chartTemp.defs.append("clipPath")
				.attr("id", "contextViewport")
				.append("rect")
				.attr("width", dim.w-1)
				.attr("height", dim.h2)
				.attr("stroke", "white")
				.attr("stroke-width", 1)
				.attr("transform", "translate(" + (dim.margin.left+1) + "," + (dim.margin.top+dim.h1+dim.spacing) + ")");
		
		chartTemp.focusLine = d3.svg.line()
					.interpolate("monotone")
					.x(function(d) { return chartTemp.fx(d.x); })
					.y(function(d) { return chartTemp.fy(d.y); });
		
		chartTemp.focusArea = d3.svg.area()
					.interpolate("monotone")
					.x(function(d) { return chartTemp.fx(d.x); })
					.y0(dim.margin.top + dim.h1)
					.y1(function(d) { return chartTemp.fy(d.y); });
					
		chartTemp.focus = chartTemp.container.append("g").attr("height", dim.h1).attr("class", "focus");
		
		chartTemp.xAxisFocusBottom = d3.svg.axis()
				.scale(chartTemp.fx)
				.orient("bottom")
				.ticks(7)
				.innerTickSize(-dim.h1)
				.outerTickSize(0)
				.tickFormat(function(d) {return zoomTimeFormat(new Date(d));});
				
		chartTemp.xAxisFocusTop = d3.svg.axis()
					.scale(chartTemp.fx)
					.orient("top")
					.ticks(7)
					.tickSize(0)
					.tickFormat(function(d) {return zoomDateFormat(new Date(d));});
					
		chartTemp.yAxisFocus = d3.svg.axis()
					.scale(chartTemp.fy)
					.ticks(7)
					.orient("left")
					.innerTickSize(-dim.w)
					.outerTickSize(0);
					
		chartTemp.context = chartTemp.container.append("g").attr("height", dim.h2).attr("class", "context");

		chartTemp.xAxisContext = d3.svg.axis()
			.scale(chartTemp.cx)
			.ticks(5)
			.orient("bottom")
			.innerTickSize(-dim.h2)
			.outerTickSize(0)
			.tickFormat(function(d){ return overallDateFormat(d); });
			
		chartTemp.contextLine = d3.svg.line()
			.interpolate("monotone")
			.x(function(d){ return chartTemp.cx(d.x); })
			.y(function(d){ return chartTemp.cy(d.y); });
					
		chartTemp.cBrush = d3.svg.brush()
			.x(chartTemp.cx)
			.on("brush", function () {
				lineUpdate({ refresh : true });
			});
		
		chartTemp.fZoom = d3.behavior.zoom().scaleExtent([1, Infinity])
			.on("zoom", function() {
				if (Math.abs(chartTemp.fx.domain()[1] - chartTemp.fx.domain()[0]) > 3600000) {
					chartTemp.zoomedIn = d3.event.scale == 1 ? false : true;
					chartTemp.currentScale = d3.event.scale;
					chartTemp.currentDomain = chartTemp.fx.domain();
					chartTemp.cBrush.extent(chartTemp.currentDomain);
					lineUpdate({ refresh : true, zoom : true });
				} else {
					chartTemp.fZoom.scale(chartTemp.currentScale);
					chartTemp.fx.domain(chartTemp.currentDomain);
				}
			});

		chartTemp.focus.append("svg:g")
			.attr("class", "fx axis")
			.attr("transform", "translate(0," + (dim.h1 + dim.margin.top) + ")");
		
		chartTemp.focus.append("svg:g")
			.attr("class", "fx2 axis")
			.attr("transform", "translate(0," + dim.margin.top + ")");
		
		chartTemp.focus.append("svg:g")
			.attr("class", "fy axis")
			.attr("transform", "translate(" + dim.margin.left + ",0)")
			.attr("stroke-dasharray", "5, 5");
			
		chartTemp.focus.append("svg:line")
			.attr("class", "baseline")
			.attr("x1", dim.margin.left)
			.attr("x2", dim.margin.left + dim.w)
			.attr("y1", dim.margin.top + dim.h1)
			.attr("y2", dim.margin.top + dim.h1);

		chartTemp.context.append("svg:g")
			.attr("class", "cx axis")
			.attr("transform", "translate(0," + (dim.margin.top + dim.h1 + dim.spacing + dim.h2) + ")");

		chartTemp.context.append("svg:line")
			.attr("class", "baseline")
			.attr("x1", dim.margin.left)
			.attr("x2", dim.margin.left + dim.w)
			.attr("y1", dim.margin.top + dim.h1 + dim.spacing + dim.h2)
			.attr("y2", dim.margin.top + dim.h1 + dim.spacing + dim.h2);
		
		chartTemp.context.append("g")
			.attr("class", "brush")
			.attr("transform", "translate(0," + (dim.margin.top + dim.h1 + dim.spacing)  + ")").call(chartTemp.cBrush)
			.selectAll("rect")
			.attr("y", -6)
			.attr("height", dim.h2 + 7);    
		
		chartTemp.focus.append("rect")
			.attr("class", "zoom")
			.attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top  + ")")
			.attr("fill", "none")
			.attr("pointer-events", "all")
			.style("cursor", "col-resize")
			.attr("height", dim.h1)
			.attr("width", dim.w)
			.call(chartTemp.fZoom); 
			
		that.redraw({});
	};

	var lineUpdate = function (options) { // Update the line chart

		if (!options.refresh) {
			
			that.treeUpdate({}); // Update the tree
			// Set the context domains
			chartTemp.cx.domain([cvis.data.plotData.start, cvis.data.plotData.end]);
			chartTemp.cy.domain([0, cvis.data.plotData.yMax]);
			// Check the brush and set its extent to either the intial values or to the same values when the range changes
			if (chartTemp.cBrush.empty() || chartTemp.cBrush.extent()[0].isBefore(cvis.data.plotData.start)) {
				var i = {x: cvis.config.zoomSize.value.zoomX, dx: cvis.config.zoomSize.value.zoomDX};
				var d1 = chartTemp.cx.invert(cvis.config.zoomSize.value.zoomX);
				cvis.config.zoomSize.value.zoomX = i.x;
				var d2 = chartTemp.cx.invert(cvis.config.zoomSize.value.zoomX + cvis.config.zoomSize.value.zoomDX);
				cvis.config.zoomSize.value.zoomDX = i.dx;
				chartTemp.cBrush.extent([d1, d2]);
			} else {
				chartTemp.cBrush.extent(chartTemp.cBrush.extent());
			}

			chartTemp.context.select("g.brush")
				.call(chartTemp.cBrush);
				
			sliceData(chartTemp.cBrush.extent());
			// Set the focus Y axis scale
			switch (that.scaleSelection) {
				case 'all':
					chartTemp.fy.domain([0, cvis.data.plotData.yMax * 1.1]);
					break;
				case 'scale':
					chartTemp.fy.domain([0, chartTemp.focusData.yMax * 1.1]);
					break;
				case 'zoom':
					chartTemp.fy.domain([chartTemp.focusData.yMin * .8, chartTemp.focusData.yMax * 1.1]);
					break;
			}
			// Draw focus lines
			chartTemp.focus.selectAll(".f-line")
				.data(chartTemp.focusData.data, function (d, i) { return d.id; })
				.enter().insert("svg:g", ".zoom")
					.attr("class", "f-line")
				.append("svg:path")
					.attr("d", function (d) { return chartTemp.focusLine(d.data); })
					.attr("class", function (d, i) { return "focusLine" + d.id; })
					.attr("clip-path", "url(#focusViewport)")
					.style("stroke", function(d, i) { return chartTemp.color(d.id); });
			// Sort lines so that those with a lower average value appear over those with a higher average value
			chartTemp.focus.selectAll(".f-line").sort(function (a, b) { return a.avg < b.avg;});	  
			// Draw focus areas
			chartTemp.focus.selectAll(".f-area")
				.data(chartTemp.focusData.data, function (d, i) { return d.id; })
				.enter().insert("svg:g", ".zoom")
					.attr("class", "f-area")
				.append("svg:path")
					.attr("d", function (d) { return chartTemp.focusArea(d.data); })
					.attr("class", function (d, i) { return "focusArea" + d.id; })
					.attr("clip-path", "url(#focusViewport)")
					.style("fill", function(d, i) { // Create the gradient for the color used by the chart if it doesn't exist
							if (chartTemp.container.select("#grad" + _.indexOf(that.cols, d.id)).empty()) {
								var gradient = chartTemp.defs.append("linearGradient")
										.attr("id", "grad" + _.indexOf(that.cols, d.id))
										.attr("x1", "100%")
										.attr("x2", "100%")
										.attr("y1", "100%")
										.attr("y2", "0%");
								
								gradient.append("stop")
									.attr("offset", "0%")
									.style("stop-color", chartTemp.color(d.id))
									.style("stop-opacity", 0)
									
								gradient.append("stop")
									.attr("offset", "100%")
									.style("stop-color", chartTemp.color(d.id))
									.style("stop-opacity", 1)      
							} 
						return "url(#grad" + _.indexOf(that.cols, d.id) + ")";
					})
					.style("display", that.areas ? "inline" : "none");
			// Sort areas as above
			chartTemp.focus.selectAll(".f-area").sort(function (a, b) { return a.avg > b.avg;});	  
			// Remove focus lines that are no longer required
			chartTemp.focus.selectAll(".f-line")
				.data(chartTemp.focusData.data, function (d, i) { return d.id; }).exit().remove();    
			// Remove focus areas that are no longer required   
			chartTemp.focus.selectAll(".f-area")
				.data(chartTemp.focusData.data, function (d, i) { return d.id; }).exit().remove();
			// Draw context lines      
			chartTemp.context.selectAll(".c-line")
				.data(chartTemp.contextData.data, function (d, i) { return d.id + "#" + d.data.length; })
				.enter().insert("svg:g", ".brush")
					.attr("class", "c-line")
				.append("svg:path")
					.attr("d", function (d) { return chartTemp.contextLine(d.data); })
					.attr("class", function (d, i) { return "contextLine" + d.id;})
					.attr("clip-path", "url(#contextViewport)")
					.style("stroke", function(d, i) { return chartTemp.color(d.id); });
			// Remove context lines that are no longer required
			chartTemp.context.selectAll(".c-line")
				.data(chartTemp.contextData.data, function (d, i) { return d.id + "#" + d.data.length; }).exit().remove();	      	  
		}

		if (options.refresh && options.zoom) chartTemp.context.select("g.brush").call(chartTemp.cBrush); // Re-apply the brush

		if (!options.zoom) {
			chartTemp.fx.domain(chartTemp.cBrush.empty() ? chartTemp.fx.domain() : chartTemp.cBrush.extent()); // Update the focus X domain
			chartTemp.fZoom.x(chartTemp.fx); // Set the scale for the zooming function
		}
		if (options.refresh)
			sliceData(chartTemp.fx.domain()); // Slice the data according to the updated domain
		// Update the lines and areas
		_.each(cvis.data.plotData.data, function(d, i) {
			chartTemp.focus.select(".focusLine" + d.id).attr("d", chartTemp.focusLine(chartTemp.focusData.data[i].data));
			chartTemp.focus.select(".focusArea" + d.id).attr("d", chartTemp.focusArea(chartTemp.focusData.data[i].data));
			chartTemp.context.select(".contextLine" + d.id).attr("d", chartTemp.contextLine(chartTemp.contextData.data[i].data));
		});
		// Update the axes
		chartTemp.focus.select(".fx.axis").call(chartTemp.xAxisFocusBottom);
		chartTemp.focus.select(".fx2.axis").call(chartTemp.xAxisFocusTop);
		chartTemp.focus.select(".fy.axis").transition().call(chartTemp.yAxisFocus);
		chartTemp.context.select(".cx.axis").transition().call(chartTemp.xAxisContext);
		// Update the data table
		gridUpdate();

	};

	var gridUpdate = function () { // Update or create the data table
		
		var columns = new Array();
		
		var options = {
			enableCellNavigation: false,
			enableColumnReorder: false,
			editable: false,
			forceFitColumns: true
		};
		
		if (cvis.data.metricType == "carbon") {
			_.each(chartTemp.focusData.data, function (d, i) {i < cvis.data.plotData.table.length ? cvis.data.plotData.table[i].avgselected = carbonFormatter(d3.mean(d.data, function (e) { return (typeof e.y === "number") ? e.y : 0; })) : null; });
			columns = [
			{id:"PlotColour", name:"Colour", field:"colour", width:60, formatter: Slick.Formatters.Color(chartTemp.color)},
			{id:"Description", name:"Description", field:"description", width:195},
			{id:"StartMonthyear", name:"Start", field:"startmonthyear", width:80},
			{id:"EndMonthyear", name:"End", field:"endmonthyear", width:80},
			{id:"CO2/s selected", name:"g/s Selected", field:"avgselected", width:130},
			{id:"C02/s all", name:"g/s Entire", field:"avgtotal", width:110},
			{id:"TotalCO2", name:"Total CO2 (tonnes)", field:"totalcarbon", width:145}];
		} else {
			_.each(chartTemp.focusData.data, function (d, i) {i < cvis.data.plotData.table.length ? cvis.data.plotData.table[i].avgselected = pwrFormatter(d3.mean(d.data, function (e) { return (typeof e.y === "number") ? e.y : 0; })) : null; });
			columns = [
			{id:"PlotColour", name:"Colour", field:"colour", width:60, formatter: Slick.Formatters.Color(chartTemp.color)},
			{id:"Description", name:"Description", field:"description", width:195},
			{id:"StartMonthyear", name:"Start", field:"startmonthyear", width:80},
			{id:"EndMonthyear", name:"End", field:"endmonthyear", width:80},
			{id:"kWSelected", name:"Avg kW Selected", field:"avgselected", width:130},
			{id:"kWTotal", name:"Avg kW Entire", field:"avgtotal", width:110},
			{id:"TotalEnergy", name:"Total Energy (kWh)", field:"totalenergy", width:145}];
		}
		
		if (typeof that.grid == 'undefined') {
			that.grid = new Slick.Grid("#data-table", cvis.data.plotData.table, columns, options);
		} else {
		that.grid.setData(cvis.data.plotData.table);
		that.grid.setColumns(columns);
		}
		that.grid.render();
		
	}

	var sankey = function () { // Initialise a sankey diagram

		chartTemp = {};
	
		var colScale = d3.scale.category20(); // Color scale defined outside the function so it keeps track of the arguments it's being passed
		
		chartTemp.color = function() {
			if (arguments.length > 1) {
				return chartTemp.color(arguments[0]) != chartTemp.color(arguments[1]);
			} else {
				var desc = arguments[0].split(": ");
				return desc.length > 1 ? colScale(desc[1]) : colScale(desc[0]);
			}	
		}
		
		chartTemp.container = main.append("svg:g").attr("class", "sankeyDiagram chart").attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");
		chartTemp.defs = chartTemp.container.append("defs");
		chartTemp.container.links = chartTemp.container.append("svg:g").attr("class", "links");
		chartTemp.container.nodes = chartTemp.container.append("svg:g").attr("class", "nodes");
		chartTemp.sankey = d3.sankey()
			.nodeWidth(dim.w/35)
			.nodePadding(5)
			.size([dim.w, dim.h1]);
		chartTemp.timestamp = chartTemp.container.append("g").attr("class", "timestamp").attr("transform", "translate(0," + (dim.h1 + dim.spacing) + ")");
		
		that.redraw({});
	
	}

	var sankeyUpdate = function (options) { // Update the sankey diagram
		
		//cvis.data.sankeyTree(options.rootId, options.maxDepth, options.step, options.interval); // Update cvis.data.plotData
		that.treeUpdate({}); // Update the tree
		var sData = cvis.data.plotData;
		
		chartTemp.sankey.nodes(sData.nodes).links(sData.links).layout(32);
		
		var path = chartTemp.sankey.link();
				
		var link = chartTemp.container.links.selectAll(".sLink")
				.data(sData.links, function (d) { d.linkId = d.source.node + "-" + d.target.node; return d.linkId; });

		link.exit().transition().duration(duration).style("opacity", 0).remove(); // Remove links that are no longer needed  
		// Draw links
		link.enter().append("path")
			.attr("class", "sLink")
			.attr("d", path)
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.style("stroke", function(d) {
				if (chartTemp.color(d.source.description, d.target.description)) {
					if (chartTemp.container.select("#grad" + d.linkId).empty()) {
						var gradient = chartTemp.defs.append("linearGradient")
							.attr("id", "grad" + d.linkId)
							.attr("x1", "0%")
							.attr("x2", "100%")
							.attr("y1", "100%")
							.attr("y2", "100%");
								
						gradient.append("stop")
							.attr("offset", "0%")
							.attr("stop-color", chartTemp.color(d.source.description))
							.attr("stop-opacity", 1);
							
						gradient.append("stop")
							.attr("offset", "100%")
							.attr("stop-color", chartTemp.color(d.target.description))
							.attr("stop-opacity", 1);
					} 

					return "url(#grad" + d.linkId + ")";
				} else return chartTemp.color(d.target.description);
			})
			.sort(function(a, b) { return b.dy - a.dy; })
			.append("title")
				.text(function(d) { return d.source.name + " → " + d.target.name + "\n" + pwrFormatter(d.value) + " kW"; });
		// Update links
		var linkUpdate = link.transition().duration(duration).attr("d", path)
				.style("stroke-width", function(d) { return Math.max(1, d.dy); })
				.sort(function(a, b) { return b.dy - a.dy; })
				.select("title")
				.text(function(d) { return d.source.name + " → " + d.target.name + "\n" + pwrFormatter(d.value) + " kW"; });

		var node = chartTemp.container.nodes.selectAll(".sNode")
				.data(sData.nodes, function (d) { return d.node; });
		// Remove nodes that are no longer needed	      
		node.exit().transition().duration(duration).style("opacity", 0).remove();
		// Draw nodes	      
		var nodeEnter = node.enter().append("g")
				.attr("class", "sNode")
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			
		nodeEnter.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", chartTemp.sankey.nodeWidth())
			.style("fill", function(d) {
			return d.color = chartTemp.color(d.description);})
			.style("stroke", function(d) { 
			return d3.rgb(d.color).darker(1); })
			.append("title")
			.text(function(d) { 
			return d.name + "\n" + pwrFormatter(d.value) + " kW"; });

		nodeEnter.filter(function (d) {return true;})
		.append("text")
			.attr("x", -6)
			.attr("y", function(d) { return d.dy / 2; })
			.attr("dy", ".35em")
			.attr("text-anchor", "end")
			.attr("transform", null)
			.style("font-size", function(d) { return ((1-d.x/dim.w)*4+8) + "px"})
			.text(function(d) { return d.name; })
		.filter(function(d) { return d.x < 2 * dim.w / 3; })
			.attr("x", 6 + chartTemp.sankey.nodeWidth())
			.attr("text-anchor", "start");
		// Update nodes
		var nodeUpdate = node.transition().duration(duration)
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		nodeUpdate.select("rect")
				.attr("height", function(d) { return d.dy; })
				.attr("width", chartTemp.sankey.nodeWidth())
				.select("title")
				.text(function(d) { return d.name + "\n" + pwrFormatter(d.value) + " kW"; });
		// Set drag and double click behaviour on nodes
		node.call(d3.behavior.drag()
				.origin(function(d) { return d; })
				.on("dragstart", function() { if (!cvis.ui.sankey.playing) this.parentNode.appendChild(this); })
				.on("drag", dragmove))
				.on("dblclick", function (d) { cvis.ui.tree.nodeClick({"id" : d.node}); });
		
		var textUpdate = nodeUpdate.select("text")
				.attr("y", function(d) { return d.dy / 2; })
				.style("font-size", function(d) { return ((1-d.x/dim.w)*4+8) + "px"; }); // Text size depends on x-position (more nodes to the right), should also depend on number of nodes on the level
				
		textUpdate.filter(function(d) { return d.x < 2 * dim.w / 3; })
				.attr("x", 6 + chartTemp.sankey.nodeWidth())
				.attr("text-anchor", "start");
				
		textUpdate.filter(function(d) { return d.x > 2 * dim.w / 3; })
				.attr("x", -6)
				.attr("text-anchor", "end");
		// Set date text
		if (chartTemp.timestamp.select("text").empty())
			chartTemp.timestamp.append("text").text(function () {
				switch(sData.interval) {
					case "hourly":
						return sData.timestamp.toString("ddd d MMM yyyy hh:mm tt");
						break;
					case "daily":
						return sData.timestamp.toString("ddd d MMM yyyy");
						break;
					case "weekly":
						return sData.timestamp.toString("ddd d MMM yyyy") + " Week " + sData.timestamp.getWeek();
						break;
				}
			}).attr("x", dim.w).attr("alignment-baseline", "text-before-edge").attr("text-anchor", "end");
		else
			chartTemp.timestamp.select("text").text(function () {
				switch(sData.interval) {
					case "hourly":
						return sData.timestamp.toString("ddd d MMM yyyy hh:mm tt");
						break;
					case "daily":
						return sData.timestamp.toString("ddd d MMM yyyy");
						break;
					case "weekly":
						return sData.timestamp.toString("ddd d MMM yyyy") + " Week " + sData.timestamp.getWeek();
						break;
				}
			});
				
		function dragmove(d) { // Handle dragging of nodes
			
			if (!cvis.ui.sankey.playing) {
				d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(dim.h1 - d.dy, d3.event.y))) + ")");
				chartTemp.sankey.relayout();
				link.attr("d", path);
			}
		}
	
	}

	var treeMap = function () { // Initiliase a tree map
		
		chartTemp = {};
		
		var col = d3.scale.category10(); // Color scale defined outside the function so it keeps track of the arguments it's being passed
		
		chartTemp.color = function (d) {

			var h = d.description.split(": ");

			if (h.length > 1)
				return d3.hsl(col(h[1])).darker(Math.log(h.length-1)).toString();
			else
				return col(h[0]);
			
		}
		
		chartTemp.treemap = d3.layout.treemap()
								.size([dim.w, dim.h1])
								.sticky(true)
								.value(function(d) { return d.value });
		
		chartTemp.container = main.append("svg:g")
									.attr("class", "treeMap chart")
									.attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

		chartTemp.container.append("svg:defs")
			.append("svg:clipPath")
				.attr("id", "chartArea")
			.append("svg:rect")
				.attr("width", dim.w)
				.attr("height", dim.h1);
		
		chartTemp.transitioning = false;

		chartTemp.treemap = d3.layout.treemap()
			.children(function(d, depth) { return depth ? null : d.children; })
			.sort(function(a, b) { return a.value - b.value; })
			.ratio(dim.h1 / dim.w * 0.5 * (1 + Math.sqrt(5)))
			.round(false)
			.value(function(d) { return d.value; });
		
		chartTemp.grandparent = chartTemp.container.append("g")
		.attr("class", "grandparent")
		.attr("transform", "translate(0," + (dim.h1 + dim.spacing) + ")");

		chartTemp.grandparent.append("svg:text")
			.attr("x", dim.w)
			.attr("text-anchor", "end")
			.attr("alignment-baseline", "text-before-edge");
			
		that.redraw({});
								
	}

	var treeMapUpdate = function (options) { // Update the tree map
		
		chartTemp.container.select("g.depth").remove();
		chartTemp.x = d3.scale.linear()
			.domain([0, dim.w])
			.range([0, dim.w]);

		chartTemp.y = d3.scale.linear()
			.domain([0, dim.h1])
			.range([0, dim.h1]);
		that.treeUpdate({}); // Update the tree
		var root = cvis.data.plotData;
		
		root.x = root.y = 0;
		root.dx = dim.w;
		root.dy = dim.h1;
		root.depth = 0;

		function accumulate(d) {
			return d.children
				? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
				: d.value;
		}

		function layout(d) {
			if (d.children) {
				chartTemp.treemap.nodes({children: d.children});
				d.children.forEach(function(c) {
					c.x = d.x + c.x * d.dx;
					c.y = d.y + c.y * d.dy;
					c.dx *= d.dx;
					c.dy *= d.dy;
					c.parent = d;
					layout(c);
				});
			}
		}

		function display(d) {
			
			function transition(d) {
				if (chartTemp.transitioning || !d) return;
				chartTemp.transitioning = true;

				var g2 = display(d),
					t1 = g1.transition().duration(750),
					t2 = g2.transition().duration(750);

				// Update the domain only after entering new elements.
				chartTemp.x.domain([d.x, d.x + d.dx]);
				chartTemp.y.domain([d.y, d.y + d.dy]);

				// Enable anti-aliasing during the transition.
				chartTemp.container.style("shape-rendering", null);

				// Draw child nodes on top of parent nodes.
				chartTemp.container.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

				// Fade-in entering text.
				g2.selectAll("text").style("fill-opacity", 0);

				// Transition to the new view.
				t1.selectAll("text.nameTag").call(nameTag).style("fill-opacity", 0);
				t2.selectAll("text.nameTag").call(nameTag).style("fill-opacity", 1);
				t1.selectAll("text.valueTag").call(valueTag).style("fill-opacity", 0);
				t2.selectAll("text.valueTag").call(valueTag).style("fill-opacity", 1);
				t1.selectAll("rect").call(rect);
				t2.selectAll("rect").call(rect);

				// Remove the old node when the transition is finished.
				t1.style("opacity", 0).remove().each("end", function() {
					chartTemp.container.style("shape-rendering", "crispEdges");
					chartTemp.transitioning = false;
				});
			}

			chartTemp.grandparent
						.datum(d.parent)
						.on("click", transition)
						.select("text")
							.text(d.description);

			var g1 = chartTemp.container.append("svg:g")
				.datum(d)
				.attr("class", "depth")
				.attr("clip-path", "url(#chartArea)");

			var g = g1.selectAll("g")
				.data(d.children)
			.enter().append("g");

			g.filter(function(d) { return d.children; })
				.classed("children", true)
				.on("click", transition);

			g.selectAll(".child")
				.data(function(d) { return d.children || [d]; })
			.enter().append("rect")
				.attr("class", "child")
				.attr("fill", function(d) { return chartTemp.color(d); })
				.call(rect);

			g.append("rect")
				.attr("class", "parent")
				.attr("fill", function(d) { return chartTemp.color(d); })
				.call(rect)
			.append("title")
				.text(function(d) { return pwrFormatter(d.value) + " kW"; });

			g.append("text")
				.attr("class", "nameTag")
				.attr("dy", ".75em")
				.text(function(d) { return d.name; })
				.attr("font-size", "12px")
				.attr("fill", "White")
				.call(nameTag);
			
			g.append("text")
				.text(function(d) { return pwrFormatter(d.value) + " kW"; })
				.attr("class", "valueTag")
				.attr("text-anchor", "end")
				.attr("font-size", "10px")
				.attr("fill", "White")
				.call(valueTag);	

			return g;
		}

		function nameTag(text) {
			text.attr("x", function(d) { return chartTemp.x(d.x) + 6; })
				.attr("y", function(d) { return chartTemp.y(d.y) + 6; });
		}
		
		function valueTag(text) {
			text.attr("x", function(d) { return chartTemp.x(d.x + d.dx) - 6; })
				.attr("y", function(d) { return chartTemp.y(d.y + d.dy) - 6; });
		}

		function rect(rect) {
			rect.attr("x", function(d) { return chartTemp.x(d.x); })
				.attr("y", function(d) { return chartTemp.y(d.y); })
				.attr("width", function(d) { return chartTemp.x(d.x + d.dx) - chartTemp.x(d.x); })
				.attr("height", function(d) { return chartTemp.y(d.y + d.dy) - chartTemp.y(d.y); });
		}
		
		accumulate(root);
		layout(root);
		display(root);
		
	}

	var gaussian = function (size, sigma, data) { // Apply a gaussian filter of size and sigma to data

		var sigma = d3.scale.linear().domain([0, 5000]).range([2, 15]);
		var size = d3.scale.linear().domain([0, 5000]).range([5, 100]);

		size = Math.round(size(data.length));
		
		size%2 == 0 ? null : size = size+1; // Get even size number

		var val;
		var kernel = new Array();
		var normalized = new Array();
		var filtered = new Array();

		for (var i = 0; i <= size; i++) {
			val = Math.exp(-Math.pow(i-size/2, 2) / (2 * Math.pow(sigma(data.length), 2)));// Evaluate gaussian
			kernel.push(val);
		}
		var sum = d3.sum(kernel);
		_.each(kernel, function (d) { normalized.push(d / sum) }); // Normalize kernel

		var mean = d3.mean(data, function (d) { return d.y; })

		for (var i=0; i < data.length; i++) {
			var conv = new Array();
			var point = new Object();
			for (var j=0; j < normalized.length; j++) {

				var index = i+j-(normalized.length-1)/2;
			
				if (index >= 0 && index < data.length) {
				conv.push(data[index].y * normalized[j]); // Convolve data with normalized kernel
				} else {
				conv.push(mean * normalized[j]); // Convolve mean value with normalized kernel at boundaries to avoid discontinuities
				}
			};
			point.x = data[i].x;
			point.y = d3.sum(conv);
			filtered.push(point);
		}

		return filtered;
	
	}

}