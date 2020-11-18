const { log } = require('console');
const { type } = require('os');
const vscode = require('vscode');

var smell = {
    detect : (token) => {
        
        const WARNING_MSG = 'possible hardcoded secret at line '+ token.line;
        const commonKeywords = [    'user', 'usr', 'guest', 'admin', 'root', 'owner', 'uid', 'uname', 'password','pwd',
                                    '_key', 'tls','ssl','ssh', 'crypt', 'certificate', 'token', 'id', 'default'     ]

        if(token.type == 'variable' && token.name != null && token.value != null && token.valueSrc == 'initialization'){
            for(const keyword of commonKeywords){
                let prefixMatch = new RegExp(`\\b${keyword}[_A-Za-z0-9-\.]*`)
                let suffixMatch = new RegExp(`[_A-Za-z0-9-\.]*${keyword}\\b`)
                
                if(prefixMatch.test(token.name.toLowerCase()) || suffixMatch.test(token.name.toLowerCase())){
                    
                    if(token.hasOwnProperty("value") && smell.isValidHardcodedValue(token.value)){
                        vscode.window.showWarningMessage(WARNING_MSG);
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
                        vscode.window.showWarningMessage(WARNING_MSG);
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
                        if(pair[0].toLowerCase().match(`[A-Za-z0-9-\.]*${keyword}\\b`) && smell.isValidHardcodedValue(pair[1])){
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
                        if(pair[0].toLowerCase() != 'key' && pair[0].toLowerCase() != 'token' && pair[0].toLowerCase().match(`[A-Za-z0-9-\.]*${keyword}\\b`) && smell.isValidHardcodedValue(pair[1])){
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
                        if(funcKeyword[0].toLowerCase().match(`[A-Za-z0-9-\.]*${keyword}\\b`) && smell.isValidHardcodedValue(funcKeyword[1])){
                            vscode.window.showWarningMessage(WARNING_MSG)
                            break
                        }
                    }
                }
            }
        }
        else if(token.type == 'function_def' && token.hasOwnProperty('args') && token.hasOwnProperty('defaults')){
            let argsLength = token.args.length
            let defaultsLength = token.defaults.length;
            
            let args = token.args.splice(argsLength - defaultsLength, argsLength)
            let defaults = token.defaults

            for(let i = 0; i< args.length; i++){
                for (const keyword of commonKeywords){

                    let prefixMatch = new RegExp(`\\b${keyword}[_A-Za-z0-9-\.]*`)
                    let suffixMatch = new RegExp(`[_A-Za-z0-9-\.]*${keyword}\\b`)
                    
                    console.log(prefixMatch.test(args[i].toLowerCase()))
                    console.log(suffixMatch.test(args[i].toLowerCase()))

                    if((prefixMatch.test(args[i].toLowerCase()) || suffixMatch.test(args[i].toLowerCase())) && smell.isValidHardcodedValue(defaults[i][0]) && defaults[i][1] == true){
                        vscode.window.showWarningMessage(WARNING_MSG);
                        break
                    }
                }
            }
        }
    },

    containsSuspiciousValues: (value) => {
        const prohibitedValues = ['admin', 'root', 'host', 'user', 'username', 'pwd', 'pass', 'guest', 'usr','token','default','password' ]

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