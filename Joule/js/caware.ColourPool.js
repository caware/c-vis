function ColourPool(colourarray) {
    //A Class for defining a unique index => Array store
    
    this.colours = colourarray;
    this.setcolours = {};
    
    this.setColour = function(id){
        if (this.colours.length == 0) return 0;
        this.setcolours[id] = this.colours[0];
        this.colours.splice(0, 1);
        return this.setcolours[id];
    };
    
    this.unsetColour = function(id){
        if (this.setcolours.hasOwnProperty(id)){
            this.colours.unshift(this.setcolours[id]);
            delete this.setcolours[id];
            return 1;
        }
        else return 0;
    };
    
    this.toggleColour = function(id){
        if (this.setcolours.hasOwnProperty(id)){
            this.colours.unshift(this.setcolours[id]);
            delete this.setcolours[id];
            return 0;
        }
        else{
            if (this.colours.length == 0) return -1;
            this.setcolours[id] = this.colours[0];
            this.colours.splice(0, 1);
            return this.setcolours[id];
        }
    
    };
    
    this.getColour = function(id){
        if (this.setcolours.hasOwnProperty(id)){
            return this.setcolours[id];
        }
        else return 0;
    };
}