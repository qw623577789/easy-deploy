const childProcess = require('child_process');
module.exports = class {
    static async execute(command, opts = {}) {
        await new Promise((resolve, reject) => {
            let stringCollection = "";
    
            let processor = childProcess.spawn(command, {
                shell: true,
                ...opts
            });
    
            let collect = (data) => {
                let output = "";
                stringCollection += data.toString();
                if (stringCollection.endsWith("\n")) {
                    output = stringCollection.substr(0, stringCollection.length - 1);
                }
                else {
                    let lastLineIndex = stringCollection.lastIndexOf("\n");
                    output = stringCollection.substring(0, lastLineIndex);
                }
                stringCollection = stringCollection.substring(output.length + 1);
                console.log(`\x1b[36m${output}\x1b[0m`);
            }
    
            processor.stdout.on('data', data => collect(data));
            processor.stderr.on('data', data => collect(data));
            processor.on('error', reject);
            processor.on('close', resolve);
        })
    }
}