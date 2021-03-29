const fs = require('fs');
const vscode = require('vscode');

var smell = {
    detect : (fileName, token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const MSG = 'possible use of insecure yaml operations'
        
        const WARNING_MSG = MSG+' at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
        const insecureMethods = ['yaml.load', 'yaml.load_all', 'yaml.full_load', 'yaml.dump', 'yaml.dump_all', 'yaml.full_load_all']

        if(tokenType == "variable") {
            if(insecureMethods.includes(token.valueSrc)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
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
            if(token.hasOwnProperty("return")){
                for(const funcReturn of token.return){
                    if(insecureMethods.includes(funcReturn)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                }
            }
        }
    },
    
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        let backslashSplittedFilePathLength = fileName.split("/").length
        let filenameFromPath = fileName.split("/")[backslashSplittedFilePathLength - 1]
        
        console.log("warning: "+MSG +"  location:"+ fileName+":"+lineno);
        vscode.window.showWarningMessage(MSG +" : "+ filenameFromPath+":"+lineno);
        
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;