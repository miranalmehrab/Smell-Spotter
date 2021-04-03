const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
        try{
            if(token.hasOwnProperty("name")) var name = token.name;
            if(token.hasOwnProperty("line")) var lineno = token.line;
            if(token.hasOwnProperty("type")) var tokenType = token.type;
    
            const MSG = 'possible bad file permission'
            
            const WARNING_MSG = MSG+' at line '+ lineno;
            const unwantedMethods = ['os.chmod','chmod'];
            
            if(tokenType == "function_call" && unwantedMethods.includes(name.toLowerCase())) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            
            else if(tokenType == "function_call" && name.toLowerCase() == "subprocess.call" && token.args.length > 0) {
                for(const arg of token.args){
                    if(unwantedMethods.includes(arg))
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
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
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+" ,"+WARNING_MSG+"\n");
        
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;