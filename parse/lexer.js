var fs = require('fs');

var lexer = {

    run: (pcode)=>{
        
        let tokens = [];
        let lines = pcode.split("\n"); 
        const lineCount = lines.length;
        
        for(let i=0;i<lineCount;i++){
            
            const line = lines[i];
            
            if(line.split(' ')[0] == "import")
            {
                let importsObj = {};
                importsObj['line'] = i+1;
                importsObj['type'] = 'import';
                
                var indexOfFirstSpace = line.indexOf(" ");
                var libs = line.slice(indexOfFirstSpace);
                
                if(libs.includes(",")) libs = libs.split(",");
                for(let j=0;j<libs.length;j++)
                {
                    libs[j] = libs[j].trim();
                    let val = libs[j];

                    if(val.includes("as"))
                    {
                        let libname = val.split("as")[0].trim();
                        let aliasname = val.split("as")[1].trim();
                        importsObj[aliasname] = libname;
                    }
                    else importsObj[val] = val;    
                }
                tokens.push(importsObj);
            }
            else if(line.split(' ')[0] == "from" && line.includes("import"))
            {
                let importsObj = {};
                importsObj['line'] = i+1;
                importsObj['type'] = 'import';
                
                let modulename = line.split("import")[0];
                modulename = modulename.split("from")[1].trim();

                importsObj['module'] = modulename;

                let funcnames = line.split("import")[1];
                if(funcnames.includes(","))funcnames = funcnames.split(",");
                
                for(let j=0;j<funcnames.length;j++)
                {
                    funcnames[j] = funcnames[j].trim();
                    var val = funcnames[j];

                    if(val.includes("as"))
                    {
                        var libname = val.split("as")[0].trim();
                        var aliasname = val.split("as")[1].trim();
                        importsObj[aliasname] = modulename+'.'+libname;
                    }
                    else importsObj[val] = modulename+'.'+val;
                }

                console.log(importsObj);
                tokens.push(importsObj);

            }
            else if(line.split(' ').includes("="))
            {
                const words = line.split('=');
                
                var type = 'var';
                var name = words[0].trim();
                var value = words[1].trim();
                var valsrc = "initialized";

                const re = /input\(+[\s\S]+\)/g;
                
                if(re.test(value))var valsrc = "user input";
                else 
                {
                    const listre = /\[+[\s\S]+\]/g;
                    const tuplere = /\(+[\s\S]+\)/g;

                    if(listre.test(value)) type = "list";
                    else if(tuplere.test(value)) type = "tuple";
                    else value = lexer.refine(value);
                }
                const token = {line:i+1,type:type,name:name,value:value,source:valsrc};
                tokens.push(token);
            }
            else if(line.includes(".")) 
            {
                const moduleName = line.substring(0,line.indexOf("."));
                
                const funcCall = line.substring(line.indexOf(".")+1);
                const funcName = funcCall.substring(0,funcCall.indexOf("(")); 
                const params = funcCall.substring(funcCall.indexOf("(")+1,funcCall.length-1);
                const parameters = params.split(",");
                
                parameters.map((val,index) => {
                    parameters[index] = val.trim();
                });
                
                const totalFuncName = moduleName+"."+funcName;
                var token = {line:i+1,type:"obj",method:totalFuncName,params:parameters};
                
                tokens.push(token);

            }
            
        }
        return tokens;
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
    save: (tokens,filename) => {

        fs.writeFileSync(filename,'');
        tokens.map( token => {
            fs.appendFileSync(filename, "<obj>"+"\n"+JSON.stringify(token, null, 2)+"\n" , 'utf-8');
        });
    }
}

module.exports = lexer;

