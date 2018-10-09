const Ansible = require('node-ansible').AdHoc;
const fs = require('fs');
const uuid = require('uuid').v4;

module.exports = class {
    constructor({host = 'localhost', user, sshPort = 22, password = undefined, privateSSHKeyFile = undefined}) {
        this._host = host;
        this._user = user;
        this._sshPort = sshPort;
        this._privateSSHKeyFile = privateSSHKeyFile;
        this._password = password;
    }

    async _execute(moduleName, showDetail, args) {
        let ansible = new Ansible();
        let hostConfig = this._host == 'localhost' ? {} : {
            esc : {
                hosts: [this._host],
                vars: {
                    ansible_ssh_port: this._sshPort,
                    ansible_ssh_private_key_file: this._privateSSHKeyFile,
                    ansible_ssh_pass: this._password
                }
            }
        }
        let tmpFile = `/tmp/${uuid()}.py`;
        fs.writeFileSync(tmpFile, `#!/usr/bin/python\n#coding = utf-8\nimport json\nprint json.dumps(${JSON.stringify(hostConfig)})`);
        fs.chmodSync(tmpFile, "0777");
        let result = await ansible.module(moduleName)
            .user(this._user)
            .hosts("esc")
            .args(args)
            .inventory(tmpFile)
            .on('stdout', (data) => { 
                if (showDetail) console.log(`\x1b[36m${data.toString()}\x1b[0m`); }
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

    async shell({args, showDetail = true}) {
        return this._execute('shell', showDetail, args);
    }

    async mkdir({path, mode = "0777", showDetail = true}) {
        return this._execute('file', showDetail, `path=${path} state=directory`);
    }

    async rsync({src, dest, exclude = [], showDetail = true}) {
        let params = Object.assign({
            src: src,
            dest: dest,
            links: "no",
            dest_port: this._sshPort
        }, exclude.length == 0 ? {} : {rsync_opts: `${exclude.map(_ => `--exclude=${_}`).join(',')}`});
        return this._execute('synchronize', 
            showDetail,
            Object.keys(params).map(key => `${key}=${params[key]}`)
                .join(' ')
        )
    }
}