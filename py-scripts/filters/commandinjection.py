import re

class CommandInjection:
    '''This is the class for detecting command injection in code'''

    def __init__(self):
        self.shell_methods = [
                        'sys.argv', 'subprocess.Popen', 'os.system', 'os.popen','subprocess.run','popen2.Popen4',
                        'argparse.ArgumentParser','getopt.getopt', 'os.execle', 'os.execl','popen2.Popen3'
            ]
            
        self.warning_message = 'command injection'

    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"] 
            if token.__contains__("type"): tokenType = token["type"]
            if token.__contains__("name"): name = token["name"]
            if token.__contains__("args"): args = token["args"]
            if token.__contains__("hasInputs"): containsUserInput =  token["hasInputs"]
            
            if tokenType == "variable" and token.__contains__("valueSrc") and token["valueSrc"] is not None and token["valueSrc"] != 'initialization':
                if token["valueSrc"].strip() in self.shell_methods or self.is_extended_shell_command_names(token["valueSrc"].strip()):
                    self.trigger_alarm(src_file, lineno)
            
            elif tokenType == "function_call" and name is not None and (name.strip() in self.shell_methods or self.is_extended_shell_command_names(name.strip())): 
                self.trigger_alarm(src_file, lineno)
        
            elif tokenType == "function_def" and token.__contains__('return') and token["return"] is not None: 
                for func_return in token['return']:
                    if isinstance(func_return, str) and (func_return in self.shell_methods or self.is_extended_shell_command_names(func_return)):
                        self.trigger_alarm(src_file, lineno)
            
        except Exception as error: 
            print("command injection error"+str(error))
        
    def is_extended_shell_command_names(self, method_name):
        
        if isinstance(method_name, str) is False: return False
        elif len(method_name) == 0: return False

        self.shell_methods = ['sys.argv', 'subprocess.Popen', 'os.system', 'os.popen','subprocess.run', 'argparse.ArgumentParser', 'getopt.getopt']
        
        for name in self.shell_methods:
            if name in method_name: 
                return True

        return False

    
    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    