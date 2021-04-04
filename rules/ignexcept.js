const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
        try{
            if(token.hasOwnProperty("line")) var lineno = token.line;
            if(token.hasOwnProperty("type")) var tokenType = token.type;
            if(token.hasOwnProperty("exceptionHandler")) var handler = token.exceptionHandler;
            
            const MSG = 'exception might have been suppressed'
            const WARNING_MSG = MSG+' at line '+ lineno;

            const unwantedHandlers = ['continue','pass'];
            
            if(tokenType == "exception_handle" &&  unwantedHandlers.includes(handler)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
        
        } catch(error){
            console.log(error);
        }
    },
    
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        let backslashSplittedFilePathLength = fileName.split("/").length
        let filenameFromPath = fileName.split("/")[backslashSplittedFilePathLength - 1]
        
        vscode.window.showWarningMessage(MSG +" : "+ filenameFromPath+":"+lineno);
        console.log( "\u001b[1;31m"+"warning: "+MSG +"  location:"+ fileName+":"+lineno);
        
        fs.appendFileSync('smell-spotter/warning-logs/project_warnings.csv', fileName+" ,"+WARNING_MSG+"\n");
    }
}

module.exports = smell;