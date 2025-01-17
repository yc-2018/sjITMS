import React, { Component } from 'react';
import {
  Divider,
  Button,
  Row,
  Col,
  Spin,
  message,
  Input,
  PageHeader,
  Select,
  Upload,
  Icon,
  Modal,
  Drawer,
  Card,
} from 'antd';
import { Map, Marker, CustomOverlay, DrawingManager, Label } from 'react-bmapgl';
import style from './DispatchingMap.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import SearchForm from './SearchForm';
import {
  queryAuditedOrderByStoreMap,
  queryDriverRoutes,
  queryStoreMaps,
} from '@/services/sjitms/OrderBill';
import { queryDict, updateEntity } from '@/services/quick/Quick';
import ShopIcon from '@/assets/common/myj.png';
import noStore from '@/assets/common/no_store.jpeg';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import moment from 'moment';
import * as XLSX from 'xlsx';

import otherIcon from '@/assets/common/otherMyj.png';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
// import Select from '@/components/ExcelImport/Select';
import copy from 'copy-to-clipboard';
import AddressReportForm from '../../AddressReport/AddressReportForm';
import QuickFormModal from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormModal';
import { shencopy } from '@/utils/SomeUtil';

const { Search } = Input;
const { Option } = Select;
const { Meta } = Card;

export default class StoresMap extends Component {
  basicOrders = [];
  markerArr = [];
  contextMenu = [];
  canDragBefore = true;
  state = {
    storeInfoVisible: false,
    visible: true,
    // loading: true,
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
    canDrag: false,
    file: '',
    reviewVisible: false,
    storeView: undefined,
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
              // this.drawMenu();
              // this.clusterSetData(data, otherData);
              // this.drawMarker(data);
              this.autoViewPort([...data, ...storeRes]);
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

  lastSelectedTowerId = -1; //全局变量
  lastSelectTowerTime = -1; //全局变量
  onDoubleClickMarker = order => {
    let that = this;
    //官方onDbclick不生效 手动写双击事件
    let a = 0;
    if (this.lastSelectedTowerId && this.lastSelectTowerTime) {
      let time = new Date().getTime();
      let t = time - this.lastSelectTowerTime;
      if (this.lastSelectedTowerId == order.uuid && t < 300) {
        //双击事件
        this.autoViewPort([order]);
      } else {
        a = 1; //如果是单机则改为1；如果是方法的话需要执行，导致时间会边长，只能赋值；不能走方法
      }
    }
    let b = 0;
    setTimeout(function() {
      if (b == 0) {
        if (a == 1) {
          //单击事件
          if (order?.address) {
            copy(order.address);
            that.setState({ storeInfoVisible: true, storeView: order });
            message.success('复制门店地址成功');
          } else {
            message.error('门店地址复制失败，检查该门店是否维护了地址！！');
          }
          b = 1;
        }
      }
    }, 300);
    this.lastSelectedTowerId = order.uuid;
    this.lastSelectTowerTime = new Date().getTime();
  };
  //标注点
  drawMarker = () => {
    const { orders, otherData, canDrag } = this.state;
    const otherStore = new BMapGL.Icon(otherIcon, new BMapGL.Size(20, 20)); //42
    const icon = new BMapGL.Icon(ShopIcon, new BMapGL.Size(20, 20));
    let markers = [];
    // let that = this;
    otherData.map(order => {
      var point = new BMapGL.Point(order.longitude, order.latitude);
      markers.push(
        <Marker
          isTop={true}
          position={point}
          // icon={order.isSelect ? ShopClickIcon : ShopIcon}
          icon={otherStore}
          shadow={true}
          onMouseover={() => this.setState({ windowInfo: { point, order } })}
          onMouseout={() => this.setState({ windowInfo: undefined })}
          onClick={() => this.onDoubleClickMarker(order)}
          // onDbclick={() => this.autoViewPort([order])}
          enableDragging={canDrag}
          onDragend={e => this.changePoint(e, order)}
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
            this.onDoubleClickMarker(order);
          }}
          // onDbclick={() => this.autoViewPort([order])}
          enableDragging={canDrag}
          onDragend={e => this.changePoint(e, order)}
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
    //防止重复渲染
    if (canDrag != this.canDragBefore) {
      setTimeout(() => {
        this.drawMenu();
        this.canDragBefore = this.state.canDrag;
      }, 500);
    }

    return markers;
  };
  //拖拽改变门店经纬度
  changePoint = async (e, order) => {
    let sets = {
      LATITUDE: e.latLng.lat,
      LONGITUDE: e.latLng.lng,
    };
    let param = {
      tableName: 'sj_itms_ship_address',
      sets,
      condition: {
        params: [
          {
            field: 'UUID',
            rule: 'eq',
            val: [order.uuid],
          },
        ],
      },
      updateAll: false,
    };
    let result = await updateEntity(param);
    if (result.success) {
      message.success(`门店 [${order.name}] 修改经纬度成功`);
      order.longitude = e.latLng.lng;
      order.latitude = e.latLng.lat;
    } else {
      message.error(`门店 [${order.name}] 修改经纬度失败,请刷新页面重试`);
      e.latLng.lng = order.longitude;
      e.latLng.lat = order.latitude;
    }
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
    if (response.success) {
      const routePaths = response.result.routes[0].steps.map(x => x.path);
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
    let canDragMenu = this.state.canDrag
      ? {
          text: '关闭拖拽门店',
          callback: () => {
            this.canDragBefore = this.state.canDrag;
            this.setState({ canDrag: !this.state.canDrag });
          },
        }
      : {
          text: '开启拖拽门店',
          callback: () => {
            this.canDragBefore = this.state.canDrag;
            this.setState({ canDrag: !this.state.canDrag });
          },
        };
    const menuItems = [
      {
        text: '门店审核',
        callback: () => {
          // this.storeReview.show();
          this.setState({ reviewVisible: true });
        },
      },
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
    menuItems.push(canDragMenu);
    const menu = new BMapGL.ContextMenu();
    menuItems.forEach((item, index) => {
      menu.addItem(
        new BMapGL.MenuItem(item.text, item.callback, { width: 100, id: 'menu' + index })
      );
    });

    this.contextMenu.push(menu);
    this.map?.addContextMenu(menu);
    if (this.contextMenu.length > 1) {
      this.contextMenu.map((e, index) => {
        if (e != menu) {
          this.map?.removeContextMenu(e);
          this.contextMenu.splice(index, 1);
        }
      });
    }
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
            // point.address = `${point.address ? point.address : ''}${'\r\n'}[经度:${
            //   point.point.lng
            // }]${'\r\r'}[纬度:${point.point.lat}]`;
            point.address = point.address
              ? point.address +
                '<br/>经度:[' +
                point.point.lng +
                ']<br/>纬度:[' +
                point.point.lat +
                ']'
              : '' + ']<br/>经度:[' + point.point.lng + ']<br/>纬度:[' + point.point.lat + ']';
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
              otherData: res.data.records,
              orders: res.data.otherRecords
                ? res.data.otherRecords.filter(item => item.uuid != res.data.records[0].uuid)
                : [],
              pageFilter: [],
              isOrder: false,
              loading: false,
              storeParams: storeParamsp,
            },
            () => {
              setTimeout(() => {
                // this.drawMenu();
                this.autoViewPort([...res.data.records, ...this.state.orders]);
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
                // this.drawMenu();
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

  showStoreByReview = async e => {
    // console.log('e', e);
    this.setState({ loading: true });
    let params = {
      DELIVERYPOINTCODE: e.DELIVERYPOINTCODE,
    };
    let store = await this.getStoreMaps('20', params);
    let reviewStore = [];
    if (store && store.length > 0) {
      let review = shencopy(store[0]);
      store[0].code = '(旧)' + store[0].code;
      review.latitude = e.LATITUDE;
      review.longitude = e.LONGITUDE;
      review.code = '(新)' + review.code;
      reviewStore.push(review);
    }
    // console.log('res', store, reviewStore);
    this.setState(
      {
        orders: store,
        otherData: reviewStore,
        pageFilter: [],
        isOrder: false,
        loading: false,
        // storeParams: storeParamsp,
      },
      () => {
        setTimeout(() => {
          // this.drawMenu();
          this.autoViewPort([...store, ...reviewStore]);
        }, 500);
      }
    );
  };

  tansfomer = arraylist => {
    let attributeList = arraylist[0];
    let tempdata = [];
    let slicedList = arraylist.slice(1);
    slicedList.map(item => {
      let tempobject = {};
      item.forEach((item, index) => {
        tempobject[attributeList[index]] = item;
      });
      tempdata.push(tempobject);
    });
    return tempdata;
  };

  getStoreInfoCard = () => {
    const { storeView } = this.state;
    if (!storeView) return;
    let storeCode = storeView.isOrder ? storeView.deliveryPoint.code : storeView.code;
    let storeName = storeView.isOrder ? storeView.name : storeView.name;
    //TODO 等门店图片上传后再添加门店图片
    return (
      <div>
        <Card
          cover={<img alt="example" src={storeView.imgurl || noStore} style={{ height: '200px' }} />}
          title={`[${storeCode}]${storeName}`}
          style={{ width: 360 }}
        >
          <Meta
            style={{ fontSize: '14px' }}
            title="线路/区域"
            description={`${storeView.archlinecode}/${storeView.shipareaname}`}
          />
          <Meta
            title="地址"
            description={storeView.address}
            style={{ marginTop: '10px', fontSize: '14px' }}
          />
          <Meta
            title="备注"
            description={storeView.note ? storeView.note : '无'}
            style={{ marginTop: '10px', fontSize: '14px' }}
          />
        </Card>
      </div>
    );
  };

  render() {
    let that = this;
    const { visible, loading, windowInfo, orders, isOrder, otherData, storeView } = this.state;
    const uploadProps = {
      name: 'file',
      // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      headers: {
        authorization: 'authorization-text',
      },
      showUploadList: false,
      accept: '.xls,.xlsx',
      beforeUpload: (file, fileList) => {
        if (
          fileList.length < 0 ||
          (fileList[0].name.substring(fileList[0].name.lastIndexOf('.') + 1).toLowerCase() !=
            'xlsx' &&
            fileList[0].name.substring(fileList[0].name.lastIndexOf('.') + 1).toLowerCase() !=
              'xls')
        ) {
          message.error('请检查文件是否为excel文件！');
          return;
        }
        var rABS = true;
        const f = fileList[0];
        var reader = new FileReader();
        reader.onload = async function(e) {
          var data = e.target.result;
          if (!rABS) data = new Uint8Array(data);
          var workbook = XLSX.read(data, {
            type: rABS ? 'binary' : 'array',
          });
          // 假设我们的数据在第一个标签
          var first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
          // XLSX自带了一个工具把导入的数据转成json
          var jsonArr = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
          let column = jsonArr[0][0];
          let storeNames = that
            .tansfomer(jsonArr)
            .map(e => {
              return e[column];
            })
            .join(',');
          let param = {
            companyuuid: loginCompany().uuid,
            dispatchcenteruuid: loginOrg().uuid,
            cur: 1,
            pageSize: '9999',
            DELIVERYPOINTCODE: storeNames,
          };
          let res = await queryStoreMaps(param);
          if (res.success) {
            let recordsUuids = res.data?.records.map(e => {
              return e.uuid;
            });
            that.setState(
              {
                // orders: resAll.data.records,
                otherData: res.data ? res.data?.records : [],
                orders: res.data
                  ? res.data?.otherRecords.filter(
                      // item => item.uuid != res.data.records[0].uuid
                      item => recordsUuids.indexOf(item.uuid) == -1
                    )
                  : [],
                pageFilter: [],
                isOrder: false,
                loading: false,
                // storeParams: storeParamsp,
              },
              () => {
                setTimeout(() => {
                  // this.drawMenu();
                  that.autoViewPort(res.data ? res.data?.records : []);
                  if (res.data) {
                    message.success(
                      '门店导入查询成功，绿色为导入门店，红色为与导入门店同区域门店！'
                    );
                  } else {
                    message.error('门店导入查询失败，无门店数据或excel文件有错误');
                  }
                }, 500);
              }
            );
          }
        };
        if (rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
        return false;
      },
    };
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
              <Col span={22}>
                <SearchForm refresh={this.refresh} changePage={this.changePage} />
              </Col>
              <Col span={1}>
                <Upload {...uploadProps}>
                  <Button shape="round" icon="upload" type="danger" />
                  {/* <Icon type="upload" /> */}
                </Upload>
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
                  <Drawer
                    getContainer={false}
                    title={'门店资料'}
                    placement="right"
                    closable={true}
                    onClose={() => this.setState({ storeInfoVisible: false })}
                    visible={this.state.storeInfoVisible}
                    mask={false}
                    maskClosable={true}
                    // height={300}
                    width={400}
                    style={{ position: 'absolute' }}
                  >
                    {this.getStoreInfoCard()}
                  </Drawer>
                  <Drawer
                    getContainer={false}
                    title="门店审核"
                    placement="right"
                    closable={true}
                    onClose={() => this.setState({ reviewVisible: false })}
                    visible={this.state.reviewVisible}
                    mask={false}
                    maskClosable={false}
                    // height={300}
                    width={400}
                    style={{ position: 'absolute' }}
                  >
                    <AddressReportForm
                      location={{ pathname: window.location.pathname }}
                      quickuuid="v_itms_store_address_report_t"
                      showStoreByReview={this.showStoreByReview}
                    />
                  </Drawer>
                  {orders.length > 0 || otherData.length > 0 ? (
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
                          offset={new BMapGL.Size(10, -15)}
                        >
                          {/* {this.getStoreInfoCard(windowInfo, storeCode, storeName)} */}
                          <div
                            style={{
                              width: 280,
                              height: windowInfo.order.cartonCount ? 100 : 80,
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
                            <div>
                              门店地址：
                              {windowInfo.order.address}
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
