const fs = require('fs');
const vscode = require('vscode');
const {spawn} = require('child_process');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) 
{
	// const color = new vscode.ThemeColor('pssd.warning');

	let parsecode = vscode.commands.registerCommand('extension.parsecode', function () {

		const pcode = vscode.window.activeTextEditor.document.getText();
		const codeLang = vscode.window.activeTextEditor.document.languageId;
		
		if(codeLang === 'python') {
			
			if(pcode!=null) {
				
				try {
					const python = spawn('python3.8', [__dirname+'/py/main.py',pcode]);
					python.stdout.on('data', data => data ? console.log('data from python script ...'+data.toString()): 'no data from python script');		
					python.on('close', code => code? console.log(`child process close all stdio with code ${code}`): 'python script exit code not found');
					
				} catch (error) {
					console.error(error);
				}
			}
			else vscode.window.showErrorMessage("Empty source code!");
		}
		else vscode.window.showErrorMessage("Please select python source code!");
	});

	let greetings = vscode.commands.registerCommand('extension.greetings', function(){
		vscode.window.showInformationMessage('Hello python programmers!');
	});

	context.subscriptions.push(parsecode);
	context.subscriptions.push(greetings);
}


exports.activate = activate;

function deactivate() 
{
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = {
	activate,
	deactivate
}
