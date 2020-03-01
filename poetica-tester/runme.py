import socket
import subprocess
import sys
from datetime import datetime

subprocess.call('cls', shell=True)

remoteServer = input("enter a host to scan: ")
remoteServerIP = socket.gethostbyname(remoteServer)

print("_" * 60)
print("checking if host ", remoteserver, " is alive")
print("_" * 60)

try:
    ping = subprocess.call(['ping', remoteServer])
    if ping == 0:
        print("host is up!")

    print("-" * 60)
    print("Please wait, scanning remote host", remoteServerIP)
    print("-" * 60)

    t1 = datetime.now()

    portlist = [21, 22, 23, 25, 53, 54, 67, 80, 110, 1701, 3389, 8080]

    try:
        for port in portlist:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex((remoteServerIP, port))
            if result == 0:
                print("Port {}:      Open".format(port))
            sock.close()

    except KeyboardInterrupt:
        print("You pressed Ctrl+C")
        sys.exit()

    except socket.gaierror:
        print('Hostname could not be resolved. Exiting')
        sys.exit()

    except socket.error:
        print("Couldn't connect to server")
        sys.exit()

    t2 = datetime.now()

    total = t2 - t1
    print(total)

    elif ping != 0:
    print("host is down!")

else:
print("host could not be located!")

except socket.gaierror:
print('Hostname could not be resolved. Exiting')
sys.exit()

except socket.error:
print("Couldn't connect to server")
sys.exit()