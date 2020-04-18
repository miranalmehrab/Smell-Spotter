const vscode = require('vscode');
var operations = require('./operations');

var smell = {

    detect : (token) => {
        const words = token.split(',');
        const line = words[0];
        const type = words[1];
        const name = words[2];
        const value = words[3];
        
        const cliArgsFuncNames = ['sys.argv','ArgumentParser','argparse'];
        if(cliArgsFuncNames.includes(name))
        {
            console.log('Use of CLI args!');
            vscode.window.showWarningMessage('Use of CLI args at line '+ line);
        }
    }
}

module.exports = smell;