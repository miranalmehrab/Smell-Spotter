import re

class TmpDirectory:
    '''This is the class for detecting hard-coded tmp directories in code'''

    def __init__(self):
        self.warning_message = 'hard-coded tmp directories'
        self.unwanted_dir_names = ['folder', 'directory', 'dir', 'path', 'root', 'tmp', 'temp', 'temporary', 'site', 'log_', 'save', 'upload']                   

    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): tokenType = token["type"]
            if token.__contains__("name"): name = token["name"]
            if token.__contains__("values"): values = token["values"]
            
            
            if tokenType == "variable" and name is not None and token['value'] is not None:
                for dir_name in self.unwanted_dir_names:
                    if(
                        (re.match(r'[_A-Za-z0-9-]*{dir}\b'.format(dir = dir_name), name.lower().strip()) or re.match(r'\b{dir}[_A-Za-z0-9-]*'.format(dir = dir_name), name.lower().strip())) 
                        and self.is_valid_path(token['value'])
                    ): 
                        self.trigger_alarm(src_file, lineno)
                        break

            elif (tokenType == "list" or tokenType == "set") and token['name'] is not None and token.__contains__('values'):
                smell_found = False

                for dir_name in self.unwanted_dir_names:
                    if(re.match(r'[_A-Za-z0-9-]*{dir}\b'.format(dir = dir_name), name.lower().strip()) or re.match(r'\b{dir}[_A-Za-z0-9-]*'.format(dir = dir_name), name.lower().strip())): 
                        for value in token['values']: 
                            if self.is_valid_path(value):
                                self.trigger_alarm(src_file, lineno)
                                smell_found = True
                                break

                    if smell_found is True: break


            elif tokenType == "dict" and name is not None and token.__contains__('pairs'):
                smell_found = False

                for pair in token['pairs']:
                    for dir_name in self.unwanted_dir_names:
                        if(
                            (re.match(r'[_A-Za-z0-9-]*{dir}\b'.format(dir = dir_name), pair[0].lower().strip()) or re.match(r'\b{dir}[_A-Za-z0-9-]*'.format(dir = dir_name), pair[0].lower().strip()))
                            and self.is_valid_path(pair[1])
                        ):
                                self.trigger_alarm(src_file, lineno)
                                smell_found = True
                                break
                    
                    if smell_found is True: break    

            if tokenType == "function_call" and token.__contains__('keywords'):
                for keyword in token['keywords']:
                    for dir_name in self.unwanted_dir_names:
                        if (
                            len(keyword) == 2 
                            and (re.match(r'[_A-Za-z0-9-]*{dir}\b'.format(dir = dir_name), keyword[0].lower().strip()) or re.match(r'\b{dir}[_A-Za-z0-9-]*'.format(dir = dir_name), keyword[0].lower().strip())) 
                            and self.is_valid_path(keyword[1])
                        ): 
                            self.trigger_alarm(src_file, lineno)
                            break

        except Exception as error: print(str(error))

    def is_valid_path(self, value):

        if value is None: return False
        if isinstance(value, str) is False: return False
        if len(value) == 0: return False
        if value == '/': return False
        if value == '//': return False
        if value == '\\': return False

        unix_path_reg = r'^(~?((\.{1,2}|\/?)*[a-zA-Z0-9]*\/)+)[a-zA-Z0-9]*\/?'
        windows_path_reg = r'^([A-Za-z]?\:?)?\\{1,2}([A-Za-z0-9]*\\)*[A-Za-z0-9]*\\?'

        if re.fullmatch(unix_path_reg, value): return True
        elif re.fullmatch(windows_path_reg, value): return True
        else: return False
    
    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    