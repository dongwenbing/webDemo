import regeneratorRuntime from 'wx-promise-pro'
import { method } from '../const/api';
const EncryUtil = require('./encryUtil');
let MAC_ADDRESS = ''
const SERVICE_UUID_PREFIX = '4342454C-4C4D-424C-0000-';
const CHARA_UUID_SYN_AND_CONTROL = "4342454C-4C4D-424C-170B-08091F140C0F";
/**开锁信息 */
let encryptInfo = {};
let curCmd = "";
/**本工具变量 */
let connectedDeviceId = ''
let currWriteServiceId = ''
let notifyCharacteristicsId = ''
let writeCharacteristicsId = ''
let notifyServicweId = ''
let writeServicweId = ''

let lockList = []
let services = "" // 连接设备的服务  
let blueDeviceList = []
let isdiscovering = false //是否扫描中
let isConnected = false //是否已经连接成功
let isInited = false
let isFindDevice = false //是否找到设备

let ConnResultBackCall = function() {} //连接结果回调


/*=============当前实例初始化蓝牙适配器==============*/
function InitData(item) {
    MAC_ADDRESS = item.MAC_ADDRESS
    console.log('设备mac', MAC_ADDRESS)
    wx.onBLEConnectionStateChange((res) => {
        // 该方法回调中可以用于处理连接意外断开等异常情况
        console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
        if (!res.connected) {
            closeConnect()
        } else {}
    })
}
//主动关闭蓝牙（终止搜索，关闭连接）
async function closeBle() {
    closeConnect(); //断开连接
    wx.closeBLEConnection({
        deviceId: MAC_ADDRESS,
        success(res) {
            console.log('--蓝牙断开成功--');
        }
    })
    wx.closeBluetoothAdapter({
        success() {
            console.log('--蓝牙关闭成功--');
        }
    });
}
async function initBluetooth(openInfo, callback) {
    ConnResultBackCall = callback
    InitData(openInfo)
    await closeBle();
    if (!wx.openBluetoothAdapter) {
        wx.showToast({ title: '当前微信版本过低，无法使用蓝牙功能', icon: 'none', duration: 2000 });
    }
    try {
        await wx.pro.openBluetoothAdapter();
        console.log('蓝牙启动成功')
        isInited = true;
        //蓝牙初始化完毕
        toDiscovering();
    } catch (err) {
        wx.showToast({ title: '请检查蓝牙是否开启', icon: 'none', duration: 2000 });
    }
}

/*==================检查蓝牙适配器状态,扫描获取蓝牙列表======================*/
async function toDiscovering() {
    try {
        !isInited && (await initBluetooth());
        let adapterState = await wx.pro.getBluetoothAdapterState();
        if (adapterState.available && !adapterState.discovering) { //本机蓝牙可用且未搜索状态
            await wx.pro.startBluetoothDevicesDiscovery({ //准备开始搜索设备
                allowDuplicatesKey: true,
            })
            await getDeviceList()
        } else if (adapterState.discovering) {
            console.log('正在扫描中...', adapterState.available)
        } else if (adapterState.available) {
            console.log('适配器不可用...', adapterState.available)
        }

    } catch (e) {
        wx.showToast({ title: '请确保手机蓝牙已开启', icon: 'none', duration: 2000 });
    }
}
async function getDeviceList() {
    wx.onBluetoothDeviceFound((res) => { //当周边发现新蓝牙时触发
        !isFindDevice && getBlueDevices(res.devices)
    })
    let data = await wx.pro.getBluetoothDevices()
    await getBlueDevices(data.devices)
}


async function getBlueDevices(devices) {
    try {
        isdiscovering = true
        console.log('搜索到设备', devices)
        for (var i = 0; i < devices.length; i++) {
            let currentItem = devices[i] || {};
            let macAdress = currentItem.advertisServiceUUIDs && currentItem.advertisServiceUUIDs[0]
            if (macAdress && macAdress.indexOf(SERVICE_UUID_PREFIX) > -1) {
                let dataArr = Array.prototype.map.call(new Uint8Array(currentItem.advertisData), x => ('00' + x.toString(16)).slice(-2)); //byte->hex
                let cipherID = dataArr.length >= 26 && dataArr.slice(19, 25).join('') //截取其中cipherID
                let deviceName = currentItem.name
                let RSSI = currentItem.RSSI
                let version = ((dataArr[2] >> 4) & 0x0f);
                macAdress = macAdress.replace(SERVICE_UUID_PREFIX, '')
                console.log('解析后macAdress', macAdress)
                if (macAdress && macAdress.length === 12) {
                    macAdress = macAdress.substring(0, 2) + ':' + macAdress.substring(2, 4) + ':' + macAdress.substring(4, 6) + ':' + macAdress.substring(6, 8) + ':' + macAdress.substring(8, 10) + ':' + macAdress.substring(10, 12);
                    newDevice(macAdress, cipherID, deviceName, version, RSSI)
                    if (macAdress.toUpperCase() == MAC_ADDRESS) { //找到设备，根据广播包中mac地址  匹配成功依据
                        connectedDeviceId = devices[i].deviceId
                        console.log('准备去连接', macAdress)
                        isFindDevice = true;
                        break;
                    }
                }
            }
        }
        if (isFindDevice) { //开始连接设备 
            await connectDevice(); //此后调用发生的异常都在此处catch里触发
        }
        console.log('blueDeviceList', blueDeviceList)
    } catch (e) {
        console.log('参数解析异常')
        closeConnect();
    }
}
/*==================连接设备,获取服务id======================*/
async function connectDevice() {
    wx.stopBluetoothDevicesDiscovery({
        success: (res) => {
            console.log("开始连接 停止搜索设备");
            isdiscovering = false;
        }
    })
    console.log('创建链接connectedDeviceId', connectedDeviceId)
    await wx.pro.createBLEConnection({
        deviceId: connectedDeviceId
    }) //去连接设备

    let res = await wx.pro.getBLEDeviceServices({ // 获取服务
        deviceId: connectedDeviceId
    })
    services = res.services //当前设备所有服务
    for (var i = 0; i < services.length; i++) { //服务选择第一个
        if (services[i].uuid.indexOf(SERVICE_UUID_PREFIX) == 0) { // 这个服务里包含了write read , nodify三个
            currWriteServiceId = services[i].uuid;
            console.log("services[i].uuid", services[i].uuid)
        }
    }

    console.log(`服务0000FFF0的uuid:${currWriteServiceId}`);
    await getCharacteristicsId(currWriteServiceId);
}
/*==================获取特征值======================*/
async function getCharacteristicsId(currServiceId) { // *currServiceId 来自服务的uuid 非设备uuid

    let res = await wx.pro.getBLEDeviceCharacteristics({
        deviceId: connectedDeviceId,
        serviceId: currServiceId
    })
    for (let item of res.characteristics) {
        if (item.uuid == CHARA_UUID_SYN_AND_CONTROL) {
            if (item.properties.write) {
                writeServicweId = currServiceId
                writeCharacteristicsId = item.uuid
            }
            if (item.properties.notify || item.properties.indicate) {
                notifyServicweId = currServiceId
                notifyCharacteristicsId = item.uuid
            }
        }
    }
    await startNotify();
    isConnected = true; //表 连接完全成功
    setTimeout(() => {
        console.log('已连接上，准备发送命令', isConnected)
        if (isConnected) {
            sendData(getSyncTimeBuffer());
        }
    }, 50) //直接开门
}
/*==================启动Notify,接受数据===================*/
async function startNotify() {
    await wx.pro.notifyBLECharacteristicValueChange({ //启用订阅功能
        state: true, // 启用 notify 功能  
        deviceId: connectedDeviceId,
        serviceId: currWriteServiceId,
        characteristicId: notifyCharacteristicsId,
    })
    console.log('notify启用成功')
    // 这里的回调可以获取到 write 导致的特征值改变    
    wx.onBLECharacteristicValueChange((res) => {
        //console.log('蓝牙返回结果', res)
        let characteristicId = res.characteristicId;
        let serviceId = res.serviceId;
        if (characteristicId == CHARA_UUID_SYN_AND_CONTROL && serviceId.startsWith(SERVICE_UUID_PREFIX)) {
            let str = ab2hex(res.value).toUpperCase();
            console.log("返回的数据 :", str);
            if (str.indexOf('FF000341434B') > -1) {
                console.log('时间同步')
                sendData(getEncryBuffer()); //时间同步响应//下一步 获取加密参数
            } else if (str.indexOf('FF0501') > -1) {
                console.log('加密参数')
                encryParamsCallback(str); //加密参数响应
            } else if (str.indexOf('FF0301') > -1) {
                //console.log('开门结果')
                sendResult(str); //返回开门结果
            }
        }
    })
}
/*==================断开连接======================*/
async function closeConnect() {
    isFindDevice = false;
    //不在扫描
    wx.stopBluetoothDevicesDiscovery({
        success: (res) => {
            console.log("停止搜索设备");
        }
    })



}

function newDevice(macAdress, cipherID, deviceName, version, RSSI) {
    let item = {
        macAdress,
        cipherID,
        deviceName,
        version,
        RSSI
    }
    let have = lockList.some(el => { return el.macAdress === macAdress });
    console.log(macAdress, have)
    if (!have) {
        lockList.push(item)
    }
}

function sendData(buffer, ) {
    wx.writeBLECharacteristicValue({
        deviceId: connectedDeviceId,
        serviceId: currWriteServiceId,
        characteristicId: writeCharacteristicsId,
        value: buffer,
        success(res) {
            console.log("写数据 writeBLECharacteristicValue success ");
        },
        fail(error) {
            console.log("写数据 writeBLECharacteristicValue fail", error);
        }
    })
}

function sendResult(value) {
    let data = value.substr(6, 2);
    let openSuccess = parseInt(data, 16) == 0;
    if (openSuccess) {
        ConnResultBackCall({ isSuccess: true })
        console.log('开门成功', openSuccess)
    } else {
        ConnResultBackCall({ isSuccess: false })
        console.log('开门失败', openSuccess, data)
    }
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function(bit) {
            return ('00' + bit.toString(16)).slice(-2)
        }
    )
    return hexArr.join('');
}

function CRC16(bytes) {
    let wCRCin = 0x0000;
    let wCPoly = 0x1021;
    let wChar = 0;
    let usDataLen = bytes.length

    for (let i = 0; i < usDataLen; i++) {
        wChar = bytes[i];
        wCRCin ^= (wChar << 8);
        for (let i = 0; i < 8; i++) {
            if (wCRCin & 0x8000)
                wCRCin = ((wCRCin << 1) & 0xFFFF) ^ wCPoly;
            else
                wCRCin = (wCRCin << 1) & 0xFFFF;
        }
    }

    return wCRCin;
}
//获取加密buff
function getEncryBuffer() {
    //一共11个字节
    let bufferLen = 11
    let buffer = new ArrayBuffer(bufferLen)
    let dataView = new DataView(buffer)
    let tmpData = [0xFF, 0x04, 0x06];
    //第3位到第8位 是本地生成的6个字节的随机数
    let encryParamsArr = []; //这个值要全局保存
    for (let i = 0; i < 6; i++) {
        encryParamsArr.push(EncryUtil.random(1, 256));
    }
    //console.log("###随机数", encryParamsArr);
    tmpData.push(...encryParamsArr);
    //全局保存encryptedParams值
    let encryptedParams = "";
    //转成16进制字符串，如aabbccddee
    for (let i = 0; i < encryParamsArr.length; i++) {
        let tmp = encryParamsArr[i].toString(16);
        if (tmp.length == 1) {
            tmp = "0" + tmp;
        }
        encryptedParams = encryptedParams + tmp;
    }
    encryptInfo.encryptedParams = encryptedParams;
    //console.log("##getEncryBuffer ", EncryUtil.arr2Hex(tmpData));

    for (let i = 0; i < bufferLen - 2; i++) {
        dataView.setUint8(i, tmpData[i])
    }
    let crcValue = CRC16(tmpData)
    //console.log(crcValue);
    dataView.setUint16(9, crcValue)
    return buffer;
}

function getSyncTimeBuffer() {
    let bufferLen = 9
    let buffer = new ArrayBuffer(bufferLen)
    let dataView = new DataView(buffer)
    let tmpData = [0xFF, 0x01, 0x04, ];
    //第3到第6位写入时间戳（秒级别）
    let timeStamp = Math.floor(new Date().getTime() / 1000); //1588748226; 
    let timeStampHex = timeStamp.toString(16);
    //console.log("timeStamp == " + timeStamp + ",timeStempHex == " + timeStampHex);

    //data前插入0xaa 强制同步时间
    // tmpData.push(170);
    //将时间戳转成小端模式
    for (let i = timeStampHex.length - 2; i >= 0; i -= 2) {
        tmpData.push(parseInt(timeStampHex.substr(i, 2), 16));
    }
    //console.log("##getSyncTimeBuffer ", EncryUtil.arr2Hex(tmpData));
    for (let i = 0; i < bufferLen - 2; i++) {
        dataView.setUint8(i, tmpData[i])
    }
    let crcValue = CRC16(tmpData)
    //console.log(crcValue)
    dataView.setUint16(7, crcValue)
    return buffer;
}
/**加密参数响应 */
function encryParamsCallback(value) {
    //取第3个字节的值
    let data = value.substr(6, 2);
    encryptInfo.encryptedParamsRes = parseInt(data, 16);
    //todo 根据返回的加密参数加密开门数据
    switch (curCmd) {
        case "ADD_MANAGE_CARD":
            break;
        case "DELETE_MANAGE_CARD":
            break;
        default:
            //发卡做完 要重构开锁加密功能
            sendData(getUnlockBuffer());;
            break;
    }
}
/**开门的buffer */
function getUnlockBuffer() {
    //console.log("##getUnclockBuffer encryptInfo", encryptInfo);
    //data 加密后的data 长度不固定
    let mac = MAC_ADDRESS.replace(/:/g, "") || '';
    let data = EncryUtil.getUnlockEncryData({
        encryptedParams: encryptInfo.encryptedParams || '',
        encryptedParamsRes: encryptInfo.encryptedParamsRes || 0,
        mac
    });
    //data插入至第3位
    let bufferLen = 5 + data.length;
    let buffer = new ArrayBuffer(bufferLen)
    let dataView = new DataView(buffer)
    let tmpData = [0xFF, 0x02, ]
    //第2个字节是data的长度
    tmpData.push(data.length);
    tmpData.push(...data);
    //console.log("##getUnlockBuffer ", EncryUtil.arr2Hex(tmpData));
    for (let i = 0; i < bufferLen - 2; i++) {
        dataView.setUint8(i, tmpData[i])
    }
    let crcValue = CRC16(tmpData)
    //console.log(crcValue)
    dataView.setUint16(bufferLen - 2, crcValue)
    return buffer;
}


module.exports = {
    initBluetooth,
    closeBle
}