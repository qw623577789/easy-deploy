const fs = require('fs');

module.exports = {
    start: async (configPath, only) => {
        let config = configCheck(configPath);
        return require('./startup/start')(config, only);
    },
    stop: async (configPath, only) => {
        let config = configCheck(configPath);
        return require('./startup/stop')(config, only);
    },
    restart: async (configPath, only) => {
        let config = configCheck(configPath);
        return require('./startup/restart')(config, only);
    },
    deploy: async (configPaths) => {
        let configs = configPaths.map(_ => configCheck(_));
        return require('./deploy')(configs);
    }
}

function configCheck(configPath) {
    if (!fs.existsSync(configPath)) throw new Error(`${configPath} is not exist`);
    const Validator = require('semantic-schema').validator;
    let validator = new Validator(require(`${__dirname}/../schema`));
    let json = require(configPath);
    let result = validator.validate(json);
    if (result == false) {
        console.log(`\x1b[31m invalid config: ${validator.errorsText()}\x1b[0m`);
        process.exit(-1);
    }
    return json;
}