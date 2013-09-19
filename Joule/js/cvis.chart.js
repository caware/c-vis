function chart(options) {

	this.filter = false;
	this.areas = true;
	this.cols = nulls(10);
	this.type = "line";
	this.changing = true;
	this.data = new Object();
	this.rootData = new Object();
	var that = this;
	var chartTemp = {};
	this.dim = {
	      "w" : 750,
	      "h1" : 400,
	      "spacing" : 30,
	      "h2" : 50,
	      "margin" : {
		"top" : 30,
		"right" : 20,
		"bottom" : 20,
		"left" : 30
	      }
	};
	
	var dim = this.dim;
	var duration = 800;
	//if (options)
	
	var main = d3.select("#chartBody").append("svg")
		  .attr("width", dim.w + dim.margin.left + dim.margin.right)
		  .attr("height", dim.margin.top + dim.margin.bottom + dim.h1 + dim.spacing + dim.h2);
		  
	main.append("svg:rect").attr("width", dim.w + dim.margin.left + dim.margin.right)
				.attr("height", dim.margin.top + dim.h1 + dim.spacing + dim.h2 + dim.margin.bottom)
				.attr("stroke", "lightgray")
				.attr("stroke-width", 1)
				.attr("fill", "none");
	
	//main.append("rect").attr("height", dim.margin.top + dim.margin.bottom + dim.h1 + dim.spacing + dim.h2).attr("width", dim.w + dim.margin.left + dim.margin.right).attr("fill", "black");
	
this.col = function (id) {

  _.each(this.cols, function (v, k, l) { _.some(cvis.tree.selected, function (d) { return d.id == v; }) ? l[k] = v : l[k] = null; });

  var index =_.indexOf(this.cols, id) == -1 ? _.indexOf(this.cols, null) :  _.indexOf(this.cols, id);
  this.cols[index] = id;

  return d3.scale.category10().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(index);

};

this.sliceData = function (range) {

	if (typeof range == 'undefined') {
		console.error("Undefined range");
		chartTemp.focusData = cvis.data.plotData.data;
		chartTemp.fx.domain([cvis.data.plotData.start, cvis.data.plotData.end]);
	} else {
		chartTemp.fx.domain(range);
		// Slice the data array to include data within range
		var slicedData = [];
		for(var j=0; j<cvis.data.plotData.data.length; j++){
		    slicedData[j] = [];
		    var remapped = _.map(_.pluck(cvis.data.plotData.data[j].data, "x"), function (d) { return d.getTime(); });
		    slicedData[j].data = (cvis.data.plotData.data[j].data.slice(
		      Math.max(0, _.sortedIndex(remapped, range[0].getTime(), null, true) - 1), // Take one extra value on each side of the range to show data at limits
		      _.sortedIndex(remapped, range[1].getTime(), null, true) +1
		    ));
		    that.filter ? slicedData[j].data = gaussian(5, 3, slicedData[j].data) : null;
		    slicedData[j].id = cvis.data.plotData.data[j].id;
		}
		
		chartTemp.focusData = {};
		chartTemp.focusData.data = slicedData;

	}

	var trimmedData = [];

	if (cvis.data.plotData.data.length > 0) {
	    if (cvis.data.plotData.data[0].data.length < 600) {
		for (var i=0; i < cvis.data.plotData.data.length; i++) {
		  trimmedData[i] = new Object();
		  trimmedData[i].id = cvis.data.plotData.data[i].id;
		  trimmedData[i].data = new Array();
		  that.filter ? trimmedData[i].data = gaussian(5, 3, cvis.data.plotData.data[i].data) : trimmedData[i].data = cvis.data.plotData.data[i].data;
		}
	    } else {
		var mydiv = cvis.data.plotData.data[0].data.length / 600;
		var rounddiv = Math.round(mydiv*1)/1;
		
		for(var p=0; p<cvis.data.plotData.data.length; p++){
		    for(var q=0; q<cvis.data.plotData.data[p].data.length;q++){
			if (q == 0) {
			    trimmedData[p] = new Object();
			    trimmedData[p].data = new Array();
			}
			if (q%rounddiv == 0) {
			  trimmedData[p].data.push(cvis.data.plotData.data[p].data[q]);
			}
		    }
		    that.filter ? trimmedData[p].data = gaussian(5, 3, trimmedData[p].data) : null;
		    trimmedData[p].id = cvis.data.plotData.data[p].id;
		}
	    }
	}

	chartTemp.contextData = {};
	chartTemp.contextData.data = trimmedData;
		
	chartTemp.focusData.yMax = d3.max(chartTemp.focusData.data, function (d) { return d3.max(d.data, function (e) { return typeof e.y === "number" ? e.y : 0; }); });
	chartTemp.focusData.yMin = d3.min(chartTemp.focusData.data, function (d) { return d3.min(d.data, function (e) { return typeof e.y === "number" ? e.y : 0; }); });
	_.each(chartTemp.focusData.data, function (d, i) {i < cvis.data.plotData.table.length ? cvis.data.plotData.table[i].avgselected = pwrFormatter(d3.mean(d.data, function (e) { return (typeof e.y === "number") ? e.y : 0; })) : null; });
	
	switch (cvis.ui.scaleSelection) {
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
    
}

this.draw = function (options) {

  if (!this.changing) {
    this.redraw(options);
    return;
  }

  switch (this.type) {
    case "line":
      d3.select(".chart").remove();
      line();
      this.changing = false;
      break;
    case "sankey":
      d3.select(".chart").remove();
      this.sankey();
      this.changing = false;
      break;
    case "pie":
      d3.select(".chart").remove();
      this.pie();
      this.changing = false;
      break;
    default:
      this.line();
      this.changing = false;
  }
  
}

this.redraw = function (options) {

  switch (this.type) {
    case "line":
      lineUpdate();
      break;
    case "sankey":
      this.sankeyUpdate(options);
      break;
    case "pie":
      this.pieUpdate(options);
      break;
    default:
      lineUpdate();
  }
  
}

var line = function () {
	
	chartTemp = {};    
	
	// Set scales
	
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
				lineUpdate(true);
			    });
	
	chartTemp.fZoom = d3.behavior.zoom().scaleExtent([1, Infinity])
			    .on("zoom", function() {

				if (Math.abs(chartTemp.fx.domain()[1] - chartTemp.fx.domain()[0]) > 3600000) {
				  chartTemp.zoomedIn = d3.event.scale == 1 ? false : true;
				  chartTemp.currentScale = d3.event.scale;
				  chartTemp.currentDomain = chartTemp.fx.domain();
				  chartTemp.cBrush.extent(chartTemp.currentDomain);
				  lineUpdate(true, true);
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
	      
	lineUpdate();
};

var lineUpdate = function (refresh, zoom) {
	
  if (!refresh) {
	
	cvis.data.lineData();
    
	chartTemp.cx.domain([cvis.data.plotData.start, cvis.data.plotData.end]);
	chartTemp.cy.domain([0, cvis.data.plotData.yMax]);
	
	if (chartTemp.cBrush.empty() || chartTemp.cBrush.extent()[0].isBefore(cvis.data.plotData.start)) {
	      var i = {x: cvis.config.zoomSize.value.zoomX, dx: cvis.config.zoomSize.value.zoomDX};
	      var d1 = chartTemp.cx.invert(config.zoomSize.value.zoomX);
	      config.zoomSize.value.zoomX = i.x;
	      var d2 = chartTemp.cx.invert(config.zoomSize.value.zoomX + config.zoomSize.value.zoomDX);
	      config.zoomSize.value.zoomDX = i.dx;
	      chartTemp.cBrush.extent([d1, d2]);
	} else {
	  chartTemp.cBrush.extent(chartTemp.cBrush.extent());
	}

	chartTemp.context.select("g.brush")
		.call(chartTemp.cBrush);
		
	that.sliceData(chartTemp.cBrush.extent());

	chartTemp.focus.selectAll(".f-line")
	      .data(chartTemp.focusData.data, function (d, i) { return d.id; })
	      .enter().insert("svg:g", ".zoom")
		.attr("class", "f-line").append("svg:path")
		  .attr("d", function (d) { return chartTemp.focusLine(d.data); })
		  .attr("class", function (d, i) { return "focusLine" + d.id; })
		  .attr("clip-path", "url(#focusViewport)")
		  .style("stroke", function(d, i) { return that.col(d.id); }).style("stroke-width", 2).style("fill", "none").style("shape-rendering", "geometricPrecision")
		  .style("opacity", 1);
	
	chartTemp.focus.selectAll(".f-area")
	      .data(chartTemp.focusData.data, function (d, i) { return d.id; })
	      .enter().insert("svg:g", ".zoom")
	      .attr("class", "f-area").append("svg:path")
		  .attr("d", function (d) { return chartTemp.focusArea(d.data); })
		  .attr("class", function (d, i) { return "focusArea" + d.id; })
		  .style("fill", function(d, i) {
		    
		    if (chartTemp.container.select("#grad" + _.indexOf(that.cols, d.id)).empty()) {
		      var gradient = chartTemp.defs.append("linearGradient")
				    .attr("id", "grad" + _.indexOf(that.cols, d.id))
				    .attr("x1", "100%")
				    .attr("x2", "100%")
				    .attr("y1", "100%")
				    .attr("y2", "0%");
				    
		      gradient.append("stop")
			      .attr("offset", "0%")
			      .style("stop-color", that.col(d.id))
			      .style("stop-opacity", 0)
			      
		      gradient.append("stop")
			      .attr("offset", "100%")
			      .style("stop-color", that.col(d.id))
			      .style("stop-opacity", 1)      
		    } 
		    
		    return "url(#grad" + _.indexOf(that.cols, d.id) + ")";
		    
		  })
		  .attr("clip-path", "url(#focusViewport)")
		  .style("display", that.areas ? "inline" : "none");
		  
	chartTemp.focus.selectAll(".f-line")
	      .data(chartTemp.focusData.data, function (d, i) { return d.id; }).exit().remove();    
	   
	chartTemp.focus.selectAll(".f-area")
	      .data(chartTemp.focusData.data, function (d, i) { return d.id; }).exit().remove();
	      
	chartTemp.context.selectAll(".c-line")
	      .data(chartTemp.contextData.data, function (d, i) { return d.id + "#" + d.data.length; })
	      .enter().insert("svg:g", ".brush")
	      .attr("class", "c-line")
		.append("svg:path")
		  .attr("d", function (d) { return chartTemp.contextLine(d.data); })
		  .attr("class", function (d, i) { return "contextLine" + d.id;})
		  .style("stroke", function(d, i) { return that.col(d.id); })
		  .attr("clip-path", "url(#contextViewport)")
		  .style("stroke-width", 2)
		  .style("fill", "none")
		  .style("shape-rendering", "geometricPrecision");
	
	chartTemp.context.selectAll(".c-line")
	      .data(chartTemp.contextData.data, function (d, i) { return d.id + "#" + d.data.length; }).exit().remove();	      	  
  }

  if (refresh && zoom) chartTemp.context.select("g.brush").call(chartTemp.cBrush);
  
  if (!zoom) {
    chartTemp.fx.domain(chartTemp.cBrush.empty() ? chartTemp.fx.domain() : chartTemp.cBrush.extent())
    chartTemp.fZoom.x(chartTemp.fx);
  }
  
  that.sliceData(chartTemp.fx.domain());
  _.each(cvis.data.plotData.data, function(d, i) { chartTemp.focus.select(".focusLine" + d.id).attr("d", chartTemp.focusLine(chartTemp.focusData.data[i].data)); });
  _.each(cvis.data.plotData.data, function(d, i) { chartTemp.focus.select(".focusArea" + d.id).attr("d", chartTemp.focusArea(chartTemp.focusData.data[i].data)); });
  _.each(cvis.data.plotData.data, function(d, i) { chartTemp.context.select(".contextLine" + d.id).attr("d", chartTemp.contextLine(chartTemp.contextData.data[i].data)); });
  chartTemp.focus.select(".fx.axis").call(chartTemp.xAxisFocusBottom);
  chartTemp.focus.select(".fx2.axis").call(chartTemp.xAxisFocusTop);
  chartTemp.focus.select(".fy.axis").transition().call(chartTemp.yAxisFocus);
  chartTemp.context.select(".cx.axis").transition().call(chartTemp.xAxisContext);

  that.gridUpdate();

};
	    
this.gridUpdate = function () {
	
	var columns = new Array();
	
	var options = {
	    enableCellNavigation: false,
	    enableColumnReorder: false,
	    editable: false,
	    forceFitColumns: true
	};
	
	if (cvis.data.metricType == "carbon"){
	    _.each(chartTemp.focusData, function (d, i) {i < cvis.data.plotData.table.length ? cvis.data.plotData.table[i].avgselected = carbonFormatter.format(d3.mean(d, function (e) { return (typeof e.y === "number") ? e.y : 0; })) : null; });
	    columns = [
		{id:"PlotColour", name:"Colour", field:"colour", width:60, formatter: Slick.Formatters.Color},
		{id:"Description", name:"Description", field:"description", width:195},
		{id:"StartMonthyear", name:"Start", field:"startmonthyear", width:80},
		{id:"EndMonthyear", name:"End", field:"endmonthyear", width:80},
		{id:"CO2/s selected", name:"g/s Selected", field:"avgselected", width:130},
		{id:"C02/s all", name:"g/s Entire", field:"avgtotal", width:110},
		{id:"TotalCO2", name:"Total CO2 (tonnes)", field:"totalcarbon", width:145}];
	} else {
	    _.each(chartTemp.focusData, function (d, i) {i < cvis.data.plotData.table.length ? cvis.data.plotData.table[i].avgselected = pwrFormatter.format(d3.mean(d, function (e) { return (typeof e.y === "number") ? e.y : 0; })) : null; });
	    columns = [
		{id:"PlotColour", name:"Colour", field:"colour", width:60, formatter: Slick.Formatters.Color},
		{id:"Description", name:"Description", field:"description", width:195},
		{id:"StartMonthyear", name:"Start", field:"startmonthyear", width:80},
		{id:"EndMonthyear", name:"End", field:"endmonthyear", width:80},
		{id:"kWSelected", name:"Avg kW Selected", field:"avgselected", width:130},
		{id:"kWTotal", name:"Avg kW Entire", field:"avgtotal", width:110},
		{id:"TotalEnergy", name:"Total Energy (kWh)", field:"totalenergy", width:145}];
	}
	
	
	if (typeof this.grid == 'undefined')
	  this.grid = new Slick.Grid("#myGrid", cvis.data.plotData.table, columns, options);
	else {
	  this.grid.setData(cvis.data.plotData.table);
	  this.grid.setColumns(columns);
	}
	this.grid.render();
    
}

this.sankey = function () {
	
	chartTemp = {};
  
	this.sColor = d3.scale.category10();
	
	d3.select("g.sankeyDiagram").remove();
	chartTemp.container = main.append("svg:g").attr("class", "sankeyDiagram chart").attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");
	chartTemp.defs = chartTemp.container.append("defs");
	chartTemp.container.links = chartTemp.container.append("svg:g").attr("class", "links");
	chartTemp.container.nodes = chartTemp.container.append("svg:g").attr("class", "nodes");
	chartTemp.sankeyGen = d3.sankey()
	      .nodeWidth(dim.w/35)
	      .nodePadding(5)
	      .size([dim.w, dim.h1]);
	
	this.sankeyUpdate({});
  
}

this.sankeyUpdate = function (options) {
	 
	var duration = 400;
	cvis.data.sankeyTree(options.rootId, options.maxDepth)
	this.treeUpdate();
	var sData = cvis.data.plotData;
	
	chartTemp.sankeyGen.nodes(sData.nodes).links(sData.links)
	      .layout(32);
	
	var path = chartTemp.sankeyGen.link();
		      
	var link = chartTemp.container.links.selectAll(".sLink")
		      .data(sData.links, function (d) { d.linkId = d.source.node + "-" + d.target.node; return d.linkId; });
	
	link.exit().transition().duration(duration).style("opacity", 0).remove();	      
	
	var linkEnter = link.enter().append("path")
		      .attr("class", "sLink")
		      .attr("d", path)
		      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		      .attr("stroke", function(d) {
		    
			if (that.sColor(d.source.description.replace(/: .*/, "")) != that.sColor(d.target.description.replace(/: .*/, ""))) {
			    if (chartTemp.container.select("#grad" + d.linkId).empty()) {
			      var gradient = chartTemp.defs.append("linearGradient")
					    .attr("id", "grad" + d.linkId)
					    .attr("x1", "0%")
					    .attr("x2", "100%")
					    .attr("y1", "100%")
					    .attr("y2", "100%");
					    
			      gradient.append("stop")
				      .attr("offset", "0%")
				      .attr("stop-color", that.sColor(d.source.description.replace(/: .*/, "")))
				      .attr("stop-opacity", 1);
				      
			      gradient.append("stop")
				      .attr("offset", "100%")
				      .attr("stop-color", that.sColor(d.target.description.replace(/: .*/, "")))
				      .attr("stop-opacity", 1);
	  
			    } 

			    return "url(#grad" + d.linkId + ")";
			} else return that.sColor(d.target.description.replace(/: .*/, ""));
		    
		  }).sort(function(a, b) { return b.dy - a.dy; });
	
	linkEnter.append("title")
		    .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + pwrFormatter(d.value) + " kW"; });
	
	var linkUpdate = link.transition().duration(duration).attr("d", path)
		      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		      .sort(function(a, b) { return b.dy - a.dy; })
		      .select("title")
			.text(function(d) { return d.source.name + " → " + d.target.name + "\n" + pwrFormatter(d.value) + " kW"; });

	var node = chartTemp.container.nodes.selectAll(".sNode")
		      .data(sData.nodes, function (d) { return d.node; });
		      
	node.exit().transition().duration(duration).style("opacity", 0).remove();
		      
	var nodeEnter = node.enter().append("g")
		      .attr("class", "sNode")
		      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	    
	nodeEnter.append("rect")
	      .attr("height", function(d) { return d.dy; })
	      .attr("width", chartTemp.sankeyGen.nodeWidth())
	      .style("fill", function(d) { 
		  return d.color = that.sColor(d.description.replace(/: .*/, "")); })
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
	    .attr("x", 6 + chartTemp.sankeyGen.nodeWidth())
	    .attr("text-anchor", "start");
	
	var nodeUpdate = node.transition().duration(duration)
			      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
	node.call(d3.behavior.drag()
		      .origin(function(d) { return d; })
		      .on("dragstart", function() { this.parentNode.appendChild(this); })
		      .on("drag", dragmove))
		    .on("dblclick", function (d) { ui.treeNodeClick({"id" : d.node}); })		      
			      
	nodeUpdate.select("rect")
	      .attr("height", function(d) { return d.dy; })
	      .attr("width", chartTemp.sankeyGen.nodeWidth())
	      .select("title")
		.text(function(d) { return d.name + "\n" + pwrFormatter(d.value) + " kW"; });
	
	var textUpdate = nodeUpdate.select("text")
		    .attr("y", function(d) { return d.dy / 2; })
		    .style("font-size", function(d) { return ((1-d.x/dim.w)*4+8) + "px"; });
		    
	textUpdate.filter(function(d) { return d.x < 2 * dim.w / 3; })
		    .attr("x", 6 + chartTemp.sankeyGen.nodeWidth())
		    .attr("text-anchor", "start");
		    
	textUpdate.filter(function(d) { return d.x > 2 * dim.w / 3; })
		    .attr("x", -6)
		    .attr("text-anchor", "end");
	      
	function dragmove(d) {
	  d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(dim.h1 - d.dy, d3.event.y))) + ")");
	  chartTemp.sankeyGen.relayout();
	  link.attr("d", path);
	}
  
}

this.pie = function () {
  
	chartTemp = {};
	
	this.sColor = d3.scale.category10();
	
	d3.select("g.pie").remove();
	chartTemp.container = main.append("svg:g").attr("class", "pie chart").attr("transform", "translate(" + dim.w/2 + "," + dim.h1/2 + ")");
	chartTemp.defs = chartTemp.container.append("defs");
	
	chartTemp.pie = d3.layout.pie()
			  .value(function (d) { return d.value; })
			  .sort(null);
			  
	chartTemp.arc = d3.svg.arc()
			  .outerRadius(dim.h1/2*0.8);
			  
	this.pieUpdate({"rootId" : 34});
  		  
}

this.pieUpdate = function (options, recursion) {
	
	if (typeof options.recursion == 'undefined') recursion = 0;
	else recursion = options.recursion;
  
	cvis.data.pieData(options.rootId);
	
	var pData = cvis.data.plotData;
	
	chartTemp.slices = chartTemp.container.append("g").attr("class", "depth" + recursion).selectAll("g.slice")
				.data(chartTemp.pie(pData.values), function (d) { return d.data.id; });
				
	chartTemp.slices.exit().remove();
				
	chartTemp.sliceEnter = chartTemp.slices.enter().append("g")
				.attr("class", "slice");
				
	chartTemp.sliceEnter.append("svg:path")
			  .attr("fill", function (d, i) { console.log(d); return that.sColor(i); })
			  .attr("d", chartTemp.arc)
			  .on("dblclick", function (d, i) {

			    if (cvis.tree.plotLineDesc[d.data.id].hasOwnProperty("children")) {
			      chartTemp.container.select("g.depth" + recursion).transition().duration(1000)
				  .attr("transform", "translate(-300," + (recursion-1)*120 + ") scale(0.3)")
				  .attr("class", "smallPie").on("dblclick", null);
			      cvis.data.plot({"rootId" : d.data.id, "recursion" : recursion+1});
			    }
			    
			  });
			  
	chartTemp.sliceEnter.append("svg:text")
			  .attr("text-anchor", "middle")
			  .attr("font-size", "8px")
			  .text(function (d, i) { return pData.values[i].name; })
			  .attr("transform", function (d) { 
			    
			    d.innerRadius = 0;
			    d.outerRadius = dim.h1/2*0.8;

			    var x = chartTemp.arc.centroid(d)[0]*2.5;
			    var y = chartTemp.arc.centroid(d)[1]*2.5;
			    
			    return "translate(" + x + "," + y + ")";
			    
			  });
	  
	if (chartTemp.container.select("text.pieTitle").empty())
	  chartTemp.container.append("text").attr("class", "pieTitle")
			      .attr("transform", "translate(0," + (dim.h1 + dim.spacing)/2 + ")")
			      .attr("text-anchor", "middle")
			      .text(cvis.tree.plotLineDesc[pData.rootId].description);
	else
	  chartTemp.container.select("text.pieTitle").text(cvis.tree.plotLineDesc[pData.rootId].description);
	
			    
}

var gaussian = function (size, sigma, data) {
	
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

this.tree = function (sensorTree) {
	    
	var self = this;
 
	var dim = {
	  "w" : 300,
	  "elHeight" : 20,
	  "elWidth" : 170,
	  "h" : 800,
	  "margin" : {
	    "top" : 30,
	    "bottom" : 30,
	    "left" : 5
	  }
	};
	
	this.tree = d3.layout.tree()
		      .size([dim.h, 40]);
		      			 
	this.vis = d3.select("#treediv").append("svg:svg")
		      .attr("class", "tree")
		      .attr("width", dim.w)
		     .append("svg:g")
		       .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");
	
	this.rootData.name = dev_tree.title;
	this.rootData.x0 = 0;
	this.rootData.y0 = 0;
	this.rootData.dim = dim;
	this.rootData.children = mapper(cvis.tree.plotLineDesc);
	this.treeUpdate();
	
}

this.treeUpdate = function (source) {
		
	if (typeof source == 'undefined') {
	  source = this.rootData;
	}

	updater(this.rootData.children, cvis.tree.plotLineDesc);

	var self = this;
	var duration = 200;
	var i =0;
	var dim = this.rootData.dim;
	var nodes = this.tree.nodes(this.rootData);

	nodes.forEach(function(n, i) {
	  n.x = i * dim.elHeight;
	});

	var node = this.vis.selectAll("g.node")
		      .data(nodes, function(d) { return d.id; });
		      
	var nodeEnter = node.enter().append("svg:g")
			    .attr("class", "node")
			    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
			    .style("opacity", 1e-6);    

	nodeEnter.append("svg:rect")
		  .attr("y", -dim.elHeight)
		  .attr("height", dim.elHeight)
		  .attr("width", dim.elWidth)
		  .style("fill", color)
		  .style("fill-opacity", function(d) { return d.selected ? 0.65 : (d.children || d._children) ? 0.65 : 0.3; })
		  .attr("rx", 3)
		  .attr("ry", 3)
		  .on("click", click);
		  
	nodeEnter.filter(function (d) { return !(d.children || d._children); }).append("svg:rect")
		  .attr("class", "colorRect")
		  .attr("y", -dim.elHeight + 3)
		  .attr("x", 150)
		  .attr("rx", 3)
		  .attr("ry", 3)
		  .attr("height", 0.7 * dim.elHeight)
		  .attr("width", 0.7 * dim.elHeight);
		  
	nodeEnter.append("svg:text")
		  .attr("dy", -6.5)
		  .attr("dx", 5.5)
		  .style("fill", function(d) { return d.selected ? "white" : "gray"; })
		  .text(function(d) { return d.name; });
		  
	nodeEnter.append("svg:title")
		  .text(function(d) { return d.description; });
		  
	nodeEnter.transition()
		  .duration(duration)
		  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
		  .style("opacity", 1);
		  
	var nodeUpdate = node.transition()
	      .duration(duration)
	      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
	      .style("opacity", 1);

	nodeUpdate.select("rect")
	      .style("fill", color)
	      .style("fill-opacity", function(d) { return d.selected ? 0.65 : (d.children || d._children) ? 0.65 : 0.3;  });
	
	nodeUpdate.select("text")
	      .style("fill", function(d) { return d.selected ? "white" : "black"; })
	      
	nodeUpdate.select(".colorRect")
	      .style("fill", function(d) { return d.error ? "lightgray" : d.selected ? self.type == "sankey" ? self.sColor(d.description.replace(/: .*/, "")) : self.col(d.id) : "white" });
	      
	node.exit().transition()
	      .duration(duration)
	      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	      .style("opacity", 1e-6)
	      .remove();
	    
	nodes.forEach(function(d) {
	    d.x0 = d.x;
	    d.y0 = d.y;
	  });

	d3.select("svg.tree").attr("height", dim.elHeight * nodes.length + dim.margin.top + dim.margin.bottom);
	
	function click(d) {
	    if (d.error) {
	      self.treeUpdate(d);
	      return;
	    }
	    if (d.hasOwnProperty("children") && d.children.length) {
	      d._children = d.children;
	      d.children = [];
	    } else if (d.hasOwnProperty("_children") && d._children.length) {
	      d.children = d._children;
	      d._children = [];
	    } else {
	      ui.treeNodeClick(d, ui);
	    }
	    self.treeUpdate(d);
	}

	function color(d) {
	    return d._children ? "lightskyblue" : d.children ? "lightskyblue" : d.error ? "lightgray" : d.selected ? self.type == "sankey" ? self.sColor(d.description.replace(/: .*/, "")) : self.col(d.id) : "white";
	}
		
}

}