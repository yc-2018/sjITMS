/*
 * @Author: guankongjin
 * @Date: 2022-03-22 16:14:43
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-24 08:57:43
 * @Description: 线路门店地图
 * @FilePath: \iwms-web\src\pages\Tms\LineSystem\LineMap.js
 */
import React, { Component } from 'react';
import { Map, Marker, DrivingRoute, NavigationControl, InfoWindow } from 'react-bmap';

export default class LineMap extends Component {
  render() {
    return (
      <Map
        center={{ lng: 113.272212, lat: 22.301761 }}
        zoom="11"
        enableScrollWheelZoom
        enableAutoResize
        style={{ height: 620 }}
      >
        <Marker position={{ lng: 113.272212, lat: 22.171761 }} icon={'blue1'}>
          {/* <InfoWindow
            position={{ lng: 113.272212, lat: 22.201761 }}
            text="广东省珠海市斗门区西埔新村新路66号一层"
            title="	UP东莞天天畅饮贸易有限公司"
          /> */}
        </Marker>

        <Marker position={{ lng: 113.083273, lat: 22.46385 }} icon={'blue2'}>
          {/* <InfoWindow
            position={{ lng: 113.083273, lat: 22.46385 }}
            text="广东省江门市新会区会城大洞新乐新村A区3号"
            title="UP广州思远智能科技有限公司"
          /> */}
        </Marker>
      </Map>
      // <DrivingRoute
      //   map={this.map()}
      //   start={{ lng: 113.083273, lat: 22.46385 }}
      //   end={{ lng: 113.272212, lat: 22.171761 }}
      // />
    );
  }
}
