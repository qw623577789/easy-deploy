const readline = require('readline-sync');

module.exports = {
    question: (tip, defaultValue = undefined) => {
        let params = {};
        if (defaultValue != undefined) {
            params['defaultInput'] = defaultValue;
            tip += `(默认值:${defaultValue})`;
        }
        return readline.question(tip, params);
    },
    file: (tip) => readline.questionPath(tip, {isFile: true}),
    dir: (tip) => readline.questionPath(tip, {isDirectory: true}),
    confirm: (tip) => readline.keyInYNStrict(tip),
    select: (tip, options) => {
        let index = readline.keyInSelect(options, tip);
        return options[index];
    }
}