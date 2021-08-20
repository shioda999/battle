import glob
import json

files = glob.glob(".\\asset\\graphic\\*.json")
f = open('.\\asset\\graphic\\frame_num.json', 'w')
f.write("{")
for i in range(len(files)):
    file = files[i]
    if(file == ".\\asset\\graphic\\frame_num.json"):
        continue
    json_open = open(file, 'r')
    data = json.load(json_open)
    frame_num = len(data['frames'])
    if(i == len(files) - 1):
        f.write('"' + file[16:-12] + '":' + str(
            frame_num))
    else:
        f.write('"' + file[16:-12] + '":' + str(frame_num) + ",")
f.write("}")
f.close()
