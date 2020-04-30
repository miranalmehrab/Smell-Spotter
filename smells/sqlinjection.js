const vscode = require('vscode');
const operations = require('./operations');

var smell = {

    detect : (token) => {

        const line =  token.line;
        if(token.hasOwnProperty("method")) var methodname = token.method;
        if(token.hasOwnProperty("params")) var params = token.params;
        if(token.hasOwnProperty("source")) var src = token.source;

        const unwanted = ['execution.query'];
        if(unwanted.includes(methodname) && ( params || src == "input"))
        {
            const warning = 'possible SQL injection at line '+ line;
            
            operations.writesmelllog(warning);
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;