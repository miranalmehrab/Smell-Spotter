const fs = require('fs');
const url = require('url');
const vscode = require('vscode');

var smell = {

    detect : (token) => {
    
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("args")) var args = token.args;

        const WARNING_MSG = 'possible use of HTTP without TLS at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? 'possible presence of HTTP without TLS at line '+ token.returnLine : null

        
        const httpLibs = [  'httplib.urlretrieve','urllib.request.urlopen','urllib.urlopen','urllib2.urlopen','requests.get', 
                            'requests.post','urllib.request.Request','httplib.HTTPConnection','httplib2.Http.request'
                        ]

        const newHttpLibs = ['urllib3.PoolManager.request']
        
        if(token.type == 'variable' && token.value != null && token.valueSrc == 'initialization'){
            if(smell.isValidHTTPURL(token.value)) vscode.window.showWarningMessage(WARNING_MSG);
        }
        if(token.type == 'variable' && token.hasOwnProperty('funcKeywords')){
            
            token.funcKeywords.forEach(keyword => {
                if(keyword[1] != null && smell.isValidHTTPURL(keyword[1])){
                    vscode.window.showWarningMessage(WARNING_MSG);
                }
            })
        }
        if(token.type == 'variable' && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('args')){
            if(httpLibs.includes(token.valueSrc) && token.args.length > 0 && smell.isValidHTTPURL(token.args[0])){
                vscode.window.showWarningMessage(WARNING_MSG);
            }

            else if(newHttpLibs.includes(token.valueSrc) && token.args.length > 1 && smell.isValidHTTPURL(token.args[1])){
                vscode.window.showWarningMessage(WARNING_MSG);
            }
        }
        else if(token.type == 'function_call' && token.name != null){
            if(httpLibs.includes(token.name) && token.args.length > 0 && smell.isValidHTTPURL(args[0])){
                vscode.window.showWarningMessage(WARNING_MSG);
            }

            else if(newHttpLibs.includes(token.name) && token.args.length > 1 && smell.isValidHTTPURL(args[1])){
                vscode.window.showWarningMessage(WARNING_MSG);
            }
        }
        else if(token.type == 'function_def' && token.hasOwnProperty('return') && token.hasOwnProperty('returnArgs')){
            
            for(const funcReturn of token.return){
                if(httpLibs.includes(funcReturn) && token.returnArgs.length > 0 && smell.isValidHTTPURL(token.returnArgs[0])){
                    vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
                }
    
                else if(newHttpLibs.includes(funcReturn) && token.returnArgs.length > 1 && smell.isValidHTTPURL(token.returnArgs[1])){
                    vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
                }
            }

        }
    },
    isValidHTTPURL: hostURL => {
        if(typeof(hostURL) == 'string'){

            const urlPattern = 'http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\), ]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
            let urlRegex = new RegExp(urlPattern)

            console.log(urlRegex.test(hostURL))

            if(urlRegex.test(hostURL) == false) return false
            
            const hostURLObj = url.parse(hostURL)
            console.log(hostURLObj.protocol);
            if(hostURLObj.protocol == 'http:') return true
            else return false

        }
        else return false
    }      ,
    
    triggerAlarm: (fileName, WARNING_MSG) => {
        vscode.window.showWarningMessage(WARNING_MSG);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }     
}

module.exports = smell;