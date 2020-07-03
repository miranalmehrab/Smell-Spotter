from operations.savewarnings import saveWarnings

def detect(token):
    
    if token.__contains__("line"): lineno = token["line"]
    if token.__contains__("type"): tokenType = token["type"]
    if token.__contains__("name"): name = token["name"]
    if token.__contains__("value"): value = token["value"]
    if token.__contains__("valueSrc"): valueSrc = token["valueSrc"]
    
    commonUserName = ['name','user','username','usrname','usr','role','USER','USERNAME','USR']
    commonPassword = ['password','pass','pwd','userPassword','PASSWORD','PASS','PWD','USERPWD']

    if tokenType == "variable" and valueSrc == "initialized" and (name in commonUserName or name in commonPassword) and value != None and len(value)>0 : 
            
        warning = 'hardcoded secret'
        saveWarnings(warning,str(lineno))
        print(warning+ ' at line '+ str(lineno))
