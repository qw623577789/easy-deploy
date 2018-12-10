const childProcess = require('child_process');
const path = require('path');
module.exports = class {
    static async _execute(method, {script, name, namePrefix, args, env, nodeArgs, logOutFile, logErrorFile, logPidFile, minAliveTime, restartLimitBeforeAlive, watch, ignoreWatch, watchFollowSymlinks}) {
        let basePath = path.dirname(script);
        let startupConfig = {
            name: `${namePrefix}${name}`,
            script: script,
            env: {},
            node_args: "",
            args: "",
            min_uptime: minAliveTime,
            max_restarts: restartLimitBeforeAlive,
            watch: watch != false ? watch.map(_ => `${basePath}/${_}`) : watch,
            ignore_watch: ignoreWatch != false ? ignoreWatch.map(_ => `${basePath}/${_}`) : ignoreWatch,
            watchFollowSymlinks
        }

        if (args != undefined) {
            Object.keys(args).forEach(key => 
                args[key] == "" ?
                    startupConfig.args += `--${key} ` :
                    startupConfig.args += `--${key} ${args[key]} `
            )
        }

        if (nodeArgs != undefined) {
            Object.keys(nodeArgs).forEach(key => 
                nodeArgs[key] == "" ?
                    startupConfig.node_args += `--${key} ` :
                    startupConfig.node_args += `--${key}=${nodeArgs[key]} `
            )
        }

        if (env != undefined) {
            Object.keys(env).forEach(key => startupConfig.env[key] = env[key])
        }
        if (logOutFile != undefined) startupConfig['out_file'] = logOutFile;
        if (logErrorFile != undefined) startupConfig['error_file'] = logErrorFile;
        if (logPidFile != undefined) startupConfig['pid_file'] = logPidFile;

        await new Promise((resolve, reject) => {
            childProcess.exec(`echo '${JSON.stringify([startupConfig])}' | pm2 ${method} --update-env - `, { stdio: [0, 1, 2] }, (error, stdout) => {
                if (error != undefined) return reject(error);
                console.log(`\x1b[36m${stdout}\x1b[0m`);
                return resolve(stdout);
            })
        })
    }

    static async start({script, name = 'default', namePrefix = '', args = undefined, env = undefined, nodeArgs = undefined, logOutFile = undefined, logErrorFile = undefined, logPidFile = undefined, minAliveTime = 5000, restartLimitBeforeAlive = 1, watch = false, ignoreWatch = false, watchFollowSymlinks = false}) {
        return this._execute('start', {script, name, namePrefix, args, env, nodeArgs, logOutFile, logErrorFile, logPidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks});
    }

    static async restart({script, name = 'default', namePrefix = '', args = undefined, env = undefined, nodeArgs = undefined, logOutFile = undefined, logErrorFile = undefined, logPidFile = undefined, minAliveTime = 5000, restartLimitBeforeAlive = 1, watch = false, ignoreWatch = false, watchFollowSymlinks = false}) {
        return this._execute('restart', {script, name, namePrefix, args, env, nodeArgs, logOutFile, logErrorFile, logPidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks});
    }

    static async stop({script, name = 'default', namePrefix = '', args = undefined, env = undefined, nodeArgs = undefined, logOutFile = undefined, logErrorFile = undefined, logPidFile = undefined, minAliveTime = 5000, restartLimitBeforeAlive = 1, watch = false, ignoreWatch = false, watchFollowSymlinks = false}) {
        return this._execute('stop', {script, name, namePrefix, args, env, nodeArgs, logOutFile, logErrorFile, logPidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks});
    }

    static async delete({script, name = 'default', namePrefix = '', args = undefined, env = undefined, nodeArgs = undefined, logOutFile = undefined, logErrorFile = undefined, logPidFile = undefined, minAliveTime = 5000, restartLimitBeforeAlive = 1, watch = false, ignoreWatch = false, watchFollowSymlinks = false}) {
        return this._execute('delete', {script, name, namePrefix, args, env, nodeArgs, logOutFile, logErrorFile, logPidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks});
    }
}