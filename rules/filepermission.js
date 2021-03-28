const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("name")) var name = token.name;
        if(token.hasOwnProperty("args")) var args = token.args;
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;

        const WARNING_MSG = 'possible bad file permission at line '+ lineno;
        const unwantedMethods = ['os.chmod','chmod'];
        
        if(tokenType == "function_call" && unwantedMethods.includes(name.toLowerCase())) vscode.window.showWarningMessage(WARNING_MSG);
        
        else if(tokenType == "function_call" && name.toLowerCase() == "subprocess.call" && token.args.length > 0) {
            for(const arg of token.args){
                if(unwantedMethods.includes(arg))
                    vscode.window.showWarningMessage(WARNING_MSG);
            }
        }
    },
    
    triggerAlarm: (fileName, WARNING_MSG) => {
        vscode.window.showWarningMessage(WARNING_MSG);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;