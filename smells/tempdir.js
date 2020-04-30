const vscode = require('vscode');
const operations = require('./operations');

var smell = {

    detect : (token) => {

        const name = token.name;
        const line =  token.line;
        const value = token.value;
        
        const unwantednames = ['hardcoded_tmp_directory','hardcoded_temp_directory'
                                ,'hardcoded_directory','tmp_dir','temp_dir','hardcoded_dir'
                                ,'temporary_directory','temporary_dir','temp_directory',
                                'dir','save_dir'];

        const unwantedvalues = ['/tmp','/var/tmp','/dev/shm'];
        
        if(unwantednames.includes(name))
        {
            const warning = 'possible hardcoded temporary directory at line '+ line;
            
            operations.writesmelllog(warning);
            vscode.window.showWarningMessage(warning);
        }
    }
}

module.exports = smell;