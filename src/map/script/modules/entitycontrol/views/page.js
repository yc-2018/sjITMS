/**
 * @file 页码翻页部分 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

import React, { Component } from 'react';
import { render } from 'react-dom';
import EntityAction from '../actions/entityAction';
import EntityStore from '../stores/entityStore';

class Page extends React.Component {
    constructor(props) {
      super(props);
    
      this.state = {
        // 总数据数量
        total: 0,
        // 当前页码
        currentPage: 1,
        // 输入框中的页码
        inputPage: 1,
        // 总页码
        totalPage: 0,
        // 上一页按钮的样式，分为lasepageon&lastPageOff两种
        lastPage: 'lastPageOff',
        // 下一页按钮的样式，分为nextPageOn&nextPageOff两种
        nextPage: 'nextPageOff',
        // 翻页状态，当正在翻页过程中，翻页按钮不可点
        cliking: 0
      };
    }

    componentDidMount() {
        EntityStore.listen(this.onStatusChange);
    }

    onStatusChange = (type,data) => {
        switch (type){
            case 'total':
                this.listenTotal(data);
            break;
            case 'totalpage':
                this.listenTotalpage(data);
            break;
            case 'listcomplete':
                this.listenListcomplete();
            break;
            case 'initpage' :
                this.listenInitpage();
            break;
        }
    }
    /**
     * 响应Store total事件，设置总数量量
     *
     * @param {number} 总数据量
     */
    listenTotal = (data) => {
        this.setState({total: data});
    }
    /**
     * 响应Store totalpage事件，设置总数量量
     *
     * @param {data} 总页数
     */
    listenTotalpage = (data) => {
        this.setState({totalPage:data});
        this.setSwichPageStyle(this.state.currentPage);
    }
    /**
     * 响应Store listcomplete事件，开启翻页按钮可点
     *
     */
    listenListcomplete = () => {
        this.setState({cliking: 0});
    }
    /**
     * 响应Store initpage事件，初始化页码和按钮状态
     *
     */
    listenInitpage = () => {
        this.setState({
            // 总数据数量
            total: 0,
            // 当前页码
            currentPage: 1,
            // 输入框中的页码
            inputPage: 1,
            // 总页码
            totalPage: 0,
            // 上一页按钮的样式，分为lasepageon&lastPageOff两种
            lastPage: 'lastPageOff',
            // 下一页按钮的样式，分为nextPageOn&nextPageOff两种
            nextPage: 'nextPageOff',
            // 翻页状态，当正在翻页过程中，翻页按钮不可点
            cliking: 0
        });
    }
    /**
     * DOM操作回调，页码输入value变化
     *
     * @param {object} event 事件对象 
     */
    handleChange = (event) => {
        this.setState({inputPage:event.target.value});
    }
    /**
     * DOM操作回调，页码输入value确定
     *
     * @param {object} event 事件对象 
     */
    handleBlur = (event) => {
        if(parseInt(event.target.value) > 0 && parseInt(event.target.value) <= this.state.totalPage) {
            this.setState({inputPage: parseInt(event.target.value)});
        } else {
            this.setState({inputPage: 1});
        }
    }
    /**
     * DOM操作回调，点击跳转页面按钮
     *
     * @param {object} event 事件对象 
     */
    handleJumppage = (event) => {
        if(this.state.currentPage == this.state.inputPage || this.state.cliking === 1) {
            return;
        }
        var jumpPage = this.state.inputPage;
        this.setState({currentPage: jumpPage});
        EntityAction.list(jumpPage);
        this.setState({cliking: 1});
    }
    /**
     * DOM操作回调，点击上一页
     *
     * @param {object} event 事件对象 
     */
    handleLastpage = (event) => {
        if(this.state.currentPage === 1 || this.state.cliking === 1) {
            return;
        } else {
            var lastPage = this.state.currentPage - 1;
            this.setState({currentPage: lastPage});
            this.setState({inputPage: lastPage});
            EntityAction.list(lastPage);
            this.setState({cliking: 1});
        }
    }
    /**
     * DOM操作回调，点击下一页
     *
     * @param {object} event 事件对象 
     */
    handleNextpage = (event) => {
        if(this.state.currentPage === this.state.totalPage || this.state.cliking === 1) {
            return;
        } else {
            var nextPage = this.state.currentPage + 1;
            this.setState({currentPage: nextPage});
            this.setState({inputPage: nextPage});
            EntityAction.list(nextPage);
            this.setState({cliking: 1});
        }
    }
    /**
     * DOM操作回调，点击回车检索
     *
     * @param {object} event 事件对象
     */
    handleKeyBoard = (event) => {
        if(this.state.currentPage == this.state.inputPage || this.state.cliking === 1) {
            return;
        }
        if(event.key === 'Enter') {   
            if(parseInt(event.target.value) > 0 && parseInt(event.target.value) <= this.state.totalPage) {
                this.setState({inputPage: parseInt(event.target.value)});
                var jumpPage = parseInt(event.target.value);
                this.setState({currentPage: jumpPage});
                EntityAction.list(jumpPage);
                this.setState({cliking: 1});
            } else {
                this.setState({inputPage: 1});
                var jumpPage = parseInt(1);
                this.setState({currentPage: jumpPage});
                EntityAction.list(jumpPage);
            }
        }
    }
    /**
     * view内部，设置翻页按钮样式
     *
     * @param {number} jumpPage 要跳转到的页 
     */
    setSwichPageStyle = (jumpPage) => {
        if(jumpPage === 1) {
            this.setState({lastPage: 'lastPageOff'});
        } else {
            this.setState({lastPage: 'lastPageOn'});
        }
        if(jumpPage === this.state.totalPage) {
            this.setState({nextPage: 'nextPageOff'});
        } else {
            this.setState({nextPage: 'nextPageOn'});
        }
        this.setState({currentPage: jumpPage});
    }

    render() {
        var total = this.state.total;
        var currentPage = this.state.currentPage;
        var totalPage = this.state.totalPage;
        var lastPage = this.state.lastPage;
        var nextPage = this.state.nextPage;
        var inputPage = this.state.inputPage;
        return (
            <div className="page">
                <div className="totalPage">共计：{total}条</div>
                <div className="jumpPage">
                    <input type="text" className="inputPage" value={inputPage} onChange={this.handleChange} onBlur={this.handleBlur} onKeyPress={this.handleKeyBoard}/>
                    <span className="pageNumber">/{'    ' + totalPage}页</span>
                    <span className="goPage" onClick={this.handleJumppage}>GO</span>
                </div>
                <div className="switchPage">
                    <span className={lastPage} onClick={this.handleLastpage}></span>
                    <span className={nextPage} onClick={this.handleNextpage}></span>
                </div>
            </div>
        )
    }
}

export default Page;
