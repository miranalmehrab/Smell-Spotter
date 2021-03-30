const fs = require('fs');
const vscode = require('vscode');

var smell = {
    detect : (fileName, token) => {
        let lineno = token.line;
        const MSG = 'possible hardcoded secret'
        const WARNING_MSG = MSG+' at line '+ lineno;
        
        const commonKeywords = [    
                            'user_name', 'usr', 'userid', 'usrid', 'username','uname', 'usrname', 'admin_name', 'guest', 'admin', 'root_name', 'root_id', 'owner_name','owner_id','super_user', 'sup_usr',
                            'userpassword', 'usr_pass', 'usr_pwd', 'user_pass', 'password', 'usr_password', 'admin_pwd', 'pwd', 'admin_pass', 'guest_pass', 'default_pwd', 'default_pass',
                            'guest_pwd', 'admin_password', 'guest_password', 'root_password', 'root_pwd', 'root_pass', 'owner_pass', 'owner_pwd', 'owner_password', 'default_password',
                            'user_key', 'usr_key', 'secret_key', 'recaptcha_key', 'site_key', 'ssh_key', 'ssl_key', 'private_key', 'public_key', 'cryptographic_key', 'tls_key', 'tls', 'ssl',
                            'ssh_key', 'ssh_password', 'ssh_pwd', 'ssh_pass', 'site_ssh', 'crypt', 'certificate', 'user_token', 'usr_token', 'u_token', 'utoken', 'secrete', 'token', 'passwd'
                        ]

        if(token.type == 'variable' && token.name != null && token.value != null && token.valueSrc == 'initialization'){
            for(const keyword of commonKeywords){
                let prefixMatch = new RegExp(`\\b${keyword}[_A-Za-z0-9-\.]*`)
                let suffixMatch = new RegExp(`[_A-Za-z0-9-\.]*${keyword}\\b`)
                
                if(prefixMatch.test(token.name.toLowerCase()) || suffixMatch.test(token.name.toLowerCase())){
                    
                    if(token.hasOwnProperty("value") && smell.isValidHardcodedValue(token.value)){
                        smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);;
                        break
                    }
                }
            }
        }
        
        if(token.type == 'variable' && token.hasOwnProperty('funcKeywords')){
            token.funcKeywords.forEach( funcKeyword => {
                for(const keyword of commonKeywords){
                    
                    let prefixMatch = new RegExp(`\\b${keyword}[_A-Za-z0-9-\.]*`)
                    let suffixMatch = new RegExp(`[_A-Za-z0-9-\.]*${keyword}\\b`)

                    if((suffixMatch.test(funcKeyword[0].toLowerCase()) || prefixMatch.test(funcKeyword[0].toLowerCase())) && smell.isValidHardcodedValue(funcKeyword[1])){
                        smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);;
                        break
                    }
                }
            })
        }
        else if((token.type == 'list' || token.type == 'set') && token.name != null && token.hasOwnProperty('values')){
            for(const keyword of commonKeywords){
                
                let prefixMatch = new RegExp(`\\b${keyword}[_A-Za-z0-9-\.]*`)
                let suffixMatch = new RegExp(`[_A-Za-z0-9-\.]*${keyword}\\b`)

                if(prefixMatch.test(token.name.toLowerCase()) || suffixMatch.test(token.name.toLowerCase())){
                    for(const value of token.values){
                        if(smell.isValidHardcodedValue(value)){
                            smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
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
                        if(pair[0].toLowerCase().match(`[A-Za-z0-9-\.]*${keyword}\\b`) && smell.isValidHardcodedValue(pair[1])){
                            smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
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
                        if(pair[0].toLowerCase() != 'key' && pair[0].toLowerCase() != 'token' && pair[0].toLowerCase().match(`[A-Za-z0-9-\.]*${keyword}\\b`) && smell.isValidHardcodedValue(pair[1])){
                            smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                            break
                        }
                    }
                }
            }
        }
        else if(token.type == 'function_call' && token.hasOwnProperty('keywords')){
            for(const funcKeyword of token.keywords){
                for(const commonKeyword of commonKeywords){
                    // console.log({"funckeywords: " : funcKeyword}); 
                    let prefixMatch = new RegExp(`\\b${commonKeyword}[_A-Za-z0-9-\.]*`)
                    let suffixMatch = new RegExp(`[_A-Za-z0-9-\.]*${commonKeyword}\\b`)
                
                    if((prefixMatch.test(funcKeyword[0].toLowerCase()) || suffixMatch.test(funcKeyword[0].toLowerCase())) && smell.isValidHardcodedValue(funcKeyword[1])){
                        smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                        break
                    }
                }
            }
        }
        else if(token.type == 'function_def' && token.hasOwnProperty('args') && token.hasOwnProperty('defaults')){
            
            let argsLength = token.args.length;
            let defaultsLength = token.defaults.length;
            
            let args = token.args.slice(argsLength - defaultsLength, argsLength)
            let defaults = token.defaults

            for(let i = 0; i< args.length; i++){
                for (const keyword of commonKeywords){

                    let prefixMatch = new RegExp(`\\b${keyword}[_A-Za-z0-9-\.]*`)
                    let suffixMatch = new RegExp(`[_A-Za-z0-9-\.]*${keyword}\\b`)
                    
                    // console.log(prefixMatch.test(args[i].toLowerCase()))
                    // console.log(suffixMatch.test(args[i].toLowerCase()))

                    if((prefixMatch.test(args[i].toLowerCase()) || suffixMatch.test(args[i].toLowerCase())) && smell.isValidHardcodedValue(defaults[i][0]) && defaults[i][1] == true){
                        smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
                        break
                    }
                }
            }
        }
    },

    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        let backslashSplittedFilePathLength = fileName.split("/").length
        let filenameFromPath = fileName.split("/")[backslashSplittedFilePathLength - 1]
        
        vscode.window.showWarningMessage(MSG +" : "+ filenameFromPath+":"+lineno);
        console.log( "\u001b[1;31m"+"warning: "+MSG +"  location:"+ fileName+":"+lineno);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n");


        // console.log("warning: "+MSG +"  location:"+ fileName+":"+lineno);
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    },   

    containsSuspiciousValues: (value) => {
        const prohibitedValues = ['admin', 'root', 'user', 'username', 'pwd', 'pass', 'guest', 'root_password', 'usr', 'passwd', 'password', 'secret', 'secrete', 'key' ]

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
            else if(smell.containsSuspiciousValues(value)) return true
            else return false
        }

        else return false
    }
}

module.exports = smell;