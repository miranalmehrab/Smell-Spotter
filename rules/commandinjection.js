const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
        try{
            if(token.hasOwnProperty("name")) var name= token.name;
            if(token.hasOwnProperty("line")) var lineno = token.line;
            if(token.hasOwnProperty("type")) var tokenType = token.type;
            
            const MSG = 'possible presence of command injection'
            
            const WARNING_MSG = MSG+' at line '+ lineno;
            const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
    
            const shellFunctions = ['sys.argv', 'subprocess.Popen', 'os.system', 'os.popen','subprocess.run','popen2.Popen4',
                                    'argparse.ArgumentParser','getopt.getopt', 'os.execle','os.execl', 'popen2.Popen3'
                                ];
            
            if(tokenType == "variable" && token.hasOwnProperty("valueSrc")) {
                if(shellFunctions.includes(token.valueSrc) || smell.isExtendedShellFunction(token.valueSrc)) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            }
            else if(tokenType == "function_call" && (shellFunctions.includes(name) || smell.isExtendedShellFunction(name))) smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            else if (tokenType == "function_def" && token.hasOwnProperty('return') && token.return != null) {
                for(const funcReturn of token.return){
                    if(shellFunctions.includes(funcReturn) || smell.isExtendedShellFunction(funcReturn)) 
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                }
            }
        } catch(error){
            console.log(error);
        }
    },

    isExtendedShellFunction: functionName => {
        const shellFunctions = ['sys.argv','subprocess.Popen','os.system','os.popen','subprocess.run','argparse.ArgumentParser','getopt.getopt']
        
        for (const name of shellFunctions) {
            if(functionName.includes(name)) return true;
        }

        return false;
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