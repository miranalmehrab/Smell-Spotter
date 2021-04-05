const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
        try{
            let lineno = token.line;
        
            const MSG = 'possible SQL injection'
            const WARNING_MSG = MSG+' at line '+ lineno;
            const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
            
            const unwantedMethods = [   'execution.query', 'connection.cursor.execute', 'sqlite3.connect.execute',
                                        'psycopg2.connect.cursor.execute','mysql.connector.connect.cursor.execute', 
                                        'pyodbc.connect.cursor.execute', 'sqlalchemy.sql.text', 'sqlalchemy.text',
                                        'text', 'records.Database.query'
                                    ];
            
            if(token.type == "variable" && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('args')) {
                if((unwantedMethods.includes(token.valueSrc) || smell.queryMethodsHasPatterns(token.valueSrc)) && token.args.length > 0) 
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            }
            else if(token.type == "function_call" && token.name != null && token.hasOwnProperty('args')) {
                if ((unwantedMethods.includes(token.name) || smell.queryMethodsHasPatterns(token.name)) && token.args.length > 0)
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            }
            else if(token.type == 'function_def' && token.hasOwnProperty('return') && token.return != null){
            
                for(const funcReturn of token.return){
                    if ((unwantedMethods.includes(funcReturn) || smell.queryMethodsHasPatterns(funcReturn))) 
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                }
            }
        } catch(error){
            console.log(error);
        }
        
    },

    queryMethodsHasPatterns: (name) => {
        const methods = [   'execution.query', 'connection.cursor.execute', 'sqlite3.connect.execute',
                            'psycopg2.connect.cursor.execute','mysql.connector.connect.cursor.execute', 
                            'pyodbc.connect.cursor.execute', 'sqlalchemy.sql.text', 'sqlalchemy.text',
                            'text', 'records.Database.query'
                    ];

        if(name == null) return false

        for(const method in methods){
            if (name.search(method) != -1) return true
        }

        return false
    },
    
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        let backslashSplittedFilePathLength = fileName.split("/").length
        let filenameFromPath = fileName.split("/")[backslashSplittedFilePathLength - 1]
        
        vscode.window.showWarningMessage(MSG +" : "+ filenameFromPath+":"+lineno);
        console.log( "\u001b[1;31m"+"warning: "+MSG +"  location:"+ fileName+":"+lineno);
        fs.appendFileSync('smell-spotter/warning-logs/project_warnings.csv', fileName+" ,"+WARNING_MSG+"\n");
    }
}

module.exports = smell;