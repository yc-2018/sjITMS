/*
 * @Author: guankongjin
 * @Date: 2022-07-13 14:22:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-01 11:47:33
 * @Description: 司机刷卡
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\DriverSwipe.js
 */
import { PureComponent } from 'react';
import { Card, Col, Input, Row, Spin, Select, message, InputNumber } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import Empty from '@/pages/Component/Form/Empty';
import { driverSwipe } from '@/services/sjitms/ScheduleProcess';
import { queryDictByCode } from '@/services/quick/Quick';
import SwipeLoadingSearchPage from './SwipeLoadingSearchPage'
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import FreshPageHeaderWrapper from '@/components/PageHeaderWrapper/FullScreenPageWrapper';
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
    swipeFlag: "loading",//刷卡标识用于区分出回车，开始结束装车 刷卡
    interval: 30,
    groupNo: ''
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
      this.setState({ time: new Date() })
    }, this.state.interval * 1000);
  }
  componentWillUnmount() {   // 离开页面关闭定时器
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

  onChangeHandle = (value) => {
    this.setState({ interval: value })
    clearInterval(this.timer);
    if (value <= 0) {
      return;
    }
    this.timer = setInterval(() => {
      this.setState({ time: new Date() })
    }, value * 1000);


  }

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
    const {
      loading,
      dict,
      empId,
      scheduleBill,
      errMsg,
      message,
      isShip,
      dispatchName,
    } = this.state;
    return (
      //   <FreshPageHeaderWrapper>
     // <div style={{ height: '100vh' }} onClick={() => this.empInputRef.focus()}>
      <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
        <Spin indicator={LoadingIcon('default')} spinning={loading} size="large">
          <NavigatorPanel 
          title="司机装车刷卡" 
          canFullScreen={this.props.location.pathname=='/driver/swipeLoading'?false:true} />
          <div
            style={{
              height: 100,
              lineHeight: '100px',
              borderBottom: '1px solid #e8e8e8',
            }}
          >
            <div style={{ float: 'left', width: '15%', paddingLeft: 24 }}>
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
            {/* <div style={{ float: 'left', width: '8%', marginLeft: '1%' }}>
              <Checkbox>锁定</Checkbox>
            </div> */}

            <div
              style={{
                fontSize: 55,
                fontWeight: 'normal',
                textAlign: 'center',
                marginRight: '15%',
                color: dispatchName == undefined ? 'red' : 'black',
              }}
            >
              {dispatchName == undefined ? '请选择调度中心' : dispatchName + '装车刷卡'}
            </div>
          </div>

          {/* <div
            style={{
              height: 50,
              lineHeight: '50px',
              fontSize: 16,
              fontWeight: 800,
              color: '#363e4b',
              paddingLeft: 24,
              borderBottom: '1px solid #e8e8e8',
            }}
          >
            司机刷卡
          </div> */}
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
          <Card
            title="刷卡结果"
            bordered={true}
            //style={{ height: '25vh',  }}
            bodyStyle={{
              height: '15vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            {errMsg ? (
              <div style={{ color: '#F5222D', fontSize: '45px', margin: 'auto' }}>{errMsg}</div>
            ) : isShip ? (
              <div style={{ color: '#00DD00', fontSize: '45px', margin: 'auto' }}>{message}</div>
            ) : (
              <div style={{ color: '#1354DA', fontSize: '45px', margin: 'auto' }}>{message}</div>
            )}
          </Card>
          {/* <Card
            title="排车单信息"
            style={{ height: 250, marginTop: 20, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
          >
            <Row gutter={[4, 28]}>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  排车单号：
                  {scheduleBill.billNumber ? scheduleBill.billNumber : <Empty />}
                </span>
              </Col>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  车牌号：
                  {scheduleBill.vehicle ? scheduleBill.vehicle.name : <Empty />}
                </span>
              </Col>
          
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  体积(m³)：
                  {scheduleBill.volume ? new Number(scheduleBill.volume).toFixed(2) : <Empty />}
                </span>
              </Col>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  驾驶员：
                  {scheduleBill.carrier ? (
                    '[' + scheduleBill.carrier.code + ']' + scheduleBill.carrier.name
                  ) : (
                    <Empty />
                  )}
                </span>
              </Col>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  出车时间：
                  {scheduleBill.dispatchTime ? scheduleBill.dispatchTime : <Empty />}
                </span>
              </Col>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  回车时间：
                  {scheduleBill.returnTime ? scheduleBill.returnTime : <Empty />}
                </span>
              </Col>
            </Row>
          </Card> */}
          <Card
            title={<>
              <span>刷卡列表</span><div style={{ float: 'right' }}>
                刷新间隔(秒)：<InputNumber onChange={this.onChangeHandle} min={0}
                  style={{ width: 50 }}
                  value={this.state.interval}
                />
                <Input style={{ width: 100, marginRight: 10, marginLeft: 20 }}
                  onChange={(e) => { this.setState({ groupNo: e.target.value, time: new Date() }) }}
                  placeholder="作业号" />
              </div>
            </>}
            style={{ 
              marginTop: 5,
               boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              // height: 'calc(100vh-30px)',
              
               zoom:1 
               }}//height: 'calc(60vh-30px)',
            bodyStyle={{
              height:'calc(29vh)',
              padding:0
              //paddingTop: 5,
              //height: 'calc(30vh-300px)',
              //scroll: {y: 'calc(50vh - 300px)'}

            }}
            headStyle={{
              height: '1vh',

            }}

          >
            <SwipeLoadingSearchPage
              quickuuid='v_sj_itms_swipe_loading'
              selectedRows={this.state.groupNo}
              interval={this.state.interval}
              time={this.state.time}
            />
          </Card>
         
        </Spin>
      </Page>
   
    );
  }
}
