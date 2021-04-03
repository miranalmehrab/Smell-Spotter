const fs = require('fs');
const vscode = require('vscode');


var smell = {

    detect : (fileName, token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const MSG = 'possible presence of dynamic code execution'
        
        const WARNING_MSG = MSG+' at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
        const insecureMethods = ['exec', 'eval', 'compile'];

        if(tokenType == "variable" && token.hasOwnProperty("valueSrc")){
            if(insecureMethods.includes(token.valueSrc)) 
                smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
        }
        else if(tokenType == "function_call" && token.hasOwnProperty("name")) {
            if(insecureMethods.includes(token.name)) 
                smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
        }
        else if(tokenType == "function_def" && token.hasOwnProperty("return") && token.return != null) {
            for(const funcReturn of token.return){
                if(insecureMethods.includes(funcReturn)) 
                smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
            }
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