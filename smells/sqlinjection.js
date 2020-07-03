const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;
        if(token.hasOwnProperty("hasInputs")) var hasInputs= token.hasInputs;
        
        const unwantedMethods = ['execution.query'];
        
        if(tokenType == "function_call" && unwantedMethods.includes(name) && args && hasInputs == "True" ) {

            const warning = 'possible SQL injection at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;