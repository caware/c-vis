function JSONCache() {
    //A Class for defining a unique index => JSON store
    
    this.cache = {};
    
    this.cachehits = 0;
    this.cachemisses = 0;
    
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
            this.cachehits++;
            return jQuery.parseJSON(this.cache[url]);
        }
        else{ 
            var jsonfile = $.ajax({ type: "GET", url: url,async: false }).responseText;
            this.cache[url] = jsonfile;
            this.cachemisses++;
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