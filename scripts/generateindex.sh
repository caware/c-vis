#!/bin/bash

cd /auto/groups/building/meter-readings/meters.cl.cam.ac.uk/tools/wgb-vis/configs

cp sensorindex.json sensorindex.OLD
#python ~/public_html/c-vis/scripts/indexgenerator.py /usr/groups/building/meter-readings/meters.cl.cam.ac.uk/elec/ sensorindex.json
python /auto/groups/building/meter-readings/meters.cl.cam.ac.uk/tools/wgb-vis/Git/scripts/indexgenerator.py /usr/groups/building/meter-readings/meters.cl.cam.ac.uk/elec/ sensorindex.json errors.json verbose

echo "Generated!"

exit

