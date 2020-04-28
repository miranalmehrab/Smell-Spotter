const vscode = require('vscode');

var smell = {

    detect : (token) => {

        const line =  token.line;
        if(token.hasOwnProperty("method")) var methodname = token.method;
        if(token.hasOwnProperty("params")) var params = token.params;
        if(token.hasOwnProperty("source")) var src = token.source;

        const unwanted = ['execution.query'];
        if(unwanted.includes(methodname) && ( params || src == "input"))
        {
            console.log('SQL injection!');
            vscode.window.showWarningMessage('SQL injection at line '+ line);
        }
    }
}

module.exports = smell;