      
       function buildTree(checked){
        //Get the sensor index file and build and display the sensor tree.
            sensors = getSensors(indexUrl,checked);
            tree(sensors);
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
            
            //If tree is displayed geographically
            if (checked == "treegeo"){
                //Create object to hold floors
                var objfloor = {"Average":0.0};
                var objmain = {};
                //objmain.Main = objfloor;
                //var objfloor = {};
                for(var i=0;i<elecsensors.length;i++){
                    if (elecsensors[i].sensor == "S-m36"){ 
                        //If sensor = main power, assign its total to the toplevel total
                        objfloor.Average = elecsensors[i].recenttotal / elecsensors[i].datasize;
                        objfloor.Overall = elecsensors[i].path;
                        objmain.Main = objfloor;
                        //objcircuit.Overall = elecsensors[i].path;
                    }
                    else if (elecsensors[i].sensor == "S-m257"){
                        objmain.Average = elecsensors[i].recenttotal / elecsensors[i].datasize;
                        objmain.Overall = elecsensors[i].path;
                        //objmain.Main = objfloor;
                    }
                    var roomArray = elecsensors[i].room.split("");//Split the room number into an array
                    //Get current sensor information
                    var description = elecsensors[i].description;
                    var room = elecsensors[i].room;
                    var path = elecsensors[i].path;
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
                        objfloor[floor] = {"Average":recentaverage};
                        
                    }
                    else{
                        objfloor[floor].Average += recentaverage;
                    }
                    
                    if(!(corridor in objfloor[floor])){
                        objfloor[floor][corridor] = {"Average":recentaverage};
                    }
                    else{
                        objfloor[floor][corridor].Average += recentaverage;
                    }
                    
                    if(!(room in objfloor[floor][corridor])){
                        //If room does not exist, create it and add a sensor into it.
                        objsensor = {"Average":recentaverage};
                        objsensor[description] = path;
                        objfloor[floor][corridor][room] = objsensor;
                        //console.log("is"+objsensor.Total);
                    }
                    else{
                        //If the room does exist, add the current sensor to it, and update it's total
                        objsensor = {};
                        objsensor = objfloor[floor][corridor][room];
                        objsensor[description] = path;
                        //console.log("was:"+objsensor.Total);
                        objsensor.Average += recentaverage;
                        //console.log("is now:"+objsensor.Total);
                        objfloor[floor][corridor][room] = objsensor;
                    }
                    
                }
                //console.log(objfloor);
                treedata.Electricity = new Object();
                treedata.Electricity = objmain;
                return treedata;
            }
            else if (checked == "treeuse"){
                //If tree is displayed by use:
                var objcircuit = {"Average":0.0};
                //object to store circuits,
                for(var i=0;i<elecsensors.length;i++){
                    if (elecsensors[i].sensor == "S-m257"){
                        objcircuit.Average = elecsensors[i].recenttotal / elecsensors[i].datasize;
                        objcircuit.Overall = elecsensors[i].path;
                    }
                    else if (elecsensors[i].sensor != "S-m36"){
                        var roomArray = elecsensors[i].room.split("");
                        var description = elecsensors[i].description;
                        var room = elecsensors[i].room;
                        var path = elecsensors[i].path;
                        var recenttotal = elecsensors[i].recenttotal;
                        var datasize = elecsensors[i].datasize;
                        if (datasize > 0){ var recentaverage = recenttotal / datasize; }
                        else { var recentaverage = 0; }
                        var floor="";
                        //var corridor="";
                        
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
                            objcircuit[description] = {"Average":recentaverage};
                        }
                        else{
                            objcircuit[description].Average += recentaverage;
                        }
                        
                        if(!(floor in objcircuit[description])){
                            //var tmpfloor = "Ground Floor";
                            //var tmpfloor2 = "First Floor";
                            //var tmpfloor3 = "Second Floor";
                            //objcircuit[description][tmpfloor] = {};
                            //objcircuit[description].[tmpfloor[1]] = {};
                            //objcircuit[description].[tmpfloor[2]] = {};
                            objcircuit[description][floor] = {"Average":recentaverage};
                        }
                        else{
                            objcircuit[description][floor].Average += recentaverage;
                        }
                        
                        //if (recenttotal = 0){
                        if(!(room in objcircuit[description][floor])){
                            objcircuit[description][floor][room] = path;
                            //objroom = {"Total":recenttotal};
                            //objsensor[description] = path;
                            //objcircuit[floor][corridor][room] = objsensor;
                            //console.log("is"+objsensor.Total);
                        }
                        else{
                            objcircuit[description][floor][room+"?2"] = path;
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
        
        
            