var fs = require('fs');

var write = {
    save: (tokensArr,filename) => {

        fs.writeFile(filename, '', ()=>{}); //DELETES THE PREV DATA
        tokensArr.forEach(token => {
            
            const value = token.line+","+token.type+","+token.name+","+token.value+","+token.source+"\n";
            fs.appendFile(filename, value, (err) => { 
                if (err){
                    console.log(err);
                    throw err;
                }  
            })
        });
    }
}

module.exports = write;
