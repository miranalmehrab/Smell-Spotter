const fs = require('fs');
const xss = require('../rules/xss');
const assert = require('../rules/assert')
const yaml = require('../rules/yamlload'); 
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
const igncertificate = require('../rules/nocertificate');
const filepermission = require('../rules/filepermission');
const hardcodedsecret = require('../rules/hardcodedsecret');
const deserialization = require('../rules/datadesrialization');

var detection = {

    detect: (fileName, tokens, imports) => {
        try{
            if (!fs.existsSync('smell-spotter/warning-logs/')){
                fs.mkdirSync('smell-spotter/warning-logs/');
            }
        }catch(error){
            console.log(error);            
        }

        console.log("\u001b[1;34minsecure coding practices in - "+fileName);
        fs.appendFileSync('smell-spotter/warning-logs/project_warnings.csv', "filename : "+fileName+"\n");

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
                    igncertificate.detect(fileName, token);
                    
                    nointeg.detect(fileName,token,imports);
                    sql.detect(fileName,token);
                    tempdir.detect(fileName,token);
                    xss.detect(fileName,token);
                    
                    yaml.detect(fileName,token);

                } catch (error) {
                    console.log(error);
                }
            }
        });

        console.log("");
    }
}

module.exports = detection;