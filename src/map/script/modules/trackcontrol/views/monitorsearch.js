/**
 * @file 实时监控检索entity部分 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.23
 */
import React, { Component } from 'react';
import { render } from 'react-dom';
import TrackStore from '../stores/trackStore';
import TrackAction from '../actions/trackAction';


class Monitorsearch extends React.Component {
    constructor(props) {
      super(props);
    
      this.state = {
        value: '',
            visible:0,
            clikingAll: 0,
            clikingOnline: 0,
            clikingOffline: 0
      };
    }

    componentDidMount() {
        var self = this;
        TrackStore.listen(self.onStatusChange);
    }

    onStatusChange = (type,data) => {
        switch (type){
            case 'alllist':
                this.listenAlllist();
            break;
            case 'onlinelist':
                this.listenOnlinelist();
            break;
            case 'offlinelist':
                this.listenOfflinelist();
            break;

        }
    }

    listenAlllist = () => {
        this.setState({clikingAll: 0});
    }

    listenOnlinelist = () => {
        this.setState({clikingOnline: 0});
    }

    listenOfflinelist = () => {
        this.setState({clikingOffline: 0});
    }
    /**
     * DOM操作回调，检索框value改变
     *
     * @param {object} event 事件对象 
     */
    handleChange = (event) => {
        this.setState({value: event.target.value});
        if(event.target.value != '') {
            this.state.visible = 1;
        } else {
            this.state.visible = 0;
            TrackAction.initpageset();
            TrackAction.setsearchentity('');
            TrackAction.searchallentity(1);
            TrackAction.searchonlineentity(1);
            TrackAction.searchofflineentity(1);
            this.setState({cliking: 3});
        }
    }
    /**
     * DOM操作回调，检索框value清空
     *
     * @param {object} event 事件对象 
     */
    handleClearClick = (event) => {
        if (this.state.clikingAll !== 0 || this.state.clikingOnline !== 0 || this.state.clikingOffline !== 0) {
            return;
        }
        TrackAction.initpageset();
        this.setState({value: '',visible:0});
        TrackAction.setsearchentity('');
        TrackAction.searchallentity(1);
        TrackAction.searchonlineentity(1);
        TrackAction.searchofflineentity(1);

        this.setState({clikingAll: 1});
        this.setState({clikingOnline: 1});
        this.setState({clikingOffline: 1});
    }
    /**
     * DOM操作回调，检索
     *
     * @param {object} event 事件对象 
     */
    handleClickSearch = (event) => {
        if (this.state.clikingAll !== 0 || this.state.clikingOnline !== 0 || this.state.clikingOffline !== 0) {
            return;
        }
        TrackAction.initpageset();
        TrackAction.setsearchentity(this.state.value);
        TrackAction.searchallentity(1);
        TrackAction.searchonlineentity(1);
        TrackAction.searchofflineentity(1);
        this.setState({clikingAll: 1});
        this.setState({clikingOnline: 1});
        this.setState({clikingOffline: 1});
    }
    /**
     * DOM操作回调，点击回车检索
     *
     * @param {object} event 事件对象 s
     */
    handleKeyBoard = (event) => {
        if (this.state.clikingAll !== 0 || this.state.clikingOnline !== 0 || this.state.clikingOffline !== 0) {
            return;
        }
        if (event.key === 'Enter') {
            TrackAction.initpageset();
            TrackAction.setsearchentity(this.state.value);
            TrackAction.searchallentity(1);
            TrackAction.searchonlineentity(1);
            TrackAction.searchofflineentity(1);
            this.setState({clikingAll: 1});
            this.setState({clikingOnline: 1});
            this.setState({clikingOffline: 1});
        }
    }

    render() {
        var searchicon = '../static/images/searchicon_2x.png';
        var clearsearch = '../static/images/clearsearch_2x.png';
        return (
            <div className="monitorSearch">
                <input className="searchInputMonitor" placeholder="请输入关键字"   value={this.state.value} onChange={this.handleChange} onKeyPress={this.handleKeyBoard}/>
                <img src={searchicon} className="searchBtnMonitor" onClick={this.handleClickSearch} />
                <div className="lineMonitor"></div>
                <img src={clearsearch} className={this.state.visible === 0 ? 'clearSearchBtnMonitor hideCommon':'clearSearchBtnMonitor'}  onClick={this.handleClearClick}/>     
            </div>

        )
    }
}

export default Monitorsearch;
