class NoCertificate:
    '''This is the class for detecting no certificate validations in code'''

    def __init__(self):
        self.warning_message = 'no certificate validation'
        self.http_libs = ['requests.get','requests.Session.get', 'requests.post', 'requests.Session.get', 'requests.head']
        self.context_variables = ['requests.Session.verify']
    

    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): tokenType = token["type"]
            if token.__contains__("name"): name = token["name"]
                
            if tokenType == "variable" and name in self.context_variables and token['value'] is False: 
                self.trigger_alarm(src_file, lineno)

            elif tokenType == "variable" and token.__contains__("valueSrc") and token.__contains__("funcKeywords"):
                keywords = token['funcKeywords']
                valueSrc = token['valueSrc']

                if (valueSrc in self.http_libs or self.is_http_call_relaxed(valueSrc)) and len(keywords) > 0:
                    
                    for keyword in keywords:
                        if keyword[0] == 'verify' and (keyword[1] is False or keyword[1] == 'False'): 
                            self.trigger_alarm(src_file, lineno)

            elif tokenType == "function_call" and (name in self.http_libs or self.is_http_call_relaxed(name)) and token.__contains__("keywords"):
                keywords = token["keywords"]
                
                for keyword in keywords:
                    if keyword[0] == 'verify' and (keyword[1] is False or keyword[1] == 'False'): 
                        self.trigger_alarm(src_file, lineno)
            
            
            elif tokenType == "function_def" and token.__contains__("return") and token.__contains__("returnKeywords") and token["return"] is not None:
                
                keywords = token['returnKeywords']
                
                for func_return in token['return']:
                    if func_return in self.http_libs or self.is_http_call_relaxed(func_return):
                        for keyword in keywords:
                            if keyword[0] == 'verify' and (keyword[1] is False or keyword[1] == 'False'): 
                                self.trigger_alarm(src_file, lineno)
                
            
        except Exception as error: 
            print(str(error))


    def is_http_call_relaxed(self, method_name):
        self.http_libs_verb = ['.get', '.post']

        if isinstance(method_name, str) is False: return False

        for lib in self.http_libs:
            if lib in method_name: 
                return True
        
        for lib_verb in self.http_libs_verb:
            if lib_verb in method_name and 'request' in method_name.lower().strip():
                return True
        
        return False


    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    