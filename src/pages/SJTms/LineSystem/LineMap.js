/*
 * @Author: guankongjin
 * @Date: 2022-03-22 16:14:43
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-28 17:10:20
 * @Description: 线路门店地图
 * @FilePath: \iwms-web\src\pages\Tms\LineSystem\LineMap.js
 */
import React, { Component } from 'react';
import { Map, Marker, MarkerList, DrivingRoute, NavigationControl, InfoWindow ,BMapGL,Label} from 'react-bmap';
import { dynamicqueryById } from '@/services/quick/Quick';
let BMap = window.BMap;
export default class LineMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineShipAddress: [],
      lng:"",
      lat:""
    };
    this.getSerialArchLineList();
  }
componentDidUpdate(){
  const{lineShipAddress,lng,lat} = this.state;
  var map =  new BMap.Map("container");
  map.enableScrollWheelZoom(true);
  
  if(lineShipAddress.length>0){
    map.centerAndZoom(new BMap.Point(lng, lat),12);
    // 开启鼠标滚轮缩放
       lineShipAddress.forEach(address=>{
        var point = new BMap.Point( address.LONGITUDE, address.LATITUDE); 
        var marker =  new BMap.Marker(point);  
        var lanb  =  new BMap.Label(address.ADDRESSNAME,{position:point,offset:new BMap.Size(18,-5)});
        var infoWindow = new BMap.InfoWindow(address.ADDRESSNAME);  // 创建信息窗口对象 
        marker.addEventListener("onmouseover", function(){ 
          map.openInfoWindow(infoWindow, point);   
           //开启信息窗口
        }); 
        marker.addEventListener("onmouseout", function(){  
          map.closeInfoWindow();    
           //关闭信息窗口   
        }); 
       marker.setLabel(lanb);
        map.addOverlay(marker);      
       })
  }

}
  //获取门店数据
  getSerialArchLineList = () => {
    console.log("lineuuid",this.props.lineuuid);
    const { lineuuid } = this.props;
    const param = {
      tableName: 'SJ_ITMS_LINE_SHIPADDRESS',
      condition: {
        params: [{ field: 'LINEUUID', rule: 'eq', val: [lineuuid] }],
      },
    };
    dynamicqueryById(param).then(response => {
      if (response.result.records != 'false') {
        this.setState({ 
          lineShipAddress: response.result.records,
          lng: response.result.records[0].LONGITUDE, 
          lat:response.result.records[0].LATITUDE}
          );
      }
    });
  };

  render() {
    const { lineShipAddress } = this.state;
    return <div id ='container' style={{height:'750px'}}></div>
  }
}
