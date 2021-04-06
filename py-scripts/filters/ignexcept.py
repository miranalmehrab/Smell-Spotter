class IgnoreException:
    '''This is the class for detecting ignoring exception blocks in code'''

    def __init__(self):
        self.unwanted_handlers = ['continue','pass']
        self.warning_message = 'ignoring except block'


    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): token_type = token["type"] 
            if token.__contains__("exceptionHandler"): exception_handler = token["exceptionHandler"]
            
            if token_type == "exception_handle" and exception_handler in self.unwanted_handlers: 
                self.trigger_alarm(src_file, lineno)
        
        except Exception as error: 
            print("ignore except error:"+str(error))
    

    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    