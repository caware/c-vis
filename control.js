display = new Array();

function displayData(display) {
    document.getElementById("dataPlaceholder").innerHTML=display;
}

function getData() {
    $.get(
        "http://www.cl.cam.ac.uk/~pb22/meters.cl.cam.ac.uk/elec/primary-cs1-riser/F-sockets/S-m24-2011-03.json",
        function(data) { parseData(data); },
        "text");
}

function parseData(json) {
    //Fix bad quotes and no quotes around strings:
    //var tmpjson = json.replace(/\'/g, "\"")
    var obj = jQuery.parseJSON(json);//.replace(/\'/g, "\""));
    display = new Array();
    for (i=0;i<obj.data.length;i++){
        var tmpArray = new Array();
        tmpArray[0] = new Date(obj.data[i][0]);
        console.log(new Date(obj.data[i][0]));
        tmpArray[1] = obj.data[i][1];
        console.log(obj.data[i][1]);
        console.log(tmpArray);
        display[i] = tmpArray;
    }
    displayData("Data: "+obj.data+"\n Date: "+display);
}

function getKHW() {
    kwhs = new Array();
    for (i=0;i<display.length;i++){
        kwhs[i] = display[i][1];
    }
    return kwhs
}

$(document).ready(function() {
    getData();
});

