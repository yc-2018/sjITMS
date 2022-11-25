/*
 * @Author: guankongjin
 * @Date: 2022-07-13 14:22:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-08-03 08:50:23
 * @Description: 司机刷卡
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\Swipe.js
 */
import { PureComponent } from 'react';
import FreshPageHeaderWrapper from '@/components/PageHeaderWrapper/FullScreenPageWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import { Card, Col, Input, Row, Spin } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import Empty from '@/pages/Component/Form/Empty';
import { swipe } from '@/services/sjitms/ScheduleProcess';
export default class Swipe extends PureComponent {
  state = {
    loading: false,
    scheduleBill: {},
    empId: '',
    message: undefined,
    errMsg: '',
    isShip: false,
    swipeFlag:"inAndOut"//刷卡标识用于区分出回车，开始结束装车 刷卡
  };
  componentDidMount() {
    this.empInputRef.focus();
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
              style={{ height: '35vh', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
              bodyStyle={{
                height: '25vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
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
            <Card
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
                    重量(t)：
                    {scheduleBill.weight ?  (new Number(scheduleBill.weight)/1000).toFixed(3) : <Empty />}
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
            </Card>
          </Spin>
        </Page>
      </FreshPageHeaderWrapper>
    );
  }
}
