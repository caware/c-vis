function tree(sensortree){
            //Create tree from sensor index object.
            
            var root = pv.dom(sensortree)
                .root("Sensors");
            
            var treevis = new pv.Panel()
                .def("i", -1)
                .canvas("treediv")
                .width(300)
                .height(function(){ return((root.nodes().length + 1) * 24);})
                .margin(5);
            
            var layout = treevis.add(pv.Layout.Indent)
                .nodes(function() {return root.nodes();})
                .depth(24)
                .breadth(24);
            
            
            //layout.link.add();
            
            var node = layout.node.add(pv.Panel)
               .top(function(n){return(n.y-6);})
               .height(12)
               .right(6)
               .strokeStyle("none")
               .events("all")
               .event("mousedown", toggle);
            
            var searchColours = false;
            if (plotArray.length > 0){
                searchColours = true;
                
            }
            
            node.anchor("left").add(pv.Dot)
                .radius("7")
                //.shape("triangle")
                .shape(function(n){
                    if (n.nodeName.split(" ",1)[0] == "Average"){return "circle";}
                    //else if  == "Ground" || n.nodeName == "First" || n.nodeName == "Second" || n.nodeName == "Sensors" || n.nodeName == "Electricity"){
                    //    return "triangle";
                    if (!n.toggled && !n.firstChild){return "square";}
                    else {return "triangle";}
                    })
                //.top(5)
                .left(10)
                .angle(function(n){
                    if (n.toggled){return (Math.PI*1.5); }
                    })
                .strokeStyle("#999")
                .fillStyle(function(n){
                    var todaydate = new Date();
                    var year = todaydate.getFullYear();
                    var month = (todaydate.getMonth());//+1);
                    if (month<10){
                        month = "0"+month;
                    }
                        for(x=0; x<plotArray.length; x++){
                            for(y=0; y<plotArray[x].url.length; y++){
                                if(plotArray[x].url[y] == "http://www.cl.cam.ac.uk/meters"+n.nodeValue){
                                //console.log(n.index+" found");
                                //console.log("used "+plotArray[x].colour);
                                    return plotArray[x].colour;
                                }
                            }
                        }
                        if (n.nodeName.split(" ",1)[0] == "Average"){return "#FFFFFF";}
                        if (n.firstChild){ return "#AAAAAA"; }
                        else {return "#FFFFFF";}
                    return "#FF0000";
                    })
                .title(function t(d) d.parentNode ? (t(d.parentNode) + "." + d.nodeName) : d.nodeName)
                .anchor("right").add(pv.Label)
                    .text(function(n){return n.nodeName;})
                    .font("12px/14px Helvetica, Arial, Sans-serif");
                    
            //treevis.render();
            
            var nodes = root.nodes();
            for(var i=0; i<nodes.length;i++){
                var nm = nodes[i].nodeName
                if (nm=="Ground Floor"){nodes[i].toggle();}
                else if (nm=="First Floor"){nodes[i].toggle();}
                else if (nm=="Second Floor"){nodes[i].toggle();}
                else if (nm=="North Corridor"){nodes[i].toggle();}
                else if (nm=="South Corridor"){nodes[i].toggle();}
                else if (nm=="East Corridor"){nodes[i].toggle();}
                else if (nm=="West Corridor"){nodes[i].toggle();}
                else if (nm=="Centre Corridor"){nodes[i].toggle();}
                else if (nm=="Kitchen"){nodes[i].toggle();}
                else if (nm=="External"){nodes[i].toggle();}
                else if (nm=="Computers"){nodes[i].toggle();}
                else if (nm=="A/C"){nodes[i].toggle();}
                else if (nm=="Server Power and Server A/C"){nodes[i].toggle();}
                else if (nm=="Lighting & Power"){nodes[i].toggle();}
                else if (nm=="Lighting"){nodes[i].toggle();}
                else if (nm=="Sockets"){nodes[i].toggle();}
                else if (nm=="Power"){nodes[i].toggle();}
                else if (nm=="computers and A/C"){nodes[i].toggle();}
                else if (nm=="Lighting and Sockets"){nodes[i].toggle();}
                else if (nm=="kitchen plant"){nodes[i].toggle();}
                else if (nm=="Machine room power"){nodes[i].toggle();}
                else if (nm=="Lighting and server A/C"){nodes[i].toggle();}
                if (nm == "Average"){
                    nodes[i].nodeName = "Average this month: "+Math.round(nodes[i].nodeValue*100)/100+" kW";
                }
                for(x=0; x<plotArray.length; x++){
                    for(y=0; y<plotArray[x].url.length; y++){
                        if(plotArray[x].url[y] == "http://www.cl.cam.ac.uk/meters"+nodes[i].nodeValue){
                            //var tmpnode = nodes[i].nodes()[0];
                            //while (typeof(tmpnode.parentNode) != "undefined"){
                            //    console.log("looped!");
                            //    console.log(tmpnode.nodes());
                            //    tmpnode = tmpnode.parentNode;
                            //}
                        //console.log(nodes[i].nodes());
                        }
                    }
                }
                //for(var x=0; x<plotArray.length; x++){
                //    if(!nodes[i].toggled && "http://www.cl.cam.ac.uk/meters"+nodes[i].nodeValue == plotArray[x].url[0]){// nodes[i].toggle();}
                //    //console.log("http://www.cl.cam.ac.uk/meters"+nodes[i].nodeValue+" : "+plotArray[x].url[0]);
                //        console.log("!!");
                //        var tmpnode = nodes[i];
                //        console.log(tmpnode);
                //        while (tmpnode.parentNode){
                //            console.log("!!!");
                //            
                //            tmpnode = tmpnode.parentNode;
                //            console.log(tmpnode);
                //        }
                //        if (tmpnode.toggled){tmpnode.toggle();}
                //    }
                //}
            }
            
            
            treevis.render();
            
            function nodeSort(one, two) {
            
            }
            
            function toggle(n) {
                n.toggle(pv.event.altKey);
                var todaydate = new Date();
                var year = todaydate.getFullYear();
                var month = (todaydate.getMonth()+1);
                if (month<10){
                    month = "0"+month;
                }
                
                if((typeof n.nodeValue != "undefined") && (n.nodeName.substring(0, 7) != "Average")){
                    var plot = {"id":0,"url":new Array(),"description":"",
                        "startmonthyear":year+"-"+month, "endmonthyear":year+"-"+month,
                        "colour":"Colour", "room":"Room",
                        "circuit":"Circuit", "avgselected":10.0,
                        "avgtotal":15.0, "totalenergy":20.0,
                        "maxtime":0, "mintime":0,
                        "maxenergy":0.0, "minenergy":0.0,
                        "data":new Array()}
                    plot.url[0] = "http://www.cl.cam.ac.uk/meters"+n.nodeValue;
                    chart(plot, "single");
                    console.log("Clicked: "+plot.url);
                }
                else if (n.nodeName.substring(0, 7) == "Average"){
                    var plot = {"id":0,"url":new Array(),"description":"",
                        "startmonthyear":year+"-"+month, "endmonthyear":year+"-"+month,
                        "colour":"Colour", "room":"Room",
                        "circuit":"Circuit", "avgselected":10.0,
                        "avgtotal":15.0, "totalenergy":20.0,
                        "maxtime":0, "mintime":0,
                        "maxenergy":0.0, "minenergy":0.0,
                        "data":new Array()}
                    //var tmpnode = n, traversed = false;
                    //while (!traversed){
                    
                    var nodes = n.parentNode.nodes();
                    for (var i=0;i<nodes.length;i++){
                        //if ((typeof siblingnode.nodeValue != "undefined") && (nodes[i].nodeName.substring(0, 7) != "Average")){
                        //    plot.url.push("http://www.cl.cam.ac.uk/meters"+nodes[i].nodeValue);
                        //}
                        if (typeof nodes[i].nodeValue != "undefined"){
                            var siblingnode = nodes[i].nextSibling;
                            while (siblingnode != null) {
                                //var siblingnode = nodes[i].nextSibling
                                if (typeof siblingnode.nodeValue != "undefined"){// && (siblingnode.nodeName.substring(0, 7) == "Average")){
                                    var found = false;
                                    for (var x=0; x<plot.url.length; x++){
                                        if(plot.url[x] == "http://www.cl.cam.ac.uk/meters"+siblingnode.nodeValue){ found=true; break; }
                                    }
                                    if(!found){ 
                                        plot.url.push("http://www.cl.cam.ac.uk/meters"+siblingnode.nodeValue);
                                        //console.log("val: "+siblingnode.nodeValue+", name: "+siblingnode.nodeName);
                                    }
                                }
                                else if ((typeof siblingnode.nodeValue == "undefined") &&
                                    (siblingnode.nodeName.substring(0, 7) != "Average")){
                                    //console.log("extra: "+siblingnode.nodeName+", "+siblingnode.nodeValue);
                                    //console.log(siblingnode);
                                    if (siblingnode.toggled){
                                        //console.log(siblingnode.toggled);
                                        for(var x=0; x<siblingnode.toggled.length; x++){
                                        //    console.log(siblingnode.toggled);
                                            if (typeof siblingnode.toggled[x].nodeValue != "number"){
                                                var found = false;
                                                for (var y=0; y<plot.url.length; y++){
                                                    if(plot.url[y] == "http://www.cl.cam.ac.uk/meters"+siblingnode.toggled[x].nodeValue){ found=true; break; }
                                                }
                                                if(!found){ 
                                                    plot.url.push("http://www.cl.cam.ac.uk/meters"+siblingnode.toggled[x].nodeValue);
                                                //console.log("val: "+siblingnode.nodeValue+", name: "+siblingnode.nodeName);
                                                }
                                            }
                                        }
                                    }
                                    //Get children here, and add plots to url.
                                }
                                siblingnode = siblingnode.nextSibling;
                            }
                        }
                    }
                    //console.log(plot);
                    //chart(plot, "multiple");
                }
                refreshTree();
                return layout.reset().root;
            }
        }
        
        function chart(plotline, type) {
        //Add plotline to plotArray and chart the graphs.
            //if (type == "single") {
                var found = false;
                for (var i=0; i<plotArray.length; i++) {
                    if(plotArray[i].url[0] == plotline.url[0]){
                        found = true;
                        var rem = plotArray.splice(i,1); //Removed var = rem
                        break;
                    }
                }
                if(!found){
                    if (plotArray.length == 5){
                        console.log("Maximum amount of plots already drawn.");
                    }
                    else {
                        plotArray.push(plotline);
                    }
                }
                
                if(plotArray.length == 0){
                    $('#chartdiv').empty();
                    drawgrid();
                    return 0;
                }
                else{
                    for(var i=0; i<plotArray.length; i++){
                        plotArray[i].id = i;
                    }
                }
                
                var jsonArray = new Array([],[],[],[],[]);
                
                for(var i=0;i<plotArray.length;i++){
                    jsonArray[i][0] = getJson(plotArray[i].url+plotArray[i].startmonthyear+".json");
                    var tmptotal = 0;
                    var tmpdata = new Array();
                    
                    plotArray[i].description = jsonArray[i][0].description;
                    plotArray[i].room = jsonArray[i][0].room;
                    plotArray[i].colour = plotColours[i];
                    
                    for (var j=0; j<jsonArray[i][0].data.length; j++){
                        var tmpx = jsonArray[i][0].data[j][0];
                        var tmpy = jsonArray[i][0].data[j][1];
                        tmptotal += tmpy;
                        if (tmpdata.length == 0){
                         plotArray[i].maxtime = tmpx;
                            plotArray[i].mintime = tmpx;
                            plotArray[i].maxenergy = tmpy;
                            plotArray[i].minenergy = tmpy;
                        }
                        else {
                            if (tmpx > plotArray[i].maxtime){plotArray[i].maxtime = tmpx;}
                            else if (tmpx < plotArray[i].mintime){plotArray[i].mintime = tmpx;}
                            if (tmpy > plotArray[i].maxenergy){plotArray[i].maxenergy = tmpy;}
                            else if (tmpy < plotArray[i].minenergy){plotArray[i].minenergy = tmpy;}
                        }
                        
                        tmpdata.push({x:new Date(tmpx),y: tmpy});
                    }
                    plotArray[i].avgtotal = Math.round((tmptotal / tmpdata.length)*1000)/1000;
                    plotArray[i].totalenergy = Math.round(tmptotal*1000)/1000;
                    plotArray[i].data = tmpdata;
                    tmpdata = null;
                    tmptotal = 0;
                }
                
                var dataArray = new Array();
                var start = null;
                var end = null;
                var chartmax = 0;
                
                for (var i=0; i<plotArray.length; i++){
                    if (i == 0){
                        start = new Date(plotArray[0].data[0].x);
                        end = new Date(plotArray[0].data[plotArray[0].data.length - 1].x);
                        chartmax = plotArray[0].data[0].y
                    }
                    else {
                        if (plotArray[i].data[0].x < start){
                            start = new Date(plotArray[i].data[0].x);
                        }
                        if (plotArray[0].data[plotArray[0].data.length - 1].x > end){
                            end = new Date(plotArray[0].data[plotArray[0].data.length - 1].x);
                        }
                    }
                    for (var j=0; j<plotArray[i].data.length; j++){
                        if (plotArray[i].data[j].y > chartmax){
                            chartmax = plotArray[i].data[j].y;
                        }
                    }
                    dataArray.push(plotArray[i].data);
                }
                
            //else if (type == "multiple"){
                //console.log(plotline);
                //$('#chartdiv').empty();
               // plotArray.length = 0;
               // drawgrid();
              //  $('#tablediv').empty();
             //   return 0;
            //}
                var data = dataArray;
                
                /* Scales and sizing. */
                var w = 700,
                    h1 = 300,
                    h2 = 30,
                    x = pv.Scale.linear(start, end).range(0, w),
                    //y = pv.Scale.linear(0, pv.max(data, function(d) d.y)).range(0, h2);
                    y = pv.Scale.linear(0, chartmax).range(0, h2);
                    
                /* Interaction state. Focus scales will have domain set on-render. */
                var i = {x:200, dx:100},
                    fx = pv.Scale.linear().range(0, w),
                    fy = pv.Scale.linear().range(0, h1);
                
                /* Root panel. */
                vis = new pv.Panel()
                    .canvas("chartdiv")
                    .width(w)
                    .height(h1 + 20 + h2)
                    .bottom(20)
                    .left(30)
                    .right(20)
                    .top(5);
                
                
                //var dd = {};
         /* Focus panel (zoomed in). */
            var focus = vis.add(pv.Panel)
                .def("init", function() {
                    var d1 = x.invert(i.x),
                        d2 = x.invert(i.x + i.dx);
                    var dd = [];
                    for(var j=0; j<data.length; j++){//for each line in the data array
                        dd[j] = [];
                        dd[j] = (data[j].slice(Math.max(0, pv.search.index(data[j], d1, function(d) d.x) - 1),
                            pv.search.index(data[j], d2, function(d) d.x) + 1));
                    }
                    fx.domain(d1, d2);
                    
                    var tot = 0;
                    var maxy = 0;
                    var miny = 0;
                    for(var a=0;a<data.length;a++){
                        tot = 0;
                        var tmp = dd[a]
                        for(var b=0; b<tmp.length;b++){
                            tot+=tmp[b].y;
                            if(tmp[b].y > maxy){
                                maxy = tmp[b].y
                            }
                            if(b == 0 && a == 0){miny = tmp[b].y;}
                            else{
                                if(tmp[b].y < miny){miny = tmp[b].y;}
                            }
                        }
                        //tot = tot + dd[a].y;
                        var avg = tot / tmp.length;
                        plotArray[a].avgselected = Math.round(avg*1000)/1000;
                    }
                    
                    //$('#averagekwh').text('Average power for selected region: '+roundavg+" kW.");
                    drawgrid();
                    
                    if (scalefit.checked){ fy.domain([0, maxy]); }
                    else if (scalezoomed.checked){ fy.domain([miny, maxy]); }
                    else if (scaleoriginal.checked){ fy.domain(y.domain()); }
                    return dd;
                })
                .top(0)
                .height(h1);
            
            /* X-axis ticks. */
            focus.add(pv.Rule)
                .data(function(){return fx.ticks(7);})
                .left(fx)
                .strokeStyle("#eee")
                .anchor("bottom").add(pv.Label)
                .text(function(fx){ return zoomDateFormat.format(fx);});
            
            /* Y-axis ticks. */
            focus.add(pv.Rule)
                .data(function() fy.ticks(7))
                .bottom(fy)
                .strokeStyle(function(d) d ? "#aaa" : "#000")
                .anchor("left").add(pv.Label)
                .text(fy.tickFormat);
            
            /* Focus area chart. */
            
            panel = focus.add(pv.Panel)
                .overflow("hidden");
            
            //var selecteddata = focus.innit();
            //var selected = focus.init;
            //console.log(selected);
            //ddobj = {};
            //for(var x=0;x<plotArray.length;x++){
            //    ddobj[x] = dd[x];
            //}
            
            //console.log(plotArray.length);
            //for(var a=0;a<plotArray.length;a++){
            //    panel.add(pv.Line)
            //        .data(function(){debugger; return focus.init(); })
            //        .left(function(d){debugger; return fx(d.x); })
            //        .bottom(function(d){ return fy(d.y); })
            //        .strokeStyle(plotColours[0])
            //        .lineWidth(2);
            //}
            //console.log("plotArray len: "+plotArray.length);
            //for (var i=0; i < plotArray.length; i++) {
            //    console.log("called!:"+focus.init()[0]);
            //    var count = i;
            //    panel.add(pv.Line)
            //        .data(function(){return focus.init()[0];})
            //        .left(function(d){ return fx(d.x); })
            //        .bottom(function(d){ return fy(d.y); })
            //        .strokeStyle(plotColours[0])
            //        .lineWidth(2);
            //};
            
            
            if(plotArray.length == 1){
                panel.add(pv.Line)
                    .data(function(){return focus.init()[0];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[0])
                    .lineWidth(2);
            }
            else if(plotArray.length == 2){
                panel.add(pv.Line)
                    .data(function(){return focus.init()[0];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[0])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[1];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[1])
                    .lineWidth(2);
            }
            else if(plotArray.length == 3){
                panel.add(pv.Line)
                    .data(function(){return focus.init()[0];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[0])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[1];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[1])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[2];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[2])
                    .lineWidth(2);
            }
            else if(plotArray.length == 4){
                panel.add(pv.Line)
                    .data(function(){return focus.init()[0];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[0])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[1];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[1])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[2];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[2])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[3];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[3])
                    .lineWidth(2);
            }
            else if(plotArray.length == 5){
                panel.add(pv.Line)
                    .data(function(){return focus.init()[0];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[0])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[1];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[1])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[2];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[2])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[3];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[3])
                    .lineWidth(2);
                panel.add(pv.Line)
                    .data(function(){return focus.init()[4];})
                    .left(function(d){ return fx(d.x); })
                    .bottom(function(d){ return fy(d.y); })
                    .strokeStyle(plotColours[4])
                    .lineWidth(2);
            }
            
            //debugger;
                //console.log(a);
            //}
            //if(plotArray.length = 2){
            //    panel.add(pv.Line)
            //        .data([new Date(today),new Date(today)])
            //        .left(function(d) fx(d.x))
            //        .bottom(function(d) fy(d.y))
            //        .strokeStyle("black")
            //        .lineWidth(2);
            //}
            //.add(pv.Line)
            //    .data(function() focus.init()[1])
            //    .left(function(d) fx(d.x))
            //    .bottom(function(d) fy(d.y))
            //    .strokeStyle("black")
            //    .lineWidth(2);
             
             //context.add(pv.Line)
             //       .data(data[0])
             //       .left(function(d) x(d.x))
             //       .bottom(function(d) y(d.y))
             //       .lineWidth(2);
            //.add(pv.Area)
            //    .data(function() focus.init())
            //    .left(function(d) fx(d.x))
            //    .bottom(1)
            //    .height(function(d) fy(d.y))
            //    .fillStyle(null)
            //.anchor("top").add(pv.Line)
            //    .fillStyle(null)
            //    .strokeStyle("steelblue")
            //   .lineWidth(2);
            
            //debugger;
            
            /* Context panel (zoomed out). */
            var context = vis.add(pv.Panel)
                .bottom(0)
                .height(h2);
            
            /* X-axis ticks. */
            context.add(pv.Rule)
                .data(x.ticks(7))
                .left(x)
                .strokeStyle("#eee")
            .anchor("bottom").add(pv.Label)
                .text(function(x){ return overallDateFormat.format(x); });
            
            /* Y-axis ticks. */
            context.add(pv.Rule)
                .bottom(0);
            
            /* Context area chart. */
            //context.add(pv.Area)
            //    .data(data[0])
            //    .left(function(d) x(d.x))
            //    .bottom(1)
            //    .height(function(d) y(d.y))
            //    .fillStyle(null)
            //.anchor("top").add(pv.Line)
            //    .strokeStyle("steelblue")
            //.lineWidth(2);
            
            //for(var i=0; i<data.length; i++){
                context.add(pv.Line)
                    .data(data[0])
                    .left(function(d) x(d.x))
                    .bottom(function(d) y(d.y))
                    .lineWidth(2);
            //}
            
            //context.add(pv.Line)
            //        .data(data[1])
            //        .left(function(d) x(d.x))
            //        .bottom(function(d) y(d.y))
            //        .lineWidth(2);
            
            
            /* The selectable, draggable focus region. */
            context.add(pv.Panel)
                .data([i])
                .cursor("crosshair")
                .events("all")
                .event("mousedown", pv.Behavior.select())
                .event("select", focus)
            .add(pv.Bar)
                .left(function(d) d.x)
                .width(function(d) d.dx)
                .fillStyle("rgba(255, 128, 128, .4)")
                .cursor("move")
                .event("mousedown", pv.Behavior.drag())
                .event("drag", focus);
            
            vis.render();
            drawgrid();
        }
        
        var grid;
        
        var columns = [
            //{id:"PlotColour", name:"Colour", field:"colour", width:50},
            {id:"Room", name:"Room", field:"room", width:45},
            {id:"Description", name:"Description", field:"description", width:170},
            {id:"StartMonthyear", name:"Start", field:"startmonthyear", options:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec", editor:SelectCellEditor, width:100},
            {id:"EndMonthyear", name:"End", field:"endmonthyear", options:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec", editor:SelectCellEditor, width:100},
            {id:"kWSelected", name:"Avg kW Selected", field:"avgselected", width:115},
            {id:"kWTotal", name:"Avg kW Total", field:"avgtotal", width:95},
            {id:"TotalEnergy", name:"Total Energy (kWh)", field:"totalenergy", width:126},
            //{id:"Data", name:"Raw Data", field:"rawdata", width50},
        ];
        
        var options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            //asyncEditorLoading: true,
            editable: true
        };
        
        function SelectCellEditor(args) {
            var $select;
            var defaultValue;
            var scope = this;
            
            this.init = function() {
                
                if(args.column.options){
                    opt_values = args.column.options.split(',');
                }else{
                    opt_values ="yes,no".split(',');
                }
                option_str = ""
                for( i in opt_values ){
                    v = opt_values[i];
                    option_str += "<OPTION value='"+v+"'>"+v+"</OPTION>";
                }
                $select = $("<SELECT class='editor-select'>"+ option_str +"</SELECT>");
                $select.appendTo(args.container);
                $select.focus();
            };
            
            this.destroy = function() {
                $select.remove();
            };
            
            this.focus = function() {
                $select.focus();
            };
            
            this.loadValue = function(item) {
                defaultValue = item[args.column.field];
                $select.val(defaultValue);
                //console.log(defaultValue);
            };
            
            this.serializeValue = function() {
                if(args.column.options){
                    return $select.val();
                }else{
                    return ($select.val() == "yes");
                }
            };
            
            this.applyValue = function(item,state) {
                item[args.column.field] = state;
                //console.log(item+"=>"+state);
            };
            
            this.isValueChanged = function() {
                return ($select.val() != defaultValue);
            };
            
            this.validate = function() {
                return {
                    valid: true,
                    msg: null
                };
            };
            
            this.init();
        }
        
        function drawgrid() {
            dataView = new Slick.Data.DataView();
            
            grid = new Slick.Grid("#myGrid", dataView, columns, options);
            
            dataView.beginUpdate();
            dataView.setItems(plotArray);
            dataView.endUpdate();
            
            grid.render();
            
            $("#myGrid").show();
        }