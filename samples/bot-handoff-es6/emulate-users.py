#!/usr/bin/python
import json, subprocess, sys, platform
from os.path import expanduser

if len (sys.argv) < 2 :
    print("Usage: python " + sys.argv[0] + " username(s)")
    sys.exit (1)

HOME=expanduser("~")

# determine paths
SYSTEM=platform.system()
if SYSTEM == 'Darwin':
    SERVERJSON=HOME+'/Library/Application Support/botframework-emulator/botframework-emulator/server.json'
    EMULATORPATH=HOME+'/Applications/botframework-emulator.app/'
elif SYSTEM == 'Windows':
    SERVERJSON=HOME+'/AppData/Roaming/botframework-emulator/botframework-emulator/server.json'
    EMULATORPATH=HOME+'/AppData/Local/botframework/botframework-emulator.exe'
else:
    print("System " + SYSTEM + " not yet supported.")
    sys.exit (1)

# read the server config file
with open(SERVERJSON, "r") as jsonFile:
    data = json.load(jsonFile)

args=sys.argv[1:]
for arg in args:
    # add user if not present
    if data["users"]["usersById"].get(arg) is None:
        data["users"]["usersById"][arg]={"id": arg,"name": arg}
    # set current user
    data["users"]["currentUserId"]=arg
    # write server config file
    with open(SERVERJSON, "w") as jsonFile:
        json.dump(data, jsonFile, sort_keys=False, indent=2, separators=(',', ': '))
    # launch emulator
    if SYSTEM == 'Darwin':
        subprocess.call(["/usr/bin/open", "-n", EMULATORPATH])
    elif SYSTEM == 'Windows':
        subprocess.call([EMULATORPATH])
    