class AssertStatement:
    '''This is the class for detecting assert statement in code'''

    def __init__(self):
        self.insecure_token_types = ['assert']
        self.warning_message = 'use of assert statement'

    def detect_smell(self, token, src_file):
        lineno = token['line']

        try:
            if token['type'] in self.insecure_token_types:
                self.trigger_alarm(src_file, lineno)

        except Exception as error: 
            print("assert: "+str(error))
    
    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
