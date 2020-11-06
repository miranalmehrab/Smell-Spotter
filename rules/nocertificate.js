const vscode = require('vscode');

var smell = {
    detect: (token) => {
        if (token.hasOwnProperty("line")) var lineno = token.line;
        if (token.hasOwnProperty("type")) var tokenType = token.type;
        if (token.hasOwnProperty("name")) var name = token.name;
        
        const WARNING_MSG = 'possible presence of skipping TLS verification at line ' + lineno;
        
        const contextVars = ['requests.Session.verify'];
        const httpLibs = ['requests.get','requests.Session.get', 'requests.post', 'requests.Session.get'];
        
        if(tokenType == 'variable' && contextVars.includes(token.name) && token.value == false) vscode.window.showWarningMessage(WARNING_MSG); 
        else if(tokenType == "variable" && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('funcKeywords')) {
            if (httpLibs.includes(token.valueSrc.toLowerCase()) && token.funcKeywords.length > 0) 
                for(const keyword of token.funcKeywords){
                    if (keyword[0] == 'verify' && keyword[1] == false) vscode.window.showWarningMessage(WARNING_MSG);
                }
        }
        else if(tokenType == "function_call" && token.hasOwnProperty('name') && token.hasOwnProperty('keywords')) {
            if (httpLibs.includes(token.name.toLowerCase()) && token.Keywords.length > 0){
                for(const keyword of token.keywords){
                    if (keyword[0] == 'verify' && keyword[1] == false) vscode.window.showWarningMessage(WARNING_MSG);
                }
            }
        }
        else if(tokenType == 'function_def' && token.hasOwnProperty('return') && token.hasOwnProperty('returnKeywords')){
            if (httpLibs.includes(token.return.toLowerCase()) && token.returnKeywords.length > 0){
                for(const keyword of token.returnKeywords){
                    if (keyword[0] == 'verify' && keyword[1] == false) vscode.window.showWarningMessage(WARNING_MSG);
                }
            }
        }
    }
}

module.exports = smell;