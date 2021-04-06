class Xss:
    '''This is the class for detecting presence of xss in code'''

    def __init__(self):
        self.insecure_methods = ['django.utils.safestring.mark_safe', 'mark_safe']
        self.warning_message = 'cross site scripting'
        

    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): tokenType = token["type"]
            
            if tokenType == "variable":
                if token.__contains__("valueSrc"): valueSrc = token["valueSrc"]
                
                if self.is_insecure_method(valueSrc):
                    self.trigger_alarm(src_file, lineno)

                if token.__contains__("args"):  
                    for arg in token["args"]:
                        if self.is_insecure_method(arg):
                            self.trigger_alarm(src_file, lineno)

            elif tokenType == "function_call":
                if token.__contains__("name"): name = token["name"]
                if token.__contains__("args"): args = token["args"]
                
                if self.is_insecure_method(name):
                    self.trigger_alarm(src_file, lineno)
                
                for arg in args:
                    if self.is_insecure_method(arg):
                        self.trigger_alarm(src_file, lineno)


            elif tokenType == "function_def" and token.__contains__("return") and token["return"] is not None:
                for func_return in token["return"]:
                    if self.is_insecure_method(func_return): 
                        self.trigger_alarm(src_file, lineno)

                
        except Exception as error: print("xss error:"+str(error))


    def is_insecure_method(self, name):
        if isinstance(name, str) is False: return False
        elif name in self.insecure_methods: return True

        for method_name in self.insecure_methods:
            if method_name in name:
                return True

        return False
    
    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    