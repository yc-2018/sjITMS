import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { sumBy, uniq } from 'lodash';
import { Divider, Icon, Popover } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getRecommend } from '@/services/sjitms/ScheduleBill';

/**
 * 提示组件
 * @author ChenGuangLong
 * @since 2024/11/22 下午2:18
 */
export const Tips = ({ children }) =>
  <Popover content={children}>
    <Icon type="question-circle" style={{ color: '#999', marginLeft: 5 }}/>
  </Popover>;

/**
 * 高德样式对象
 * @author ChenGuangLong
 * @since 2024/11/15 上午11:05
 */
export const mapStyleMap = {
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
};

const div2 = (name, value) =>
  <div>
    <div>{name}</div>
    <div>{value}</div>
  </div>;
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
      {div2('重量', (order.weight / 1000).toFixed(3))}
      {div2('体积', order.volume.toFixed(2))}
      {div2('整件数', order.cartonCount)}
      {div2('周转箱数', order.containerCount)}
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
);

/** 汇总排车单明细给排车单主表 */
export const groupByOrder = data => {
  const deliveryPointCount = data ? uniq(data.map(x => x.deliveryPoint.code)).length : 0;
  const pickupPointCount = data ? uniq(data.map(x => x.pickUpPoint.code)).length : 0;
  data = data.filter(x => x.orderType !== 'OnlyBill');
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
  };
};

/** 按熟练度匹配车辆(通过传进来的配送点列表和车辆列表按熟练度排序车辆列表并返回车辆列表) */
export const getRecommendByOrders = async (record, vehicles) => {
  if (vehicles.length === 0) return;
  if (record.length === 0) return;

  // 组装推荐人员车辆接口入参;
  let params = {
    storeCodes: record.map(item => {
      return item.deliveryPoint.code;
    }),
    companyUuid: loginCompany().uuid,
    dUuid: loginOrg().uuid,
    state: 1,
  };
  // 车辆熟练度
  let recommend = await getRecommend(params);
  let cCountsMap = recommend.data?.cCountsMap ?? {};
  let cCountTotal = recommend.data?.cCountTotal;
  for (const vehicle of vehicles) {
    if (vehicle.CODE in cCountsMap) {
      vehicle.pro = (cCountsMap[vehicle.CODE] / cCountTotal) * 100;
    } else {
      vehicle.pro = 0;
    }
  }
  // 排序
  vehicles = vehicles.sort((a, b) => b.pro - a.pro);
  return vehicles;
};

/** 获取车辆的请求参数(为什么写成方法？因为里面有变量，所以如果这也是变量那就切换了调度中心也不会变 */
export const getVehiclesParam = () => ({
  tableName: 'v_sj_itms_vehicle_stat',
  condition: {
    params: [
      { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
      { field: 'DISPATCHCENTERUUID', rule: 'like', val: [loginOrg().uuid] },
      { field: 'state', rule: 'eq', val: [1] },
    ],
  },
});

/** 获取人员的请求参数(为什么写成方法不写成变量？因为里面还有变量，所以如果这也是变量那就切换了仓库也不会变 */
export const queryEmpParams = () =>
  ({
    quickuuid: 'sj_itms_employee',
    superQuery: {
      queryParams: [
        { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
        { field: 'dispatchCenterUuid', type: 'VarChar', rule: 'like', val: loginOrg().uuid },
        { field: 'state', type: 'Integer', rule: 'eq', val: 1 },
      ]
    },
  });

  /**
 * 将秒数转换为 HH小时mm分钟 格式
 * @param {number} seconds - 输入的秒数
 * @returns {string} 格式化后的时间字符串
 */
export const formatSeconds = seconds => {
  if (typeof seconds !== 'number' || seconds < 0) return '无时间';
  const hours = Math.floor(seconds / 3600); // 计算小时数
  const minutes = Math.floor((seconds % 3600) / 60); // 计算剩余的分钟数
  return `${hours}.${minutes}小时`;
};

/**
 * @typedef {Object} ScheduleData
 * @property {string} [vehicleModel]        - 车辆型号（重量-体积）
 * @property {string} note                  - 备注
 * @property {Vehicle} selectVehicle        - 选择的车辆对象
 * @property {Employees[]} selectEmployees  - 选择的人员对象列表
 * @property {number[]} routeDistance       - 起点到终点的驾车距离，单位：米 (列表是防止避免异步相加可能丢失数据)
 * @property {number[]} routeTime           - 时间预计，单位：秒 (列表是防止避免异步相加可能丢失数据)
 * @property {number[]} routeTolls          - 此驾车路线收费金额，单位：元 (列表是防止避免异步相加可能丢失数据)
 * @property {boolean} [ok]                 - 这条线路是否成功生成排车单 （空还没生成排车单 false失败 true成功)
 * @property {string} [errMsg]              - 这条线路生成排车单失败信息
 */

/**
 * @typedef {Object} Employees
 * @property {string} UUID         - 人员UUID
 * @property {string} memberType   - 人员类型
 * @property {string} CODE         - 人员编号
 * @property {string} NAME         - 人员名称
 *  <hr/>....还有很多省略了
 */

/**
 * @typedef {Object} Vehicle
 * @property {string} UUID              - UUID
 * @property {string} PLATENUMBER       - 车牌号
 * @property {string} CODE              - 车辆代码
 * @property {string} BEARWEIGHT        - 车辆载重t
 * @property {number} BEARVOLUME        - 体积利用率的一个比例系数
 * @property {number} BEARVOLUMERATE    - 体积利用率的一个比例系数 实际可用体积 = BEARVOLUME * (BEARVOLUMERATE / 100)。
 * @property {string} VEHICLEGROUP      - 车辆组
 *  <hr/>....还有很多省略了
 */