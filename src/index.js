#!/usr/bin/env node
global.easyDeploySilentMode = false;
global.silentInput = [];

const path = require('path');
const fs = require('fs');
const cwd = process.cwd();

let commander = require('commander');
commander.command('start <config_file>')
    .option('--only [server_names]', '启动部分程序', (v, m) => m == undefined ? [v] : m.concat(v))
    .option('--exclude [server_names]', '排除部分程序启动', (v, m) => m == undefined ? [v] : m.concat(v))
    .option('--silent', '静默模式', (v) => v = true)
    .option('--silentInput [inputs]', '静默模式输入(按顺序)', (v, m) => m == undefined ? [v] : m.concat(v))
    .description('启动项目')
    .action((configFileOrEnv, {only, exclude, silent, silentInput}) => {
        let configPath = `${__dirname}/${path.relative(__dirname,  configFileOrEnv)}`;
        if (
            !fs.existsSync(configPath) && fs.existsSync(`${cwd}/deploy/${configFileOrEnv}`)
        ) {
            configPath = `${cwd}/deploy/${configFileOrEnv}`;
        }
        require(`${__dirname}/../src/core`).start(configPath, {only, exclude, silent, silentInput});
    })
    
commander.command('stop <config_file>')
    .description('停止项目')
    .option('--only [server_names]', '停止部分程序', (v, m) => m == undefined ? [v] : m.concat(v))
    .option('--exclude [server_names]', '排除部分程序停止', (v, m) => m == undefined ? [v] : m.concat(v))
    .option('--silent', '静默模式', (v) => v = true)
    .option('--silentInput [inputs]', '静默模式输入(按顺序)', (v, m) => m == undefined ? [v] : m.concat(v))
    .action((configFileOrEnv, {only, exclude, silent, silentInput}) => {
        let configPath = `${__dirname}/${path.relative(__dirname,  configFileOrEnv)}`;
        if (
            !fs.existsSync(configPath) && fs.existsSync(`${cwd}/deploy/${configFileOrEnv}`)
        ) {
            configPath = `${cwd}/deploy/${configFileOrEnv}`;
        }

        require(`${__dirname}/../src/core`).stop(configPath, {only, exclude, silent, silentInput});
    })

commander.command('restart <config_file>')
    .description('重启项目')
    .option('--only [server_names]', '重启部分程序', (v, m) => m == undefined ? [v] : m.concat(v))
    .option('--exclude [server_names]', '排除部分程序重启', (v, m) => m == undefined ? [v] : m.concat(v))
    .option('--silent', '静默模式', (v) => v = true)
    .option('--silentInput [inputs]', '静默模式输入(按顺序)', (v, m) => m == undefined ? [v] : m.concat(v))
    .action((configFileOrEnv, {only, exclude, silent, silentInput}) => {
        let configPath = `${__dirname}/${path.relative(__dirname,  configFileOrEnv)}`;
        if (
            !fs.existsSync(configPath) && fs.existsSync(`${cwd}/deploy/${configFileOrEnv}`)
        ) {
            configPath = `${cwd}/deploy/${configFileOrEnv}`;
        }

        require(`${__dirname}/../src/core`).restart(configPath, {only, exclude, silent, silentInput});
    })

commander.command('deploy <config_files...>')
    .description('发布(多个)项目')
    .option('--silent', '静默模式', (v) => v = true)
    .option('--silentInput [inputs]', '静默模式输入(按顺序),多个配置的话使用相同的输入', (v, m) => m == undefined ? [v] : m.concat(v))
    .action((configFileOrEnvs, {silent, silentInput}) => {
        let configFiles = configFileOrEnvs.map(configFileOrEnv => {
            let configPath = `${__dirname}/${path.relative(__dirname,  configFileOrEnv)}`;
            if (
                !fs.existsSync(configPath) && fs.existsSync(`${cwd}/deploy/${configFileOrEnv}`)
            ) {
                configPath = `${cwd}/deploy/${configFileOrEnv}`;
            }
            return configPath;
        })

        require(`${__dirname}/../src/core`).deploy(configFiles, {silent, silentInput});
    })

commander.command('ecosystem <target_config_file>')
    .description('生成配置模板,例如：xxx.js')
    .action((configFile) => {
        fs.copyFileSync(`${__dirname}/../template/demo.js`, `${__dirname}/${path.relative(__dirname,  configFile)}`);
        console.log(`\x1b[32mconfig ${__dirname}/${path.relative(__dirname,  configFile)} generated\x1b[0m`)
    })

commander.version(require('../package.json').version, '-v, --version')
commander.parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.outputHelp((txt) => `\x1b[33m${txt}\x1b[0m`);
}