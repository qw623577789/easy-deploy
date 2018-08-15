const PM2 = require('../../../module/pm2');

module.exports = async(config, {only, exclude}) => {
    let {apps: appsConfig} = config;
    let startAppsConfig = undefined;
    if (only == undefined && exclude == undefined) {
        startAppsConfig = appsConfig;
    }
    else if (only != undefined && exclude == undefined) {
        startAppsConfig = only.reduce((configs, name) => {
            let config = appsConfig.find(_ => _.name == name);
            if (config == undefined) return configs;
            configs.push(config);
            return configs;
        }, []);
    }
    else if (only == undefined && exclude != undefined) {
        startAppsConfig = exclude.reduce((configs, name) => {
            let config = appsConfig.find(_ => _.name != name);
            if (config == undefined) return configs;
            configs.push(config);
            return configs;
        }, []);
    }
    else {
        console.log(`\x1b[31mnot to use --only --exclude at the same time\x1b[0m`);
    }

    for (let config of startAppsConfig) {
        await PM2.restart(config);
    }
}