# Smell Spotter
This is an `Visual Studio Code` extension for detecting insecure coding practices in python code. These insecure coding practices are also known as security smells. These smells can leave room for exploitation of software system ands lead to security breaches. To help the practioners, this tool has been developed to locate these smells in code.

## Investigated Smells
```
Bad File Permission
Command Injections
Cross-site scripting
Constructing SQL upon Input
Debug Set to True in Deployment
Exec Statement
Empty Password
Hard-coded Secrets
Hard-coded IP Address Binding
Hard-coded tmp Directory
Insecure Data Deserialization
Insecure Dynamic Code Execution
Ignore Except Block
Insecure YAML operation
No Certificate Validation
No Integrity Check
Use of HTTP without TLS
Use of assert Statement
```
## Detection Modes 
```
Quick Scan: press ctrl+shift+p and execute quick scan command
Custom Scan: press ctrl+shift+p and execute custom scan command
Complete Scan: press ctrl+shift+p and execute complete scan command
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

The following things need to be installed for the software -

```
nodejs
npm
python 3.8
```

### Installing

Follow the steps to get a development env running

```
pull the repository
cd ~/*/repository
npm install
```
#### Debugging
To run the extension for debug press `F5`
![Extension Running in `dev` environment](https://github.com/MiranAlMehrab/Smell-Spotter/blob/master/assets/debug-extension.png?raw=true)

Now you can test different scan modes

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

## Built With

* [Yeoman](https://yeoman.io/) - The web scaffolding tool
* [NPM](https://www.npmjs.com/) - Dependency Management

## Authors

* **Miran Al Mehrab** - *developer* - [GitHub](https://github.com/MiranAlMehrab) [LinkedIn](https://www.linkedin.com/in/miranalmehrab/) [Twitter](https://twitter.com/miranmehrab)


## License

This project is licensed under the GPLv3 - see the [LICENSE](LICENSE) file for details
