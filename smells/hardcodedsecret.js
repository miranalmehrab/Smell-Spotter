const vscode = require('vscode');
var operations = require('./operations');

var smell = {
    detect : (token) => {
        
        const line =  token.line;
        const type =  token.type;
        const name =  token.name;
        const value = token.value;
        var params = "";

        if (token.hasOwnProperty("params")) params = token.params;
        if (operations.isVarible(type) 
            && (operations.isCommonPassword(name) || operations.isCommonUserName(name)) 
            && !operations.isLengthZero(value)) { 

            console.log('hardcoded secret!');
            vscode.window.showWarningMessage('Hard coded secret at line '+ line);
        }
    }
}

module.exports = smell;