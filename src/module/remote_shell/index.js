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
        let hostConfig = {
            [this._host] : {
                ansible_ssh_port: this._sshPort,
                ansible_ssh_private_key_file: this._privateSSHKeyFile,
                ansible_ssh_pass: this._password
            }
        }
        let tmpFile = `/tmp/${uuid()}.py`;
        fs.writeFileSync(tmpFile, `#!/usr/bin/python\n#coding = utf-8\nprint(${JSON.stringify(hostConfig)})`);
        fs.chmodSync(tmpFile, "0777");
        let result = await ansible.module(moduleName)
            .user(this._user)
            .hosts(this._host)
            .args(args)
            .inventory(tmpFile)
            .on('stdout', (data) => { 
                if (showDetail) console.log(`${data.indexOf('SUCCESS') != -1 ? "\x1b[36m":"\x1b[31m"}${data.toString()}\x1b[0m`); }
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

    async rsync({src, dest, exclude = [], showDetail = true}) {
        let params = {
            src: src,
            dest: dest,
            dest_port: this._sshPort,
            rsync_opts: `${exclude.map(_ => `--exclude=${_}`).join(',')}`
        }
        return this._execute('synchronize', 
            showDetail,
            Object.keys(params).map(key => `${key}=${params[key]}`)
                .join(' ')
        )
    }
}