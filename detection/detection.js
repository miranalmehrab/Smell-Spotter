const fs = require('fs');

const exec = require('../smells/exec');
const tempdir = require('../smells/tempdir');
const cliargs = require('../smells/cliargs');
const sql = require('../smells/sqlinjection');
const httponly = require('../smells/httponly');
const debugsettrue = require('../smells/debugflag');
const ignexcept = require('../smells/ignexcept.js');
const ipbinding = require('../smells/ipbinding.js');
const nointeg = require('../smells/nointegritycheck');
const emptypassword = require('../smells/emptypassword');
const cmdinjection = require('../smells/commandinjection');
const filepermission = require('../smells/filepermission');
const hardcodedsecret = require('../smells/hardcodedsecret'); 

var detection = {

    read:(filename) => {

        fs.readFile(filename,{encoding: 'utf-8'},(err, tokens) => {    
            if (err) console.error(err);
            detection.detect(tokens);
        });
    },
    
    detect:(tokenStr) => {
        
        var tokens = tokenStr.split("{");
        tokens.map((val,index) => {
            tokens[index] = ("{"+val).trim();
        }); 
        tokens.shift();

        console.log(tokens);
        const count = tokens.length;
        console.log(count);
        
        for(let i=0;i<count;i++)
        {   
            const token = tokens[i];
            const obj = JSON.parse(token);
            console.log(obj);

            if(obj.type == "var" || obj.type == "list")
            {
                hardcodedsecret.detect(obj);
                emptypassword.detect(obj);
                tempdir.detect(obj);
            }
            else if(obj.type == "method")
            {
                cliargs.detect(obj);
                nointeg.detect(obj);
                httponly.detect(obj);
                exec.detect(obj);
                cmdinjection.detect(obj);
                sql.detect(obj);
                ipbinding.detect(obj);
                filepermission.detect(obj);
            }
            else if(obj.type == "statement")
            {
                ignexcept.detect(obj);
            }
            debugsettrue.detect(obj);
        }
        console.log('detection finished!');
        
        
    }
}

module.exports = detection;