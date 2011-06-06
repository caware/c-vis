function getJson(url){
    //Fetches a json file and returns the parsed object using the jQuery JSON Parser
    var jsonData = $.ajax({ type: "GET", url: url,async: false }).responseText;
    return jQuery.parseJSON(jsonData);
}

Array.prototype.compare = function(testArr) {
    if (this.length != testArr.length) return false;
    for (var i = 0; i < testArr.length; i++) {
        if (this[i].compare) { 
            if (!this[i].compare(testArr[i])) return false;
        }
        if (this[i] !== testArr[i]) return false;
    }
    return true;
}

function IntValueStore() {
    //A Class for defining a uniqure index => Array store
    
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

function createCookie(name,value,days){
   // new Date object created
   var date = new Date();
   // adding days to current time
   date.setTime(date.getTime()+(days*24*60*60*1000));
   // converting to standard format
   var expires = date.toGMTString();
   // adding cookie name,value and expiry time
   document.cookie = name+"="+value+"; expires="+expires+"; path=/";
}

function readCookie(name){
  var flag = 0;
   // getting the browser cookie values into an array
  var dcmntCookie = document.cookie.split(';');
  // looping over the array to find our cookie
  for(var i=0;i < dcmntCookie.length;i++)
  {
    var ck = dcmntCookie[i];
    // loop for removing extra spaces from the beginning of each cookie
    while (ck.charAt(0)==' ')
    {
       ck = ck.substring(1,ck.length);
    }
    if(ck)
    {
      // splitting the cookie into its name and value
      cparts = ck.split('=');
      // setting the flag if a cookie with the name specified exists
      if (cparts[0]==name){
        console.log(ck);
        flag=1;
     }
    }
  }
  // returning true if cookie exists else returning false
  if(flag) return true;
  else return false;
}

function checkCookie(name){
  if(readCookie(name))
  {
     // hide the div element using css style attribute
     $("#firstvisit").remove();
     console.log("emptied top bar vistor welcome back");
  }
  // create a new cookie if cookie already not present
  else{
    createCookie(name,"VisitedIn28Days",28);
    console.log("created cookie");
  }
}