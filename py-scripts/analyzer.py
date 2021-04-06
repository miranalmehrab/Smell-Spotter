import ast
import sys   
import json
import time

class Analyzer(ast.NodeVisitor):

    def __init__(self):
        self.inputs = []
        self.statements = []
        
    ######################### Import Modules Block Here #########################
    def visit_Import(self, node):
        try: 
            for name in node.names:

                module = {}
                module["type"] = "import"
                module["line"] = node.lineno
                module["og"] = name.name
                module["alias"] = name.asname if name.asname else None
                self.statements.append(module)
        
        except Exception as error: pass
        self.generic_visit(node)


    def visit_ImportFrom(self, node):
        try:
            for name in node.names:

                member = {}
                member["type"] = "import"
                member["line"] = node.lineno

                if node.module is not None: member["og"] = node.module +'.'+ name.name if name.name !="*" else node.module
                else: member["og"] = name.name
                
                if node.module is not None: member["alias"] = node.module +'.'+ name.asname if name.asname else None
                else: member["alias"] = name.asname
                
                self.statements.append(member)
        
        except Exception as error: pass
        self.generic_visit(node)


    ######################### Function Definitions Here #########################
    def visit_FunctionDef(self, node):
        try:
            func_def = {}
            func_def["type"] = "function_def"
            func_def["line"] = node.lineno
            func_def["name"] = node.name
            func_def["args"] = []
            func_def["defaults"] = []
            func_def["return"] = None

            for arg in node.args.args:
                if isinstance(arg, ast.arg): func_def["args"].append(arg.arg)
            
            if isinstance(node.args.vararg, ast.arg): 
                func_def["args"].append(node.args.vararg.arg)
            
            elif isinstance(node.args.kwarg, ast.arg): 
                func_def["args"].append(node.args.kwarg.arg)
            
            for default in node.args.defaults:
                if isinstance(default, ast.Constant):
                    default_value = self.separate_variables(default,[])
                    if len(default_value) > 0: 
                        func_def["defaults"].append([default_value[0], True])
                else:
                    default_value = self.separate_variables(default,[])
                    if len(default_value) > 0: 
                        func_def["defaults"].append([default_value[0], False])
                

            for item in node.body:
                
                if isinstance(item, ast.Return):
                    func_def['returnLine'] = item.lineno
                    func_def["return"] = self.separate_variables(item.value,[])
                    func_def["return"] = func_def["return"] if len(func_def["return"]) > 0 else None

                    if isinstance(item.value, ast.Call):
                        func_def["returnArgs"] = []
                        for arg in item.value.args:
                            func_def["returnArgs"] = self.separate_variables(arg, func_def["returnArgs"])
                            
                            for i in range(len(func_def["returnArgs"])):
                                if self.value_from_variable_name(func_def["returnArgs"][i])[0]: 
                                    func_def["returnArgs"][i] = self.value_from_variable_name(func_def["returnArgs"][i])[1]

                        for keyword in item.value.keywords:
                            func_def['returnKeywords'] = []
                            karg = keyword.arg
                            kvalue = None

                            if isinstance(keyword.value, ast.Constant): kvalue = keyword.value.value
                            if karg: func_def['returnKeywords'].append([karg,kvalue])

            self.statements.append(func_def)
     
        except Exception as error: pass
        self.generic_visit(node)


    ######################### Variable And List Assign Block Here #########################

    def visit_Assign(self, node):
        
        try:
            for target in node.targets:
                
                variable = {}
                variable["type"] = "variable"
                variable["line"] = node.lineno
                variable['name'] = None
                variable['value'] = None
                variable['valueSrc'] = 'initialization'
                variable['funcKeywords'] = []
                variable['isInput'] = False
            
                if isinstance(target, ast.Name) and isinstance(node.value, ast.Constant):
                    variable["name"] = target.id
                    variable["value"] = node.value.value
                    
                elif isinstance(target, ast.Name) and isinstance(node.value, ast.BinOp):
                    variable["name"] = target.id
                    usedVars = self.get_variables_used_in_declaration(node.value)

                    returns = self.build_value_from_used_variables(usedVars, variable['line'])
                    if returns[0] is True: variable["value"] = returns[1]
                    else: 
                        variable['value'] = None
                        variable['values'] = usedVars
                        variable['valueSrc'] = 'BinOp'
                        # variable['remove'] = True
                    
                elif isinstance(target, ast.Name) and isinstance(node.value, ast.List):
                    variable["name"] = target.id
                    variable["type"] = "list"
                    variable["values"] = []
                    
                    for element in node.value.elts:
                        if isinstance(element, ast.Constant):
                            variable["values"].append(element.value)

                elif isinstance(target, ast.Name) and isinstance(node.value, ast.Dict):
                    variable["name"] = target.id
                    variable["type"] = "dict"
                    variable["pairs"] = []
                    
                    pairs = zip(node.value.keys, node.value.values)
                    for pair in pairs:
                        
                        if isinstance(pair[0], ast.Constant) and isinstance(pair[1], ast.Constant):
                            variable["pairs"].append([pair[0].value, pair[1].value])
                        
                        elif isinstance(pair[0], ast.Name) and isinstance(pair[1], ast.Constant):
                            variable["pairs"].append([pair[0].id, pair[1].value])
                
                elif isinstance(target, ast.Name) and isinstance(node.value, ast.Tuple):
                    variable["name"] = target.id
                    variable["type"] = "tuple"
                    variable["values"] = []

                    for element in node.value.elts:
                        if isinstance(element, ast.Constant):
                            variable["values"].append(element.value)
                    
                elif isinstance(target, ast.Name) and isinstance(node.value, ast.Set):
                    variable["name"] = target.id
                    variable["type"] = "set"
                    variable["values"] = []
                    
                    for element in node.value.elts:
                        if isinstance(element, ast.Constant):
                            variable["values"].append(element.value)
                    

                elif (isinstance(target, ast.Name) or isinstance(target, ast.Attribute) or isinstance(target, ast.Subscript)) and isinstance(node.value, ast.Call):
                    
                    if isinstance(target, ast.Name): variable["name"] = target.id
                    elif isinstance(target, ast.Attribute): 
                        variable["name"] = self.get_name_from_attribute_node(target)
                        if target.attr: variable["name"] = variable["name"]+ '.' +target.attr
                    
                    elif isinstance(target, ast.Subscript):
                        returns = self.separate_variables(target, [])
                        variable["name"] = returns[0] if len(returns) > 0 else None


                    function_name = self.get_function_name(node.value)
                    variable["value"] = None #self.get_function_return_value(function_name) 
                    variable["valueSrc"] = function_name
                    variable["args"] = []
                    variable["isInput"] = False
                    
                    input_functions = [ 'input', 'request.POST.get', 'request.GET.get', 'request.GET.getlist', 'request.POST.getlist',
                                        'self.request.POST.get', 'self.request.GET.get', 'self.request.GET.getlist', 'self.request.POST.getlist'
                                    ]
                    
                    if function_name is not None:
                        for name in input_functions:
                            if name in function_name:
                                variable["value"] = None
                                variable["isInput"] = True
                                self.inputs.append(variable["name"])
                                break
                    
                    for arg in node.value.args:
                        if isinstance(arg, ast.Attribute): 
                            
                            variable["args"].append(self.get_name_from_attribute_node(arg)+'.'+arg.attr)

                            function_object = {}
                            function_object["type"] = "function_obj"
                            function_object["line"] = node.lineno
                            function_object["objName"] = variable["name"]
                            function_object["function_name"] = variable["valueSrc"]
                            function_object["args"] = variable["args"]

                            if(function_object not in self.statements):
                                self.statements.append(function_object)
                        
                        elif isinstance(arg, ast.Call) and isinstance(arg.func, ast.Name):
                            function_name = arg.func.id
                            function_name = self.get_function_name_from_object(function_name)
                            variable['args'].append(function_name)
                            
                            if function_name in input_functions:

                                variable['value'] = None
                                variable["valueSrc"] = function_name
                                variable['isInput'] = True
                        
                            self.extract_function_call_from_argument_passing(arg)

                        elif isinstance(arg, ast.Call) and isinstance(arg.func, ast.Attribute):

                            function_name = self.get_name_from_attribute_node(arg.func)
                            function_name = function_name + arg.func.attr

                            variable['valueSrc'] = function_name
                            variable["isInput"] = False

                            input_functions = [ 'input', 'request.POST.get', 'request.GET.get', 'request.GET.getlist', 'request.POST.getlist',
                                                'self.request.POST.get', 'self.request.GET.get', 'self.request.GET.getlist', 'self.request.POST.getlist'
                                            ]

                            if function_name in input_functions:
                                variable["value"] = None
                                variable["valueSrc"] = function_name
                                variable["isInput"] = True
                                self.inputs.append(variable["name"])
                            
                            self.extract_function_call_from_argument_passing(arg)
                            
                        elif isinstance(arg, ast.Name):
                            name = arg.id
                            value = None
                            returns = self.value_from_variable_name(name) 
                            if returns[0] is True: value = returns[1]

                            isInput = self.search_input_in_declaration([name], variable["line"])
                            if isInput is True:
                                variable['value'] = None
                                variable['valueSrc'] = 'input'
                                variable['isInput'] = True

                            else:
                                if value is not None: variable["args"].append(value)
                                else:  variable["args"].append(name)

                        else: variable["args"] = (self.separate_variables(arg, variable["args"]))



                    for keyword in node.value.keywords:
                        
                        # variable['funcKeywords'] = []
                        karg = keyword.arg
                        kvalue = None
                        should_take = True
                        
                        if isinstance(keyword.value, ast.Constant): kvalue = keyword.value.value
                        elif isinstance(keyword.value, ast.Name): 
                            kvalue = keyword.value.id
                            returns = self.value_from_variable_name(kvalue) 
                            if returns[0] is True: kvalue = returns[1]
                            else: should_take = False

                            isInput = self.search_input_in_declaration([keyword.value.id], variable["line"])
                            if isInput is True:
                                variable['value'] = None
                                variable['valueSrc'] = 'input'
                                variable['isInput'] = True
                        
                        if karg is not None and should_take:
                            variable["funcKeywords"].append([karg, kvalue])
                            # print(variable["funcKeywords"])

                    try:
                        # print(ast.dump(node.value))
                        # print()

                        keywords_from_all_functions = self.get_function_keywords(node.value, [])

                        for keyword in keywords_from_all_functions:
                            if keyword not in variable['funcKeywords']:
                                variable['funcKeywords'].append(keyword)
                    except Exception as error:
                        pass
                        # print(error)
                        # print(ast.dump(node.value))

                elif isinstance(target, ast.Attribute) and isinstance(node.value, ast.Constant):    
                    name = self.get_name_from_attribute_node(target)
                    returns = self.get_value_src_from_variable_name(name)
                    if returns[0] is True: name = returns[1]

                    if name is not None and target.attr is not None: variable["name"] = name +'.'+ target.attr
                    elif target.attr is None: variable["name"] = name
                    
                    variable['value'] = node.value.value

                self.statements.append(variable)
                # if variable['name'] is None and variable['value'] is None and variable['valueSrc'] == 'initialization': pass
                # elif variable.__contains__('remove') is False: self.statements.append(variable)
 
        except Exception as error: pass
        self.generic_visit(node)


    ######################### If Comparasion Block Here #########################
    def visit_If(self,node):
        try:
            
            statement = {}
            statement["type"] = "comparison"
            statement["line"] = node.lineno
            statement["pairs"] = []
            
            if isinstance(node.test, ast.BoolOp):
                for value in node.test.values:
                    
                    if isinstance(value, ast.Compare):
                        
                        if isinstance(value.left, ast.Name) and isinstance(value.comparators[0], ast.Constant):
                            statement["pairs"].append([value.left.id, value.comparators[0].value])
                        
                        elif isinstance(value.left, ast.Constant) and isinstance(value.comparators[0], ast.Name):
                            statement["pairs"].append([value.comparators[0].id, value.left.value])
                        
                        elif isinstance(value.left, ast.Name) and isinstance(value.comparators[0], ast.Name):
                            left_var = value.left
                            right_var = value.comparators[0]

                            value_of_right_var = self.value_from_variable_name(right_var)
                    
                            if value_of_right_var[0] is True:
                                if isinstance(value_of_right_var[1], list):
                                    for value in value_of_right_var[1]:
                                        statement['pairs'].append([left_var, value])
                                
                                else: statement['pairs'].append([left_var, value_of_right_var[1]])
                            
                            else:
                                value_of_left_var = self.value_from_variable_name(left_var)
                                if value_of_left_var[0] is True: 
                                    statement['pairs'].append([right_var, value_of_left_var[1]])

        
            elif isinstance(node.test, ast.Compare):
                
                if isinstance(node.test.left, ast.Name) and isinstance(node.test.comparators[0], ast.Name):
                    
                    left_var = node.test.left.id
                    right_var = node.test.comparators[0].id
                    value_of_right_var = self.value_from_variable_name(right_var)
                    
                    if value_of_right_var[0] is True:
                        if isinstance(value_of_right_var[1], list):
                            for value in value_of_right_var[1]:
                                statement['pairs'].append([left_var, value])
                        
                        else: statement['pairs'].append([left_var, value_of_right_var[1]])
                    
                    else:
                        value_of_left_var = self.value_from_variable_name(left_var)
                        if value_of_left_var[0] is True: 
                            statement['pairs'].append([right_var, value_of_left_var[1]])


                elif(
                    isinstance(node.test.left, ast.Name) 
                    and isinstance(node.test.comparators[0], ast.Constant) 
                    and (isinstance(node.test.ops[0], ast.IsNot) is False and isinstance(node.test.ops[0], ast.NotEq) is False)  
                ):    
                    statement["pairs"].append([node.test.left.id, node.test.comparators[0].value])

                elif isinstance(node.test.left, ast.Constant) and isinstance(node.test.comparators[0], ast.Name):
                    statement["pairs"].append([node.test.comparators[0].id, node.test.left.value])

            if len(statement['pairs']) > 0:
                self.statements.append(statement)
        
        except Exception as error: pass
        self.generic_visit(node)


    ######################### Try Block Here #########################

    def visit_Try(self, node):
        try:
            statement = {}
            statement["type"] = "exception_handle"
            # print(ast.dump(node))
            should_include_in_statements = False

            if isinstance(node, ast.Try):
                # print(ast.dump(node.handlers[0].body[0]))
                # print(type(node.handlers[0].body[0]))
                
                if len(node.handlers) > 0:    
                    if isinstance(node.handlers[0].body[0],ast.Continue):
                        statement["line"] = node.handlers[0].body[0].lineno
                        statement["exceptionHandler"] = "continue"
                        should_include_in_statements = True

                    elif isinstance(node.handlers[0].body[0],ast.Pass): 
                        statement["line"] = node.handlers[0].body[0].lineno
                        statement["exceptionHandler"] = "pass"
                        should_include_in_statements = True

                    else:
                        statement["line"] = node.handlers[0].body[0].lineno
                        statement["exceptionHandler"] = "expression"
                        should_include_in_statements = True

                elif len(node.finalbody) > 0:
                    if isinstance(node.finalbody[0],ast.Continue):
                        statement["line"] = nodenode.finalbody[0].lineno
                        statement["exceptionHandler"] = "continue"
                        should_include_in_statements = True
                    

                    elif isinstance(node.finalbody[0],ast.Pass): 
                        statement["line"] = node.finalbody[0].lineno
                        statement["exceptionHandler"] = "pass"
                        should_include_in_statements = True

                    else:
                        statement["line"] = node.finalbody[0].lineno
                        statement["exceptionHandler"] = "expression"
                        should_include_in_statements = True

            if should_include_in_statements is True:
                self.statements.append(statement)

        except Exception as error: pass
        self.generic_visit(node)


    ######################### Expressions Block Here #########################

    def visit_Expr(self, node):
        try:
            expression = {}
            expression["type"] = "function_call"
            expression["line"] = node.lineno
            expression["name"] = None
            expression["args"] = []
            expression["keywords"] = []
            expression["hasInputs"] = False
                
            if isinstance(node.value, ast.Call):
                if isinstance(node.value.func, ast.Name): expression["name"] = node.value.func.id
                elif isinstance(node.value.func,ast.Call): expression["name"] = self.get_function_name(node.value)
                elif isinstance(node.value.func,ast.Attribute): 
                    name = self.get_function_name(node.value)
                    expression["name"] = self.get_function_name_from_object(name)
    
                # separating args in function call
                for arg in node.value.args:
                    if isinstance(arg, ast.Call): self.extract_function_call_from_argument_passing(arg)
                    else: expression["args"] = self.separate_variables(arg, expression["args"])
                    
                # print(expression['args'])
                hasInputs = self.search_input_in_declaration(expression['args'], expression["line"])
                if hasInputs is True: expression["hasInputs"] = True

                # getting args value from name in function call
                for i in range(len(expression['args'])): 
                    returns = self.value_from_variable_name(expression['args'][i])
                    expression['args'][i] = returns[1] 
                
                for keyword in node.value.keywords:
                    karg = keyword.arg
                    kvalue = self.separate_variables(keyword.value, [])[0] if len(self.separate_variables(keyword.value, [])) > 0 else None 
                    
                    if karg and isinstance(keyword.value, ast.Constant): expression["keywords"].append([karg,kvalue,True])
                    elif karg and isinstance(keyword.value, ast.Constant) is False: expression["keywords"].append([karg,kvalue,False])

                self.statements.append(expression)

        except Exception as error: pass
        self.generic_visit(node)


    def extract_function_call_from_argument_passing(self, node):
        
        try:
            expression = {}
            expression["type"] = "function_call"
            expression["line"] = node.lineno
            expression["name"] = None
            expression["args"] = []
            expression["keywords"] = []
            expression["hasInputs"] = False
                
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name): expression["name"] = node.func.id
                elif isinstance(node.func,ast.Call): expression["name"] = self.get_function_name(node)
                elif isinstance(node.func, ast.Attribute): 
                    name = self.get_function_name(node)
                    expression["name"] = self.get_function_name_from_object(name)
                    # print('function name %s' % expression["name"])
    
                # separating args in function call
                for arg in node.args:
                    expression["args"] = self.separate_variables(arg,expression["args"])
                    if isinstance(arg, ast.Call): self.extract_function_call_from_argument_passing(arg)
                    
                # print(expression['args'])
                hasInputs = self.search_input_in_declaration(expression['args'], expression["line"])
                if hasInputs is True: expression["hasInputs"] = True

                # getting args value from name in function call
                for i in range(len(expression['args'])): 
                    returns = self.value_from_variable_name(expression['args'][i])
                    expression['args'][i] = returns[1] 
                
                for keyword in node.keywords:
                    karg = keyword.arg
                    kvalue = self.separate_variables(keyword.value, [])[0] if len(self.separate_variables(keyword.value, [])) > 0 else None
                    
                    if karg and isinstance(keyword.value, ast.Constant): expression["keywords"].append([karg,kvalue,True])
                    elif karg and isinstance(keyword.value, ast.Constant) is False: expression["keywords"].append([karg,kvalue,False])

                self.statements.append(expression)

        except Exception as error: pass


    ######################### Assert Here #########################

    def visit_Assert(self, node):
        try:
            assertStatement = {}
            assertStatement["type"] = "assert"
            assertStatement["line"] = node.lineno
            
            # for fieldname, value in ast.iter_fields(node):
            #     # print(fieldname)
            #     # print(ast.dump(value))

            #     if fieldname == 'test':
            #         if isinstance(value, ast.Compare):
            #             for test_fieldname, test_value in ast.iter_fields(value):
                            
            #                 if test_fieldname == 'left':
                        
            #                     left = self.separate_variables(test_value, [])
            #                     if len(left) > 0: assertStatement['left'] = left[0]
                    
            #                 elif test_fieldname == 'comparators':
            #                     comparators = []

            #                     for comparator in test_value:
            #                         name = self.separate_variables(comparator, [])
            #                         name = name[0] if len(name) > 0 else None
                                
            #                         if name is not None: comparators.append(name)
                            
            #                     if len(comparators) > 0: assertStatement['comparators'] = comparators

            #         elif isinstance(value, ast.Call):
            #             for test_fieldname, test_value in ast.iter_fields(value):
            #                 if test_fieldname == 'func':
            #                     func_name = self.separate_variables(test_value, [])
            #                     if len(func_name) > 0: assertStatement['func'] = func_name[0]

            #                 elif test_fieldname == 'args':
            #                     func_args = []
            #                     for arg in test_value:
            #                         func_args = self.separate_variables(arg, func_args)
                                
            #                     if len(func_args) > 0: assertStatement['args'] = func_args
                        
            #         else:
            #             left = self.separate_variables(node.test, [])
            #             if len(left) > 0: assertStatement['left'] = left[0]
                        
            #     elif fieldname == 'msg':
            #         msg = self.separate_variables(value, [])
            #         if len(msg) > 0:  assertStatement['msg'] = msg[0]
                    

            self.statements.append(assertStatement)

        except Exception as error: pass
        self.generic_visit(node)

            
    ######################### Utility Function Here #########################
    def separate_variables(self,node,itemList):
        try:
            if isinstance(node,ast.Name): itemList.append(node.id) 
            elif isinstance(node,ast.Constant): itemList.append(node.value)
            elif isinstance(node,ast.Attribute): itemList.append(self.get_name_from_attribute_node(node)+'.'+node.attr)
            elif isinstance(node,ast.FormattedValue): itemList = self.separate_variables(node.value, itemList)
            
            elif isinstance(node,ast.BinOp):    
                usedArgs = self.get_variables_used_in_declaration(node)
                for arg in usedArgs:
                    itemList.append(arg)
                # actualValue = self.build_value_from_used_variables(usedArgs)
            
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name): itemList.append(node.func.id)
                elif isinstance(node.func, ast.Attribute):
                    func = self.get_name_from_attribute_node(node.func)
                    if node.func.attr and func: func = func +'.'+ node.func.attr
                    itemList.append(func)

                    for arg in node.args:
                        itemList = self.separate_variables(arg, itemList)
            
            
            elif isinstance(node, ast.JoinedStr):
                for value in node.values:
                    itemList = self.separate_variables(value, itemList)

            elif isinstance(node, ast.Lambda): itemList = self.separate_variables(node.body, itemList)
            
            elif isinstance(node, ast.Subscript):

                varSlice = None
                itemList = self.separate_variables(node.value, itemList)

                if isinstance(node.slice, ast.Index): 
                    varSlice = self.separate_variables(node.slice.value, [])
                    # print(varSlice)
                    varSlice = varSlice[0] if len(varSlice) > 0 else None

                elif isinstance(node.slice, ast.ExtSlice):
                    varSlice = self.separate_variables(node.slice.dims, [])
                    varSlice = varSlice[0] if len(varSlice) > 0 else None

                if itemList == None: pass
                elif varSlice == None and len(itemList) > 0: pass 
                elif varSlice != None and len(itemList) > 0: itemList[0] = str(itemList[-1])+'['+str(varSlice)+']'

            elif isinstance(node, ast.Tuple):
                for elt in node.elts:
                    itemList = self.separate_variables(elt, itemList)

            elif isinstance(node, ast.List):
                variable = {}
                variable["type"] = "list"
                variable["line"] = node.lineno
                variable["name"] = None
                variable["values"] = []

                for element in node.elts:
                    if isinstance(element, ast.Constant):
                        variable["values"].append(element.value)
                
                itemList.append(variable['values'])
                self.statements.append(variable)

            elif isinstance(node, ast.Dict):
                
                variable = {}
                variable["type"] = "dict"
                variable["line"] = node.lineno
                variable["name"] = None
                variable["pairs"] = []
                
                for pair in zip(node.keys, node.values):
                    
                    if isinstance(pair[0], ast.Constant) and isinstance(pair[1], ast.Constant):
                        variable["pairs"].append([pair[0].value, pair[1].value])
                    
                    elif isinstance(pair[0], ast.Name) and isinstance(pair[1], ast.Constant):
                        variable["pairs"].append([pair[0].id, pair[1].value])

                itemList.append(variable['pairs'])
                self.statements.append(variable)
            
            elif isinstance(node, ast.Str):
                itemList.append(node.s)

            return itemList

        except Exception as error: pass


    def refine_tokens(self):
        for statement in self.statements:
            try:
                if statement["type"] == "variable" and statement.__contains__("names") and statement.__contains__("values"):
                    for name in statement["names"]:

                        variable = {}
                        variable["type"] = "variable"
                        variable["line"] = statement["line"]
                        variable["name"] = name
                        
                        index = statement["names"].index(name)

                        if len(statement['values']) != 0 and index < len(statement["values"]): variable["value"] = statement["values"][index] 
                        elif statement.__contains__("value") is True: variable["value"] = statement["value"]
                        else: variable["value"] = None

                        variable["valueSrc"] = statement["valueSrc"] if statement.__contains__("valueSrc") else "initialization"
                        variable["args"] = statement["args"] if statement.__contains__('args') else []
                        variable["isInput"] = statement["isInput"] if statement.__contains__("isInput") else False
                        
                        self.statements.append(variable)

                    self.statements.remove(statement)
                    print('statement not deleted yet!') if statement in self.statements else print('statement is deleted!')
                    # time.sleep(2)

                elif statement["type"] == "variable" and statement.__contains__("names") and statement.__contains__("valueSrc") and statement.__contains__('args'):
                    for name in statement["names"]:

                        variable = {}
                        variable["type"] = "variable"
                        variable["line"] = statement["line"]
                        variable["name"] = name
                        variable["value"] = None
                        variable["valueSrc"] = statement["valueSrc"] if statement.__contains__("valueSrc") else "initialization"
                        variable["args"] = statement["args"]
                        variable["isInput"] = statement["isInput"] if statement.__contains__("isInput") else False
                        
                        self.statements.append(variable)

                    self.statements.remove(statement)
                    print('statement not deleted yet!') if statement in self.statements else print('statement is deleted!')
                    # time.sleep(2)

                elif statement['type'] == 'tuple' and statement.__contains__("names") and statement.__contains__("values"):
                    for i in  range(0, len(statement['names'])):
                        variable = {}
                        variable["type"] = "variable"
                        variable["line"] = statement["line"]
                        variable["name"] = statement['names'][i]
                        variable["value"] = statement['values'][i] if i < len(statement['values']) else statement['values'][0]
                        variable["valueSrc"] = statement["valueSrc"] if statement.__contains__("valueSrc") else "initialization"
                        if statement.__contains__("args"): variable["args"] = statement["args"] 
                        variable["isInput"] = statement["isInput"] if statement.__contains__("isInput") else False
                        
                        self.statements.append(variable)
                    self.statements.remove(statement)

                elif statement["type"] == "function_def" and statement.__contains__("return") is False: 
                    self.statements.remove(statement)
                    print('statement not deleted yet!') if statement in self.statements else print('statement is deleted!')
                    # time.sleep(2)
                    
            except Exception as error: pass


    def make_tokens_byte_free(self):
        for statement in self.statements:
            for item in statement:
                if isinstance(item, list):
                    for sub_item in item:
                        if isinstance(sub_item, ast.Bytes): 
                            try: 
                                statement[sub_item] = statement[sub_item].decode('utf-8')
                            except: 
                                try:
                                    del item[sub_item]
                                except: 
                                    time.sleep(1)
                                    print('bytes can not be deleted!')

    def value_from_variable_name(self,name):
        for statement in reversed(self.statements):
            if statement["type"] == "variable" and statement["name"] == name:
                return [True, statement["value"]] if statement.__contains__("value") and statement['value'] is not None else [False, name]
            
            elif statement["type"] == "list" and statement["name"] == name: 
                return [True, statement["values"]] if statement.__contains__("values") else [False, name]
            
        return [False, name]


    def get_function_name_from_object(self,name):
        fName = None
        for part in name.split('.')[0:-1]:
            fName = fName +'.'+ part if fName is not None else part
            
        lName = name.split('.')[-1]

        for statement in self.statements:
            if statement["type"] == "function_obj" and fName == statement["objName"]: 
                if statement["function_name"] is not None: 
                    return statement["function_name"]+'.'+lName

            elif statement['type'] == 'variable' and fName == statement['name']:
                if statement['valueSrc'] is not None: 
                    return statement['valueSrc']+'.'+lName

            elif statement['type'] == 'import' and fName == statement['alias']:
                if statement['og'] is not None: 
                    return statement['og']+'.'+lName
        return name

    def get_actual_valueSrc_from_later_valueSrc(self, name):
        for statement in self.statements:
            if statement['name'] == name and statement['valueSrc'] is not None:
                return statement['valueSrc']
            else: return name

        return name


    def get_function_return_value(self,function_name):

        for statement in self.statements:
            if statement["type"] == "function_def" and statement["name"] == function_name:
                return statement["return"] if statement.__contains__("return") and statement["return"] is not None else None 
                
        return None


    def get_operands_from_bin_operation(self,node,usedVars):
        if isinstance(node, ast.Name) and node.id: usedVars.append(node.id)
        elif isinstance(node, ast.Constant) and node.value: usedVars.append(node.value)
        elif isinstance(node, ast.Call): 
            if isinstance(node.func, ast.Name): usedVars.append(node.func.id)
            elif isinstance(node.func, ast.Attribute): usedVars.append(self.get_function_name(node.func))
        
        elif isinstance(node, ast.Tuple):
            for item in node.elts:
                self.get_operands_from_bin_operation(item, usedVars)

        elif isinstance(node, ast.Attribute):
            usedVars.append(self.get_name_from_attribute_node(node))

        elif isinstance(node,ast.BinOp): 
            usedVars = self.get_operands_from_bin_operation(node.left,usedVars)  
            usedVars = self.get_operands_from_bin_operation(node.right,usedVars)

        return usedVars     
        

    def get_variables_used_in_declaration(self,node):
        usedVariables = []
        for field, value in ast.iter_fields(node):
            self.get_operands_from_bin_operation(value,usedVariables)
                
        return usedVariables



    def get_function_keywords(self, node, keywords):

        # print(ast.dump(node))
        # print()
        
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Call):
                # print('recursion')
                self.get_function_keywords(node.func.value, keywords)
            
            elif isinstance(node.func, ast.Attribute):
                # print('recursion')
                self.get_function_keywords(node.func.value, keywords)
            
            
            for keyword in node.keywords:
                karg = keyword.arg
                kvalue = None
                should_take = True
                
                if isinstance(keyword.value, ast.Constant): kvalue = keyword.value.value
                elif isinstance(keyword.value, ast.Name): 
                    kvalue = keyword.value.id
                    returns = self.value_from_variable_name(kvalue) 
                    
                    if returns[0] is True: kvalue = returns[1]
                    else: should_take = False

                if karg is not None and should_take:
                    keywords.append([karg, kvalue])

        return keywords


       
    def all_has_value(self, usedVariables, line_number):
        no_of_founds = 0

        for variable in usedVariables:
            for statement in reversed(self.statements):
                
                if statement['type'] == 'variable' and statement['name'] == variable:
                    if int(line_number) < int(statement['line']):
                        if statement.__contains__('value') and statement['value'] is not None:
                            no_of_founds += 1
                            break

                elif statement["type"] == "function_def" and statement["name"] == variable:
                    if int(line_number) < int(statement['line']):
                        if statement.__contains__("return") and statement['return'] is not None:
                            no_of_founds += 1
                            break

        if len(usedVariables) == no_of_founds: return True
        else: return False


    def build_value_from_used_variables(self,usedVariables, line_number):
        if self.all_has_value(usedVariables, line_number) is False:
            return [False, usedVariables]
        
        try:
            value = None
            for variable in usedVariables:    
                
                matched = False
                for statement in self.statements:
                    
                    if statement["type"] == "variable" and statement["name"] == variable and statement.__contains__("isInput"):
                        
                        if statement["isInput"] is False and value is not None:
                            if value is None: value = statement['value']
                            elif statement['value'] is None: pass

                            elif isinstance(value, str) or isinstance(statement["value"], str): value = str(value) + str(statement["value"])
                            else: value = value + statement["value"]

                        elif statement["isInput"] is not True: value = statement["value"]
                        elif statement["isInput"] is True: value = str(value) + "input"

                        matched = True
                        break
                    
                    elif statement["type"] == "function_def" and statement["name"] == variable:
                        if statement.__contains__("return"): 
                            
                            if type(value) == str or type(statement["return"]) == str: value = str(value) + str(statement["return"])
                            elif value == None: value = statement["return"]
                            else : 
                                if type(value) == str or type(statement['return']) == str: value = str(value) + str(statement["return"])
                                elif type(value) == type(statement['return']): value = value + statement['return']

                            matched = True
                            break

                if isinstance(value, ast.Bytes):
                    # value = '' 
                    value = value.decode('utf-8')

                elif isinstance(variable, ast.Bytes):
                    # value = ''
                    variable = variable.decode('utf-8')
                
                if matched == False and value and variable and (type(value) != str and type(variable) != str): value = value + variable
                elif matched == False and value and variable and (type(value) == str or type(variable) == str): value = str(value) + str(variable)
                elif matched == False and variable: value = variable

            return [True, value]

        except Exception as error: pass


    def get_function_name(self, node):
        for fieldname, value in ast.iter_fields(node):
            
            if(fieldname == "func" and isinstance(value, ast.Name)): 
                return value.id
            
            elif(fieldname == "func" and isinstance(value, ast.Attribute)):    
                function_name = self.get_name_from_attribute_node(value)

                for statement in self.statements:
                    if statement['type'] == 'function_obj' and statement['objName'] == function_name:
                        function_name = statement['function_name']
                        break

                if function_name != None and value.attr != None : return str(function_name) +'.'+ str(value.attr) 
                elif function_name != None and value.attr == None : return str(function_name)
                elif function_name == None and value.attr == None : return None

        return None
        

    def get_name_from_attribute_node(self, node):
        name = None
        attr = None
        for field, value in ast.iter_fields(node):
            
            if isinstance(value, ast.Attribute):
                name = self.get_name_from_attribute_node(value)
                attr = value.attr

            elif isinstance(value, ast.Constant): name = value.value
            elif isinstance(value, ast.Name): name = value.id #self.get_actual_valueSrc_from_later_valueSrc(value.id)
            elif isinstance(value, ast.Subscript): name = self.get_name_from_attribute_node(value)
            elif isinstance(value, ast.Call): name = self.get_name_from_attribute_node(value)

        return str(name)+'.'+str(attr) if attr != None else str(name)


    def search_input_in_function_call_and_returned_function_args(self):
        for statement in self.statements:
            if statement['type'] == 'variable' and statement.__contains__('valueSrc') and statement.__contains__('args'):
                if self.search_input_in_declaration(statement['args'], statement['line']):
                    statement['isInput'] = True
                    break
            
            elif statement['type'] == 'function_call' and statement.__contains__('args'):
                if self.search_input_in_declaration(statement['args'], statement['line']):
                    statement['hasInputs'] = True
                    break
            
            elif statement['type'] == 'function_def' and statement.__contains__('returnArgs'):
                if self.search_input_in_declaration(statement['returnArgs'], statement['line']):
                    statement['returnHasInputs'] = True
                    break
                            


    def search_input_in_declaration(self,usedVariables, line_number):
        for variable in usedVariables:
            for statement in reversed(self.statements):
                if statement["type"] == "variable" and variable == statement["name"]:
                    if int(line_number) < int(statement['line']):
                        return True if statement["isInput"] is True else False   
        return False


    def get_value_src_from_variable_name(self, name):
        
        for statement in reversed(self.statements):
            if statement['type'] == 'variable' and statement['name'] == name:
        
                if statement.__contains__('valueSrc'): return [True, statement['valueSrc']]
                else: [False, name] 

        return [False, name]


    def print_statements(self, *types):
        for statement in self.statements:
            if len(types) == 0: print(json.dumps(statement))
            elif statement["type"] in types: print(json.dumps(statement))

    def return_statements(self):
        json_converted_statements = []
        for statement in self.statements:
            json_converted_statements.append(json.dumps(statement))
        
        return json_converted_statements