const vscode = require('vscode');

var smell = {
    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;

        const WARNING_MSG = 'possible presence of cross-site scripting at line '+ lineno;
        const insecureMethods = ['django.utils.safestring.mark_safe', 'mark_safe'];

        if(tokenType == "variable") {
            if(token.hasOwnProperty("args")) var args = token.args;
            if(token.hasOwnProperty("valueSrc")) var valueSrc = token.valueSrc;

            if(insecureMethods.includes(valueSrc) && args.length > 0) vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == "function_call") {
            if(token.hasOwnProperty("name")) var name = token.name;
            if(token.hasOwnProperty("args")) var args = token.args;
            
            if(insecureMethods.includes(name) && args.length > 0) vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == "function_def") {
            if(token.hasOwnProperty("return")) var funcReturn = token.return;
            if(token.hasOwnProperty("returnArgs")) var returnArgs = token.returnArgs;
            
            if(insecureMethods.includes(funcReturn) && returnArgs.length > 0) vscode.window.showWarningMessage(WARNING_MSG);
        }
    },
    isInsecureMethod: (methodName) => {
        const insecureMethods = ['django.utils.safestring.mark_safe', 'mark_safe']
    
        if(methodName.length == 0) return false
        else if(typeof(methodName) != 'string') return false
        for (const name of insecureMethods) {
            if (insecureMethods.includes(name)) return true
        }

        return false
    }
}

module.exports = smell;