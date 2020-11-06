const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        if(token.hasOwnProperty("name")) var name= token.name;
        if(token.hasOwnProperty("args")) var args= token.args;
        if(token.hasOwnProperty("hasInputs")) var hasInputs= token.hasInputs;
        const WARNING_MSG = 'possible room for SQL injection at line '+ lineno;

        const unwantedMethods = [   'execution.query', 'connection.cursor.execute', 'sqlite3.connect.execute',
                                    'psycopg2.connect.cursor.execute','mysql.connector.connect.cursor.execute', 
                                    'pyodbc.connect.cursor.execute', 'sqlalchemy.sql.text', 'sqlalchemy.text',
                                    'text', 'records.Database.query'
                                ];
        
        if(tokenType == "variable" && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('args')) {
            if((unwantedMethods.includes(token.valueSrc.toLowerCase()) || this.queryMethodsHasPatterns(token.valueSrc.toLowerCase())) && token.args.length > 0) 
                vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == "function_call" && token.hasOwnProperty('name') && token.hasOwnProperty('args')) {
            if ((unwantedMethods.includes(token.name.toLowerCase()) || this.queryMethodsHasPatterns(token.name.toLowerCase())) && token.args.length > 0)
                vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(tokenType == 'function_def' && token.hasOwnProperty('return') && token.hasOwnProperty('returnArgs')){
            if ((unwantedMethods.includes(token.return.toLowerCase()) || this.queryMethodsHasPatterns(token.return.toLowerCase())) && token.returnArgs.length > 0)
                vscode.window.showWarningMessage(WARNING_MSG);
        }
    },
    queryMethodsHasPatterns: (name) => {
        const methods = [   'execution.query', 'connection.cursor.execute', 'sqlite3.connect.execute','psycopg2.connect.cursor.execute', 'objects.raw',
                            'mysql.connector.connect.cursor.execute', 'pyodbc.connect.cursor.execute', 'sqlalchemy.sql.text', 'objects.extra'
                    ];

        if(name == null) return false
        for(const method in methods){
            if (name.search(method)) return true
        }
        return false
    }
}

module.exports = smell;