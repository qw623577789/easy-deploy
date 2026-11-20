const Ansible = require('node-ansible').AdHoc;
const fs = require('fs');
const uuid = require('uuid').v4;

module.exports = class {
    constructor({
        host = 'localhost',
        user,
        sshPort = 22,
        password = undefined,
        privateSSHKeyFile = undefined,
        jumperHost = undefined,
        jumperUser = undefined,
        jumperSSHPort = 22,
        pythonInterpreter = '/usr/bin/python3',
    }) {
        this._host = host;
        this._user = user;
        this._sshPort = sshPort;
        this._privateSSHKeyFile = privateSSHKeyFile;
        this._password = password;
        this._jumperHost = jumperHost;
        this._jumperUser = jumperUser;
        this._jumperSSHPort = jumperSSHPort;
        this._pythonInterpreter = pythonInterpreter;
    }

    async _execute(moduleName, showDetail, args) {
        let ansible = new Ansible();
        let hostConfig = {};
        let hostVars = {};
        if (this._host != 'localhost') {
            hostVars = {
                ansible_python_interpreter: this._pythonInterpreter,
                ansible_ssh_port: this._sshPort,
                ansible_ssh_private_key_file: this._privateSSHKeyFile,
                ansible_ssh_pass: this._password
            };
            hostConfig = {
                esc: {
                    hosts: [this._host],
                    vars: hostVars
                },
                _meta: {
                    hostvars: {
                        [this._host]: hostVars
                    }
                }
            };
        }

        //跳板机模式
        if (this._jumperHost != undefined && this._jumperUser != undefined && this._jumperSSHPort != undefined) {
            hostConfig.esc.vars.ansible_ssh_common_args = `-o ProxyCommand="ssh -W %h:%p -p ${this._jumperSSHPort} ${this._jumperUser}@${this._jumperHost}"`;

            //synchronize模块走独立rsync连接，需要use_ssh_args继承ProxyCommand配置
            if (moduleName == 'synchronize') {
                if (typeof args == 'string') {
                    args = `${args} use_ssh_args=yes`;
                } else {
                    args = {
                        ...args,
                        use_ssh_args: 'yes'
                    }
                }
            }
        }

        let tmpFile = `/tmp/${uuid()}.py`;
        fs.writeFileSync(tmpFile, `#!/usr/bin/env python3\n#coding = utf-8\nimport json\nprint(json.dumps(${JSON.stringify(hostConfig)}))`);
        fs.chmodSync(tmpFile, "0777");
        let result = await ansible.module(moduleName)
            .user(this._user)
            .hosts("esc")
            .args(args)
            .inventory(tmpFile)
            .on('stdout', (data) => {
                if (showDetail) console.log(`\x1b[36m${data.toString()}\x1b[0m`);
            }
            )
            .on('stderr', (data) => {
                console.log(`\x1b[31m${data.toString()}\x1b[0m`);
            })
            .exec();
        fs.unlinkSync(tmpFile);

        return result;
    }

    async ping(showDetail = true) {
        return this._execute('ping', showDetail);
    }

    async shell({ args, showDetail = true }) {
        return this._execute('shell', showDetail, args);
    }

    async mkdir({ path, mode = "0777", showDetail = true }) {
        return this._execute('file', showDetail, `path=${path} state=directory`);
    }

    async rsync({ src, dest, exclude = [], showDetail = true }) {
        let params = Object.assign({
            src: src,
            dest: dest,
            dest_port: this._sshPort,
        }, exclude.length == 0 ? {} : { rsync_opts: `${exclude.map(_ => `--exclude=${_}`).join(',')}` });
        return this._execute('synchronize',
            showDetail,
            Object.keys(params).map(key => `${key}=${params[key]}`)
                .join(' ')
        )
    }
}