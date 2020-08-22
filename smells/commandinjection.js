const vscode = require('vscode');
var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("args")) var args = token.args;
        if(token.hasOwnProperty("hasInputs")) var hasInputs= token.hasInputs;
        
        const cmdFuncs = ['sys.argv','ArgumentParser','argparse','subprocess.Popen','os.system'];

        if(tokenType == "function_call" && cmdFuncs.includes(name) && (args.length > 0 || hasInputs == true))
        {
            const warning = 'possible use of command injection at line '+ lineno;
            vscode.window.showWarningMessage(warning);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        else if(tokenType == "variable" && token.hasOwnProperty("valueSrc"))
        {
            if(cmdFuncs.includes(token.valueSrc))
            {
                const warning = 'possible use of command injection at line '+ lineno;
                vscode.window.showWarningMessage(warning);
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            } 
        }
    }
}

module.exports = smell;