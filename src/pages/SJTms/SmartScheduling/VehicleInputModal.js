// ////////// 车辆手动输入弹窗 组件 //////////////////文件创建路径：D:\webCode\iwms-web\src\pages\SJTms\SmartScheduling\VehicleInputModal.js  由`陈光龙`创建 时间：2024/11/11 上午11:29
import React, { useState } from 'react'
import { InputNumber, message, Modal } from 'antd'

let weight // 重量
let volume // 体积
let count = 1 // 数量
let sxIndex = 1                           // 刷新页面索引
const VehicleInputModal = ({ open, onClose, addVehicle }) => {
  const [, setSx] = useState(0)          // 刷新页面状态
  const sxYm = () => setSx(++sxIndex)  // 刷新页面方法

  return (
    <Modal
      title="手动输入车辆信息"
      width={600}
      visible={open}
      onCancel={onClose}
      onOk={() => {
        if (!weight || !volume || !count) return message.error('请完整输入车辆信息')
        addVehicle({ weight, volume, vehicleCount: count })
        onClose()
      }}
    >
      车辆载重/t：<InputNumber max={50} min={0.5} value={weight} onChange={v => sxYm(weight = v)}/>&nbsp;&nbsp;
      车辆体积/m³：<InputNumber max={100} min={1} value={volume} onChange={v => sxYm(volume = v)}/>&nbsp;&nbsp;
      车辆数量：<InputNumber max={50} min={1} value={count} onChange={v => sxYm(count = v)}/>&nbsp;&nbsp;
    </Modal>
  )
}
export default VehicleInputModal
