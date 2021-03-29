const xss = require('../rules/xss');
const assert = require('../rules/assert')
const cipher = require('../rules/cipher');
const tempdir = require('../rules/tempdir');
const sql = require('../rules/sqlinjection');
const httponly = require('../rules/httponly');
const debugsettrue = require('../rules/debugflag');
const ignexcept = require('../rules/ignexcept.js');
const ipbinding = require('../rules/ipbinding.js');
const dynamiccode = require('../rules/dynamiccode');
const nointeg = require('../rules/nointegritycheck');
const emptypassword = require('../rules/emptypassword');
const cmdinjection = require('../rules/commandinjection');
const filepermission = require('../rules/filepermission');
const hardcodedsecret = require('../rules/hardcodedsecret');
const deserialization = require('../rules/datadesrialization');

var detection = {

    detect: (fileName, tokens, imports) => {
        console.log("\u001b[1;34minsecure coding practices in - "+fileName);
        tokens.pop();
        tokens.map( token => {
            if(token.length != 0){
                
                try{
                    token = JSON.parse(token);

                    assert.detect(fileName,token)        
                    cipher.detect(fileName,token);
                    cmdinjection.detect(fileName,token);
                    
                    debugsettrue.detect(fileName,token);
                    deserialization.detect(fileName,token)
                    dynamiccode.detect(fileName,token);
                    
                    emptypassword.detect(fileName,token);
                    filepermission.detect(fileName,token);
                    
                    hardcodedsecret.detect(fileName,token);
                    httponly.detect(fileName,token);
                    
                    ignexcept.detect(fileName,token);
                    ipbinding.detect(fileName,token);
                    
                    nointeg.detect(fileName,token,imports);
                    sql.detect(fileName,token);
                    tempdir.detect(fileName,token);
                    xss.detect(fileName,token);

                } catch (error) {
                    console.log(error);
                }
            }
        });
    }
}

module.exports = detection;