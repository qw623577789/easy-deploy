const { object, integer, array, empty, oneOf, boolean, string } = require('semantic-schema').schema;
module.exports = object().properties({
    apps: array().item(object().properties({
        name: string(),
        namePrefix: string(),
        script: string(),
        args: object().patternProperties({
            "^(.*)$": oneOf(string(), integer())
        }),
        env: object().patternProperties({
            "^(.*)$": oneOf(string(), integer())
        }),
        nodeArgs: object().patternProperties({
            "^(.*)$": oneOf(string(), integer())
        }),
        pm2OutFile: string(),
        pm2ErrorFile: string(),
        pm2PidFile: string(),
        minAliveTime: integer(),
        restartLimitBeforeAlive: integer().min(1)
    }).required('script')),
    deploy: object().properties({
        user: string(),
        host: string(),
        sshPort: integer(),
        privateSSHKeyFile: string(),
        localRoot: string(),
        remoteRoot: string(),
        exclude: array().item(string()),
        backup: object().properties({
            saveDir: string(),
            pattern: string(),
            exclude: array().item(string()),
        }).required('saveDir'),
        hook: object().properties({
            preLocal: array().item(string()),
            preRemote: array().item(string()),
            afterLocal: array().item(string()),
            afterRemote: array().item(string())
        })
    })
        .if.properties({host: 'localhost'})
        .then.required('host')
        .else.required('user', 'host', 'localRoot', 'remoteRoot')
        .endIf
}).required('apps')