const vscode = require('vscode');
const operation = require('../smells/operations.js');


var smell = {

    detect : (token) => {

        const line =  token.line;
        if(token.hasOwnProperty("method")) var methodname = token.method;
        if(token.hasOwnProperty("params")) var params = token.params;
        
        const unwantedmethod = ['os.chmod','chmod'];
        const unwantedparam = ['0x777','0x757','0x755'];

        if(params.length > 1) var param = operation.refine(params[1]);
        else var param = operation.refine(params[0]);

        console.log(param);
        
        if(unwantedmethod.includes(methodname) && unwantedparam.includes(param))
        {
            console.log('Bad file permission!');
            vscode.window.showWarningMessage('Bad file permission at line '+ line);
        }
    }
}

module.exports = smell;