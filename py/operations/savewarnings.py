import json

def saveWarnings(message,line):
    warning = {"line":line,"message":message}
    
    f = open("logs/warnings.txt", "a+")
    json.dump(warning,f)
    f.write('\n')
    f.close()