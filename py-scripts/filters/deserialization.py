class Deserialization:
    '''This is the class for detecting insecure deserialization operations in code'''

    def __init__(self):
        self.insecure_methods = [
                                'pickle.loads', 'pickle.load', 'pickle.Unpickler', 'cPickle.loads', 'cPickle.load', 'cPickle.Unpickler', 'marshal.loads', 'marshal.load', 
                                'xml.etree.cElementTree.parse', 'xml.etree.cElementTree.iterparse','xml.etree.cElementTree.fromstring','xml.etree.cElementTree.XMLParser',
                                'xml.etree.ElementTree.parse', 'xml.etree.ElementTree.iterparse', 'xml.etree.ElementTree.fromstring', 'xml.etree.ElementTree.XMLParser',
                                'xml.sax.expatreader.create_parser', 'xml.dom.expatbuilder.parse', 'xml.dom.expatbuilder.parseString', 'xml.sax.parse', 'xml.sax.parseString', 
                                'xml.sax.make_parser','xml.dom.minidom.parse','xml.dom.minidom.parseString', 'xml.dom.pulldom.parse','xml.dom.pulldom.parseString','lxml.etree.parse',
                                'lxml.etree.fromstring','lxml.etree.RestrictedElement','xml.etree.GlobalParserTLS', 'lxml.etree.getDefaultParser', 'lxml.etree.check docinfo'
                            ]

        self.warning_message = 'insecure deserialization'

    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): token_type = token["type"]
            
            if token['type'] == 'import':
                if token.__contains__('og'):
                    for method in self.insecure_methods:
                        if self.is_sublist_of_another_list(token['og'].split('.'), method.split('.')):
                            self.trigger_alarm(src_file, lineno)
                            break

            elif token_type == "variable" and token.__contains__("valueSrc") and token["valueSrc"] in self.insecure_methods:
                self.trigger_alarm(src_file, lineno)

            elif token_type == "function_call":
                if token.__contains__("name") and token["name"] in self.insecure_methods: 
                    self.trigger_alarm(src_file, lineno)
            
                if token.__contains__("args") and len(token["args"]) > 0:
                    for arg in token["args"]:
                        if arg in  self.insecure_methods: 
                            self.trigger_alarm(src_file, lineno)
            
            elif token_type == "function_def" and token.__contains__("return") and token["return"] is not None:
                for func_return in token["return"]:
                    if func_return in self.insecure_methods:
                        self.trigger_alarm(src_file, lineno)
        
        except Exception as error:
            print("deserialization error:"+str(error))

    def is_sublist_of_another_list(self, smaller_list, bigger_list):
        for item in smaller_list:
            if item not in bigger_list: 
                return False

        return True


    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    