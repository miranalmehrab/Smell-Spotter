const vscode = require('vscode');

var smell = {

    detect : (token) => {

        const line =  token.line;
        if(token.hasOwnProperty("statement")) var statement = token.statement;
        if(token.hasOwnProperty("block")) var block = token.block;
        
        const unwantedblock = ['continue','pass'];
        
        if(statement == "except" &&  unwantedblock.includes(block.trim()) )
        {
            console.log('Ignore except block statement!');
            vscode.window.showWarningMessage('Ignore except block at line '+ line);
        }
    }
}

module.exports = smell;