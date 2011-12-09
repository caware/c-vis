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
            var returnObj = {};
            var jsonfile = $.ajax({ type: "GET", url: url,async: false, error: this.ajaxError, success: this.ajaxError});
            console.log(jsonfile);
            if (jsonfile.status == 200){
                //if JSON also parses fine, return no error and JS obj
                //if status fails, no file etc, report error,
                //if JSON parse fails, report error.
            }
            this.cache[url] = jsonfile.responseText;
            this.cachemisses++;
            return jQuery.parseJSON(jsonfile.responseText);
        }
    };
    
    this.ajaxError = function(jqXHR, textStatus, errorThrown){
        var error = {reqObj: jqXHR, status: textStatus, error: errorThrown };
        console.log(error);
    };
    
    this.clearCache = function(){
        this.cache = {};
    };
}