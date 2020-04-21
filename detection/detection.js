const fs = require('fs');

const cliargs = require('../smells/cliargs');
const httponly = require('../smells/httponly');
const debugsettrue = require('../smells/debugflag');
const nointeg = require('../smells/nointegritycheck');
const emptypassword = require('../smells/emptypassword');
const hardcodedsecret = require('../smells/hardcodedsecret'); 

var detection = {

    read:(filename) => {

        fs.readFile(filename,{encoding: 'utf-8'},(err, tokens) => {    
            if (err) console.error(err);
            detection.detect(tokens);
        });
    },
    
    detect:(tokenStr) => {
        
        var tokens = tokenStr.split("<obj>");
        tokens.shift();
        const count = tokens.length;
        

        for(let i=0;i<count;i++)
        {   
            const token = tokens[i];
            const obj = JSON.parse(token);
            console.log(obj);
            
            // hardcodedsecret.detect(obj);
            // emptypassword.detect(obj);
            // debugsettrue.detect(obj);
            cliargs.detect(obj);
            //httponly.detect(obj);
            //nointeg.detect(obj);
        }
        
    }
}

module.exports = detection;