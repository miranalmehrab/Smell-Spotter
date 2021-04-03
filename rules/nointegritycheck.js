const fs = require('fs');
const url = require('url');
const vscode = require('vscode');

var smell = {
    detect: (fileName, token, imports) => {
        let lineno = token.line;
        const MSG = 'possible presence of omitting of integrity check'
        
        const WARNING_MSG = MSG+' at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;
        
        const libs = ['urllib.request.urlretrieve','urllib.urlretrieve','urllib2.urlopen','requests.get','wget.download'];
        
        if(token.type == "variable" && token.hasOwnProperty("valueSrc") && token.hasOwnProperty("args")){
            if(libs.includes(token.valueSrc) && token.args.length > 0){
                if(typeof(token.args[0]) == "string" && smell.isValidDownloadUrl(token.args[0]) && imports.includes('hashlib') == false)
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            } 
        }
        else if(token.type == "function_call" && token.hasOwnProperty("args")){
            if(libs.includes(token.name) && token.args.length > 0){
                if(typeof(token.args[0]) == "string" && smell.isValidDownloadUrl(token.args[0]) && imports.includes('hashlib') == false)
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            } 
        }
        else if(token.type == "function_def" && token.hasOwnProperty("return") && token.return != null){
            for(const funcReturn of token.return){
                if(libs.includes(funcReturn) && token.returnArgs.length > 0){
                    if(typeof(token.returnArgs[0]) == "string" && smell.isValidDownloadUrl(token.returnArgs[0]) && imports.includes('hashlib') == false)
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                }
            }
        }
    },
    
    isNumeric: (value) => {
        return /^\d+$/.test(value);
    },
    
    isIp: (ip) =>{
        const parts = ip.split('.')
        
        for(const part of parts){
            if(smell.isNumeric(part) == false) return false
            if(parseInt(part) > 255) return false
            if(parseInt(part) < 0) return false
        }
        return true
    },
    isValidDownloadUrl: (hostURL) => {
        const fileExtensions = ['iso', 'tar', 'bzip2', 'zip', 'rar', 'gzip', 'gzip2', 'gz','snap', 'flatpak',
                'deb', 'rpm', 'sh', 'run', 'bin', 'exe', 'rar', '7zip', 'msi', 'bat', 'dmg', 'pacman',
                'z', 'pkg', '7z', 'arj', 'iso', 'vcd', 'toast', 'csv', 'dat', 'db', 'dbf', 'log', 'mdb', 
                'xml','sql', 'aif', 'cda', 'mid', 'midi', 'mp3', 'mpa', 'ogg', 'wma', 'wav', 'wpl', 'email',
                'eml', 'emlx', 'msg', 'oft', 'ost', 'pst', 'vcf', 'apk', 'cgi', 'pl', 'com', 'gadget', 'jar', 
                'py', 'wsf', 'fnt', 'fon', 'otf', 'ttf', 'ai','bmp', 'gif', 'ico', 'jpeg', 'hpg', 'png', 'ps',
                'svg', 'psd', 'tif', 'tiff', 'asp', 'aspx', 'cer', 'cfm', 'cgi', 'pl', 'css', 'htm', 'html',
                'js', 'jsp', 'part', 'php', 'rss', 'xhtml', 'key', 'odp', 'pps','ppt', 'pptx', 'c', 'cpp', 'h',
                'java', 'vb', 'sh', 'swift', 'xls', 'xlsm', 'xlsx', 'bak', 'sys', 'tmp','ini', 'cab', 'cfg', 'cpl',
                'cur', 'dll', 'dmp', 'drv','icns','ico','lnk','sys','doc','docx','pdf','odt','rtf','tex','txt','pwd',
                'odf','wmv','vob','swf','rm','mpeg','mpg','mp4','mp3','mov','mkv','m4v','h264','flv','avi','3gp','3g2'
            ]
        if(smell.isIp(hostURL.split('/')[0])){
            let parts = hostURL.split('/')
            let fileURL = parts[parts.length - 1] 
            let fileExtensionParts = fileURL.split('.')
            let fileExtension = fileExtensionParts[fileExtensionParts.length - 1]

            for(let extension of fileExtensions){
                if(fileExtension == extension) return true
            }
            return false
        }
        else{
            const urlPattern = 'http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\), ]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
            let urlRegex = new RegExp(urlPattern)
            if(hostURL.match(urlRegex) == false) return false
            
            let parsedURL = url.parse(hostURL)
            let pathSplits = parsedURL.pathname.split('/')
            let lastPathSplit = pathSplits[pathSplits.length - 1]
            let lasPathSplitSplittedByDot = lastPathSplit.split('.')
            let fileExtension = lasPathSplitSplittedByDot[lasPathSplitSplittedByDot.length - 1]
            
            for(const extension of fileExtensions){
                if(fileExtension == extension) return true
            }
            
            console.log(parsedURL.search);
            let searchSplits = parsedURL.search.split('.')
            let lastSearchSplit = searchSplits[searchSplits.length - 1]

            if(fileExtensions.includes(lastSearchSplit)) return true

            return false
        }
    },
    
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        let backslashSplittedFilePathLength = fileName.split("/").length
        let filenameFromPath = fileName.split("/")[backslashSplittedFilePathLength - 1]
        
        vscode.window.showWarningMessage(MSG +" : "+ filenameFromPath+":"+lineno);
        console.log( "\u001b[1;31m"+"warning: "+MSG +"  location:"+ fileName+":"+lineno);
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+" ,"+WARNING_MSG+"\n");
        
        // fs.appendFile(__dirname+'/../logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n", (err) => err ? console.log(err): "");
    }
}

module.exports = smell;