const fs = require('fs');
const vscode = require('vscode');

var smell = {
    detect: (fileName, token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const MSG = 'possible use of assert statement'
        const WARNING_MSG = MSG+ ' at line '+ lineno;
        
        if (tokenType == "assert") {
            smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            // fs.appendFileSync(__dirname+'/../logs/warnings.txt', WARNING_MSG+"\n");
        }
    },
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        console.log("warning: "+MSG +"  location:"+ fileName+":"+lineno);
        vscode.window.showWarningMessage(WARNING_MSG);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;