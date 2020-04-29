const vscode = require('vscode');
const operations = require('../smells/operations');
var smell = {

    detect : (token) => {

        const line = token.line;
        if(token.hasOwnProperty("params")) var params = token.params;
        if(token.hasOwnProperty("method")) var methodname = token.method;
        
        const unwantedmethod = ['socket.socket(socket.AF_INET, socket.SOCK_STREAM).bind'];
        const unwantedparam = ['0.0.0.0','192.168.0.1'];
        let param = operations.refine(operations.removebracket(params[0]));

        console.log(methodname);
        console.log(params);
        console.log(param);
        
        if(unwantedmethod.includes(methodname) && unwantedparam.includes(param))
        {
            console.log('Hardcoded IP binding!');
            vscode.window.showWarningMessage('Hardcoded IP binding at line '+ line);
        }
    }
}

module.exports = smell;