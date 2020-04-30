var fs = require('fs');
const warninglog = __dirname+"/../parse/output/log.txt";


var operations = {

    isVarible: type => type == "var" ? true : false,
    isMethod:type => type == "method" ? true : false,
    isDictionaryKey: type => type == "key" ? true : false,

    isCommonUserName: (name) => {
        
        const commonUserNames = ['user','usr','username','name'];
        return commonUserNames.includes(name);
    },
    
    isCommonPassword: (name) => {
        const commonPasswords = ['pass','pwd','password','pass1234'];
        return commonPasswords.includes(name);
    },

    isCommonIDName:() => {
        
    },

    isCommonTokenName:() => {

    },

    isCommonKeyName:() => {

    },

    isLengthZero: word => word.length>0 ? false : true,
    removebracket: (param) =>
    {   
        const paramelength = param.length;
        
        let dummy = "";
        const first = param[0];
        const last = param[paramelength-1];
        const brackets = ['(',')','{','}','[',']'];
        
        if(!brackets.includes(first)) dummy = first;
        for(let i=1;i<paramelength-1;i++)
        {
            dummy = dummy+param[i];
        }
        if(!brackets.includes(last)) dummy += last;
        return dummy;

    },
    refine: (word) => {

        const charLength = word.length;
        const unwantedChars = ["'",'"'];
        const unwantedCharsCount = unwantedChars.length;

        for(let i=0;i<charLength;i++)
        {
            for(let j=0;j<unwantedCharsCount;j++){
                const unwanted = unwantedChars[j];
                if(word.includes(unwanted)) word = word.replace(unwanted,'');
            }
        }
        return word;
    },
    writesmelllog: warning => {
        fs.appendFileSync(warninglog,warning+"\n",'utf-8');
    },
    clearsmelllog: () => {
        fs.writeFileSync(warninglog,'');
    }
}

module.exports = operations;

