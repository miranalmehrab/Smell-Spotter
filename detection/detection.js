const fs = require('fs');

const assert = require('../rules/assert')
const xss = require('../rules/xss');
const cipher = require('../rules/cipher');
const deserialization = require('../rules/datadesrialization');
const dynamiccode = require('../rules/dynamiccode');
const tempdir = require('../rules/tempdir');
const sql = require('../rules/sqlinjection');
const httponly = require('../rules/httponly');
const debugsettrue = require('../rules/debugflag');
const ignexcept = require('../rules/ignexcept.js');
const ipbinding = require('../rules/ipbinding.js');
const nointeg = require('../rules/nointegritycheck');
const emptypassword = require('../rules/emptypassword');
const cmdinjection = require('../rules/commandinjection');
const filepermission = require('../rules/filepermission');
const hardcodedsecret = require('../rules/hardcodedsecret');

var detection = {

    detect: (fileName, tokens, imports) => {
        
        tokens.pop();
        tokens.map(token => {
            
            if(token.length != 0)
            {
                try{
                    token = JSON.parse(token);

                    // assert.detect(token)        
                    // cipher.detect(token);
                    // cmdinjection.detect(token);
                    // debugsettrue.detect(token);
                    // emptypassword.detect(token);
                    // dynamiccode.detect(token);
                    // deserialization.detect(token)
                    // filepermission.detect(token);
                    // httponly.detect(token);
                    // ignexcept.detect(token);
                    // ipbinding.detect(token);
                    // nointeg.detect(token, imports);
                    
                    // sql.detect(token);
                    // tempdir.detect(token);
                    
                    // xss.detect(token);
                    hardcodedsecret.detect(fileName, token);
                }
                catch (error) {
                    console.log(error);
                }
            }
        });
    }
}

module.exports = detection;