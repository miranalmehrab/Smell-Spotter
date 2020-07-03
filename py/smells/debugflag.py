from operations.savewarnings import saveWarnings

def detect(token):

    if token.__contains__("line"): lineno = token["line"]
    if token.__contains__("type"): tokenType = token["type"]
    if token.__contains__("name"): name = token["name"]
    if token.__contains__("value"): value = token["value"]
    
    restrictedNames = ['debug', 'DEBUG', 'DEBUG_PROPAGATE_EXCEPTIONS']
    
    if tokenType == "variable" and name in restrictedNames and value:
        warning = 'debug set true'
        saveWarnings(warning,str(lineno))
        print(warning+ ' at line '+ str(lineno))

    elif tokenType == "function_call":
        if token.__contains__("keywords"): keywords = token["keywords"]
        
        for keyword in keywords:
            if(keyword[0] in restrictedNames and keyword[1]):
                warning = 'debug set true'
                saveWarnings(warning,str(lineno))
                print(warning+ ' at line '+ str(lineno))
