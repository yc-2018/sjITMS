/**
 * @file 轨迹管理台背景地图 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.22
 */
import React, { Component } from 'react';
import { render } from 'react-dom';
import CommonStore from '../../common/stores/commonStore';

class Map extends React.Component {
    constructor(props) {
      super(props);
    
      this.state = {};
    }

    componentDidMount() {
        CommonStore.listen(this.onStatusChange);
        this.initMapContainer();
    }

    onStatusChange = (type,data) => {
        switch (type){
            case '':
                
            break;
        }
    }
    /**
     * 响应Store list事件，设置标签页
     *
     * @param {data} 标签页标识
     */
    listenSwitchTab = (data) => {
        
    }
    /**
     * view内部，设置map容器尺寸
     *
     */
    initMapContainer = () => {

    }

    render() {
        return (
        <div className="map" id="mapContainer">
            
        </div>
        )
    }
}

export default Map;
