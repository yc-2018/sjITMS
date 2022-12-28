/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-11 11:28:48
 * @Description: 地图排车
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\dispatching\DispatchingMap.js
 */
import React, { Component } from 'react';
import { Divider, Modal, Button, Row, Col, Empty, Spin, message, Input, PageHeader } from 'antd';
import { Map, Marker, CustomOverlay, DrawingManager } from 'react-bmapgl';
import style from './DispatchingMap.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import emptySvg from '@/assets/common/img_empoty.svg';
import SearchForm from './SearchForm';
import { queryAuditedOrderByStoreMap, queryDriverRoutes } from '@/services/sjitms/OrderBill';
import { queryDict } from '@/services/quick/Quick';
import ShopIcon from '@/assets/common/myj.png';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import ShopClickIcon from '@/assets/common/myjClick.png';

import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { sumBy, uniqBy } from 'lodash';

const { Search } = Input;

export default class StoresMap extends Component {
  basicOrders = [];
  state = {
    visible: true,
    loading: true,
    windowInfo: undefined,
    loading: false,
    startPoint: '',
    pageFilter: [],
    orders: [],
    driverTime: 0,
    driverMileage: 0,
    isPoly: false,
    isSearch: false,
    otherData: [],
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  //显示modal
  show = () => {
    this.setState({ visible: true });
    queryDict('warehouse').then(res => {
      this.setState({
        startPoint: res.data.find(x => x.itemValue == loginOrg().uuid)?.description,
      });
    });
  };
  //隐藏modal
  hide = () => {
    this.setState({ visible: false });
    this.clusterLayer = undefined;
    this.contextMenu = undefined;
  };

  //查询
  refresh = params => {
    this.setState({ loading: true });
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
    queryAuditedOrderByStoreMap(filter).then(response => {
      if (response.success) {
        let data = response.data.records ? response.data.records : [];
        data = data.filter(x => x.longitude && x.latitude);
        let otherData = response.data.otherRecords ? response.data.otherRecords : [];
        otherData = otherData.filter(x => x.longitude && x.latitude);
        this.basicOrders = data;
        this.setState({ orders: data, otherData: otherData }, () => {
          setTimeout(() => {
            this.drawClusterLayer();
            this.drawMenu();
            this.clusterSetData(data, otherData);
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
  onChangeSelect = (checked, record) => {
    let { orders } = this.state;
    let order = orders.find(x => x.uuid == record.uuid);
    let num = orders.filter(e => {
      return e.isSelect;
    }).length;
    if (!checked) {
      //取消时-1
      orders.map(e => {
        if (e.sort > record.sort) {
          e.sort -= 1;
        }
      });
    }
    if (order) {
      order.isSelect = checked;
      order.sort = checked ? num + 1 : null;
      this.setState({ orders }, () => {
        this.clusterSetData(orders);
      });
    }
  };

  //重置
  onReset = () => {
    let { orders, otherData } = this.state;
    orders.map(order => {
      (order.isSelect = false), (order.sort = null);
    });
    this.setState({ orders, driverMileage: 0, storeInfo: '', isSearch: false }, () => {
      this.map?.clearOverlays();
      this.clusterSetData(orders, otherData);
    });
    // this.storeFilter('');
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
      // onClick(event) {
      //   if (event.dataItem?.order) {
      //     const order = event.dataItem.order;
      //     that.onChangeSelect(!order.isSelect, order);
      //   }
      // },
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
  clusterSetData = (data, otherData) => {
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
          icon: [ShopIcon, ShopClickIcon][0],
          width: 42, //38
          height: 42, //38
        },
        order: point,
      });
    });

    //otherData
    if (otherData) {
      otherData.map(point => {
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
            icon: [ShopIcon, ShopClickIcon][1],
            width: 42, //38
            height: 42, //38
          },
          order: point,
        });
      });
    }

    this.clusterLayer?.setData(markers);
  };

  //路线规划
  searchRoute = async selectPoints => {
    this.clusterSetData([]);
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
    // if (this.contextMenu) return;
    // const menuItems = [
    //   {
    //     text: '排车',
    //     callback: () => {
    //       const { orders } = this.state;
    //       const selectPoints = orders.filter(x => x.isSelect);
    //       if (selectPoints.length === 0) {
    //         message.error('请选择需要排车的门店！');
    //         return;
    //       }
    //       this.props.dispatchingByMap(selectPoints);
    //     },
    //   },
    //   {
    //     text: '路线规划',
    //     callback: () => {
    //       const { orders } = this.state;
    //       const selectPoints = orders.filter(x => x.isSelect);
    //       if (selectPoints.length === 0) {
    //         message.error('请选择需要排车的门店！');
    //         return;
    //       }
    //       this.searchRoute(selectPoints);
    //     },
    //   },
    // ];
    // const menu = new BMapGL.ContextMenu();
    // menuItems.forEach((item, index) => {
    //   menu.addItem(
    //     new BMapGL.MenuItem(item.text, item.callback, { width: 100, id: 'menu' + index })
    //   );
    // });
    // this.contextMenu = menu;
    // this.map?.addContextMenu(menu);
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

  storeFilter = (key, e) => {
    // let serachStores = this.basicOrders.filter(
    //   item => item.deliveryPoint.code.search(e) != -1 || item.deliveryPoint.name.search(e) != -1
    // );
    // this.setState({ orders: serachStores, storeInfo: e }, () => {
    //   setTimeout(() => {
    //     this.drawClusterLayer();
    //     this.drawMenu();
    //     this.clusterSetData(serachStores);
    //     this.autoViewPort(serachStores);
    //   }, 500);
    // });
    if (e == '') {
      this.setState({ isSearch: false }, () => {
        setTimeout(() => {
          this.map.clearOverlays();
        }, 500);
      });
    } else {
      this.setState({ isSearch: true }, () => {
        var local = new BMapGL.LocalSearch(this.map, {
          renderOptions: { map: this.map, panel: 'r-result' },
        });
        local.search(e);
      });
    }
    this.setState({ storeInfo: e });
  };

  render() {
    const { visible, loading, windowInfo, orders } = this.state;
    const selectOrder = orders.filter(x => x.isSelect);
    const stores = uniqBy(selectOrder.map(x => x.deliveryPoint), x => x.uuid);
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <div style={{ backgroundColor: '#ffffff' }}>
            <Row type="flex" justify="space-between">
              <Col span={24}>
                <SearchForm refresh={this.refresh} />
              </Col>
              {/* <Col span={1}>
                <Button onClick={() => this.onReset()}>清空</Button>
              </Col> */}
              {/* <Col span={1}>l
                <Button onClick={() => this.hide()}>关闭</Button>
              </Col> */}
            </Row>
            <Spin
              indicator={LoadingIcon('default')}
              spinning={loading}
              tip="加载中..."
              wrapperClassName={style.loading}
            >
              <Row type="flex" style={{ height: window.innerHeight - 200 }}>
                <Col
                  span={6}
                  style={{
                    height: '100%',
                    background: '#fff',
                    overflow: 'auto',
                  }}
                >
                  {/* <Empty
                    style={{ marginTop: 80 }}
                    image={emptySvg}
                    description="暂无数据，请选择排车门店！"
                  /> */}
                  {/* <div style={{ textAlign: 'left', fontSize: '16px' }}>门店地址查询</div> */}
                  <PageHeader
                    style={{
                      border: '1px solid rgb(235, 237, 240)',
                      width: '90%',
                    }}
                    // onBack={() => null}
                    title="门店地址查询"
                    subTitle="请输入门店地址或坐标建筑名"
                  />
                  <div>
                    <Search
                      placeholder="请输入地址"
                      allowClear
                      onChange={event => this.storeFilter('storeInfo', event.target.value)}
                      style={{ width: '90%', marginTop: '15px' }}
                      value={this.state.storeInfo}
                    />
                  </div>
                  {this.state.isSearch ? <div id="r-result" style={{ width: '90%' }} /> : null}
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
                      {windowInfo ? (
                        <CustomOverlay
                          position={windowInfo.point}
                          offset={new BMapGL.Size(15, -15)}
                        >
                          <div style={{ width: 280, height: 100, padding: 5, background: '#FFF' }}>
                            <div
                              style={{
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {`[${windowInfo.order.deliveryPoint.code}]` +
                                windowInfo.order.deliveryPoint.name}
                            </div>
                            <div>
                              线路：
                              {windowInfo.order.archLine?.code}
                              所属区域：
                              {windowInfo.order.shipareaname}
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
          </div>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
