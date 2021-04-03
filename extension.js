const fs = require('fs');
const crypto = require('crypto');
const vscode = require('vscode');

var path = require('path');
const store = require('json-fs-store')();
const { spawn } = require('child_process');

var detection = require('./detection/detection');
var createPDFDocument = require('./utilities/createPDFDocument');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	// vscode.window.showQuickPick.arguments(2);
	// const color = new vscode.ThemeColor('smellspotter.warning');
	
	let quickScan = vscode.commands.registerCommand('extension.quickscan', function () {
		
		clearPreviousDetectionLog();
		let fileName = vscode.window.activeTextEditor.document.fileName;  
		let codeLang = vscode.window.activeTextEditor.document.languageId;
		let sourceCode = vscode.window.activeTextEditor.document.getText();
		let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");
				
		if (codeLang === 'python') {
			if (sourceCode != null){		
				analyzeSourceFile(sourceCode, fileName);
				setTimeout(storeDetectionInDB, 4000, fileName, fileHashValue);
				setTimeout(generateReport, 4000, "QuickScan.pdf");

			} else vscode.window.showErrorMessage("Empty source code!");
		} else vscode.window.showErrorMessage("Please select Python source code!");
	});


	let completeScan = vscode.commands.registerCommand('extension.completescan', function () {
		clearPreviousDetectionLog();
		let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.path;
		
		fs.readdir(workspaceFolder, (err, files) => { 
			if(files){
				files.forEach(file => {
					if(getFileExtension(file) === 'py'){

						let sourceCode = getFileContentsFromPath(path.join(workspaceFolder, file));
						let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");

						if (sourceCode != null) {
							analyzeSourceFile(sourceCode, path.join(workspaceFolder, file));
							setTimeout(storeDetectionInDB, 4000, file, fileHashValue);
						}
					}
				});
			}
			else vscode.window.showErrorMessage("Error while reading files!");
			setTimeout(generateReport, 4000, "CompleteScan.pdf");
		});
	}); 

	let customScan = vscode.commands.registerCommand('extension.customscan', function () {
		clearPreviousDetectionLog();
		const userPathInput = vscode.window.showInputBox();
		userPathInput.then( userSpecifiedPath => {
			
			if (checkIfFilePath(userSpecifiedPath)){
				if (getFileExtension(userSpecifiedPath) === 'py') {
					
					let pathSplits = userSpecifiedPath.split('/')
					let fileName = pathSplits[pathSplits.length - 1]

					let sourceCode = getFileContentsFromPath(userSpecifiedPath);
					if (sourceCode != null) {
						analyzeSourceFile(sourceCode, userSpecifiedPath);
						setTimeout(storeDetectionInDB, 4000, fileName, userSpecifiedPath);
						setTimeout(generateReport, 4000, "CustomScan.pdf");
					} 
					else vscode.window.showErrorMessage("Empty source code!");
				}
				else vscode.window.showErrorMessage("Please select Python source code!");
			}
			else{
				fs.readdir(userSpecifiedPath, (err, files) => { 
					if(files){
						files.forEach(file => {
							if(getFileExtension(file) === 'py'){

								let sourceCode = getFileContentsFromPath(path.join(userSpecifiedPath, file));
								let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");

								if (sourceCode != null) {
									analyzeSourceFile(sourceCode, path.join(userSpecifiedPath, file));
									setTimeout(storeDetectionInDB, 4000, file, fileHashValue);
								}
							}
						});
					} else vscode.window.showErrorMessage("Error while reading files!");
					setTimeout(generateReport, 4000, "CustomScan.pdf");
				});
			}
		});
	});

	let cleardb = vscode.commands.registerCommand('extension.cleardb', function () {
		const homedir = require('os').homedir();
		const directory =  homedir+"/store";

		fs.readdir(directory, (err, files) => {
		if (err) console.log(err);

		for (const file of files) {
			fs.unlink(path.join(directory, file), err => {
				if (!err) vscode.window.showInformationMessage(file+" cleared!");
			});
		}
		});	
	
	});

	context.subscriptions.push(cleardb);
	context.subscriptions.push(quickScan);
	context.subscriptions.push(customScan);
	context.subscriptions.push(completeScan);
}


const analyzeSourceFile = (sourceCode, fileName) => {

	let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");
	
	store.load(fileHashValue, function(error, object) {
		if(error){
			const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);
			script.stdout.on('data', data => data ? startSmellInvestigation(data.toString(), fileName): console.log('No data from script!'));
			script.on('close', (exitCode) => exitCode ? console.log(`main script exit code ${exitCode}`) : 'main script exit code not found');
			script.on('error', (err) => console.log(err));
		}
		else {
			fs.appendFileSync(__dirname+"/warning-logs/project_warnings.csv", object.warnings);
			showWarningsNotifications(object.warnings);
		}
	});		
}

const getFileContentsFromPath = (userSpecifiedPath) => {
	return fs.readFileSync(userSpecifiedPath, {encoding:'utf8', flag:'r'});
}

const checkIfFilePath = (value) => {
	let pathSplits = value.split("/");
	return pathSplits[pathSplits.length - 1].includes(".")? true: false;
}


const getFileExtension = (value) => {
	let pathSplits = value.split(".");
	return pathSplits[pathSplits.length - 1]? pathSplits[pathSplits.length - 1]: undefined;
}

const showWarningsNotifications = (warnings) => {
	warnings = warnings.split("\n");
	warnings.pop();

	warnings.forEach(warning => {
		try{
			if(!warning.includes("filename")){
				if(warning == "") console.log({});
				let tmpWarning = warning.split(",")[0];
				let splittedWarnigLength = tmpWarning.split("/").length;
				let fileName = tmpWarning.split("/")[splittedWarnigLength - 1];
				
				tmpWarning = warning.split(",")[1];
				tmpWarning = tmpWarning.split(" ");
				splittedWarnigLength = tmpWarning.length;
				let lineNumber = tmpWarning[splittedWarnigLength - 1];
				
				tmpWarning.pop();
				vscode.window.showWarningMessage(tmpWarning.join(" ")+" : "+fileName+":"+lineNumber);
			}
			
		}catch(e){
			console.log(e);
		}
		});
}

const getImportedPackagesInSourceCode = (splittedTokens) => {
	let importedPackages = [];
	splittedTokens.map(token => {
		
		try {
			let loadedToken = JSON.parse(token)
			if(loadedToken.type == "import") importedPackages.push(loadedToken.og)
		}
		catch(error) {}
	})
	return importedPackages;
}

const clearPreviousDetectionLog = () => {
	fs.writeFileSync(path.join(__dirname, '/warning-logs/project_warnings.csv'), "");
}

const startSmellInvestigation = (tokens, fileName) => {
	let splittedTokens = tokens.split("\n");
	console.log({'splitted tokens': splittedTokens});
	
	let importedPackages = getImportedPackagesInSourceCode(splittedTokens);
	detection.detect(fileName, splittedTokens, importedPackages);
}

const storeDetectionInDB = (fileName , hash) => {
	let warningObject = "";
	let data = fs.readFileSync(__dirname+'/warning-logs/project_warnings.csv');
	
	let porjectWarnings = data.toString().split("\n");
	porjectWarnings.pop(); //null array item removal due to new line split
	
	porjectWarnings.forEach(warning => {
		if(warning.search(fileName) != -1){
			warningObject = warningObject+warning+"\n";
		}
	});

	let smellLog = {id: hash, name: fileName, warnings: warningObject};
	store.add(smellLog, (err) => err? console.log(err): "successfully added to store");
}

const showWarningsInOutputChannel = (warnings) => {
	let outputChannel = vscode.window.createOutputChannel("Smell-Spotter");
	warnings.forEach(warning => {
		try{
			if(!warning.includes("filename")){

				let tmpWarning = warning.split(",")[1];
				tmpWarning = tmpWarning.split(" ");
				let splittedWarnigLength = tmpWarning.length;
				let lineNumber = tmpWarning[splittedWarnigLength - 1];
				warning = warning.split(",")[0].trim() +":"+ lineNumber+","+ warning.split(",")[1];

				outputChannel.appendLine(warning)
			}
			
		} catch(e){ console.log(e);}
	
		outputChannel.show();
	
	});
}

const generateReport = (reportFileName) => {
		
	try {
		let data = fs.readFileSync(__dirname+'/warning-logs/project_warnings.csv');
		let porjectWarnings = data.toString().split("\n");
		porjectWarnings.pop(); //null array item removal due to new line split

		if (!fs.existsSync("./results")){
			fs.mkdirSync("./results");
		}
		
		// console.log({'projectkwarnings ': porjectWarnings});
		createPDFDocument.createPDFDocument(reportFileName, porjectWarnings, __dirname);
		showWarningsInOutputChannel(porjectWarnings);
			
		}
	catch (e) {
		console.log("Error here in generate report");
		console.log(e);
	}
}  


exports.activate = activate;

function deactivate() {
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = { activate, deactivate}
