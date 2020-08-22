const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("value")) var value = token.value;

        const commonPasswords = ['password','passwords','pass','pwd','userpassword','userpwd', 'userpass', 'pass_no', 'pass-no', 'user-pass', 'upass'];    
        
        if(tokenType == "variable" && commonPasswords.includes(name.toLowerCase()) && value == null){    
            const warning = 'possible empty password at line '+ lineno;
            vscode.window.showWarningMessage(warning);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        else if(tokenType == "variable" && commonPasswords.includes(name.toLowerCase()) && value.length == 0){
            const warning = 'possible empty password at line '+ lineno;
            vscode.window.showWarningMessage(warning);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        else if(tokenType == "comparison"){

            if(token.hasOwnProperty("pairs")) var pairs = token.pairs;
            
            Object.values(pairs).map(pair => {
                if(commonPasswords.includes((pair[0].toString()).toLowerCase()) && (pair[1].toString()).length == 0){

                    const warning = 'possible empty password at line '+ lineno;
                    vscode.window.showWarningMessage(warning);
                    // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
                }
                else if(commonPasswords.includes((pair[1].toString()).toLowerCase()) && (pair[0].toString()).length == 0){

                    const warning = 'possible empty password at line '+ lineno;
                    vscode.window.showWarningMessage(warning);
                    // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
                }
            });  
        }
        else if(tokenType == 'function_call' && token.hasOwnProperty('keywords'))
        {
            var keywords = token.keywords

            keywords.map(keyword => {
                if(keyword.length == 2)
                {
                    if(commonPasswords.includes(keyword[0].toLowerCase()) && keyword[1].lenght == 0)
                    {
                        const warning = 'possible empty password at line '+ lineno;
                        vscode.window.showWarningMessage(warning);
                        // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
                    } 
                }     
            });
        }
    }
}

module.exports = smell;