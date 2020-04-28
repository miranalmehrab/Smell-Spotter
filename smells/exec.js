const vscode = require('vscode');

var smell = {

    detect : (token) => {

        const line =  token.line;
        if(token.hasOwnProperty("method")) var methodname = token.method;
        if(token.hasOwnProperty("params")) var params = token.params;
        if(token.hasOwnProperty("source")) var src = token.source;

        if(methodname == "exec" && ( params || src == "input"))
        {
            console.log('Use of exec statement!');
            vscode.window.showWarningMessage('Use of exec statement at line '+ line);
        }
    }
}

module.exports = smell;