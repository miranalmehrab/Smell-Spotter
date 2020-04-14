var operations = {

    isVarible: (type )=> {
        return type == "variable" ? true : false;
    },
    
    isLengthZero: (word) => {
        return word.length>0 ? false : true;
    },

    isCommonUserName: (word) => {
        
        const commonUserNames = ['user','usr','username','name'];
        const count = commonUserNames.length;
        for(let i=0;i<count;i++)
        {
            if(word.includes(commonUserNames[i])) return true;
        }
        return false;
    },
    
    isCommonPassword: (word) => {
     
        const commonPasswords = ['pass','pwd','password','pass1234'];
        const count = commonPasswords.length;
        for(let i=0;i<count;i++)
        {
            if(word.includes(commonPasswords[i])) return true;
        }
        return false;
    }
}

module.exports = operations;

