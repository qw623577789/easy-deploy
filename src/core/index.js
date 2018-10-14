const fs = require('fs');

module.exports = {
    start: async (configPath, params) => {
        let config = configCheck(configPath, params);
        return require('./startup/start')(config, params);
    },
    stop: async (configPath, params) => {
        let config = configCheck(configPath, params);
        return require('./startup/stop')(config, params);
    },
    restart: async (configPath, params) => {
        let config = configCheck(configPath, params);
        return require('./startup/restart')(config, params);
    },
    deploy: async (configPaths, params) => {
        for (let configPath of configPaths) {
            let config = configCheck(configPath, params);
            await require('./deploy')(config);
        } 
    }
}

function configCheck(configPath, params) {
    if (!fs.existsSync(configPath)) {
        console.log(`\x1b[31m${configPath} is not exist\x1b[0m`);
        process.exit(-1);
    }
    const Validator = require('semantic-schema').validator;
    let validator = new Validator(require(`${__dirname}/../schema`));
    if (params.silent == true) {
        easyDeploySilentMode = true;
        silentInput = [].concat(params.silentInput || []);
    }
    let json = require(configPath);
    let result = validator.validate(json);
    if (result == false) {
        console.log(`\x1b[31m invalid config: ${validator.errorsText()}\x1b[0m`);
        process.exit(-1);
    }
    return json;
}