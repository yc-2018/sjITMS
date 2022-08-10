/*
 * @Author: guankongjin
 * @Date: 2022-07-13 14:22:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-08-10 15:59:38
 * @Description: 司机刷卡
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\DriverSwipe.js
 */
import { PureComponent } from 'react';
import { Card, Col, Input, Row, Spin } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import Empty from '@/pages/Component/Form/Empty';
import { driverSwipe } from '@/services/sjitms/ScheduleProcess';

export default class Swiper extends PureComponent {
  state = {
    loading: false,
    scheduleBill: {},
    empId: '',
    message: undefined,
    errMsg: '',
    isShip: false,
  };
  componentDidMount() {
    this.empInputRef.focus();
  }

  speech = message => {
    var Speech = new SpeechSynthesisUtterance();
    Speech.lang = 'zh';
    Speech.rate = 0.7;
    Speech.pitch = 1.5;
    Speech.text = message;
    speechSynthesis.speak(Speech);
  };

  //刷卡
  onSubmit = async event => {
    localStorage.setItem('showMessage', '0');
    this.setState({ loading: true, errMsg: undefined });
    const response = await driverSwipe(event.target.value);
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
    const { loading, empId, scheduleBill, errMsg, message, isShip } = this.state;
    return (
      <div style={{ height: '100vh' }} onClick={() => this.empInputRef.focus()}>
        <Spin indicator={LoadingIcon('default')} spinning={loading} size="large">
          <div
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
          </div>
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
                  {scheduleBill.weight ? scheduleBill.weight : <Empty />}
                </span>
              </Col>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  体积(m³)：
                  {scheduleBill.volume ? scheduleBill.volume : <Empty />}
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
      </div>
    );
  }
}
