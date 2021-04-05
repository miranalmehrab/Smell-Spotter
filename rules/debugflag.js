const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
        try{
            if(token.hasOwnProperty("line")) var lineno = token.line;
            if(token.hasOwnProperty("type")) var tokenType = token.type;
            if(token.hasOwnProperty("name")) var name = token.name;
            if(token.hasOwnProperty("value")) var value = token.value;
    
            const MSG = 'debug facility turned on'        
            const WARNING_MSG = MSG+' at line '+ lineno;
            const restrictedNames = ['debug','debug_propagate_exceptions','propagate_exceptions'];
    
            if(tokenType == "variable" && name != null && (restrictedNames.includes(name.toLowerCase()) || smell.hasDebugInName(name.toLowerCase())) && value == true){
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
        } catch(error){
            console.log(error);
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
        let backslashSplittedFilePathLength = fileName.split("/").length
        let filenameFromPath = fileName.split("/")[backslashSplittedFilePathLength - 1]
        
        vscode.window.showWarningMessage(MSG +" : "+ filenameFromPath+":"+lineno);
        console.log( "\u001b[1;31m"+"warning: "+MSG +"  location:"+ fileName+":"+lineno);
        fs.appendFileSync('smell-spotter/warning-logs/project_warnings.csv', fileName+" ,"+WARNING_MSG+"\n");
    }
}

module.exports = smell;