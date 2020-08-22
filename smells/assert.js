const vscode = require('vscode');

var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("left")) var left = token.left;
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("comparators")) var comparators = token.comparators;
        
        if(tokenType == "assert" && left != null && comparators.length > 0){

            const warning = 'possible use of assert at line '+ lineno;
            vscode.window.showWarningMessage(warning);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        else if(tokenType == "assert" && token.hasOwnProperty("func"))
        {
            var func = token.func
            if(func != null)
            {
                const warning = 'possible use of assert at line '+ lineno;
                vscode.window.showWarningMessage(warning);
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            }

        }
    }
}

module.exports = smell;