const vscode = require('vscode');

var smell = {
    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const WARNING_MSG = 'possible use of insecure yaml operations at line '+ lineno
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? 'possible presence of cross-site scripting at line '+ token.returnLine : null
        
        const insecureMethods = ['yaml.load', 'yaml.load_all', 'yaml.full_load', 'yaml.dump', 'yaml.dump_all', 'yaml.full_load_all']

        if(tokenType == "variable") {
            if(insecureMethods.includes(token.valueSrc)) vscode.window.showWarningMessage(WARNING_MSG);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        
        else if(tokenType == "function_call") {    
            if(insecureMethods.includes(token.name)) vscode.window.showWarningMessage(WARNING_MSG);
            
            if(token.hasOwnProperty('args')){
                for(const arg of token.args){
                    if(insecureMethods.includes(arg)) vscode.window.showWarningMessage(WARNING_MSG);
                }
            }
        }

        else if(tokenType == "function_def") {
            if(token.hasOwnProperty("return"))
                for(const funcReturn of token.return){
                    if(insecureMethods.includes(funcReturn)) vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
                }
            
        }
    }
}

module.exports = smell;