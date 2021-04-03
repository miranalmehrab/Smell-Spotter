const fs = require('fs');
const vscode = require('vscode');

var smell = {
    detect : (fileName, token) => {
        try{
            if(token.hasOwnProperty("line")) var lineno = token.line;
            if(token.hasOwnProperty("type")) var tokenType = token.type;

            const MSG = 'possible presence of cross-site scripting'
            
            const WARNING_MSG = MSG+' at line '+ lineno;
            const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
            const insecureMethods = ['django.utils.safestring.mark_safe', 'mark_safe'];

            if(tokenType == "variable") {
                if(insecureMethods.includes(token.valueSrc)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            }

            else if(tokenType == "function_call") {
                if(insecureMethods.includes(token.name)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                
                if(token.hasOwnProperty('args')){
                    for(const arg of token.args){
                        if(insecureMethods.includes(arg)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                    }    
                }
            }

            else if(tokenType == "function_def") {
                if(token.hasOwnProperty("return") && token.return != null){
                    for(const funcReturn of token.return){
                        if(insecureMethods.includes(funcReturn)) 
                        smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                    }
                }
            }
        } catch(error){
            console.log(error);
        }
        
    },
    isInsecureMethod: (methodName) => {
        const insecureMethods = ['django.utils.safestring.mark_safe', 'mark_safe']
    
        if(methodName.length == 0) return false
        else if(typeof(methodName) != 'string') return false
        for (const name of insecureMethods) {
            if (insecureMethods.includes(name)) return true
        }

        return false
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