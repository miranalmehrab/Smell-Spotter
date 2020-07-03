const vscode = require('vscode');
var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;
        
        const unwantedMethods = ['os.chmod','chmod'];
        const unwantedParams = ['0x777', '0x757', '0x755',1911,'stat.S_IRWXO','stat.S_IROTH','stat.S_IWOTH','stat.S_IXOTH'];
        
        if(tokenType == "function_call" && unwantedMethods.includes(name)){
            
            args.map(arg => {
                console.log(arg);
                
                if(unwantedParams.includes(arg)){
                    const warning = 'possible bad file permission at line '+ lineno;
                    vscode.window.showWarningMessage(warning);
                }
            });
        }
    }
}

module.exports = smell;