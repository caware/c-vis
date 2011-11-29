function IntValueStore() {
    //A Class for defining a unique index => Array store
    
    this.index = new Array();
    //This index is a 2D array to store an index value, and information assiociated with it.
    //each array referenced by and index currnetly holds:
    // [AVERAGE, [URL,URL,URL,...], SENSORNAME]
    
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
    
    this.insertItemName = function(value, valueindex){
        this.index[valueindex][2] = value;
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