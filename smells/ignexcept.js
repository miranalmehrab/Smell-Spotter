const vscode = require('vscode');

var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("arg")) var arg = token.arg;

        const unwantedBlocks = ['continue','pass'];
        
        if(tokenType == "except_statement" &&  unwantedBlocks.includes(arg)) {

            const warning = 'possible ignore except block at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;