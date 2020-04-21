var fs = require('fs');

var lexer = {

    run: (pcode)=>{
        
        let tokens = [];
        let lines = pcode.split("\n"); 
        const lineCount = lines.length;
        
        var inputs = [];
        var imports = [];


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
                
                let type = 'var';
                let name = words[0].trim();
                let value = words[1].trim();
                let valsrc = "initialized";

                const listre = /\[+[\s\S]+\]/g;
                const tuplere = /\(+[\s\S]+\)/g;
                const inputre = /input\([\s\S]*\)/g;

                console.log(value);
                
                if(inputre.test(value))
                {
                    console.log("input");
                    
                    valsrc = "input";
                    inputs.push(name);
                }
                else if(listre.test(value)) type = "list";
                else if(tuplere.test(value)) type = "tuple";
                else 
                {
                    if(value.includes("+"))
                    {
                        var strParts = value.split("+");
                        strParts.map(part => {
                            if(inputs.includes(part.trim())) valsrc = "input";
                        });
                    }
                    // aro onek kisu add hobe .... join() , .format() , % eigula
                    // ar eigula check kora lagbe regex diye (type cast gula baad deya lagbe int(input()) option theke or "hello"+str(x) theke)

                    //value = lexer.refine(value);
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
                let valsrc = "initialized";

                parameters.map((val,index) => {
                    parameters[index] = val.trim();
                });

                parameters.map(val=>{
                    if(inputs.includes(val))valsrc = "input";
                    else if(val.includes("+"))
                    {
                        var paramParts = val.split("+");
                        paramParts.map(part => {
                            if(inputs.includes(part.trim())) valsrc = "input";
                        });
                    }
                });


                
                const totalFuncName = moduleName+"."+funcName;
                var token = {line:i+1,type:"obj",method:totalFuncName,params:parameters,source:valsrc};
                
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

