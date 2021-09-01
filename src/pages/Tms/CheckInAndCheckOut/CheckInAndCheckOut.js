import React, { PureComponent } from 'react';
import {
  checkInAndCheckOutLocals,
} from '@/pages/Tms/CheckInAndCheckOut/CheckInAndCheckOutLocale';
import { Card, Col, Form, Input, message, Row, Spin } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import Page from '@/pages/Component/Page/inner/Page';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { loginCompany } from '@/utils/LoginContext';
import FormTitle from '@/pages/Component/Form/FormTitle';
import styles from '@/pages/Component/Form/NotePanel.less';
import FormItem from 'antd/es/form/FormItem';
import { connect } from 'dva';
import { commonLocale } from '@/utils/CommonLocale';
import Empty from '@/pages/Component/Form/Empty';
import { convertCodeName } from '@/utils/utils';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import { State } from '@/pages/Tms/ShipBill/ShipBillContants';
import SearchPage from '@/pages/Component/Page/SearchPage'

@connect(({ checkInAndCheckOut }) => ({
  checkInAndCheckOut,
  loading: null,
}))

@Form.create()
export default class CheckInAndCheckOut extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: checkInAndCheckOutLocals.title,
      shipPlanBill: {},
      shipBill: {},
      responseError: false,
      responseMsg: '',
    };
  }

  //根据司机代码查排车单装车单信息
  getInfoByCarrier = (driverCode) => {
    this.props.dispatch({
      type: 'checkInAndCheckOut/getByCarrier',
      payload: driverCode,
      callback:response=>{
        if(response&&response.success&&response.data){
          this.setState({
            shipPlanBill:response.data
          });
          this.updateTime(response.data.billNumber);
        }else{
          this.setState({
            shipBill:{},
            shipPlanBill:{},
            responseMsg:response.message?response.message:'当前没有已批准的排车单或装车单不存在',
            responseError:true
          })
        }
      }
    });
  }

  updateTime = (billNumber) => {
    // const { shipBill } = this.state;
    if (!billNumber)
      return;

    this.props.dispatch({
      type: 'checkInAndCheckOut/updateTime',
      payload: billNumber,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.confirmSuccessLocale);
          this.setState({
            responseMsg:response.data.returnTime?`排车单号：${billNumber} 回车刷卡成功`:(response.data.dispatchTime?`排车单号：${billNumber}出车刷卡成功`:'刷卡成功'),
            responseError:false,
            shipBill:response.data?response.data:{}
          })
        
        }else{
          this.setState({
            responseMsg:response.message,
            responseError:true,
            shipBill:{},
            shipPlanBill:{},
          })
        }
      },
    });
  }
  onSubmit = (e) => {
    this.getInfoByCarrier(e.target.value);
  }

  /**
   * 车辆信息
   */
  drawVehicleInfo() {
    const { getFieldDecorator } = this.props.form;
    const { shipBill } = this.state;
    let cols = [
      <CFormItem label={'员工'}
        key='driver'>
        {getFieldDecorator('driver', {
          initialValue: '',
        })(<Input onPressEnter={this.onSubmit} placeholder={"输入员工代码"} />)}
      </CFormItem>,
      <CFormItem label={checkInAndCheckOutLocals.shipBillNumber}
        key='billNumber'>
        {getFieldDecorator('billNumber')
          (<Col>{shipBill ? shipBill.billNumber ? shipBill.billNumber : <Empty /> : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={checkInAndCheckOutLocals.vehicleInfo}
        key='vehicle'>
        {getFieldDecorator('vehicle')
          (<Col>{shipBill ? convertCodeName(shipBill.vehicle) : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={checkInAndCheckOutLocals.carrier}
        key='carrier'>
        {getFieldDecorator('carrier')
          (<Col>{shipBill ? convertCodeName(shipBill.carrier) : <Empty />}</Col>)}
      </CFormItem>,
    ];

    return [
      <FormPanel title={checkInAndCheckOutLocals.vehicleInfo} cols={cols} />,
    ];
  }

  /**
   * 提示信息
   */
  drawNoticeMessage() {
    const { form } = this.props;
    const { responseError, responseMsg, shipBill } = this.state;
    const noteItemLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 36 },
      colon: false,
    };
    return (
      <div className={styles.notePanel}>
        <FormTitle title={'刷卡结果'} className={styles.formTitle} />
        <Row style={{ marginLeft: 30 }}>
          <Col span={36}>
            <FormItem {...noteItemLayout}>
              <Input.TextArea style={responseError ? { color: '#F5222D' } : {}} value={responseMsg}  rows={4} />
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }

  /**
   * 单据信息
   */
  drawBillInfo() {
    const { shipPlanBill,shipBill } = this.state;
    const { getFieldDecorator } = this.props.form;
    let cols = [
      <CFormItem label={checkInAndCheckOutLocals.shipPlanBillNumber}
        key='shipPlanBillNumber'>
        {getFieldDecorator('shipPlanBillNumber')
          (<Col>{shipPlanBill ? shipPlanBill.billNumber : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={checkInAndCheckOutLocals.itemsCount}
        key='qtyStr'>
        {getFieldDecorator('qtyStr')
          (<Col>{shipBill ? shipBill.qtyStr : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={checkInAndCheckOutLocals.checkOutTime}
        key='dispatchTime'>
        {getFieldDecorator('dispatchTime')
          (<Col>{shipBill ? shipBill.dispatchTime : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={checkInAndCheckOutLocals.checkInTime}
        key='returnTime'>
        {getFieldDecorator('returnTime')
          (<Col>{shipBill ? shipBill.returnTime : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={checkInAndCheckOutLocals.totalWeight}
        key='weight'>
        {getFieldDecorator('weight')
          (<Col>{shipPlanBill ? shipPlanBill.weight : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={checkInAndCheckOutLocals.volume}
        key='volume'>
        {getFieldDecorator('volume')
          (<Col>{shipPlanBill ? shipPlanBill.volume : <Empty />}</Col>)}
      </CFormItem>,
    ];

    return [
      <FormPanel title={commonLocale.billInfoLocale} cols={cols} />,
    ];
  }

  render() {

    return (
      <div>
        <PageHeaderWrapper>
          <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading}>
            <Page withCollect={true}>
              <Card bordered={false}>
                <NavigatorPanel style={{ marginTop:'-24px',marginLeft:'-22px' }} title={this.state.title}/>
                <Form>
                  {this.drawVehicleInfo()}
                  {this.drawNoticeMessage()}
                  {this.drawBillInfo()}
                </Form>
              </Card>
            </Page>
          </Spin>
        </PageHeaderWrapper>
      </div>
    );
  }
}
