const fs = require('fs');
const hardcodedsecret = require('../smells/hardcodedsecret'); 
const debugsettrue = require('../smells/debugflag');

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
        
        console.log(tokens);
        const count = tokens.length;

        for(let i=0;i<count;i++)
        {
            const token = tokens[i];
            const obj = JSON.parse(token);
            console.log(obj);
            
            hardcodedsecret.detect(obj);
            debugsettrue.detect(obj);

        }
    }
}

module.exports = detection;