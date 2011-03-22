display = new Array();
var readings = new Array(); 

function appendData() {
    var tmpString = "<h3>Readings:</h3>\n";
    for (i=0;i<readings.length;i++){
        tmpString = tmpString+"<p> Room: "+readings[i].room+
                                    ", Path: "+readings[i].path+
                                    ", Time Stamp: "+readings[i].ts+
                                    ", Readings: "+readings[i].data.length+
                                    "</p>\n";
        console.log("3."+i+": "+tmpString);
    }
    tmpString = tmpString+"</br>\n";
    $("#jsonData").append(tmpString) ;
}

function getData(url) {
    $.get(
        url,
        function(data) { parseData(data); },
        "text");
}

function parseData(json) {
    readings.push(jQuery.parseJSON(json));
        //console.log(new Date(obj.data[i][0]));
    appendData();
}

function getKHW() {
    kwhs = new Array();
    for (i=0;i<display.length;i++){
        kwhs[i] = display[i][1];
    }
    return kwhs
}

$(document).ready(function() {
    getData("http://www.cl.cam.ac.uk/~pb22/meters.cl.cam.ac.uk/elec/primary-cs1-riser/F-sockets/S-m24-2011-01.json");
    getData("http://www.cl.cam.ac.uk/~pb22/meters.cl.cam.ac.uk/elec/primary-cs1-riser/F-sockets/S-m24-2011-02.json");
    getData("http://www.cl.cam.ac.uk/~pb22/meters.cl.cam.ac.uk/elec/primary-cs1-riser/F-sockets/S-m24-2011-03.json");
});

