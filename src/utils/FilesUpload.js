const { fileCDN } = require("../const/api")
const { Bucket, Region } = require("../const/config.js");
let COS = require("../utils/wx-cos.js")
let CosAuth = require('../utils/cos-auth.js');

let credentials = {}
let bllPath = 'tenement'
const fileType = '.jpg.png.gif'
const maxSize = 5
const modelType = 'pic'
let maxFileNum = 10;
const ep_file_type = {
    //其他文件类型 i_wufashibie
    "application/pdf": { type: 'pdf', icon: 'i_pdf1', color: '' },
    "image/jpeg": { type: 'jpg', icon: 'i_tupian1', color: '' },
    "image/png": { type: 'png', icon: 'i_tupian1', color: '' },
    "image/gif": { type: 'gif', icon: 'i_tupian1', color: '' },
    "text/plain": { type: 'txt', icon: 'i_txt', color: '' },
    "docx": { type: 'docx', icon: 'i_word', color: '' },
    "jpg": { type: 'jpg', icon: 'i_tupian1', color: '' },
    "png": { type: 'png', icon: 'i_tupian1', color: '' },
    "doc": { type: 'doc', icon: 'i_word', color: '' },
    "txt": { type: 'txt', icon: 'i_txt', color: '' },
    "pdf": { type: 'pdf', icon: 'i_pdf1', color: '' },
    "ppt": { type: 'ppt', icon: 'i_ppt', color: '' },
    "pptx": { type: 'ppt', icon: 'i_ppt', color: '' },
    "xls": { type: 'xls', icon: 'i_excel', color: '' },
    "xlsx": { type: 'xlsx', icon: 'i_excel', color: '' },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { type: 'docx', icon: 'i_word', color: '' },
    "application/msword": { type: 'doc', icon: 'i_word', color: '' },
};
let cos = null;
let selectType = '';
let initText = '';
let initOver = false;
let initLoading = false;
let initError = false;
let fileList = [];
let currentTokeninfo = {};
let currentfileId = ''
let filechangeCallBack = {}
//初始化文件结束事件
const initComplete = (success) => {
    console.log('初始化文件结束', success)
}
const canUp = () => {
    return fileList.length < maxFileNum
}
const cosFileInit = () => {
    initLoading = true;
    initError = false;
    return new Promise((resolve, reject) => {
        getAuthorizationInfo().then((res) => {
            if (res && res.content) {
                let secret = res.content;
                //console.log('aa', JSON.stringify(secret))
                currentTokeninfo = secret;
                credentials = secret && secret.token && secret.token.credentials;
                let expiredTime = secret && secret.token && secret.token.expiredTime;
                cos = new COS({
                    getAuthorization: (options, callback) => {
                        callback({
                            TmpSecretId: credentials.tmpSecretId,
                            TmpSecretKey: credentials.tmpSecretKey,
                            XCosSecurityToken: credentials.sessionToken,
                            ExpiredTime: expiredTime
                        })
                    }
                })

                if (cos.putObject && credentials.tmpSecretId) {
                    initLoading = false;
                    initError = false;
                    resolve(true);
                    initComplete(true);
                } else {
                    reject(false);
                }
            } else {
                reject(false);
            }
        }).catch((e) => {
            reject(false);
        })
    })
}
//初始化错误
const fileInitError = () => {
    initLoading = false;
    initError = true;
    initOver = true;
    initText = ''
    initComplete(false);
    filechangeCallBack({ error: '初始化图片上传失败' })
    console.log('初始化文件上传失败')
}
//文件上传
const cosFileUpload = ({ fileInfo, file }, callback) => {
    currentfileId = '';
    putObject(fileInfo, file, callback)
}
const putObject = (fileInfo, filePath, callback) => {
    initText = '上传中'
    initLoading = true;
    console.log('filePath', filePath)
    let suffix = fileSuffix(fileInfo.name) || '';
    var prefix = 'https://' + Bucket + '.cos.' + Region + '.myqcloud.com/';
    var requestTask = wx.uploadFile({
        url: prefix,
        name: 'file',
        filePath: filePath,
        formData: {
            'key': `${currentTokeninfo.path}/${currentTokeninfo.name}${suffix}`,
            'success_action_status': 200,
            'Signature': CosAuth({
                SecretId: credentials.tmpSecretId,
                SecretKey: credentials.tmpSecretKey,
                Method: 'POST',
                Pathname: '/',
            }),
            'x-cos-security-token': credentials.sessionToken,
            'Content-Type': '',
        },
        success: function(res) {
            if (res.statusCode === 200) {
                fileBind(fileInfo).then((bindres) => {
                    console.log('绑定完毕')
                    initText = ''
                    initLoading = false;
                    callback(bindres.content.resource_id);
                }).catch((err) => {
                    callback(err);
                })
            } else {
                filechangeCallBack({ error: '上传失败：' + JSON.stringify(res) })
            }
        },
        fail: function(res) {
            filechangeCallBack({ error: '上传失败：' + JSON.stringify(res) })
        }
    });
    requestTask.onProgressUpdate(function(res) {
        //console.log('正在进度:', res);
    });
}
const fileSuffix = (name, noD) => {
    if (!name) return name;
    let suffix = name && name.split('.')
    if (suffix.length == 1) {
        let type = ep_file_type[fileInfo && fileInfo.type || ''].type
        return noD ? type : '.' + type;
    } else if (suffix.length > 1) {
        return noD ? suffix[suffix.length - 1] : '.' + suffix[suffix.length - 1];
    }
}
//获取文件信息
const getfileInfo = (resource_id) => {
    return fileCDN.get({ resource_id })
}
const selectFile = (event, callback) => {
    filechangeCallBack = callback;
    //  if (!canUp()) return $notify({ type: 'danger', message: `最多上传${maxFileNum}个` })
    initText = '初始化'
    cosFileInit().then((success) => {
        if (success) {
            initOver = true;
            checkUpload(event)
        } else {
            fileInitError()
        }
    }).catch(() => {
        fileInitError()
    })
}
const checkUpload = (event) => {
    initText = '上传中';
    let fileInfo = event;
    let file = event.path
    if (!file) return;
    fileInfo.name = file.substr(file.lastIndexOf('/') + 1);
    let upObj = {
        event,
        file,
        fileInfo
    }
    beforeUpload(upObj)
}
const filelistChange = (list = []) => {
    filechangeCallBack(list)
    console.log('filelistChange', list)
}
const beforeUpload = (upObj) => {
    let { file, fileInfo } = upObj
    let { name, size, path } = fileInfo;
    if (name) {
        let fileInfo = { name, size, path, type: selectType, }
        let fileName = name;
        fileName = fileName || (new Date().getTime());
        cosFileUpload({ fileInfo, file, }, (resource_id) => {
            console.log('文件上传成功resource_id', resource_id)
            if (resource_id && modelType == 'pic') {
                getfileInfo(resource_id).then((res) => {
                    if (res && res.content && res.content.url) {
                        let fileItem = { fileName, fileId: resource_id, fileUrl: res.content.url, attributes: res.content.attributes };
                        //fileList.push(fileItem);
                        fileList[0] = fileItem;
                        filelistChange(fileList);
                        console.log('新增图片文件', fileList)
                    }
                })

            } else if (resource_id) {
                let fileItem = { fileName, fileId: resource_id, attributes: fileInfo };
                //fileList.push(fileItem);
                fileList[0] = fileItem;
                filelistChange(fileList);
            }
        });
    }
}
const fileListInit = (list) => {
    console.log(id + '初始化收到数据', list)
    if (!list) return fileList = []
    fileList = list.map((el, index) => {
        el.initFile = true; //初始化文件标识
        getfileInfo(el.fileId).then(res => {
            if (res.content && res.content.url) {
                el.fileUrl = res.content.url
                el.attributes = res.content.attributes;
                $forceUpdate();
            }
        })
        return el;
    });
    if (modelType === 'onePic' && list[0] && list[0].fileId) { //一个头像上传模板
        showPic(list[0].fileId)
    }
}
const checkSize = (size) => {
    let M = size / 1048576;
    if (M > maxSize) {
        filechangeCallBack({ error: `文件大小不能超过${maxSize}M` })
        return false
    } else {
        return true
    }
}
//删除文件
const removeFile = (Id) => {
    console.log('删除', Id)
    let list = [];
    fileList.map(el => {
        if (Id != el.fileId) {
            list.push(el)
        }
    });
    fileList = list;
    filelistChange(list);
}
//业务绑定文件
const fileBind = (fileInfo) => {
    let suffix = fileSuffix(fileInfo.name) || '';
    fileInfo.fileType = suffix.replace('.', '');
    let postData = {
        file_name: `${currentTokeninfo.path}/${currentTokeninfo.name}${suffix}`,
        attributes: fileInfo,
        resource_type: bllPath
    }
    return fileCDN.bind(postData)
}
const getAuthorizationInfo = () => {
    let params = {
        bucket: Bucket,
        region: Region,
        resource_type: bllPath
    }
    return fileCDN.cosToken(params)
}

module.exports = {
    selectFile,
    checkUpload,
    beforeUpload,
    fileListInit,
    checkSize,
    removeFile,
    fileSuffix,
    getfileInfo,
    putObject,
    cosFileUpload,
    getAuthorizationInfo,
    cosFileInit,
    fileInitError
};