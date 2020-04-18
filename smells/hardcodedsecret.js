const vscode = require('vscode');
var operations = require('./operations');

var smell = {
    detect : (token) => {
        const words = token.split(',');
        const line = words[0];
        const type = words[1];
        const name = words[2];
        const value = words[3];
        
        if(operations.isVarible(type) && (operations.isCommonPassword(name) 
        || operations.isCommonUserName(name)) && !operations.isLengthZero(value))
        {
            console.log('hardcoded secret!');
            vscode.window.showWarningMessage('Hard coded secret at line '+ line);
        }
    }
}

module.exports = smell;