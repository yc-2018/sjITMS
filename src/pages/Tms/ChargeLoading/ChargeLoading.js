import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Space, Input, Form, message } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import { convertCodeName } from '@/utils/utils';
import styles from './ChargeLoading.less';
import {
  checkInAndCheckOutLocals,
} from '@/pages/Tms/CheckInAndCheckOut/CheckInAndCheckOutLocale';
import ShipPlanBillViewPage  from './ShipPlanBillViewPage';
import StandardTable from '@/components/StandardTable';
import { commonLocale, notNullLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getActiveKey } from '@/utils/LoginContext';
import Empty from '@/pages/Component/Form/Empty';
import { add, accAdd } from '@/utils/QpcStrUtil';

const { Content } = Layout;

@connect(({ chargeLoading, loading }) => ({
  chargeLoading,
  loading: loading.models.chargeLoading,
}))
@Form.create()
export default class ChargeLoading extends PureComponent {
  constructor(props){
    super(props);

    this.state = {
      ...this.state,
      shipPlanBill: {
        list: [],
        pagination: {}
      },
      shipBill: {},
      responseError: false,
      responseMsg: '',
    };
  }

  onSubmit = (e) => {
    this.getInfoByCarrier(e.target.value);
  }

  //根据司机代码查排车单装车单信息
  getInfoByCarrier = (driverCode) => {
    this.props.dispatch({
      type: 'chargeLoading/getByCarrier',
      payload: driverCode,
      callback:response=>{
        if(response&&response.success&&response.data){
          // this.setState({
          //   shipBill: response.data
          // });
          if(response.data.stat === 'Approved') {
            this.getChargeMessageStart(response.data.uuid, response.data)
          }
          if(response.data.stat === 'Shipping') {
            this.getChargeMessageEnd(response.data.uuid, response.data)
          }
        }else{
          this.setState({
            shipBill:{},
            shipPlanBill:{},
            jMember:{},
            sMember:{},
            responseMsg:response.message?response.message:'当前没有已批准的排车单或装车单不存在',
            responseError:true
          })
        }
      }
    });
  }

  getChargeMessageStart = (uuid, data) => {
    if (!uuid)
      return;

    this.props.dispatch({
      type: 'chargeLoading/beginloading',
      payload: {
        scheduleBillUuid: uuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            responseMsg:'开始装车',
            responseError:false,
            shipBill: data
          });
          let list = data.memberDetails ? data.memberDetails : [];
          let that = this;
          Array.isArray(list) && list.forEach(function (item) {
            if (item.memberType && item.memberType === 'DRIVER'){
              that.setState({
                jMember:item.member
              });
            }
            if(item.memberType && item.memberType === 'STEVEDORE') {
              that.setState({
                sMember:item.member
              });
            }
          })

        }else{
          this.setState({
            responseMsg:response.message,
            responseError:true,
            shipBill:{},
            jMember:{},
            sMember:{}
          })
        }
      },
    });
  }

  getChargeMessageEnd = (uuid, data) => {
    if (!uuid)
      return;

    this.props.dispatch({
      type: 'chargeLoading/finishloading',
      payload: {
        scheduleBillUuid: uuid
      },
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.confirmSuccessLocale);
          this.setState({
            responseMsg:'结束装车',
            responseError:false,
            shipBill: data
          })
          let list = data.memberDetails ? data.memberDetails : [];
          let that = this;
          Array.isArray(list) && list.forEach(function (item) {
            if (item.memberType && item.memberType === 'DRIVER'){
              that.setState({
                jMember:item.member
              });
            }
            if(item.memberType && item.memberType === 'STEVEDORE') {
              that.setState({
                sMember:item.member
              });
            }
          })

        }else{
          this.setState({
            responseMsg:response.message,
            responseError:true,
            shipBill: {},
            jMember:{},
            sMember:{}
          })
        }
      },
    });
  }

  render() {
    const { jMember, sMember, responseError, responseMsg, shipBill} = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };


    return  <PageHeaderWrapper>
      <Page>
        <Content className={styles.contentWrapper}>
          <div>
            <div style={{width:'30%', float:'left'}}>
              <div style={{width:'100%'}}>
                <div className={styles.marginTop}>
                  <span style={{marginLeft:'13px',width:'15%'}}>{'刷卡人:'}</span>&nbsp;&nbsp;
                  <Input className={styles.right} onPressEnter={this.onSubmit} placeholder={placeholderLocale("刷卡人代码")}/>
                </div>
                <div className={styles.marginTop}>
                  <span style={{width:'15%'}}>{'刷卡提示:'}</span>&nbsp;&nbsp;
                  <Input.TextArea style={responseError ? { color: '#F5222D', width:'80%' } : {width:'80%'}} value={responseMsg}  rows={4}/>
                </div>
                <div className={styles.borderLeft}>
                  {'排车单信息'}
                </div>
                <div className={styles.marginTop}>
                  <span className={styles.left} style={{marginLeft:'39px'}}>{'线路:'}</span>&nbsp;&nbsp;
                  <span className={styles.right}>{convertCodeName(shipBill.serialArch)}</span>
                </div>
                <div className={styles.marginTop}>
                  <span className={styles.left} style={{marginLeft:'39px'}}>{'车辆:'}</span>&nbsp;&nbsp;
                  <span className={styles.right}>{convertCodeName(shipBill.vehicle)}</span>
                </div>
                <div className={styles.marginTop}>
                  <span className={styles.left} style={{marginLeft:'26px'}}>{'驾驶员:'}</span>&nbsp;&nbsp;
                  <span className={styles.right}>{convertCodeName(jMember)}</span>
                </div>
                <div className={styles.marginTop}>
                  <span className={styles.left} style={{marginLeft:'26px'}}>{'送货员:'}</span>&nbsp;&nbsp;
                  <span className={styles.right}>{convertCodeName(sMember)}</span>
                </div>
                <div className={styles.marginTop}>
                  <span className={styles.left}>{'排车作业组:'}</span>&nbsp;&nbsp;
                  <span className={styles.right}>{shipBill.shipGroupCode ? shipBill.shipGroupCode : '<'+'空'+'>'}</span>
                </div>
                <div className={styles.marginTop}>
                  <span className={styles.left} style={{marginLeft:'13px'}}>{'排车单号:'}</span>&nbsp;&nbsp;
                  <span className={styles.right}>{shipBill.billNumber ? shipBill.billNumber : '<'+'空'+'>'}</span>
                </div>
                <div className={styles.marginTop}>
                  <span className={styles.left} style={{marginLeft:'26px'}}>{'明细数:'}</span>&nbsp;&nbsp;
                  <span className={styles.right}>{shipBill.orderDetails && shipBill.orderDetails.length ? shipBill.orderDetails.length : 0}</span>
                </div>
                <div className={styles.marginTop}>
                  <span className={styles.left} style={{marginLeft:'26px'}}>{'总重量(吨):'}</span>&nbsp;&nbsp;
                  <span className={styles.right}>{shipBill.weight ? shipBill.weight : 0}</span>
                </div>
                <div className={styles.marginTop}>
                  <span className={styles.left} style={{marginLeft:'26px'}}>{'总体积(m³):'}</span>&nbsp;&nbsp;
                  <span className={styles.right}>{shipBill.volume ? shipBill.volume : 0}</span>
                </div>
              </div>

            </div>
            <div style={{width:'70%', float:'left'}}>
              <ShipPlanBillViewPage
                shipPlanBill = {shipBill}
              />
            </div>
          </div>
        </Content>
      </Page>
    </PageHeaderWrapper>;
  }
}
