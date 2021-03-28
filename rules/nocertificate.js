const fs = require('fs');
const vscode = require('vscode');

var smell = {
    detect: (fileName, token) => {
        if (token.hasOwnProperty("line")) var lineno = token.line;
        if (token.hasOwnProperty("type")) var tokenType = token.type;
        if (token.hasOwnProperty("name")) var name = token.name;
        
        const MSG = 'TLS verification might have been skipped'
        const WARNING_MSG = MSG+' at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
        
        const contextVars = ['requests.Session.verify'];
        const httpLibs = ['requests.get','requests.Session.get', 'requests.post', 'requests.Session.get'];
        
        if(tokenType == 'variable' && contextVars.includes(token.name) && token.value == false) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG); 
        else if(tokenType == "variable" && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('funcKeywords')) {
            if (httpLibs.includes(token.valueSrc.toLowerCase()) && token.funcKeywords.length > 0) 
                for(const keyword of token.funcKeywords){
                    if (keyword[0] == 'verify' && keyword[1] == false) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                }
        }
        else if(tokenType == "function_call" && token.hasOwnProperty('name') && token.hasOwnProperty('keywords')) {
            if (httpLibs.includes(token.name.toLowerCase()) && token.Keywords.length > 0){
                for(const keyword of token.keywords){
                    if (keyword[0] == 'verify' && keyword[1] == false) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                }
            }
        }
        else if(tokenType == 'function_def' && token.hasOwnProperty('return') && token.hasOwnProperty('returnKeywords')){
            for(const funcReturn of token.return){
                if (httpLibs.includes(funcReturn) && token.returnKeywords.length > 0){
                    for(const keyword of token.returnKeywords){
                        if (keyword[0] == 'verify' && keyword[1] == false) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                    }
                }
            }
        }
    },
    
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        console.log("warning: "+MSG +"  location:"+ fileName+":"+lineno);
        vscode.window.showWarningMessage(WARNING_MSG);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;