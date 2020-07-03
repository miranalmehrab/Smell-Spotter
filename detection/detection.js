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

    detect: (tokens) => {
        tokens.pop();
        console.log(tokens);


        try {
            tokens.map((token, index) => {

                if (token != "") {
                    token = JSON.parse(token);

                    // cliargs.detect(token);
                    // cmdinjection.detect(token);
                    // debugsettrue.detect(token);
                    // emptypassword.detect(token);
                    // exec.detect(token);
                    // filepermission.detect(token);
                    // hardcodedsecret.detect(token);
                    // httponly.detect(token);
                    // ignexcept.detect(token);
                    // ipbinding.detect(token);
                    // nointeg.detect(token);
                    // sql.detect(token);
                    tempdir.detect(token);
                    

                    
                }
            });
            console.log('detection finished!');
        }
        catch (error) {
            console.log(error);
        }
    }
}

module.exports = detection;