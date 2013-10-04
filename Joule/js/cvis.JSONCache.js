function JSONCache() {

    //A Class for defining a unique index => JSON store
    // IML modification.  Store JSON objects rather than strings
	var that = this;
	this.cache = {};
	this.cachehits = 0;
	this.cachemisses = 0;
	
		
	this.getObject = function(url, async) {
		
		var returnObj = {result: null};
		
		function CheckURLIsData(u) {
			return (u.search("S-m[0-9][0-9]*-20[0-9][0-9]-[0-9][0-9]*.json") >= 0);
		}
		
		var mightBeShortData;
		var returnObj = {};
		var cacheObj = {};
		var jsonFile;
		var found = false;
		//Fetches a json file from the cache, or downloads and inserts it if not already there.
		
		for (var c in this.cache) {
			if (this.cache.hasOwnProperty(c)){
				if(c === url){
					found = true;
					this.cachehits++;
					return this.cache[url];
				}
			}
		}
		
		if (!found) {
			if (async)
				returnObj = $.ajax({
					dataType: "json",
					url: url
				}).done(function(data) {
					that.cache[url] = data;
				});
			else
				returnObj = $.ajax({
					dataType: "json",
					url: url,
					async: false
				});
		}
//         if (CheckURLIsData(url)) {
//        	    // Data files need expanding, read it and convert it into internal form.
// 
//             jsonFile = $.ajax({ type: "GET", url: url, async: false});
//             if (jsonFile.status === 200){
//                 try {
//                     var tmp = jQuery.parseJSON(jsonFile.responseText);
//                     returnObj.result = Rebloat(tmp);
//                     returnObj.error = false;
//                     jQuery.extend(true, cacheObj, returnObj.result);
//                     this.cache[url] = cacheObj;
//                     this.cachemisses++;
//                 } catch(e) {
//                     returnObj.error = e;
//                     returnObj.errorText = "JSON Parse Error when trying to parse '"+url+"'";
//                     returnObj.errorType = "warning";
//                 }
//             } else {
//                 returnObj.error = jsonFile;
//                 returnObj.errorText = "HTTP "+jsonFile.statusText+" "+jsonFile.status+" when trying to access '"+url+"'";
//                 returnObj.errorType = "danger";
//             }
//         } else {
//             jsonFile = $.ajax({ type: "GET", url: url, async: false});
// 
//             if (jsonFile.status === 200){
//                 try {
//                     returnObj.result = jQuery.parseJSON(jsonFile.responseText);
//                     returnObj.error = false;
//                         
//                     jQuery.extend(true, cacheObj, returnObj.result);
//                     this.cache[url] = cacheObj;
//                     this.cachemisses++;
//                 }
//                 catch(e) {
//                     returnObj.error = e;
//                     returnObj.errorText = "JSON Parse Error when trying to parse '"+url+"'";
//                     returnObj.errorType = "warning";
//                 }
//             }
//             else{
//                 returnObj.error = jsonFile;
//                 returnObj.errorText = "HTTP "+jsonFile.statusText+" "+jsonFile.status+" when trying to access '"+url+"'";
//                 returnObj.errorType = "danger";
//             }
//         }
          
        return returnObj;
    };
    
    this.ajaxError = function(jqXHR, textStatus, errorThrown){
        var error = {reqObj: jqXHR, status: textStatus, error: errorThrown };
    };
    
    this.clearCache = function(){
        this.cache = {};
    };

}