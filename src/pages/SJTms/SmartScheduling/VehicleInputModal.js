// ////////// 车辆手动输入弹窗 组件 //////////////////文件创建路径：D:\webCode\iwms-web\src\pages\SJTms\SmartScheduling\VehicleInputModal.js  由`陈光龙`创建 时间：2024/11/11 上午11:29
import React, { useState } from 'react';
import { Button, InputNumber, message, Modal } from 'antd';

let vehicleModelData = [
  { uuid: '1', name: '2.7电车', volume:6.075 , weight: 2 },
  { uuid: '2', name: '依维柯', volume: 6.075, weight: 2 },
  { uuid: '3', name: '常温车', volume: 18.48, weight: 6.5 },
  // { uuid: '4', name: '4米2厢式货车[常温/油]', volume: 18.48, weight: 6.5 },
  // { uuid: '5', name: '临时车', volume: 18.48, weight: 6.5 },
];


let weight; // 重量
let volume; // 体积
let count = 10; // 数量
let sxIndex = 1;                           // 刷新页面索引
const VehicleInputModal = ({ open, onClose, addVehicle }) => {
  const [, setSx] = useState(0);          // 刷新页面状态
  const sxYm = () => setSx(++sxIndex);  // 刷新页面方法

  return (
    <Modal
      title="输入车型信息"
      width={620}
      visible={open}
      onCancel={onClose}
      okText="添加并关闭"
      cancelText="关闭"
      onOk={() => {
        if (!weight || !volume || !count) return message.error('请完整输入车辆信息');
        addVehicle({ weight, volume, vehicleCount: count });
        onClose();
      }}
    >
      车辆载重/t：<InputNumber max={50} min={0.5} value={weight} onChange={v => sxYm(weight = v)}/>&nbsp;&nbsp;
      车辆体积/m³：<InputNumber max={100} min={1} value={volume} onChange={v => sxYm(volume = v)}/>&nbsp;&nbsp;
      车辆数量：<InputNumber max={50} min={1} value={count} onChange={v => sxYm(count = v)}/>&nbsp;&nbsp;&nbsp;&nbsp;
      <Button
        type="primary"
        onClick={() => {
          if (!weight || !volume || !count) return message.error('请完整输入车辆信息');
          addVehicle({ weight, volume, vehicleCount: count });
          message.success('添加成功');
        }}
      >
        添加
      </Button>

      <div style={{ marginTop: 15 }}>推荐车型：</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {vehicleModelData.map((item, index) =>
          <Button
            key={index}
            size="large"
            onClick={() => {
              weight = item.weight;
              volume = item.volume;
              sxYm();
            }}
          >
            {item.name}
            <div style={{ color: '#999', fontSize: 12 }}>({item.weight}t,{item.volume}m³)</div>
          </Button>
        )}
      </div>
    </Modal>
  );
};
export default VehicleInputModal;
