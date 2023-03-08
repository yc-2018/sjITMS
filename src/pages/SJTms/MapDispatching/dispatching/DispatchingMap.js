/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-12-23 10:38:17
 * @Description: 地图排车
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\dispatching\DispatchingMap.js
 */
import React, { Component } from 'react';
import { Divider, Modal, Button, Row, Col, Empty, Spin, message, Input } from 'antd';
import { Map, Marker, CustomOverlay, DrawingManager, Label } from 'react-bmapgl';
import style from './DispatchingMap.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import emptySvg from '@/assets/common/img_empoty.svg';
import SearchForm from './SearchForm';
import { queryAuditedOrder, queryDriverRoutes } from '@/services/sjitms/OrderBill';
import { queryDict } from '@/services/quick/Quick';

import ShopIcon from '@/assets/common/myj.png';
import ShopClickIcon from '@/assets/common/otherMyj.png';

import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { sumBy, uniqBy } from 'lodash';

const { Search } = Input;

export default class DispatchMap extends Component {
  basicOrders = [];
  isSelectOrders = [];
  state = {
    visible: false,
    loading: true,
    windowInfo: undefined,
    loading: false,
    startPoint: '',
    pageFilter: [],
    orders: [],
    driverTime: 0,
    driverMileage: 0,
    isPoly: false,
    orderMarkers: [],
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  //显示modal
  show = orders => {
    this.setState({ visible: true });
    queryDict('warehouse').then(res => {
      this.setState({
        startPoint: res.data.find(x => x.itemValue == loginOrg().uuid)?.description,
      });
    });
    if (orders) {
      for (const order of orders.filter(x => !x.isSelect)) {
        let num = orders.filter(e => {
          return e.isSelect;
        }).length;
        order.isSelect = true;
        order.sort = num + 1;
      }
      this.isSelectOrders = orders;
    }
  };
  //隐藏modal
  hide = () => {
    this.setState({ visible: false });
    this.clusterLayer = undefined;
    this.contextMenu = undefined;
    this.isSelectOrders = [];
  };

  //查询
  refresh = params => {
    this.setState({ loading: true });
    let { pageFilter } = this.state;
    let filter = { pageSize: 500, superQuery: { matchType: 'and', queryParams: [] } };
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
        let data = response.data.records ? response.data.records : [];
        data = data.filter(x => x.longitude && x.latitude);
        let isSelectOrdersArea =
          this.isSelectOrders && this.isSelectOrders.length > 0
            ? uniqBy(
                this.isSelectOrders.map(e => {
                  return e.shipAreaName;
                })
              )
            : [];

        data.map(e => {
          if (this.isSelectOrders && this.isSelectOrders.length > 0) {
            let x = this.isSelectOrders.find(item => item.uuid == e.uuid);
            if (x || isSelectOrdersArea.indexOf(e.shipAreaName) != -1) {
              e.isSelect = true;
              e.sort = x?.sort ? x.sort : undefined;
            }
          }
        });

        //去重
        var obj = {};
        let orderMarkers = data.reduce((cur, next) => {
          obj[next.deliveryPoint.code]
            ? ''
            : (obj[next.deliveryPoint.code] = true && cur.push(next));
          return cur;
        }, []); //设置cur默认类型为数组，并且初始值为空的数组

        // if (this.isSelectOrders && this.isSelectOrders.length > 0) {
        //   this.isSelectOrders.map(e => {
        //     let x = data.find(item => item.uuid == e.uuid);
        //     if (x) {
        //       x.isSelect = true;
        //       x.sort = e.sort;
        //     }
        //   });

        //   orderMarkers.map(e => {
        //     if (isSelectOrdersArea.indexOf(e.shipAreaName) != -1) {
        //       e.isSelect = true;
        //       // e.sort = orderMarkers.filter(x => x.isSelect).length + this.isSelectOrders.length;
        //     }
        //   });
        // }

        this.basicOrders = data;
        this.setState({ orders: data, orderMarkers }, () => {
          setTimeout(() => {
            // this.drawClusterLayer();
            this.drawMenu();
            // this.clusterSetData(data);
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
  autoViewPort = points => {
    const newPoints = points.map(point => {
      return new BMapGL.Point(point.longitude, point.latitude);
    });
    this.map?.setViewport(newPoints);
  };

  //选门店
  onChangeSelect = (checked, order) => {
    let { orders } = this.state;
    // let order = orders.find(x => x.uuid == record.uuid);
    // console.log('order', order);
    let num = orders.filter(e => {
      return e.isSelect;
    }).length;
    if (!checked) {
      //取消时-1
      orders.map(e => {
        if (e.sort > order.sort) {
          e.sort -= 1;
        }
      });
    }
    if (order) {
      order.isSelect = checked;
      order.sort = checked ? num + 1 : null;
      this.setState(
        { orders }
        // , () => {
        // this.clusterSetData(orders);
        // }
      );
    }
  };

  //重置
  onReset = () => {
    let { orders } = this.state;
    orders.map(order => {
      (order.isSelect = false), (order.sort = null);
    });
    this.setState({ orders, driverMileage: 0, storeInfo: '' }, () => {
      // this.map?.clearOverlays();
      // this.clusterSetData(orders);
    });
    this.storeFilter('');
  };

  //标注点
  drawMarker = () => {
    const { orders, orderMarkers } = this.state;
    let that = this;
    const otherStore = new BMapGL.Icon(ShopClickIcon, new BMapGL.Size(30, 30)); //42
    const icon = new BMapGL.Icon(ShopIcon, new BMapGL.Size(30, 30));
    let markers = [];
    orderMarkers.map((order, index) => {
      var point = new BMapGL.Point(order.longitude, order.latitude);
      markers.push(
        <Marker
          isTop={order.isSelect}
          position={point}
          icon={order.isSelect ? otherStore : icon}
          // icon={[icon, otherStore][order.isSelect ? 1 : 0]}
          shadow={true}
          onMouseover={() => this.setState({ windowInfo: { point, order } })}
          onMouseout={() => this.setState({ windowInfo: undefined })}
          onClick={event => {
            that.onChangeSelect(!order.isSelect, order);
          }}
        />
      );
      if (order.isSelect) {
        if (order.sort) {
          markers.push(
            <Label
              position={new BMapGL.Point(order.longitude, order.latitude)}
              offset={new BMapGL.Size(30, -30)}
              text={order.sort}
            />
          );
        }
      }
    });

    return markers;
  };

  //数字

  //标注点聚合图层初始化
  drawClusterLayer = () => {
    if (this.clusterLayer) {
      return;
    }
    const { isPoly } = this.state; //取消聚合
    const that = this;
    const view = new mapvgl.View({ map: this?.map });
    this.clusterLayer = new mapvgl.ClusterLayer({
      minSize: 40,
      maxSize: 80,
      clusterRadius: 150,
      gradient: { 0: '#E6AA68', 0.5: '#309900', 1.0: '#CA3C25' },
      maxZoom: isPoly ? 15 : 9999,
      minZoom: isPoly ? 5 : 9999,
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
    view.addLayer(this.clusterLayer);
  };
  //标注点聚合图层数据加载
  clusterSetData = data => {
    // this.clusterLayer?.setData([]);
    //const markers =
    let markers = [];
    //清除所有label
    var allOverlay = this.map?.getOverlays();
    if (allOverlay?.length) {
      for (var i = 0; i < allOverlay.length; i++) {
        this.map?.removeOverlay(allOverlay[i]);
      }
    }
    data.map(point => {
      if (point.sort) {
        var opts = {
          position: new BMapGL.Point(point.longitude, point.latitude), // 指定文本标注所在的地理位置
          offset: new BMapGL.Size(30, -30), // 设置文本偏移量
        };
        var label = new BMapGL.Label(point.sort, opts);
        this.map?.addOverlay(label);
      }
      markers.push({
        geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
        properties: {
          icon: [ShopIcon, ShopClickIcon][point.isSelect ? 1 : 0],
          width: 42, //38
          height: 42, //38
        },
        order: point,
      });
    });
    this.clusterLayer?.setData(markers);
  };

  //路线规划
  searchRoute = async selectPoints => {
    // this.clusterSetData([]);
    const map = this.map;
    const { startPoint } = this.state;
    const pointArr = selectPoints.map(order => {
      return (order.latitude + ',' + order.longitude).trim();
    });
    const waypoints = pointArr.filter((_, index) => index < pointArr.length - 1);
    const response = await queryDriverRoutes(
      startPoint,
      pointArr[pointArr.length - 1],
      waypoints.join('|')
    );
    if (response.success && response.data.status == 0) {
      const routePaths = response.data.result.routes[0].steps.map(x => x.path);
      let pts = new Array();
      routePaths.forEach(path => {
        const points = path.split(';');
        points.forEach(point => {
          pts.push(new BMapGL.Point(point.split(',')[0], point.split(',')[1]));
        });
      });
      var polyline = new BMapGL.Polyline(pts, {
        strokeColor: '#00bd01',
        strokeWeight: 6,
        strokeOpacity: 1,
      });
      map.addOverlay(polyline);
      map.addOverlay(
        this.drawRouteMaker(startPoint.split(',')[1], startPoint.split(',')[0], 50, 80, 400, 278)
      );
      selectPoints.forEach((point, index) => {
        index == selectPoints.length - 1
          ? map.addOverlay(this.drawRouteMaker(point.longitude, point.latitude, 50, 80, 450, 278))
          : map.addOverlay(this.drawRouteMaker(point.longitude, point.latitude, 70, 80, 530, 420));
      });
      map.setViewport(pts);
    }
  };
  //路线规划标注
  drawRouteMaker = (lng, lat, width, hieght, x, y) => {
    const iconUrl = '//webmap1.bdimg.com/wolfman/static/common/images/markers_new2x_2960fb4.png';
    return new BMapGL.Marker(new BMapGL.Point(lng, lat), {
      icon: new BMapGL.Icon(iconUrl, new BMapGL.Size(width / 2, hieght / 2), {
        imageOffset: new BMapGL.Size(x / 2, y / 2),
        imageSize: new BMapGL.Size(600 / 2, 600 / 2),
      }),
    });
  };

  //右键菜单
  drawMenu = () => {
    if (this.contextMenu) return;
    const menuItems = [
      {
        text: '排车',
        callback: () => {
          const { orders } = this.state;
          const selectPoints = orders.filter(x => x.isSelect);
          if (selectPoints.length === 0) {
            message.error('请选择需要排车的门店！');
            return;
          }
          this.props.dispatchingByMap(selectPoints);
        },
      },
      {
        text: '路线规划',
        callback: () => {
          const { orders } = this.state;
          const selectPoints = orders.filter(x => x.isSelect);
          if (selectPoints.length === 0) {
            message.error('请选择需要排车的门店！');
            return;
          }
          this.searchRoute(selectPoints);
        },
      },
      {
        text: '导航',
        callback: () => {
          const { orders } = this.state;
          let selectPoints = orders.filter(x => x.isSelect);
          selectPoints = selectPoints.map(order => {
            return { ...order.deliveryPoint, latitude: order.latitude, longitude: order.longitude };
          });
          selectPoints = uniqBy(selectPoints, x => x.uuid);
          if (selectPoints.length < 1) {
            message.error('请选择导航起点门店和终点门店！');
            return;
          }
          let url = `http://api.map.baidu.com/direction?origin=latlng:${selectPoints[0].latitude},${
            selectPoints[0].longitude
          }|name:${selectPoints[0].name.replace(/\([^\)]*\)/g, '')}&destination=${
            selectPoints[selectPoints.length - 1].latitude
          },${selectPoints[selectPoints.length - 1].longitude}|name:${selectPoints[
            selectPoints.length - 1
          ].name.replace(
            /\([^\)]*\)/g,
            ''
          )}&mode=driving&region=东莞市&output=html&src=webapp.companyName.appName&coord_type=bd09ll`;
          window.open(url, '_blank');
        },
      },
    ];

    const menu = new BMapGL.ContextMenu();
    menuItems.forEach((item, index) => {
      menu.addItem(
        new BMapGL.MenuItem(item.text, item.callback, { width: 100, id: 'menu' + index })
      );
    });
    this.contextMenu = menu;
    this.map?.addContextMenu(menu);
  };

  //画框选取送货点
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
      let num = orders.filter(e => {
        return e.isSelect;
      }).length;
      order.isSelect = this.isPointInRect(pt, bds);
      order.sort = num + 1;
    }
    this.map.removeOverlay(event.overlay);
    this.setState({ orders }, () => {
      // this.clusterSetData(orders);
    });
    this.props.dispatchingByMap(orders.filter(x => x.isSelect));
  };
  //判断一个点是否在某个矩形中
  isPointInRect = (point, bounds) => {
    var sw = bounds.getSouthWest(); //西南脚点
    var ne = bounds.getNorthEast(); //东北脚点
    return point.lng >= sw.lng && point.lng <= ne.lng && point.lat >= sw.lat && point.lat <= ne.lat;
  };

  storeFilter = (key, e) => {
    let serachStores = this.basicOrders.filter(
      item => item.deliveryPoint.code.search(e) != -1 || item.deliveryPoint.name.search(e) != -1
    );
    this.setState({ orders: serachStores, storeInfo: e }, () => {
      setTimeout(() => {
        // this.drawClusterLayer();
        this.drawMenu();
        // this.clusterSetData(serachStores);
        this.autoViewPort(serachStores);
      }, 500);
    });
  };

  getTotals = selectOrder => {
    let totals = {
      cartonCount: 0, //整件数
      scatteredCount: 0, //散件数
      containerCount: 0, //周转箱
      volume: 0, //体积
      weight: 0, //重量,
      totalCount: 0, //总件数
    };
    selectOrder.map(e => {
      totals.cartonCount += e.cartonCount;
      totals.scatteredCount += e.scatteredCount;
      totals.containerCount += e.containerCount;
      totals.volume += e.volume;
      totals.weight += e.weight;
    });
    totals.totalCount = totals.cartonCount + totals.scatteredCount + totals.containerCount * 2;
    return totals;
  };

  render() {
    const { visible, loading, windowInfo, orders } = this.state;
    const selectOrder = orders.filter(x => x.isSelect).sort(x => x.sort);
    const stores = uniqBy(selectOrder.map(x => x.deliveryPoint), x => x.uuid);
    let totals = this.getTotals(selectOrder);
    return (
      <Modal
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        width="100vw"
        className={style.dispatchingMap}
        bodyStyle={{ margin: -24, height: '99vh' }}
        visible={visible}
        title={
          <div>
            <Row type="flex" justify="space-between">
              <Col span={21}>
                <SearchForm refresh={this.refresh} />
              </Col>
              {/* <Col span={1}>
              <Search
                placeholder="请输入门店编号或名称"
                allowClear
                onChange={event => this.storeFilter('storeInfo', event.target.value)}
                style={{ width: 150, marginLeft: -80 }}
                value={this.state.storeInfo}
              />
            </Col> */}
              <Col span={1}>
                <Button onClick={() => this.onReset()}>清空</Button>
              </Col>
              <Col span={1}>
                <Button onClick={() => this.hide()}>关闭</Button>
              </Col>
            </Row>
            <Divider style={{ margin: 0, marginTop: 5 }} />
            <Row>
              <div style={{ display: 'flex', marginTop: 5 }}>
                <div style={{ flex: 1, fontWeight: 'bold' }}>
                  总件数:
                  {totals.totalCount}
                </div>
                <div style={{ flex: 1, fontWeight: 'bold' }}>
                  整件数:
                  {totals.cartonCount}
                </div>
                <div style={{ flex: 1, fontWeight: 'bold' }}>
                  散件数:
                  {totals.scatteredCount}
                </div>
                <div style={{ flex: 1, fontWeight: 'bold' }}>
                  周转箱:
                  {totals.containerCount}
                </div>
                <div style={{ flex: 1, fontWeight: 'bold' }}>
                  体积:
                  {totals.volume}
                </div>
                <div style={{ flex: 1, fontWeight: 'bold' }}>
                  重量:
                  {totals.weight}
                </div>
              </div>
            </Row>
          </div>
        }
        closable={false}
        destroyOnClose={true}
      >
        <Spin
          indicator={LoadingIcon('default')}
          spinning={loading}
          tip="加载中..."
          wrapperClassName={style.loading}
        >
          <Row type="flex" style={{ height: '100%' }}>
            <Col span={6} style={{ height: '100%', background: '#fff', overflow: 'auto' }}>
              {selectOrder.length > 0 ? (
                <div style={{ position: 'relative', height: '100%' }}>
                  {selectOrder.map(order => {
                    return (
                      <div
                        className={style.storeCard}
                        onClick={() => this.onChangeSelect(!order.isSelect, order)}
                      >
                        <div className={style.storeCardTitle}>
                          {/* <Checkbox
                        checked={order.isSelect}
                        onChange={event => this.onChangeSelect(event.target.checked, order)}
                      /> */}
                          {`[${order.deliveryPoint.code}]` + order.deliveryPoint.name}
                        </div>
                        <div style={{ display: 'flex' }}>
                          <div style={{ flex: 1 }}>
                            线路：
                            {order.archLine?.code}
                          </div>
                          <div style={{ flex: 1 }}>
                            备注：
                            {order?.lineNote}
                          </div>
                        </div>
                        <Divider style={{ margin: 0, marginTop: 5 }} />
                        <div style={{ display: 'flex', marginTop: 5 }}>
                          <div style={{ flex: 1 }}>整件数</div>
                          <div style={{ flex: 1 }}>散件数</div>
                          <div style={{ flex: 1 }}>周转箱</div>
                          <div style={{ flex: 1 }}>体积</div>
                          <div style={{ flex: 1 }}>重量</div>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <div style={{ flex: 1 }}>{order.cartonCount}</div>
                          <div style={{ flex: 1 }}>{order.scatteredCount}</div>
                          <div style={{ flex: 1 }}>{order.containerCount}</div>
                          <div style={{ flex: 1 }}>{order.volume}</div>
                          <div style={{ flex: 1 }}>{(order.weight / 1000).toFixed(3)}</div>
                        </div>
                      </div>
                    );
                  })}
                  {/* <Row
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      left: 0,
                      background: '#fff',
                      width: '100%',
                    }}
                  >
                    <Col span={6}>
                      门店数:
                      {stores.length || 0}
                    </Col>
                    <Col span={6}>
                      总体积:
                      {Math.round(sumBy(selectOrder, 'weight') * 1000) / 1000}
                    </Col>
                    <Col span={6}>
                      总重量:
                      {Math.round(sumBy(selectOrder, 'volume') * 1000) / 1000}
                    </Col>
                    <Col span={6}>
                      <Button>排车</Button>
                    </Col>
                  </Row> */}
                </div>
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
                  center={{ lng: 113.809388, lat: 23.067107 }}
                  zoom={10}
                  minZoom={6}
                  enableScrollWheelZoom
                  enableRotate={false}
                  enableTilt={false}
                  ref={ref => (this.map = ref?.map)}
                  style={{ height: '100%' }}
                >
                  {this.drawMarker()}
                  {/* 鼠标绘制工具 */}
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

                  {windowInfo ? (
                    <CustomOverlay position={windowInfo.point} offset={new BMapGL.Size(15, -15)}>
                      <div style={{ width: 280, height: 100, padding: 5, background: '#FFF' }}>
                        <div
                          style={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' }}
                        >
                          {`[${windowInfo.order.deliveryPoint.code}]` +
                            windowInfo.order.deliveryPoint.name}
                        </div>
                        <div style={{ display: 'flex' }}>
                          <div style={{ flex: 1 }}>
                            线路：
                            {windowInfo.order.archLine?.code}
                          </div>
                          <div style={{ flex: 1 }}>
                            备注：
                            {windowInfo.order?.lineNote}
                          </div>
                        </div>
                        <Divider style={{ margin: 0, marginTop: 5 }} />
                        <div style={{ display: 'flex', marginTop: 5 }}>
                          <div style={{ flex: 1 }}>整件数</div>
                          <div style={{ flex: 1 }}>散件数</div>
                          <div style={{ flex: 1 }}>周转箱</div>
                          <div style={{ flex: 1 }}>体积</div>
                          <div style={{ flex: 1 }}>重量</div>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <div style={{ flex: 1 }}>{windowInfo.order.cartonCount}</div>
                          <div style={{ flex: 1 }}>{windowInfo.order.scatteredCount}</div>
                          <div style={{ flex: 1 }}>{windowInfo.order.containerCount}</div>
                          <div style={{ flex: 1 }}>{windowInfo.order.volume}</div>
                          <div style={{ flex: 1 }}>
                            {(windowInfo.order.weight / 1000).toFixed(3)}
                          </div>
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
                  zoom={10}
                  enableScrollWheelZoom
                  enableAutoResize
                  enableRotate={false}
                  enableTilt={false}
                  style={{ height: '100%' }}
                />
              )}
            </Col>
          </Row>
        </Spin>
      </Modal>
    );
  }
}
