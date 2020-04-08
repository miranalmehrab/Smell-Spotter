var fs = require('fs');
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {

	vscode.window.showInformationMessage('Python file has been loaded!');


	let parsecode = vscode.commands.registerCommand('extension.parsecode', function () 
	{
		const window = vscode.window;
		var docObj = window.activeTextEditor.document;
		
		const pcode = docObj.getText();
		const codeLang = docObj.languageId;
		
		if(codeLang === 'python') 
		{
			let tokensArr = [];
			if(pcode!=null) tokensArr = runLexer(pcode);
			else window.showErrorMessage("Empty source code!");
			
			if(tokensArr) 
			{
				writeTokenToFile(tokensArr);
				readToken();

			}
		}
		else window.showErrorMessage("Please select python source code!");
	});

	let greetings = vscode.commands.registerCommand('extension.greetings', function()
	{
		vscode.window.showInformationMessage('Hello python programmers!');
	});

	context.subscriptions.push(parsecode);
	context.subscriptions.push(greetings);
}

function isVarible(type)
{
	return type == "variable" ? true : false;
}

function isLengthZero(word)
{
    return word.length>0 ? false : true;
}

function isCommonUserName(word)
{
	const commonUserNames = ['user','usr','username','name'];
	const count = commonUserNames.length;
	for(let i=0;i<count;i++)
	{
		if(word.includes(commonUserNames[i])) return true;
	}
	return false;
}

function isCommonPassword(word)
{
	const commonPasswords = ['pass','pwd','password','pass1234'];
	const count = commonPasswords.length;
	for(let i=0;i<count;i++)
	{
		if(word.includes(commonPasswords[i])) return true;
	}
	return false;
}

function hardCodedSecret(token)
{
	const splittedToken = token.split(',');
	const lineNumber = splittedToken[0];
	const type = splittedToken[1];
	const name = splittedToken[2];
	const value = splittedToken[3];
	
	console.log(isVarible(type));
	console.log(isCommonUserName(name));
	console.log(isCommonPassword(name));
	console.log(isLengthZero(value));

	if(isVarible(type) && (isCommonPassword(name) || isCommonUserName(name)) && !isLengthZero(value)){
		console.log('hardcoded secret!');
		vscode.window.showWarningMessage('Hard coded secret at line '+ lineNumber);
	
	}
}

function detectSmell(tokens)
{
	const tokensArr = tokens.split("\n");
	console.log(tokensArr);
	const count = tokensArr.length;

	for(let i=0;i<count;i++)
	{
		hardCodedSecret(tokensArr[i]);
	}


}


function readToken() {
	var tokens = fs.readFile(__dirname + '/output/output.txt', {encoding: 'utf-8'},(err, data) => {
	  if (err) console.error(err);
	  detectSmell(data);
	});
	
}
	

function writeTokenToFile(tokensArr)
{
	fs.writeFile(__dirname+'/output/output.txt', '', ()=>{})
	
	tokensArr.forEach(token => {
		const value = token.line+","+token.type+","+token.name+","+token.value+"\n";
		fs.appendFile(__dirname+'/output/output.txt', value, (err) => { 
			if (err)
			{
				console.log(err);
				throw err;
			}  
		})
	});

	 
}

function removeUnwantedCharacter(word)
{
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


function runLexer(pcode)
{
	//const builtInFunctions = ['','','','','','','',''];

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
				const value = removeUnwantedCharacter(words[j+1]);
				const type = 'variable';
				const token = {line:i+1,type:type,name:name, value:value};
				tokensArr.push(token);
			}
		}
	}

	return tokensArr;
}

// const filbert = require('filbert');
//const filbert_loose = require('filbert/filbert_loose');


// function createAST(pcode)
// {
// 	//var ast = "";
// 	//const ast = filbert.parse(pcode, { locations: true, ranges: true });
// 	//ast = filbert.parse(pcode);
// 	//var ast_damn = filbert_loose.parse_dammit(pcode);
// 	//if(ast != null)traverseAST(ast);
// }


function traverseAST(obj)
{
	const window = vscode.window;
	const limit = obj.body.length;

	for(let i=0;i<limit;i++)
	{
		let node = obj.body[i];
		window.showInformationMessage(node);

		if(node.type === "VariableDeclaration")
		{
			console.log(node.declarations.id.name);
			window.showInformationMessage(node.declarations.id.name);
			if(node.init.type === "Literal")
			{
				window.showInformationMessage(node.declarations.init.value);
				console.log(node.init.value);
			}
		}
		
		//if(typeof value === 'object') traverseAST(value);
		//else if(Array.isArray(value)) traverseAST(value);
	}
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
	//Extension should clean up the resources that it has consumed during operation.

}

module.exports = {
	activate,
	deactivate
}
