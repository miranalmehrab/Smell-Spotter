import json

from filters.assertstat import AssertStatement
from filters.cipher import Cipher
from filters.ipbinding import IpBinding
from filters.xss import Xss
from filters.yamlload import YamlOperations 
from filters.debugflag import DebugFlag
from filters.tempdir import TmpDirectory
from filters.dynamicode import DynamicCode
from filters.hardcodedsecret import HardcodedSecret
from filters.httponly import HttpWithoutTLS
from filters.ignexcept import IgnoreException


from filters.sqlinjection import SqlInjection
from filters.emptypassword import EmptyPassword
from filters.nocertificate import NoCertificate
from filters.nointegritycheck import NoIntegrity
from filters.filepermission import FilePermission
from filters.deserialization import Deserialization
from filters.commandinjection import CommandInjection

class RuleEngine():
    
    def __init__(self, tokens, src_file_name):
        self.tokens = tokens
        self.src_file_name = src_file_name


    def filter(self):

        try:
            imported_modules = self.get_imported_modules()
            
            assert_statement = AssertStatement()
            cipher = Cipher()
            ip_binding = IpBinding()
            debug_flag = DebugFlag()
            xss = Xss()
            yaml = YamlOperations()
            tmp_dir = TmpDirectory()
            dynamic_code = DynamicCode()
            hardcoded_secret = HardcodedSecret()
            
            no_integrity = NoIntegrity()
            sql_injection = SqlInjection()
            empty_password = EmptyPassword()
            no_certificate = NoCertificate()
            file_permission = FilePermission()
            deserialization = Deserialization()
            http_without_tls = HttpWithoutTLS()
            ignore_exception = IgnoreException()
            command_injection = CommandInjection()

        except Exception as error:
            print(error)


        for token in self.tokens:
            try:
                token = json.loads(token)
                
                assert_statement.detect_smell(token, self.src_file_name)
                cipher.detect_smell(token, self.src_file_name)
                ip_binding.detect_smell(token, self.src_file_name)
                xss.detect_smell(token, self.src_file_name)
                yaml.detect_smell(token, self.src_file_name)
                debug_flag.detect_smell(token, self.src_file_name)
                tmp_dir.detect_smell(token, self.src_file_name)
                dynamic_code.detect_smell(token, self.src_file_name)
                hardcoded_secret.detect_smell(token, self.src_file_name)
                
                sql_injection.detect_smell(token, self.src_file_name)
                empty_password.detect_smell(token, self.src_file_name)
                no_certificate.detect_smell(token, self.src_file_name)
                deserialization.detect_smell(token, self.src_file_name)
                file_permission.detect_smell(token, self.src_file_name)
                http_without_tls.detect_smell(token, self.src_file_name)
                ignore_exception.detect_smell(token, self.src_file_name)
                command_injection.detect_smell(token, self.src_file_name)
                
                no_integrity.detect_smell(token, imported_modules, self.src_file_name)  

            except Exception as error: 
                print(json.dumps("Error detecting tokens"))
            

    def get_imported_modules(self):

        imported_modules = []
        for token in self.tokens:
            try: 
                token = json.loads(token)
                if token['type'] == 'import':
                    imported_modules.append(token['og'])

            except Exception as error: print(str(error))
        return imported_modules
