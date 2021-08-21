import cv2
import numpy as np
import os

fname = "confusion"
disp = False
file_delete = True


fpath = fname + ".gif"
gif = cv2.VideoCapture(fpath)
fps = gif.get(cv2.CAP_PROP_FPS)
images = []
i = 0
while True:
    is_success, img = gif.read()
    if not is_success:
        break

    images.append(img)
    i += 1

res = cv2.hconcat(images)
if disp:
    cv2.imshow("image", res)
    cv2.waitKey(0)
cv2.imwrite(fname + ".png", res)

gif.release()
if file_delete:
    os.remove(fpath)
