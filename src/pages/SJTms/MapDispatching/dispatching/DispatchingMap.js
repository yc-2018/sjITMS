/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-10-29 16:05:16
 * @Description: 排车单地图
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\dispatching\DispatchingMap.js
 */
import React, { Component } from 'react';
import { Divider, Modal, Button, Row, Col, Empty, message } from 'antd';
import { Map, Marker, CustomOverlay, DrawingManager } from 'react-bmapgl';
import style from './DispatchingMap.less';
import emptySvg from '@/assets/common/img_empoty.svg';
import SearchForm from './SearchForm';
import { queryAuditedOrder } from '@/services/sjitms/OrderBill';
import ShopIcon from '@/assets/common/shop.svg';
import ShopClickIcon from '@/assets/common/shopClick.svg';
import start from '@/assets/common/start.svg';
import end from '@/assets/common/end.svg';
import pass from '@/assets/common/pass.svg';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { orderBy } from 'lodash';

export default class DispatchMap extends Component {
  state = {
    visible: false,
    isDrag: true,
    windowInfo: undefined,
    loading: false,
    pageFilter: [],
    orders: [],
    driverTime: 0,
    driverMileage: 0,
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  //显示modal
  show = () => {
    this.setState({ visible: true });
  };

  //查询
  refresh = params => {
    this.setState({ loading: true });
    this.clusterLayer = undefined;
    let { pageFilter } = this.state;
    let filter = { pageSize: 200, superQuery: { matchType: 'and', queryParams: [] } };
    if (params) {
      pageFilter = params;
    }
    const isOrgQuery = [
      { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
    ];
    filter.superQuery.queryParams = [
      ...pageFilter,
      ...isOrgQuery,
      { field: 'STAT', type: 'VarChar', rule: 'in', val: 'Audited||PartScheduled' },
      { field: 'PENDINGTAG', type: 'VarChar', rule: 'eq', val: 'Normal' },
    ];
    queryAuditedOrder(filter).then(response => {
      if (response.success) {
        const data = response.data.records ? response.data.records : [];
        this.setState({ orders: data }, () => {
          setTimeout(() => {
            this.drawClusterLayer();
            this.drawMenu();
            this.clusterSetData(data);
            this.autoViewPort(data);
          }, 500);
        });
        // this.drawingManagerRef?.open();
        // this.drawingManagerRef?.setDrawingMode(BMAP_DRAWING_RECTANGLE);
      }
      this.setState({ loading: false, pageFilter });
    });
  };

  //自动聚焦
  autoViewPort = orders => {
    const points = orders.map(point => {
      return new BMapGL.Point(point.longitude, point.latitude);
    });
    this.map?.setViewport(points);
  };

  //选门店
  onChangeSelect = (checked, record) => {
    let { orders } = this.state;
    let order = orders.find(x => x.uuid == record.uuid);
    if (order) {
      order.isSelect = checked;
      this.setState({ orders }, () => {
        this.clusterSetData(orders);
      });
    }
  };

  //重置
  onReset = () => {
    let { orders } = this.state;
    orders.map(order => (order.isSelect = false));
    this.setState({ orders, driverMileage: 0 }, () => {
      this.map?.clearOverlays();
      this.clusterSetData(orders);
    });
  };

  //标注点
  drawMarker = () => {
    const { orders } = this.state;
    return orders.map(order => {
      var point = new BMapGL.Point(order.longitude, order.latitude);
      return (
        <Marker
          position={point}
          icon={order.isSelect ? ShopClickIcon : ShopIcon}
          shadow={true}
          onMouseover={() => this.setState({ windowInfo: { point, order } })}
          onMouseout={() => this.setState({ windowInfo: undefined })}
        />
      );
    });
  };

  //标注点聚合图层初始化
  drawClusterLayer = () => {
    const that = this;
    const view = new mapvgl.View({ map: this?.map });
    view.removeAllLayers();
    const clusterLayer = new mapvgl.ClusterLayer({
      minSize: 40,
      maxSize: 80,
      clusterRadius: 150,
      gradient: { 0: '#E6AA68', 0.5: '#309900', 1.0: '#CA3C25' },
      maxZoom: 15,
      minZoom: 5,
      showText: true,
      textOptions: { fontSize: 14, color: '#FFF' },
      enablePicked: true,
      minPoints: 5,
      onClick(event) {
        if (event.dataItem?.order) {
          const order = event.dataItem.order;
          that.onChangeSelect(!order.isSelect, order);
        }
      },
      onMousemove(event) {
        if (event.dataItem?.order) {
          const order = event.dataItem.order;
          const point = new BMapGL.Point(order.longitude, order.latitude);
          that.setState({ windowInfo: { point, order } });
        } else {
          that.setState({ windowInfo: undefined });
        }
      },
    });
    this.clusterLayer = clusterLayer;
    view.addLayer(this.clusterLayer);
  };
  //标注点聚合图层数据加载
  clusterSetData = data => {
    const markers = data.map(point => {
      return {
        geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
        properties: {
          icon: [ShopIcon, ShopClickIcon][point.isSelect ? 1 : 0],
          width: 40,
          height: 40,
        },
        order: point,
      };
    });
    this.clusterLayer?.setData(markers);
  };

  //路线规划
  searchRoute = selectOrder => {
    let map = this.map;
    var driving = new BMapGL.DrivingRoute(map);
    var poinArray = [];
    for (var i = 0; i < selectOrder.length - 1; i++) {
      var p1 = new BMapGL.Point(selectOrder[i].longitude, selectOrder[i].latitude);
      var p2 = new BMapGL.Point(selectOrder[i + 1].longitude, selectOrder[i + 1].latitude);
      poinArray.push(p1);
      if (i == selectOrder.length - 2) {
        poinArray.push(p2);
      }
      driving.search(p1, p2);
    }
    const startIcon = new BMapGL.Icon(start, new BMapGL.Size(30, 30));
    const endIcon = new BMapGL.Icon(end, new BMapGL.Size(30, 30));
    const passIcon = new BMapGL.Icon(pass, new BMapGL.Size(30, 30));
    var startMarker = new BMapGL.Marker(poinArray[0], { icon: startIcon }); // 创建标注
    var endMarker = new BMapGL.Marker(poinArray[poinArray.length - 1], { icon: endIcon }); // 创建标注
    map.addOverlay(startMarker);
    map.addOverlay(endMarker);
    //途径点marker
    for (let i = 1; i < poinArray.length - 1; i++) {
      map.addOverlay(new BMapGL.Marker(poinArray[i], { icon: passIcon }));
    }
    map.setViewport(poinArray); //调整到最佳视野
    let { driverTime, driverMileage } = this.state;
    driving.setSearchCompleteCallback(function() {
      console.log(driving);
      var pts = driving
        .getResults()
        .getPlan(0)
        .getRoute(0)
        .getPath();
      var polyline = new BMapGL.Polyline(pts, {
        strokeColor: '#00A6ED',
        strokeWeight: 6,
        strokeOpacity: 1,
      });
      map.addOverlay(polyline);
      var plan = driving.getResults().getPlan(0);
      if (plan) {
        var dis = plan.getDistance(false); //获取总公里数
        var t = plan.getDuration(false); ///获取总耗时
        driverTime += t;
        driverMileage += dis;
      }
    });
  };

  //右键菜单
  drawMenu = () => {
    const { orders } = this.state;
    const menuItems = [
      {
        text: '排车',
        callback: () => {
          const selectOrder = orders.filter(x => x.isSelect);
          if (selectOrder.length === 0) {
            message.error('请选择需要排车的门店！');
            return;
          }
          this.props.dispatchingByMap(selectOrder);
        },
      },
      {
        text: '路线规划',
        callback: () => {
          const selectOrder = orders.filter(x => x.isSelect);
          if (selectOrder.length === 0) {
            message.error('请选择需要排车的门店！');
            return;
          }
          this.searchRoute(selectOrder);
        },
      },
    ];
    const menu = new BMapGL.ContextMenu();
    menuItems.forEach((item, index) => {
      menu.addItem(
        new BMapGL.MenuItem(item.text, item.callback, { width: 100, id: 'menu' + index })
      );
    });
    this.map?.addContextMenu(menu);
  };

  //画框选取marker
  drawSelete = event => {
    let { orders } = this.state;
    let overlays = [];
    overlays.push(event.overlay);
    let pStart = event.overlay.getPath()[3]; //矩形左上角坐标
    let pEnd = event.overlay.getPath()[1]; //矩形右上角坐标
    var pt1 = new BMapGL.Point(pStart.lng, pStart.lat); //3象限
    var pt2 = new BMapGL.Point(pEnd.lng, pEnd.lat); //1象限
    var bds = new BMapGL.Bounds(pt1, pt2); //范围

    for (const order of orders.filter(x => !x.isSelect)) {
      var pt = new BMapGL.Point(order.longitude, order.latitude);
      order.isSelect = this.isPointInRect(pt, bds);
    }
    this.map.removeOverlay(event.overlay);
    // orders = orderBy(orders, x => x.isSelect);
    this.setState({ orders }, () => {
      this.clusterSetData(orders);
    });
    this.props.dispatchingByMap(orders.filter(x => x.isSelect));
  };
  //判断一个点是否在某个矩形中
  isPointInRect = (point, bounds) => {
    var sw = bounds.getSouthWest(); //西南脚点
    var ne = bounds.getNorthEast(); //东北脚点
    return point.lng >= sw.lng && point.lng <= ne.lng && point.lat >= sw.lat && point.lat <= ne.lat;
  };

  render() {
    const { visible, isDrag, windowInfo, orders } = this.state;
    return (
      <Modal
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        width="100vw"
        className={style.dispatchingMap}
        bodyStyle={{ margin: -24, height: '99vh' }}
        visible={visible}
        title={
          <Row type="flex" justify="space-between">
            <Col span={20}>
              <SearchForm refresh={this.refresh} />
            </Col>
            <Col span={1}>
              <Button onClick={() => this.onReset()}>清空</Button>
            </Col>
            <Col span={1}>
              <Button onClick={() => this.setState({ visible: false })}>关闭</Button>
            </Col>
          </Row>
        }
        closable={false}
        destroyOnClose={true}
      >
        <Row type="flex" style={{ height: '100%' }}>
          <Col span={6} style={{ height: '100%', background: '#fff', overflow: 'auto' }}>
            {orders.filter(x => x.isSelect).length > 0 ? (
              orders.filter(x => x.isSelect).map(order => {
                return (
                  <div
                    className={style.storeCard}
                    onClick={() => this.onChangeSelect(!order.isSelect, order)}
                  >
                    <div>
                      {/* <Checkbox
                        checked={order.isSelect}
                        onChange={event => this.onChangeSelect(event.target.checked, order)}
                      /> */}
                      {`[${order.deliveryPoint.code}]` + order.deliveryPoint.name}
                    </div>
                    <div>
                      线路：
                      {order.archLine?.name}
                    </div>
                    <Divider style={{ margin: 0, marginTop: 5 }} />
                    <div style={{ display: 'flex', marginTop: 5 }}>
                      <div style={{ flex: 1 }}>整件数</div>
                      <div style={{ flex: 1 }}>周转箱数</div>
                      <div style={{ flex: 1 }}>体积</div>
                      <div style={{ flex: 1 }}>重量</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ flex: 1 }}>{order.cartonCount}</div>
                      <div style={{ flex: 1 }}>{order.containerCount}</div>
                      <div style={{ flex: 1 }}>{order.volume}</div>
                      <div style={{ flex: 1 }}>{order.weight}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <Empty
                style={{ marginTop: 80 }}
                image={emptySvg}
                description="暂无数据，请选择排车门店！"
              />
            )}
          </Col>
          <Col span={18}>
            {orders.length > 0 ? (
              <Map
                zoom={10}
                minZoom={6}
                enableScrollWheelZoom
                enableRotate={false}
                // enableDragging={isDrag}
                enableTilt={false}
                ref={ref => (this.map = ref?.map)}
                style={{ height: '100%' }}
              >
                <DrawingManager
                  enableLimit
                  enableCalculate
                  // enableDrawingTool={false}
                  onOverlaycomplete={event => this.drawSelete(event)}
                  limitOptions={{ area: 9999999999999, distance: 9999999999999 }}
                  drawingToolOptions={{
                    drawingModes: ['rectangle'],
                  }}
                  rectangleOptions={{
                    strokeColor: '#d9534f', //边线颜色。
                    fillColor: '#f4cdcc', //填充颜色。当参数为空时，圆形将没有填充效果。
                    strokeWeight: 2, //边线的宽度，以像素为单位。         ");
                    strokeOpacity: 0.6, //边线透明度，取值范围0 - 1。
                    fillOpacity: 0.3, //填充的透明度，取值范围0 - 1。
                    strokeStyle: 'dashed', //边线的样式，solid或dashed。
                  }}
                  ref={ref => (this.drawingManagerRef = ref?.drawingmanager)}
                />
                {/* {this.drawMarker()} */}
                {windowInfo ? (
                  <CustomOverlay position={windowInfo.point} offset={new BMapGL.Size(15, -15)}>
                    <div style={{ width: 250, height: 100, padding: 5, background: '#FFF' }}>
                      <div style={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {`[${windowInfo.order.deliveryPoint.code}]` +
                          windowInfo.order.deliveryPoint.name}
                      </div>
                      <div>
                        线路：
                        {windowInfo.order.archLine?.name}
                      </div>
                      <Divider style={{ margin: 0, marginTop: 5 }} />
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
                        <div style={{ flex: 1 }}>{windowInfo.order.weight}</div>
                      </div>
                    </div>
                  </CustomOverlay>
                ) : (
                  <></>
                )}
              </Map>
            ) : (
              <Map
                center={{ lng: 113.809388, lat: 23.067107 }}
                zoom={14}
                enableScrollWheelZoom
                enableAutoResize
                enableRotate={false}
                enableTilt={false}
                style={{ height: '100%' }}
              />
            )}
          </Col>
        </Row>
      </Modal>
    );
  }
}
