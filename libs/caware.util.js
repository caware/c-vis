function getJson(url){
    //Fetches a json file and returns the parsed object using the jQuery JSON Parser
    var jsonData = $.ajax({ type: "GET", url: url,async: false }).responseText;
    return jQuery.parseJSON(jsonData);
}

function IntValueStore() {
    //A Class for defining a uniqure index => Array store
    
    this.index = new Array();
    
    this.addNewItem = function(value){
        //Adds a new value to the store and returns its index
        //console.log(typeof value);
        //console.log(value);
        var newarray = [0,[]];
        if(typeof value == "number"){ newarray[0] = value; }
        if(typeof value == "string"){ newarray[1].push(value); }
        this.index.push(newarray);
        //console.log(this.index.length);
        //console.log(this.index);
        return (this.index.length - 1);
    };
    
    this.sumItemAverage = function(value, valueindex){
        //console.log("SumAv, Val: "+value+", @"+valueindex);
        this.index[valueindex][0] += value;
        return this.index[valueindex][0];
    };
    
    this.appendItemURL = function(value, valueindex){
        this.index[valueindex][1].push(value);
    };
    
    this.getItem = function(ind){
        return this.index[ind];
    };
    
    this.removeItem = function(removeindex){
        return this.index.splice(removeindex, 1);
    };
    
    this.clearStore = function(){
        this.index = new Array();
    };
}