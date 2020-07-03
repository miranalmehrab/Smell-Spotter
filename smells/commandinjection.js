const vscode = require('vscode');
var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;
        if(token.hasOwnProperty("hasInputs")) var containUserInput = token.hasInputs;
        
        const unwanted = ['subprocess.Popen'];

        if(tokenType =="function_call" && unwanted.includes(name) && ( args || containUserInput == "True")){
            
            const warning = 'possible cmd injection at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;