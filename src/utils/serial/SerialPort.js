import { message } from 'antd';
import { getExtensionId, getBalanceConfig } from '@/utils/LoginContext';
import { BA } from '@/utils/serial/ByteArray';
export const SP = new SerialPort();

export function listenerData(callback) {
    if (!SP.getDevicesList) {
        if (callback) {
            callback('', '连接出错，检查插件和设置是否正常连接');
        }
        return;
    }

    const values = getBalanceConfig();
    if (!values || !values.portName) {
        if (callback) {
            callback('', '未配置端口，检查设备是否已连接');
        }
        return;
    }
    if (SP.isOpen()) {
        SP.closePort(res => {
            SP.openPort(values, res => {
                console.dir(res);
                if (res.result === "ok") {
                    bindEvent(values, callback);
                } else {
                    if (callback) {
                        callback('', '打开设备端口失败，检查插件是否正常');
                    }
                }
            });
        });
    } else {
        SP.openPort(values, res => {
            console.dir(res);
            if (res.result === "ok") {
                bindEvent(callback);
            } else {
                if (callback) {
                    callback('', '打开设备端口失败，检查插件是否正常');
                }
            }
        });
    }
}

export function bindEvent(portInfo, callback) {
    SP.setOnDataReceivedCallback(function (data) {
        let cds = undefined;
        if (portInfo.type == 'OS2CX') {
            cds = oscoxParseData(data);
        } else {
            cds = indParseData(data);
        }

        let result;
        if (cds) {
            result = parseFloat(cds);
        }

        let activeElement = document.activeElement;
        if (!activeElement) {
            return;
        }
        let placeholder = activeElement.getAttribute("placeholder");
        if (!placeholder || placeholder.indexOf('读称') < 0) {
            return;
        }
        if (!result || result === activeElement.value) {
            return;
        }
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setValue.call(activeElement, result);
        const event = new Event('input', { bubbles: true });
        activeElement.dispatchEvent(event);
        if (callback) {
            callback(result, '');
        }
    });
}

export function oscoxParseData(data) {
    var uint8Array = new Uint8Array(data);
    BA.push(uint8Array);
    //当字节长度大于48的时候开始读取，并删除之前保存的数据;
    if (BA.length >= 48) {
        let read48Bytes = BA.readBytes(48);
        let str = '';
        for (var j = 0; j < read48Bytes.length; j++) {
            if (read48Bytes[j] == 1 && read48Bytes[j + 1] == 2) {
                for (var i = j + 4; i < j + 10; i++) {
                    str = str.concat(String.fromCharCode(read48Bytes[i]));
                }
                return str.replace(/(^\s*)|(\s*$)/g, "");
            }
        }
    } else {
        return '';
    }
}

export function indParseData(data) {
    var uint8Array = new Uint8Array(data);
    BA.push(uint8Array);
    //当字节长度大于48的时候开始读取，并删除之前保存的数据;
    if (BA.length >= 48) {
        let read48Bytes = BA.readBytes(48);
        let netWeightStr = '';
        for (var j = 0; j < read48Bytes.length; j++) {
            //连续数据以十六进制 02 开始,0D结束 
            if (read48Bytes.length >= read48Bytes[j+16]  && read48Bytes[j] == 2 && read48Bytes[j+16] == 13) {
                //小数点标识
                var smallNumStatus = read48Bytes[j + 1];
                //称重模式 如：去皮
                var modeStatus = read48Bytes[j + 2];
                console.log(smallNumStatus.toString(2));
                var smallNumTwoHex = smallNumStatus.toString(2);
                var digits = 0;
                //判断小数点位数
                if(smallNumTwoHex && smallNumTwoHex.length == 6){
                    console.log( smallNumTwoHex.substring(3,6));
                    if('010' == smallNumTwoHex.substring(3,6)){
                        digits  = 1;
                    }else if('011' == smallNumTwoHex.substring(3,6)){
                        digits  = 0.1;
                    }else if('100' == smallNumTwoHex.substring(3,6)){
                        digits  = 0.01;
                    }else if('101' == smallNumTwoHex.substring(3,6)){
                        digits  = 0.001;
                    }else if('110' == smallNumTwoHex.substring(3,6)){
                        digits  = 0.0001;
                    }else{
                        return ''; 
                    }
                }
                //非去皮模式下
                if (modeStatus == 48) {
                    for (var i = j + 4; i < j + 10; i++) {
                        netWeightStr = netWeightStr.concat(String.fromCharCode(read48Bytes[i]));
                    }
                        return parseInt(netWeightStr.replace(/(^\s*)|(\s*$)/g, "")) * digits;
                }else{
                    for (var i = j + 4; i < j + 10; i++) {
                        netWeightStr = netWeightStr.concat(String.fromCharCode(read48Bytes[i]));
                    }
                    var  tareStr = ''; 
                    for (var i = j + 10; i < j + 16; i++) {
                        tareStr = tareStr.concat(String.fromCharCode(read48Bytes[i]));
                    }
                   // return parseInt(netWeightStr.replace(/(^\s*)|(\s*$)/g, "")) * digits + parseInt(tareStr.replace(/(^\s*)|(\s*$)/g, "")) * digits;
                   return parseInt(netWeightStr.replace(/(^\s*)|(\s*$)/g, "")) * digits
                }
            }else{
                return ''; 
            }
        }
    } else {
        return '';
    }
}

export function SerialPort() {
    var extensionId = getExtensionId();

    if (!chrome || !chrome.runtime || !extensionId) {
        return;
    }
    // Chrome App 分配的GUID
    var portGUID = localStorage.getItem("portGUID");

    // 使用app的ID与app建立外部连接，连接一旦建立，web端和app都想获得一个port对象

    var port = chrome.runtime.connect(extensionId);

    // 唯一的串口连接ID
    var serialConnectionId = localStorage.getItem("serialConnectionId");

    // 指示串口是否打开
    var isSerialPortOpen = portGUID && serialConnectionId ? true : false;

    // 当串口接收到数据时的回调函数，undefined表示它是纯虚函数
    var onDataReceivedCallback = undefined;

    // 串口报错时的回调函数
    var onErrorReceivedCallback = undefined;

    /**
     * 监听并处理来自app的消息
     * 可以处理的消息有（可自行添加）:
     * - guid -> 当与app连接成功时app发送给web的，用于表示当前页面与app 的连接
     * - serialdata -> 当串口有新数据接收时由app发送给web
     * - serialerror -> 当串口发生错误时由app发送给web
     */
    port.onMessage.addListener(
        function (msg) {
            if (msg.header === "guid") {
                portGUID = msg.guid;
                localStorage.setItem("portGUID", portGUID);
                console.log('端口链接：' + msg.guid);
            } else if (msg.header === "serialdata") {
                if (onDataReceivedCallback !== undefined) {
                    onDataReceivedCallback(new Uint8Array(msg.data).buffer);
                }
            } else if (msg.header === "serialerror") {
                console.dir(msg);
                onErrorReceivedCallback(msg.error);
            }
        }
    );

    // 检查串口是否已打开
    this.isOpen = function () {
        return isSerialPortOpen;
    }

    // 相当于纯虚函数，由web页面的callBack具体实现
    this.setOnDataReceivedCallback = function (callBack) {
        onDataReceivedCallback = callBack;
    }

    // 相当于纯虚函数，由web页面的callBack具体实现
    this.setOnErrorReceivedCallback = function (callBack) {
        onErrorReceivedCallback = callBack;
    }

    /**
     * 尝试打开一个串口
     * portInfo 必须包含以下:
     * portName  -> 串口地址
     * bitrate   -> 串口波特率
     * dataBits  -> 数据位 ("eight" or "seven")
     * parityBit -> 校验位 ("no", "odd" or "even")
     * stopBits  -> 停止位 ("one" or "two")
     * Callback用来处理app返回的结果，由于sendMessage是异步执行的函数
     */
    this.openPort = function (portInfo, callBack) {
        chrome.runtime.sendMessage(extensionId, {
            cmd: "open",
            portGUID: portGUID,
            info: portInfo
        },
            function (response) {
                if (response.result === "ok") {
                    isSerialPortOpen = true;
                    serialConnectionId = response.connectionInfo.connectionId;
                    localStorage.setItem("serialConnectionId", serialConnectionId);
                }
                callBack(response);
            }
        );
    }

    // 关闭一个串口
    this.closePort = function (callBack) {
        chrome.runtime.sendMessage(extensionId, {
            cmd: "close",
            connectionId: parseInt(serialConnectionId)
        },
            function (response) {
                if (response.result === "ok") {
                    isSerialPortOpen = false;
                    serialConnectionId = undefined;
                    localStorage.removeItem("serialConnectionId");
                }
                if (callBack) {
                    callBack(response.result === "ok")
                }
            }
        );
    };

    /**
     * 向串口写入数据
     * request 必须包含以下:
     * connectionId -> 串口连接ID
     * data         -> 要发送的字节流数组
     */
    this.write = function (data, callBack) {
        chrome.runtime.sendMessage(extensionId, {
            cmd: "write",
            connectionId: serialConnectionId,
            data: Array.prototype.slice.call(new Uint8Array(data))
        },
            function (response) {
                if (response.result === "ok") {
                    if (response.sendInfo.error !== undefined) {
                        if (response.sendInfo.error === "disconnected" || response.sendInfo.error === "system_error") {
                            isSerialPortOpen = false;
                            closePort(function () { });
                        }
                    }
                }
                callBack(response);
            }
        );
    }

    this.getDevicesList = function (callBack) {
        chrome.runtime.sendMessage(extensionId, {
            cmd: "list"
        }, res => callBack(res));
    }
}

export function isAppInstalled(callback) {
    let extensionId = getExtensionId();
    if (!chrome || !chrome.runtime || !extensionId) {
        if (callback) callback(false);
        return;
    }
    try {
        chrome.runtime.sendMessage(extensionId, {
            cmd: "installed"
        },
            function (response) {
                if (response) {
                    if (callback) callback(true);
                } else {
                    if (callback) callback(false);
                }
            }
        );
    } catch (error) {
        if (callback) callback(false);
    }
}