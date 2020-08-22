import ast
import json

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
        
        except Exception as error:
            pass

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
        
        except Exception as error:
            pass

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
                self.addVariablesToList(default,func_def["defaults"])

            for item in node.body:
                
                if isinstance(item,ast.Return):
                    func_def["return"] = self.addVariablesToList(item.value,[])
                    func_def["return"] = func_def["return"][0] if len(func_def["return"]) > 0 else None

                    if isinstance(item.value,ast.Call):
                        func_def["returnArgs"] = []
                        for arg in item.value.args:
                            func_def["returnArgs"] = self.addVariablesToList(arg, func_def["returnArgs"])
                            
                            for i in range(len(func_def["returnArgs"])):  
                                if self.valueFromName(func_def["returnArgs"][i]): func_def["returnArgs"][i] = self.valueFromName(func_def["returnArgs"][i])
                            
            self.statements.append(func_def)
     
        except Exception as error:
            pass

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
                variable['isInput'] = False 
            
                if isinstance(target,ast.Name): variable["name"] = target.id

                elif isinstance(target, ast.Subscript):
                    var = self.addVariablesToList(target.value, [])
                    variable["name"] = var[0] if len(var) > 0 else None
                    
                    varSlice = None
                    if isinstance(target.slice, ast.Index): 
                        varSlice = self.addVariablesToList(target.slice.value, [])
                        varSlice = varSlice[0] if len(varSlice) > 0 else None

                    elif isinstance(target.slice, ast.ExtSlice):
                        varSlice = self.addVariablesToList(target.slice.dims, [])
                        varSlice = varSlice[0] if len(varSlice) > 0 else None

                        
                    elif isinstance(target.slice, ast.Slice):
                        lowerSlice = self.addVariablesToList(target.slice.lower, []) if target.slice.lower!= None else 'min'
                        upperSlice = self.addVariablesToList(target.slice.upper, []) if target.slice.upper!= None else 'max'
                        
                        if lowerSlice != 'min' and len(lowerSlice)>0: lowerSlice = lowerSlice[0]
                        if upperSlice != 'max' and len(upperSlice)>0: upperSlice = upperSlice[0]

                        varSlice = str(lowerSlice)+':'+str(upperSlice)
                        
                    if varSlice != None and variable["name"]!= None: variable["name"] = variable["name"]+'['+str(varSlice)+']'
                    elif varSlice == None and variable["name"] != None: pass 
                    else: variable["name"] = '['+str(varSlice)+']'
                
                elif isinstance(target,ast.Tuple):
                    variable["type"] = "tuple"
                    variable["names"] = []

                    for element in target.elts:
                        names = self.addVariablesToList(element, [])
                        if len(names) > 0: variable["names"].append(names[0])
                
                elif isinstance(target, ast.Attribute):
                        # funcName = self.getFunctionAttribute(value)
                        # if value.attr and funcName: funcName = funcName +'.'+ value.attr
                        
                    name = self.getFunctionAttribute(target)
                    if target.attr: name = name +'.'+ target.attr
                    variable["name"] = name
                    
                if isinstance(node.value, ast.Constant):
                    variable["value"] = node.value.value
                    variable["valueSrc"] = "initialization"
                    variable["isInput"] = False

                if isinstance(node.value, ast.Name):
                    valueFromName = self.valueFromName(node.value.id)
                    if type(valueFromName) == list: variable["type"] = "list"
                    
                    variable["value"] = valueFromName
                    variable["valueSrc"] = "initialization"
                    variable["isInput"] = False

                
                elif isinstance(node.value, ast.BinOp):
                    usedVars = self.getUsedVariablesInVariableDeclaration(node.value)
                    hasInputs = self.checkUserInputsInVariableDeclaration(usedVars)

                    if hasInputs:
                        self.inputs.append(variable["name"])
                        variable["value"] = None
                        variable["valueSrc"] = "input"
                        variable["isInput"] = True
                    
                    else:
                        variable["value"] = self.buildNewVariableValueFromUsedOnes(usedVars)
                        variable["valueSrc"] = "initialization"
                        variable["isInput"] = False

                elif isinstance(node.value, ast.Call):
                    
                    funcName = self.getFunctionName(node)
                    returnFromFunction = self.functionReturnValue(funcName) 
                    variable["value"] =  returnFromFunction if returnFromFunction != funcName else None 
                    variable["valueSrc"] = funcName
                    variable["args"] = []

                    if(funcName == "input"):
                        variable["isInput"] = True
                        self.inputs.append(variable["name"])
                    
                    else: variable["isInput"] = False

                    for arg in node.value.args:
                        if isinstance(arg, ast.Attribute): 
                            
                            variable["args"].append(self.getFunctionAttribute(arg)+'.'+arg.attr)

                            funcObj = {}
                            funcObj["type"] = "function_obj"
                            funcObj["line"] = node.lineno
                            funcObj["objName"] = variable["name"]
                            funcObj["funcName"] = variable["valueSrc"]
                            funcObj["args"] = variable["args"]

                            if(funcObj not in self.statements):self.statements.append(funcObj)
                        else: variable["args"] = (self.addVariablesToList(arg,variable["args"]))

                elif isinstance(node.value, ast.List):
                    variable["type"] = "list"
                    variable["values"] = []
                    
                    variable["valueSrc"] = 'initialization'
                    variable["isInput"] = False
                    
                    for value in node.value.elts:
                        variable["values"] = self.addVariablesToList(value,variable["values"])

                elif isinstance(node.value, ast.Dict):
                    variable["type"] = "dict"
                    variable["keys"] = []
                    variable["values"] = []

                    for key in node.value.keys:
                        keyList = self.addVariablesToList(key,[])
                        if len(keyList) > 0: variable["keys"].append(keyList[0]) 
                    
                    for value in node.value.values:
                        valueList = self.addVariablesToList(value, [])
                        if len(valueList) > 0: variable["values"].append(valueList[0])
                
                elif isinstance(node.value,ast.Tuple):
                    variable["type"] = "tuple"
                    variable["values"] = []

                    for element in node.value.elts:
                        values = self.addVariablesToList(element, [])
                        if len(values)>0: variable["values"].append(values[0])
                    

                elif isinstance(node.value,ast.Set):
                    variable["type"] = "set"
                    variable["values"] = []
                    
                    for element in node.value.elts:    
                        values = self.addVariablesToList(element, [])
                        if len(values)>0: variable["values"].append(values[0])
                    
                elif isinstance(node.value, ast.IfExp):
                    variable["type"] = "variable"
                    variable["values"] = []

                    bodyList = self.addVariablesToList(node.value.body,[])
                    if len(bodyList) > 0: variable["values"].append(bodyList[0])

                    comparatorList = self.addVariablesToList(node.value.orelse, [])
                    if len(comparatorList) > 0: variable["values"].append(comparatorList[0])

                elif isinstance(node.value, ast.BoolOp):
                    variable["values"] = []
                    for value in node.value.values:
                        valueList = self.addVariablesToList(value,[])
                        if len(valueList) > 0: variable["values"].append(valueList[0])
                
                elif isinstance(node.value, ast.Subscript):
                    value = self.addVariablesToList(node.value.value, [])
                    variable["value"] = value[0] if len(value) > 0 else None

                    if isinstance(node.value.slice, ast.Slice):
                        lowerSlice = self.addVariablesToList(node.value.slice.lower, []) if node.value.slice.lower!= None else 'min'
                        upperSlice = self.addVariablesToList(node.value.slice.upper, []) if node.value.slice.upper!= None else 'max'
                        
                        if lowerSlice != 'min' and len(lowerSlice)>0: lowerSlice = lowerSlice[0]
                        if upperSlice != 'max' and len(upperSlice)>0: upperSlice = upperSlice[0]

                        varSlice = str(lowerSlice)+':'+str(upperSlice)
                    
                        if type(value) == list and type(lowerSlice) == int and type(upperSlice) == int:variable["value"] = variable["value"][lowerSlice:upperSlice]
                        elif type(value) == list and type(lowerSlice) == int and type(upperSlice) == str:variable["value"] = variable["value"][lowerSlice:]
                        elif variable['value'] != None and type(value) == list and type(lowerSlice) == str and type(upperSlice) == int:variable["value"] = variable["value"][:upperSlice]
                        elif type(value) == list and type(lowerSlice) == str and type(upperSlice) == str:variable["value"] = variable["value"]
                        elif varSlice != None and variable["value"]!= None: variable["value"] = variable["value"]+'['+str(varSlice)+']'
                        else: variable["value"] = '['+str(varSlice)+']'

                elif isinstance(node.value, ast.Attribute):
                    variable["valueSrc"] = self.getFunctionAttribute(node.value)+'.'+node.value.attr if node.value.attr else self.getFunctionAttribute(node.value) 
                    
                self.statements.append(variable)
 
        except Exception as error:
            pass

        self.generic_visit(node)


    ######################### If Comparasion Block Here #########################
    def visit_If(self,node):
        try:
            statement = {}
            statement["type"] = "comparison"
            statement["line"] = node.lineno
            statement["pairs"] = []
            statement["test"] = []

            if isinstance(node.test,ast.BoolOp):
                for value in node.test.values:
                    
                    if isinstance(value,ast.Compare):
                        if isinstance(value.left,ast.Name) and isinstance(value.ops[0],ast.Eq) and isinstance(value.comparators[0],ast.Constant):
                            pair = []
                            pair.append(value.left.id)
                            pair.append(value.comparators[0].value)

                            statement["pairs"].append(pair)
                        
                        elif isinstance(value.left,ast.Name) and isinstance(value.ops[0],ast.Eq) and isinstance(value.comparators[0],ast.BinOp):
                            pair = []
                            pair.append(value.left.id)
                            
                            usedVars = self.getUsedVariablesInVariableDeclaration(value.comparators[0])
                            value = self.buildNewVariableValueFromUsedOnes(usedVars)
                            
                            if type(value) == str: pair.append(value.lstrip())
                            else: pair.append(value)

                            statement["pairs"].append(pair)
                
                    elif isinstance(value, ast.Name):
                        statement["test"].append(value.id)
                    
                    elif isinstance(value, ast.Constant):
                        statement["test"].append(value.value)

            elif isinstance(node.test, ast.Compare):
                pair = []
                
                leftComparatorList = self.addVariablesToList(node.test.left, [])
                if len(leftComparatorList)>0: pair.append(leftComparatorList[0])

                comparatorList = []
                if isinstance(node.test.comparators[0], ast.UnaryOp):
                    comparatorList = self.addVariablesToList(node.test.comparators[0].operand,[])

                else: comparatorList = self.addVariablesToList(node.test.comparators[0],[])
                
                if len(comparatorList) > 0: pair.append(comparatorList[0])
                statement["pairs"].append(pair)

                
            elif isinstance(node.test,ast.Name):
                statement["test"].append(node.test.id)

            elif isinstance(node.test, ast.Constant):
                statement["test"].append(node.test.value)

            elif isinstance(node.test, ast.Call):
                if isinstance(node.test.func, ast.Name): statement["test"].append(node.test.func.id)
                elif isinstance(node.test.func, ast.Attribute): statement["test"].append(self.getFunctionName(node.test.func))

            
            self.statements.append(statement)
        
        except Exception as error:
            pass

        self.generic_visit(node)


    ######################### Try Block Here #########################

    def visit_Try(self, node):
        try:
            statement = {}
            statement["type"] = "exception_handle"
            
            if isinstance(node, ast.Try):
                
                if len(node.handlers) == 0:
                    statement["line"] = node.lineno
                    statement["exceptionHandler"] = "continue"

                elif isinstance(node.handlers[0].body[0],ast.Continue):
                    statement["line"] = node.handlers[0].body[0].lineno
                    statement["exceptionHandler"] = "continue"

                elif isinstance(node.handlers[0].body[0],ast.Pass): 
                    statement["line"] = node.handlers[0].body[0].lineno
                    statement["exceptionHandler"] = "pass"

                else:
                    statement["line"] = node.handlers[0].body[0].lineno
                    statement["exceptionHandler"] = "expression"

            self.statements.append(statement)

        except Exception as error:
            pass

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
                elif isinstance(node.value.func,ast.Call): expression["name"] = self.getFunctionName(node)
                elif isinstance(node.value.func,ast.Attribute): expression["name"] = self.getFunctionNameFromObject(self.getFunctionName(node))
                
                # separating args in function call
                for arg in node.value.args: expression['args'] = self.addVariablesToList(arg,expression["args"])
                
                # getting args value from name in function call 
                for i in range(len(expression['args'])): expression['args'][i] = self.valueFromName(expression['args'][i])
                
                for keyword in node.value.keywords:
                    karg = keyword.arg
                    kvalue = None

                    if isinstance(keyword.value,ast.Constant): kvalue = keyword.value.value
                    if karg and kvalue: expression["keywords"].append([karg,kvalue])

                self.statements.append(expression)

        except Exception as error:
            pass

        self.generic_visit(node)
    

    ######################### Assert Here #########################

    def visit_Assert(self, node):
        try:
            assertStatement = {}
            assertStatement["type"] = "assert"
            assertStatement["line"] = node.lineno
                
            if isinstance(node.test, ast.Compare):
                left = self.addVariablesToList(node.test.left, [])
                left = left[0] if len(left) > 0 else None

                comparators = []
                for comparator in node.test.comparators:
                    name = self.addVariablesToList(comparator, [])
                    name = name[0] if len(name)>0 else None
                    
                    if name is not None: comparators.append(name)
                
                assertStatement["left"] = left
                assertStatement["comparators"] = comparators

            elif isinstance(node.test, ast.Call):
                funcName = self.addVariablesToList(node.test, [])
                funcName = funcName[0] if len(funcName) > 0 else None
                funcArgs = []
                
                for arg in node.test.args:
                    funcArgs = self.addVariablesToList(arg, funcArgs)

                assertStatement['func'] = funcName
                assertStatement['args'] = funcArgs

            self.statements.append(assertStatement)

        except Exception as error:
            pass

        self.generic_visit(node) 

            
    ######################### Utility Function Here #########################


    def addVariablesToList(self,node,itemList):
        try:
            if isinstance(node,ast.Name): itemList.append(node.id)    
            elif isinstance(node,ast.Constant): itemList.append(node.value)
            elif isinstance(node,ast.Attribute): itemList.append(self.getFunctionAttribute(node)+'.'+node.attr)
            elif isinstance(node,ast.FormattedValue): itemList = self.addVariablesToList(node.value, itemList)
            
            elif isinstance(node,ast.BinOp):    
                usedArgs = self.getUsedVariablesInVariableDeclaration(node)
                actualValue = self.buildNewVariableValueFromUsedOnes(usedArgs)
                itemList.append(actualValue)
            
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name): itemList.append(node.func.id)
                elif isinstance(node.func, ast.Attribute):
                    func = self.getFunctionAttribute(node.func)
                    if node.func.attr and func: func = func +'.'+ node.func.attr
                    itemList.append(func)
            
            elif isinstance(node, ast.List):
                if len(node.elts) == 0: itemList.append(None)
                for element in node.elts:
                    itemList = self.addVariablesToList(element,itemList)

            
            elif isinstance(node, ast.JoinedStr):
                for value in node.values:
                    itemList = self.addVariablesToList(value, itemList)

            elif isinstance(node, ast.Lambda): itemList = self.addVariablesToList(node.body, itemList)
            
            elif isinstance(node, ast.Subscript):

                    varSlice = None
                    itemList = self.addVariablesToList(node.value, itemList)
                    
                    if isinstance(node.slice, ast.Index): 
                        varSlice = self.addVariablesToList(node.slice.value, [])
                        varSlice = varSlice[0] if len(varSlice) > 0 else None

                    elif isinstance(node.slice, ast.ExtSlice):
                        varSlice = self.addVariablesToList(node.slice.dims, [])
                        varSlice = varSlice[0] if len(varSlice) > 0 else None

                    if itemList == None: pass
                    elif varSlice == None and len(itemList) > 0: pass 
                    elif varSlice != None and len(itemList) > 0: itemList[0] = str(itemList[-1])+'['+str(varSlice)+']'
                                            
            return itemList

        except Exception as error:
            pass


    def delete_incomplete_tokens(self):
        for statement in self.statements:
            
            if statement['type'] == 'variable':
                keys = ['line', 'name', 'value', 'valueSrc', 'isInput']
                for key in keys:
                    if key not in statement: self.statements.remove(statement)

            if statement['type'] == 'list' or statement['type'] == 'set':
                keys = ['line', 'name', 'value', 'valueSrc', 'isInput', 'values']
                for key in keys:
                    if key not in statement: self.statements.remove(statement)

            
            elif statement['type'] == 'import':
                keys = ['line', 'og', 'alias']
                for key in keys:
                    if key not in statement: self.statements.remove(statement)

            elif statement['type'] == 'function_def':
                keys = ['line', 'name', 'args', 'defaults', 'return']
                for key in keys:
                    if key not in statement: self.statements.remove(statement)

            elif statement['type'] == 'function_call':
                keys = ['line', 'name', 'args', 'keywords', 'hasInputs']
                for key in keys:
                    if key not in statement: self.statements.remove(statement)

            elif statement['type'] == 'comparison':
                keys = ['line', 'pairs', 'test']
                for key in keys:
                    if key not in statement: self.statements.remove(statement)

            elif statement['type'] == 'exception_handle':
                keys = ['line', 'exceptionHandler']
                for key in keys:
                    if key not in statement: self.statements.remove(statement)

            elif statement['type'] == 'assert':
                keys = ['line', 'left', 'comparators']
                for key in keys:
                    if key not in statement: self.statements.remove(statement)




    def refineTokens(self):
        try:
            for statement in self.statements:
                
                if statement["type"] == "tuple" and statement.__contains__("names") and statement.__contains__("values"):
                    for name in statement["names"]:

                        variable = {}
                        variable["type"] = "variable"
                        variable["line"] = statement["line"]
                        variable["name"] = name
                        
                        index = statement["names"].index(name)

                        if len(statement['values']) != 0 and index < len(statement["values"]): variable["value"] = statement["values"][index] 
                        elif statement.__contains__("value") == True: variable["value"] = statement["value"]
                        else: variable["value"] = None

                        variable["valueSrc"] = statement["valueSrc"] if statement.__contains__("valueSrc") else "initialization"
                        variable["args"] = statement["args"] if statement.__contains__('args') else []
                        variable["isInput"] = statement["isInput"] if statement.__contains__("isInput") else False
                        
                        self.statements.append(variable)

                    self.statements.remove(statement)
                
                elif statement["type"] == "tuple" and statement.__contains__("names") and statement.__contains__("valueSrc") and statement.__contains__('args'):
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
                
                elif statement["type"] == "function_def" and statement.__contains__("return") == False: self.statements.remove(statement)

        except Exception as error:
            pass


    def makeTokensByteFree(self):
        for statement in self.statements:
            for item in statement:
                if isinstance(item, bytes): 
                    try: statement[item] = statement[item].decode('utf-8')
                    except: pass

    def valueFromName(self,name):
        for statement in reversed(self.statements):
            if statement["type"] == "variable" and statement["name"] == name : return statement["value"] if statement.__contains__("value") else None
            elif statement["type"] == "list" and statement["name"] == name: return statement["values"] if statement.__contains__("values") else None
            
        return name


    def getFunctionNameFromObject(self,name):
        
        fName = name.split('.')[0]
        lName = name.split('.')[1]

        for statement in self.statements:
            if statement["type"] == "function_obj" and fName == statement["objName"]: return statement["funcName"]+'.'+lName
        return name


    def functionReturnValue(self,funcName):

        for statement in self.statements:
            if statement["type"] == "function_def" and statement["name"] == funcName:
                if statement.__contains__("return"): return statement["return"]
                else: return None

        return funcName


    def getOperandsFromBinOperation(self,node,usedVars):
        if isinstance(node, ast.Name) and node.id: usedVars.append(node.id)
        elif isinstance(node, ast.Constant) and node.value: usedVars.append(node.value)
        elif isinstance(node, ast.Call): 
            if isinstance(node.func, ast.Name): usedVars.append(node.func.id)
            elif isinstance(node.func, ast.Attribute): usedVars.append(self.getFunctionName(node.func))
        
        elif isinstance(node,ast.BinOp):  
            usedVars = self.getOperandsFromBinOperation(node.left,usedVars)  
            usedVars = self.getOperandsFromBinOperation(node.right,usedVars)

        return usedVars     
        

    def getUsedVariablesInVariableDeclaration(self,node):
        usedVariables = []
        for field, value in ast.iter_fields(node):
            self.getOperandsFromBinOperation(value,usedVariables)
                
        return usedVariables


    def buildNewVariableValueFromUsedOnes(self,usedVariables):
        try:
            value = None
            for variable in usedVariables:    
                
                matched = False
                for statement in self.statements:
                    
                    if statement["type"] == "variable" and statement["name"] == variable and statement.__contains__("isInput"):
                        
                        if statement["isInput"] == False and value != None:
                            if value == None: value = statement['value']
                            elif statement['value'] == None: pass

                            elif type(value) == str or type(statement["value"]) == str: value = str(value) + str(statement["value"])
                            else: value = value + statement["value"]

                        elif statement["isInput"] != True: value = statement["value"]
                        elif statement["isInput"] == True: value = str(value) + "input"

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

                if isinstance(value, bytes) : 
                    saveBugFix('bytes', value)
                    value = value.decode('utf-8')
                elif isinstance(variable, bytes) : 
                    saveBugFix('bytes', variable)
                    variable = variable.decode('utf-8')
                
                if matched == False and value and variable and (type(value) != str and type(variable) != str): value = value + variable
                elif matched == False and value and variable and (type(value) == str or type(variable) == str): value = str(value) + str(variable)
                elif matched == False and variable: value = variable

            return value

        except Exception as error:
            pass



    def getFunctionName(self, node):
        for fieldname, value in ast.iter_fields(node.value):
            
            if(fieldname == "func" and isinstance(value, ast.Name)): return value.id
            
            elif(fieldname == "func" and isinstance(value, ast.Attribute)):    
                functionName = self.getFunctionAttribute(value)

                if functionName != None and value.attr != None : return str(functionName) +'.'+ str(value.attr) 
                elif functionName != None and value.attr == None : return str(functionName)
                elif functionName == None and value.attr == None : return None

        return None
        

    def getFunctionAttribute(self, node):
        name = None
        attr = None
        
        for field, value in ast.iter_fields(node):
            if isinstance(value, ast.Attribute):
                attr = value.attr
                name = self.getFunctionAttribute(value)
            
            elif isinstance(value,ast.Name): name = value.id
            elif isinstance(value, ast.Subscript): name = self.getFunctionAttribute(value)
            elif isinstance(value,ast.Call): name = self.getFunctionAttribute(value)

        return str(name)+'.'+str(attr) if attr else str(name)


    def checkUserInputsInVariableDeclaration(self,usedVariables):
        for variable in usedVariables:
            for statement in reversed(self.statements):

                if statement["type"] == "variable" and variable == statement["name"]:
                    return True if statement["isInput"] else False
                    
        return False


    def checkUserInputsInFunctionArguments(self):
        for statement in self.statements:
            if statement["type"] == "function_call":
                
                index = self.statements.index(statement)
                statement["hasInputs"] = False
                foundInputs = False                
                
                for arg in statement["args"]:
                    for idx in range(index-1,-1, -1):

                        if self.statements[idx].__contains__("isInput"): 
                            if self.statements[idx]["type"] == "variable" and self.statements[idx]["name"] == arg and self.statements[idx]["isInput"]:
                                statement["hasInputs"] = True
                                foundInputs = True
                                break

                    if foundInputs: break
                    
    
    def printStatements(self, *types):
        for statement in self.statements:
            if len(types) == 0: print(json.dumps(statement))
            elif statement["type"] in types: print(json.dumps(statement))