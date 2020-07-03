from operations.savewarnings import saveWarnings

def detect(token):

    if token.__contains__("line"): lineno = token["line"]
    if token.__contains__("type"): tokenType = token["type"]
    if token.__contains__("name"): name = token["name"]
    if token.__contains__("args"): args = token["args"]

    unwantedMethods = ['os.chmod', 'chmod']
    unwantedParams = ['0x777', '0x757', '0x755','1911','stat.S_IRWXO','stat.S_IROTH','stat.S_IWOTH','stat.S_IXOTH']

    if tokenType == "function_call" and name in unwantedMethods:
        
        for arg in args:
            if arg in unwantedParams:
                warning = 'bad file permission'
                saveWarnings(warning,str(lineno))
                print(warning+ ' at line '+ str(lineno))
