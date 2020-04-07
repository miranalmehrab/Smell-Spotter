var fs = require('fs');

export class Smell {
 
  readToken() {
    var tokens;
    fs.readFile(__dirname + '/output/output.txt', (err, data) => {
      if (err) {
        console.error(err);
      }
      tokens = data;
      console.log(data);
    });

    return tokens;
  }
}
