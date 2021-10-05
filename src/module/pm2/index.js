const LocalShell = require('../local_shell');
const path = require('path');
const fs = require('fs');
module.exports = class {
    static async _execute(method, { script, name, namePrefix, args, env, nodeArgs, javaArgs, logOutFile, logErrorFile, logPidFile, minAliveTime, restartLimitBeforeAlive, watch, ignoreWatch, watchFollowSymlinks }) {
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
        if (logOutFile != undefined) startupConfig['out_file'] = logOutFile;
        if (logErrorFile != undefined) startupConfig['error_file'] = logErrorFile;
        if (logPidFile != undefined) startupConfig['pid_file'] = logPidFile;

        await LocalShell.execute(`echo '${JSON.stringify([startupConfig])}' | pm2 ${method} --update-env - `);
    }

    static async start({
        script,
        name = 'default',
        namePrefix = '',
        args = undefined,
        env = undefined,
        nodeArgs = undefined,
        logOutFile = undefined,
        logErrorFile = undefined,
        logPidFile = undefined,
        minAliveTime = 5000,
        restartLimitBeforeAlive = 1,
        watch = false,
        ignoreWatch = false,
        watchFollowSymlinks = false,
        javaArgs = undefined
    }) {
        return this._execute('start', { script, name, namePrefix, args, env, javaArgs, nodeArgs, logOutFile, logErrorFile, logPidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks });
    }

    static async restart({
        script,
        name = 'default',
        namePrefix = '',
        args = undefined,
        env = undefined,
        nodeArgs = undefined,
        logOutFile = undefined,
        logErrorFile = undefined,
        logPidFile = undefined,
        minAliveTime = 5000,
        restartLimitBeforeAlive = 1,
        watch = false,
        ignoreWatch = false,
        watchFollowSymlinks = false,
        javaArgs = undefined
    }) {
        return this._execute('restart', { script, name, namePrefix, args, env, javaArgs, nodeArgs, logOutFile, logErrorFile, logPidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks });
    }

    static async stop({
        script,
        name = 'default',
        namePrefix = '',
        args = undefined,
        env = undefined,
        nodeArgs = undefined,
        logOutFile = undefined,
        logErrorFile = undefined,
        logPidFile = undefined,
        minAliveTime = 5000,
        restartLimitBeforeAlive = 1,
        watch = false,
        ignoreWatch = false,
        watchFollowSymlinks = false,
        javaArgs = undefined
    }) {
        return this._execute('stop', { script, name, namePrefix, args, env, javaArgs, nodeArgs, logOutFile, logErrorFile, logPidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks });
    }

    static async delete({
        script,
        name = 'default',
        namePrefix = '',
        args = undefined,
        env = undefined,
        nodeArgs = undefined,
        logOutFile = undefined,
        logErrorFile = undefined,
        logPidFile = undefined,
        minAliveTime = 5000,
        restartLimitBeforeAlive = 1,
        watch = false,
        ignoreWatch = false,
        watchFollowSymlinks = false,
        javaArgs = undefined
    }) {
        return this._execute('delete', { script, name, namePrefix, args, env, javaArgs, nodeArgs, logOutFile, logErrorFile, logPidFile, restartLimitBeforeAlive, minAliveTime, watch, ignoreWatch, watchFollowSymlinks });
    }
}