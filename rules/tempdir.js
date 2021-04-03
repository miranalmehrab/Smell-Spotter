const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name = token.name;
        if (token.hasOwnProperty("value")) var value = token.value;

        const MSG = 'possible hardcoded temporary directory'
        const WARNING_MSG = MSG+' at line '+ lineno;
        const unwantedDirNames = ['folder', 'directory', 'dir', 'path', 'root', 'tmp', 'temp', 'temporary', 'site', 'log', 'save'];

        if(tokenType == "variable" && name != null && value != null){
            for( const dirName of unwantedDirNames){
                let re = new RegExp(`[_A-Za-z0-9-\.]*${dirName}\\b`);
                if(name.match(re) && smell.isValidPath(value)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);  
            } 
        }
        else if((tokenType == "list" || tokenType == "set") && name != null) {
            for( const dirName of unwantedDirNames){
                
                let re = new RegExp(`[_A-Za-z0-9-\.]*${dirName}\\b`);
                if(name.match(re)){
                    if(token.hasOwnProperty("values")){
                        for (const value of token.values){
                            if(smell.isValidPath(value)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                        }
                    }
                }
            }           
        }
        else if(tokenType == 'dict' && token.hasOwnProperty('pairs')){
            for(const pair in token.pairs){
                for (const dirName of unwantedDirNames){
                    let re = new RegExp(`[_A-Za-z0-9-\.]*${dirName}\\b`);
                    if(pair[0].match(re) && smell.isValidPath(pair[1])) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                }
            }
        }
        else if(tokenType == 'function_call' && token.hasOwnProperty('keywords')){
            for(const keyword in token.keywords){
                for (const dirName of unwantedDirNames){
                    let re = new RegExp(`[_A-Za-z0-9-]*${dirName}\\b`);
                    if(keyword[0].match(re) && smell.isValidPath(keyword[1])) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                }
            }
        }
    },

    isValidPath: (path) => {
        // const windowsPathRegex = '^([A-Za-z]?\:?)?\\{1,2}([A-Za-z0-9]*\\)*[A-Za-z0-9]*\\?'
        // const unixPathRegex = '^([A-Za-z0-9]?\:?)?\\{1,2}([A-Za-z0-9]*\\)*[A-Za-z0-9]*\\?'        
        const unixPathRegex = /[_A-Za-z0-9-\/\.\:]*\/{1,2}/
        // const windowsPathRegex = /[_A-Za-z0-9-\/\.\:]*\/{1,2}/
        
        // let unixRegex = new RegExp(unixPathRegex);
        // let windowsRegex = new RegExp(windowsPathRegex);
        
        if (typeof(path) != 'string') return false
        else if(path.match(unixPathRegex)) return true
        else return false
        
        // else if(windowsRegex.test(path)) return true
        
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