const fs = require('fs');
const crypto = require('crypto');
const vscode = require('vscode');

const store = require('json-fs-store')();

const { log } = require('console');
const { spawn } = require('child_process');

var detection = require('./detection/detection');
var createPDFDocument = require('./utilities/createPDFDocument');
var createJsonDocument = require('./utilities/createJsonDocument');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	// const color = new vscode.ThemeColor('pssd.warning');
	// vscode.window.showQuickPick.arguments(2);

	
	let quickScan = vscode.commands.registerCommand('extension.quickscan', function () {
		
		const sourceCode = vscode.window.activeTextEditor.document.getText();
		const codeLang = vscode.window.activeTextEditor.document.languageId;
		console.log({'scan mode message': 'quick scan mode working'});

		if (codeLang === 'python') {
			if (sourceCode != null) {
				
				let md5Hash = crypto.createHash('md5').update(sourceCode).digest("hex");
				console.log({'md5 hash': md5Hash});
				
				store.load(md5Hash, function(err, object){
					console.log({'object': object});
					if(err){
						console.log(err);

						const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);
						script.stdout.on('data', data => data ? startSmellInvestigation(undefined, data.toString(), md5Hash) : console.log('No data from script!'));
						script.on('close', (exitCode) => exitCode ? console.log(`main script exit code ${exitCode}`) : 'main script exit code not found');
						script.on('error', (err) => console.log(err));
				
					}
					else showWarningsNotifications(object.warnings);
				});
			}
			else vscode.window.showErrorMessage("Empty source code!");
		}
		else vscode.window.showErrorMessage("Please select Python source code!");
	});


	let completeScan = vscode.commands.registerCommand('extension.completescan', function () {
		fs.readdir(__dirname, (err, files) => { 
			
			if (err) console.log(err);
			else {

			  	console.log("\nCurrent directory filenames:"); 
			  	files.forEach(file => { 
					console.log(file);
					// const sourceCode = vscode.window.activeTextEditor.document.getText();
					// const codeLang = vscode.window.activeTextEditor.document.languageId;
					
					// if (codeLang === 'py') {
					// 	if (sourceCode != null) {
							
					// 		const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);

					// 		script.stdout.on('data', data => data? startSmellInvestigation(data.toString()) : console.log('No data from script!'));
					// 		script.on('close', exitCode => exitCode ? console.log(`main script close all stdio with code ${exitCode}`) : 'main script exit code not found');
					// 		script.on('error', err => {
					// 			console.log('Error while traversing AST!')
					// 			console.log(err)
								
					// 		});
					// 	}
					// 	else vscode.window.showErrorMessage("Empty source code!");
					// }
					// else vscode.window.showErrorMessage("Please select Python source code!");	
				
				}); 
			} 
		});
	}); 

	let customScan = vscode.commands.registerCommand('extension.customscan', function (userSpecifiedPath) {
		const pathCharacteristics = fs.statSync(userSpecifiedPath);
		if (pathCharacteristics.isFile()){
			const sourceCode = vscode.window.activeTextEditor.document.getText();
			const codeLang = vscode.window.activeTextEditor.document.languageId;

			if (codeLang === 'python') {
				if (sourceCode != null) {
					
					const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);

					script.stdout.on('data', data => data? startSmellInvestigation(data.toString()) : console.log('No data from script!'));
					script.on('close', exitCode => exitCode ? console.log(`main script close all stdio with code ${exitCode}`) : 'main script exit code not found');
					script.on('error', err => {
						console.log('Error while traversing AST!')
						console.log(err)
						
					});
				}
				else vscode.window.showErrorMessage("Empty source code!");
			}
			else vscode.window.showErrorMessage("Please select Python source code!");

		}
		else if(pathCharacteristics.isDirectory()){
			fs.readdir(userSpecifiedPath, (err, files) => { 
				
				if (err) console.log(err);
				else {
					
					console.log("\nCurrent directory filenames:"); 
					files.forEach(file => { 
						console.log(file);
						let sourceCodeExtension = ''; 
						// const sourceCode = vscode.window.activeTextEditor.document.getText();
						// const codeLang = vscode.window.activeTextEditor.document.languageId;
						
						// if (codeLang === 'py') {
						// 	if (sourceCode != null) {
								
						// 		const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);

						// 		script.stdout.on('data', data => data? startSmellInvestigation(data.toString()) : console.log('No data from script!'));
						// 		script.on('close', exitCode => exitCode ? console.log(`main script close all stdio with code ${exitCode}`) : 'main script exit code not found');
						// 		script.on('error', err => {
						// 			console.log('Error while traversing AST!')
						// 			console.log(err)
									
						// 		});
						// 	}
						// 	else vscode.window.showErrorMessage("Empty source code!");
						// }
						// else vscode.window.showErrorMessage("Please select Python source code!");	
					
					}); 
				}
			});
		} 
	}); 

	context.subscriptions.push(quickScan);
	context.subscriptions.push(customScan);
	context.subscriptions.push(completeScan);
}

const showWarningsNotifications = (previousWarnings) => {
	console.log({'warnings': 'previous results'});
	let warnings = previousWarnings.split("\n");
	warnings.pop();

	warnings.forEach(warning => {
		vscode.window.showWarningMessage(warning);
	});
}


const getImportedPackagesInSourceCode = (splittedTokens) => {
	let importedPackages = [];
	splittedTokens.map((token) => {
		
		try {
			let loadedToken = JSON.parse(token)
			if(loadedToken.type == "import") importedPackages.push(loadedToken.og)
		}
		catch(error) { vscode.window.showErrorMessage(error.toString())}
	})

	return importedPackages;
}

const clearLogContents = () => {

	try {
		fs.writeFileSync(__dirname+'/logs/tokens.txt', "");
		fs.writeFileSync(__dirname+'/logs/warnings.txt', "");
		
  	} catch(err) { console.error(err)}
}


const startSmellInvestigation = (fileName = undefined, tokens, hash) => {
	clearLogContents();
	
	fs.writeFileSync(__dirname+'/logs/tokens.txt', tokens);
	let tokensFromLog = fs.readFileSync(__dirname+'/logs/tokens.txt', {encoding:'utf8', flag:'r'}); 
	let splittedTokens = tokensFromLog.split('\n');
	splittedTokens.pop(); //removing a blank item from array
	
	// console.log({'dir name': __dirname});
	// console.log(splittedTokens)

	let importedPackages = getImportedPackagesInSourceCode(splittedTokens);
	detection.detect(splittedTokens, importedPackages);
	exportDetectionResult(fileName, hash);

}

const exportDetectionResult = (fileName, hash) => {
	let warningsFromLog = fs.readFileSync(__dirname+'/logs/warnings.txt', {encoding:'utf8', flag:'r'});
	warningsFromLog = fileName != undefined? "filename: "+ fileName +"\n"+ warningsFromLog : "filename: " + "No name found\n" + warningsFromLog;
	
	console.log({fileName: fileName});
	console.log({"warningsFromLog": warningsFromLog});

	var log = {id: hash, name: fileName, warnings: warningsFromLog};
	
	store.add(log, function(err) {
		// called when the file has been written
		// to the /path/to/storage/location/12345.json
		if (err) console.log(err); // err if the save failed
	});

	
	createPDFDocument.createPDFDocument("QuickScan.pdf", warningsFromLog, __dirname);
	console.log({"createPDFDocument": "came back"});
	
	createJsonDocument.createJsonDocument("QuickScan.json", warningsFromLog, __dirname);
	console.log({"createJsonDocument": "came back"});
}


exports.activate = activate;

function deactivate() {
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = { activate, deactivate}
