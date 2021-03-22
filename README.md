# salmon-demo
### Compiles and minifies for production
```
npm run build
```
### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 关键词
|  名称 |  作用描述 |说明|
| -- | --- |----
| vue | 版本：2.6.11|根据发展决定是否使用3.0
| vue-router | 路由插件|路由管理
| axios | 网络请求|好用
| mixins | 混入|轻松写代码|减少到处copy代码
|directives | 自定义指令|常用于自定义组件
| vuex | 数据状态管理模式|页面、组件相互数据传递
| sass |强大的CSS扩展语言 |编程式样式
| eslint |js规范 |为了健康的代码，辛苦点吧
| jest|测试 |写完代码记得写单元测试
| element-ui |优秀后台组件库 |根据项目类型适当选用，当前未引入
| ECharts5 |优秀图表组件库 |根据项目类型适当选用，当前未引入
| element-ui |优秀后台组件库 |根据项目类型适当选用，当前未引入
| vue-video-player |视频录播，直播（m3u8,rtmp） |根据项目类型适当选用，当前未引入
| vue-qrcode |生成二维码 |根据项目类型适当选用，当前未引入
| cos-js-sdk-v5 |腾讯js-sdk |微信分享功能会用到，当前未引入
| icon-front |阿里巴巴公开图标库 |大量小图标
| vant |移动端ui组件库 |他们家的后台组件库没element-ui好


## 项目引用
#### 配置文件 config.js
```
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

window.config = config;
```
|  属性 |  作用描述 |说明|
| -- | --- |----
| host | 业务接口|http://xing.aparcar.cn:7172
| authhost |身份授权token |http://xing.aparcar.cn:7171
| pageTableDefaultHeight |表格默认高度 |500（px）
| pageTableMaxHeight |表格自动填充最大高度 |1000（px）
| contract |存储桶配置属性 |{Bucket: 'face-1257614477',Region: 'ap-chengdu',}


#### 工具介绍

|  工具名称 |  作用描述 |
| -- | --- |
| eptimes.js | 时间格式化，转化工具|
| validator.js |正则验证工具 |
| connbluetooth.js |蓝牙连接工具 |蓝牙门锁，车位锁等，小程序里面用的比较多
| rpx2px.js |样式coding辅助 |轻松写样式





#### 关键方法介绍
|  方法名称 |  用途 |说明|
| ----- | -- |-----|
| accAdd accDel， accMul accDiv（加减，乘除） | 计算使用|1，2参数为计算参数，第三个默认false，返回值是否取2位精度（四舍五入）|
| fileupload |上传图片到腾讯云 |上传成功后返回文件名|
| getcosimgUrl |腾讯云获取可访问图片地址 ||
| isCurrentPage |判断访问路由是否是当前页 |返回布尔值|
| base64_encode |字符串base64编码 |base64字符串|


#### 组件库
###### 文件上传
###### FilesUpload
|  属性 |  用途 |说明|
| ----- | -- |-----|
| bllPath | 业务目录配置项|不传会报错，组件不能使用
| fileType | 文件上传类型|不传默认 .pdf.jpg.jpeg.png.gif.txt.doc.docx.xls.xlsx
| id | 组件id|同一页面多个使用注意id不要重复
| showClose | 控制显示删除icon|旧文件（初始化文件）不显示删除
| maxSize | 文件限制大小|默认1M
| ref | 组件对象|自己命名
| filelistChange | 文件新增或删除回调方法|参数返回最新文件数组
| customize | 定义模式|组件不提供渲染列表，请使用默认插槽根据filelistChange数据自己渲染
| cover | 配置是否覆盖|用户1个文件上传时使用
| delFile | 删除列表文件方法|this.$refs['filesUpload'].delFile(fileId)
| maxFileNum | 限制文件上传个数|默认 -1  不限制
| initComplete | 组件初始化完毕事件|主要给自定义模式使用
| ~~oneType~~ | 单文件模式|组件已不支持
| ~~onetypeCustomize~~ | 已废除|组件已不支持，请使用customize

###### 初始化数据

```
   初始化数组数据
        initfileData:[{
            fileName: "孝昌县花园镇.pdf",
            fileId: 72654567865
        }]

     eg：
        this.$refs['filesUpload'].fileListInit(initfileData);
```
```
    自定义模式
        <filesUpload @filelistChange="filelistChange" ref="filesUpload" customize :initfileData="initfileData" id="company">
            默认插槽，你可以把filelistChange的文件列表写这里来
        </filesUpload> 

        上传方法调用
        this.$refs['filesUpload'].selectFile();//打开文件选择

        文件打开需要自己获取 图片地址
        接口为  utils.api.getfileInfo
        可参考本组件  getfileInfo  方法

        和使用  window.open(res.content.url)  新窗口打开文件
 ```    
 ```   
     initComplete 方法
        需要接收initComplete方法通知组件初始化完毕标记（有的人在组件初始化未完毕前调用上传会失败）
        所以在自定义模式下，需要主动接收initComplete方法回调，来决定自定义  上传文件 按钮是否可用      
 ```   
 ```
ep_file_type对照
            ep_file_type: {
                "application/pdf": 'pdf',
                "image/jpeg": 'jpg',
                "image/png": 'png',
                "image/gif": 'gif',
                "text/plain": 'txt',
                "docx": 'docx',
                "doc": 'doc',
                "xls": 'xls',
                "xlsx": 'xlsx',
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 'docx',
                "application/msword": 'doc',
            },
 ```
### 没有啦~暂时就这些，后续文档持续更新


