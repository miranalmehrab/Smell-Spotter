from operations.savewarnings import saveWarnings

def detect(token):

    if token.__contains__("line"): lineno = token["line"]
    if token.__contains__("type"): tokenType = token["type"]
    if token.__contains__("name"): name = token["name"]
    if token.__contains__("args"): args = token["args"]
    if token.__contains__("hasInputs"): hasInputs = token["hasInputs"]

    unwantedMethods = ['execution.query']
    
    if tokenType == "function_call" and args and hasInputs:
        warning = 'SQL injection'
        saveWarnings(warning,str(lineno))
        print(warning+ ' at line '+ str(lineno))

