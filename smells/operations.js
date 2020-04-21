var operations = {

    isVarible: (type )=> {
        return type == "var" ? true : false;
    },
    isObjectAttribute:(type) => {
        return type == "obj" ? true : false;
    },
    isDictionaryKey:(type) => {
        return type == "key" ? true : false;
    },
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
    isLengthZero: (word) => {
        return word.length>0 ? false : true;
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
    }

}

module.exports = operations;

