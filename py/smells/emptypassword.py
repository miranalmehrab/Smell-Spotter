from operations.savewarnings import saveWarnings

def detect(token):
    
    if token.__contains__("line"): lineno = token["line"]
    if token.__contains__("type"): tokenType = token["type"]
    if token.__contains__("name"): name = token["name"]
    if token.__contains__("value"): value = token["value"]
    
    commonPasswords = ['password','pass','pwd','userPassword','PASSWORD','PASS','PWD','USERPWD']
    
    if tokenType == "variable" and name in commonPasswords and value == None:
        warning = 'empty password'
        saveWarnings(warning,str(lineno))
        print(warning+ ' at line '+ str(lineno))

    elif tokenType == "variable" and name in commonPasswords and len(value) == 0: 
        warning = 'empty password'
        saveWarnings(warning,str(lineno))
        print(warning+ ' at line '+ str(lineno))

