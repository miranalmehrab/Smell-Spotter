
class YamlOperations:
    '''This is the class for detecting insecure yaml operations in code'''

    def __init__(self):
        self.insecure_methods = [ 'yaml.load', 'yaml.load_all', 'yaml.full_load', 'yaml.dump', 'yaml.dump_all', 'yaml.full_load_all']
        self.warning_message = 'use of insecure YAML operations'


    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): token_type = token["type"]
            
            if token_type == "variable" and token.__contains__("valueSrc"):
                if token["valueSrc"] in self.insecure_methods: 
                    self.trigger_alarm(src_file, lineno)

            elif token_type == "function_call" and token.__contains__("name"):
                
                if token["name"] in self.insecure_methods:
                    self.trigger_alarm(src_file, lineno)
                
                if token.__contains__("args"):
                    for arg in token["args"]:
                        if arg in self.insecure_methods:
                            self.trigger_alarm(src_file, lineno)

            elif token_type == "function_def" and token.__contains__("return") and token['return'] is not None:
                for func_return in token["return"]:
                    if func_return in self.insecure_methods: 
                        self.trigger_alarm(src_file, lineno)

        except Exception as error: 
            print(str(error))    


    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    
