import React, { Component } from 'react';
import { Divider, Button, Row, Col, Spin, message, Input, PageHeader, Select } from 'antd';
import { Map, Marker, CustomOverlay, DrawingManager, Label } from 'react-bmapgl';
import style from './DispatchingMap.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import SearchForm from './SearchForm';
import {
  queryAuditedOrderByStoreMap,
  queryDriverRoutes,
  queryStoreMaps,
} from '@/services/sjitms/OrderBill';
import { queryDict } from '@/services/quick/Quick';
import ShopIcon from '@/assets/common/myj.png';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import moment from 'moment';

import otherIcon from '@/assets/common/otherMyj.png';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
// import Select from '@/components/ExcelImport/Select';

const { Search } = Input;
const { Option } = Select;

export default class StoresMap extends Component {
  basicOrders = [];
  markerArr = [];
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
    storePages: '500',
    isOrder: false,
    storeParams: [],
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
    this.changePage('500');
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
  refresh = (params, pageSize, storeParams) => {
    if (params.length <= 0) {
      this.changePage(
        this.state.storePages ? this.state.storePages : '500',
        'onlySearchStore',
        storeParams
      );
      return;
    }
    this.setState({ loading: true });
    let { pageFilter, storePages } = this.state;
    let filter = {
      pageSize: pageSize ? pageSize : storePages,
      superQuery: { matchType: 'and', queryParams: [] },
    };
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
      // { field: 'STAT', type: 'VarChar', rule: 'in', val: 'Audited||PartScheduled' },
      { field: 'PENDINGTAG', type: 'VarChar', rule: 'eq', val: 'Normal' },
    ];
    queryAuditedOrderByStoreMap(filter).then(async response => {
      if (response.success) {
        let data = response.data.records ? response.data.records : [];
        data = data.filter(x => x.longitude && x.latitude);
        let otherData = response.data.otherRecords ? response.data.otherRecords : [];
        otherData = otherData.filter(x => x.longitude && x.latitude);
        this.basicOrders = data;
        //查询门店
        let storeRes = [];
        // console.log('storeParams', storeParams);
        if (storeParams && JSON.stringify(storeParams) !== '{}') {
          storeRes = await this.getStoreMaps(pageSize ? pageSize : storePages, storeParams);
        }
        data.map(e => {
          e.isOrder = true;
        });
        this.setState(
          { orders: [...data, ...storeRes], otherData: otherData, isOrder: true },
          () => {
            setTimeout(() => {
              // this.drawClusterLayer();
              this.drawMenu();
              // this.clusterSetData(data, otherData);
              // this.drawMarker(data);
              this.autoViewPort(data);
            }, 500);
          }
        );
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
    const { orders, otherData } = this.state;
    const otherStore = new BMapGL.Icon(otherIcon, new BMapGL.Size(42, 42));
    const icon = new BMapGL.Icon(ShopIcon, new BMapGL.Size(42, 42));
    let markers = [];
    otherData.map(order => {
      var point = new BMapGL.Point(order.longitude, order.latitude);
      markers.push(
        <Marker
          position={point}
          // icon={order.isSelect ? ShopClickIcon : ShopIcon}
          icon={otherStore}
          shadow={true}
          onMouseover={() => this.setState({ windowInfo: { point, order } })}
          onMouseout={() => this.setState({ windowInfo: undefined })}
          onClick={() => this.autoViewPort([order])}
        />
      );
    });
    // let datas = [...orders, ...otherData];
    orders.map((order, index) => {
      var point = new BMapGL.Point(order.longitude, order.latitude);

      markers.push(
        <Marker
          position={point}
          // icon='simple_red'
          icon={icon}
          shadow={true}
          onMouseover={() => this.setState({ windowInfo: { point, order } })}
          onMouseout={() => this.setState({ windowInfo: undefined })}
          onClick={() => {
            this.autoViewPort([order]);
          }}
        />
      );
      if (otherData?.length > 0 && order.isOrder) {
        markers.push(
          <Label
            position={new BMapGL.Point(order.longitude, order.latitude)}
            offset={new BMapGL.Size(30, -30)}
            text={index + 1}
          />
        );
      }
    });

    return markers;
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
    data.map((point, index) => {
      if (otherData?.length > 0) {
        var opts = {
          position: new BMapGL.Point(point.longitude, point.latitude), // 指定文本标注所在的地理位置
          offset: new BMapGL.Size(30, -30), // 设置文本偏移量
        };
        var label = new BMapGL.Label(index + 1, opts);
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
    if (this.contextMenu) return;
    const menuItems = [
      // {
      //   text: '排车',
      //   callback: () => {
      //     const { orders } = this.state;
      //     const selectPoints = orders.filter(x => x.isSelect);
      //     if (selectPoints.length === 0) {
      //       message.error('请选择需要排车的门店！');
      //       return;
      //     }
      //     this.props.dispatchingByMap(selectPoints);
      //   },
      // },
      // {
      //   text: '路线规划',
      //   callback: () => {
      //     const { orders } = this.state;
      //     const selectPoints = orders.filter(x => x.isSelect);
      //     if (selectPoints.length === 0) {
      //       message.error('请选择需要排车的门店！');
      //       return;
      //     }
      //     this.searchRoute(selectPoints);
      //   },
      {
        text: '今日配送门店',
        callback: () => {
          let endDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
          let startDate = moment(new Date()).format('YYYY-MM-DD 00:00:00');
          let param = [
            {
              field: 'created',
              type: 'DateTime',
              rule: 'between',
              val: `${startDate}||${endDate}`,
            },
          ];
          this.refresh(param);
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
    var local = new BMapGL.LocalSearch(this.map, {
      renderOptions: { map: this.map, panel: 'r-result' },
    });
    let that = this;
    if (e == '') {
      setTimeout(() => {
        if (that.markerArr.length > 0) {
          for (var i = 0; i < that.markerArr.length; i++) {
            this.map?.removeOverlay(that.markerArr[i]);
          }
        }
        that.markerArr = [];
      }, 1000);
      that.setState({ isSearch: false });
    } else {
      this.setState({ isSearch: true }, () => {
        local.search(e);
        //增加经纬度
        local.setSearchCompleteCallback(e => {
          e._pois.map(point => {
            point.address = `${point.address ? point.address : ''}${'\r\r'}[${
              point.point.lat
            }]${'\r\r'}[${point.point.lng}]`;
          });
        });

        local.setMarkersSetCallback(function(pois) {
          if (that.markerArr.length > 0) {
            for (var i = 0; i < that.markerArr.length; i++) {
              that.map?.removeOverlay(that.markerArr[i]);
            }
          }
          for (var i = 0; i < pois.length; i++) {
            // that.markerArr.push(pois[i].marker);
            that.markerArr[i] = pois[i].marker;
          }
        });
      });
    }
    this.setState({ storeInfo: e });
  };

  changePage = async (e, key, storeParamsp) => {
    const { pageFilter, storeParams } = this.state;

    if (pageFilter.length > 0 && !key) {
      // message.error('请先点击清空！');
      this.refresh(pageFilter, e, storeParams);
    } else {
      this.setState({ loading: true });

      console.log('storeParamsp', storeParamsp, key);
      if (key !== 're' && (!storeParamsp || JSON.stringify(storeParamsp) == '{}')) {
        storeParamsp = storeParams;
      }
      let params = {
        ...storeParamsp,
        companyuuid: loginCompany().uuid,
        dispatchcenteruuid: loginOrg().uuid,
        cur: 1,
        pageSize: e,
      };
      let res = await queryStoreMaps(params);
      if (res.success && res.data) {
        //查询门店时 显示其他门店
        if (storeParamsp && 'DELIVERYPOINTCODE' in storeParamsp) {
          // let resAll = await queryStoreMaps({
          //   companyuuid: loginCompany().uuid,
          //   dispatchcenteruuid: loginOrg().uuid,
          //   cur: 1,
          //   pageSize: e,
          // });
          this.setState(
            {
              // orders: resAll.data.records,
              orders: res.data.otherRecords.filter(item => item.uuid != res.data.records[0].uuid),
              otherData: res.data.records,
              pageFilter: [],
              isOrder: false,
              loading: false,
              storeParams: storeParamsp,
            },
            () => {
              setTimeout(() => {
                this.drawMenu();
                this.autoViewPort(res.data.records);
              }, 500);
            }
          );
        } else {
          this.setState(
            {
              orders: res.data.records,
              otherData: [],
              pageFilter: [],
              isOrder: false,
              loading: false,
              storeParams: storeParamsp,
            },
            () => {
              setTimeout(() => {
                this.drawMenu();
                this.autoViewPort(res.data.records);
              }, 500);
            }
          );
        }
      } else {
        this.setState(
          {
            orders: [],
            otherData: [],
            pageFilter: [],
            isOrder: false,
            loading: false,
            storeParams: storeParamsp,
          },
          () => {
            setTimeout(() => {
              this.autoViewPort([]);
            }, 500);
          }
        );
      }
    }
    this.setState({
      storePages: e,
    });
  };

  getStoreMaps = async (pageSize, storeParams) => {
    let params = {
      ...storeParams,
      companyuuid: loginCompany().uuid,
      dispatchcenteruuid: loginOrg().uuid,
      cur: 1,
      pageSize: pageSize,
    };
    let res = await queryStoreMaps(params);
    if (res.success && res.data) {
      return res.data.records;
    } else return [];
  };

  render() {
    const { visible, loading, windowInfo, orders, isOrder } = this.state;
    // const selectOrder = orders.filter(x => x.isSelect);
    // const stores = uniqBy(selectOrder.map(x => x.deliveryPoint), x => x.uuid);
    let storeCode = '[空]';
    let storeName = '<空>';
    if (windowInfo) {
      storeCode = windowInfo.order.isOrder
        ? windowInfo.order.deliveryPoint.code
        : windowInfo.order.code;
      storeName = windowInfo.order.isOrder
        ? windowInfo.order.deliveryPoint.name
        : windowInfo.order.name;
    }
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <div style={{ backgroundColor: '#ffffff' }}>
            <Row type="flex" justify="space-between">
              <Col span={23}>
                <SearchForm refresh={this.refresh} changePage={this.changePage} />
              </Col>
              <Col span={1}>
                <Select
                  defaultValue={500}
                  onChange={e => this.changePage(e)}
                  value={this.state.storePages}
                >
                  <Option value="200">200</Option>
                  <Option value="500">500</Option>
                  <Option value="1000">1000</Option>
                  <Option value="2000">2000</Option>
                  <Option value="5000">3000</Option>
                  <Option value="99999">全部</Option>
                </Select>
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
                      {this.drawMarker()}
                      {windowInfo ? (
                        <CustomOverlay
                          position={windowInfo.point}
                          offset={new BMapGL.Size(15, -15)}
                        >
                          <div
                            style={{
                              width: 280,
                              height: windowInfo.order.cartonCount ? 100 : 50,
                              padding: 5,
                              background: '#FFF',
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {/* {`[${
                                windowInfo.order.deliveryPoint
                                  ? windowInfo.order.deliveryPoint.code
                                  : windowInfo.order.code
                              }]` + windowInfo.order.deliveryPoint
                                ? windowInfo.order.deliveryPoint?.name
                                : windowInfo.order.name} */}
                              {`[${storeCode}]` + storeName}
                            </div>
                            <div>
                              线路：
                              {windowInfo.order.archLine?.code
                                ? windowInfo.order.archLine?.code + ' '
                                : windowInfo.order.archlinecode
                                  ? windowInfo.order.archlinecode + ' '
                                  : '<空> '}
                              所属区域：
                              {windowInfo.order.shipareaname}
                            </div>
                            {windowInfo.order.cartonCount ? (
                              <div>
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
                            ) : null}
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
