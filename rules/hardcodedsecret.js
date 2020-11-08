const { type } = require('os');
const vscode = require('vscode');

var smell = {
    detect : (token) => {
        
        const WARNING_MSG = 'possible hardcoded secret at line '+ token.line;
        const commonKeywords = ['user_name', 'usr', 'uid', 'userid', 'usrid', 'uname', 'usrname', 'admin_name', 'guest', 'admin', 'root_name', 'root_id', 'owner_name','owner_id','super_user', 'sup_usr',
                                'userpassword', 'usr_pass', 'usr_pwd', 'user_pass', 'password', 'usr_password', 'admin_pwd', 'pwd', 'admin_pass', 'guest_pass', 'default_pwd', 'default_pass',
                                'guest_pwd', 'admin_password', 'guest_password', 'root_password', 'root_pwd', 'root_pass', 'owner_pass', 'owner_pwd', 'owner_password', 'default_password',
                                'user_key', 'usr_key', 'secret_key', 'recaptcha_key', 'site_key', 'ssh_key', 'ssl_key', 'private_key', 'public_key', 'cryptographic_key', 'tls_key', 'tls', 'ssl',
                                'ssh_key', 'ssh_password', 'ssh_pwd', 'ssh_pass', 'site_ssh', 'crypt', 'certificate', 'user_token', 'usr_token', 'u_token', 'utoken' 
                        ];
        if(token.type == 'variable' && token.name != null && token.value != null && token.valueSrc == 'initialization'){
            for(const keyword of commonKeywords){
                if(token.name.toLowerCase().match(`[_A-Za-z0-9-\.]*${keyword}\b`) || token.name.toLowerCase().match(`\b${keyword}[_A-Za-z0-9-\.]*`)){
                    if(token.hasOwnProperty("value") && typeof(token.value) == 'string' && this.isValidHardcodedValue(token.value)){
                        vscode.window.showWarningMessage(WARNING_MSG);
                        break
                    }
                }
            }
        }
        else if(token.type == 'variable' && token.name != null && token.hasOwnProperty('funckeywords')){
            for(const funcKeyword of token.funckeywords){
                for(const keyword of commonKeywords){
                    if(funcKeyword[0].toLowerCase().match(`[_A-Za-z0-9-\.]*${keyword}\b`) && this.isValidHardcodedValue(funcKeyword[1])){
                        vscode.window.showWarningMessage(WARNING_MSG);
                        break
                    }
                }
            }
        }
        else if((token.type == 'list' || token.type == 'set') && token.name != null && token.hasOwnProperty('values')){
            for(const keyword of commonKeywords){
                if(token.name.toLowerCase().match(`[_A-Za-z0-9-\.]*${keyword}\b`)){
                    for(const value of token.values){
                        if(this.isValidHardcodedValue(value)){
                            vscode.window.showWarningMessage(WARNING_MSG)
                            break
                        }   
                    }
                }
            }
        }
        else if(token.type == 'dict' && token.hasOwnProperty('pairs')){
            for(const pair of token.pairs){
                if(pair.length == 2 && typeof(pair[0]) == 'string' && typeof(pair[1]) == 'string'){
                    for(const keyword of commonKeywords){
                        if(pair[0].toLowerCase().match(`[A-Za-z0-9-\.]*${keyword}`) && this.isValidHardcodedValue(pair[1])){
                            vscode.window.showWarningMessage(WARNING_MSG)
                            break
                        }
                    }
                }
            }   
        }
        else if(token.type == 'comparison' && token.hasOwnProperty('pairs')){
            for(const pair of token.pairs){
                if(pair.length == 2 && typeof(pair[0]) == 'string' && typeof(pair[1]) == 'string'){
                    for(const keyword of commonKeywords){
                        if(pair[0].toLowerCase() != 'key' && pair[0].toLowerCase() != 'token' && pair[0].toLowerCase().match(`[A-Za-z0-9-\.]*${keyword}`) && this.isValidHardcodedValue(pair[1])){
                            vscode.window.showWarningMessage(WARNING_MSG)
                            break
                        }
                    }
                }
            }
        }
        else if(token.type == 'fucnctio_call' && token.hasOwnProperty('keywords')){
            for(const funcKeyword of token.keywords){
                if(funcKeyword.length == 3 && typeof(funcKeyword[0]) == 'string' && typeof(funcKeyword[1]) == 'string' && funcKeyword[2] == true){
                    for(const keyword of commonKeywords){
                        if(funcKeyword[0].toLowerCase().match(`[A-Za-z0-9-\.]*${keyword}`) && this.isValidHardcodedValue(funcKeyword[1])){
                            vscode.window.showWarningMessage(WARNING_MSG)
                            break
                        }
                    }
                }
            }
        }
        else if(token.type == 'fucnctio_def' && token.hasOwnProperty('args') && token.hasOwnProperty('defaults')){
            let argsLength = token.args.length
            let defaultsLength = token.defaults.length;
            
            let args = token.args.splice(argsLength - defaultsLength, argsLength)
            let defaults = token.defaults

            for(let i = 0; i< args.length; i++){
                for (const keyword of commonKeywords){
                    let re = new RegExp(`[_A-Za-z0-9-]*${keyword}/b`);
                    if(args[i].toLowerCase().match(re) && this.isValidHardcodedValue(defaults[i])){
                        vscode.window.showWarningMessage(WARNING_MSG);
                        break
                    }
                }
            }
        }
    },

    containsSuspiciousValues: (value) => {
        const prohibitedValues = [
                        'admin', 'root', 'user', 'username', 'pwd', 'pass', 'guest', 'root_password', 'usr',
                        'userpass', 'usrpwd', 'userpassword', 'usrtoken', 'token','default', 'nopassword',
                        'defaultpass', 'password', 'guest', 'root1', 'user root'
                ]

        for(const prohibitedValue of prohibitedValues){
            if(value.includes(prohibitedValue)) return true
        }
        return false
    },

    isValidHardcodedValue: (value) => {
        const value_reg_pattern = '([A-Za-z]*([0-9]+|[!\?@#\$%\^&\*\(\)\{\}\[\]_=?<>:\.\'\"-\+\/]+))+([A-Za-z]*([0-9]*|[!\?@#\$%\^&\*\(\)\{\}\[\]_=?<>:\.\'\"-\+\/]*))*'
        if(typeof(value) == 'string'){    
            if(value.length == 0) return false
            else if(value.match(value_reg_pattern)) return true
            else if(value.match('\\+')) return false
            else if(value.match('([!\?@#\$%\^&\*\(\)\{\}\[\]_=?<>:\'\"-\+\/\.]+)')) return true
            else if(this.containsSuspiciousValues(value)) return false
            else return false
        }

        else return false
    }
}

module.exports = smell;