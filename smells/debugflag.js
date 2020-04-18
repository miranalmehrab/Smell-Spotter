const vscode = require('vscode');
var operations = require('./operations');

var smell = {

    detect : (token) => {
        
        const words = token.split(',');
        const line = words[0];
        const type = words[1];
        const name = words[2];
        const value = words[3];
        
        if(operations.isVarible(type) &&  smell.checkName(name) && smell.checkValue(value)){
            console.log('Debug set true!');
            vscode.window.showWarningMessage('Debug set true at line '+ line);
        }
    },
    checkName:(name) => {
        const restrictedNames = ['debug','DEBUG','DEBUG_PROPAGATE_EXCEPTIONS'];
        return restrictedNames.includes(name);
    },
    checkValue:(value) => {
        return value == "True";
    }
}

module.exports = smell;