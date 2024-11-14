import { sumBy, uniq } from 'lodash'

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