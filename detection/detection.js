const fs = require('fs');
const hardcodedsecret = require('../smells/hardcodedsecret'); 

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
            hardcodedsecret.detect(tokens[i]);
        }
    }
}

module.exports = detection;