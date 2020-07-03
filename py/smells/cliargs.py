from operations.savewarnings import saveWarnings

def detect(token):

    if token.__contains__("line"): lineno = token["line"] 
    if token.__contains__("type"): tokenType = token["type"]
    if token.__contains__("name"): methodname = token["name"]
    if token.__contains__("args"): args = token["args"]
    if token.__contains__("hasInputs"): containsUserInput =  token["hasInputs"]

    cliArgsFuncNames = ['sys.argv', 'ArgumentParser', 'argparse', 'subprocess.Popen']
    
    if tokenType == "function_call" and methodname in cliArgsFuncNames and containsUserInput:
        
        warning = 'use of command line args' 
        saveWarnings(warning,str(lineno))
        print(warning+ ' at line '+ str(lineno))
