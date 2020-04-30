const vscode = require('vscode');
const operations = require('./operations');
const color = new vscode.ThemeColor('pssd.warning');

var smell = {

    detect : (token) => {

        const line =  token.line;
        if(token.hasOwnProperty("statement")) var statement = token.statement;
        if(token.hasOwnProperty("block")) var block = token.block;
        
        const unwantedblock = ['continue','pass'];
        
        if(statement == "except" &&  unwantedblock.includes(block.trim()) )
        {
            const warning = 'possible ignore except block at line '+ line;
            
            operations.writesmelllog(warning);
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;