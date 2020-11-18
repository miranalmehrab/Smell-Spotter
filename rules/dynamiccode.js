const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const WARNING_MSG = 'possible presence of dynamic code execution at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? 'possible presence of dynamic code execution at line '+ token.returnLine : null
        
        const insecureMethods = ['exec', 'eval', 'compile'];

        if(tokenType == "variable" && token.hasOwnProperty("valueSrc")){
            if(insecureMethods.includes(token.valueSrc)) 
                vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == "function_call" && token.hasOwnProperty("name")) {
            if(insecureMethods.includes(token.name)) 
                vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == "function_def" && token.hasOwnProperty("return")) {
            for(const funcReturn of token.return){
                if(insecureMethods.includes(funcReturn)) 
                    vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
            }
        }
    }
}

module.exports = smell;