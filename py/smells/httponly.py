from operations.savewarnings import saveWarnings

def detect(token):

    if token.__contains__("line"): lineno = token["line"]
    if token.__contains__("type"): tokenType = token["type"]
    if token.__contains__("name"): name = token["name"]
    if token.__contains__("args"): args = token["args"]

    httpLibs = ['httplib.urlretrieve', 'urllib', 'requests.get']
    
    if tokenType=="function_call" and name in httpLibs:
        if args and args[0].split("://")[0] != "https":
            
            warning = 'use of HTTP without TLS'
            saveWarnings(warning,str(lineno))
            print(warning+ ' at line '+ str(lineno))
