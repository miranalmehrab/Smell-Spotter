const vscode = require('vscode');
const operations = require('./operations');

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
            const warning = 'possible use of command line args at line '+ line;
            
            operations.writesmelllog(warning);
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;