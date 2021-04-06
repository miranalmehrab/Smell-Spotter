import re
from urllib.parse import urlparse

class NoIntegrity:
    '''This is the class for detecting no integrity checks in code'''

    def __init__(self):
        self.http_libs = ['urllib.request.urlretrieve','urllib.urlretrieve','urllib2.urlopen','requests.get','wget.download']
        self.warning_message = 'no integrity check'

    def detect_smell(self, token, imports, src_file):

        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): tokenType = token["type"]
            if token.__contains__("name"): name = token["name"]
            if token.__contains__("args"): args = token["args"]
                

            if tokenType == "variable" and token.__contains__('valueSrc') and token.__contains__('args'):    
                if token['valueSrc'] in self.http_libs and len(token['args']) > 0:
                    if isinstance(args[0], str) and self.is_valid_download_url(args[0]) and 'hashlib' not in imports:
                        self.trigger_alarm(src_file, lineno)
                    

            elif tokenType == "function_call" and name in self.http_libs and len(args) > 0:
                if isinstance(args[0], str) and self.is_valid_download_url(args[0]) and 'hashlib' not in imports:
                    self.trigger_alarm(src_file, lineno)
            

            elif tokenType == "function_def" and token.__contains__('return') and token.__contains__('returnArgs') and token["return"] is not None:
                returnArgs = token['returnArgs']
                
                if len(returnArgs) > 0:
                    for func_return in token['return']:
                        if func_return in self.http_libs and isinstance(returnArgs[0], str) and self.is_valid_download_url(returnArgs[0]) and 'hashlib' not in imports:
                            self.trigger_alarm(src_file, lineno)
                

        except Exception as error: 
            print(str(error))



    def is_ip(self, ip):
        for part in ip.split('.'):
            if part.isdigit() is False: 
                return False

        for part in ip.split('.'):
            if int(part) > 255: return False
            elif int(part) < 0: return False
        
        return True


    def is_valid_download_url(self, url):
        
        file_extensions = ['iso', 'tar', 'bzip2', 'zip', 'rar', 'gzip', 'gzip2', 'gz','snap', 'flatpak',
                    'deb', 'rpm', 'sh', 'run', 'bin', 'exe', 'rar', '7zip', 'msi', 'bat', 'dmg', 'pacman',
                    'z', 'pkg', '7z', 'arj', 'iso', 'vcd', 'toast', 'csv', 'dat', 'db', 'dbf', 'log', 'mdb', 
                    'xml','sql', 'aif', 'cda', 'mid', 'midi', 'mp3', 'mpa', 'ogg', 'wma', 'wav', 'wpl', 'email',
                    'eml', 'emlx', 'msg', 'oft', 'ost', 'pst', 'vcf', 'apk', 'cgi', 'pl', 'com', 'gadget', 'jar', 
                    'py', 'wsf', 'fnt', 'fon', 'otf', 'ttf', 'ai','bmp', 'gif', 'ico', 'jpeg', 'hpg', 'png', 'ps',
                    'svg', 'psd', 'tif', 'tiff', 'asp', 'aspx', 'cer', 'cfm', 'cgi', 'pl', 'css', 'htm', 'html',
                    'js', 'jsp', 'part', 'php', 'rss', 'xhtml', 'key', 'odp', 'pps','ppt', 'pptx', 'c', 'cpp', 'h',
                    'java', 'vb', 'sh', 'swift', 'xls', 'xlsm', 'xlsx', 'bak', 'sys', 'tmp','ini', 'cab', 'cfg', 'cpl',
                    'cur', 'dll', 'dmp', 'drv','icns','ico','lnk','sys','doc','docx','pdf','odt','rtf','tex','txt','pwd',
                    'odf','wmv','vob','swf','rm','mpeg','mpg','mp4','mp3','mov','mkv','m4v','h264','flv','avi','3gp','3g2'
                ]

        if self.is_ip(url.split('/')[0]):

            file_ext = url.split('/')[-1]
            if file_ext.split('.')[-1] in file_extensions:
                return True
            return False

        else:
            reg_url = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\), ]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', str(url))
        
            url = reg_url[0] if len(reg_url) > 0 else None
            if url is None: return False

            parsed_url = urlparse(url)
            
            file_path = parsed_url.path
            path_extension = file_path.split('/')[-1]
            path_extension = path_extension.split('.')[-1]
            if path_extension in file_extensions: return True
            
            file_query = parsed_url.query
            query_extension = file_query.split('=')[-1] if len(file_query.split('=')) > 0 else query_extension
            query_extension = query_extension.split('.')[-1]  if len(file_query.split('.')) > 0 else query_extension
            
            if query_extension in file_extensions: return True
            elif 'file' in file_query: return True
            elif 'File' in file_query: return True
            elif 'FILE' in file_query: return True

            return False

    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    