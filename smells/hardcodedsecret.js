const vscode = require('vscode');
var operations = require('./operations');

var smell = {
    detect : (token) => {
        
        const line =  token.line;
        const type =  token.type;
        const name =  token.name;
        const value = token.value;

        if (token.hasOwnProperty("params")) var params = token.params;
        if (operations.isVarible(type) 
            && token.source == "initialized"
            && (operations.isCommonPassword(name) || operations.isCommonUserName(name)) 
            && !operations.isLengthZero(value)) { 

                const warning = 'possible hardcoded secret at line '+ line;
            
                operations.writesmelllog(warning);
                vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;