const vscode = require('vscode');
var operations = require('./operations');

var smell = {

    detect : (token) => {
        
        const line =  token.line;
        const type =  token.type;

        if(token.hasOwnProperty("name")) var name =  token.name;
        if(token.hasOwnProperty("value")) var value = token.value;
        if(token.hasOwnProperty("params")) var params = token.params;
        
        if(value)
        {
            console.log(name+" "+value);
            if((operations.isVarible(type) || operations.isMethod(type)) && smell.name(name) && smell.value(value))
            {
                const warning = 'possible debug set true at line '+ line;
            
                operations.writesmelllog(warning);
                vscode.window.showWarningMessage(warning);
           
            }
            
        }
        else if(params)
        {
            if(operations.isVarible(type) || operations.isMethod(type))
            {
                params.map( val => {

                    var duo = val.split("=");
                    var name = duo[0];
                    var value = duo[1];

                    console.log(name+"  "+value);
                    
                    if(smell.name(name) && smell.value(value))
                    {        
                        const warning = 'possible debug set true at line '+ line;
                    
                        operations.writesmelllog(warning);
                        vscode.window.showWarningMessage(warning);
                    }
                });
            }
        }
            
    },
    name:(name) => {
        const restrictedNames = ['debug','DEBUG','DEBUG_PROPAGATE_EXCEPTIONS'];
        return restrictedNames.includes(name);
    },
    value:(value) => {
        return value == "True";
    }
}

module.exports = smell;