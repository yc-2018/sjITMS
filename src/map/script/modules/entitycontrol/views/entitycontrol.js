/**
 * @file 设备管理台 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.22
 */
import React, { Component } from 'react';
import { render } from 'react-dom';
import Control from './control';
import Entitylist from './entitylist';
import BottomControl from './bottomcontrol';
import CommonStore from '../../common/stores/commonStore';

class Entitycontrol extends React.Component{
    constructor(props) {
      super(props);
    
      this.state = {
        tabIndex: 0
      };
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
        <div className={tabIndex === 0 ? 'entityControl hidden' : 'entityControl visible'} > 
            <Control />
            <Entitylist />
            <BottomControl />
        </div>
        )
    }
}

export default Entitycontrol;
