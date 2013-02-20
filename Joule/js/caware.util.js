function getJson(url){
    //console.log('URL: '+url);
    return (cache.getObject(url));
    //var jsonData = $.ajax({ type: "GET", url: url,async: false }).responseText;
    //return jQuery.parseJSON(jsonData);
}

function capitaliseFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function cmpArray(a, b){
    if (a.length != b.length) return false;
    for (var i = 0; i < b.length; i++) {
        if (a.compare) { 
            if (!a[i].compare(b[i])) return false;
        }
        if (a[i] !== b[i]) return false;
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
     //console.log("emptied top bar vistor welcome back");
  }
  // create a new cookie if cookie already not present
  else{
    createCookie(name,"VisitedIn28Days",28);
    //console.log("created cookie");
  }
}

function getMonthsBetween(stmonth, styear, endmonth, endyear){
    //console.log(stmonth);
    stmonth = parseInt(stmonth,10);
    styear = parseInt(styear,10);
    endmonth = parseInt(endmonth,10);
    endyear = parseInt(endyear,10);
    //console.log(stmonth);
    var outputarray = new Array();
    var go = 20;
    for (var i=0;i<go;i++){
        if ((stmonth == endmonth) && (styear == endyear)){
            //console.log(stmonth);
            if (stmonth < 10) var tmpmonth = "0"+stmonth.toString();
            else var tmpmonth = stmonth.toString();
            outputarray.push(styear+"-"+tmpmonth);
            //console.log(styear+"-"+tmpmonth);
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

function sortArrayNum(a,b){
    return a[0] - b[0];
}