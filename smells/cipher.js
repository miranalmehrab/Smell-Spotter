const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const insecureMethods = ['hashlib.md5','cryptography.hazmat.primitives.hashes.MD5',
                                'Crypto.Hash.MD2.new','Crypto.Hash.MD4.new','Crypto.Hash.MD5.new',
                                'Crypto.Cipher.ARC2.new','Crypto.Cipher.ARC4.new','Crypto.Cipher.Blowfish.new',
                                'Crypto.Cipher.DES.new,Crypto.Cipher.XOR.new','cryptography.hazmat.primitives.ciphers.algorithms.ARC4',
                                'cryptography.hazmat.primitives.ciphers.algorithms.Blowfish','cryptography.hazmat.primitives.ciphers.algorithms.IDEA',
                                'cryptography.hazmat.primitives.ciphers.modes.ECB','random.random','random.randrange','random.randint','random.choice','random.uniform','random.triangular'
                            ];

        if(tokenType == "variable")
        {
            if(token.hasOwnProperty("args")) var args = token.args;
            if(token.hasOwnProperty("valueSrc")) var valueSrc = token.valueSrc;

            if(insecureMethods.includes(valueSrc) && args.length > 0) 
            {
                const warning = 'possible empty password at line '+ lineno;
                vscode.window.showWarningMessage(warning);
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            }
        }
        else if(tokenType == "function_call")
        {
            if(token.hasOwnProperty("name")) var name = token.name;
            if(token.hasOwnProperty("args")) var args = token.args;
            
            if(insecureMethods.includes(name) && args.length > 0) 
            {
                const warning = 'possible empty password at line '+ lineno;
                vscode.window.showWarningMessage(warning);
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            }
        }
        else if(tokenType == "function_def")
        {
            if(token.hasOwnProperty("return")) var funcReturn = token.return;
            if(token.hasOwnProperty("returnArgs")) var returnArgs = token.returnArgs;
            
            if(insecureMethods.includes(funcReturn) && returnArgs.length > 0) 
            {
                const warning = 'possible empty password at line '+ lineno;
                vscode.window.showWarningMessage(warning);
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            }
        }
    }
}

module.exports = smell;