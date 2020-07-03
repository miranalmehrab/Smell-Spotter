const vscode = require('vscode');

var smell = {
    detect: (token) => {

        if (token.hasOwnProperty("line")) var lineno = token.line;
        if (token.hasOwnProperty("type")) var tokenType = token.type;
        if (token.hasOwnProperty("name")) var name = token.name;
        if (token.hasOwnProperty("args")) var args = token.args;

        const libs = ['urllib.urlretrieve', 'urllib2.urlopen', 'requests.get', 'wget.download'];
        const download = ['iso', 'tar', 'tar.gz', 'tar.bzip2', 'zip', 'rar', 'gzip', 'gzip2', 'deb', 'rpm', 'sh', 'run', 'bin', 'exe', 'zip', 'rar', '7zip', 'msi', 'bat']

        if (tokenType == "function_call" && libs.includes(name) && args != null) {
            
            let urls = args[0].split(".");
            let extension = urls[urls.length - 1];

            if (download.includes(extension)) {
                const warning = 'possible no integrity check at line ' + lineno;
                vscode.window.showWarningMessage(warning);
            }
        }
    }
}

module.exports = smell;