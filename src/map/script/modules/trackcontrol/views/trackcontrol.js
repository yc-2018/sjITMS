/**
 * @file 轨迹管理台 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.22
 */
import React, { Component } from 'react';
import { render } from 'react-dom';
import CommonStore from '../../common/stores/commonStore';
import Manage from './manage';
import Map from './map';
import Timeline from './timeline';
import Trackanalysis from './trackanalysis';
// import Boundcontrol from './boundcontrol';

class Trackcontrol extends React.Component {
    constructor(props) {
      super(props);
    
      this.state = {// 当前页签，0为轨迹监控，1为终端管理
            tabIndex: 0};
    }

    componentDidMount() {
        CommonStore.listen(this.onStatusChange);
    }

    onStatusChange = (type,data) => {
        switch (type){
            case 'switchtab':
                this.listenSwitchTab(data);
            break;
        }
    }
    /**
     * 响应Store list事件，设置标签页
     *
     * @param {data} 标签页标识
     */
    listenSwitchTab = (data) => {
        this.setState({tabIndex: data});
    }

    render() {
        var tabIndex = this.state.tabIndex;
        return (
        <div className={tabIndex === 1 ? 'trackControl hidden' : 'trackControl visible'} >
            <Map />
            <Manage />
            <Timeline />
            <Trackanalysis />

        </div>
        )
    }
}

export default Trackcontrol;
