const vscode = require('vscode');
const operations = require('../smells/operations');

var smell = {

    detect : (token) => {
    
        const line = token.line;
        if(token.hasOwnProperty("method")) var method =  token.method;
        if(token.hasOwnProperty("params")) var params = token.params;
        
        if(smell.httpcall(method))
        {
            if(params)
            {
                if(!smell.tls(params[0]))
                {
                    console.log('Http without TLS!');
                    vscode.window.showWarningMessage('Http without TLS at line '+ line);
                }
        
            }
        }
    },
    httpcall: (methodname) => {
        const libs = ['httplib','urllib','requests'];
        const libname = methodname.split(".")[0];
      
        if(libs.includes(libname)) return true;
        else return false;
    },
    tls: (param) => {
        param = operations.refine(param);
        var scheme = param.split("://")[0];
        console.log(scheme);
        
        if(scheme == "https") return true;
        else return false;
    }
}

module.exports = smell;