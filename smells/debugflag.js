const vscode = require('vscode');

var smell = {

    detect : (token) => {
                
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("value")) var value = token.value;
        
        const restrictedNames = ['debug', 'DEBUG', 'DEBUG_PROPAGATE_EXCEPTIONS'];

        if(tokenType == "variable" && restrictedNames.includes(name) && value!=null){

            const warning = 'possible debug set true at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
        else if(tokenType == "function_call")
        {
            console.log(token);
            
            if(token.hasOwnProperty("keywords")) var keywords = token.keywords;
            
            keywords.map(keyword =>{
                if(restrictedNames.includes(keyword[0]) && keyword[1]){
                    const warning = 'possible debug set true at line '+ lineno;
                    vscode.window.showWarningMessage(warning);
                }
            });
        }
    }
}

module.exports = smell;