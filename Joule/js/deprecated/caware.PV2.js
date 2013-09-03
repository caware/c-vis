var options = {
        enableCellNavigation: false,
        enableColumnReorder: false,
        editable: false
    };

var carbonColumns = [
            {id:"PlotColour", name:"Colour", field:"colour", width:46, formatter:GraphicalColourCellFormatter},
            {id:"Description", name:"Description", field:"description", width:215},
            {id:"StartMonthyear", name:"Start", field:"startmonthyear", width:79},
            {id:"EndMonthyear", name:"End", field:"endmonthyear", width:79},
            {id:"CO2/s selected", name:"g/s Selected", field:"avgselected", width:115},
            {id:"C02/s all", name:"g/s Entire", field:"avgtotal", width:95},
            {id:"TotalCO2", name:"Total CO2 (tonnes)", field:"totalcarbon", width:126},        ];


var energyColumns = [
            {id:"PlotColour", name:"Colour", field:"colour", width:46, formatter:GraphicalColourCellFormatter},
            {id:"Description", name:"Description", field:"description", width:215},
            {id:"StartMonthyear", name:"Start", field:"startmonthyear", width:79},
            {id:"EndMonthyear", name:"End", field:"endmonthyear", width:79},
            {id:"kWSelected", name:"Avg kW Selected", field:"avgselected", width:115},
            {id:"kWTotal", name:"Avg kW Entire", field:"avgtotal", width:100},
            {id:"TotalEnergy", name:"Total Energy (kWh)", field:"totalenergy", width:130},        ];


var dataView;

var grid;

var minTimeStep = 720000;	// one for the config file...


function drawChart(dataArray,start,end,maxArr,chartcount,plotcol,missingArr,diffArr){
    var data = dataArray;
    var chartmax = 0.0;
    
    for (tmpMax in maxArr){
        if (maxArr[tmpMax] > chartmax){
          	chartmax = maxArr[tmpMax];
        }
    }
    
       // Scales and sizing.
    var w = 750,
        h1 = 310,
        h2 = 50,
        x = pv.Scale.linear(start, end).range(0, w),
        y = pv.Scale.linear(0, chartmax+1).range(0, h2);
            
        
    // Interaction state. Focus scales will have domain set on-render.
        
    var fZoom = {x:config.zoomSize.value.zoomX, dx:config.zoomSize.value.zoomDX};
    var fx = pv.Scale.linear().range(0, w),
        fy = pv.Scale.linear().range(0, h1),
        ft = pv.Scale.linear().range(0, h1);
  

    // Main chart panel. 
    vis = new pv.Panel()
        .canvas("chartdiv")
	.width (w)
        .height(h1 + 30 + h2)
        .bottom(20)
        .left(40)
        .right(20)
        .top(20);


    if (!gotChartWidth) {
	chartWidth=vis.width;
	gotChartWidth = true;
    }
    else vis.width = chartWidth;
        
    function datasel(id){
        config.zoomSize.value.zoomX = fZoom.x;
        config.zoomSize.value.zoomDX = fZoom.dx;
        var d1 = x.invert(config.zoomSize.value.zoomX);
        var d2 = x.invert(config.zoomSize.value.zoomX + config.zoomSize.value.zoomDX);
	if ((d2 - d1) < minTimeStep){
	    d2.setTime (d1.valueOf() + minTimeStep);
	}

        fx.domain(d1, d2);

        var dd = [];
        for(var j=0; j<data.length; j++){//for each line in the data array
            dd[j] = [];
            dd[j] = (data[j].slice(Math.max(0, pv.search.index(data[j], d1, function(d) {return d.x}) - 1),
            pv.search.index(data[j], d2, function(d) {return d.x}) + 1));
        }            	            	
        if (typeof id == 'undefined'){
	    return dd;
        }
        else {
	    return dd[id];
	}
    }
        

        
    function drawgrid() {

	// I really don't like this.  Lack of understanding of slickgrid:
	// why can't we leave dataView and grid through calls?

	dataView = new Slick.Data.DataView();
    	if (carbonOn){
            grid  = new Slick.Grid("#myGrid", dataView, carbonColumns, options);
    	}
    	else {
    	    grid = new Slick.Grid("#myGrid", dataView, energyColumns, options);
    	}

        dataView.beginUpdate();
        dataView.setItems(plotInfo);
        dataView.endUpdate();
        grid.render();
        $("#myGrid").show();
    }
        
    function panelAddLine (panel, ind){
        panel.add(pv.Line)
                .data(function(){ return datasel(ind); })
                .left(function(d){ return fx(d.x); })
                .bottom(function(d){ return fy(d.y); })
                .strokeStyle(plotcol[ind])
                .segmented(true)
                .strokeDasharray(function(d) {return d.bad ? '2,2' : 'none';})
                .interpolate(null)
                .lineWidth(2);
            }


    // Focus panel (zoomed in).
    var focus = vis.add(pv.Panel)
        .def("init", function() {
            date1 = new Date();
            var dd = datasel();
            var tot = 0;
            var maxy = 0;
            var miny = 0;
                
            miny = 100000;
            //if (dd.length > 0) miny = dd[0][0].y;
            for(var a=0;a<data.length;a++){
                tot = 0;
                var tmp = dd[a]
                var count = 0;
                for(var b=0; b<tmp.length;b++){
                    if (typeof tmp[b].y === "number"){
                        tot+=tmp[b].y;
                        if(tmp[b].y > maxy) maxy = tmp[b].y;
                        if(tmp[b].y < miny) miny = tmp[b].y;
                        count++;
                    }
                }
                var avg = 0;                
                if (count > 0)  avg = tot / count;
                var roundavg = Math.round(avg*1000)/1000;
                
                
                if (a < plotInfo.length) plotInfo[a].avgselected = pwrFormatter.format(roundavg);
            }
                
            drawgrid();
			
            if (maxYEver < maxy) maxYEver = maxy;
            
            switch (ui.scaleSelection) {
                case 'all':
                    fy.domain(0, maxYEver * 1.1);
                    break;
                case 'scale':
                    fy.domain(0, maxy * 1.1);
                    break;
                case 'zoom':
                    fy.domain(miny * .8, maxy * 1.1);
                    break;
            }
            return dd;
        })
        .top(0)
        .height(h1);
            
 
    // X-axis ticks. 
    focus.add(pv.Rule)
        .data(function(){return fx.ticks(7);})
        .left(fx)
        .strokeStyle(function(d) { return d ? "#aaa" : "#000";})
        .lineWidth(function(d){
            var tmp = new Date(d);
            if (tmp.getDay() == 6 || tmp.getDay() == 1){
                if (tmp.getHours() == 0){ return 3; }
                else return 1;
            }
            else return 1;
        })
        .anchor("bottom").add(pv.Label)
        .text(function(fx) {return zoomTimeFormat.format(fx);});
        

    focus.add(pv.Rule)
        .data(function(){return fx.ticks(7);})
        .left(fx)
        .strokeStyle("rgba(255,255,255,0)")
        .anchor("top").add(pv.Label)
        .text(function(fx){return zoomDateFormat.format(fx);});
                

    // Y-axis ticks.
    focus.add(pv.Rule)
        .data(function() {return fy.ticks(7); })
        .bottom(fy)
        .strokeStyle(function(d) {return d ? "#aaa" : "#000"; })
        .anchor("left").add(pv.Label)
        .text(fy.tickFormat);
 
        
    // Focus area chart.
        
  
    panel = focus.add(pv.Panel)
        .overflow("hidden");

    for (var cc=chartcount-1; cc>=0; cc--){
        panelAddLine(panel, cc);
    }


    // Context panel (zoomed out).
    var context = vis.add(pv.Panel)
        .bottom(0)
        .height(h2);
        
    // X-axis ticks.
    context.add(pv.Rule)
        .data(x.ticks(5))
        .left(x)
        .lineWidth(function(d){
            var tmp = new Date(d);
            if (tmp.getDay() == 6 || tmp.getDay() == 1){
                if (tmp.getHours() == 0){ return 3; }
                else return 1;
            }
            else return 1;
        })
        .strokeStyle("#aaa")
        .anchor("bottom").add(pv.Label)
        .text(function(x){return overallDateFormat.format(x); });
       
    // Y-axis ticks.
    context.add(pv.Rule)
        .bottom(0);
        
    var totdata = [];
        
    if (data.length > 0) {
        if (data[0].length < 600) totdata = data;
        else {
            var mydiv = data[0].length / 600;
            var rounddiv = Math.round(mydiv*1)/1;
            
            for(var p=0; p<data.length; p++){
                for(var q=0; q<data[p].length;q++){
                    if (q == 0) totdata[p]=[];
                    if (q%rounddiv == 0) totdata[p].push(data[p][q]);
                }
            }
        }
    }
    
    for(var j=0; j<data.length; j++){
        context.add(pv.Line)
            .data(totdata[j])
            .left(function(d){ return x(d.x); })
            .bottom(function(d) { return y(d.y); })
            .strokeStyle(plotcol[j])
            .segmented(true)
            .strokeDasharray(function(d){return  d.bad ? '2,2' : 'none'; })
            .lineWidth(2);
    }
       

    
    // The selectable, draggable focus region.
    context.add(pv.Panel)
        .data([fZoom])
        .cursor("crosshair")
        .events("all")
        .event("mousedown", pv.Behavior.select())
        .event("select", focus)
        .add(pv.Bar)
        .left(function(d){ return d.x; })
        .width(function(d) { return d.dx; })
        .fillStyle("rgba(100, 128, 255, .3)")
        .cursor("move")
        .event("mousedown", pv.Behavior.drag())
        .event("drag", focus);
        
    context.add(pv.Dot)
        .left(0)
        .bottom(25)
        .shape("triangle")
        .angle(Math.PI*0.5)
        .size(110)
        .strokeStyle("#0069d6")
        .lineWidth(3)
        .cursor("pointer")
        .events("all")
        .event("click", function(){ui.addMonth(ui);} );

    vis.render();
}
    
///////////////////////////////////////////////////////////////////////////////////////////////////////
    
function tree(sensortree,type){

    //Create tree from sensor index object.
    
    // Handle flipping of tree node selection
    
    function toggle(n) {
        n.toggle(pv.event.altKey);
        //If the node clicked is a leaf node need to change plot
 
        if ((typeof n.nodeValue === "number")) {
            var index = n.nodeValue;
            ui.treeNodeClick(index, ui);
            }
        return layout.reset().root;
    }
 

  
  
    //Specify the root node from the tree JS object
    
    var root = pv.dom(sensortree)
        .root(treeTitle);


    //Create the root visualisation panel
    var treevis = new pv.Panel()
        .canvas("treediv")
        .width(250)
        .height(function(){return((root.nodes().length + 1) * 24);})
        .margin(5);


        
    //Create the Indentation layout
    var layout = treevis.add(pv.Layout.Indent)
        .nodes(function() {return root.nodes();})
        .depth(24)
        .breadth(24);
 

       
    //Add nodes to the layout
    var node = layout.node.add(pv.Panel)
        .top(function(n){return(n.y-6);})
        .height(12)
        .right(6)
        .strokeStyle("none")
        .fillStyle("rgb(235, 235, 235)")
        .events("all")
        .cursor("pointer")
        .event("mousedown", toggle);
 

       
    node.anchor("left").add(pv.Dot)
        .radius("7")
        .shape(function(n){
            if (!n.toggled && !n.firstChild) return "square";
            else return "triangle";
        })
        .left(10)
        .angle(function(n){
            if (n.toggled){return (Math.PI*1.5); }
        })
        .strokeStyle("#999")
        .fillStyle(function(n){
            if (n.hasOwnProperty ("pLInd")){
                if (plotLineDesc[n.pLInd].selected){
                    return  colourpool[plotLineDesc[n.pLInd].colour];
                }
                else {
                    return  "#FFFFFE";
                }
            }
            else {
                return "#AAAAAA";
            }
        })
        .title(function t(d){ d.parentNode ? (t(d.parentNode) + "." + d.nodeName) : d.nodeName;})
        .anchor("right").add(pv.Label)
        .text(function(n){return n.nodeName;})
        .font("12px/14px Helvetica, Arial, Sans-serif");
            
  
  
  
    // toggle any nodes with children, other than the top node
    
    var nodes = root.nodes();
    var ind = 0;
    for (var i=0; i<nodes.length;i++){     
         if (i>0) nodes[i].toggle();
         if (!nodes[i].hasOwnProperty("firstChild")) nodes[i].pLInd = ind++;
    }

    treevis.render();
}

