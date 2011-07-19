#!/usr/bin/python

#
# Generate an index file from a tree of json log files
# Chris Elsmore (cce25)
#
# Usage: indexgenerator.py root/of/json/file/tree/ path/to/output/json/file
#

import os, sys, datetime, json, re

MONTH_POWER_LOG = '^S-m[0-9]{2,3}-\d\d\d\d-\d\d\.json$'

debug = False

powerlogfile = re.compile(MONTH_POWER_LOG)

now = datetime.datetime.now()

if now.month < 10:
    currentmonth = "0"+str(now.month)
else:
    currentmonth = str(now.month)
    
recentsensor = str(now.year)+"-"+currentmonth



if len(sys.argv) != 3 or sys.argv[1] == "help":
    print "Usage: indexgenerator.py root/of/json/file/tree/ path/to/output/json/file"
    sys.exit()
else:
    [dirtoread, filetowrite] = sys.argv[1:]
    
    if debug:
        print "Input: "+dirtoread+", Output: "+filetowrite
    
    totalfiles = 0
    currentsensor = ''
    alreadyfound = False
    elec = []
    tempsensor = {}
    
    
    for dirname, dirnames, filenames in os.walk(dirtoread):
        for filename in filenames:
            if (filename[-5:] == ".json") and filename != filetowrite and powerlogfile.match(str(filename)):
                readfile = open(os.path.join(dirname, filename), 'r').read()
                jsonfile = json.loads(readfile)
                
                if 'room' and 'path' and 'label' and 'description' and 'data' in jsonfile and len(jsonfile['data']) > 0 :
                    
                    alreadyfound = False
                    #if we know about this sensor, add its readings only.
                    labelsplit = jsonfile['label'].split(' ', 1)
                    
                    temptotal = 0.0
                    mostrecentreading = False
                    
                    if labelsplit[1] == recentsensor:
                        mostrecentreading = True
                        for i in jsonfile['data']:
                            temptotal += i[1]
                        datasize = len(jsonfile['data'])
                 
                    for sensor in elec:
                        if debug:
                            print 'trying sensor ID:'+sensor['sensor']
                        if 'sensor' in sensor:
                            if sensor['sensor'] == 'S-m' + labelsplit[0]:
                                sensor['readings'].append(filename)
                                if mostrecentreading:
                                    sensor['recenttotal'] = temptotal
                                    sensor['datasize'] = datasize
                                    sensorlabel = 'S-m' + labelsplit[0]
                                    sensor['sensor'] = sensorlabel
                                    sensor['path'] = jsonfile['path'].lstrip("meters.cl.cam.ac.uk")+"/"+sensorlabel+"-"
                                    sensor['room'] = jsonfile['room']           
                                    sensor['description'] = jsonfile['description']
                                if debug:
                                    print 'Sensor ID:'+sensor['sensor']+' already found, readings: '+str(sensor['readings'])
                                alreadyfound = True
                                break
                    
                    if not alreadyfound:
                        if debug:
                            print 'sensor '+'S-m' + str(jsonfile['label'].split(' ', 1)[0])+' not found, adding' 
                        #if this is a new sensor, add its readings to elec.
                        tempsensor = {}
                        tempsensor['readings'] = [filename]
                        sensorlabel = 'S-m' + labelsplit[0]
                        tempsensor['sensor'] = sensorlabel
                        if mostrecentreading:
                            tempsensor['recenttotal'] = temptotal
                            tempsensor['datasize'] = datasize
                            tempsensor['path'] = jsonfile['path'].lstrip("meters.cl.cam.ac.uk")+"/"+sensorlabel+"-"
                            tempsensor['room'] = jsonfile['room']           
                            tempsensor['description'] = jsonfile['description']
                        elec.append(tempsensor)
                        if debug:
                            print 'New sensor found: '+str(tempsensor)
                        tempsensor = {}
                    
                    
                    
                    #for sensor in elec:
                    #        print sensor['sensor']
                    
                    totalfiles = totalfiles + 1
                else:
                    if debug:
                        print "skipped malformed or null file"+str(filename)
    myjson = {}
    sensors = {}
    sensors['elec'] = elec
    myjson['sensors'] = sensors
    if debug:
        print '\n'
        print 'Total # sensors: '+str(len(elec))
        print '\n'
        print 'Total Files Parsed: '+str(totalfiles)
        print json.dumps(myjson)
    
    outputfile = open(filetowrite, 'w')
    outputfile.write(json.dumps(myjson))
    outputfile.close()
    sys.exit()