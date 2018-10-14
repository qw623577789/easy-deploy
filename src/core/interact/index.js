const readline = require('readline-sync');

module.exports = {
    question: (tip, defaultValue = undefined) => {
        if (easyDeploySilentMode == true) return silentInput.shift();
        let params = {};
        if (defaultValue != undefined) {
            params['defaultInput'] = defaultValue;
            tip += `(默认值:${defaultValue})`;
        }
        let input = readline.question(tip, params);
        silentInput.push(input);
        return input;
    },
    file: (tip) => {
        if (easyDeploySilentMode == true) return silentInput.shift();
        let input = readline.questionPath(tip, {isFile: true});
        silentInput.push(input);
        return input;
    },
    dir: (tip) => {
        if (easyDeploySilentMode == true) return silentInput.shift();
        let input = readline.questionPath(tip, {isDirectory: true});
        silentInput.push(input);
        return input;
    },
    confirm: (tip) => {
        if (easyDeploySilentMode == true) return silentInput.shift();
        let input = readline.keyInYNStrict(tip);
        silentInput.push(input);
        return input;
    },
    select: (tip, options) => {
        if (easyDeploySilentMode == true) return silentInput.shift();
        let index = readline.keyInSelect(options, tip);
        let input = options[index];
        silentInput.push(input);
        return input;
    }
}