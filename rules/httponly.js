const vscode = require('vscode');

var smell = {

    detect : (token) => {
    
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;
        const WARNING_MSG = 'possible use of HTTP without TLS at line '+ lineno;
        const httpLibs = ['httplib.urlretrieve', 'urllib', 'requests.get'];

        if(tokenType == "function_call" && httpLibs.includes(name) && args[0] != null && args[0].split("://")[0] != "https") 
        {
            vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == "variable" && token.hasOwnProperty("valueSrc") && token.hasOwnProperty("args"))
        {
            var args = token.args;
            var valueSrc = token.valueSrc;

            if(httpLibs.includes(valueSrc) && args.lenght > 0 && args[0].split("://")[0] != "https")
            {   

                vscode.window.showWarningMessage(WARNING_MSG);
            }
        }
    }           
}

module.exports = smell;