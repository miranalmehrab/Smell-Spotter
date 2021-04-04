const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
        try{
            if(token.hasOwnProperty("line")) var lineno = token.line;
            if(token.hasOwnProperty("type")) var tokenType = token.type;
            if(token.hasOwnProperty("name")) var name= token.name;
            if(token.hasOwnProperty("args")) var args= token.args;
            
            const MSG = 'possible harcoded ip address binding'
            const WARNING_MSG = MSG+' at line '+ lineno;
            
            const bindingMethods = ['socket.socket.bind', 'socket.socket.connect'];
            
            if(tokenType == "variable" && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('args')) {
                var args = token.args;
                var valueSrc = token.valueSrc; 

                if(bindingMethods.includes(valueSrc) && args.length > 0 && typeof(args[0]) == 'string' && smell.isValidIP(args[0])) { 
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                }
            }
            else if(tokenType == "function_call" && bindingMethods.includes(name)) {
                if(args.length > 0 && typeof(args[0]) == 'string' && smell.isValidIP(args[0])) { 
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                }       
            }
        } catch(error){
            console.log(error);
        }
    },

    isValidIP: (ip) => { 
        if (ip == '') return true
        const parts = ip.split('.')
        if (parts.length != 4) return false
        
        for (const part in parts){
            if (parseInt(part) < 0 || parseInt(part) > 255) return false
        }
        return true 
    },
 
    isValidPort: (port) => {
        if (typeof(port) == 'string' &&  /^\d+$/.test(port) == false) return false
        else if (parseInt(port) > 0 && parseInt(port) < 65536) return true
        else return false

    },
    
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        let backslashSplittedFilePathLength = fileName.split("/").length
        let filenameFromPath = fileName.split("/")[backslashSplittedFilePathLength - 1]
        
        vscode.window.showWarningMessage(MSG +" : "+ filenameFromPath+":"+lineno);
        console.log( "\u001b[1;31m"+"warning: "+MSG +"  location:"+ fileName+":"+lineno);
        fs.appendFileSync('smell-spotter/warning-logs/project_warnings.csv', fileName+" ,"+WARNING_MSG+"\n");
        
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}
module.exports = smell;