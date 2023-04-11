/*
 * @Author: guankongjin
 * @Date: 2022-07-13 14:22:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-13 16:55:47
 * @Description: 司机刷卡
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\DriverSwipeLoading.js
 */
import { PureComponent } from 'react';
import { Card, Input, Spin, Select, message, InputNumber } from 'antd';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { driverSwipe } from '@/services/sjitms/ScheduleProcess';
import { queryDictByCode } from '@/services/quick/Quick';
import SwipeLoadingSearchPage from './SwipeLoadingSearchPage';
export default class DriverSwipeLoading extends PureComponent {
  state = {
    loading: false,
    dict: [],
    scheduleBill: {},
    empId: '',
    message: undefined,
    errMsg: '',
    isShip: false,
    companyUuid: undefined,
    dispatchUuid: undefined,
    dispatchName: undefined,
    swipeFlag: 'loading', //刷卡标识用于区分出回车，开始结束装车 刷卡
    interval: 30,
    groupNo: '',
  };

  componentDidMount() {
    this.empInputRef.focus();
    // 查询字典
    queryDictByCode(['dispatchCenter']).then(res => this.setState({ dict: res.data }));
    if (
      localStorage.getItem('dispatchUuid') != undefined &&
      localStorage.getItem('dispatchName') &&
      localStorage.getItem('companyUuid')
    ) {
      this.setState({
        dispatchUuid: localStorage.getItem('dispatchUuid'),
        dispatchName: localStorage.getItem('dispatchName'),
        companyUuid: localStorage.getItem('companyUuid'),
      });
    }
    this.timer = setInterval(() => {
      this.setState({ time: new Date() });
    }, this.state.interval * 1000);
  }

  componentWillUnmount() {
    // 离开页面关闭定时器
    clearInterval(this.timer);
  }

  speech = message => {
    var Speech = new SpeechSynthesisUtterance();
    Speech.lang = 'zh';
    Speech.rate = 0.7;
    Speech.pitch = 1.5;
    Speech.text = message;
    speechSynthesis.speak(Speech);
  };

  onChangeHandle = value => {
    this.setState({ interval: value });
    clearInterval(this.timer);
    if (value <= 0) {
      return;
    }
    this.timer = setInterval(() => {
      this.setState({ time: new Date() });
    }, value * 1000);
  };

  //刷卡
  onSubmit = async event => {
    const { dispatchUuid, companyUuid, swipeFlag } = this.state;
    if (dispatchUuid == undefined || companyUuid == undefined) {
      message.error('企业中心或调度中心值缺失！');
      return;
    }
    localStorage.setItem('showMessage', '0');
    this.setState({ loading: true, errMsg: undefined });
    const response = await driverSwipe(event.target.value, companyUuid, dispatchUuid, swipeFlag);
    localStorage.setItem('showMessage', '1');
    if (response.success) {
      this.speech('刷卡成功');
      this.setState({
        empId: '',
        loading: false,
        scheduleBill: response.data.scheduleBill,
        message: response.data.message,
        isShip: response.data.message.indexOf('装车') != -1,
      });
    } else {
      this.speech('刷卡失败');
      this.setState({ empId: '', loading: false, scheduleBill: {}, errMsg: response.message });
    }
  };

  render() {
    const { loading, dict, empId, errMsg, message, isShip, dispatchName } = this.state;
    return (
      <div style={{ height: '100vh' }} onClick={() => this.empInputRef.focus()}>
        <Spin indicator={LoadingIcon('default')} spinning={loading} size="large">
          <NavigatorPanel title="司机装车刷卡" canFullScreen={true} />
          {/* 调度中心选择 */}
          <div>
            <div style={{ float: 'left', width: '15%', paddingLeft: 24, marginTop: 20 }}>
              <Select
                placeholder="请选择调度中心"
                onChange={val => {
                  const item = dict.find(x => x.itemValue == val);
                  localStorage.setItem('dispatchUuid', val);
                  localStorage.setItem('dispatchName', item.itemText);
                  localStorage.setItem('companyUuid', item.description);
                  this.setState({
                    dispatchUuid: val,
                    dispatchName: item.itemText,
                    companyUuid: item.description,
                  });
                }}
                value={dispatchName}
                allowClear={true}
                style={{ width: '100%' }}
              >
                {dict.map(d => {
                  return <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>;
                })}
              </Select>
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 'normal',
                textAlign: 'center',
                marginRight: '15%',
                color: dispatchName == undefined ? 'red' : 'black',
              }}
            >
              {dispatchName == undefined ? '请选择调度中心' : dispatchName + '装车刷卡'}
            </div>
          </div>
          {/* 输入框 */}
          <div style={{ fontSize: 16, textAlign: 'center' }}>
            工号：
            <Input
              style={{
                width: 250,
                height: 40,
                fontSize: 16,
                margin: 15,
              }}
              value={empId}
              ref={input => (this.empInputRef = input)}
              onChange={event => this.setState({ empId: event.target.value })}
              onPressEnter={this.onSubmit}
              placeholder={'输入员工代码'}
            />
          </div>
          {/* 刷卡结果 */}
          <Card
            title="刷卡结果"
            bordered={true}
            //style={{ height: '11vh'}}
            bodyStyle={{
              height: '59px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              padding: '0px',
            }}
            headStyle={{
              height: '2px',
              display: 'flex',
            }}
          >
            {errMsg ? (
              <div style={{ color: '#F5222D', fontSize: '40px', margin: '0', height: '10' }}>
                {errMsg}
              </div>
            ) : isShip ? (
              <div style={{ color: '#00DD00', fontSize: '40px', margin: '0', height: '10' }}>
                {message}
              </div>
            ) : (
              <div style={{ color: '#1354DA', fontSize: '40px', margin: '0', height: '10' }}>
                {message}
              </div>
            )}
          </Card>
          {/* 刷卡列表 */}
          <Card
            title={
              <>
                <span>刷卡列表</span>
                <div style={{ float: 'right' }}>
                  刷新间隔(秒)：
                  <InputNumber
                    onChange={this.onChangeHandle}
                    min={0}
                    style={{ width: 50 }}
                    value={this.state.interval}
                  />
                  <Input
                    style={{ width: 100, marginRight: 10, marginLeft: 20 }}
                    onChange={e => {
                      this.setState({ groupNo: e.target.value, time: new Date() });
                    }}
                    placeholder="作业号"
                  />
                </div>
              </>
            }
            style={{
              marginTop: 5,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              zoom: 1,
            }}
            bodyStyle={{ padding: 0 }}
          >
            <SwipeLoadingSearchPage
              quickuuid="v_sj_itms_swipe_loading"
              selectedRows={this.state.groupNo}
              interval={this.state.interval}
              time={this.state.time}
              dispatchUuid={this.state.dispatchUuid}
              companyUuid={this.state.companyUuid}
            />
          </Card>
        </Spin>
      </div>
    );
  }
}
