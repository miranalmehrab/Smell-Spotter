import re

class SqlInjection:
    '''This is the class for detecting sql injections in code'''

    def __init__(self):
        self.insecure_methods = [
                            'execution.query', 'connection.cursor.execute', 'sqlite3.connect.execute',
                            'psycopg2.connect.cursor.execute','mysql.connector.connect.cursor.execute', 
                            'pyodbc.connect.cursor.execute', 'sqlalchemy.sql.text', 'sqlalchemy.text',
                            'records.Database.query', 'RawSQL', 'self.execute', 'sql.SQL', 'cursor.execute',
                            'self.cursor.execute'
                        ]
        self.warning_message = 'constructing sql statement upon user input'


    def detect_smell(self, token, src_file):
        try:
            if token.__contains__("line"): lineno = token["line"]
            if token.__contains__("type"): token_type = token["type"]
            if token.__contains__("name"): name = token["name"]
            if token.__contains__("args"): args = token["args"]
            
            if token["type"] == 'variable' and token['name'] is not None:
                if token.__contains__('value') and token.__contains__('values') is False and token['value'] is not None:
                    if self.is_sql_query(token['name']) and self.has_insecure_values([token['value']]):
                        self.trigger_alarm(src_file, lineno)

                                
                if token.__contains__('value') and token.__contains__('values'): 
                    if self.is_sql_query(token['name']) and self.has_insecure_values(token['values']):
                        self.trigger_alarm(src_file, lineno)

            
            if token["type"] == "variable" and token.__contains__('valueSrc') and token.__contains__('args'):
                if(token['valueSrc'] in self.insecure_methods or self.query_methods_has_patterns(token['valueSrc'])):
                    self.trigger_alarm(src_file, lineno)

                        
            elif token_type == "function_call" and token.__contains__('name') and token.__contains__('args'):
                if (name in self.insecure_methods or self.query_methods_has_patterns(name)):
                    if len(token['args']) > 1 and self.has_insecure_values(token['args']):
                        self.trigger_alarm(src_file, lineno)

            
            elif token_type == "function_def" and token.__contains__('return') and token["return"] is not None and token.__contains__('returnArgs'):
                for func_return in token['return']:
                    if (func_return in self.insecure_methods or self.query_methods_has_patterns(func_return)):
                        self.trigger_alarm(src_file, lineno)


        except Exception as error: 
            print("sql injection error:"+str(error))



    def is_sql_query(self, name):
        common_query_names = ['query', 'sql', 'db', 'database']

        for query_name in common_query_names:
            if query_name in name.lower().strip():
                # print('name match found')
                return True

        return False



    def has_insecure_values(self, values):
        insecure_keywords_in_value = [
                            'select * from', 'create table', 'drop table', 'alter table',
                            'add constraint','delete from', 'create database', 'insert into',
                            'group by','order by', 'union all', 'truncate table', 'outer join',
                            'insert into', 'inner join', 'select', '%s', '{}'
                        ]
        
        for value in values:
            if isinstance(value, str): 
                if 'select ' in value.lower().strip():
                    return True
                
                for keyword in insecure_keywords_in_value:
                    if keyword in value.lower().strip():
                        return True
        return False


    def query_methods_has_patterns(self, name):
        methods = [
                    'execution.query', 'connection.cursor.execute', 'sqlite3.connect.execute','psycopg2.connect.cursor.execute', 
                    'mysql.connector.connect.cursor.execute', 'pyodbc.connect.cursor.execute', 'sqlalchemy.sql.text', 'objects.extra', 'objects.raw'
                ]

        if isinstance(name, str) is False: return False
        elif len(name) == 0: return False

        for method in methods:
            if method in name: return True
        
        return False
    
    def trigger_alarm(self, src_file, lineno):
        print(src_file +":"+ str(lineno)+" ,"+self.warning_message)
    