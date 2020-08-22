const vscode = require('vscode');
const { isToken } = require('typescript');

var smell = {

    detect : (token) => {

        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("values")) var values= token.values;
        
        const unwantedDirNames = ['hardcoded_tmp_directory','hardcoded_temp_directory'
                                ,'hardcoded_directory','tmp_dir','temp_dir','hardcoded_dir'
                                ,'temporary_directory','temporary_dir','temp_directory',
                                'dir','save_dir'];

        const unwantedValues = ['/tmp','/var/tmp','/dev/shm'];
        
        if((tokenType == "list" || tokenType == "set") && unwantedDirNames.includes(name.toLowerString())) 
        {
            if(token.hasOwnProperty('values')) var values = token.values;
            if(values.length > 0) 
            {
                const warning = 'possible hardcoded temporary directory at line '+ lineno;
                vscode.window.showWarningMessage(warning);
            }           
        }

        else if(tokenType == "variable" && unwantedDirNames.includes(name.toLowerString()) && token.value != null)
        {
            const warning = 'possible hardcoded temporary directory at line '+ lineno;
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;