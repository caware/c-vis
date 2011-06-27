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
        //console.log(ck);
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

function getMonthsBetween(stmonth, styear, endmonth, endyear){
    stmonth = parseInt(stmonth);
    styear = parseInt(styear);
    endmonth = parseInt(endmonth);
    endyear = parseInt(endyear);
    //console.log('getMonthsBetween Called');
    var outputarray = new Array();
    var go = 20;
    for (var i=0;i<go;i++){
        if ((stmonth == endmonth) && (styear == endyear)){
            if (stmonth < 10) var tmpmonth = "0"+stmonth.toString();
            else var tmpmonth = stmonth.toString();
            outputarray.push(styear+"-"+tmpmonth);
            //console.log(tmpmonth);
            break;
        }
        else {
            if (stmonth < 10) var tmpmonth = "0"+stmonth.toString();
            else var tmpmonth = stmonth.toString();
            //console.log(tmpmonth);
            outputarray.push(styear+"-"+tmpmonth);
            if (stmonth < 12) stmonth += 1;
            else if (stmonth = 12){
                stmonth = 1;
                styear += 1;
            }
        }
        //console.log('looped');
        i++;
    }
    return outputarray;
}