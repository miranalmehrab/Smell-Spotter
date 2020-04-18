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
    }

}

module.exports = operations;

