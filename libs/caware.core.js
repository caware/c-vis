       function buildTree(checked){
        //Get the sensor index file and build and display the sensor tree.
            sensors = getSensors(indexUrl,checked);
            tree(sensors,checked);
        }
        
        function refreshTree(){
        //Check that the sensors index file has been run at least once to collect data, and refresh the tree
            if (typeof sensors != "underfined"){  
                tree(sensors);
            }
            else{
                console.log("getSensors not yet called!");
            }
        }
        
        function getSensors(indexfile,checked){
        //Get the sensor index file and build the JS object tree from it.
            //var jsonData = $.ajax({ type: "GET", url: indexfile ,async: false }).responseText;
            var sensorindex = getJson(indexfile)
            
            //Get array of sensors from index file, and create blank destination object
            var elecsensors = sensorindex.sensors.elec;
            var treedata = new Object();
            var bld = 'Whole Building';
            
            //If tree is displayed geographically
            if (checked == "treegeo"){
                treeIndex.clearStore();
                //Create object to hold floors
                var objfloor = {"Average":treeIndex.addNewItem(0)};
                var objmain = {"Average":treeIndex.addNewItem(0)};
                //var objfloor = {};
                for(var i=0;i<elecsensors.length;i++){
                    var path = elecsensors[i].path;
                    if (elecsensors[i].sensor == "S-m36"){
                        var bld = 'Whole Building S-m36';
                        objfloor[bld] = null;
                        //If sensor = main power, assign its total to the toplevel total
                        var av = (elecsensors[i].recenttotal / elecsensors[i].datasize);
                        objfloor.Average = treeIndex.addNewItem(av);
                        objfloor[bld] = treeIndex.addNewItem(elecsensors[i].path);
                        objmain.Main = objfloor;
                        //objcircuit.Overall = elecsensors[i].path;
                    }
                    else if (elecsensors[i].sensor == "S-m257"){
                        var bld = 'Whole Building S-m257';
                        objmain[bld] = null;
                        var av = elecsensors[i].recenttotal / elecsensors[i].datasize;
                        objmain.Average = treeIndex.addNewItem(av);
                        objmain[bld] = treeIndex.addNewItem(elecsensors[i].path);
                        //objmain.Main = objfloor;
                    }
                    else{
                    
                        treeIndex.appendItemURL(path,objfloor.Average);
                        treeIndex.appendItemURL(path,objmain.Average);
                    
                        var roomArray = elecsensors[i].room.split("");//Split the room number into an array
                        //Get current sensor information
                        var description = elecsensors[i].description;
                        var room = elecsensors[i].room;
                        var recenttotal = elecsensors[i].recenttotal;
                        var datasize = elecsensors[i].datasize;
                        if (datasize > 0){ var recentaverage = recenttotal / datasize; }
                        else { var recentaverage = 0; }
                        var floor="";
                        var corridor="";
                        
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
                            objfloor[floor] = {"Average":treeIndex.addNewItem(recentaverage)};
                            treeIndex.appendItemURL(path,objfloor[floor].Average);
                            
                        }
                        else{
                            //var oldaverage = treeIndex.getValue(objfloor[floor].Average);
                            var ind = objfloor[floor].Average;
                            treeIndex.sumItemAverage(recentaverage, ind);
                            treeIndex.appendItemURL(path, ind);
                        }
                        
                        if(!(corridor in objfloor[floor])){
                            //var array = new Array(recentaverage, "");
                            objfloor[floor][corridor] = {"Average":treeIndex.addNewItem(recentaverage)};
                            treeIndex.appendItemURL(path,objfloor[floor][corridor].Average)
                        }
                        else{
                            var ind = objfloor[floor][corridor].Average;
                            treeIndex.sumItemAverage(recentaverage,ind);
                            treeIndex.appendItemURL(path, ind);
                        }
                        
                        if(!(room in objfloor[floor][corridor])){
                            //If room does not exist, create it and add a sensor into it.
                            //var array = new Array(recentaverage, "");
                            //objsensor = {"Average":treeIndex.addNewItem(recentaverage)};
                            objsensor = {};
                            objsensor[description] = treeIndex.addNewItem(path);
                            objfloor[floor][corridor][room] = objsensor;
                            //console.log("is"+objsensor.Total);
                        }
                        else{
                            //If the room does exist, add the current sensor to it, and update it's total
                            objsensor = {};
                            objsensor = objfloor[floor][corridor][room];
                            objsensor[description] = treeIndex.addNewItem(path);
                            //console.log("was:"+objsensor.Total);
                            //treeIndex.sumItemAverage(recentaverage, objsensor[description]);
                            //console.log("is now:"+objsensor.Total);
                            objfloor[floor][corridor][room] = objsensor;
                        }
                    }
                    
                }
                //console.log(objfloor);
                treedata.Electricity = new Object();
                treedata.Electricity = objmain;
                return treedata;
            }
            else if (checked == "treeuse"){
                //If tree is displayed by use:
                treeIndex.clearStore();
                var objcircuit = {"Average":treeIndex.addNewItem(0)};
                objcircuit[bld] = null;
                //object to store circuits,
                for(var i=0;i<elecsensors.length;i++){
                    var path = elecsensors[i].path;
                    if (elecsensors[i].sensor == "S-m257"){
                        var av = (elecsensors[i].recenttotal / elecsensors[i].datasize);
                        //objcircuit.Average = treeIndex.addNewItem(av);
                        objcircuit[bld] = treeIndex.addNewItem(av);
                        treeIndex.appendItemURL(elecsensors[i].path, objcircuit[bld]);
                    }
                    else if (elecsensors[i].sensor != "S-m36"){
                        treeIndex.appendItemURL(path, objcircuit.Average);
                        
                        
                        var roomArray = elecsensors[i].room.split("");
                        var description = elecsensors[i].description;
                        var room = elecsensors[i].room;
                        
                        var recenttotal = elecsensors[i].recenttotal;
                        var datasize = elecsensors[i].datasize;
                        if (datasize > 0){ var recentaverage = recenttotal / datasize; }
                        else { var recentaverage = 0; }
                        var floor="";
                        treeIndex.sumItemAverage(recentaverage, objcircuit.Average);
                        
                        var objroom = new Object();
                        var objfloor = new Object();
                        //console.log(roomArray);
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
                            objcircuit[description] = {"Average":treeIndex.addNewItem(recentaverage)};
                            treeIndex.appendItemURL(path,objcircuit[description].Average);
                        }
                        else{
                            //objcircuit[description].Average += recentaverage;
                            var ind = objcircuit[description].Average;
                            treeIndex.sumItemAverage(recentaverage, ind);
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
                            objcircuit[description][floor] = {"Average":treeIndex.addNewItem(recentaverage)};
                            treeIndex.appendItemURL(path,objcircuit[description][floor].Average);
                        }
                        else{
                            //objcircuit[description][floor].Average += recentaverage;
                            var ind = objcircuit[description][floor].Average;
                            treeIndex.sumItemAverage(recentaverage,ind);// += recentaverage;
                            treeIndex.appendItemURL(path, ind);
                        }
                        
                        //if (recenttotal = 0){
                        if(!(room in objcircuit[description][floor])){
                            objcircuit[description][floor][room] = treeIndex.addNewItem(path);
                            //objroom = {"Total":recenttotal};
                            //objsensor[description] = path;
                            //objcircuit[floor][corridor][room] = objsensor;
                            //console.log("is"+objsensor.Total);
                        }
                        else{
                            var tmpobj = {};
                            
                            objcircuit[description][floor][room+"|2"] = treeIndex.addNewItem(path);
                            //objroom = {};
                            //objroom = objcircuit[floor][corridor][room];
                            //objsensor[description] = path;
                            console.log("Sensor "+elecsensors[i].path+" in room "+room+" already in object!");
                            //objsensor.Total += recenttotal;
                            //console.log("is now:"+objsensor.Total);
                            //objcircuit[floor][corridor][room] = objsensor;
                        }
                    }
                }
                //console.log(objfloor);
                treedata.Electricity = new Object();
                treedata.Electricity = objcircuit;
                return treedata;
            }
        }
        
        
        
