/*
 * @Author: guankongjin
 * @Date: 2022-03-22 16:14:43
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-28 17:10:20
 * @Description: 线路门店地图
 * @FilePath: \iwms-web\src\pages\Tms\LineSystem\LineMap.js
 */
import React, { Component } from 'react';
import { Map, Marker, MarkerList, DrivingRoute, NavigationControl, InfoWindow } from 'react-bmap';
import { dynamicqueryById } from '@/services/quick/Quick';

export default class LineMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineShipAddress: [],
    };
    this.getSerialArchLineList();
  }

  //获取门店数据
  getSerialArchLineList = () => {
    const { lineuuid } = this.props;
    const param = {
      tableName: 'SJ_ITMS_LINE_SHIPADDRESS',
      condition: {
        params: [{ field: 'LINEUUID', rule: 'eq', val: [lineuuid] }],
      },
    };
    dynamicqueryById(param).then(response => {
      if (response.result.records != 'false') {
        this.setState({ lineShipAddress: response.result.records });
      }
    });
  };

  render() {
    const { lineShipAddress } = this.state;

    return lineShipAddress.length > 0 ? (
      <Map
        center={{ lng: lineShipAddress[0].LONGITUDE, lat: lineShipAddress[0].LATITUDE }}
        zoom="12"
        enableScrollWheelZoom
        enableAutoResize
        style={{ height: 620 }}
      >
        {lineShipAddress.map(address => {
          return (
            <Marker
              position={{ lng: address.LONGITUDE, lat: address.LATITUDE }}
              icon={'red' + address.ORDERNUM}
              shadow={true}
              title={address.ADDRESSNAME}
            />
          );
        })}
      </Map>
    ) : (
      <Map
        center={{ lng: 113.809388, lat: 23.067107 }}
        zoom="18"
        enableScrollWheelZoom
        enableAutoResize
        style={{ height: 620 }}
      />
    );
  }
}
