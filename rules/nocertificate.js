const fs = require('fs');
const vscode = require('vscode');

var smell = {
    detect: (fileName, token) => {
        try{
            if (token.hasOwnProperty("line")) var lineno = token.line;
            if (token.hasOwnProperty("type")) var tokenType = token.type;
            
            const MSG = 'TLS verification has been skipped';
            const WARNING_MSG = MSG+' at line '+ lineno;
            const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
            
            const contextVars = ['requests.Session.verify'];
            const httpLibs = ['requests.get','requests.Session.get', 'requests.post', 'requests.Session.get'];
            
            if(tokenType == 'variable' && contextVars.includes(token.name) && token.value == false) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG); 
            if(tokenType == "variable" && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('funcKeywords')) {
                if (httpLibs.includes(token.valueSrc.toLowerCase())) 
                    for(const keyword of token.funcKeywords){
                        if (keyword[0] == 'verify' && keyword[1] == false) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                    }
            }
            if(tokenType == "function_call" && token.hasOwnProperty('name') && token.hasOwnProperty('keywords')) {
                if (httpLibs.includes(token.name.toLowerCase())){
                    token.keywords.map(keyword => {
                        if (keyword[0] == 'verify' && keyword[1] == false) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                    });
                }
            }
            if(tokenType == 'function_def' && token.hasOwnProperty('return') && token.return != null && token.hasOwnProperty('returnKeywords')){
                for(const funcReturn of token.return){
                    if (httpLibs.includes(funcReturn)){
                        for(const keyword of token.returnKeywords){
                            if (keyword[0] == 'verify' && keyword[1] == false) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                        }
                    }
                }
            }
        } catch(error){
            console.log(error);
        }
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