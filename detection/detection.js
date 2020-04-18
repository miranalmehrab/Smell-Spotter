const fs = require('fs');
const hardcodedsecret = require('../smells/hardcodedsecret'); 
const debug = require('../smells/debugflag');

var detection = {

    read:(filename) => {

        fs.readFile(filename,{encoding: 'utf-8'},(err, tokens) => {    
            if (err) console.error(err);
            detection.detect(tokens);
        });
    },
    
    detect:(tokenStr) => {
        
        const tokens = tokenStr.split("\n");
        const count = tokens.length;

        for(let i=0;i<count;i++)
        {
            const token = tokens[i];
            
            hardcodedsecret.detect(token);
            debug.detect(token);

        }
    }
}

module.exports = detection;