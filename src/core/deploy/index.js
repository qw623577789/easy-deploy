const RemoteShell = require('../../module/remote_shell');
const LocalShell = require('../../module/local_shell');
const moment = require('moment');
const fs = require('fs');

module.exports = async(config) => {
    console.log(`\x1b[32m[Deploy] ${config.deploy.host}\x1b[0m`);
    if (config.deploy == undefined) {
        console.log(`\x1b[31m[Lack Of Deploy Node]\x1b[0m`);
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
    if (fs.statSync(localRoot).isDirectory && localRoot.substring(-1) != '/') localRoot += '/';
    let isRemoteMode = host != "localhost";
    if (isRemoteMode) await remoteConnectCheck(remote);
    if (isRemoteMode && backup != undefined) await remoteBackup(remote, remoteRoot, backup);
    if (hook != undefined && hook.preLocal != undefined) await localShell(hook.preLocal);
    if (isRemoteMode && hook != undefined && hook.preRemote != undefined) await remoteShell(remote, hook.preRemote);
    if (isRemoteMode) await rsync(remote, localRoot, remoteRoot, exclude);
    if (hook != undefined && hook.afterLocal != undefined) await localShell(hook.afterLocal);
    if (isRemoteMode && hook != undefined && hook.afterRemote != undefined) await remoteShell(remote, hook.afterRemote);
    console.log("\x1b[32m[Done]\x1b[0m");
}

async function remoteConnectCheck(remote) {
    console.log("\x1b[32m[Remote Connect] ...\x1b[0m");
    await remote.ping(false);
    console.log("\x1b[32m[Remote Connect] ✓\x1b[0m");
}

async function remoteBackup(remote, remoteRoot, backup) {
    if (backup != undefined) {
        console.log("\x1b[32m[Remote Backup] ...\x1b[0m");
        let {saveDir, pattern = 'YYYY-MM-DD HH:mm:ss', exclude = []} = backup;
        await remote.mkdir({path: saveDir, showDetail: false});
        await remote.shell({
            args: `if [ -e ${remoteRoot} ];then cd ${remoteRoot} && tar -zcvf ${saveDir}/${moment().format(pattern)}.tar.gz ./ ${exclude.map(_ => `--exclude=${_}`).join(' ')};fi`,
            showDetail: false
        })
        console.log("\x1b[32m[Remote Backup] ✓\x1b[0m");
    }
}

async function localShell(tasks) {
    console.log("\x1b[32m[Hook Local] ...\x1b[0m");
    for (let task of tasks) {
        await LocalShell.execute(task);
    }
    console.log("\x1b[32m[Hook Local] ✓\x1b[0m");
}

async function remoteShell(remote, tasks) {
    console.log("\x1b[32m[Hook Remote] ...\x1b[0m");
    for (let task of tasks) {
        task = `${task} --silent ${silentInput.map(_ => '--silentInput ' + _).join(' ')}`;
        await remote.shell({args: task});
    }
    console.log("\x1b[32m[Hook Remote] ✓\x1b[0m");
}

async function rsync(remote, localRoot, remoteRoot, exclude) {
    console.log("\x1b[32m[Rsync] ...\x1b[0m");
    await remote.mkdir({path: remoteRoot, showDetail: false});
    await remote.rsync({
        src: localRoot,
        dest: remoteRoot,
        exclude: exclude
    })
    console.log("\x1b[32m[Rsync] ✓\x1b[0m");
}