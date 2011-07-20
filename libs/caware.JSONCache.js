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
        
        if (found) return this.cache[url];
        else{ 
            var json = jQuery.parseJSON($.ajax({ type: "GET", url: url,async: false }).responseText);
            this.cache[url] = json;
            return json;
        }
    };
    
    this.refreshCache = function(value, valueindex){
        return 0;
    };
    
    this.clearCache = function(){
        this.cache = {};
    };
}