const LocalShell = require('../local_shell');
const path = require('path');
const fs = require('fs');
module.exports = class {
    static async _execute(method, { script, name, namePrefix, args, env, nodeArgs, javaArgs, pm2OutFile, pm2ErrorFile, pm2PidFile, minAliveTime, restartLimitBeforeAlive, watch, ignoreWatch, watchFollowSymlinks }) {
        let basePath = fs.statSync(script).isDirectory() ? script : path.dirname(script);
        let startupConfig = {
            name: `${namePrefix}${name}`,
            cwd: basePath,
            script: script,
            env: {},
            node_args: "",
            args: "",
            min_uptime: minAliveTime,
            max_restarts: restartLimitBeforeAlive,
            watch,
            ignore_watch: ignoreWatch,
            watchFollowSymlinks,
            watch_options: {
                usePolling: true
            }
        }

        if (script.endsWith(".jar")) {
            let javaRuntimeParams = [];
            if (javaArgs != undefined) {
                javaRuntimeParams = javaRuntimeParams.concat(
                    Object.keys(javaArgs).map(key =>
                        javaArgs[key] == "" ?
                            `-${key}` :
                            `-${key}=${javaArgs[key]}`
                    )
                );
            }

            javaRuntimeParams.push("-jar", script);

            startupConfig.args += javaRuntimeParams.join(" ") + " ";

            startupConfig.script = "java";
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
        if (pm2OutFile != undefined) startupConfig['out_file'] = pm2OutFile;
        if (pm2ErrorFile != undefined) startupConfig['error_file'] = pm2ErrorFile;
        if (pm2PidFile != undefined) startupConfig['pid_file'] = pm2PidFile;

        await LocalShell.execute(`echo '${JSON.stringify([startupConfig])}' | pm2 ${method} --update-env - `);
    }

    static async start({
        script,
        name = 'default',
        namePrefix = '',
        args = undefined,
        env = undefined,
        nodeArgs = undefined,
        pm2OutFile = undefined,
        pm2ErrorFile = undefined,
        pm2PidFile = undefined,
        minAliveTime = 5000,
        restartLimitBeforeAlive = 1,
        watch = false,
        ignoreWatch = false,
        watchFollowSymlinks = false,
        javaArgs = undefined
    }) {
        return this._execute('start', { script, name, namePrefix, args, env, javaArgs, nodeArgs, pm2OutFile, pm2ErrorFile, pm2PidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks });
    }

    static async restart({
        script,
        name = 'default',
        namePrefix = '',
        args = undefined,
        env = undefined,
        nodeArgs = undefined,
        pm2OutFile = undefined,
        pm2ErrorFile = undefined,
        pm2PidFile = undefined,
        minAliveTime = 5000,
        restartLimitBeforeAlive = 1,
        watch = false,
        ignoreWatch = false,
        watchFollowSymlinks = false,
        javaArgs = undefined
    }) {
        return this._execute('restart', { script, name, namePrefix, args, env, javaArgs, nodeArgs, pm2OutFile, pm2ErrorFile, pm2PidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks });
    }

    static async stop({
        script,
        name = 'default',
        namePrefix = '',
        args = undefined,
        env = undefined,
        nodeArgs = undefined,
        pm2OutFile = undefined,
        pm2ErrorFile = undefined,
        pm2PidFile = undefined,
        minAliveTime = 5000,
        restartLimitBeforeAlive = 1,
        watch = false,
        ignoreWatch = false,
        watchFollowSymlinks = false,
        javaArgs = undefined
    }) {
        return this._execute('stop', { script, name, namePrefix, args, env, javaArgs, nodeArgs, pm2OutFile, pm2ErrorFile, pm2PidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks });
    }

    static async delete({
        script,
        name = 'default',
        namePrefix = '',
        args = undefined,
        env = undefined,
        nodeArgs = undefined,
        pm2OutFile = undefined,
        pm2ErrorFile = undefined,
        pm2PidFile = undefined,
        minAliveTime = 5000,
        restartLimitBeforeAlive = 1,
        watch = false,
        ignoreWatch = false,
        watchFollowSymlinks = false,
        javaArgs = undefined
    }) {
        return this._execute('delete', { script, name, namePrefix, args, env, javaArgs, nodeArgs, pm2OutFile, pm2ErrorFile, pm2PidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks });
    }
}