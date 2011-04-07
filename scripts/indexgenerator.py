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
for dirname, dirnames, filenames in os.walk('/usr/groups/building/meter-readings/meters.cl.cam.ac.uk/elec/'):
    for filename in filenames:
        if (filename[-5:] == ".json"):
            print filename
            readfile = open(os.path.join(dirname, filename), "r").read()
            jsonfile = json.loads(readfile)
            print jsonfile['Elec']['Floor']['Second']['West']
        #if filename.find('.json'):
            #print os.path.join(dirname, filename)
        #else:
            #file = open(os.path.join(dirname, filename), "r")
            #readfile = json.loads(file)
            #print "not"
            