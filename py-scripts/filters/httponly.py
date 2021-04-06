import re
from urllib.parse import urlparse

class HttpWithoutTLS:
    '''This is the class for detecting use of HTTP without TLS in code'''

    def __init__(self):
        self.http_libs = ['httplib.urlretrieve','urllib.request.urlopen','urllib.urlopen','urllib2.urlopen','requests.get', 
                        'requests.post','urllib.request.Request','httplib.HTTPConnection','httplib2.Http.request'
                    ]

        self.new_http_libs = ['urllib3.PoolManager.request']
        self.warning_message = 'use of HTTP without TLS'


    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): tokenType = token["type"]
            if token.__contains__("name"): name = token["name"]
            if token.__contains__("args"): args = token["args"]

            if tokenType == "variable" and token.__contains__('value') and token.__contains__('valueSrc'):
                if token['value'] is not None and  self.is_valid_http_url(token['value']) and token['valueSrc'] == 'initialization':
                    self.trigger_alarm(src_file, lineno)

            if tokenType == "variable" and token.__contains__('funcKeywords'):
                for keyword in token['funcKeywords']:
                    if keyword[1] is not None and self.is_valid_http_url(keyword[1]):
                        self.trigger_alarm(src_file, lineno)
                        break

            if tokenType == "variable" and token.__contains__("valueSrc") and token.__contains__("args"):
                args = token['args']
                valueSrc = token['valueSrc']

                if valueSrc in self.http_libs and len(args) > 0 and args[0] is not None and self.is_valid_http_url(args[0]):
                    self.trigger_alarm(src_file, lineno)
                
                elif valueSrc in self.new_http_libs and len(args) > 1 and args[1] is not None and self.is_valid_http_url(args[1]):
                    self.trigger_alarm(src_file, lineno)
        
            elif tokenType == "function_call" and name is not None: 
                if name in self.http_libs and len(args) > 0 and args[0] is not None and self.is_valid_http_url(args[0]):                                     
                    self.trigger_alarm(src_file, lineno)

                elif name in self.new_http_libs and len(args) > 1 and args[1] is not None and self.is_valid_http_url(args[1]):
                    self.trigger_alarm(src_file, lineno)

            elif tokenType == "function_def" and token.__contains__('return') and token.__contains__('returnArgs') and token["return"] is not None:
                returnArgs = token['returnArgs']

                for func_return in token["return"]:
                    if func_return in self.http_libs and len(returnArgs) > 0 and returnArgs[0] is not None and self.is_valid_http_url(returnArgs[0]):           
                        self.trigger_alarm(src_file, lineno)

                    elif func_return in self.new_http_libs and len(returnArgs) > 1 and returnArgs[1] is not None and self.is_valid_http_url(returnArgs[1]):           
                        self.trigger_alarm(src_file, lineno)

        except Exception as error: 
            print(str(error))


    def is_valid_http_url(self, url): 

        reg_url = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\), ]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', str(url))
        url = reg_url[0] if len(reg_url) > 0 else None
        if url is None: return False

        parsed_url = urlparse(url)

        if parsed_url.scheme == 'http': return True
        elif parsed_url.scheme == 'https': return False
        # elif parsed_url.scheme == '': return True
        else: return True
    

    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    