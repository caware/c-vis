var jsonFiles=new Array();
jsonFiles[0]="http://www.cl.cam.ac.uk/~pb22/meters.cl.cam.ac.uk/elec/primary-cs1-riser/F-sockets/S-m24-2011-03.json";
//jsonFiles[1]="http://www.cl.cam.ac.uk/~pb22/meters.cl.cam.ac.uk/elec/primary-cs1-riser/F-sockets/S-m24-2011-02.json";
//jsonFiles[2]="http://www.cl.cam.ac.uk/~pb22/meters.cl.cam.ac.uk/elec/primary-cs1-riser/F-sockets/S-m24-2011-03.json";

var readings = new Array();
var concatdata = new Array();
var maxtime = 0;
var mintime = 0;
var maxvalue = 0.0;
var minvalue = 0.0;

//function appendData() {
//    var tmpString = "<h3>Readings:</h3>\n";
//    for (i=0;i<readings.length;i++){
//        tmpString = tmpString+"<p> Room: "+readings[i].room+
//                                    ", Path: "+readings[i].path+
//                                    ", Time Stamp: "+readings[i].ts+
//                                    ", Readings: "+readings[i].data.length+
//                                    "</p>\n";
//    }
//    tmpString = tmpString+"</br>\n";
//    $("#jsonData").append(tmpString);
//}

function getData(url) {
    //var dataURL = "http://www.cl.cam.ac.uk/~pb22/meters.cl.cam.ac.uk/elec/primary-cs1-riser/F-sockets/S-m24-2011-03.json";
    //var JSONdata = $.ajax({ type: "GET", url: dataURL,async: false }).responseText;
    //parseData(JSONdata);
    $.get(
        url,
        function(data) { parseData(data); },
        "text");
}

function parseData(json) {
    var readjson = jQuery.parseJSON(json);
    //console.log(readjson.data);
    //readings.push(readjson);
    //appendData();
    for (i=0; i<readjson.data.length; i++){
        var tmpx = readjson.data[i][0];
        var tmpy = readjson.data[i][1];
        if (concatdata.length == 0){
            maxtime = tmpx;
            mintime = tmpx;
            maxvalue = tmpy;
            minvalue = tmpy;
        }
        else {
            // Scaling stuff to get biggest and smallest values for charting
            if (tmpx > maxtime){maxtime = tmpx;}
            else if (tmpx < mintime){mintime = tmpx;}
            if (tmpy > maxvalue){maxvalue = tmpy;}
            else if (tmpy < minvalue){minvalue = tmpy;}
        }
        concatdata = concatdata.concat({x:new Date(tmpx),y: tmpy});
    }
    console.log("concatdatalength:"+concatdata.length);
    //chart();
    //tree();
}

$(document).ready(function() {
    //for(i=0;i<jsonFiles.length;i++){
      getData(jsonFiles[0]);
    //}
    $("#buttonchart").click(function(){
        //getData(jsonFiles[0]);
        chart();
    });
    $("#buttontree").click(function(){
        //getData(jsonFiles[0]);
        tree();
    });
});
