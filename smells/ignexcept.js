const vscode = require('vscode');

var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("exceptionHandler")) var handler = token.arg;

        const unwantedHandlers = ['continue','pass'];
        
        if(tokenType == "except_statement" &&  unwantedHandlers.includes(handler)) 
        {
            const warning = 'possible ignore except block at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;