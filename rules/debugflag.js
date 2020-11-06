const vscode = require('vscode');

var smell = {

    detect : (token) => {
                
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name = token.name;
        if(token.hasOwnProperty("value")) var value = token.value;

        const WARNING_MSG = 'possible presence of debug set true at line '+ lineno;
        const restrictedNames = ['debug','debug_propagate_exceptions','propagate_exceptions','PROPAGATE_EXCEPTIONS'];


        if(tokenType == "variable" && (restrictedNames.includes(name.toLowerCase()) || this.hasDebugInName(name.toLowerCase())) && value == true){
            vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == 'dict' && token.hasOwnProperty('pairs')){
            for (const pair of token.pairs){
                if(restrictedNames.includes(pair[0]) && pair[1] == true){
                    vscode.window.showWarningMessage(WARNING_MSG);
                }
            }
        }
        else if(tokenType == "function_call" && token.hasOwnProperty("keywords")) {
            for(const keyword of token.keywords){
                if(restrictedNames.includes(keyword[0]) && keyword[1] == true){
                    vscode.window.showWarningMessage(WARNING_MSG);
                }
            }
        }
    },
    hasDebugInName: (variableName) => {
        const restrictedNames = ['debug','debug_propagate_exceptions','propagate_exceptions','PROPAGATE_EXCEPTIONS'];
        for (const name of restrictedNames){
            if (variableName.search(name)) return true 
        }

        return false
    }
}

module.exports = smell;