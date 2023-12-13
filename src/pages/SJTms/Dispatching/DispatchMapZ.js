/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-08-12 11:09:40
 * @Description: 地图
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\DispatchMap.js
 */
import React, { Component } from 'react';
import { Divider, message } from 'antd';
import { Map, Marker, Label, CustomOverlay, DrawingManager } from 'react-bmapgl';
// import B from 'BMapLib';
// import { Map, Marker, Label, CustomOverlay } from '@uiw/react-baidu-map';

import storeIcon from '@/assets/common/store.svg';
import storeIconC from '@/assets/common/storeClick.svg';
import start from '@/assets/common/start.svg';
import end from '@/assets/common/end.svg';
import pass from '@/assets/common/pass.svg';

import { groupBy, sumBy } from 'lodash';
export default class DispatchMapZ extends Component {
  state = {
    isShowName: true,
    windowInfo: undefined,
    selectOrder: [],
    isPla: false,
    orders: this.props.orders,
    selectOrderPla: [],
    shipOrder: [],
    markers: [],
    isRotate: true,
  };

  componentDidMount() {
    this.initMap();
  }

  componentWillUnmount() {
    //移除事件监听
    this.map.removeEventListener('zoomstart');
    this.map.removeEventListener('zoomend');
  }

  //初始化Map
  initMap = () => {
    const { orders } = this.props;
    let shipOrder = [...orders].filter(x => x.longitude);
    shipOrder = this.groupByOrder(shipOrder);

    //避免map未生成，延迟1s
    setTimeout(() => {
      let that = this;

      //获取缩放监听
      //缩放开始监听
      this.map.addEventListener('zoomstart', function(evt) {});
      //缩放结束监听
      this.map.addEventListener('zoomend', function(evt) {
        //TODO 后续根据缩放Level判断门店聚合
        console.log('evt', evt.target.zoomLevel); //缩放level
      });

      //增加右键菜单
      var txtMenuItem = [
        {
          text: '排车', // 定义菜单项的显示文本
          callback: function() {
            // 定义菜单项点击触发的回调函数
            that.toPla();
          },
        },
        {
          text: '路线规划', // 定义菜单项的显示文本
          callback: function() {
            // 定义菜单项点击触发的回调函数
            that.searchRoute();
          },
        },
      ];
      var menu = new BMapGL.ContextMenu();
      for (var i = 0; i < txtMenuItem.length; i++) {
        menu.addItem(
          new BMapGL.MenuItem( // 定义菜单项实例
            txtMenuItem[i].text, // 传入菜单项的显示文本
            txtMenuItem[i].callback, // 传入菜单项的回调函数
            {
              width: 100, // 指定菜单项的宽度
              id: 'menu' + i, // 指定菜单项dom的id
            }
          )
        );
      }

      this.map.addContextMenu(menu); // 给地图添加右键菜单

      //缩放聚合
      var view = new mapvgl.View({
        map: this.map,
      });

      let markerList = [];

      // 构造数据
      for (const s of shipOrder) {
        markerList.push({
          geometry: {
            type: 'Point',
            coordinates: [s.longitude, s.latitude],
          },
          properties: {
            icon: storeIcon, //storeIcon 先隐藏缩放的icon 如需显示，去除[]  TODO：考虑是使用该缩放聚合的点击事件还是缩放显示数字后隐藏原本的marker
            width: 40,
            height: 40,
          },
          order: s,
        });
      }

      var clusterLayer = new mapvgl.ClusterLayer({
        minSize: 30, // 聚合点显示的最小直径
        maxSize: 50, // 聚合点显示的最大直径
        clusterRadius: 150, // 聚合范围半径
        gradient: { 0: 'blue', 0.5: 'green', 1.0: 'red' }, // 聚合点颜色梯度
        maxZoom: 15, // 聚合的最大级别，当地图放大级别高于此值将不再聚合
        minZoom: 5, // 聚合的最小级别，当地图放大级别低于此值将不再聚合
        // 是否显示文字
        showText: true,
        // 开始聚合的最少点数，点数多于此值才会被聚合
        minPoints: 5,
        // 设置文字样式
        textOptions: {
          fontSize: 12,
          color: 'white',
          // 格式化数字显示
          format: function(count) {
            return count >= 10000
              ? Math.round(count / 1000) + 'k'
              : count >= 1000
                ? Math.round(count / 100) / 10 + 'k'
                : count;
          },
        },
        // 设置非聚合的点的icon
        // iconOptions: {
        //     width: 100 / 4,
        //     height: 153 / 4,
        //     icon: 'images/marker.png',
        // },
        enablePicked: true,
        onClick(e) {
          if (e.dataItem) {
            // 可通过dataItem下面的children属性拿到被聚合的所有点
            console.log(e.dataItem);
          }
        },
        onMousemove(e) {
          if (e.dataItem?.order) {
            let order = e.dataItem.order;
            console.log(order);
            var point = new BMapGL.Point(order.longitude, order.latitude);
            that.setState({ windowInfo: { point, order } });
          } else {
            that.setState({ windowInfo: undefined });
          }
        },
      });

      view.addLayer(clusterLayer);
      clusterLayer.setData(markerList);

      document.getElementsByClassName('BMapGLLib_rectangle')[0]?.addEventListener('click', e => {
        //设置不允许旋转
        // this.setState({ isRotate: !this.state.isRotate });
      });
    }, 1000);
    this.setState({ shipOrder: shipOrder });
  };

  //路线规划
  searchRoute = () => {
    const { selectOrder } = this.state;
    let timeTotal = 0; //总时间
    let disTotal = 0; //总路程
    let map = this.map;
    this.map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 11);

    //按选择的门店顺序进行路线规划
    // var driving = new BMapGL.DrivingRoute(map, { renderOptions: { map: map, autoViewport: true } });
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
      // map.addOverlay(new BMapGL.Marker(poinArray[i], { icon: passIcon }));
    }
    map.setViewport(poinArray); //调整到最佳视野
    driving.setSearchCompleteCallback(function() {
      var pts = driving
        .getResults()
        .getPlan(0)
        .getRoute(0)
        .getPath(); //通过驾车实例，获得一系列点的数组

      var polyline = new BMapGL.Polyline(pts, {
        strokeColor: '#19be6b',
        strokeWeight: 6,
        strokeOpacity: 1,
      });
      map.addOverlay(polyline);
      var plan = driving.getResults().getPlan(0);
      if (plan) {
        var dis = plan.getDistance(false); //获取总公里数
        var t = plan.getDuration(false); ///获取总耗时
        timeTotal += t;
        disTotal += dis;
      }
    });

    //延迟获取总路程时间
    setTimeout(() => {
      //时间单位为s 距离为m
      console.log('total', timeTotal, disTotal);
      alert('总时间为：' + timeTotal + '秒 总距离为：' + disTotal + '米');
    }, 1000);
  };

  // componentDidMount() {
  //   var map = new BMapGL.Map('dispatchMap');
  //   // 开启鼠标滚轮缩放
  //   map.enableScrollWheelZoom();
  //   map.centerAndZoom(new BMapGL.Point(113.8095, 23.067), 15);

  //   var lushu;
  //   // 实例化一个驾车导航用来生成路线
  //   var drv = new BMapGL.DrivingRoute('东莞', {
  //     onSearchComplete: function(res) {
  //       if (drv.getStatus() == BMapGL_STATUS_SUCCESS) {
  //         var plan = res.getPlan(0);
  //         var arrPois = [];
  //         for (var j = 0; j < plan.getNumRoutes(); j++) {
  //           var route = plan.getRoute(j);
  //           arrPois = arrPois.concat(route.getPath());
  //         }
  //         map.addOverlay(new BMapGL.Polyline(arrPois, { strokeColor: '#111' }));
  //         map.setViewport(arrPois);
  //         lushu = new BMapLib.LuShu(map, arrPois, {
  //           // defaultContent: '起飞啦', // "信息窗口文案"
  //           autoView: true, // 是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
  //           speed: 5000,
  //           icon: new BMapGL.Icon(car, new BMapGL.Size(48, 24), {
  //             anchor: new BMapGL.Size(24, 24),
  //           }),
  //           enableRotation: true, // 是否设置marker随着道路的走向进行旋转
  //         });
  //         lushu.start();
  //       }
  //     },
  //   });
  //   var start = new BMapGL.Point(113.8095, 23.067);
  //   var end = new BMapGL.Point(113.902, 23.0568);
  //   drv.search(start, end);
  // }

  //经纬度测算中心位置
  getCenter = arr => {
    let centerLonLat = {};
    if (arr.length) {
      const sortedLongitudeArray = arr.map(x => x.lng).sort();
      const sortedLatitudeArray = arr.map(x => x.lat).sort();
      const centerLongitude = (
        (parseFloat(sortedLongitudeArray[0]) +
          parseFloat(sortedLongitudeArray[sortedLongitudeArray.length - 1])) /
        2
      ).toFixed(14);
      const centerLatitude = (
        (parseFloat(sortedLatitudeArray[0]) +
          parseFloat(sortedLatitudeArray[sortedLatitudeArray.length - 1])) /
        2
      ).toFixed(14);
      centerLonLat = { lng: Number(centerLongitude), lat: Number(centerLatitude) };
    }
    return centerLonLat;
  };
  getMinPoint = (arr, centerPoint) => {
    const index = arr
      .map(point => Math.abs(centerPoint.lng - point.lng))
      .findIndex(i => i === Math.min(...arr.map(point => Math.abs(centerPoint.lng - point.lng))));
    return arr[index];
  };
  //门店汇总
  groupByOrder = data => {
    let output = groupBy(data, x => x.deliveryPoint.code);
    let deliveryPointGroupArr = Object.keys(output).map(pointCode => {
      const orders = output[pointCode];
      return {
        pointCode,
        uuid: orders[0].uuid,
        orderCount: orders.length,
        deliveryPoint: orders[0].deliveryPoint,
        archLine: orders[0].archLine,
        longitude: orders[0].longitude,
        latitude: orders[0].latitude,
        owner: orders[0].owner,
        address: orders[0].deliveryPoint.address,
        cartonCount: Math.round(sumBy(orders, 'cartonCount') * 1000) / 1000,
        realCartonCount: Math.round(sumBy(orders, 'realCartonCount') * 1000) / 1000,
        scatteredCount: Math.round(sumBy(orders, 'scatteredCount') * 1000) / 1000,
        realScatteredCount: Math.round(sumBy(orders, 'realScatteredCount') * 1000) / 1000,
        containerCount: Math.round(sumBy(orders, 'containerCount') * 1000) / 1000,
        realContainerCount: Math.round(sumBy(orders, 'realContainerCount') * 1000) / 1000,
        volume: Math.round(sumBy(orders, 'volume') * 1000) / 1000,
        weight: Math.round(sumBy(orders, 'weight') * 1000) / 1000,
      };
    });
    return deliveryPointGroupArr;
  };
  //选中门店
  handleSelectPoint = (order, point) => {
    let { selectOrder } = this.state;
    const index = selectOrder.findIndex(x => x.uuid == order.uuid);
    order.point = point;
    index > -1
      ? (selectOrder = selectOrder.filter(x => x.uuid != order.uuid))
      : selectOrder.push(order);

    this.setState({ selectOrder });
  };

  //排车
  toPla = () => {
    let { selectOrder } = this.state;
    const { orders } = this.props;

    let selectOrderPla = [];
    selectOrder.map(item => {
      let h = orders.filter(order => {
        return order.deliveryPoint.code == item.deliveryPoint.code;
      });
      selectOrderPla = [...h, ...selectOrderPla];
    });
    if (selectOrderPla.length <= 0) {
      message.warning('请选择门店！');
      // this.setState({ isPla: false });
      return;
    }
    this.props.dispatchingByMap(selectOrderPla);
  };

  //画框选取marker
  drawSelete = (e, info) => {
    const { shipOrder } = this.state;
    let overlays = [];
    overlays.push(e.overlay);
    let pStart = e.overlay.getPath()[3]; //矩形左上角坐标
    let pEnd = e.overlay.getPath()[1]; //矩形右上角坐标
    var pt1 = new BMapGL.Point(pStart.lng, pStart.lat); //3象限
    var pt2 = new BMapGL.Point(pEnd.lng, pEnd.lat); //1象限
    var bds = new BMapGL.Bounds(pt1, pt2); //范围

    let { selectOrder } = this.state;
    for (const s of shipOrder) {
      var pt = new BMapGL.Point(s.longitude, s.latitude);
      var result = this.isPointInRect(pt, bds); //判断一个点是否在某个矩形中
      if (result == true) {
        const index = selectOrder.findIndex(x => x.uuid == s.uuid);
        s.point = point;
        index > -1
          ? (selectOrder = selectOrder.filter(x => x.uuid != s.uuid))
          : selectOrder.push(s);
      }
    }
    this.map.removeOverlay(e.overlay);
    this.setState({ selectOrder });
  };
  //判断一个点是否在某个矩形中
  isPointInRect = (point, bounds) => {
    var sw = bounds.getSouthWest(); //西南脚点
    var ne = bounds.getNorthEast(); //东北脚点
    return point.lng >= sw.lng && point.lng <= ne.lng && point.lat >= sw.lat && point.lat <= ne.lat;
  };

  render() {
    const { windowInfo, selectOrder, isShowName, shipOrder } = this.state;
    // const { orders } = this.props;
    // let shipOrder = [...orders].filter(x => x.longitude);
    // shipOrder = this.groupByOrder(shipOrder);
    const icon = new BMapGL.Icon(storeIcon, new BMapGL.Size(30, 30));
    const iconC = new BMapGL.Icon(storeIconC, new BMapGL.Size(30, 30));
    const features = shipOrder.filter(x => x.longitude != 0 && x.longitude != 1).map(x => {
      return { lng: x.longitude, lat: x.latitude };
    });
    let centerLonLat = this.getCenter(features);
    centerLonLat = this.getMinPoint(features, centerLonLat);
    return shipOrder.length > 0 ? (
      <div>
        <Map
          zoom={12}
          minZoom={6}
          onZoomend={event => {
            this.setState({ isShowName: event.target.zoomLevel > 12 });
          }}
          center={centerLonLat}
          enableScrollWheelZoom
          enableAutoResize
          enableTilt={false}
          enableRotate={false}
          style={{ height: '85vh' }}
          ref={ref => {
            this.map = ref?.map;
          }}
        >
          <DrawingManager
            enableLimit
            enableCalculate
            onOverlaycomplete={(e, info) => this.drawSelete(e, info)}
            limitOptions={{ area: 9999999999999, distance: 9999999999999 }}
            drawingToolOptions={{
              drawingModes: ['rectangle'],
            }}
            rectangleOptions={{
              strokeColor: '#d9534f', //边线颜色。
              fillColor: '#F4CDCC', //填充颜色。当参数为空时，圆形将没有填充效果。
              strokeWeight: 2, //边线的宽度，以像素为单位。         ");
              strokeOpacity: 0.6, //边线透明度，取值范围0 - 1。
              fillOpacity: 0.3, //填充的透明度，取值范围0 - 1。
              strokeStyle: 'dashed', //边线的样式，solid或dashed。
            }}
          />
          {/* {shipOrder.map(order => {
            var point = new BMapGL.Point(order.longitude, order.latitude);
            return (
              <>
                <Marker
                  position={point}
                  icon={selectOrder.findIndex(x => x.uuid == order.uuid) == -1 ? icon : iconC}
                  shadow={true}
                  onClick={() => this.handleSelectPoint(order, point)}
                  onMouseover={() => this.setState({ windowInfo: { point, order } })}
                  onMouseout={() => this.setState({ windowInfo: undefined })}
                  // autoViewport={true}
                />
                {isShowName ? (
                  <Label
                    text={order.deliveryPoint.name}
                    position={point}
                    onClick={() => this.handleSelectPoint(order, point)}
                    onMouseover={() => this.setState({ windowInfo: { point, order } })}
                    onMouseout={() => this.setState({ windowInfo: undefined })}
                    style={{
                      width: '150px',
                      whiteSpace: 'unset',
                      border: 0,
                      background: 'none',
                      color: '#D90429',
                      opacity: 0.7,
                      fontWeight: 'bold',
                    }}
                    offset={new BMapGL.Size(15, -10)}
                  />
                ) : (
                  <></>
                )}
              </>
            );
          })} */}
          {selectOrder.map(order => {
            return (
              // <CustomOverlay position={order.point} offset={new BMapGL.Size(15, -15)}>
              //   <div style={{ width: 250, height: 80, padding: 5, background: '#FFF' }}>
              //     <div style={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              //       {`[${order.deliveryPoint.code}]` + order.deliveryPoint.name}
              //     </div>
              //     <Divider style={{ margin: 0, marginTop: 5 }} />
              //     <div style={{ display: 'flex', marginTop: 5 }}>
              //       <div style={{ flex: 1 }}>订单数</div>
              //       <div style={{ flex: 1 }}>体积</div>
              //       <div style={{ flex: 1 }}>重量</div>
              //       <div style={{ flex: 1 }}>总件数</div>
              //     </div>
              //     <div style={{ display: 'flex' }}>
              //       <div style={{ flex: 1 }}>{order.orderCount}</div>
              //       <div style={{ flex: 1 }}>{order.volume}</div>
              //       <div style={{ flex: 1 }}>{order.weight}</div>
              //       <div style={{ flex: 1 }}>{order.realCartonCount}</div>
              //     </div>
              //     {/* <div style={{ marginTop: 5 }}>
              //       地址：
              //       {order.address}
              //     </div> */}
              //   </div>
              // </CustomOverlay>
              null
            );
          })}
          {windowInfo ? (
            <CustomOverlay position={windowInfo.point} offset={new BMapGL.Size(15, -15)}>
              <div style={{ width: 250, height: 80, padding: 5, background: '#FFF' }}>
                <div style={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {`[${windowInfo.order.deliveryPoint.code}]` + windowInfo.order.deliveryPoint.name}
                </div>
                <Divider style={{ margin: 0, marginTop: 5 }} />
                <div style={{ display: 'flex', marginTop: 5 }}>
                  <div style={{ flex: 1 }}>订单数</div>
                  <div style={{ flex: 1 }}>体积</div>
                  <div style={{ flex: 1 }}>重量</div>
                  <div style={{ flex: 1 }}>总件数</div>
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1 }}>{windowInfo.order.orderCount}</div>
                  <div style={{ flex: 1 }}>{windowInfo.order.volume}</div>
                  <div style={{ flex: 1 }}>{windowInfo.order.weight}</div>
                  <div style={{ flex: 1 }}>{windowInfo.order.realCartonCount}</div>
                </div>
                {/* <div style={{ marginTop: 5 }}>
                地址：
                {windowInfo.order.address}
              </div> */}
              </div>
            </CustomOverlay>
          ) : (
            <></>
          )}
        </Map>
      </div>
    ) : (
      <Map
        center={{ lng: 113.809388, lat: 23.067107 }}
        zoom={18}
        enableScrollWheelZoom
        enableAutoResize
        style={{ height: '85vh' }}
        ref={ref => {
          this.map = ref?.map;
        }}
      />
    );
  }
}
