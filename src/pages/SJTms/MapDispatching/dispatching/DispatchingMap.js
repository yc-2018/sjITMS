/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-07-27 17:43:20
 * @Description: 地图排车
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\dispatching\DispatchingMap.js
 */
import React, { Component } from 'react';
import {
  Divider,
  Modal,
  Button,
  Row,
  Col,
  Spin,
  message,
  Input,
  List,
  Avatar,
  Icon,
  Checkbox,
} from 'antd';
import { Map, Marker, CustomOverlay, DrawingManager, Label, DistanceTool } from 'react-bmapgl';
import { uniqBy } from 'lodash';
import { getSchedule, getDetailByBillUuids } from '@/services/sjitms/ScheduleBill';
import style from './DispatchingMap.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import SearchForm from './SearchForm';
import {
  queryDriverRoutes,
  queryDriverRoutes2,
  queryAuditedOrderByParams, GetConfig,
} from '@/services/sjitms/OrderBill'
import { queryDict, queryData, dynamicQuery } from '@/services/quick/Quick';

import ShopIcon from '@/assets/common/22.png';
import ShopClickIcon from '@/assets/common/23.png';
import ShopClickIcon2 from '@/assets/common/24.png';
import van from '@/assets/common/van.svg';

import { loginCompany, loginOrg } from '@/utils/LoginContext';
import truck from '@/assets/common/truck.svg';
import ShopsIcons from '@/assets/common/shops.png';

const { Search } = Input;
/**
 * build简化Flex Div代码 +++
 * @author ChenGuangLong
 * @since 2024/5/16 11:03
*/
const bFlexDiv = (name, value, bold = true) =>
  <div style={{ flex: 1, fontWeight: bold ? 'bold' : 'normal' }}>
    {name}:{value}
  </div>
/**
 * build简化Col Div代码 +++
 * @author ChenGuangLong
 * @since 2024/5/17 9:18
*/
const bColDiv2 = (name, value, span = 4) =>
  <Col span={span}>
    <div>{name}</div>
    <div>{value}</div>
  </Col>

// 百度地图api变量
// BMAP_DRAWING_MARKER    = "marker",     // 鼠标画点模式
// BMAP_DRAWING_CLOSE  = "close",   // 鼠标画线模式
// BMAP_DRAWING_POLYLINE  = "polyline",   // 鼠标画线模式
// BMAP_DRAWING_CIRCLE    = "circle",     // 鼠标画圆模式
// BMAP_DRAWING_RECTANGLE = "rectangle",  // 鼠标画矩形模式
// BMAP_DRAWING_POLYGON   = "polygon";    // 鼠标画多边形模式
export default class DispatchMap extends Component {
  basicOrders = [];

  isSelectOrders = [];

  state = {
    allTotals: {
      cartonCount: 0, // 整件数
      scatteredCount: 0, // 散件数
      containerCount: 0, // 周转箱
      coldContainerCount: 0,      // 冷藏周转筐+++
      freezeContainerCount: 0,    // 冷冻周转筐+++
      insulatedContainerCount: 0, // 保温箱+++
      insulatedBagCount: 0,       // 保温袋+++
      freshContainerCount: 0,     // 鲜食筐+++
      volume: 0, // 体积
      weight: 0, // 重量,
      totalCount: 0, // 总件数
      stores: 0, // 总门店数
    },
    visible: false,
    // loading: true,
    windowInfo: undefined,
    loading: false,
    startPoint: '',
    pageFilter: [],
    orders: [],
    driverTime: 0,
    driverMileage: 0,
    isPoly: false,
    orderMarkers: [],
    ScheduledMarkers: [],
    showScheduled: false,
    scheduleList: [],
    isEdit: false,
    schdule: undefined,
    closeLeft: false,
    checkSchedules: [],
    checkScheduleOrders: [],
    bearweight: 0,
    volumet: 0,
    multiVehicle: false,  // 是否多载具+++
  };

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

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
    this.initConfig();
  };

  /**
   * 获取时捷配置中心配置，拿到改调度中心是否是多载具的+++
   * @author ChenGuangLong
   * @since 2024/5/17 14:57
  */
  initConfig = async () => {
    const configResponse = await GetConfig('dispatch', loginOrg().uuid)
    if (configResponse?.data?.[0]?.multiVehicle)
      this.setState({ multiVehicle: configResponse?.data?.[0]?.multiVehicle === '1' })
  };

  keyDown = (event, ...args) => {
    const that = this;
    const e = event || window.event || args.callee.caller.arguments[0];
    if (e && e.keyCode == 82 && e.altKey) {
      if (!this.drawingManagerRef.drawingmanager?._isOpen) {
        this.drawingManagerRef.drawingmanager?.open();
        this.drawingManagerRef.drawingmanager?.setDrawingMode('rectangle');
      } else {
        this.drawingManagerRef.drawingmanager?.close();
      }
    } else if (e && e.keyCode == 81 && e.altKey) {
      // 81 = q Q
      // const { orders, orderMarkers } = this.state;
      // let selectOrderStoreCodes = orderMarkers
      //   .filter(x => x.isSelect)
      //   .map(e => e.deliveryPoint.code);
      // let allSelectOrders = orders.filter(
      //   e => selectOrderStoreCodes.indexOf(e.deliveryPoint.code) != -1
      // );
      // // const selectPoints = orders.filter(x => x.isSelect);
      // if (allSelectOrders.length === 0) {
      //   message.error('请选择需要排车的门店！');
      //   return;
      // }
      // this.props.dispatchingByMap(allSelectOrders);
      this.saveSchedule();
    }
  };

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyDown);
  }

  basicScheduleList = [];

  // 显示modal
  show = orders => {
    this.setState({ visible: true });
    queryDict('warehouse').then(res => {
      this.setState({
        startPoint: res.data.find(x => x.itemValue == loginOrg().uuid)?.description,
      });
    });
    if (orders) {
      for (const order of orders.filter(x => !x.isSelect)) {
        const num = orders.filter(e => {
          return e.isSelect;
        }).length;
        order.isSelect = true;
        order.sort = num + 1;
      }
      this.isSelectOrders = orders;
    }
    setTimeout(() => {
      this.drawMenu();
    }, 1000);
  };

  // 隐藏modal
  hide = () => {
    this.setState({
      visible: false,
      isEdit: false,
      checkScheduleOrders: [],
      checkSchedules: [],
      bearweight: 0,
      volumet: 0,
    });
    this.clusterLayer = undefined;
    this.contextMenu = undefined;
    this.isSelectOrders = [];
    setTimeout(() => {
      window.removeEventListener('keydown', this.keyDown);
    }, 500);
    this.props.addEvent();
  };

  // 查询
  refresh = params => {
    this.setState({ loading: true });
    const isOrgQuery = [
      { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
    ];
    let { pageFilter } = this.state;
    const filter = { pageSize: 4000, superQuery: { matchType: 'and', queryParams: [] } };
    if (params) {
      pageFilter = params;
    }

    filter.superQuery.queryParams = [
      ...pageFilter,
      ...isOrgQuery,
      { field: 'STAT', type: 'VarChar', rule: 'in', val: 'Audited||PartScheduled||Scheduled' },
      { field: 'PENDINGTAG', type: 'VarChar', rule: 'eq', val: 'Normal' },
    ];
    // queryAuditedOrder
    queryAuditedOrderByParams(filter).then(response => {
      if (response.success) {
        const result = response.data?.records ? response.data.records : [];
        const data = result.filter(x => x.longitude && x.latitude);
        // 计算所有
        const allTotals = this.getAllTotals(data.filter(e => e.stat != 'Scheduled'));

        // 去重
        const obj = {};
        const orderMarkersAll = data.reduce((cur, next) => {
          obj[next.deliveryPoint.code]
            ? ''
            : (obj[next.deliveryPoint.code] = true && cur.push(next));
          return cur;
        }, []); // 设置cur默认类型为数组，并且初始值为空的数组
        // 未排车marker
        const orderMarkers = orderMarkersAll.filter(e => e.stat != 'Scheduled');
        // 已排车marker
        const ScheduledMarkers = orderMarkersAll.filter(e => e.stat == 'Scheduled');

        // console.log('orderMarkers', orderMarkers, 'ScheduledMarkers', ScheduledMarkers);

        // 获取选中订单相同区域门店
        const isSelectOrdersArea =
          this.isSelectOrders && this.isSelectOrders.length > 0
            ? uniqBy(
                this.isSelectOrders.map(e => {
                  return e.shipAreaName;
                })
              )
            : [];

        orderMarkers.map(e => {
          if (this.isSelectOrders && this.isSelectOrders.length > 0) {
            const x = this.isSelectOrders.find(
              item => item.deliveryPoint.code == e.deliveryPoint.code
            );
            if (isSelectOrdersArea.indexOf(e.shipAreaName) != -1) {
              e.isSelect = true;
              e.sort = x?.sort ? x.sort : undefined;
            }
          }
        });
        const filterData = data.filter(e => e.stat != 'Scheduled');
        this.basicOrders = filterData;
        this.setState(
          { orders: filterData, orderMarkers, allTotals, ScheduledMarkers, isEdit: false },
          () => {
            setTimeout(() => {
              // this.drawClusterLayer();
              this.drawMenu();
              // this.clusterSetData(data);
              this.autoViewPort(orderMarkers);

              window.addEventListener('keydown', this.keyDown);
            }, 500);
          }
        );
        // this.drawingManagerRef?.open();
        // this.drawingManagerRef?.setDrawingMode(BMAP_DRAWING_RECTANGLE);
      }
      // 查询排车单
      const queryParams = {
        page: 1,
        pageSize: 100,
        quickuuid: 'sj_itms_schedulepool',
        superQuery: {
          matchType: 'and',
          queryParams: [
            { field: 'STAT', type: 'VarChar', rule: 'eq', val: 'Saved' },
            { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
            { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
          ],
        },
      };
      queryData(queryParams).then(res => {
        this.setState({ scheduleList: res?.data?.records });
        this.basicScheduleList = res?.data?.records;
      });
      this.setState({ loading: false, pageFilter });
    });
  };

  // 自动聚焦
  autoViewPort = points => {
    const newPoints = points.map(point => {
      return new BMapGL.Point(point.longitude, point.latitude);
    });
    this.map?.setViewport(newPoints);
  };

  // 选门店
  onChangeSelect = (checked, order) => {
    const { orders } = this.state;
    // let order = orders.find(x => x.uuid == record.uuid);
    // console.log('order', order);
    const num = orders.filter(e => {
      return e.isSelect;
    }).length;
    if (!checked) {
      // 取消时-1
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

  // 重置
  onReset = () => {
    const { orders } = this.state;
    orders.map(order => {
      (order.isSelect = false), (order.sort = null);
    });
    this.setState(
      {
        orders,
        driverMileage: 0,
        storeInfo: '',
        isEdit: false,
        checkScheduleOrders: [],
        checkSchedules: [],
      },
      () => {
        // this.map?.clearOverlays();
        // this.clusterSetData(orders);
      }
    );
    this.storeFilter('');
    this.searchFormRef?.onSubmit();
    this.isSelectOrders = [];
  };

  // 标注点
  drawMarker = () => {
    const { orders, orderMarkers, ScheduledMarkers } = this.state;
    // console.log('orderMarkers', orderMarkers);
    const that = this;
    const otherStore = new BMapGL.Icon(ShopClickIcon, new BMapGL.Size(20, 20)); // 42
    const otherStore2 = new BMapGL.Icon(ShopClickIcon2, new BMapGL.Size(20, 20)); // 42

    const icon = new BMapGL.Icon(ShopIcon, new BMapGL.Size(20, 20));

    const vanIcon = new BMapGL.Icon(van, new BMapGL.Size(20, 20));
    let markers = [];
    orderMarkers.map((order, index) => {
      const point = new BMapGL.Point(order.longitude, order.latitude);
      markers.push(
        <Marker
          isTop={order.isSelect}
          position={point}
          icon={order.isSelect ? (order.sort ? otherStore2 : otherStore) : icon}
          // icon={[icon, otherStore][order.isSelect ? 1 : 0]}
          shadow
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
    if (this.state.showScheduled) {
      ScheduledMarkers.map(order => {
        const point = new BMapGL.Point(order.longitude, order.latitude);
        markers.push(
          <Marker
            isTop={order.isSelect}
            position={point}
            icon={vanIcon}
            // icon={[icon, otherStore][order.isSelect ? 1 : 0]}
            shadow
            onMouseover={() => this.setState({ windowInfo: { point, order } })}
            onMouseout={() => this.setState({ windowInfo: undefined })}
            // onClick={event => {
            //   that.onChangeSelect(!order.isSelect, order);
            // }}
          />
        );
      });
    }
    markers = [...markers, ...this.drawCheckSchedules()];
    return markers;
  };

  // 数字

  // 标注点聚合图层初始化
  drawClusterLayer = () => {
    if (this.clusterLayer) {
      return;
    }
    const { isPoly } = this.state; // 取消聚合
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
          const {order} = event.dataItem;
          that.onChangeSelect(!order.isSelect, order);
        }
      },
      onMousemove(event) {
        if (event.dataItem?.order) {
          const {order} = event.dataItem;
          const point = new BMapGL.Point(order.longitude, order.latitude);
          that.setState({ windowInfo: { point, order } });
        } else {
          that.setState({ windowInfo: undefined });
        }
      },
    });
    view.addLayer(this.clusterLayer);
  };

  // 标注点聚合图层数据加载
  clusterSetData = data => {
    // this.clusterLayer?.setData([]);
    // const markers =
    const markers = [];
    // 清除所有label
    const allOverlay = this.map?.getOverlays();
    if (allOverlay?.length) {
      for (let i = 0; i < allOverlay.length; i++) {
        this.map?.removeOverlay(allOverlay[i]);
      }
    }
    data.map(point => {
      if (point.sort) {
        const opts = {
          position: new BMapGL.Point(point.longitude, point.latitude), // 指定文本标注所在的地理位置
          offset: new BMapGL.Size(30, -30), // 设置文本偏移量
        };
        const label = new BMapGL.Label(point.sort, opts);
        this.map?.addOverlay(label);
      }
      markers.push({
        geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
        properties: {
          icon: [ShopIcon, ShopClickIcon][point.isSelect ? 1 : 0],
          width: 42, // 38
          height: 42, // 38
        },
        order: point,
      });
    });
    this.clusterLayer?.setData(markers);
  };

  // 路线规划
  searchRoute = async selectPoints => {
    // this.clusterSetData([]);
    const {map} = this;
    const { startPoint } = this.state;
    const pointArr = selectPoints.map(order => {
      return (`${order.latitude  },${  order.longitude}`).trim();
    });
    const waypoints = pointArr.filter((_, index) => index < pointArr.length - 1);
    const response = await queryDriverRoutes(
      startPoint,
      pointArr[pointArr.length - 1],
      waypoints.join('|')
    );
    if (response.success) {
      const routePaths = response.result.routes[0].steps.map(x => x.path);
      const pts = new Array();
      routePaths.forEach(path => {
        const points = path.split(';');
        points.forEach(point => {
          pts.push(new BMapGL.Point(point.split(',')[0], point.split(',')[1]));
        });
      });
      const polyline = new BMapGL.Polyline(pts, {
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

  // 路线规划
  searchRoute2 = async selectPoints => {
    // this.clusterSetData([]);
    const {map} = this;
    const { startPoint } = this.state;
    const pointArr = selectPoints.map(order => {
      return (`${order.latitude  },${  order.longitude}`).trim();
    });
    const waypoints = pointArr.filter((_, index) => index < pointArr.length - 1);
    const params = {
      origin: startPoint,
      destination: pointArr[pointArr.length - 1],
      waypoints: waypoints.join('|'),
      height: '2',
      width: '2',
      weight: '5',
      length: '4',
      is_trailer: '0',
      plate_color: '0',
    };
    const response = await queryDriverRoutes2(params);
    if (response.success) {
      const routePaths = response.result.routes[0].steps.map(x => x.path);
      const pts = new Array();
      routePaths.forEach(path => {
        const points = path.split(';');
        points.forEach(point => {
          pts.push(new BMapGL.Point(point.split(',')[0], point.split(',')[1]));
        });
      });
      const polyline = new BMapGL.Polyline(pts, {
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

  // 路线规划标注
  drawRouteMaker = (lng, lat, width, hieght, x, y) => {
    const iconUrl = '//webmap1.bdimg.com/wolfman/static/common/images/markers_new2x_2960fb4.png';
    return new BMapGL.Marker(new BMapGL.Point(lng, lat), {
      icon: new BMapGL.Icon(iconUrl, new BMapGL.Size(width / 2, hieght / 2), {
        imageOffset: new BMapGL.Size(x / 2, y / 2),
        imageSize: new BMapGL.Size(600 / 2, 600 / 2),
      }),
    });
  };

  saveSchedule = () => {
    const { orders, orderMarkers, isEdit, schdule } = this.state;
    const selectOrderStoreCodes = orderMarkers.filter(x => x.isSelect).map(e => e.deliveryPoint.code);
    let allSelectOrders = orders.filter(
      e => selectOrderStoreCodes.indexOf(e.deliveryPoint.code) != -1
    );
    // console.log('22', selectOrderStoreCodes, allSelectOrders);
    // const selectPoints = orders.filter(x => x.isSelect);
    if (allSelectOrders.length === 0) {
      message.error('请选择需要排车的门店！');
      return;
    }
    if (schdule) {
      schdule.uuid = schdule.UUID;
    }
    allSelectOrders = uniqBy(allSelectOrders, 'uuid');
    this.props.dispatchingByMap(isEdit, isEdit ? schdule : allSelectOrders, allSelectOrders);
  };

  // 右键菜单
  drawMenu = () => {
    const { orders } = this.state;
    if (orders.length <= 0 || this.contextMenu) return;
    const menuItems = [
      {
        text: '排车(ALT+Q)',
        callback: () => {
          this.saveSchedule();
        },
      },
      {
        text: '取消选中',
        callback: () => {
          const { orders } = this.state;
          orders.map(e => {
            e.isSelect = false;
            e.sort = undefined;
          });
          this.setState({ orders });
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
        text: '地图测距',
        callback: () => {
          this.openTool();
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
          const url = `http://api.map.baidu.com/direction?origin=latlng:${selectPoints[0].latitude},${
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
      {
        text: '显示已排',
        callback: () => {
          this.setState({ showScheduled: !this.state.showScheduled });
        },
      },
    ];

    const menu = new BMapGL.ContextMenu();
    menuItems.forEach((item, index) => {
      menu.addItem(
        new BMapGL.MenuItem(item.text, item.callback, { width: 100, id: `menu${  index}` })
      );
    });
    this.contextMenu = menu;
    this.map?.addContextMenu(menu);
  };

  // 画框选取送货点
  drawSelete = event => {
    const { orders, orderMarkers } = this.state;
    const overlays = [];
    overlays.push(event.overlay);
    const pStart = event.overlay.getPath()[3]; // 矩形左上角坐标
    const pEnd = event.overlay.getPath()[1]; // 矩形右上角坐标
    const pt1 = new BMapGL.Point(pStart.lng, pStart.lat); // 3象限
    const pt2 = new BMapGL.Point(pEnd.lng, pEnd.lat); // 1象限
    const bds = new BMapGL.Bounds(pt1, pt2); // 范围

    for (const order of orderMarkers.filter(x => !x.isSelect)) {
      const pt = new BMapGL.Point(order.longitude, order.latitude);
      const num = orders.filter(e => {
        return e.isSelect;
      }).length;
      order.isSelect = this.isPointInRect(pt, bds);
      order.sort = num + 1;
    }
    this.map.removeOverlay(event.overlay);
    this.setState({ orders }, () => {
      // this.clusterSetData(orders);
    });
    // this.props.dispatchingByMap(orders.filter(x => x.isSelect));
  };

  // 判断一个点是否在某个矩形中
  isPointInRect = (point, bounds) => {
    const sw = bounds.getSouthWest(); // 西南脚点
    const ne = bounds.getNorthEast(); // 东北脚点
    return point.lng >= sw.lng && point.lng <= ne.lng && point.lat >= sw.lat && point.lat <= ne.lat;
  };

  storeFilter = (key, e) => {
    const serachStores = this.basicOrders.filter(
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

  // 计算小数
  accAdd = (arg1, arg2) => {
    if (isNaN(arg1)) {
      arg1 = 0;
    }
    if (isNaN(arg2)) {
      arg2 = 0;
    }
    arg1 = Number(arg1);
    arg2 = Number(arg2);
    let r1; let r2; let m; let c;
    try {
      r1 = arg1.toString().split('.')[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split('.')[1].length;
    } catch (e) {
      r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
      const cm = Math.pow(10, c);
      if (r1 > r2) {
        arg1 = Number(arg1.toString().replace('.', ''));
        arg2 = Number(arg2.toString().replace('.', '')) * cm;
      } else {
        arg1 = Number(arg1.toString().replace('.', '')) * cm;
        arg2 = Number(arg2.toString().replace('.', ''));
      }
    } else {
      arg1 = Number(arg1.toString().replace('.', ''));
      arg2 = Number(arg2.toString().replace('.', ''));
    }
    return (arg1 + arg2) / m;
  };

  getAllTotals = orders => {
    const totals = {
      cartonCount: 0,     // 整件数
      scatteredCount: 0,  // 散件数
      containerCount: 0,  // 周转箱
      coldContainerCount: 0,      // 冷藏周转筐+++
      freezeContainerCount: 0,    // 冷冻周转筐+++
      insulatedContainerCount: 0, // 保温箱+++
      insulatedBagCount: 0,       // 保温袋+++
      freshContainerCount: 0,     // 鲜食筐+++
      volume: 0, // 体积
      weight: 0, // 重量,
      totalCount: 0, // 总件数
      stores: 0, // 总门店数
    };
    const totalStores = [];
    orders.map(e => {
      totals.cartonCount += e.cartonCount;          // 整件数
      totals.scatteredCount += e.scatteredCount;    // 散件数
      totals.containerCount += e.containerCount;    // 周转箱
      totals.coldContainerCount += e.coldContainerCount;            // 冷藏周转筐+++
      totals.freezeContainerCount += e.freezeContainerCount;        // 冷冻周转筐+++
      totals.insulatedContainerCount += e.insulatedContainerCount;  // 保温箱+++
      totals.insulatedBagCount += e.insulatedBagCount;              // 保温袋+++
      totals.freshContainerCount += e.freshContainerCount;          // 鲜食筐+++
      totals.volume = this.accAdd(totals.volume, e.volume);
      totals.weight = this.accAdd(totals.weight, e.weight);
      if (totalStores.indexOf(e.deliveryPoint.code) === -1) {
        totalStores.push(e.deliveryPoint.code);
      }
    });
    totals.stores = totalStores.length;
    // totals.totalCount = totals.cartonCount + totals.scatteredCount + totals.containerCount * 2;
    // 总件数 = 整件+ 散件+（周转筐 + 冷藏）*2 + 冷冻*3 + 保温袋 + 鲜食筐
    totals.totalCount =
      totals.cartonCount +
      totals.scatteredCount +
      (totals.containerCount + totals.coldContainerCount) * 2 +
      totals.freezeContainerCount * 3 +
      totals.insulatedBagCount +
      totals.freshContainerCount;

    return totals;
  };

  getTotals = selectOrder => {
    const selectOrderStoreCodes = selectOrder.map(e => e.deliveryPoint.code);
    const { orders, bearweight, volumet } = this.state;
    const allSelectOrders = orders.filter(
      e => selectOrderStoreCodes.indexOf(e.deliveryPoint?.code) != -1
    );
    let totals = {
      cartonCount: 0,     // 整件数
      scatteredCount: 0,  // 散件数
      containerCount: 0,  // 周转箱
      coldContainerCount: 0,      // 冷藏周转筐+++
      freezeContainerCount: 0,    // 冷冻周转筐+++
      insulatedContainerCount: 0, // 保温箱+++
      insulatedBagCount: 0,       // 保温袋+++
      freshContainerCount: 0,     // 鲜食筐+++
      volume: 0, // 体积
      weight: 0, // 重量,
      totalCount: 0, // 总件数
      stores: selectOrderStoreCodes.length,
    };
    allSelectOrders.map(e => {
      totals.cartonCount += e.cartonCount;
      totals.scatteredCount += e.scatteredCount;
      totals.containerCount += e.containerCount;
      totals.coldContainerCount += e.coldContainerCount;            // 冷藏周转筐+++
      totals.freezeContainerCount += e.freezeContainerCount;        // 冷冻周转筐+++
      totals.insulatedContainerCount += e.insulatedContainerCount;  // 保温箱+++
      totals.insulatedBagCount += e.insulatedBagCount;              // 保温袋+++
      totals.volume = this.accAdd(totals.volume, e.volume);
      totals.weight = this.accAdd(totals.weight, e.weight);
    });
    // totals.totalCount = totals.cartonCount + totals.scatteredCount + totals.containerCount * 2;
    // 总件数 = 整件+ 散件+（周转筐 + 冷藏）*2 + 冷冻*3 + 保温袋 + 鲜食筐
    totals.totalCount =
      totals.cartonCount +
      totals.scatteredCount +
      (totals.containerCount + totals.coldContainerCount) * 2 +
      totals.freezeContainerCount * 3 +
      totals.insulatedBagCount +
      totals.freshContainerCount;

    totals = { ...totals, bearweight, volumet };
    return totals;
  };

  // 一家门店多份运输订单数量合并
  getOrderTotal = storeCode => {
    const totals = {
      cartonCount: 0, // 整件数
      scatteredCount: 0, // 散件数
      containerCount: 0, // 周转箱
      coldContainerCount: 0,      // 冷藏周转筐+++
      freezeContainerCount: 0,    // 冷冻周转筐+++
      insulatedContainerCount: 0, // 保温箱+++
      insulatedBagCount: 0,       // 保温袋+++
      freshContainerCount: 0,     // 鲜食筐+++
      volume: 0, // 体积
      weight: 0, // 重量,
    };
    const { orders, checkScheduleOrders } = this.state;
    const isOrder = [...orders, ...checkScheduleOrders].filter(
      e => e.deliveryPoint.code == storeCode
    );
    isOrder.map(e => {
      totals.cartonCount += e.cartonCount;
      totals.scatteredCount += e.scatteredCount;
      totals.containerCount += e.containerCount;
      totals.coldContainerCount += e.coldContainerCount;            // 冷藏周转筐+++
      totals.freezeContainerCount += e.freezeContainerCount;        // 冷冻周转筐+++
      totals.insulatedContainerCount += e.insulatedContainerCount;  // 保温箱+++
      totals.insulatedBagCount += e.insulatedBagCount;              // 保温袋+++
      totals.volume = this.accAdd(totals.volume, e.volume);
      totals.weight = this.accAdd(totals.weight, e.weight);
    });
    return totals;
  };

  scheduleFilter = value => {
    let serachSchedule = [...this.basicScheduleList];
    if (value) {
      serachSchedule = serachSchedule.filter(e => {
        return e.BILLNUMBER.search(value) != -1;
      });
    }
    this.setState({ scheduleList: serachSchedule });
  };

  clickSchdule = async schdule => {
    this.setState({ loading: true });
    const { orderMarkers, orders } = this.state;
    const response = await getDetailByBillUuids([schdule.UUID]);
    if (response.success) {
      let details = response.data;
      details = details?.filter(x => x.longitude && x.latitude);
      details?.map((e, index) => {
        // console.log('orderMarkers', orderMarkers, e);
        const deliveryP = orderMarkers?.find(o => o.deliveryPoint?.code == e.deliveryPoint?.code);
        // console.log('deliveryP', deliveryP);
        if (deliveryP) {
          deliveryP.isSelect = true;
          deliveryP.sort = index + 1;
        } else {
          e.isSelect = true;
          e.sort = index + 1;
          orderMarkers.push(e);
        }
        orders.push(e);
      });
      //   const selectOrder = orderMarkers.filter(x => x.isSelect).sort(x => x.sort);
      //  let totals = await this.getTotals(selectOrder);
      const scheule = await getSchedule(schdule.UUID);
      if (scheule.success) {
        const param = {
          tableName: 'SJ_ITMS_VEHICLE',
          condition: {
            params: [{ field: 'uuid', rule: 'eq', val: [scheule.data.vehicle.uuid] }],
          },
        };
        const vehicle = await dynamicQuery(param);
        if (vehicle.success) {
          this.setState({
            volumet:
              vehicle.result.records[0].LENGTH *
              vehicle.result.records[0].HEIGHT *
              vehicle.result.records[0].WIDTH,
            bearweight: vehicle.result.records[0].BEARWEIGHT,
          });
        }
      }

      this.setState(
        {
          orderMarkers,
          orders,
          isEdit: true,
          schdule,
          checkScheduleOrders: [],
          checkSchedules: [],
        },
        () => {
          setTimeout(() => {
            this.drawMenu();
          }, 500);
        }
      );
    }
    this.setState({ loading: false });
  };

  checkSchedule = async (e, schdule) => {
    const { checkSchedules } = this.state;
    const {checked} = e.target;
    let checkList = [...checkSchedules];
    let data = [];
    if (checked) {
      checkList.push(schdule);
    } else {
      checkList = checkList.filter(e => e != schdule);
    }
    if (checkList.length > 0) {
      const response = await getDetailByBillUuids(checkList);
      if (response.success) {
        data = response.data;
        checkList.map((e, index) => {
          data.map(order => {
            if (order.billUuid == e) {
              order.scheduleNum = index + 1;
            }
          });
        });
      }
    }
    this.setState({ checkSchedules: checkList, checkScheduleOrders: data });
  };

  drawCheckSchedules = () => {
    const { checkScheduleOrders } = this.state;
    const markers = [];
    checkScheduleOrders.map(order => {
      const point = new BMapGL.Point(order.longitude, order.latitude);
      markers.push(
        <Marker
          isTop
          position={point}
          icon={this.drawIcon(order.scheduleNum)}
          // icon={[icon, otherStore][order.isSelect ? 1 : 0]}
          shadow
          onMouseover={() => this.setState({ windowInfo: { point, order } })}
          onMouseout={() => this.setState({ windowInfo: undefined })}
          // onClick={event => {
          //   that.onChangeSelect(!order.isSelect, order);
          // }}
        />
      );
    });
    return markers;
  };

  // 标注icon
  drawIcon = num => {
    const index = num % 20;
    const multiple = 5;
    const icon = new BMapGL.Icon(ShopsIcons, new BMapGL.Size(160 / multiple, 160 / multiple), {
      imageOffset: new BMapGL.Size(
        (160 / multiple) * ((index % 5) - 1),
        (160 / multiple) * (Math.ceil(index / 5) - 1)
      ),
      imageSize: new BMapGL.Size(800 / multiple, 1000 / multiple),
    });
    return icon;
  };

  // 开启测距
  openTool() {
    if (this.distance) {
      this.distance.open();
    }
  }

  render() {
    const {
      visible,
      loading,
      windowInfo,
      orders,
      allTotals,
      orderMarkers,
      isEdit,
      schdule,
      closeLeft,
      checkScheduleOrders,
      checkSchedules,
      multiVehicle, // 是否多载具+++
    } = this.state;
    const selectOrder = orderMarkers.filter(x => x.isSelect).sort(x => x.sort);
    const stores = uniqBy(selectOrder.map(x => x.deliveryPoint), x => x.uuid);
    const totals = this.getTotals(selectOrder);

    let windowsInfoTotals = {};
    if (windowInfo) {
      windowsInfoTotals = this.getOrderTotal(windowInfo.order.deliveryPoint.code);
    }
    return (
      <Modal
        // zIndex={999}
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        width="100vw"
        className={style.dispatchingMap}
        bodyStyle={{ margin: -24, height: '99vh' }}
        visible={visible}
        title={
          <div>
            <Row type="flex" justify="space-between">
              <Col span={21}>
                <SearchForm refresh={this.refresh} onRef={node => (this.searchFormRef = node)} />
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
                {bFlexDiv('总件数',totals.totalCount)}
                {bFlexDiv('整件数',totals.cartonCount)}
                {bFlexDiv('散件数',totals.scatteredCount)}
                {bFlexDiv('周转箱',totals.containerCount)}
                {bFlexDiv('体积',totals.volume)}
                {bFlexDiv('重量',(totals.weight / 1000).toFixed(3))}
                {bFlexDiv('车辆承重(T)',(totals?.bearweight / 1000).toFixed(3))}
                {bFlexDiv('车辆体积(m3)',(totals?.volumet / 1000000).toFixed(3))}
                {bFlexDiv('门店',totals.stores)}
              </div>
              {multiVehicle &&  // 多载具+++
                <div style={{ display: 'flex', marginTop: 5 }}>
                  {bFlexDiv('冷藏周转筐',totals.coldContainerCount)}
                  {bFlexDiv('冷冻周转筐',totals.freezeContainerCount)}
                  {bFlexDiv('保温袋',totals.insulatedBagCount)}
                  {bFlexDiv('鲜食筐',totals.freshContainerCount)}
                  {/* 为了美观而占位 */<div style={{ flex: 5 }} />}
                </div>
              }
            </Row>
          </div>
        }
        closable={false}
        destroyOnClose
      >
        <Spin
          indicator={LoadingIcon('default')}
          spinning={loading}
          tip="加载中..."
          wrapperClassName={style.loading}
        >
          {/* 是否多载具高度不同+++ */}
          <Row type="flex" style={{ height: window.innerHeight - (multiVehicle ? 185 : 145) }}>
            <Col
              span={closeLeft ? 0 : 6}
              style={{ height: '100%', background: '#fff', overflow: 'auto' }}
            >
              {isEdit || selectOrder.length > 0 ? (
                <div style={{ position: 'relative', height: '100%', marginTop: '10px' }}>
                  <Button
                    style={{ float: 'left' }}
                    onClick={() => {
                      this.setState({ isEdit: false, bearweight: 0, volumet: 0 });
                      this.isSelectOrders = [];
                      this.searchFormRef?.onSubmit();
                    }}
                  >
                    返回
                  </Button>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginBottom: '10px',
                      marginRight: '20px',
                    }}
                  >
                    {isEdit ? `编辑排车单:${schdule.BILLNUMBER}` : '新建排车单'}
                    (ALT+Q)
                  </div>

                  {selectOrder.map(order => {
                    const totals = this.getOrderTotal(order.deliveryPoint.code);
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
                          {`[${order.deliveryPoint.code}]${order.deliveryPoint.name}`}
                        </div>
                        <div style={{ display: 'flex' }}>
                          {bFlexDiv('线路', order.archLine?.code, false)}
                          {bFlexDiv('备注', order?.lineNote, false)}
                        </div>
                        {/* 左边显示数据 */}
                        <Divider style={{ margin: 0, marginTop: 5 }} />
                        <Row type="flex" justify="space-around" style={{ textAlign: 'center' }}>
                          {bColDiv2('整件数', totals.cartonCount, 4)}
                          {bColDiv2('散件数', totals.scatteredCount, 4)}
                          {bColDiv2('周转箱', totals.containerCount, 4)}
                          {bColDiv2('体积', totals.volume, 4)}
                          {bColDiv2('重量', (totals.weight / 1000).toFixed(3), 4)}
                          {multiVehicle &&  // 多载具+++
                            <>
                              {bColDiv2('冷藏周转筐', totals.coldContainerCount, 5)}
                              {bColDiv2('冷冻周转筐', totals.freezeContainerCount, 5)}
                              {bColDiv2('保温袋', totals.insulatedBagCount, 5)}
                              {bColDiv2('鲜食筐', totals.freshContainerCount, 5)}
                            </>
                          }
                        </Row>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <List
                  header={
                    <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                      排车单查询：
                      <Input
                        style={{ width: '150px', marginLeft: '10px' }}
                        onChange={e => this.scheduleFilter(e.target.value)}
                      />
                    </div>
                  }
                  size="large"
                  itemLayout="horizontal"
                  dataSource={this.state.scheduleList}
                  renderItem={item => (
                    <List.Item
                      style={
                        {
                          // backgroundColor: this.colors[
                          //   checkSchedules.findIndex(e => e == item.UUID) % 20
                          // ],
                        }
                      }
                      extra={
                        <div>
                          <Checkbox
                            style={{ marginRight: '10px' }}
                            onChange={e => this.checkSchedule(e, item.UUID)}
                            checked={this.state.checkSchedules.indexOf(item.UUID) != -1}
                          />
                          <div
                            style={{
                              backgroundColor: this.colors[
                                checkSchedules.findIndex(e => e == item.UUID) % 20
                              ],
                              width: '20px',
                              height: '20px',
                              float: 'left',
                              marginRight: '10px',
                              borderRadius: '50px',
                            }}
                          />
                        </div>
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar style={{ width: '50px', height: '50px' }} src={truck} />}
                        title={
                          <a
                            style={{ fontSize: '15px' }}
                            onClick={() => {
                              this.clickSchdule(item);
                            }}
                          >
                            {item.BILLNUMBER}
                          </a>
                        }
                        description={
                          <div style={{ fontWeight: 'bold' }}>
                            车辆：
                            {item.VEHICLEPLATENUMBER ? item.VEHICLEPLATENUMBER : '<空>'}
                            &nbsp;&nbsp;司机：[
                            {item.CARRIERCODE ? item.CARRIERCODE : '<空>'}]
                            {item.CARRIERNAME ? item.CARRIERNAME : ''}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Col>
            <Col span={closeLeft ? 24 : 18}>
              <a
                onClick={() => {
                  this.setState({ closeLeft: !this.state.closeLeft });
                }}
              >
                <div style={{ float: 'left', height: '100%' }}>
                  <Icon
                    type={closeLeft ? 'caret-right' : 'caret-left'}
                    style={{ marginTop: (window.innerHeight - 145) / 2 }}
                  />
                </div>
              </a>
              {orderMarkers.length > 0 || checkScheduleOrders.length > 0 ? (
                <Map
                  center={{ lng: 113.809388, lat: 23.067107 }}
                  zoom={10}
                  minZoom={6}
                  enableScrollWheelZoom
                  enableRotate={false}
                  enableTilt={false}
                  enableAutoResize
                  ref={ref => (this.map = ref?.map)}
                  style={{ height: '100%' }}
                >
                  {this.drawMarker()}
                  {/* {this.drawCheckSchedules()} */}
                  {/* 地图测距工具 */}
                  <DistanceTool
                    ref={ref => (this.distance = ref?.distancetool)}
                    defaultOpen={false}
                  />
                  {/* 鼠标绘制工具 */}
                  <DrawingManager
                    // isOpen={true}
                    enableLimit
                    enableCalculate
                    // enableDrawingTool={false}
                    onOverlaycomplete={event => this.drawSelete(event)}
                    limitOptions={{ area: 9999999999999, distance: 9999999999999 }}
                    drawingToolOptions={{
                      drawingModes: ['rectangle'],
                    }}
                    // skipEditing={true}
                    drawingMode="rectangle"
                    rectangleOptions={{
                      strokeColor: '#d9534f', // 边线颜色。
                      fillColor: '#f4cdcc', // 填充颜色。当参数为空时，圆形将没有填充效果。
                      strokeWeight: 2, // 边线的宽度，以像素为单位。         ");
                      strokeOpacity: 0.6, // 边线透明度，取值范围0 - 1。
                      fillOpacity: 0.3, // 填充的透明度，取值范围0 - 1。
                      strokeStyle: 'dashed', // 边线的样式，solid或dashed。
                    }}
                    // ref={ref => (this.drawingManagerRef = ref?.drawingmanager)}
                    ref={ref => (this.drawingManagerRef = ref)}
                  />

                  {windowInfo ? (   // 地图上在鼠标在美宜佳坐标时显示的窗口
                    <CustomOverlay position={windowInfo.point} offset={new BMapGL.Size(15, -15)}>
                      <div
                        style={{ /* width: 280, height: 150, */
                          minWidth: 300,
                          padding: 5,
                          background: '#FFF',
                          borderRadius: 5,
                          boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        <div
                          style={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' }}
                        >
                          {`[${windowInfo.order.deliveryPoint.code}]${windowInfo.order.deliveryPoint.name}`}
                        </div>
                        <div style={{ display: 'flex' }}>
                          {bFlexDiv('线路', windowInfo.order.archLine?.code, false)}
                          {bFlexDiv('备注', windowInfo.order?.lineNote, false)}
                        </div>
                        <div>配送区域：{windowInfo.order?.shipAreaName}</div>
                        <div>门店地址：{windowInfo.order?.deliveryPoint?.address}</div>
                        {/* 地图里显示数据 */}
                        <Divider style={{ margin: 0, marginTop: 5 }} />
                        <Row type="flex" justify="space-around" style={{ textAlign: 'center' }}>
                          {bColDiv2('整件数', windowsInfoTotals.cartonCount, 4)}
                          {bColDiv2('散件数', windowsInfoTotals.scatteredCount, 4)}
                          {bColDiv2('周转箱', windowsInfoTotals.containerCount, 4)}
                          {bColDiv2('体积', windowsInfoTotals.volume, 4)}
                          {bColDiv2('重量', (windowsInfoTotals.weight / 1000).toFixed(3), 4)}
                          {multiVehicle &&  // 多载具+++
                            <>
                              {bColDiv2('冷藏周转筐', windowsInfoTotals.coldContainerCount, 5)}
                              {bColDiv2('冷冻周转筐', windowsInfoTotals.freezeContainerCount, 5)}
                              {bColDiv2('保温袋', windowsInfoTotals.insulatedBagCount, 5)}
                              {bColDiv2('鲜食筐', windowsInfoTotals.freshContainerCount, 5)}
                            </>
                          }
                        </Row>
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
          <Divider style={{ margin: 0, marginTop: 5 }} />
          <Row width="100%">
            <div style={{ display: 'flex', marginTop: 5, fontSize: '14px' }}>
              {bFlexDiv('总件数', allTotals.totalCount)}
              {bFlexDiv('总整件数', allTotals.cartonCount)}
              {bFlexDiv('总散件数', allTotals.scatteredCount)}
              {bFlexDiv('总周转箱', allTotals.containerCount)}
              {multiVehicle &&  // 多载具+++
                <>
                  {bFlexDiv('总冷藏周转筐', allTotals.coldContainerCount)}
                  {bFlexDiv('总冷冻周转筐', allTotals.freezeContainerCount)}
                  {bFlexDiv('总保温袋', allTotals.insulatedBagCount)}
                  {bFlexDiv('总鲜食筐', allTotals.freshContainerCount)}
                </>
              }
              {bFlexDiv('总体积', allTotals.volume)}
              {bFlexDiv('总重量', (allTotals.weight / 1000).toFixed(3))}
              {bFlexDiv('总门店数', allTotals.stores)}

            </div>
          </Row>
        </Spin>
      </Modal>
    );
  }
}
