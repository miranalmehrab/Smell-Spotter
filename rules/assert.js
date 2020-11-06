const vscode = require('vscode');

var smell = {
    detect: (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const WARNING_MSG = 'possible use of assert statement at line '+ lineno;
        
        if (tokenType == "assert") vscode.window.showWarningMessage(WARNING_MSG);
        // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
    }
}

module.exports = smell;