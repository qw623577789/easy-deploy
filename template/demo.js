module.exports = {
    apps: [                                         //程序配置列表
        {
            namePrefix: "dev/business/",            //若存在，会自动给name加上该前缀
            name      : "activity",                 //pm2上显示的程序名字，默认:default
            script    : "/tmp/test.js",             //程序路径
            args      : {                           //若存在，则运行时添加运行参数
                "host": "0.0.0.0",
                "port": 20003,
                "logPath": "/tmp/activity",
            },                                      
            env: {                                  //若存在，则运行时添加env配置
                "host": "0.0.0.0",
            },
            nodeArgs : {                            //若存在，则运行时添加node配置
                "max-old-space-size": "4096"
            },
            // pm2OutFile: "",                      //程序标准输出日志文件位置,默认：~/.pm2/logs/app_name-out.log
            // pm2ErrorFile: "",                    //程序标准出错日志文件位置，默认:~/.pm2/logs/app_name-error.log
            // pm2PidFile: "",                      //程序进程id存放位置，默认:~/.pm2/pids/app_name-id.pid
            // errorRestartWatchInterval: "",       //程序报错重启侦测间隔，单位毫秒，默认:5000
            // errorRestartUnitLimit: ""            //重启侦测间隔内最多允许重启的次数，默认:15
        }
    ],
    deploy: {                                       //若存在，可执行发布操作
        user: "test",                               //登录名
        host: "10.10.4.87",                         //远程ip
        sshPort: 22,
        // privateSSHKeyFile: "",                   //登录密钥文件，默认系统配置
        localRoot: "/tmp/abc",                      //本地项目路径
        remoteRoot: "/tmp/abd/",                    //远程项目路径
        exclude: [                                  //若存在，同步到外网忽略的文件列表
            '8888.txt'                 
        ],
        backup: {                                   //若节点存在，则开启发布前备份
            saveDir: "/tmp",                        //备份文件存放路径
            pattern: "YYYY-MM-DD",                  //文件名规则，默认:YYYY-MM-DD HH:mm:ss,格式参见http://momentjs.com/docs/#/displaying/
            exclude: [                              //若存在，则备份时忽略文件列表
                '8888.txt'             
            ]
        },
        hook: {                                     //若节点存在，则发布操作触发钩子
            preLocal: [                             //若节点存在，则发布前本地执行的操作列表
                "echo 'local hello before deploy'"
            ],
            preRemote: [                            //若节点存在，则发布前远程执行的操作列表
                "echo 'remote hello before deploy'"
            ],
            afterLocal: [                           //若节点存在，则发布后本地执行的操作列表
                "echo 'local hello after deploy'"
            ],
            afterRemote: [                          //若节点存在，则发布后远程执行的操作列表
                "echo 'remote hello after deploy'"
            ]
        }
	}
}