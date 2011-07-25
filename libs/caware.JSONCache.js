function JSONCache() {
    //A Class for defining a unique index => JSON store
    
    this.cache = {};
    
    this.getObject = function(url){
        //Fetches a json file from the cache, or downloads and inserts it if not already there.
        
        var found = false;
        for (var c in this.cache){
            if (this.cache.hasOwnProperty(c)){
                if( c == url){
                    found = true;
                    break;
                }
            }
        }
        
        if (found){
            console.log('Cache Hit!');
            return jQuery.parseJSON(this.cache[url]);
        }
        else{ 
            var jsonfile = $.ajax({ type: "GET", url: url,async: false }).responseText;
            this.cache[url] = jsonfile;
            console.log('Cache Miss!');
            return jQuery.parseJSON(jsonfile);
        }
    };
    
    this.refreshCache = function(value, valueindex){
        return 0;
    };
    
    this.clearCache = function(){
        this.cache = {};
    };
}