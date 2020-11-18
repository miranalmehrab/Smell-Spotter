const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        const WARNING_MSG = 'possible room for SQL injection at line '+ token.line;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? 'possible presence of SQL injection at line '+ token.returnLine : null

        const unwantedMethods = [   'execution.query', 'connection.cursor.execute', 'sqlite3.connect.execute',
                                    'psycopg2.connect.cursor.execute','mysql.connector.connect.cursor.execute', 
                                    'pyodbc.connect.cursor.execute', 'sqlalchemy.sql.text', 'sqlalchemy.text',
                                    'text', 'records.Database.query'
                                ];
        
        if(token.type == "variable" && token.hasOwnProperty('valueSrc') && token.hasOwnProperty('args')) {
            if((unwantedMethods.includes(token.valueSrc) || smell.queryMethodsHasPatterns(token.valueSrc)) && token.args.length > 0) 
                vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(token.type == "function_call" && token.name != null && token.hasOwnProperty('args')) {
            if ((unwantedMethods.includes(token.name) || smell.queryMethodsHasPatterns(token.name)) && token.args.length > 0)
                vscode.window.showWarningMessage(WARNING_MSG);
        }
        else if(token.type == 'function_def' && token.hasOwnProperty('return')){
        
            for(const funcReturn of token.return){
                if ((unwantedMethods.includes(funcReturn) || smell.queryMethodsHasPatterns(funcReturn))) 
                    vscode.window.showWarningMessage(WARNING_MSG_ON_RETURN);
            }
        
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
    }
}

module.exports = smell;