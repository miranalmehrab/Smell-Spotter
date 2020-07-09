const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("value")) var value = token.value;

        const commonPasswords = ['password','pass','pwd','userPassword','PASSWORD','PASS','PWD','USERPWD'];    
        
        if(tokenType == "variable" && commonPasswords.includes(name) && value.length == 0){    
            const warning = 'possible empty password at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
        else if(tokenType == "variable" && commonPasswords.includes(name) && value == null){
            const warning = 'possible empty password at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
        else if(tokenType == "comparison"){

            if(token.hasOwnProperty("pairs")) var pairs = token.pairs;
            
            Object.values(pairs).map(pair => {
                if(commonPasswords.includes(pair[0].toString()) && (pair[1].toString()).length == 0){

                    const warning = 'possible empty password at line '+ lineno;
                    vscode.window.showWarningMessage(warning);
                }
                else if(commonPasswords.includes(pair[1].toString()) && (pair[0].toString()).length == 0){

                    const warning = 'possible empty password at line '+ lineno;
                    vscode.window.showWarningMessage(warning);
                }
            });  
        }

    }
}

module.exports = smell;