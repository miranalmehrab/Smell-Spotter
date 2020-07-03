const vscode = require('vscode');

var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;

        const unwantedMethods = ['socket.socket.bind'];
        const unwantedParams = ['0.0.0.0','192.168.0.1'];
         
        if(tokenType == "function_call" &&  unwantedMethods.includes(name)){
            
            args.map(arg => {

                if(unwantedParams.includes(arg)){

                    const warning = 'possible harcoded ip address binding at line '+ lineno;        
                    vscode.window.showWarningMessage(warning);
                }
            });
        }
    }
}

module.exports = smell;