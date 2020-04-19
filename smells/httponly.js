const vscode = require('vscode');

var smell = {

    detect : (token) => {
    
        const line = token.line;
        if(token.hasOwnProperty("method")) var method =  token.method;
        if(token.hasOwnProperty("params")) var params = token.params;
        
        if(smell.httpcall(method))
        {
            if(params!=undefined && smell.hasVerify(params))
            {
                params.map((val) => {
                
                    if(val.includes("="))
                    {
                        let name = val.split("=")[0];
                        let value = val.split("=")[1];
                    
                        if(!smell.TLSUsed(name,value))
                        {
                            console.log('Http without TLS!');
                            vscode.window.showWarningMessage('Http without TLS at line '+ line);
                        }
                    }
                });
            }
            else{
                console.log('Http without TLS!');
                vscode.window.showWarningMessage('Http without TLS at line '+ line);        
            }
        }
    },
    httpcall: (methodname)=>
    {
        const libs = ['httplib','urllib','requests'];
        const libname = methodname.split(".")[0];
      
        if(libs.includes(libname)) return true;
        else return false;
    },
    TLSUsed: (param,value) => 
    {
        const params = ['verify'];

        if(params.includes(param) && value=="False") return false;
        else return true;
    },
    hasVerify:(params) => {
        
        var found = false;      
        params.map( val => {
            
            if(val.includes("=")) {
                let name = val.split("=")[0];
                if(name == "verify") 
                {
                    console.log("name found!");
                    found = true;
                }
            }
        });
        
        //console.log("found = "+found);
        return found;
    }
}

module.exports = smell;