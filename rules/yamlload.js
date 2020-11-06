const vscode = require('vscode');

var smell = {
    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const WARNING_MSG = 'possible use of insecure yaml operations at line '+ lineno;
        const insecureMethods = ['yaml.load', 'yaml.load_all', 'yaml.full_load', 'yaml.dump', 'yaml.dump_all', 'full_load_all']

        if(tokenType == "variable") {
            if(token.hasOwnProperty("args")) var args = token.args;
            if(token.hasOwnProperty("valueSrc")) var valueSrc = token.valueSrc;
            
            if(insecureMethods.includes(valueSrc)) vscode.window.showWarningMessage(WARNING_MSG);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        else if(tokenType == "function_call") {
            if(token.hasOwnProperty("name")) var name = token.name;
            if(token.hasOwnProperty("args")) var args = token.args;
            
            if(insecureMethods.includes(name)) vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == "function_def") {
            if(token.hasOwnProperty("return")) var funcReturn = token.return;
            if(token.hasOwnProperty("returnArgs")) var returnArgs = token.returnArgs;
            
            if(insecureMethods.includes(funcReturn)) vscode.window.showWarningMessage(WARNING_MSG);
        }
    }
}

module.exports = smell;