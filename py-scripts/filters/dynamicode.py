class DynamicCode:
    '''This is the class for detecting insecure dynamic code executions in code'''

    def __init__(self):
        self.insecure_methods = ['exec', 'eval', 'compile']
        self.warning_message = 'dynamic code execution'


    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): token_type = token["type"]
            
            if token_type == "variable" and token.__contains__('valueSrc'):
                if token["valueSrc"] in self.insecure_methods: 
                    self.trigger_alarm(src_file, lineno)

            elif token_type == "function_call" and token.__contains__("name") and token["name"] in self.insecure_methods:
                    self.trigger_alarm(src_file, lineno)
            
            elif token_type == "function_def" and token.__contains__("return") and token["return"] is not None:
                for func_return in token["return"]:
                    if func_return in self.insecure_methods:
                        self.trigger_alarm(src_file, lineno)
                        
        except Exception as error:
            print("dynamic code error:"+str(error))

    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    