const RemoteShell = require('../../module/remote_shell');
const childProcess = require('child_process');
const moment = require('moment');

module.exports = async(configs) => {
    for (let config of configs) {
        console.log(`\x1b[32m${config.deploy.host} deploy ...\x1b[0m`);
        if (config.deploy == undefined) {
            console.log(`\x1b[31mlack of deploy node\x1b[0m`);
            process.exit(-1);
        }
    
        let {deploy: {
                user, 
                host, 
                sshPort = 22,
                privateSSHKeyFile = undefined,
                localRoot,
                remoteRoot,
                exclude = [],
                backup = undefined,
                hook = undefined
            }} = config;
        let remote = new RemoteShell({
            host,
            user,
            sshPort,
            privateSSHKeyFile
        });
    
        console.log("\x1b[32mcheck remote connect...\x1b[0m");
        await remote.ping(false);
    
        if (backup != undefined) {
            console.log("\x1b[32mremote backup...\x1b[0m");
            let {saveDir, pattern = 'YYYY-MM-DD HH:mm:ss', exclude = []} = backup;
            await remote.shell({
                args: `if [ -e ${remoteRoot} ];then cd ${remoteRoot} && tar -zcvf ${saveDir}/${moment().format(pattern)}.tar.gz ./ ${exclude.map(_ => `--exclude=${_}`).join(' ')};fi`,
                showDetail: false
            })
        }
    
        if (hook != undefined && hook.preLocal) {
            console.log("\x1b[32mhook: preLocal...\x1b[0m");
            for (let sh of hook.preLocal) {
                await new Promise((resolve, reject) => {
                    childProcess.exec(sh, { stdio: [0, 1, 2] }, (error, stdout) => {
                        if (error != undefined) return reject(error);
                        console.log(`\x1b[36m${stdout}\x1b[0m`);
                        return resolve(stdout);
                    })
                })
            }
        }
    
        if (hook != undefined && hook.preRemote) {
            console.log("\x1b[32mhook: preRemote...\x1b[0m");
            for (let sh of hook.preRemote) {
                await remote.shell({args: sh});
            }
        }
    
        console.log("\x1b[32mrsync...\x1b[0m");
        await remote.shell({args: `mkdir -p ${remoteRoot}`, showDetail: false})
        await remote.rsync({
            src: localRoot,
            dest: remoteRoot,
            exclude: exclude
        })
    
        if (hook != undefined && hook.afterLocal) {
            console.log("\x1b[32mhook: afterLocal...\x1b[0m");
            for (let sh of hook.afterLocal) {
                await new Promise((resolve, reject) => {
                    childProcess.exec(sh, { stdio: [0, 1, 2] }, (error, stdout) => {
                        if (error != undefined) return reject(error);
                        console.log(`\x1b[36m${stdout}\x1b[0m`);
                        return resolve(stdout);
                    })
                })
            }
        }
    
        if (hook != undefined && hook.afterRemote) {
            console.log("\x1b[32mhook: afterRemote...\x1b[0m");
            for (let sh of hook.afterRemote) {
                await remote.shell({args: sh});
            }
        }
    
        console.log("\x1b[32mdone\x1b[0m");
    }

}