const vscode = require('vscode');

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
        
        if(tokenType == "list" && unwantedDirNames.includes(name)) {
            
            values.map(value => {
                
                if(unwantedValues.includes(value))
                {
                    const warning = 'possible hardcoded temporary directory at line '+ lineno;
                    vscode.window.showWarningMessage(warning);
                }
            });
            
        }
    }
}

module.exports = smell;