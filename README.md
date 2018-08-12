# easy-deploy
### 基于pm2与ansible的简易项目运行与发布node库

## 背景
对于一个采用微服务架构的项目，项目的运行与发布是件很麻烦的事．

需求点：
* 每个服务都有自己的运行参数及相关配置，而且往往开发、生产环境相关配置也不一样，这时需要有个地方能统一管理这些配置，并能方便的拉起，停止，重启，监控项目
* 项目发布一般会经历线上代码备份、代码发布、初始化操作、重新拉起程序(如果需要)，期间可能还会穿插一些本地、远程操作，希望能每个项目少写点发布代码，统一管理这个流程，而且内外网操作能在同一台机器上执行
* 批量多机部署

本库基于PM2对进程的管理，Ansible是款运维自动化工具，实现本机对外网机器操作．结合这两款工具实现对项目运行、部署管理

## 依赖要求

本机: node、pm2、ansible、python2.7、rsync

远程主机: node、pm2、python2.7

## 基本命令
```shell
  Usage: easy-deploy [options] [command]

  Options:

    -h, --help                       output usage information

  Commands:

    start [options] <config_file>    启动项目
    stop [options] <config_file>     停止项目
    restart [options] <config_file>  重启项目
    deploy <config_files...>         发布(多个)项目
    ecosystem <target_config_file>   生成配置模板,例如：xxx.js
```
```shell
  Usage: start [options] <config_file>

  启动项目

  Options:

    --only [server_names]  启动部分程序
    -h, --help      output usage information
```
```shell
  Usage: stop [options] <config_file>

  停止项目

  Options:

    --only <server_names>  停止部分程序
    -h, --help      output usage information
```
```shell
  Usage: restart [options] <config_file>

  重启项目

  Options:

    --only <server_names>  重启部分程序
    -h, --help      output usage information

```
## 配置模板
```js
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
```
