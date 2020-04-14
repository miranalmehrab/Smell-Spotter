var lexer = {
    run: (pcode)=> {

        let tokensArr = [];
        let linesArr = pcode.split("\n");
        const lineCount = linesArr.length;
        
        for(let i=0;i<lineCount;i++)
        {
            const line = linesArr[i];
            const words = line.split(' ');
            const wordsCount = words.length; 
            
            for(let j=0;j<wordsCount;j++)
            {
                const word = words[j];
                if(word == '=')
                {
                    const name = words[j-1];
                    const value = lexer.refine(words[j+1]);
                    const type = 'variable';
                    const token = {line:i+1,type:type,name:name, value:value};
                    tokensArr.push(token);
                }
            }
        }
        return tokensArr;
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

module.exports = lexer;

