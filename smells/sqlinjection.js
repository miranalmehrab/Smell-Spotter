const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;
        if(token.hasOwnProperty("hasInputs")) var hasInputs= token.hasInputs;
        
        const unwantedMethods = ['execution.query', 'connection.cursor.execute'];
        
        if(tokenType == "variable" && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('args'))
        {
            var args = token['args']
            var valueSrc = token['valueSrc']

            if(unwantedMethods.includes(valueSrc.toLowerCase()) && args.length > 0)
            {
                const warning = 'possible SQL injection at line '+ lineno;
                vscode.window.showWarningMessage(warning);    
            }

        }
        else if(tokenType == "function_call" && unwantedMethods.includes(name.toLowerCase()) && args.length > 0) 
        {
            const warning = 'possible SQL injection at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;