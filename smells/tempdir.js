const vscode = require('vscode');

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
            console.log('Possible harcoded temp directory!');
            vscode.window.showWarningMessage('Possible harcoded temp directory at line -'+ line);
        }
    }
}

module.exports = smell;