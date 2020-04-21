const vscode = require('vscode');

var smell = {

    detect : (token) => {

        const line =  token.line;
        if(token.hasOwnProperty("method")) var methodname = token.method;
        if(token.hasOwnProperty("params")) var params = token.params;
        if(token.hasOwnProperty("source")) var src = token.source;

        console.log(methodname);
        
        const cliArgsFuncNames = ['sys.argv','ArgumentParser','argparse','subprocess.Popen'];
        if(cliArgsFuncNames.includes(methodname) && src == "input")
        {
            console.log('Use of CLI args!');
            vscode.window.showWarningMessage('Use of CLI args at line '+ line);
        }
    }
}

module.exports = smell;