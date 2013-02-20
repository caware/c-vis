#!/usr/bin/python

#
# Generate an index file from a tree of json log files
# Chris Elsmore (cce25)
#
# Usage: indexgenerator.py root/of/json/file/tree/ path/to/output/json/file
#

import os, sys, datetime, re
try: import simplejson as json
except ImportError: import json

tone = datetime.datetime.now()

MONTH_POWER_LOG = '^S-m[0-9]{2,3}-\d\d\d\d-\d\d\.json$'
DAY_POWER_LOG = '^S-m[0-9]{2,3}-\d\d\d\d-\d\d\-\d\d.json$'

monthfile = re.compile(MONTH_POWER_LOG)
dayfile = re.compile(DAY_POWER_LOG)

debug = False



configfile = open('config.json', 'r')
readconfigfile = configfile.read()
jsonconfig = json.loads(readconfigfile)
configfile.close()

if 'ignored_sensors' in configfile:
    ignored_sensors = configfile['ignored_sensors']
    if debug:
        print "Ignoring sensors: "+str(ignored_sensors)

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
            if (filename[-5:] == ".json") and filename != filetowrite and (monthfile.match(str(filename)) or dayfile.match(str(filename)) ):
                infile = open(os.path.join(dirname, filename), 'r')           
                readfile = infile.read()
                jsonfile = json.loads(readfile)
                infile.close()
                
                if 'room' and 'path' and 'label' and 'description' and 'data' in jsonfile and len(jsonfile['data']) > 0 :
                #if set(("room", "path", "label", "description", "data")) <= set(jsonfile):  
                    alreadyfound = False
                    #if we know about this sensor, add its readings only.
                    labelsplit = jsonfile['label'].split(' ', 1)
                    
                    #temptotal = 0.0
                    #mostrecentreading = False
                    
                    #if labelsplit[1] == recentsensor:
                    #    mostrecentreading = True
                    #    for i in jsonfile['data']:
                    #        temptotal += i[1]
                    #    datasize = len(jsonfile['data'])
                 
                    for sensor in elec:
                        if debug:
                            print 'trying sensor ID:'+sensor['sensor']
                        if 'sensor' in sensor:
                            if sensor['sensor'] == 'S-m' + labelsplit[0]:
                            
                                if monthfile.match(str(filename)):
                                    sensor['monthly-readings'].append(filename)
                                    sensor['monthly-readings'].sort(reverse=True)

                                if dayfile.match(str(filename)):
                                    sensor['daily-readings'].append(filename)
                                    sensor['daily-readings'].sort(reverse=True)
                                
                                if sensor['monthly-readings'][0] == filename:
                                    #sensor is newer than others, prfer newer data over old.
                                    
                                    #sensor['recenttotal'] = temptotal
                                    #sensor['datasize'] = datasize
                                    sensorlabel = 'S-m' + labelsplit[0]
                                    sensor['sensor'] = sensorlabel
                                    sensor['path'] = jsonfile['path'].lstrip("meters.cl.cam.ac.uk")+"/"+sensorlabel+"-"
                                    
                                    sensor['room'] = jsonfile['room']           
                                    sensor['description'] = jsonfile['description']
                                    
                                    if 'coverage' in jsonfile:
                                        if jsonfile['coverage'] != 'cOVERAGE':
                                            sensor['coverage'] = jsonfile['coverage']
                                    
                                if debug:
                                    print 'Sensor ID:'+sensor['sensor']+' already found, readings: '+str(sensor['monthly-readings'])
                                
                                alreadyfound = True
                                break
                    
                    if not alreadyfound:
                        if debug:
                            print 'sensor '+'S-m' + str(jsonfile['label'].split(' ', 1)[0])+' not found, adding' 
                        #if this is a new sensor, add its readings to elec.
                        tempsensor = {}

                        #tempsensor['readings'] = [filename]
                        if monthfile.match(str(filename)):
                            tempsensor['monthly-readings'] = [filename]
                            tempsensor['daily-readings'] = []

                        if dayfile.match(str(filename)):
                            tempsensor['daily-readings'] = [filename]
                            tempsensor['monthly-readings'] = []

                        sensorlabel = 'S-m' + labelsplit[0]
                        tempsensor['sensor'] = sensorlabel
                        tempsensor['path'] = jsonfile['path'].lstrip("meters.cl.cam.ac.uk")+"/"+sensorlabel+"-"
                        #tempsensor['recenttotal'] = temptotal
                        #tempsensor['datasize'] = datasize
                        tempsensor['room'] = jsonfile['room']           
                        tempsensor['description'] = jsonfile['description']
                        if 'coverage' in jsonfile:
                            if jsonfile['coverage'] != 'cOVERAGE':
                                sensor['coverage'] = jsonfile['coverage']
                            
                        elec.append(tempsensor)
                        
                        if debug:
                            print 'New sensor found: '+str(tempsensor)
                        tempsensor = {}
                    
                    totalfiles = totalfiles + 1
                else:
                    if debug:
                        print "skipped malformed or null file"+str(filename)
    
    myjson = {}
    sensors = {}
    sensors['elec'] = elec
    myjson['sensors'] = sensors
    
    outputfile = open(filetowrite, 'w')
    outputfile.write(json.dumps(myjson))
    outputfile.close()

    ttwo = datetime.datetime.now()
    diff = ttwo - tone
    
    print '\n'
    print 'Time: '+str(diff)
    #if debug:
    print '\n'
    print 'Total # sensors: '+str(len(elec))
    print '\n'
    print 'Total Files Parsed: '+str(totalfiles)
    #print json.dumps(myjson)

    sys.exit()