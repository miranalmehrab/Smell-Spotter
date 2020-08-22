const fs = require('fs');

const exec = require('../smells/exec');
const tempdir = require('../smells/tempdir');
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

    detect: (tokens, imports) => {
        
        tokens.pop();
        tokens.map(token => {
            
            if(token.length != 0)
            {
                try{
                    token = JSON.parse(token);
                    
                    cmdinjection.detect(token);
                    debugsettrue.detect(token);
                    emptypassword.detect(token);
                    exec.detect(token);
                    filepermission.detect(token);
                    hardcodedsecret.detect(token);
                    httponly.detect(token);
                    ignexcept.detect(token);
                    ipbinding.detect(token);
                    nointeg.detect(token, imports);
                    sql.detect(token);
                    tempdir.detect(token);
                }
                catch (error) {
                    console.log(error);
                }
            }
        });

        console.log('detection finished!');    
    }
}

module.exports = detection;