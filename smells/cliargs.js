const vscode = require('vscode');

 const smell = {

    detect : (token) => {

        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;
        if(token.hasOwnProperty("hasInputs")) var hasInputs= token.hasInputs;
        
        const cliArgsFuncNames = ['sys.argv','ArgumentParser','argparse','subprocess.Popen'];

        if(tokenType=="function_call" && cliArgsFuncNames.includes(name) && hasInputs == "True"){

            const warning = 'possible use of command line args at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;