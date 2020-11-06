const vscode = require('vscode');

var smell = {
    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name = token.name;
        if(token.hasOwnProperty("value")) var value = token.value;
        if(token.hasOwnProperty("valueSrc")) var valueSrc = token.valueSrc;
        const WARNING_MSG = 'possible hardcoded secret at line '+ lineno;
        const commonKeywords = ['key','id', 'cert', 'root','passno','pass-no', 'pass_no', 'auth_token', 'authetication_token','auth-token',
                                'authentication-token', 'user', 'uname', 'username', 'user-name', 'user_name', 'owner-name', 'owner_name',
                                'owner', 'admin', 'login', 'pass', 'pwd', 'password', 'passwd', 'secret', 'uuid', 'crypt', 'certificate', 
                                'userid', 'loginid', 'token', 'ssh_key', 'md5', 'rsa', 'ssl_content', 'ca_content', 'ssl-content', 'ca-content', 
                                'ssh_key_content', 'ssh-key-content', 'ssh_key_public', 'ssh-key-public', 'ssh_key_private', 'ssh-key-private', 
                                'ssh_key_public_content', 'ssh_key_private_content', 'ssh-key-public-content', 'ssh-key-private-content'
                            ];

        const commonPasswords = ['password','passwords','pass','pwd','userpassword','userpwd', 'userpass','pass_no', 'pass-no', 'user-pass', 'upass'];
        
        if(tokenType == "variable" && valueSrc == "initialization" && (commonKeywords.includes(name) || commonPasswords.includes(name)) && value != null)
        {
            vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if((tokenType == "list" || tokenType == "set") && token.hasOwnProperty("values"))
        {
            if(commonKeywords.includes(name.toLowerCase()) || commonPasswords.includes(name.toLowerCase()) && (token.values).length > 0)
            {

                vscode.window.showWarningMessage(WARNING_MSG);
            } 
        }
        else if(tokenType == "dict" && token.hasOwnProperty("keys"))
        {
            if((commonKeywords.includes(name.toLowerCase()) || commonPasswords.includes(name.toLowerCase())) && (token.keys).length > 0)
            {

                vscode.window.showWarningMessage(WARNING_MSG);    
            }
            token.keys.map(key => {
                if(commonKeywords.includes(key.toLowerCase()) || commonPasswords.includes(key.toLowerCase())){ 
    
                    vscode.window.showWarningMessage(WARNING_MSG);
                }
            }) 
        }
        else if(tokenType == "function_call" && token.hasOwnProperty('keywords'))
        {
            token.keywords.map( keyword => {
                if(keyword.length == 2 && (commonPasswords.includes(keyword[0].toLowerCase()) || commonKeywords.includes(keyword[0].toLowerCase())) && keyword[1].length > 0)
                {
    
                    vscode.window.showWarningMessage(WARNING_MSG);
                }
            })
        }

        else if(tokenType == "function_def" && token.hasOwnProperty("args") && token.hasOwnProperty("defaults"))
        {
            var args = token.args;
            var defaults = token.defaults;

            args.map((arg, index) => {
                if((commonKeywords.includes(arg.toLowerCase()) || commonPasswords.includes(arg.toLowerCase())) && defaults[index].length > 0)
                {
    
                    vscode.window.showWarningMessage(WARNING_MSG);
                }     
            })
        }
            
        else if(tokenType == "comparison"){

            if(token.hasOwnProperty("pairs")) var pairs = token.pairs;
            
            Object.values(pairs).map(pair => {
                if(pair.length == 2 && (commonKeywords.includes(pair[0].toString()) || commonPasswords.includes(pair[0].toString())) && (pair[1].toString()).length > 0){

    
                    vscode.window.showWarningMessage(WARNING_MSG);
                }
                else if(pair.length == 2 && (commonKeywords.includes(pair[1].toString()) || commonPasswords.includes(pair[1].toString())) && (pair[0].toString()).length > 0){

    
                    vscode.window.showWarningMessage(WARNING_MSG);
                }
            });  
        }
    }
}

module.exports = smell;