var port = '7311'
var dev = {
    theme: {
        // name: 'theme1',
        // color: '#bfcbd9',
        // munebg: '#ad268d'
    },
    authhost: 'http://xing.aparcar.cn:7171',
    gateway: {
        // admin: 'http://a.test.aparcar.cn',
        // common: 'http://a.test.aparcar.cn/eatm',
        // device: 'http://a.test.aparcar.cn',
        admin: 'http://xing.aparcar.cn:' + port,
        common: 'http://xing.aparcar.cn:' + port,
        device: 'http://xing.aparcar.cn:' + port,
    },
    pageTableDefaultHeight: 500, //表格默认配置高度
    pageTableMaxHeight: 1000, //表格极限高度
    contract: {
        Bucket: 'zjjtest-1304136998',
        Region: 'ap-guangzhou',
    },
}

var test = {
    theme: {
        // name: 'theme2',
        // color: '#bfcbd9',
        // munebg: '#6b6060'
        // name: 'theme1',
        // color: '#bfcbd9',
        // munebg: '#ad268d'
    },
    authhost: 'https://oauth2.zhengjiajie.com',
    gateway: {
        admin: 'https://stage.zhengjiajie.com',
        common: 'https://stage.zhengjiajie.com',
        device: 'https://stage.zhengjiajie.com',
    },
    pageTableDefaultHeight: 500, //表格默认配置高度
    pageTableMaxHeight: 1000, //表格极限高度
    contract: {
        Bucket: 'face-1257614477',
        Region: 'ap-chengdu',
    },
}

var online = {
    theme: {
        name: 'theme1',
        color: '#bfcbd9',
        munebg: '#6b6060'
    },
    authhost: 'https://oauth2.sqygj.cn/',
    gateway: {
        admin: 'https://stage.sqygj.cn/gateway',
        common: 'https://stage.sqygj.cn/gateway',
        device: 'https://stage.sqygj.cn/gateway',
    },
    pageTableDefaultHeight: 500, //表格默认配置高度
    pageTableMaxHeight: 1000, //表格极限高度
    contract: {
        Bucket: 'face-1257614477',
        Region: 'ap-chengdu',
    },
}
window.config = dev;