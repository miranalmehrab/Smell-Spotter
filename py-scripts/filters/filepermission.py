
class FilePermission:
    '''This is the class for detecting bad file permissions in code'''

    def __init__(self):
        self.insecure_methods = ['os.chmod', 'chmod'] 
        self.warning_message = 'bad file permission'
        self.unwanted_params = ['stat.S_IRWXG','stat.S_IRGRP', 'stat.S_IWGRP','stat.S_IXGRP','stat.S_IRWXO','stat.S_IROTH','stat.S_IWOTH','stat.S_IXOTH']


    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): tokenType = token["type"]
            if token.__contains__("name"): name = token["name"]
            if token.__contains__("args"): args = token["args"]

            if tokenType == "function_call" and name in self.insecure_methods:
                if self.has_dangerous_parameters_in_function_call(token['args']):
                    self.trigger_alarm(src_file, lineno)
                
            elif tokenType == 'function_call' and name == 'subprocess.call' and len(args) > 0:
                
                if isinstance(token['args'][0], list):
                    for arg in token['args'][0]:
                        if arg in self.insecure_methods:
                            if self.has_dangerous_parameters_in_function_call(token['args'][0]):
                                self.trigger_alarm(src_file, lineno)
                else:
                    for arg in token['args']:
                        if arg in self.insecure_methods:
                            if self.has_dangerous_parameters_in_function_call(token['args']):
                                self.trigger_alarm(src_file, lineno)
                
        except Exception as error:
            print(str(error))

    def has_dangerous_parameters_in_function_call(self, args):
        for arg in args:
            if isinstance(arg, int):

                octal_value_of_arg = oct(arg)
                group_permission_value = octal_value_of_arg[-2]
                other_permission_value = octal_value_of_arg[-1]

                if int(group_permission_value) > 4 or int(other_permission_value) > 4: return True
                    
            elif isinstance(arg, str):
                if arg in self.unwanted_params: 
                    return True

        return False
    

    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    