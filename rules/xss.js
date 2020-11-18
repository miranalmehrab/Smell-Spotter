const vscode = require('vscode');

var smell = {
    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;

        const WARNING_MSG = 'possible presence of cross-site scripting at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? 'possible presence of cross-site scripting at line '+ token.returnLine : null
        
        const insecureMethods = ['django.utils.safestring.mark_safe', 'mark_safe'];

        if(tokenType == "variable") {
            if(insecureMethods.includes(token.valueSrc)) vscode.window.showWarningMessage(WARNING_MSG);
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
                    if(insecureMethods.includes(funcReturn)) 
                        vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
                }
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