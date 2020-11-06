const vscode = require('vscode');

var smell = {

    detect : (token) => {
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("exceptionHandler")) var handler = token.exceptionHandler;
        
        const unwantedHandlers = ['continue','pass'];
        const WARNING_MSG = 'possible presence of ignored except block at line '+ lineno;
        
        if(tokenType == "exception_handle" &&  unwantedHandlers.includes(handler)) vscode.window.showWarningMessage(WARNING_MSG);
    }
}

module.exports = smell;