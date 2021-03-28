const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
                
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name = token.name;
        if(token.hasOwnProperty("value")) var value = token.value;

        const MSG = 'possible presence of debug set true'
        
        const WARNING_MSG = MSG+' at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
        const restrictedNames = ['debug','debug_propagate_exceptions','propagate_exceptions','PROPAGATE_EXCEPTIONS'];


        if(tokenType == "variable" && (restrictedNames.includes(name.toLowerCase()) || smell.hasDebugInName(name.toLowerCase())) && value == true){
            smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
        }
        else if(tokenType == 'dict' && token.hasOwnProperty('pairs')){
            for (const pair of token.pairs){
                if(restrictedNames.includes(pair[0]) && pair[1] == true){
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                }
            }
        }
        else if(tokenType == "function_call" && token.hasOwnProperty("keywords")) {
            for(const keyword of token.keywords){
                if(restrictedNames.includes(keyword[0]) && keyword[1] == true){
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
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
    },
    
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        console.log("warning: "+MSG +"  location:"+ fileName+":"+lineno);
        vscode.window.showWarningMessage(WARNING_MSG);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;