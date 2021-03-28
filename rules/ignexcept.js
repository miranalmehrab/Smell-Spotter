const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("exceptionHandler")) var handler = token.exceptionHandler;
        
        const MSG = 'exception might have been suppressed'
        const WARNING_MSG = MSG+' at line '+ lineno;

        const unwantedHandlers = ['continue','pass'];
        
        if(tokenType == "exception_handle" &&  unwantedHandlers.includes(handler)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
    },
    
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        console.log("warning: "+MSG +"  location:"+ fileName+":"+lineno);
        
        vscode.window.showWarningMessage(WARNING_MSG);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;