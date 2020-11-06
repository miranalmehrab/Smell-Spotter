const vscode = require('vscode');
const { isToken } = require('typescript');

var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name = token.name;
        if (token.hasOwnProperty("value")) var value = token.value;

        const WARNING_MSG = 'possible hardcoded temporary directory at line '+ lineno;
        const unwantedDirNames = ['folder', 'directory', 'dir', 'path', 'root', 'tmp', 'temp', 'temporary', 'site', 'log', 'save'];

        if(tokenType == "variable" && name != null && value != null){
            for( const dirName of unwantedDirNames){
                let re = new RegExp(`[_A-Za-z0-9-]*${dirName}/b`);
                if(name.match(re) && this.isValidPath(value)) vscode.window.showWarningMessage(WARNING_MSG);  
            } 
        }
        else if((tokenType == "list" || tokenType == "set") && name != null) {
            for( const dirName of unwantedDirNames){
                
                let re = new RegExp(`[_A-Za-z0-9-]*${dirName}/b`);
                if(name.match(re) && this.isValidPath(value)){

                    if(token.hasOwnProperty("values")){
                        for (const value of token.values){
                    
                            if(this.isValidPath(value)) vscode.window.showWarningMessage(WARNING_MSG);
                        }
                    }
                }
            }           
        }
        else if(tokenType == 'dict' && token.hasOwnProperty('pairs')){
            for(const pair in token.pairs){
                for (const dirName of unwantedDirNames){
                    let re = new RegExp(`[_A-Za-z0-9-]*${dirName}/b`);
                    if(pair[0].match(re) && this.isValidPath(pair[1])) vscode.window.showWarningMessage(WARNING_MSG);
                }
            }
        }
        else if(tokenType == 'function_call' && token.hasOwnProperty('keywords')){
            for(const keyword in token.keywords){
                for (const dirName of unwantedDirNames){
                    let re = new RegExp(`[_A-Za-z0-9-]*${dirName}/b`);
                    if(keyword[0].match(re) && this.isValidPath(keyword[1])) vscode.window.showWarningMessage(WARNING_MSG);
                }
            }
        }
    },

    isValidPath: (path) => {
        const unixPathRegex = '^(~?((\.{1,2}|\/?)*[a-zA-Z0-9]*\/)+)[a-zA-Z0-9]*\/?'
        const windowsPathRegex = '^([A-Za-z]?\:?)?\\{1,2}([A-Za-z0-9]*\\)*[A-Za-z0-9]*\\?'
        
        let unixRegex = new RegExp(unixPathRegex);
        let windowsRegex = new RegExp(windowsPathRegex);
        
        if (path == null) return false
        else if (typeof(path) != 'string') return false
        else if(path.match(unixRegex)) return true
        else if(path.match(windowsRegex)) return true
        else return false
        
    }
}

module.exports = smell;