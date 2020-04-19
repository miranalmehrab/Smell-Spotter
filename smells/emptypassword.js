const vscode = require('vscode');
var operations = require('./operations');

var smell = {

    detect : (token) => {
        
        const line =  token.line;
        const type =  token.type;
        const name =  token.name;
        const value = token.value;
        console.log(name+" "+value);
               
        if((operations.isVarible(type) || operations.isObjectAttribute(type)) && operations.isCommonPassword(name) 
            && operations.isLengthZero(value)) {
            
            console.log('Empty password!');
            vscode.window.showWarningMessage('Empty password at line '+ line);
        }
    }
}

module.exports = smell;