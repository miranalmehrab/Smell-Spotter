const fs = require('fs');
const vscode = require('vscode');


var smell = {

    detect : (fileName, token) => {
        try{
            if(token.hasOwnProperty("line")) var lineno = token.line;
            if(token.hasOwnProperty("type")) var tokenType = token.type;
            
            const MSG = 'possible use of empty password'
            
            const WARNING_MSG = MSG+' at line '+ lineno;
            const commonPasswords = ['password','pwd','userpassword','userpwd', 'userpass', 'pass_no', 'pass-no','user-pass', 'upass', 'user_pass', 'u_pass',  
                                    'usr_pwd','usr_pass', 'usr-pass','userpasswords', 'user-passwords', 'user-password', 'user_password', 'use_pass','user_pwd'
                                ]
    
            if(token.type == "variable" && token.name != null && (token.value == null || token.value.length == 0) && token.valueSrc == 'initialization'){
                for(const pwd of commonPasswords){
                    let prefixMatch = new RegExp(`\\b${pwd}[_A-Za-z0-9-]*`);
                    let suffixMatch = new RegExp(`[_A-Za-z0-9-]*${pwd}\\b`);
    
                    if(token.name.toLowerCase().match(prefixMatch)) {
                        smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                        break
                    }
                    else if(token.name.toLowerCase().match(suffixMatch)){ 
                        smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                        break
                    }
                }
            }    
            
            else if(token.type == 'dict' && token.hasOwnProperty('pairs')){
                
                token.pairs.forEach( pair => {
                    for (const pwd of commonPasswords){
    
                        let suffixMatch = new RegExp(`[_A-Za-z0-9-]*${pwd}\\b`);
                        
                        if(pair[0].toLowerCase().match(suffixMatch) && (pair[1] == null || pair[1].length == 0)){
                            smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                            break
                        } 
                    }
                })
            } 
    
            else if(tokenType == 'comparison' && token.hasOwnProperty('pairs')){
                token.pairs.forEach( pair => {
                    for (const pwd of commonPasswords){
            
                        let re = new RegExp(`[_A-Za-z0-9-]*${pwd}\\b`);
                        if(pair[0].toLowerCase().match(re) && (pair[1] == null || pair[1].length == 0)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                    }
                })
            }
            else if(tokenType == 'function_def' && token.hasOwnProperty('args') && token.hasOwnProperty('defaults')){
                let argsLength = token.args.length
                let defaultsLength = token.defaults.length;
                
                let args = token.args.slice(argsLength - defaultsLength, argsLength)
                let defaults = token.defaults
    
                for(let i = 0; i< args.length; i++){
                    for (const pwd of commonPasswords){
            
                        let re = new RegExp(`[_A-Za-z0-9-]*${pwd}\\b`);
                        if(args[i].toLowerCase().match(re) && (defaults[i][0] == null || defaults[i][0].length == 0) && defaults[i][1] == true) 
                            smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                    }
                }  
            }
            else if(token.type == 'function_call' && token.hasOwnProperty('keywords')){
                
                token.keywords.forEach( keyword => {
                    for(const pwd of commonPasswords){
    
                        let re = new RegExp(`[_A-Za-z0-9-]*${pwd}\\b`)
                        if(token.keywords.length == 3 && keyword[0].match(re) && (keyword[1][0] == null || keyword[1][0].length == 0) && keyword[1][1] == true){
                            smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                            break
                        }   
                    }
                })
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
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+" ,"+WARNING_MSG+"\n");
        
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;