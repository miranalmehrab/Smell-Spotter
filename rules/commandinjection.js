const vscode = require('vscode');
var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("args")) var args = token.args;
        if(token.hasOwnProperty("hasInputs")) var hasInputs= token.hasInputs;
        
        const WARNING_MESSAGE = 'possible presence of command injection at line ' + lineno
        const shellFunctions = ['sys.argv', 'subprocess.Popen', 'os.system', 'os.popen','subprocess.run','popen2.Popen4',
                                'argparse.ArgumentParser','getopt.getopt', 'os.execle','os.execl', 'popen2.Popen3'
                            ];
        
        if(tokenType == "variable" && token.hasOwnProperty("valueSrc")) {
            if(shellFunctions.includes(token.valueSrc) || this.isExtendedShellFunctionName(token.valueSrc)) vscode.window.showWarningMessage(WARNING_MESSAGE);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        else if(tokenType == "function_call" && (shellFunctions.includes(name) || this.isExtendedShellFunctionName(name))) vscode.window.showWarningMessage(WARNING_MESSAGE);
        else if (tokenType == "function_def" && token.hasOwnProperty('return')) {
            if(shellFunctions.includes(token.return) || this.isExtendedShellFunctionName(token.return)) vscode.window.showWarningMessage(WARNING_MESSAGE);
        }
    },
    isExtendedShellFunctionName: (functionName) => {
        const shellFunctions = ['sys.argv', 'subprocess.Popen', 'os.system', 'os.popen','subprocess.run', 'argparse.ArgumentParser', 'getopt.getopt']
        for (const name of shellFunctions) {
            if(functionName.includes(name)) return true;
        }

        return false;
    }
}

module.exports = smell;