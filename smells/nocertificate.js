const vscode = require('vscode');

var smell = {
    detect: (token) => {

        if (token.hasOwnProperty("line")) var lineno = token.line;
        if (token.hasOwnProperty("type")) var tokenType = token.type;
        if (token.hasOwnProperty("name")) var name = token.name;
        
        const httpLibs = ['requests.get','requests.Session.get'];
        
        if (tokenType == "function_call" && httpLibs.includes(name) && token.hasOwnProperty('keywords')) 
        {    
            var keywords = token.keywords;
            keywords.map( keyword => {
                if(keyword == 'verify' && keyword[1] == false)
                {
                    const warning = 'TLS not verified at line ' + lineno;
                    vscode.window.showWarningMessage(warning);
                }
            })            
        }
    }
}

module.exports = smell;