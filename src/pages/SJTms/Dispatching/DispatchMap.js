/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-08-02 15:02:35
 * @Description: 地图
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\DispatchMap.js
 */
import React, { Component } from 'react';
import { Divider } from 'antd';
import { Map, Marker, Label, CustomOverlay } from 'react-bmapgl';
import storeIcon from '@/assets/common/store.svg';
import { groupBy, sumBy } from 'lodash';

export default class DispatchMap extends Component {
  state = {
    isShowName: true,
    windowInfo: undefined,
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

  render() {
    const { windowInfo, isShowName } = this.state;
    const { orders } = this.props;
    let shipOrder = [...orders].filter(x => x.longitude);
    shipOrder = this.groupByOrder(shipOrder);
    const icon = new BMapGL.Icon(storeIcon, new BMapGL.Size(30, 30));
    const features = shipOrder.filter(x => x.longitude != 0 && x.longitude != 1).map(x => {
      return { lng: x.longitude, lat: x.latitude };
    });
    let centerLonLat = this.getCenter(features);
    centerLonLat = this.getMinPoint(features, centerLonLat);
    return shipOrder.length > 0 ? (
      <Map
        zoom={12}
        minZoom={6}
        onZoomend={event => {
          this.setState({ isShowName: event.target.zoomLevel > 12 });
        }}
        center={centerLonLat}
        enableScrollWheelZoom
        enableAutoResize
        style={{ height: '85vh' }}
      >
        {shipOrder.map(order => {
          var point = new BMapGL.Point(order.longitude, order.latitude);
          return (
            <>
              <Marker
                position={point}
                icon={icon}
                shadow={true}
                onMouseover={() => this.setState({ windowInfo: { point, order } })}
                onMouseout={() => this.setState({ windowInfo: undefined })}
              />
              {isShowName ? (
                <Label
                  text={order.deliveryPoint.name}
                  position={point}
                  onMouseover={() => this.setState({ windowInfo: { point, order } })}
                  onMouseout={() => this.setState({ windowInfo: undefined })}
                  style={{
                    width: '150px',
                    whiteSpace: 'unset',
                    border: 0,
                    background: 'none',
                    color: '#0000EA',
                    fontWeight: 'bold',
                  }}
                  offset={new BMapGL.Size(15, -10)}
                />
              ) : (
                <></>
              )}
            </>
          );
        })}
        {windowInfo ? (
          <CustomOverlay position={windowInfo.point} offset={new BMapGL.Size(15, -15)}>
            <div style={{ width: 300, height: 110, padding: 5, background: '#FFF' }}>
              <div style={{ fontWeight: 'bold' }}>
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
              <div style={{ marginTop: 5 }}>
                地址：
                {windowInfo.order.address}
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
        zoom={18}
        enableScrollWheelZoom
        enableAutoResize
        style={{ height: '85vh' }}
      />
    );
  }
}
