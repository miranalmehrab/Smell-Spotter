const vscode = require('vscode');

var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;

        const unwantedMethods = ['socket.socket.bind'];
         
        if(tokenType == "variable" && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('args'))
        {
            var args = token.args;
            var valueSrc = token.valueSrc; 

            if(unwantedMethods.includes(valueSrc) && args.length > 0 && this.is_valid_ip(args[0]))
            {
                const warning = 'possible harcoded ip address binding at line '+ lineno; 
                vscode.window.showWarningMessage(warning);
            }
        }
        else if(tokenType == "function_call" && unwantedMethods.includes(name))
        {
            if(args.length > 0 && this.is_valid_ip(args[0]))
            {
                const warning = 'possible harcoded ip address binding at line '+ lineno; 
                vscode.window.showWarningMessage(warning);
            }       
        }
    },
    is_valid_ip: (ip) => {
        var parts = ip.split('.')
        if(parts.length != 4) return false
        
        parts.map(part => {
            if(parseInt(part) < 0 || parseInt(part) > 255) return false
        })     
        return true    
    }
}

module.exports = smell;