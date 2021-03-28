const fs = require('fs');
const vscode = require('vscode');

var smell = {
    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const WARNING_MSG = 'possible use of weak cryptographic algorithm at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? 'possible presence of weak cryptographic algorithm at line '+ token.returnLine : null

        const insecureMethods = ['hashlib.md5','cryptography.hazmat.primitives.hashes.MD5','Crypto.Hash.MD2.new','Crypto.Hash.MD4.new','Crypto.Hash.MD5.new',
                                'Crypto.Cipher.ARC2.new','Crypto.Cipher.ARC4.new','Crypto.Cipher.Blowfish.new', 'Crypto.Cipher.DES.new,Crypto.Cipher.XOR.new',
                                'cryptography.hazmat.primitives.ciphers.algorithms.ARC4', 'cryptography.hazmat.primitives.ciphers.algorithms.Blowfish',
                                'cryptography.hazmat.primitives.ciphers.algorithms.IDEA','cryptography.hazmat.primitives.ciphers.modes.ECB','random.random',
                                'random.randrange','random.randint','random.choice','random.uniform','random.triangular'
                            ];

        if(tokenType == "variable") {
            if(token.hasOwnProperty("args")) var args = token.args;
            if(token.hasOwnProperty("valueSrc")) var valueSrc = token.valueSrc;

            if (insecureMethods.includes(valueSrc)) vscode.window.showWarningMessage(WARNING_MSG); 
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        else if(tokenType == "function_call") {
            if(token.hasOwnProperty("name")) var name = token.name;
            if(token.hasOwnProperty("args")) var args = token.args;
            
            if(insecureMethods.includes(name)) vscode.window.showWarningMessage(WARNING_MSG);
            for (const arg of args){
                if (insecureMethods.includes(arg)) vscode.window.showWarningMessage(WARNING_MSG);
            }

            if(token.hasOwnProperty('keywords')){
                for (const keyword of token.keywords) {
                    if (insecureMethods.includes(keyword[1]) && keyword[2] == false) vscode.window.showWarningMessage(WARNING_MSG);
                }
            }
        }
        else if(tokenType == "function_def") {
            
            if(token.hasOwnProperty("return")){
                for(const funcReturn of token.return){
                    if(insecureMethods.includes(funcReturn)) vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
                }
            }

            if(token.hasOwnProperty("returnArgs")){
                for (const arg of token.returnArgs){
                    if (insecureMethods.includes(arg)) vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
                }
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