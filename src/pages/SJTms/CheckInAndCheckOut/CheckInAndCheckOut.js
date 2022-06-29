import React, { PureComponent } from 'react';
import { Card, Col, Form, Input, message, Row, Spin, Divider } from 'antd';
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
import SearchPage from '@/pages/Component/Page/SearchPage';
import { autoHideHeader } from '@/defaultSettings';
import { getByCarrier, beginloading, finishloading } from '@/services/sjitms/ChargeLoading';

@connect(({ newCheckInAndCheckOut }) => ({
  newCheckInAndCheckOut,
  loading: null,
}))
@Form.create()
export default class CheckInAndCheckOut extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: '司机刷卡',
      shipPlanBill: {},
      shipBill: {},
      responseError: false,
      responseMsg: '',
      colorChange:false,
    };
  }

  //根据司机代码查排车单装车单信息
  getInfoByCarrier = driverCode => {
    this.props.dispatch({
      type: 'newCheckInAndCheckOut/getByCarrier',
      payload: driverCode,
      callback: response => {
        console.log();
        if (response && response.success && response.data) {
         //debugger;
          if(response.data.result){
            this.updateTime(response.data.data.billNumber);
          }else{
            this.getPlanInfo(driverCode);
          }
         
          
        } else {
            
          // this.setState({
          //   shipBill: {},
          //   shipPlanBill: {},
          //   responseMsg: response.message
          //     ? response.message
          //     : '当前没有已批准的排车单或装车单不存在',
          //   responseError: true,
          // });
        }
      },
    });
  };

    //根据司机代码查排车单装车单信息
    getPlanInfo = async driverCode => {
      await getByCarrier(driverCode).then(response => {
        if (response && response.success && response.data) {
         //Shipping
         this.getChargeMessage(response.data);
        } else {
          this.setState({
            shipPlanBill: response.data,
            responseMsg: response.message ? response.message : '当前没有已批准的排车单或装车单不存在',
            responseError: true,
          });
        }
      });
    };
  //刷卡装车
  getChargeMessage = async data => {
    console.log("ss",data);
    if (!data) return;
    await beginloading(data.uuid, data.version).then(response => {
      if (response && response.success) {
        this.setState({
          shipPlanBill: data,
          responseMsg: data.stat==='Approved'? `${data.vehicle.name},开始装车!`:`${data.vehicle.name},结束装车!`,
          responseError: false,
          colorChange:true,
        });
      } else {
        this.setState({
          responseMsg: response.message,
          responseError: true,
        });
      }
    });
  };
  updateTime = billNumber => {
    // const { shipBill } = this.state;
    if (!billNumber) return;

    this.props.dispatch({
      type: 'newCheckInAndCheckOut/updateTime',
      payload: billNumber,
      callback: response => {
        if (response && response.success ) {
          if(response.data.result){
            this.setState({
              responseMsg: response.data.data.stat==='Returned'
                ? `${response.data.data.vehicle.name},回车刷卡成功!`
                :`${response.data.data.vehicle.name},出车刷卡成功!`,
              responseError: false,
              colorChange:false,
              shipBill: response.data.data ? response.data.data : {},
            });
          }else{
            this.setState({
              responseMsg:response.data.data,
              responseError: true,
            shipBill: {},
            shipPlanBill: {},
            })
          }
        
        } else {
          this.setState({
            responseMsg: response.message,
            responseError: true,
            shipBill: {},
            shipPlanBill: {},
          });
        }
      },
    });
  };
  onSubmit = e => {
    this.getInfoByCarrier(e.target.value);
  };

  /**
   * 车辆信息
   */
  drawVehicleInfo() {
    return <div style={{height:'7%', fontSize: '15px',textAlign:'center' ,width:'100%',margin:'auto'}}>工号：<Input style={{width:218,height:35,boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'}} onPressEnter={this.onSubmit} placeholder={'输入员工代码'} /></div>
  }

  /**
   * 提示信息
   */
  drawNoticeMessage() {
    const { form } = this.props;
    const { responseError, responseMsg, shipBill,colorChange } = this.state;
    const noteItemLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 36 },
      colon: false,
    };
    return (
      //F5222D
        <Card   title="刷卡结果" bordered={true}   
        style={{ width: '100%', height: '42%',marginBottom:'1%',boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'}}
        bodyStyle ={{ margin:'4.6% auto',  position: 'relative',width:'100%',padding:'0 0 0 0',textAlign:'center'

      }}
        >
          {responseError?<div style={{ color:'#F5222D', fontSize: '40px',margin: 'auto'}} >{this.state.responseMsg}</div> 
          :colorChange?<div style={{ color:'#00DD00' , fontSize:'40px',margin:'auto'}}>{this.state.responseMsg}</div>:
          <div style={{ color:'#1354DA' , fontSize: '40px',margin: 'auto'}} >{this.state.responseMsg}</div>} 
           
      </Card>
    );
  }

  /**
   * 单据信息
   */
  drawBillInfo() {
    const { shipPlanBill, shipBill, responseMsg } = this.state;
    console.log('shipPlanBill', shipPlanBill);
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 1 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 2 },
        sm: { span: 2 },
      },
    };
    return (
      
      <Card title="排车单信息" style={{ width: '100%', height: '34%',boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'}}
      bodyStyle={{width:'100%',height:'78%'}}
      >
         <Row gutter={[4,28]}> 
          <Col  span={6}>
           <span style={{fontSize:15}}>排车单号：{shipPlanBill?.billNumber?shipPlanBill.billNumber:<Empty/>}</span>
           </Col>
           <Col   span={6}>
          <span style={{fontSize:15}}>车牌号：{shipPlanBill?.vehicle?shipPlanBill.vehicle.name:<Empty/>}</span>
          </Col>
          <Col   span={6}>
          <span style={{fontSize:15}}>重量(t)：{shipPlanBill?.weight?shipPlanBill.weight:<Empty/>}</span>
          </Col>
          <Col  span={6} >
          <span style={{fontSize:15}}>体积(m³)：{shipPlanBill?.volume?shipPlanBill.volume:<Empty/>}</span>
          </Col>
          <Col  span={6} >
          <span style={{fontSize:15}}>驾驶员：{shipPlanBill?.carrier?"["+shipPlanBill.carrier.code+"]"+shipPlanBill.carrier.name:<Empty/>}</span>
          </Col>
          <Col   span={6}>
          <span style={{fontSize:15}}>出车时间：{shipPlanBill?.dispatchTime?shipPlanBill.dispatchTime:<Empty/>}</span>
          </Col>
          <Col  span={6} >
          <span style={{fontSize:15}}>回车时间：{shipPlanBill?.returnTime?shipPlanBill.returnTime:<Empty/>}</span>
          </Col>
          
        </Row>
      </Card>
    );
  }

  render() {
    return (
     
        <PageHeaderWrapper>
          <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading}>
            <Page withCollect={true} >
          
                <NavigatorPanel
                  title={this.state.title}
                  style={{marginBottom:10}}
                />
                <div style={{overflow:'scroll', height:'100%'}}>
                {this.drawVehicleInfo()}
                {this.drawNoticeMessage()}
                {this.drawBillInfo()}
                </div>
               
               
            </Page>
          </Spin>
        </PageHeaderWrapper>
      
    );
  }
}
