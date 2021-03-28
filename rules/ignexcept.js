const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (token) => {
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("exceptionHandler")) var handler = token.exceptionHandler;
        
        const unwantedHandlers = ['continue','pass'];
        const WARNING_MSG = 'possible presence of ignored except block at line '+ lineno;
        
        if(tokenType == "exception_handle" &&  unwantedHandlers.includes(handler)) vscode.window.showWarningMessage(WARNING_MSG);
    },
    
    triggerAlarm: (fileName, WARNING_MSG) => {
        vscode.window.showWarningMessage(WARNING_MSG);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;