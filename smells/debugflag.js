const vscode = require('vscode');

var smell = {

    detect : (token) => {
                
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("value")) var value = token.value;
        
        const restrictedNames = ['debug','debug_propagate_exceptions'];


        if(tokenType == "variable" && restrictedNames.includes(name.toLowerCase()) && value == true){

            const warning = 'possible debug set true at line '+ lineno;
            vscode.window.showWarningMessage(warning);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
        }
        else if(tokenType == "function_call") {
            if(token.hasOwnProperty("keywords")) var keywords = token.keywords;
            
            keywords.map(keyword => {
                if(restrictedNames.includes(keyword[0].toLowerCase()) && keyword[1] == true){

                    const warning = 'possible debug set true at line '+ lineno;
                    vscode.window.showWarningMessage(warning);
                    // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
                }
            });
        }
        else if(tokenType == 'dict' && token.hasOwnProperty('keys') && token.hasOwnProperty('values')){
            var keys = token.keys;
            var values = token.values;
            
            if(keys.length == values.length)
            {
                var blocks = keys.map((key, i) => [key, values[i]]);
    
                blocks.map(block => {
                    if(restrictedNames.includes(block[0].toLowerCase()) && block[1] == true) {
                        const warning = 'possible debug set true at line '+ lineno;
                        vscode.window.showWarningMessage(warning);
                    }
                });
            }
        }
    }
}

module.exports = smell;