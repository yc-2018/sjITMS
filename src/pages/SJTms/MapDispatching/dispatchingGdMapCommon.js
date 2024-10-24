// ////////// 调度公共方法  //////////////////文件创建路径：D:\webCode\iwms-web\src\pages\SJTms\MapDispatching\DispatchingGdMapCommon.js  由`陈光龙`创建 时间：2024/10/8 15:18
import { uniqBy } from 'lodash'
import { message } from 'antd'

/** 门店图标颜色 */
export const colors = [
  '#0069FF',
  '#EF233C',
  '#20BF55',
  '#07BEB8',
  '#FF715B',
  '#523F38',
  '#FF206E',
  '#086375',
  '#A9E5BB',
  '#8F2D56',
  '#004E98',
  '#5D576B',
  '#248232',
  '#9A031E',
  '#8E443D',
  '#F15152',
  '#F79256',
  '#640D14',
  '#3F88C5',
  '#0FA3B1',
]

/** 计算小数 */
export const accAdd = (arg1, arg2) => {
  if (Number.isNaN(arg1)) {
    arg1 = 0
  }
  if (Number.isNaN(arg2)) {
    arg2 = 0
  }
  arg1 = Number(arg1)
  arg2 = Number(arg2)
  let r1
  let r2
  let m
  let c
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  c = Math.abs(r1 - r2)
  m = 10 ** Math.max(r1, r2)
  if (c > 0) {
    const cm = 10 ** c
    if (r1 > r2) {
      arg1 = Number(arg1.toString().replace('.', ''))
      arg2 = Number(arg2.toString().replace('.', '')) * cm
    } else {
      arg1 = Number(arg1.toString().replace('.', '')) * cm
      arg2 = Number(arg2.toString().replace('.', ''))
    }
  } else {
    arg1 = Number(arg1.toString().replace('.', ''))
    arg2 = Number(arg2.toString().replace('.', ''))
  }
  return (arg1 + arg2) / m
}

/** 一家门店多份运输订单数量合并 */
export const getOrderTotal = (state, storeCode) => {
  const { orders, checkScheduleOrders } = state
  const totals = {
    cartonCount: 0,             // 整件数
    scatteredCount: 0,          // 散件数
    containerCount: 0,          // 周转箱
    coldContainerCount: 0,      // 冷藏周转筐+++
    freezeContainerCount: 0,    // 冷冻周转筐+++
    insulatedContainerCount: 0, // 保温箱+++
    insulatedBagCount: 0,       // 保温袋+++
    freshContainerCount: 0,     // 鲜食筐+++
    volume: 0,                  // 体积
    weight: 0,                  // 重量,
  }
  const isOrder = [...orders, ...checkScheduleOrders].filter(
    e => e.deliveryPoint.code === storeCode
  )
  isOrder.forEach(e => {
    totals.cartonCount += e.cartonCount
    totals.scatteredCount += e.scatteredCount
    totals.containerCount += e.containerCount
    totals.coldContainerCount += e.coldContainerCount           // 冷藏周转筐+++
    totals.freezeContainerCount += e.freezeContainerCount       // 冷冻周转筐+++
    totals.insulatedContainerCount += e.insulatedContainerCount // 保温箱+++
    totals.insulatedBagCount += e.insulatedBagCount             // 保温袋+++
    totals.volume = accAdd(totals.volume, e.volume)
    totals.weight = accAdd(totals.weight, e.weight)
  })
  return totals
}

/**
 * 设置坐标点提示文字
 * @return {string} 高德要的一定是字符串！！！
 * @author ChenGuangLong
 * @since 2024/9/23 17:07
 */
export const setMarkerText = (state, order) => {
  const { multiVehicle } = state
  const infoTotals = getOrderTotal(state, order.deliveryPoint.code)
  const showMultiVehicle = () =>
    multiVehicle ? `
        <div style="display: flex; text-align: center;">
          <div style="flex: 1;">冷藏周转筐</div>
          <div style="flex: 1;">冷冻周转筐</div>
          <div style="flex: 1;">保温袋</div>
          <div style="flex: 1;">鲜食筐</div>
        </div>
        <div style="display: flex; text-align: center;">
          <div style="flex: 1;">${infoTotals.coldContainerCount}</div>
          <div style="flex: 1;">${infoTotals.freezeContainerCount}</div>
          <div style="flex: 1;">${infoTotals.insulatedBagCount}</div>
          <div style="flex: 1;">${infoTotals.freshContainerCount}</div>
        </div>
        ` : ''

  return `
    <div style="width: auto; height: auto; padding: 5px; background: #FFF;">
      <div style="font-weight: bold; white-space: nowrap;">
        [${order.deliveryPoint.code}]${order.deliveryPoint.name}
      </div>
      <hr style="margin: 5px 0 0 0;" />
      <div style="display: flex;">
        <div style="flex: 1;">线路：${order.archLine?.code ?? ''}</div>
        <div style="flex: 1;">备注：${order.archLine?.lineNote ?? ''}</div>
      </div>
      <div>配送区域：${order?.shipAreaName ?? ''}</div>
      <div>门店地址：${order?.deliveryPoint?.address ?? ''}</div>

      <div style="display: flex; margin-top: 5px; text-align: center;">
        <div style="flex: 1;">整件数</div>
        <div style="flex: 1;">散件数</div>
        <div style="flex: 1;">周转箱</div>
        <div style="flex: 1;">体积</div>
        <div style="flex: 1;">重量</div>
      </div>
      <div style="display: flex; text-align: center;">
        <div style="flex: 1;">${infoTotals.cartonCount}</div>
        <div style="flex: 1;">${infoTotals.scatteredCount}</div>
        <div style="flex: 1;">${infoTotals.containerCount}</div>
        <div style="flex: 1;">${infoTotals.volume}</div>
        <div style="flex: 1;">${(infoTotals.weight / 1000).toFixed(3)}</div>
      </div>
      ${showMultiVehicle()}
    </div>
  `
}

/** 获取总合计数 */
export const getTotals = (state, selectOrder) => {
  const { orders, bearweight, volumet } = state
  const selectOrderStoreCodes = selectOrder.map(e => e.deliveryPoint.code)
  const allSelectOrders = orders.filter(e => selectOrderStoreCodes.indexOf(e.deliveryPoint?.code) !== -1)
  const orderTotals = allSelectOrders.length === 0 ? selectOrder : allSelectOrders;
  let totals = {
    cartonCount: 0,             // 整件数
    scatteredCount: 0,          // 散件数
    containerCount: 0,          // 周转箱
    coldContainerCount: 0,      // 冷藏周转筐+++
    freezeContainerCount: 0,    // 冷冻周转筐+++
    insulatedContainerCount: 0, // 保温箱+++
    insulatedBagCount: 0,       // 保温袋+++
    freshContainerCount: 0,     // 鲜食筐+++
    volume: 0,                  // 体积
    weight: 0,                  // 重量,
    totalCount: 0,              // 总件数
    stores: selectOrderStoreCodes.length,
  }
  orderTotals.forEach(e => {
    totals.cartonCount += e.cartonCount
    totals.scatteredCount += e.scatteredCount
    totals.containerCount += e.containerCount
    totals.coldContainerCount += e.coldContainerCount           // 冷藏周转筐+++
    totals.freezeContainerCount += e.freezeContainerCount       // 冷冻周转筐+++
    totals.insulatedContainerCount += e.insulatedContainerCount // 保温箱+++
    totals.insulatedBagCount += e.insulatedBagCount             // 保温袋+++
    totals.volume = accAdd(totals.volume, e.volume)
    totals.weight = accAdd(totals.weight, e.weight)
  })
  // totals.totalCount = totals.cartonCount + totals.scatteredCount + totals.containerCount * 2;
  // 总件数 = 整件+ 散件+（周转筐 + 冷藏）*2 + 冷冻*3 + 保温袋 + 鲜食筐
  totals.totalCount =
    totals.cartonCount +
    totals.scatteredCount +
    (totals.containerCount + totals.coldContainerCount) * 2 +
    totals.freezeContainerCount * 3 +
    totals.insulatedBagCount +
    totals.freshContainerCount

  totals = { ...totals, bearweight, volumet }
  return totals
}

/** 计算所有(底部统计数据) */
export const getAllTotals = orders => {
  const totals = {
    cartonCount: 0,             // 整件数
    scatteredCount: 0,          // 散件数
    containerCount: 0,          // 周转箱
    coldContainerCount: 0,      // 冷藏周转筐+++
    freezeContainerCount: 0,    // 冷冻周转筐+++
    insulatedContainerCount: 0, // 保温箱+++
    insulatedBagCount: 0,       // 保温袋+++
    freshContainerCount: 0,     // 鲜食筐+++
    volume: 0,                  // 体积
    weight: 0,                  // 重量,
    totalCount: 0,              // 总件数
    stores: 0,                  // 总门店数
  }
  const totalStores = []
  orders.forEach(e => {
    totals.cartonCount += e.cartonCount                         // 整件数
    totals.scatteredCount += e.scatteredCount                   // 散件数
    totals.containerCount += e.containerCount                   // 周转箱
    totals.coldContainerCount += e.coldContainerCount           // 冷藏周转筐+++
    totals.freezeContainerCount += e.freezeContainerCount       // 冷冻周转筐+++
    totals.insulatedContainerCount += e.insulatedContainerCount // 保温箱+++
    totals.insulatedBagCount += e.insulatedBagCount             // 保温袋+++
    totals.freshContainerCount += e.freshContainerCount         // 鲜食筐+++
    totals.volume = accAdd(totals.volume, e.volume)
    totals.weight = accAdd(totals.weight, e.weight)
    if (totalStores.indexOf(e.deliveryPoint.code) === -1) {
      totalStores.push(e.deliveryPoint.code)
    }
  })
  totals.stores = totalStores.length
  // totals.totalCount = totals.cartonCount + totals.scatteredCount + totals.containerCount * 2;
  // 总件数 = 整件+ 散件+（周转筐 + 冷藏）*2 + 冷冻*3 + 保温袋 + 鲜食筐
  totals.totalCount =
    totals.cartonCount +
    totals.scatteredCount +
    (totals.containerCount + totals.coldContainerCount) * 2 +
    totals.freezeContainerCount * 3 +
    totals.insulatedBagCount +
    totals.freshContainerCount
  return totals
}

/** 订单类型校验 */
export const validateOrder = orders => {
  const orderType = uniqBy(orders.map(x => x.orderType));
  if (orderType.includes('Returnable') && orderType.some(x => x !== 'Returnable')) {
    message.error('门店退货类型运输订单不能与其它类型订单混排，请检查！');
    return false;
  }
  if (orderType.includes('TakeDelivery') && orderType.some(x => x !== 'TakeDelivery')) {
    message.error('提货类型运输订单不能与其它类型订单混排，请检查！');
    return false;
  }
  // 不可共配校验
  let owners = [...orders].map(x => ({ ...x.owner, noJointlyOwnerCodes: x.noJointlyOwnerCode }))
  owners = uniqBy(owners, 'uuid');
  const checkOwners = owners.filter(x => x.noJointlyOwnerCodes);
  let noJointlyOwner;
  checkOwners.forEach(owner => {
    // 不可共配货主
    const noJointlyOwnerCodes = owner.noJointlyOwnerCodes.split(',');
    const noJointlyOwners = owners.filter(
      x => noJointlyOwnerCodes.indexOf(x.code) !== -1 && x.code !== owner.code
    );
    if (noJointlyOwners.length > 0) {
      noJointlyOwner = {
        ownerName: owner.name,
        owners: noJointlyOwners.map(x => x.name).join(','),
      };
    }
  });
  if (noJointlyOwner !== undefined) {
    message.error(`货主：${noJointlyOwner.ownerName}与[${noJointlyOwner.owners}]不可共配，请检查货主配置!`);
    return false;
  }
  return true;
};