/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-08-03 16:53:47
 * @Description: 配送进度
 */
import React, { Component } from 'react';
import { Divider, Modal, Button, Row, Col } from 'antd';
import { Map, CustomOverlay } from 'react-bmapgl';
import {
  getDetailByBillUuids,
  GetHistoryLocation,
  GetTrunkData,
  GetScheduleEvent,
  GetStopEvent,
  GetScheduleDelivery,
  RefreshDelivery
} from '@/services/sjitms/ScheduleBill';
import ShopsIcon from '@/assets/common/shops.png';
import myjPointNormal from '@/assets/common/myjPoint_normal.svg';
import myjPointClick from '@/assets/common/myjPoint_click.svg';
import truckStop from '@/assets/common/truck_stop.png';
import { uniqBy, orderBy, groupBy, sumBy } from 'lodash';
import { gcj02tobd09, getDistance } from '@/utils/gcoord'
import moment from 'moment';
import styles from './ScheduleMap.less';

export default class DispatchMap extends Component {
  state = {
    timer: undefined,
    visible: false,
    windowInfo: undefined,
    schedule: {},
    orders: [],
    points: [],
    startMarker: undefined,
    currentMarker: undefined,
    lastPoints: [],
    firstTime: "",
    lastTime: ""
  };


  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  componentWillUnmount() {
    const { timer } = this.state;
    clearInterval(timer);
  }

  colors = [
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
  ];

  show = schedule => {
    if (schedule) {
      this.initialize(schedule);
    }
    this.setState({ visible: true });
  };

  hide = () => {
    const { timer } = this.state;
    clearInterval(timer);
    this.setState({ visible: false, timer: undefined });
  }

  //初始化
  initialize = async (schedule) => {
    const billUuid = schedule.UUID;
    const billNumber = schedule.BILLNUMBER;
    const platenumber = schedule.VEHICLEPLATENUMBER;
    const returntime = schedule.RETURNTIME;
    const dispatchtime = schedule.DISPATCHTIME;
    const response = await getDetailByBillUuids([billUuid]);
    if (response.success) {
      let orders = response.data || [];
      const points = await this.initPoints(billNumber, billUuid, orders);
      let firstTime = moment().format("YYYY-MM-DD HH:mm:ss");
      this.setState({
        timer: undefined,
        startMarker: undefined,
        currentMarker: undefined,
        lastPoints: [],
        orders,
        points,
        schedule,
        firstTime
      });
      //初始化车辆历史轨迹
      setTimeout(async () => {
        this.map?.clearOverlays();
        const hours = Math.ceil(moment(returntime || moment()).diff(dispatchtime, "minute") / 60);
        if (hours > 1) {
          for (let i = 0; i < Math.ceil(hours / 2); i++) {
            const from = moment(dispatchtime).add(i * 2, "hours").format("YYYY-MM-DD HH:mm:ss");
            if (moment().isAfter(from)) {
              let to = moment(dispatchtime).add((i + 1) * 2, "hours").format("YYYY-MM-DD HH:mm:ss");
              to = moment().isAfter(to) ? to : firstTime;
              await this.getHistoryLocation(platenumber, from, to, []);
            }
          }
        } else {
          await this.getHistoryLocation(platenumber, dispatchtime, returntime || firstTime, []);
        }
        //初始化车辆当前位置
        this.getTrunkLocation(platenumber);
        //初始化门店marker
        this.drawMarker(points);
        this.autoViewPort(points);
        this.autoFresh(billNumber, billUuid, platenumber, returntime, orders);
      }, 500);
    }
  };

  //定时刷新
  autoFresh = async (billNumber, billUuid, platenumber, returntime, orders) => {
    const timer = setInterval(async () => {
      const { lastTime, lastPoints } = this.state;
      //历史轨迹
      if (returntime == undefined) {
        this.getHistoryLocation(platenumber, lastTime, moment().format("YYYY-MM-DD HH:mm:ss"), lastPoints);
        const points = await this.initPoints(billNumber, billUuid, orders);
        this.setState({ points });
      }
      //当前位置
      this.getTrunkLocation(platenumber);
    }, 5000);
    this.setState({ timer });
  }

  //初始化门店
  initPoints = async (billNumber, billUuid, orders) => {
    const pointUuids = uniqBy(orders.map(x => x.deliveryPoint), x => x.uuid).map(x => x.uuid);
    if (pointUuids.length == 0) { return []; }
    const response = await GetScheduleEvent(billNumber);
    let shipedPoints = response.success ? response.data || [] : [];
    const deliveryResponse = await GetScheduleDelivery(billUuid);
    const deliverys = deliveryResponse.success ? deliveryResponse.data || [] : [];
    orders = this.groupData(orders);
    orders = orders.map(order => {
      const shipedPoint = shipedPoints?.find(x => x.pointcode == order.deliveryPoint.code);
      const delivery = deliverys?.find(x => x.pointUuid == order.deliveryPoint.uuid);
      return {
        ...order,
        complete: shipedPoint?.outtime || delivery?.relDeliveryTime ? true : false,
        shipStat: delivery?.stat || "",
        preReachTime: delivery?.preReachTime,
        preDeliveryTime: delivery?.preDeliveryTime,
        relReachTime: delivery?.relReachTime || shipedPoint?.intime,
        relDeliveryTime: delivery?.relDeliveryTime || shipedPoint?.outtime
      };
    });
    orders = await this.stopEvent(orders, billNumber);
    orders = orderBy(orders, ['relReachTime', 'deliveryNumber'], ['asc', 'asc']);
    return orders;
  }

  //计算停留事件
  stopEvent = async (points, billNumber) => {
    const resStopEvent = await GetStopEvent(billNumber);
    let stopEvents = resStopEvent.success ? resStopEvent.data || [] : [];
    //未送达门店判断是否存在100米内停留事件
    const notShiedPoint = points.filter(x => x.complete == false);
    notShiedPoint.forEach(x => {
      stopEvents.forEach(event => {
        const stopLngLat = gcj02tobd09(event.startlng, event.startlat);
        const distance = getDistance(stopLngLat[1], stopLngLat[0], x.latitude, x.longitude);
        if (distance <= 100) {
          const index = points.findIndex(pt => pt.deliveryPoint.code == x.deliveryPoint.code);
          x.complete = true;
          x.relReachTime = event?.starttime;
          x.relDeliveryTime = event?.endtime;
          points[index] = x;
        }
      })
    });
    return points;
  }

  //按送货点汇总运输订单
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
    return orderBy(deliveryPointGroupArr, "shipAreaName");
  };

  //自动聚焦
  autoViewPort = points => {
    const newPoints = points.map(point => {
      return new BMapGL.Point(point.longitude, point.latitude);
    });
    this.map?.setViewport(newPoints);
  };

  //送货点标注
  drawMarker = points => {
    points.forEach(pt => {
      let icon = this.drawIcon(pt.complete ? 3 : 1)
      if (pt.owner?.name?.indexOf("美宜佳") != -1) {
        icon = pt.complete ? new BMapGL.Icon(myjPointClick, new BMapGL.Size(40, 40)) :
          new BMapGL.Icon(myjPointNormal, new BMapGL.Size(40, 40));
      }
      const point = new BMapGL.Point(pt.longitude, pt.latitude);
      const marker = new BMapGL.Marker(point, { icon: icon, shadow: true, });
      marker.addEventListener('mouseover', () => {
        this.setState({ windowInfo: { point, order: pt } });
      });
      marker.addEventListener('mouseout', () => {
        this.setState({ windowInfo: undefined });
      });
      const label = new BMapGL.Label(pt.deliveryNumber + "  |    " + pt.deliveryPoint.code, {
        position: point,
        offset: new BMapGL.Size(-35, -50)
      })
      label.setStyle({
        padding: "0.3rem 0.6rem",
        borderRadius: "3px",
        boxShadow: pt.complete ? "1px 1px 3px #248232" : "1px 1px 3px #C31B1F",
        border: "none"
      });
      this.map?.addOverlay(label);
      this.map?.addOverlay(marker);
    });
  };

  //标注icon
  drawIcon = num => {
    const index = num % 20;
    const multiple = 5;
    const icon = new BMapGL.Icon(ShopsIcon, new BMapGL.Size(160 / multiple, 160 / multiple), {
      imageOffset: new BMapGL.Size(
        (160 / multiple) * ((index % 5) - 1),
        (160 / multiple) * (Math.ceil(index / 5) - 1)
      ),
      imageSize: new BMapGL.Size(800 / multiple, 1000 / multiple),
    });
    return icon;
  };

  //路线规划标注
  drawRouteMarker = (lng, lat, width, hieght, x, y) => {
    const iconUrl = '//webmap1.bdimg.com/wolfman/static/common/images/markers_new2x_2960fb4.png';
    return new BMapGL.Marker(new BMapGL.Point(lng, lat), {
      icon: new BMapGL.Icon(iconUrl, new BMapGL.Size(width / 2, hieght / 2), {
        imageOffset: new BMapGL.Size(x / 2, y / 2),
        imageSize: new BMapGL.Size(600 / 2, 600 / 2),
      }),
    });
  };

  //历史轨迹
  getHistoryLocation = async (platenumber, from, to, lastPoints) => {
    const params = { plate_num: "粤" + platenumber, from, to, timeInterval: "10", map: "baidu" }
    const response = await GetHistoryLocation(params);
    if (response.success && response.data.data) {
      let { startMarker } = this.state;
      let pts = [...lastPoints];
      const historys = response.data.data || [];
      if (historys.length > 0) {
        historys.forEach(point => {
          pts.push(new BMapGL.Point(point.lng, point.lat));
        });
        if (startMarker == undefined) {
          const startPoint = historys[0];
          startMarker = this.drawRouteMarker(startPoint.lng, startPoint.lat, 50, 80, 400, 278);
          this.map?.addOverlay(startMarker);
        }
        if (pts.length > 1) {
          this.map?.addOverlay(new BMapGL.Polyline(pts, { strokeColor: "#3e3eff", strokeWeight: 4, strokeOpacity: 1 }));
        }
        const lastPoints = [...pts];
        this.setState({ startMarker, lastTime: to, lastPoints: lastPoints.slice(-2) });
      }
    }
  }

  //获取当前位置
  getTrunkLocation = async (platenumber) => {
    const params = {
      path: "/v1/device/truck/current_info",
      plate_num: "粤" + platenumber,
      fields: "loc,status",
      addr_required: false,
      map: "baidu"
    }
    const response = await GetTrunkData(params);
    if (response.success && response.data.data) {
      let { currentMarker } = this.state;
      const point = response.data.data || {};
      const rotaition = point.loc.course;
      this.map?.removeOverlay(currentMarker);
      currentMarker = new BMapGL.Marker(new BMapGL.Point(point.loc.lng, point.loc.lat), {
        icon: new BMapGL.Icon(truckStop, new BMapGL.Size(40, 40))
      });
      currentMarker.setRotation(rotaition);
      this.setState({ currentMarker });
      this.map?.addOverlay(currentMarker);
    }
  }

  //刷新实际送达时间
  refreshDelivery = async () => {
    const { points, schedule } = this.state;
    const params = points.map(point => {
      return {
        billUuid: schedule.UUID,
        pointUuid: point.deliveryPoint.uuid,
        relReachTime: point.relReachTime,
        relDeliveryTime: point.relDeliveryTime
      }
    });
    const response = await RefreshDelivery(params);
    console.log(response);
  }

  render() {
    const { visible, windowInfo, orders, points, timer } = this.state;
    let completePoints = [];
    if (points.length > 0) {
      completePoints = points.filter(x => x.complete == true);
    }
    return (
      <Modal
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        width="100vw"
        bodyStyle={{ margin: -24, height: '100vh' }}
        afterClose={() => clearInterval(timer)}
        onCancel={() => this.hide()}
        visible={visible}
        title={
          <Row type="flex" justify="space-between">
            <Col span={22} >
              <Row>
                <Col span={3}>订单数：{orders.length}</Col>
                <Col span={3}>门店数：{points.length}</Col>
                <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={styles.titleCountComplete}></span>
                  已送达：{completePoints.length}
                </Col>
                <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={styles.titleCount}></span>
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
        destroyOnClose={true}
      >
        {orders.length > 0 ? (
          <div className={styles.mapCell}>
            <Map
              center={{ lng: 113.809388, lat: 23.067107 }}
              zoom={10}
              minZoom={6}
              enableScrollWheelZoom
              enableRotate={false}
              enableTilt={false}
              ref={ref => (this.map = ref?.map)}
              style={{ height: '100%' }}
            >
              {windowInfo ? (
                <CustomOverlay position={windowInfo.point} offset={new BMapGL.Size(0, -20)}>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderInfoTitle}>
                      {`[${windowInfo.order.deliveryPoint.code}]` +
                        windowInfo.order.deliveryPoint.name}
                    </div>
                    <Divider style={{ margin: 0, marginTop: 5 }} />
                    <div>
                      线路：
                      {windowInfo.order.archLine?.code}
                    </div>
                    <div style={{ display: 'flex', marginTop: 5 }}>
                      <div style={{ flex: 1 }}>整件数</div>
                      <div style={{ flex: 1 }}>周转箱数</div>
                      <div style={{ flex: 1 }}>体积</div>
                      <div style={{ flex: 1 }}>重量</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ flex: 1 }}>{windowInfo.order.cartonCount}</div>
                      <div style={{ flex: 1 }}>{windowInfo.order.containerCount}</div>
                      <div style={{ flex: 1 }}>{windowInfo.order.volume}</div>
                      <div style={{ flex: 1 }}>{(windowInfo.order.weight / 1000).toFixed(3)}</div>
                    </div>
                  </div>
                </CustomOverlay>
              ) : (
                <></>
              )}
            </Map>
            <div className={styles.pointInfoCell}>
              {/* <Button onClick={() => this.refreshDelivery()}>刷新</Button> */}
              {points.map(point => {
                return <>
                  <Row type="flex" justify="space-between" className={styles.pointInfoItemCell}>
                    <Col span={20}>
                      <span className={styles.numberCircle}>{point.deliveryNumber}</span>
                      <span className={styles.storeName}>{`[${point.deliveryPoint.code}]` + point.deliveryPoint.name}</span>
                    </Col>
                    <Col span={4}>
                      {
                        point.complete == 1 || point.shipStat == "已送达" ?
                          <span className={styles.deliveryStat} style={{ color: "#248232", backgroundColor: "#2482324D" }}>已送达</span>
                          :
                          <span className={styles.deliveryStat} style={{ color: "#C31B1F", backgroundColor: "#C31B1F4D" }}>未送达</span>
                      }
                    </Col>
                    <Col span={12}>
                      预计到达：
                      {point.preReachTime ? moment(point.preReachTime).format("MM月DD日 HH:mm") : "---"}
                    </Col>
                    <Col span={12}>
                      实际到达：
                      {point.relReachTime ? moment(point.relReachTime).format("M月DD日 HH:mm") : "---"}
                    </Col>
                    <Col span={12}>
                      预计离开：
                      {point.preDeliveryTime ? moment(point.preDeliveryTime).format("M月DD日 HH:mm") : "---"}
                    </Col>
                    <Col span={12}>
                      实际离开：
                      {point.relDeliveryTime ? moment(point.relDeliveryTime).format("M月DD日 HH:mm") : "---"}
                    </Col>
                  </Row>
                  <Divider style={{ margin: 0, marginTop: 5 }} />
                </>
              })}
            </div>
          </div>
        ) : (
          <Map
            center={{ lng: 113.809388, lat: 23.067107 }}
            zoom={18}
            enableScrollWheelZoom
            enableAutoResize
            enableRotate={false}
            enableTilt={false}
            style={{ height: '100%' }}
          />
        )}
      </Modal>
    );
  }
}