const fs = require('fs');
const crypto = require('crypto');
const vscode = require('vscode');

const path = require('path');
const store = require('json-fs-store')();
const { spawn } = require('child_process');

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
				setTimeout(showWarningsInOutputChannel, 4000);
				setTimeout(generateReport, 4000, "QuickScan.pdf");

			} else vscode.window.showErrorMessage("Empty source code!");
		} else vscode.window.showErrorMessage("Please select Python source code!");
	});


	let completeScan = vscode.commands.registerCommand('extension.completescan', function () {
		clearPreviousDetectionLog();

		let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.path;
		let filesInWorkspaceFolder = getAllFiles(workspaceFolder, []);
		filesInWorkspaceFolder.forEach(file => {
			
			try{
				if(file.includes(".git") == false && file.includes("test") == false){
		
					file = workspaceFolder+file.split(workspaceFolder)[1];			
					if(getFileExtension(file) === 'py'){
						
						let sourceCode = getFileContentsFromPath(file);
						let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");
	
						if (sourceCode != null) {
							analyzeSourceFile(sourceCode, file);
						}
						// storeDetectionInDB(file, fileHashValue);
						setTimeout(storeDetectionInDB, 4000, file, fileHashValue);
					}
				}
			} catch(error){ vscode.window.showErrorMessage("could not read file - "+ file); }
		});
		// showWarningsInOutputChannel();
		// generateReport("CompleteScan.pdf");

		setTimeout(showWarningsInOutputChannel, 10000);
		setTimeout(generateReport, 20000, "CompleteScan.pdf");
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
						setTimeout(showWarningsInOutputChannel, 4000);
						setTimeout(generateReport, 4000, "CustomScan.pdf");
					} 
					else vscode.window.showErrorMessage("Empty source code!");
				}
				else vscode.window.showErrorMessage("Please select Python source code!");
			}
			else{
				console.log({"specified path ": userSpecifiedPath});
				let allFiles = getAllFiles(userSpecifiedPath, []);
				// console.log(allFiles);

				allFiles.forEach(file => {
				
					try {
						if(file.includes(".git") == false && file.includes("test") == false){
							file = userSpecifiedPath+file.split(userSpecifiedPath)[1];
							console.log(file);
						
							if(getFileExtension(file) === 'py'){
								
								let sourceCode = getFileContentsFromPath(file);
								console.log("no problem here!");
								let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");
			
								if (sourceCode != null) {
									analyzeSourceFile(sourceCode, file);
									setTimeout(storeDetectionInDB, 4000, file, fileHashValue);
								}
							}
						}
					} catch(error){ vscode.window.showErrorMessage("could not read file - "+ file);}
				});
				setTimeout(showWarningsInOutputChannel, 10000);	
				setTimeout(generateReport, 20000, "CustomScan.pdf");
			}
		});
	});

	let cleardb = vscode.commands.registerCommand('extension.cleardb', function () {
		const homedir = require('os').homedir();
		const directory =  homedir+"/store";

		fs.readdir(directory, (err, files) => {
			if (err) console.log(err);
			else if(files.length == 0) vscode.window.showInformationMessage("database is empty!");
			else {
				for (const file of files) {
					fs.unlink(path.join(directory, file), err => err? vscode.window.showErrorMessage("error while removing "+file): vscode.window.showInformationMessage(file+" cleared!"));
				}
			}
		});	
	});

	context.subscriptions.push(cleardb);
	context.subscriptions.push(quickScan);
	context.subscriptions.push(customScan);
	context.subscriptions.push(completeScan);
}

const getAllFiles = function(dirPath, arrayOfFiles) {
	let files = fs.readdirSync(dirPath)
  
	arrayOfFiles = arrayOfFiles || []
  
	files.forEach(function(file) {
	  if (fs.statSync(dirPath + "/" + file).isDirectory()) {
		arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
	  } else {
		arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
	  }
	})
  
	return arrayOfFiles
  }



const analyzeSourceFile = (sourceCode, fileName) => {

	let fileContentHash = crypto.createHash('md5').update(sourceCode).digest("hex");
	store.load(fileContentHash, function(error, object) {

		if(error) {
			const script = spawn('python3.8', [__dirname + '/py-scripts/main.py', sourceCode, fileName]);
			script.stdout.on('data', warnings => warnings ? saveDetectionResultsToLog(warnings.toString(), fileName): console.log('No data from script!'));
			script.on('close', (exitCode) => exitCode ? console.log(`main script exit code ${exitCode}`) : 'main script exit code not found');
			script.on('error', (err) => console.log(err));
		}
		else {
			fs.appendFileSync("smell-spotter/warning-logs/project_warnings.csv", object.warnings);
			makeWarningsVisibleInNotification(object.warnings);
		}
	});		
}

const getFileContentsFromPath = (filepath) => {
	try{
		let code = fs.readFileSync(filepath);
		return code;
	}
	catch(e){console.log(e);}
}

const checkIfFilePath = (value) => {
	let pathSplits = value.split("/");
	return pathSplits[pathSplits.length - 1].includes(".")? true: false;
}


const getFileExtension = (value) => {
	let pathSplits = value.split(".");
	return pathSplits[pathSplits.length - 1]? pathSplits[pathSplits.length - 1]: undefined;
}

const makeWarningsVisibleInNotification = (warnings) => {
	
	try{
		warnings = warnings.split("\n");
		warnings.pop();

		warnings.forEach(warning => {
			try{
				if(!warning.includes("filename") && !warning.includes("error")){
					
					let filepath = warning.split(",")[0].trim()
					filepath = filepath.split("/")[filepath.split("/").length - 1]
					vscode.window.showWarningMessage(filepath+" "+warning.split(",")[1]);
				}
				
			}catch(e){console.log(e);}
		});

	}catch(e){ console.log(e);};
}


const clearPreviousDetectionLog = () => {
	fs.writeFileSync('smell-spotter/warning-logs/project_warnings.csv', "");
}

const saveDetectionResultsToLog = (warnings, fileName) => {
	warnings = "filename: "+fileName+"\n"+warnings;
	fs.appendFileSync('smell-spotter/warning-logs/project_warnings.csv', warnings);
	
	makeWarningsVisibleInNotification(warnings);
}

const storeDetectionInDB = (fileName , hash) => {
	let filenameSpecificWarnings = "";
	let loggedWarnings = fs.readFileSync('smell-spotter/warning-logs/project_warnings.csv');
	
	let warnings = loggedWarnings.toString().split("\n");
	warnings.pop(); //null array item removal due to new line split
	
	warnings.forEach(warning => {
		if(warning.search(fileName) != -1){
			filenameSpecificWarnings = filenameSpecificWarnings+warning+"\n";
		}
	});

	let dbRow = {id: hash, name: fileName, warnings: filenameSpecificWarnings};
	store.add(dbRow, (err) => err? console.log(err): "successfully added to store");

	console.log("storing the warnings in db is done");
}

const showWarningsInOutputChannel = () => {
	let outputChannel = vscode.window.createOutputChannel("Smell-Spotter");
	let buffer = fs.readFileSync('smell-spotter/warning-logs/project_warnings.csv');
	let bufferToString = buffer.toString();
	let warnings = bufferToString.split("\n");
	
	warnings.forEach(warning => warning.includes("filename")? outputChannel.append(warning + "\n"+ "\n"): outputChannel.append( warning+ "\n")); 

	outputChannel.show();
	console.log("output channel flushed");
}


const generateReport = (reportFileName) => {

	let warnings = fs.readFileSync('smell-spotter/warning-logs/project_warnings.csv');
	console.log({'project warnings ': warnings});
	createPDFDocument.createPDFDocument(reportFileName, warnings);
}  


exports.activate = activate;

function deactivate() {
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = { activate, deactivate}
