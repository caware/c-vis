function getJson(url){
        //Fetches a json file and returns the parsed object
            var jsonData = $.ajax({ type: "GET", url: url,async: false }).responseText;
            return jQuery.parseJSON(jsonData);
        }