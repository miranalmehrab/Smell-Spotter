const vscode = require('vscode');
const operations = require('./operations');

var smell = {
    detect : (token) => {
    
        const line = token.line;
        if(token.hasOwnProperty("method")) var method =  token.method;
        if(token.hasOwnProperty("params")) var params = token.params;
        
        if(smell.httpcall(method))
        {
            if(params)
            {
               if(smell.checkintegrity(params[0]))
               {
                const warning = 'possible no integrity check at line '+ line;
                
                operations.writesmelllog(warning);
                vscode.window.showWarningMessage(warning);
               } 
                
            }
        }
    },
    httpcall: (methodname)=>
    {
        const libs = ['urllib.urlretrieve','urllib2.urlopen','requests.get','wget.download'];
        
        if(libs.includes(methodname)) return true;
        else return false;
    },
    checkintegrity: (param) =>{
        var download = ['iso', 'tar', 'tar.gz', 'tar.bzip2', 'zip', 'rar', 'gzip', 'gzip2', 'deb', 'rpm', 'sh', 'run', 'bin', 'exe', 'zip', 'rar', '7zip', 'msi', 'bat']
        
        var urls = operation.refine(param).split(".");
        var extension = urls[urls.length-1];
              
        if(download.includes(extension))
        {
            //check exisitng imports if haslib or pygpgme not found then tell no checking!
            console.log(extension);
        }
        return true;
        
    }
}

module.exports = smell;