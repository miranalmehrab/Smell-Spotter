const fs = require('fs');
const vscode = require('vscode');

var smell = {
    detect : (fileName, token) => {
        try{
            if(token.hasOwnProperty("line")) var lineno = token.line;
            if(token.hasOwnProperty("type")) var tokenType = token.type;
            
            const MSG = 'possible use of weak cryptographic algorithm'
            
            const WARNING_MSG = MSG+' at line '+ lineno;
            const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
    
            const insecureMethods = [
                                'hashlib.md5','cryptography.hazmat.primitives.hashes.MD5','Crypto.Hash.MD2.new','Crypto.Hash.MD4.new','Crypto.Hash.MD5.new',
                                'Crypto.Cipher.ARC2.new','Crypto.Cipher.ARC4.new','Crypto.Cipher.Blowfish.new', 'Crypto.Cipher.DES.new,Crypto.Cipher.XOR.new',
                                'cryptography.hazmat.primitives.ciphers.algorithms.ARC4', 'cryptography.hazmat.primitives.ciphers.algorithms.Blowfish',
                                'cryptography.hazmat.primitives.ciphers.algorithms.IDEA','cryptography.hazmat.primitives.ciphers.modes.ECB','random.random',
                                'random.randrange','random.randint','random.choice','random.uniform','random.triangular', 'Cryptodome.Cipher.ARC2.new',
                                'Cryptodome.Cipher.ARC4.new','Cryptodome.Cipher.Blowfish.new','Cryptodome.Cipher.DES.new','Cryptodome.Cipher.XOR.new',
                                'cryptography.hazmat.primitives.ciphers.algorithms.ARC4','cryptography.hazmat.primitives.ciphers.algorithms.Blowfish',
                                'cryptography.hazmat.primitives.ciphers.algorithms.IDEA', 'cryptography.hazmat.primitives.ciphers.modes.ECB',
                                'Cryptodome.Hash.MD2.new','Cryptodome.Hash.MD4.new','Cryptodome.Hash.MD5.new','Cryptodome.Hash.SHA.new',
                                'cryptography.hazmat.primitives.hashes.SHA1'
                            ];
    
            if(tokenType == "variable") {
                if(token.hasOwnProperty("args")) var args = token.args;
                if(token.hasOwnProperty("valueSrc")) var valueSrc = token.valueSrc;
    
                if (insecureMethods.includes(valueSrc)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG); 
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            }
            else if(tokenType == "function_call") {
                if(token.hasOwnProperty("name")) var name = token.name;
                if(token.hasOwnProperty("args")) var args = token.args;
                
                if(insecureMethods.includes(name)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                for (const arg of args){
                    if (insecureMethods.includes(arg)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                }
    
                if(token.hasOwnProperty('keywords')){
                    for (const keyword of token.keywords) {
                        if (insecureMethods.includes(keyword[1]) && keyword[2] == false) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                    }
                }
    
                if(name == "hashlib.new"){
                    let blackListedArgs = ["md4", "md5", "sha", "sha1"]
                    
                    args.forEach(arg => {
                        if(blackListedArgs.includes(arg)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                    })
                } 
            }
            else if(tokenType == "function_def") {
                
                if(token.hasOwnProperty("return") && token.return != null){
                    for(const funcReturn of token.return){
                        if(insecureMethods.includes(funcReturn)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                    }
                }
    
                if(token.hasOwnProperty("returnArgs")){
                    for (const arg of token.returnArgs){
                        if (insecureMethods.includes(arg)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                    }
                }
            }
        } catch(error){
            console.log(error);
        }
    },

    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        let backslashSplittedFilePathLength = fileName.split("/").length
        let filenameFromPath = fileName.split("/")[backslashSplittedFilePathLength - 1]
        
        vscode.window.showWarningMessage(MSG +" : "+ filenameFromPath+":"+lineno);
        console.log( "\u001b[1;31m"+"warning: "+MSG +"  location:"+ fileName+":"+lineno);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+" ,"+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;