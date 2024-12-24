/* g7数据地图（高德） */
import React, { Component } from 'react';
import { Button, Col, Divider, message, Modal, Row } from 'antd';
import { groupBy, orderBy, sumBy, uniqBy } from 'lodash';
import moment from 'moment';
import AMapLoader from '@amap/amap-jsapi-loader';
import {
  getDetailByBillUuids,
  GetHistoryLocation,
  GetScheduleDelivery,
  GetScheduleEvent,
  GetStopEvent,
  GetTrunkData
} from '@/services/sjitms/ScheduleBill';
import myjPointNormal from '@/assets/common/myjPoint_normal.svg';
import myjPointClick from '@/assets/common/myjPoint_click.svg';
import truckStop from '@/assets/common/truck_stop.png';
import { getDistance } from '@/utils/gcoord';
import styles from './ScheduleGdMap.less';
import { AMapDefaultConfigObj, AMapDefaultLoaderObj, getStoreIcon } from '@/utils/mapUtil';
import startMarkerIcon from '@/assets/common/startMarker.png';
import LoadVan from '@/components/VanLoad/LoadVan';

let AMap = null;                   // 高德地图对象
let map = null;                    // 高德地图实例
let text = null;                   // 高德地图文本对象
let storeMarkers = [];            // 门店坐标记录列表
let currentMarker = null;          // 当前位置marker
let startMarker = null;            // 起始点

let timer = null;                  // 定时器
let lastTime = null;               // 上次刷新时间
let lastPoints = [];              // 上一次记录的轨迹点
const formatTime = (time) => time ? moment(time).format('M月DD日 HH:mm') : '---';

export default class ScheduleGdMap extends Component {

  state = {
    orders: [],
    points: [],
    visible: false,
    loading: false,
  };

  componentDidMount = async () => {
    try { // 加载高德地图
      AMap = window.AMap ?? await AMapLoader.load(AMapDefaultLoaderObj);
    } catch (error) {
      message.error(`获取高德地图类对象失败:${error}`);
    }
    this.props.onRef && this.props.onRef(this);
  };

  componentWillUnmount () {
    clearInterval(timer);
    map?.destroy();
    map = null;
  }

  show = schedule => {
    map?.clearMap();
    startMarker = null;  // 主要为了防止换了调度中心，不然都不用重新加载
    if (schedule) {
      this.initialize(schedule);
    }
    this.setState({ visible: true, loading: true });
  };

  hide = () => {
    clearInterval(timer);
    timer = null;
    this.setState({ visible: false });
  };

  /** 初始化 */
  initialize = async (schedule) => {
    const billUuid = schedule.UUID;
    const billNumber = schedule.BILLNUMBER;
    const plateNumber = schedule.VEHICLEPLATENUMBER;   // 车牌号
    const returnTime = schedule.RETURNTIME;            // 回车时间
    const dispatchtime = schedule.DISPATCHTIME;        // 出车时间
    const response = await getDetailByBillUuids([billUuid]);    // 获取排车单明细
    if (response.success) {
      timer = null;
      lastPoints = [];
      let orders = response.data || [];
      const points = await this.initPoints(billNumber, billUuid, orders);
      this.setState({ orders, points });
      // 初始化地图 和 门店 和 车辆历史轨迹
      setTimeout(async () => {
        this.setState({ loading: false });
        if (AMap && !map) map = new AMap.Map('G7AMap', AMapDefaultConfigObj);   // 只能放这里 放其他地方总是有问题 烦死了
        const firstTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const minutesDiff = moment(returnTime || moment()).diff(dispatchtime, 'minute');
        const forOne = 30; // 分钟/循环请求一次  // 因为轨迹点一次请求最多返回999个 所以要拆到多少分钟区间一次请求
        const intervals = Math.ceil(minutesDiff / forOne); // 计算40分钟区间数
        if (intervals > 1) { // 出发40分钟以上，循环获取历史轨迹
          for (let i = 0; i <= intervals; i++) {  // 循环获取历史轨迹每次获取1个小时的轨迹
            const from = moment(dispatchtime).add(i * forOne, 'minutes').format('YYYY-MM-DD HH:mm:ss');
            if (moment().isAfter(from)) {
              let to = moment(dispatchtime).add((i + 1) * forOne, 'minutes').format('YYYY-MM-DD HH:mm:ss');
              to = moment().isAfter(to) ? to : firstTime;    // 如果当前时间晚于指定时间，就设置为指定时间，否则设置为当前时间
              await this.getHistoryLocation(plateNumber, from, to, []);
            } else break;
          }
        } else {
          // 获取历史轨迹 通过车牌号，开始时间和结束时间(没有结束时间就拿当前时间)
          await this.getHistoryLocation(plateNumber, dispatchtime, returnTime || firstTime, []);
        }

        this.getTrunkLocation(plateNumber);    // 初始化车辆当前位置
        this.drawMarker(points);                   // 初始化门店marker
        this.autoFresh(billNumber, billUuid, plateNumber, returnTime, orders);
      }, 500);
    }
  };

  /** 定时刷新历史轨迹：还没有回车时间时每5秒获取一次历史轨迹和车辆位置，如果回车时间有了就只获取车辆位置 */
  autoFresh = async (billNumber, billUuid, plateNumber, returnTime, orders) => {
    timer = setInterval(async () => {
      // 当前位置
      this.getTrunkLocation(plateNumber);
      // 历史轨迹
      if (returnTime === undefined) {
        await this.getHistoryLocation(plateNumber, lastTime, moment().format('YYYY-MM-DD HH:mm:ss'), lastPoints);
        const points = await this.initPoints(billNumber, billUuid, orders);
        this.setState({ points });
      }
    }, 5000);
  };

  /** 初始化门店 */
  initPoints = async (billNumber, billUuid, orders) => {
    const pointUuids = uniqBy(orders.map(x => x.deliveryPoint), x => x.uuid).map(x => x.uuid);
    if (pointUuids.length === 0) { return []; }
    const response = await GetScheduleEvent(billNumber);
    let shipedPoints = response.success ? response.data || [] : [];
    const deliveryResponse = await GetScheduleDelivery(billUuid);
    const deliverys = deliveryResponse.success ? deliveryResponse.data || [] : [];
    orders = this.groupData(orders);
    orders = orders.map(order => {
      const shipedPoint = shipedPoints?.find(x => x.pointcode === order.deliveryPoint.code);
      const delivery = deliverys?.find(x => x.pointUuid === order.deliveryPoint.uuid);
      return {
        ...order,
        complete: !!(shipedPoint?.outtime || delivery?.relDeliveryTime),
        shipStat: delivery?.stat || '',
        preReachTime: delivery?.preReachTime,
        preDeliveryTime: delivery?.preDeliveryTime,
        relReachTime: delivery?.relReachTime || shipedPoint?.intime,
        relDeliveryTime: delivery?.relDeliveryTime || shipedPoint?.outtime
      };
    });
    orders = await this.stopEvent(orders, billNumber);
    orders = orderBy(orders, ['relReachTime', 'deliveryNumber'], ['asc', 'asc']);
    return orders;
  };

  /** 计算停留事件 */
  stopEvent = async (points, billNumber) => {
    const resStopEvent = await GetStopEvent(billNumber);
    let stopEvents = resStopEvent.success ? resStopEvent.data || [] : [];
    // 未送达门店判断是否存在100米内停留事件
    const notShiedPoint = points.filter(x => x.complete === false);
    notShiedPoint.forEach(x => {
      stopEvents.forEach(event => {
        const distance = getDistance(event.startlat, event.startlng, x.latitude, x.longitude);
        if (distance <= 100) {
          const index = points.findIndex(pt => pt.deliveryPoint.code === x.deliveryPoint.code);
          x.complete = true;
          x.relReachTime = event?.starttime;
          x.relDeliveryTime = event?.endtime;
          points[index] = x;
        }
      });
    });
    return points;
  };

  /** 按送货点汇总运输订单 */
  groupData = data => {
    let output = groupBy(data, x => x.deliveryPoint.code);
    let deliveryPointGroupArr = Object.keys(output).map(pointCode => {
      const orders = output[pointCode];
      return {
        ...orders[0],
        coldContainerCount: Math.round(sumBy(orders, 'coldContainerCount') * 1000) / 1000,
        realColdContainerCount: Math.round(sumBy(orders, 'realColdContainerCount') * 1000) / 1000,
        freezeContainerCount: Math.round(sumBy(orders, 'freezeContainerCount') * 1000) / 1000,
        realFreezeContainerCount: Math.round(sumBy(orders, 'realFreezeContainerCount') * 1000) / 1000,
        cartonCount: Math.round(sumBy(orders, 'cartonCount') * 1000) / 1000,
        realCartonCount: Math.round(sumBy(orders, 'realCartonCount') * 1000) / 1000,
        scatteredCount: Math.round(sumBy(orders, 'scatteredCount') * 1000) / 1000,
        realScatteredCount: Math.round(sumBy(orders, 'realScatteredCount') * 1000) / 1000,
        containerCount: Math.round(sumBy(orders, 'containerCount') * 1000) / 1000,
        realContainerCount: Math.round(sumBy(orders, 'realContainerCount') * 1000) / 1000,
        volume: Math.round(sumBy(orders, 'volume') * 1000) / 1000,
        weight: Math.round(sumBy(orders, 'weight') * 1000) / 1000
      };
    });
    return orderBy(deliveryPointGroupArr, 'shipAreaName');
  };

  /** 获取美宜佳图标 */
  getMyjIcon = (colour = 'red', size = 30) => {
    const icon = {
      'red': myjPointNormal,
      'green': myjPointClick,
    }[colour];
    return new AMap.Icon({
      size: new AMap.Size(size, size),          // 图标尺寸
      image: icon,                              // 图标的取图地址
      imageSize: new AMap.Size(size, size),     // 图标所用图片大小
    });
  };

  /** 画门店点位 */
  drawMarker = points => {
    storeMarkers = points.filter(x => x.longitude && x.latitude).map(point => {
      const isMyj = point.owner?.name?.indexOf('美宜佳') !== -1;
      const isComplete = point.complete;
      const boxShadow = isComplete ? '1px 1px 3px #248232' : '1px 1px 3px #C31B1F';
      // 创建点
      const marker = new AMap.Marker({
        position: [point.longitude, point.latitude],        // 设置Marker的位置
        anchor: 'bottom-center',                            // 设置Marker的锚点
        icon: isMyj ? this.getMyjIcon(isComplete ? 'green' : 'red') : getStoreIcon(AMap, isComplete ? 3 : 2),
        label: ({
          direction: 'top',
          content: `
            <div style="padding: 0.3rem 0.6rem; border-radius: 3px; background: white; box-shadow: ${boxShadow};">
                ${point.deliveryNumber} | ${point.deliveryPoint.code}
            </div>
            `
        })
      });
      const textContent = `
        <div class="${styles.orderInfo}">
          <div class="${styles.orderInfoTitle}">
            [${point.deliveryPoint.code}]${point.deliveryPoint.name}
          </div>
          <hr style="margin: 5px 0 0 0;"/>
          <div>线路：${point.archLine?.code}</div>
          <div style="display: flex;margin-top:5px;">
            <div style="flex: 1;">整件数</div>
            <div style="flex: 1;">周转箱数</div>
            <div style="flex: 1;">体积</div>
            <div style="flex: 1;">重量</div>
          </div>
          <div style="display: flex;">
            <div style="flex: 1">${point.cartonCount}</div>
            <div style="flex: 1">${point.containerCount}</div>
            <div style="flex: 1">${point.volume}</div>
            <div style="flex: 1">${(point.weight / 1000).toFixed(3)}</div>
          </div>
        </div>`;
      // ————————鼠标移入————————
      marker.on('mouseover', () => {
        text = new AMap.Text({
          position: new AMap.LngLat(point.longitude, point.latitude),
          anchor: 'bottom-center',
          text: textContent,                        // 设置文本标注内容
          offset: new AMap.Pixel(0, -31),             // 设置文本标注偏移量
        });
        map.add(text);
      });
      // ————————鼠标移出————————
      marker.on('mouseout', () => {
        text && map.remove(text);
      });

      return marker;
    });
    map.add(storeMarkers);
    map.setFitView();
  };

  /** 历史轨迹 */
  getHistoryLocation = async (plateNumber, from, to, lastPointList) => {
    const params = { plate_num: `粤${plateNumber}`, from, to, timeInterval: '10' };
    const response = await GetHistoryLocation(params);
    if (response.success && response.data.data) {
      let pts = [...lastPointList];
      const historys = response.data.data || [];
      if (historys.length > 0) {
        historys.forEach(point => pts.push([point.lng, point.lat]));
        // 起点坐标
        if (!startMarker) {
          startMarker = new AMap.Marker({
            position: [pts[0][0], pts[0][1]],              // 设置Marker的位置
            anchor: 'bottom-center',                       // 设置Marker的锚点
            icon: startMarkerIcon,
          });
          map.add(startMarker);
        }
        if (pts.length > 1) {
          const polyline = new AMap.Polyline({
            path: pts,                // 设置线覆盖物路径
            showDir: true,
            strokeColor: '#3366bb',   // 线颜色
            strokeWeight: 6,          // 线宽
            fillOpacity: 0.8,         // 填充透明度
          });
          map.add(polyline);
        }
        lastPoints = [...pts].slice(-1);  // 记录最后一个点好拼接路线
        lastTime = to;
      }
    }
  };

  /** 通过车牌号获取车辆当前位置 */
  getTrunkLocation = async (plateNumber) => {
    const params = {
      path: '/v1/device/truck/current_info',
      plate_num: `粤${plateNumber}`,
      fields: 'loc,status',
      addr_required: false,
    };
    const response = await GetTrunkData(params);
    if (response.success && response.data.data) {
      const point = response.data.data || {};
      const rotaition = point.loc.course;

      currentMarker = currentMarker || new AMap.Marker({            // 创建一个Marker对象
        icon: new AMap.Icon({
          size: new AMap.Size(40, 40),          // 图标尺寸
          image: truckStop,                     // 图标的取图地址
          imageSize: new AMap.Size(40, 40),     // 图标所用图片大小
        }),
        anchor: 'center',                       // 设置Marker的锚点
      });
      currentMarker.setPosition([point.loc.lng, point.loc.lat]);
      currentMarker.setAngle(rotaition);
      map.add(currentMarker);
    }
  };

  render () {
    const { visible, orders, points, loading } = this.state;
    let completePoints = [];
    if (points.length > 0) completePoints = points.filter(x => x.complete === true);

    return (
      <Modal
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        width="100vw"
        bodyStyle={{ margin: -24, height: '100vh' }}
        afterClose={() => clearInterval(timer) || (timer = null)}
        onCancel={() => this.hide()}
        visible={visible}
        title={
          <Row type="flex" justify="space-between">
            <Col span={22}>
              <Row>
                <Col span={3}>订单数：{orders.length}</Col>
                <Col span={3}>门店数：{points.length}</Col>
                <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={styles.titleCountComplete}/>
                  已送达：{completePoints.length}
                </Col>
                <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={styles.titleCount}/>
                  未送达：{points.length - completePoints.length}
                </Col>
              </Row>
            </Col>
            <Col span={1}>
              <Button onClick={() => this.setState({ visible: false })}>关闭</Button>
            </Col>
          </Row>
        }
        closable={false}
      >
        <LoadVan show={loading} text="正在拼命加载中..."/>
        <div style={{ display: 'flex', height: 'calc(100vh - 54px)' }}>
          {/* ——————左边订单列表—————— */}
          <div className={styles.pointInfoCell} style={{ display: orders.length > 0 ? 'block' : 'none', }}>
            {points.map(point =>
              <>
                <Row type="flex" justify="space-between" className={styles.pointInfoItemCell}>
                  <Col span={20}>
                    <span className={styles.numberCircle}>{point.deliveryNumber}</span>
                    <span className={styles.storeName}>
                      {`[${point.deliveryPoint.code}]${point.deliveryPoint.name}`}
                    </span>
                  </Col>
                  <Col span={4}>
                    {
                      point.complete === 1 || point.shipStat === '已送达' ?
                        <span className={`${styles.deliveryStat} ${styles.colorGreen}`}>已送达</span> :
                        <span className={`${styles.deliveryStat} ${styles.colorRed}`}>未送达</span>
                    }
                  </Col>
                  <Col span={12}>预计到达：{formatTime(point.preReachTime)}</Col>
                  <Col span={12}>实际到达：{formatTime(point.relReachTime)}</Col>
                  <Col span={12}>预计离开：{formatTime(point.preDeliveryTime)}</Col>
                  <Col span={12}>实际离开：{formatTime(point.relDeliveryTime)}</Col>
                </Row>
                <Divider style={{ margin: 0, marginTop: 5 }}/>
              </>
            )}
          </div>

          {/* ————————右边地图———————— */}
          <div id="G7AMap" className={styles.DispatchGdMap} style={{ width: orders.length > 0 ? '75vw' : '100vw' }}/>
        </div>
      </Modal>
    );
  }
}
