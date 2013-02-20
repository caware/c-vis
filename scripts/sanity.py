import datetime
def sanitycheck( sjson, stype, sverbose, sdebug, sfilename ):
    error = False
    if sdebug:
        print "Checking.."
    
    for index, point in enumerate(sjson['data']):
        time = datetime.datetime.utcfromtimestamp(point[0]/1000)
        if point[1] < 0:
            if sverbose or sdebug:
                print "Measurement Error:   Data point @ "+str(point[0])+" ("+time.strftime("%a, %d %b %Y %H:%M:%S +0000")+") reports negative ("+str(point[1])+") energy use."
            error = True
        if index > 0:
            lastpoint = sjson['data'][index-1]
            if point[0] <= lastpoint[0]:
                if sverbose or sdebug:
                    time2 = datetime.datetime.utcfromtimestamp(lastpoint[0]/1000)
                    print "Date Error: Date at point "+str(point[0])+ "is not after previous point "+str(lastpoint[0])
                    print time.strftime("%a, %d %b %Y %H:%M:%S +0000")+" & "+time2.strftime("%a, %d %b %Y %H:%M:%S +0000")+" respectively"
                error = True
        if point[1] > 500:
            if sverbose or sdebug:
                print "Measurement Error:   Data point @ "+str(point[0])+" ("+time.strftime("%a, %d %b %Y %H:%M:%S +0000")+") reports high ("+str(point[1])+") energy use."
            error = True
        if type:
            if type == "monthfile":
                if time.minute != 0 or time.second != 0:
                    if sverbose or sdebug:
                        print "Time Error: Time at point "+str(point[0])+ " is not an hourly datapoint ("+time.strftime("%a, %d %b %Y %H:%M:%S +0000")+")"
                    error = True
            elif type == "dayfile":
                if (time.minute % 2 != 0) or time.second != 0:
                    if sverbose or sdebug:
                        print "Time Error: Time at point "+str(point[0])+ " is not an 2 minute datapoint ("+time.strftime("%a, %d %b %Y %H:%M:%S +0000")+")"
                    error = True
            
    if error:
        if sdebug or sverbose:
            print "Filename: "+sfilename
            print "==================="
        return False
    return True
