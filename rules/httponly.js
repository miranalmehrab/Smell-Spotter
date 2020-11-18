const vscode = require('vscode');
const url = require('url');

var smell = {

    detect : (token) => {
    
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;

        const WARNING_MSG = 'possible use of HTTP without TLS at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? 'possible presence of HTTP without TLS at line '+ token.returnLine : null

        
        const httpLibs = [  'httplib.urlretrieve','urllib.request.urlopen','urllib.urlopen','urllib2.urlopen','requests.get', 
                            'requests.post','urllib.request.Request','httplib.HTTPConnection','httplib2.Http.request'
                        ]   

        const newHttpLibs = ['urllib3.PoolManager.request']
        
        if(token.type == 'variable' && token.value != null && token.valueSrc == 'initialization'){
            if(smell.isValidHTTPURL(token.value)) vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(token.type == 'variable' && token.hasOwnProperty('funcKeywords')){
            for(const keyword of token.funcKeywords){
                if(keyword[1] != null && smell.isValidHTTP(keyword[1])){
                    vscode.window.showWarningMessage(WARNING_MSG);
                }
            }
        }
        else if(token.type == 'variable' && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('args')){
            if(httpLibs.includes(token.valueSrc) && token.args.length > 0 && smell.isValidHTTP(args[0])){
                vscode.window.showWarningMessage(WARNING_MSG);
            }

            else if(newHttpLibs.includes(token.valueSrc) && token.args.length > 1 && smell.isValidHTTP(args[1])){
                vscode.window.showWarningMessage(WARNING_MSG);
            }
        }
        else if(token.type == 'function_call' && token.name != null){
            if(httpLibs.includes(token.name) && token.args.length > 0 && smell.isValidHTTP(args[0])){
                vscode.window.showWarningMessage(WARNING_MSG);
            }

            else if(newHttpLibs.includes(token.name) && token.args.length > 1 && smell.isValidHTTP(args[1])){
                vscode.window.showWarningMessage(WARNING_MSG);
            }
        }
        else if(token.type == 'function_def' && token.hasOwnProperty('return') && token.hasOwnProperty('returnArgs')){
            
            for(const funcReturn of token.return){
                if(httpLibs.includes(funcReturn) && token.returnArgs.length > 0 && smell.isValidHTTP(token.returnArgs[0])){
                    vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
                }
    
                else if(newHttpLibs.includes(funcReturn) && token.returnArgs.length > 1 && smell.isValidHTTP(token.returnArgs[1])){
                    vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
                }
            }

        }
    },
    isValidHTTPURL: hostURL => {
        if(typeof(hostURL) != 'string') return false
        else{ 
        
            const urlPattern = 'http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\), ]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
            let urlRegex = new RegExp(urlPattern)
            if(urlRegex.test(hostURL) == false) return false
            
            const hostURLObj = url.parse(hostURL);
            if(hostURLObj.protocol == 'http') return true
            else return false
        }
    }           
}

module.exports = smell;