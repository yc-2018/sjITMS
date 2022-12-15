/*
 * @Author: guankongjin
 * @Date: 2022-07-13 14:22:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-08-03 08:50:23
 * @Description: 司机刷卡 弃用
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\Swipe.js
 */
import { PureComponent, calc } from 'react';
import FreshPageHeaderWrapper from '@/components/PageHeaderWrapper/FullScreenPageWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import { Card, Col, Input, Row, Spin, Button, InputNumber } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import Empty from '@/pages/Component/Form/Empty';
import { swipe } from '@/services/sjitms/ScheduleProcess';
import SwipeLoadingSearchPage from './SwipeLoadingSearchPage'
import { throttleSetter } from 'lodash-decorators';
export default class Swipe extends PureComponent {
  state = {
    loading: false,
    scheduleBill: {},
    empId: '',
    message: undefined,
    errMsg: '',
    isShip: false,
    swipeFlag: "loading",//刷卡标识用于区分出回车，开始结束装车 刷卡
    interval: 30,
    groupNo: ''
  };
  componentDidMount() {
    this.empInputRef.focus();
    this.timer = setInterval(() => {
      this.setState({ time: new Date() })
    }, this.state.interval * 1000);
  }
  componentWillUnmount() {   // 离开页面关闭定时器
    clearInterval(this.timer);
  }
  //刷卡
  onSubmit = async event => {
    localStorage.setItem('showMessage', '0');
    this.setState({ loading: true, errMsg: undefined });
    const response = await swipe(event.target.value,this.state.swipeFlag);
    localStorage.setItem('showMessage', '1');
    if (response.success) {
      this.setState({
        empId: '',
        loading: false,
        scheduleBill: response.data.scheduleBill,
        message: response.data.message,
        isShip: response.data.message.indexOf('装车') != -1,
      });
    } else {
      this.setState({ empId: '', loading: false, scheduleBill: {}, errMsg: response.message });
    }
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
  render() {
    const { loading, empId, scheduleBill, errMsg, message, isShip } = this.state;
    return (
      <FreshPageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Spin indicator={LoadingIcon('default')} spinning={loading}>
            <NavigatorPanel title="司机刷卡" canFullScreen={true} />
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
              //style={{ height: '15vh',  }}
              bodyStyle={{
                // height: 'calc(50vh)',
                height: '18vh',
                // display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
              headStyle={{
                height: '1vh',

              }}
            // style={{
            //   display: 'flex'
            // }}
            >
              {errMsg ? (
                <div style={{ color: '#F5222D', fontSize: '45px', margin: 'auto' }}>{errMsg}</div>
              ) : isShip ? (
                <div style={{ color: '#00DD00', fontSize: '45px', margin: 'auto' }}>{message}</div>
              ) : (
                <div style={{ color: '#1354DA', fontSize: '45px', margin: 'auto' }}>{message}</div>
              )}
            </Card>
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
              style={{ marginTop: 12, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', }}//height: 'calc(60vh-30px)',
              bodyStyle={{
                paddingTop: 5

              }}
              headStyle={{
                height: '1vh',

              }}
            >
              {/*   <Row gutter={[8, 8]}>
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
              </Row>*/}
              <SwipeLoadingSearchPage
                quickuuid='v_sj_itms_swipe_loading'
                selectedRows={this.state.groupNo}
                interval={this.state.interval}
                time={this.state.time}
              />
            </Card>

          </Spin>
        </Page>
       </FreshPageHeaderWrapper> 
    );
  }
}
