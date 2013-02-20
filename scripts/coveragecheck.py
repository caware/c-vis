#!/usr/bin/python

#
# Check the presence of the coverage key in json files.
# Chris Elsmore (cce25)
#
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

for dirname, dirnames, filenames in os.walk('/usr/groups/building/meter-readings/meters.cl.cam.ac.uk/elec/'):
        for filename in filenames:
            if (filename[-5:] == ".json") and powerlogfile.match(str(filename)):
                readfile = open(os.path.join(dirname, filename), 'r').read()
                jsonfile = json.loads(readfile)
                
                if 'room' and 'label' and 'description' and 'data' in jsonfile and len(jsonfile['data']) > 0 :
                    
                    labelsplit = jsonfile['label'].split(' ', 1)
                    if 'coverage' not in jsonfile:
                        coverage = "No Tag Found"
                    elif jsonfile['coverage'] == 'cOVERAGE':
                        coverage = "Not Specified"
                    else:
                        coverage = jsonfile['coverage']

                    print 'Sensor S-m'+labelsplit[0]+', '+jsonfile['description']+' in '+jsonfile['room']+'. Date: '+labelsplit[1]  
                    print 'Coverage :'+coverage

sys.exit()