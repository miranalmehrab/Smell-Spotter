class DebugFlag:
    '''This is the class for detecting debug flag set to true in code'''

    def __init__(self):
        self.restricted_names = ['debug','debug_propagate_exceptions','propagate_exceptions']
        self.warning_message = 'deployment with debug flag set to true'

    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): tokenType = token["type"]
            if token.__contains__("name"): name = token["name"]
            if token.__contains__("value"): value = token["value"]
            
            
            if tokenType == "variable" and name is not None and (name.lower() in self.restricted_names or self.has_debug_in_name(name.lower())) and value is True: 
                self.trigger_alarm(src_file, lineno)


            elif tokenType == "function_call" and token.__contains__("keywords"):
                
                for keyword in token["keywords"]:
                    if(keyword[0] is not None and isinstance(keyword[0], str) and keyword[0].lower() in self.restricted_names and keyword[1] is True): 
                        self.trigger_alarm(src_file, lineno)


            elif tokenType == "dict" and token.__contains__("pairs"): 
                
                for pair in token['pairs']:
                    if pair[0] in self.restricted_names and pair[1] is True: 
                        self.trigger_alarm(src_file, lineno)
        
        except Exception as error: 
            print("debug error:"+str(error))

    def has_debug_in_name(self, var_name):
        for name in self.restricted_names:
            if name in var_name.lower().strip(): 
                return True
        
        return False


    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    