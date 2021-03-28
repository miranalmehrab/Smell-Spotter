const fs = require('fs');
const vscode = require('vscode');

var smell = {
    detect: (fileName, token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const WARNING_MSG = 'possible use of assert statement at line '+ lineno;
        
        if (tokenType == "assert") {
            vscode.window.showWarningMessage(WARNING_MSG);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            // fs.appendFileSync(__dirname+'/../logs/warnings.txt', WARNING_MSG+"\n");
        }
    },
    triggerAlarm: (fileName, WARNING_MSG) => {
        vscode.window.showWarningMessage(WARNING_MSG);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;