#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
let commander = require('commander');
commander.command('start <config_file>')
    .option('--only [server_names]', '启动部分程序', (v, m) => m == undefined ? [v] : m.concat(v))
    .option('--exclude [server_names]', '排除部分程序启动', (v, m) => m == undefined ? [v] : m.concat(v))
    .description('启动项目')
    .action((configFile, {only, exclude}) => {
        require(`${__dirname}/../src/core`).start(`${__dirname}/${path.relative(__dirname,  configFile)}`, {only, exclude});
    })
    
commander.command('stop <config_file>')
    .description('停止项目')
    .option('--only [server_names]', '停止部分程序', (v, m) => m == undefined ? [v] : m.concat(v))
    .option('--exclude [server_names]', '排除部分程序停止', (v, m) => m == undefined ? [v] : m.concat(v))
    .action((configFile, {only, exclude}) => {
        require(`${__dirname}/../src/core`).stop(`${__dirname}/${path.relative(__dirname,  configFile)}`, {only, exclude});
    })

commander.command('restart <config_file>')
    .description('重启项目')
    .option('--only [server_names]', '重启部分程序', (v, m) => m == undefined ? [v] : m.concat(v))
    .option('--exclude [server_names]', '排除部分程序重启', (v, m) => m == undefined ? [v] : m.concat(v))
    .action((configFile, {only, exclude}) => {
        require(`${__dirname}/../src/core`).restart(`${__dirname}/${path.relative(__dirname,  configFile)}`, {only, exclude});
    })

commander.command('deploy <config_files...>')
    .description('发布(多个)项目')
    .action((configFiles) => {
        require(`${__dirname}/../src/core`).deploy(configFiles.map(_ => `${__dirname}/${path.relative(__dirname,  _)}`));
    })

commander.command('ecosystem <target_config_file>')
    .description('生成配置模板,例如：xxx.js')
    .action((configFile) => {
        fs.copyFileSync(`${__dirname}/../template/demo.js`, `${__dirname}/${path.relative(__dirname,  configFile)}`);
        console.log(`\x1b[32mconfig ${__dirname}/${path.relative(__dirname,  configFile)} generated\x1b[0m`)
    })    
commander.parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.outputHelp((txt) => `\x1b[33m${txt}\x1b[0m`);
}