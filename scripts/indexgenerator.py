#!/usr/bin/python

#
# Generate an index file from a tree of json log files
# Chris Elsmore (cce25)
#

import os, sys, json

#if sys.argv[1] == "-h" or "-help":
#    print "Usage: indexgenerator.py dir/containing/root/of/json/file/tree/"
#    sys.exit(1)
#else:

filetowrite = 'sensorindex.json'

totalfiles = 0
#firstrun = True
currentsensor = ''
alreadyfound = False
#sensorfiles = []
elec = []
tempsensor = {}


for dirname, dirnames, filenames in os.walk('/usr/groups/building/meter-readings/meters.cl.cam.ac.uk/elec/'):
    for filename in filenames:
        if (filename[-5:] == ".json"):
            readfile = open(os.path.join(dirname, filename), 'r').read()
            jsonfile = json.loads(readfile)
            
            alreadyfound = False
            #if we know about this sensor, add its readings only.
                
            for sensor in elec:
                    print 'trying sensor ID:'+sensor['sensor']
                    if sensor['sensor'] == 'S-m' + jsonfile['label'].split(' ', 1)[0]:
                        sensor['readings'].append(filename)
                        print 'Sensor ID:'+sensor['sensor']+' already found, readings: '+str(sensor['readings'])
                        alreadyfound = True
                        break

            if not alreadyfound:
                print 'sensor '+'S-m' + str(jsonfile['label'].split(' ', 1)[0])+' not found, adding' 
                #if this is a new sensor, add its readings to elec.
                tempsensor = {}
                tempsensor['sensor'] = 'S-m' + jsonfile['label'].split(' ', 1)[0]
                tempsensor['path'] = jsonfile['path']
                tempsensor['room'] = jsonfile['room']           
                tempsensor['function'] = jsonfile['description']
                tempsensor['readings'] = [filename]
                #tempsensor['readings'].append(filename)
                elec.append(tempsensor)
                print 'New sensor found: '+str(tempsensor)
                #print elec
                tempsensor = {}

            
            #for sensor in elec:
            #        print sensor['sensor']
        
            totalfiles = totalfiles + 1

myjson = {}
sensors = {}
sensors['elec'] = elec
myjson['sensors'] = sensors
print '\n'
#print 'Total # sensors: '+str(len(elec))
print '\n'
#print 'Total Files Parsed: '+str(totalfiles)
print json.dumps(myjson)

outputfile = open(filetowrite, 'w')
outputfile.write(json.dumps(myjson))
outputfile.close()
