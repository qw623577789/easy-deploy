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
    
        let isRemoteMode = host != "localhost";
        if (isRemoteMode) await remoteConnectCheck(remote);
        if (isRemoteMode && backup != undefined) await remoteBackup(remote, remoteRoot, backup);
        if (hook != undefined && hook.preLocal != undefined) await localShell(hook.preLocal);
        if (isRemoteMode && hook != undefined && hook.preRemote != undefined) await remoteShell(remote, hook.preRemote);
        if (isRemoteMode) await rsync(remote, localRoot, remoteRoot, exclude);
        if (hook != undefined && hook.afterLocal != undefined) await localShell(hook.afterLocal);
        if (isRemoteMode && hook != undefined && hook.afterRemote != undefined) await remoteShell(remote, hook.afterRemote);
        console.log("\x1b[32mdone\x1b[0m");
    }

}

async function remoteConnectCheck(remote) {
    console.log("\x1b[32mcheck remote connect...\x1b[0m");
    await remote.ping(false);
}

async function remoteBackup(remote, remoteRoot, backup) {
    if (backup != undefined) {
        console.log("\x1b[32mremote backup...\x1b[0m");
        let {saveDir, pattern = 'YYYY-MM-DD HH:mm:ss', exclude = []} = backup;
        await remote.shell({
            args: `if [ -e ${remoteRoot} ];then cd ${remoteRoot} && tar -zcvf ${saveDir}/${moment().format(pattern)}.tar.gz ./ ${exclude.map(_ => `--exclude=${_}`).join(' ')};fi`,
            showDetail: false
        })
    }
}

async function localShell(tasks) {
    console.log("\x1b[32mhook local...\x1b[0m");
    for (let task of tasks) {
        await new Promise((resolve, reject) => {
            childProcess.exec(task, { stdio: [0, 1, 2] }, (error, stdout) => {
                if (error != undefined) return reject(error);
                console.log(`\x1b[36m${stdout}\x1b[0m`);
                return resolve(stdout);
            })
        })
    }
}

async function remoteShell(remote, tasks) {
    console.log("\x1b[32mhook remote...\x1b[0m");
    for (let task of tasks) {
        await remote.shell({args: task});
    }
}

async function rsync(remote, localRoot, remoteRoot, exclude) {
    console.log("\x1b[32mrsync...\x1b[0m");
    await remote.shell({args: `mkdir -p ${remoteRoot}`, showDetail: false})
    await remote.rsync({
        src: localRoot,
        dest: remoteRoot,
        exclude: exclude
    })
}