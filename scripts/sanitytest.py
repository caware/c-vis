import datetime

def sanitycheck( json, filetype):

    # look in error dir and see if a error file for this sensor already exsists.
    
    errors = []
    warns = []

    for index, point in enumerate( json['data'] ):
        
        time = datetime.datetime.utcfromtimestamp( point[0]/1000 )
        datum = point[1]

        if datum < 0:
            #Check that energy use is not negative
            if datum < -5:
                err = {}
                err['Type'] = 'Negative Energy'
                err['Data Index'] = index
                err['Time Stamp'] = time.strftime("%a, %d %b %Y %H:%M:%S +0000")
                err['Data'] = str(datum)+" kWh"
                errors.append(err)
            else:
                err = {}
                err['Type'] = 'Low Negative Energy'
                err['Data Index'] = index
                err['Time Stamp'] = time.strftime("%a, %d %b %Y %H:%M:%S +0000")
                err['Data'] = str(datum)+" kWh"
                errors.append(err)

        if datum > 500:
            #Check that energy use is not very high
            err = {}
            err['Type'] = 'High Energy'
            err['Data Index'] = index
            err['Time Stamp'] = time.strftime("%a, %d %b %Y %H:%M:%S +0000")
            err['Data'] = str(datum)+" kWh"
            errors.append(err)

        if index > 0:
            lastpoint = json['data'][index-1]
            if point[0] <= lastpoint[0]:
                #Check that dates are chronological
                time2 = datetime.datetime.utcfromtimestamp(lastpoint[0]/1000)
                err = {}
                err['Type'] = 'Chronological Error'
                err['Data Index'] = index
                err['Time Stamp'] = time.strftime("%a, %d %b %Y %H:%M:%S +0000")
                err['Data'] = 'Last TS: '+time2.strftime("%a, %d %b %Y %H:%M:%S +0000")
                errors.append(err)

        if type == "monthfile":
            if time.minute != 0 or time.second != 0:
                err = {}
                err['Type'] = 'Non quantised timestamp'
                err['Data Index'] = index
                err['Time Stamp'] = time.strftime("%a, %d %b %Y %H:%M:%S +0000")
                err['Data'] = time
                errors.append(err)
 
        if type == "dayfile":
            if (time.minute % 2 != 0) or time.second != 0:
                err = {}
                err['Type'] = 'Non 2 Miniute quantised timestamp'
                err['Data Index'] = index
                err['Time Stamp'] = time.strftime("%a, %d %b %Y %H:%M:%S +0000")
                err['Data'] = time
                errors.append(err)
    
    if len(errors) == 0 and len(warns) == 0:
        return 'OK'
    else:
        rtnObj = {}
        #rtnObj['Filename'] = filename
        #rtnObj['# Errors'] = len(errors)
        #rtnObj['# Warnings'] = len(warns)
        rtnObj['errors'] = errors
        #rtnObj['warnings'] = warns
        return rtnObj
