const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const WARNING_MSG = 'possible presence of dynamic code execution at line '+ lineno;
        const insecureMethods = ['exec', 'eval', 'compile'];

        if(tokenType == "variable" && token.hasOwnProperty("valueSrc")){
            if(insecureMethods.includes(token.valueSrc)) 
                vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == "function_call" && token.hasOwnProperty("name") && token.hasOwnProperty("args")) {
            if(insecureMethods.includes(token.name) && token.args.length > 0) 
                vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == "function_def" && token.hasOwnProperty("return") && token.hasOwnProperty("returnArgs")) {
            if(insecureMethods.includes(token.return) && token.returnArgs.length > 0) 
                vscode.window.showWarningMessage(WARNING_MSG);
        }
    }
}

module.exports = smell;