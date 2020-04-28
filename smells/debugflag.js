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
            if((operations.isVarible(type) || operations.isObjectAttribute(type)) && smell.name(name) && smell.value(value))
            {
                console.log('Debug set true!');
                vscode.window.showWarningMessage('Debug set true at line '+ line);
            }
            
        }
        else if(params)
        {
            if(operations.isVarible(type) || operations.isObjectAttribute(type))
            {
                params.map((val,index) => {

                    var duo = val.split("=");
                    var name = duo[0];
                    var value = duo[1];

                    console.log(name+"  "+value);
                    
                    if(smell.name(name) && smell.value(value))
                    {
                        console.log('Debug set true!');
                        vscode.window.showWarningMessage('Debug set true at line '+ line);
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