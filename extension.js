const vscode = require('vscode');
var fs = require('fs');
const filbert = require('filbert');
const filbert_loose = require('filbert/filbert_loose');
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
				console.log(tokensArr);
				writeTokenToFile(tokensArr);
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

function writeTokenToFile(tokensArr)
{
	fs.writeFile(__dirname+'/output/output.txt', '', ()=>{console.log('done')})
	
	tokensArr.forEach(token => {
		const value = token.type+","+token.name+","+token.value+"\n";
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
	console.log(word);
	const charLength = word.length;
	const unwantedChars = ["'"];
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
	let linesArr = pcode.split('\n');
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
				const token = {type:type,name:name, value:value};
				tokensArr.push(token);
			}
		}
	}

	return tokensArr;
}

function createAST(pcode)
{
	//var ast = "";
	//const ast = filbert.parse(pcode, { locations: true, ranges: true });
	//ast = filbert.parse(pcode);
	//var ast_damn = filbert_loose.parse_dammit(pcode);
	//if(ast != null)traverseAST(ast);
}


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
