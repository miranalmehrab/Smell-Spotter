const fs = require('fs');
const vscode = require('vscode'); 
const { spawn } = require('child_process');
var detection = require('./detection/detection');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	// const color = new vscode.ThemeColor('pssd.warning');
	// vscode.window.showQuickPick.arguments(2);

	let parsecode = vscode.commands.registerCommand('extension.quickscan', function () {
		
		const sourceCode = vscode.window.activeTextEditor.document.getText();
		const codeLang = vscode.window.activeTextEditor.document.languageId;

		if (codeLang === 'python') {
			if (sourceCode != null) {
				
				const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);

				script.stdout.on('data', data => data? startSmellInvestigation(data.toString()) : console.log('No data from script!'));
				script.on('close', exitCode => exitCode ? console.log(`main script close all stdio with code ${exitCode}`) : 'main script exit code not found');
				script.on('error', err => {
					console.log('error found!')
					console.log(err)
					
				});
			}
			else vscode.window.showErrorMessage("Empty source code!");
		}
		else vscode.window.showErrorMessage("Please select Python source code!");
	});

	context.subscriptions.push(parsecode);
}


const getImportedPackagesInSourceCode = (tokensFromLogFile) => {
	let importedPackages = [];
	tokensFromLogFile.map((token) => {
		
		try{
			let loadedToken = JSON.parse(token)
			if(loadedToken.type == "import") importedPackages.push(loadedToken.og)
		}
		catch(error) {
			vscode.window.showErrorMessage(error.toString())
		}
	})

	return importedPackages;
}


const startSmellInvestigation = tokens => {
	fs.writeFileSync(__dirname+'/logs/tokens.txt', tokens);
	
	const data = fs.readFileSync(__dirname+'/logs/tokens.txt', {encoding:'utf8', flag:'r'}); 
	
	let tokensFromLogFile = data.split('\n');
	tokensFromLogFile.pop()
	console.log(tokensFromLogFile)

	let importedPackages = getImportedPackagesInSourceCode(tokensFromLogFile);
	detection.detect(tokensFromLogFile, importedPackages)
}





















exports.activate = activate;

function deactivate() {
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = { activate, deactivate}
