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
            var returnObj = {};
            returnObj.error = false;
            returnObj.result = jQuery.parseJSON(this.cache[url]);
            return returnObj;
        }
        else{
            var returnObj = {};
            var jsonFile = $.ajax({ type: "GET", url: url, async: false});
            if (jsonFile.status == 200){
                try {
                    returnObj.result = jQuery.parseJSON(jsonFile.responseText);
                    returnObj.error = false;
                    this.cache[url] = jsonFile.responseText;
                    this.cachemisses++;
                }
                catch(e) {
                    returnObj.error = e;
                    returnObj.errorText = "JSON Parse Error when trying to parse '"+url+"'";
                    returnObj.errorType = "warn";
                }
            }
            else {
                returnObj.error = jsonFile;
                returnObj.errorText = "HTTP "+jsonFile.statusText+" "+jsonFile.status+" when trying to access '"+url+"'";
                returnObj.errorType = "error";
            }
            return returnObj;
        }
    };
    
    this.ajaxError = function(jqXHR, textStatus, errorThrown){
        var error = {reqObj: jqXHR, status: textStatus, error: errorThrown };
    };
    
    this.clearCache = function(){
        this.cache = {};
    };
}