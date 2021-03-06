#!/usr/bin/python

#
# Generate an index file from a tree of json log files
# Chris Elsmore (cce25)
#
# Usage: indexgenerator.py root/of/json/file/tree/ path/to/output/json/file
#
import os
import sys
import datetime
import re
import urllib
from sanitytest import sanitycheck

try:
    import simplejson as json
except ImportError:
    import json

timeStart = datetime.datetime.now()

MONTH_POWER_LOG = '^S-m[0-9]{1,3}-\d\d\d\d-\d\d\.json$'
DAY_POWER_LOG = '^S-m[0-9]{1,3}-\d\d\d\d-\d\d\-\d\d.json$'

#debug = False

monthfile = re.compile(MONTH_POWER_LOG)
dayfile = re.compile(DAY_POWER_LOG)

if len(sys.argv) <= 3 or sys.argv[1] == "help":
    print "Usage: indexgenerator.py root/of/json/file/tree/ output/json/file error/json/file"
    sys.exit()
else:
    dirtoread = sys.argv[1]
    filetowrite = sys.argv[2]
    errorfile = sys.argv[3]
    
    if 'debug' in sys.argv:
        debug = True
    else:
        debug = False
    
    if 'verbose' in sys.argv:
        verbose = True
    else:
        verbose = False

    if debug or verbose:
        print "Input: "+dirtoread+", Output: "+filetowrite+", Errors: "+errorfile+"\n"
    
    totalfiles = 0
    currentsensor = ''
    alreadyfound = False
    elec = []
    tempsensor = {}
    loggedErrors = {}
    
    for dirname, dirnames, filenames in os.walk(dirtoread):
        for filename in filenames:
            if (filename[-5:] == ".json") and filename != filetowrite and monthfile.match(str(filename)):
                #or dayfile.match(str(filename)) ):
                infile = open(os.path.join(dirname, filename), 'r')           
                readfile = infile.read()
                jsonfile = json.loads(readfile)
                infile.close()
                
                if 'room' and 'path' and 'label' and 'description' and 'data' in jsonfile and len(jsonfile['data']) > 0 :
                    if verbose or debug:
	                print 'Valid filename: '+str(filename)
                    alreadyfound = False
                    #if we know about this sensor, add its readings only.
                    labelsplit = jsonfile['label'].split(' ', 1)
                    
                    errors = sanitycheck(jsonfile, 'monthfile')
                    if errors != 'OK':
                        tmpSensorLabel = 'S-m' + labelsplit[0]
                        errors['filename'] = str(filename)

                        if tmpSensorLabel not in loggedErrors:
                            loggedErrors[tmpSensorLabel] = []
                        loggedErrors[tmpSensorLabel].append(errors)
                            
                        if verbose or debug:
                            lenErrs = str(len(errors['errors']))
                            print '[WARN] filename "'+str(filename)+'" has '+lenErrs+' errors'
                 
                    for sensor in elec:
                        if debug:
                            print '[Debug]trying sensor ID:'+sensor['sensor']
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
                                    
                                    sensorlabel = 'S-m' + labelsplit[0]
                                    sensor['sensor'] = sensorlabel

                                    #tmppath = ''.join(jsonfile['path'].partition('/')[1:])+"/"+sensorlabel+"-"
                                    tmppath = "/"+jsonfile['path'].split("/",1)[1]+"/"+sensorlabel+"-"
				    sensor['path'] = urllib.quote(tmppath)
                                    sensor['room'] = jsonfile['room']           
                                    sensor['description'] = jsonfile['description']
                                    
                                    if 'coverage' in jsonfile:
                                        if jsonfile['coverage'] != 'cOVERAGE':
                                            sensor['coverage'] = jsonfile['coverage']
                                    
                                if debug:
                                    print '[DEBUG]Sensor ID:'+sensor['sensor']+' already found, readings: '+str(sensor['monthly-readings'])
                                
                                alreadyfound = True
                                break
                    
                    if not alreadyfound:
                        if debug:
                            print 'sensor '+'S-m' + str(jsonfile['label'].split(' ', 1)[0])+' not found, adding' 
                        #if this is a new sensor, add its readings to elec.
                        tempsensor = {}

                        if monthfile.match(str(filename)):
                            tempsensor['monthly-readings'] = [filename]
                            tempsensor['daily-readings'] = []

                        if dayfile.match(str(filename)):
                            tempsensor['daily-readings'] = [filename]
                            tempsensor['monthly-readings'] = []

                        sensorlabel = 'S-m' + labelsplit[0]
                        tempsensor['sensor'] = sensorlabel
                        #tmppath = ''.join(jsonfile['path'].partition('/')[1:])+"/"+sensorlabel+"-"
                        tmppath = "/"+jsonfile['path'].split("/",1)[1]+"/"+sensorlabel+"-"
                        tempsensor['path'] = urllib.quote(tmppath)
                        tempsensor['room'] = jsonfile['room']           
                        tempsensor['description'] = jsonfile['description']
                        if 'coverage' in jsonfile:
                            if jsonfile['coverage'] != 'cOVERAGE':
                                tempsensor['coverage'] = jsonfile['coverage']
                            
                        elec.append(tempsensor)
                        
                        if debug:
                            print '[DEBUG] New sensor found: '+str(tempsensor)
                        tempsensor = {}
                    
                    totalfiles = totalfiles + 1
                else:
                    if debug or verbose:
                        print "[WARN] Skipped malformed or null file"+str(filename)
    
    myjson = {}
    sensors = {}
    sensors['elec'] = elec
    myjson['sensors'] = sensors
    
    outerrors = open(errorfile, 'w')
    outerrors.write(json.dumps(loggedErrors))
    outerrors.close()

    outputfile = open(filetowrite, 'w')
    outputfile.write(json.dumps(myjson))
    outputfile.close()

    timeEnd = datetime.datetime.now()
    diff = timeEnd - timeStart
    if verbose or debug:
        print '====================='
        print 'Sensors with errors: '+str(len(loggedErrors))
        print 'Time taken: '+str(diff)
        print 'Total # sensors: '+str(len(elec))
        print '\n'
        print 'Total Files Parsed: '+str(totalfiles)

    sys.exit()
