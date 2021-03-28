const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("args")) var args = token.args;
        if(token.hasOwnProperty("hasInputs")) var hasInputs= token.hasInputs;
        
        const WARNING_MSG = 'possible presence of command injection at line ' + lineno
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? 'possible presence of command injection at line '+ token.returnLine : null

        const shellFunctions = ['sys.argv', 'subprocess.Popen', 'os.system', 'os.popen','subprocess.run','popen2.Popen4',
                                'argparse.ArgumentParser','getopt.getopt', 'os.execle','os.execl', 'popen2.Popen3'
                            ];
        
        if(tokenType == "variable" && token.hasOwnProperty("valueSrc")) {
            if(shellFunctions.includes(token.valueSrc) || smell.isExtendedShellFunction(token.valueSrc)) vscode.window.showWarningMessage(WARNING_MSG);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        else if(tokenType == "function_call" && (shellFunctions.includes(name) || smell.isExtendedShellFunction(name))) vscode.window.showWarningMessage(WARNING_MSG);
        else if (tokenType == "function_def" && token.hasOwnProperty('return')) {
            for(const funcReturn of token.return){
                if(shellFunctions.includes(funcReturn) || smell.isExtendedShellFunction(funcReturn)) 
                    vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN)
            }
        }
    },

    isExtendedShellFunction: functionName => {
        const shellFunctions = ['sys.argv','subprocess.Popen','os.system','os.popen','subprocess.run','argparse.ArgumentParser','getopt.getopt']
        
        for (const name of shellFunctions) {
            if(functionName.includes(name)) return true;
        }

        return false;
    },

    triggerAlarm: (fileName, WARNING_MSG) => {
        vscode.window.showWarningMessage(WARNING_MSG);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;