       function buildTree(indexUrl, checked){
        //Get the sensor index file and build and display the sensor tree.
            //console.log(checked);
            sensors = getSensors(indexUrl,checked);
            tree(sensors,checked);
        }
        
        function refreshTree(){
        //Check that the sensors index file has been run at least once to collect data, and refresh the tree
            if (typeof sensors != "underfined"){  
                tree(sensors);
            }
            else{
                //console.log("getSensors not yet called!");
            }
        }
        
        function getSensors(indexfile,checked){
            //Get the sensor index file and build the JS object tree from it.
            //ui.catchError(ui, cache.getObject, ["http://www.cl.cam.ac.uk/~cce25/config.json"]).config;
            var elecsensors = ui.catchError(ui, cache.getObject, [indexfile]).sensors.elec;
            
            //Get array of sensors from index file, and create blank destination object
            //var elecsensors = sensorindex.sensors.elec;
            var treedata = new Object();
            var bld = 'Building';
            
            //If tree is displayed geographically
            if (checked == "treegeo"){
                treeIndex.clearStore();
                //Create object to hold floors
                var objfloor = {"Average":treeIndex.addNewItem(0)};
                
                for(var i=0;i<elecsensors.length;i++){
                    var path = elecsensors[i].path;
                    
                    //var key = "monthly-readings";
                    //var avtot = 0;
                    //var sensorpath = elecsensors[i].path.match(/^.*\//)[0];
                    //var recentreading = getJson(config.sensorFilesUrl.value+sensorpath+elecsensors[i][key][0]);
                    //var avlength = recentreading.data.length;
                    //console.log("http://www.cl.cam.ac.uk/meters"+sensorpath+elecsensors[i][key][0]);
                    //for (var x = 0; x < avlength; x++){
                    //    avtot += recentreading.data[x][1];
                    //}
                    //if (avlength == 0){
                    //    var av = 0;
                    //}
                    //else {
                    //    var av = (avtot / avlength);
                    //}
                    //console.log("====");
                    //console.log(path);
                    //console.log(av);
                    //console.log(sensorAccess.getLatestAverage(path));
                    
                    var sensorIgnored = false;
                    for (var x = 0; x < config.sensorIgnore.value.length; x++){
                        if (config.sensorIgnore.value[x] == elecsensors[i].sensor) {sensorIgnored = true; break;}
                    }
                    var sensorAverageIgnored = false;
                    for (var x = 0; x < config.sensorNoAverage.value.length; x++){
                        if (config.sensorNoAverage.value[x] == elecsensors[i].sensor) {
                            sensorAverageIgnored = true;
                            //av = 0;
                            break;
                        }
                    }
                    
                    if (!sensorAverageIgnored){var av = sensorAccess.getLatestAverage(path);}
                    else {var av = 0;}
                    
                    
                    if (elecsensors[i].sensor == "S-m36"){
                        var bld = 'Building (S-m36)';
                        //objfloor[bld] = null;
                        //If sensor = main power, assign its total to the toplevel total
                        //var av = (elecsensors[i].recenttotal / elecsensors[i].datasize);
                        //objfloor.Average = treeIndex.addNewItem(av);
                        //objfloor[bld] = treeIndex.addNewItem(elecsensors[i].path);
                        objfloor[bld] = treeIndex.addNewItem(av);
                        treeIndex.appendItemURL(elecsensors[i].path, objfloor[bld]);
                        //objmain.Main = objfloor;
                        //objcircuit.Overall = elecsensors[i].path;
                    }
                    else if (elecsensors[i].sensor == "S-m257"){
                        var bld = 'Building (S-m257)';
                        //objmain[bld] = null;
                        //var av = elecsensors[i].recenttotal / elecsensors[i].datasize;
                        objfloor[bld] = treeIndex.addNewItem(av);
                        treeIndex.appendItemURL(elecsensors[i].path, objfloor[bld]);
                        //objmain.Average = treeIndex.addNewItem(elecsensors[i].path);
                        //objmain[bld] = treeIndex.addNewItem(av);
                        //objmain.Main = objfloor;
                    }
                    
                    else if (!sensorIgnored){
                    
                        //add sensors to the overall averages nodes
                        //console.log(sensorpath);
                        if (!sensorAverageIgnored){ treeIndex.appendItemURL(path,objfloor.Average); }
                        
                        //treeIndex.appendItemURL(path,objmain[bld]);
                    
                        var roomArray = elecsensors[i].room.split("");//Split the room number into an array
                        //Get current sensor information
                        var description = elecsensors[i].description;
                        var room = elecsensors[i].room;
                        
                        if ("coverage" in elecsensors[i]){
                            if (elecsensors[i].coverage != "cOVERAGE"){
                                room += " ("+elecsensors[i].coverage+")";
                            }
                        }
                        
                        //var recenttotal = elecsensors[i].recenttotal;
                        //var datasize = elecsensors[i].datasize;
                        //if (datasize > 0){ var recentaverage = recenttotal / datasize; }
                        //else { var recentaverage = 0; }
                        var floor="";
                        var corridor="";
                        if (!sensorAverageIgnored){ treeIndex.sumItemAverage(av, objfloor.Average); }
                        
                        //Create holding objects for rooms and corridors
                        var objroom = new Object();
                        var objcorridor = new Object();
                        //Identify rooms
                        switch (roomArray[0]){
                            case "G":
                                floor="Ground Floor";
                                break;
                            case "F":
                                floor="First Floor";
                                break;
                            case "S":
                                floor="Second Floor";
                                break;
                        }
                        
                        switch (roomArray[1]){
                            case "N":
                                corridor="North Corridor";
                                break;
                            case "E":
                                corridor="East Corridor";
                                break;
                            case "S":
                                corridor="South Corridor";
                                break;
                            case "W":
                                corridor="West Corridor";
                                break;
                            case "C":
                                corridor="Centre Corridor";
                                break;
                        }
                        
                        //If floors or corridors do not yet exist in the tree, create them
                        //If they do, update their totals with the current sensors recenttotal.
                        if(!(floor in objfloor)){
                            //var array = new Array(recentaverage, "");
                            objfloor[floor] = {"Average":treeIndex.addNewItem(av)};
                            treeIndex.appendItemURL(path,objfloor[floor].Average);
                            
                        }
                        else{
                            //var oldaverage = treeIndex.getValue(objfloor[floor].Average);
                            var ind = objfloor[floor].Average;
                            treeIndex.sumItemAverage(av, ind);
                            treeIndex.appendItemURL(path, ind);
                        }
                        
                        if(!(corridor in objfloor[floor])){
                            //var array = new Array(recentaverage, "");
                            objfloor[floor][corridor] = {"Average":treeIndex.addNewItem(av)};
                            treeIndex.appendItemURL(path,objfloor[floor][corridor].Average)
                        }
                        else{
                            var ind = objfloor[floor][corridor].Average;
                            treeIndex.sumItemAverage(av,ind);
                            treeIndex.appendItemURL(path, ind);
                        }
                        
                        if(!(room in objfloor[floor][corridor])){
                            //If room does not exist, create it and add a sensor into it.
                            objsensor = {};
                            objsensor[description] = treeIndex.addNewItem(path);
                            objfloor[floor][corridor][room] = objsensor;
                        }
                        else{
                            //If the room does exist, add the current sensor to it, and update it's total
                            objsensor = {};
                            objsensor = objfloor[floor][corridor][room];
                            objsensor[description] = treeIndex.addNewItem(path);
                            objfloor[floor][corridor][room] = objsensor;
                        }
                        
                    }
                    av = null;
                    
                }
                treedata.Electricity = new Object();
                treedata.Electricity = objfloor;
                return treedata;
            }
            else if (checked == "treeuse"){
                //console.log("TESIG USE");
                //If tree is displayed by use:
                treeIndex.clearStore();
                var objcircuit = {"Average":treeIndex.addNewItem(0)};
                var objStats = {"Total Monitored Diff":treeIndex.addNewItem(0)};
                treeIndex.appendItemURL("dataDiff", objStats["Total Monitored Diff"]);
                //treeIndex.insertSensorType("dataDiff", objStats["Total Monitored Diff"]);
                //objStats.Missing = {"Average":treeIndex.addNewItem(0)};
                
                objcircuit[bld] = null;
                //objStats = {}
                //object to store circuits,
                for(var i=0;i<elecsensors.length;i++){
                    var path = elecsensors[i].path;
                    //var key = "monthly-readings";
                    //var avtot = 0;
                    //var sensorpath = elecsensors[i].path.match(/^.*\//)[0];
                    //var recentreading = getJson(config.sensorFilesUrl.value+sensorpath+elecsensors[i][key][0]);
                    //var avlength = recentreading.data.length;
                    //console.log("http://www.cl.cam.ac.uk/meters"+sensorpath+elecsensors[i][key][0]);
                    //for (var x = 0; x < avlength; x++){
                    //    avtot += recentreading.data[x][1];
                    //}
                    //if (avlength == 0){
                    //    var av = 0;
                    //}
                    //else {
                    //    var av = (avtot / avlength);
                    //}
                    
                    var sensorIgnored = false;
                    for (var x = 0; x < config.sensorIgnore.value.length; x++){
                        if (config.sensorIgnore.value[x] == elecsensors[i].sensor) {sensorIgnored = true; break;}
                    }
                    var sensorAverageIgnored = false;
                    for (var x = 0; x < config.sensorNoAverage.value.length; x++){
                        if (config.sensorNoAverage.value[x] == elecsensors[i].sensor) {sensorAverageIgnored = true; break;}
                    }
                    
                    //if (!sensorAverageIgnored){
                    var av = sensorAccess.getLatestAverage(path);//}
                    //else {var av = 0;}
                    
                    if (elecsensors[i].sensor == "S-m36"){
                        //get most vrecent reading,
                        //work out size and total thus.
                        objcircuit[bld] = treeIndex.addNewItem(av);
                        treeIndex.appendItemURL(elecsensors[i].path, objcircuit[bld]);
                        //treeIndex.insertDataPolarity(path, "-");
                        treeIndex.appendItemURL(path,objStats["Total Monitored Diff"]);
                    }
                    
                    else if (elecsensors[i].sensor != "S-m257" && !sensorIgnored){
                        
                        if (!sensorAverageIgnored){ treeIndex.appendItemURL(path, objcircuit.Average); }
                        //treeIndex.appendItemURL(path, objcircuit.Average);
                        
                        //console.log(elecsensors[i]);
                        var roomArray = elecsensors[i].room.split("");
                        var description = elecsensors[i].description;
                        var room = elecsensors[i].room;
                        //console.log(elecsensors[i].coverage);
                        if ("coverage" in elecsensors[i]){
                            if (elecsensors[i].coverage != "cOVERAGE"){
                                room += " ("+elecsensors[i].coverage+")";
                            }
                        }
                        
                        //var recenttotal = elecsensors[i].recenttotal;
                        //var datasize = elecsensors[i].datasize;
                        //if (datasize > 0){ var recentaverage = recenttotal / datasize; }
                        //else { var recentaverage = 0; }
                        var floor="";
                        //treeIndex.sumItemAverage(av, objcircuit.Average);
                        if (!sensorAverageIgnored){ 
                            treeIndex.sumItemAverage(av, objcircuit.Average);
                            //treeIndex.sumItemAverage(av, objStats.Missing.Average);
                            treeIndex.appendItemURL(path,objStats["Total Monitored Diff"]);
                        }
                        
                        var objroom = new Object();
                        var objfloor = new Object();
                        
                        switch (roomArray[0]){
                            case "G":
                                floor="Ground Floor";
                                break;
                            case "F":
                                floor="First Floor";
                                break;
                            case "S":
                                floor="Second Floor";
                                break;
                        }
                        
                        if(!(description in objcircuit)){
                            //objcircuit[description] = {"Average":recentaverage};
                            objcircuit[description] = {"Average":treeIndex.addNewItem(av)};
                            treeIndex.appendItemURL(path,objcircuit[description].Average);
                        }
                        else{
                            //objcircuit[description].Average += recentaverage;
                            var ind = objcircuit[description].Average;
                            treeIndex.sumItemAverage(av, ind);
                            treeIndex.appendItemURL(path, ind);
                        }
                        
                        if(!(floor in objcircuit[description])){
                            //var tmpfloor = "Ground Floor";
                            //var tmpfloor2 = "First Floor";
                            //var tmpfloor3 = "Second Floor";
                            //objcircuit[description][tmpfloor] = {};
                            //objcircuit[description].[tmpfloor[1]] = {};
                            //objcircuit[description].[tmpfloor[2]] = {};
                            //objcircuit[description][floor] = {"Average":recentaverage};
                            objcircuit[description][floor] = {"Average":treeIndex.addNewItem(av)};
                            treeIndex.appendItemURL(path,objcircuit[description][floor].Average);
                        }
                        else{
                            //objcircuit[description][floor].Average += recentaverage;
                            var ind = objcircuit[description][floor].Average;
                            treeIndex.sumItemAverage(av,ind);// += recentaverage;
                            treeIndex.appendItemURL(path, ind);
                        }
                        
                        if(!(room in objcircuit[description][floor])){
                            objcircuit[description][floor][room] = treeIndex.addNewItem(path);
                        }
                        else{
                            var tmpobj = {};
                            objcircuit[description][floor][room+"|2"] = treeIndex.addNewItem(path);
                        }
                    }
                    av = null;
                }
                treedata.Electricity = new Object();
                treedata.Electricity = objcircuit;
                treedata.Stats = objStats;
                return treedata;
            }
        }
