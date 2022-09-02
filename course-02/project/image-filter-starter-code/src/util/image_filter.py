
import numpy as np
import cv2 as cv
import sys
import os
import base64

if len(sys.argv)!=2:
    print ("Internal error: incorrect number of arguments");
    sys.exit(-1);

outfullname = os.path.normpath( sys.argv[1] )
outbase = os.path.normpath( outfullname )
sin = sys.stdin.read()
encoded_data = sin.split(',')[1]
nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)

img = cv.imdecode(nparr, cv.IMREAD_GRAYSCALE)
edges = cv.Canny(img,100,200)

print ( str(img) )
print ( str(edges) )

cv.imwrite( outbase, edges );

