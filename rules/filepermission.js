const vscode = require('vscode');
var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("name")) var name = token.name;
        if(token.hasOwnProperty("args")) var args = token.args;
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;

        const WARNING_MSG = 'possible bad file permission at line '+ lineno;
        const unwantedMethods = ['os.chmod','chmod'];
        const unwantedParams = ['0x777', '0x757', '0x755','stat.S_IRWXO','stat.S_IROTH','stat.S_IWOTH','stat.S_IXOTH'];
        
        if(tokenType == "function_call" && unwantedMethods.includes(name)) vscode.window.showWarningMessage(WARNING_MSG);
        
        else if(tokenType == "function_call" && name == "subprocess.call" && token.args.length > 0) {
            for(const arg of token.args){
                if(unwantedMethods.includes(arg))
                    vscode.window.showWarningMessage(WARNING_MSG);
            }
        }
    }
}

module.exports = smell;