import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { sumBy, uniq } from 'lodash'
import { Divider } from 'antd'

/**
 * 高德样式对象
 * @author ChenGuangLong
 * @since 2024/11/15 上午11:05
 */
export const mapStyle = {
  '标准': 'normal',
  '幻影黑': 'dark',
  '月光银': 'light',
  '远山黛': 'whitesmoke',
  '草色青': 'fresh',
  '雅士灰': 'grey',
  '涂鸦': 'graffiti',
  '马卡龙': 'macaron',
  '靛青蓝': 'blue',
  '极夜蓝': 'darkblue',
  '酱籽': 'wine'
}

const div2 = (name, value) =>
  <div>
    <div>{name}</div>
    <div>{value}</div>
  </div>
/**
 * 高德点文本div转字符串返回
 * @param order          统计好的订单
 * @param isMultiVehicle 是否多载具
 * @author ChenGuangLong
 * @since 2024/11/15 上午11:05
 */
export const getMarkerText = (order, isMultiVehicle = false) => ReactDOMServer.renderToStaticMarkup(
  <div style={{ width: 'auto', height: 'auto', padding: 5, background: '#FFF' }}>
    <div style={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      [{order.deliveryPoint.code}]{order.deliveryPoint.name}
    </div>
    <Divider style={{ margin: '5px 0 0 0' }}/>
    <div>线路：{order.archLine?.code}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, textAlign: 'center' }}>
      {div2('重量',(order.weight / 1000).toFixed(3))}
      {div2('体积',order.volume.toFixed(2))}
      {div2('整件数',order.cartonCount)}
      {div2('周转箱数',order.containerCount)}
    </div>
    {isMultiVehicle &&
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, textAlign: 'center' }}>
        {div2('冷藏筐', order.coldContainerCount)}
        {div2('冷冻筐', order.freezeContainerCount)}
        {div2('保温袋', order.insulatedBagCount)}
        {div2('鲜食筐', order.freshContainerCount)}
      </div>
    }
  </div>
)

/** 汇总排车单明细给排车单主表 */
export const groupByOrder = data => {
  const deliveryPointCount = data ? uniq(data.map(x => x.deliveryPoint.code)).length : 0
  const pickupPointCount = data ? uniq(data.map(x => x.pickUpPoint.code)).length : 0
  data = data.filter(x => x.orderType !== 'OnlyBill')
  return {
    orderCount: data ? data.length : 0,
    cartonCount: data ? sumBy(data.map(x => x.stillCartonCount)) : 0,
    scatteredCount: data ? sumBy(data.map(x => x.stillScatteredCount)) : 0,
    containerCount: data ? sumBy(data.map(x => x.stillContainerCount)) : 0,
    coldContainerCount: data ? sumBy(data.map(x => x.stillColdContainerCount)) : 0,
    freezeContainerCount: data ? sumBy(data.map(x => x.stillFreezeContainerCount)) : 0,
    insulatedBagCount: data ? sumBy(data.map(x => x.stillInsulatedBagCount)) : 0,
    insulatedContainerCount: data ? sumBy(data.map(x => x.stillInsulatedContainerCount)) : 0,
    freshContainerCount: data ? sumBy(data.map(x => x.stillFreshContainerCount)) : 0,

    realCartonCount: data ? sumBy(data.map(x => x.realCartonCount)) : 0,
    realScatteredCount: data ? sumBy(data.map(x => x.realScatteredCount)) : 0,
    realContainerCount: data ? sumBy(data.map(x => x.realContainerCount)) : 0,
    realColdContainerCount: data ? sumBy(data.map(x => x.realColdContainerCount)) : 0,
    realFreezeContainerCount: data ? sumBy(data.map(x => x.realFreezeContainerCount)) : 0,
    realInsulatedBagCount: data ? sumBy(data.map(x => x.realInsulatedBagCount)) : 0,
    realInsulatedContainerCount: data ? sumBy(data.map(x => x.realInsulatedContainerCount)) : 0,
    realFreshContainerCount: data ? sumBy(data.map(x => x.realFreshContainerCount)) : 0,

    stillCartonCount: data ? sumBy(data.map(x => x.stillCartonCount)) : 0,
    stillScatteredCount: data ? sumBy(data.map(x => x.stillScatteredCount)) : 0,
    stillContainerCount: data ? sumBy(data.map(x => x.stillContainerCount)) : 0,
    stillColdContainerCount: data ? sumBy(data.map(x => x.stillColdContainerCount)) : 0,
    stillFreezeContainerCount: data ? sumBy(data.map(x => x.stillFreezeContainerCount)) : 0,
    stillInsulatedBagCount: data ? sumBy(data.map(x => x.stillInsulatedBagCount)) : 0,
    stillInsulatedContainerCount: data ? sumBy(data.map(x => x.stillInsulatedContainerCount)) : 0,
    stillFreshContainerCount: data ? sumBy(data.map(x => x.stillFreshContainerCount)) : 0,

    weight: data ? sumBy(data.map(x => Number(x.weight))) : 0,
    volume: data ? sumBy(data.map(x => Number(x.volume))) : 0,
    totalAmount: data ? sumBy(data.map(x => Number(x.amount))) : 0,
    deliveryPointCount,
    pickupPointCount,
    ownerCount: data ? uniq(data.map(x => x.owner.code)).length : 0,
  }
}