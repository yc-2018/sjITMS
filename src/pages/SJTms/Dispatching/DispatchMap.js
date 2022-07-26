/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-07-26 10:19:44
 * @Description: 地图
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\DispatchMap.js
 */
import React, { Component } from 'react';
import { Map, Marker, Label, InfoWindow } from 'react-bmapgl';
import storeIcon from '@/assets/common/store.svg';
import { uniqBy } from 'lodash';

export default class DispatchMap extends Component {
  state = {
    infoWindowPoint: undefined,
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

  render() {
    const { infoWindowPoint } = this.state;
    const { orders } = this.props;
    let shipAddress = [...orders].filter(x => x.longitude);
    shipAddress = uniqBy(shipAddress, x => x.deliveryPoint.uuid);
    const icon = new BMapGL.Icon(storeIcon, new BMapGL.Size(30, 30));
    return shipAddress.length > 0 ? (
      <Map zoom={12} minZoom={6} enableScrollWheelZoom enableAutoResize style={{ height: 600 }}>
        {shipAddress.map(address => {
          var point = new BMapGL.Point(address.longitude, address.latitude);
          return (
            <>
              <Marker
                position={point}
                icon={icon}
                shadow={true}
                autoViewport
                onMouseover={() =>
                  this.setState({ infoWindowPoint: { point, address: address.deliveryPoint } })
                }
                onMouseout={() => this.setState({ infoWindowPoint: undefined })}
                title={address.deliveryPoint.name}
              />
              <Label
                text={address.deliveryPoint.name}
                position={point}
                style={{
                  width: '150px',
                  whiteSpace: 'unset',
                  border: 0,
                  background: 'none',
                  color: '#22886f',
                  fontWeight: 'bold',
                  strokeColor: '#fff',
                  strokeWidth: 2,
                }}
                offset={new BMapGL.Size(15, -10)}
              />
            </>
          );
        })}
        {infoWindowPoint ? (
          <InfoWindow
            position={infoWindowPoint.point}
            title={infoWindowPoint.address.name}
            text={infoWindowPoint.address.address}
          />
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
        style={{ height: 600 }}
      />
    );
  }
}
