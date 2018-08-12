const PM2 = require('../../../module/pm2');

module.exports = async(config, only) => {
    let {apps: appsConfig} = config;
    let startAppsConfig = only != undefined ? only.reduce((configs, name) => {
        let config = appsConfig.find(_ => _.name == name);
        if (config == undefined) return configs;
        configs.push(config);
        return configs;
    }, []) : appsConfig;

    for (let config of startAppsConfig) {
        await PM2.restart(config);
    }
}