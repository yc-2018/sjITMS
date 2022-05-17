import React, { PureComponent } from 'react';
import { Card, Col, Form, Input, message, Row, Spin ,Divider} from 'antd';
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
      title: '出车回车登记1',
      shipPlanBill: {},
      shipBill: {},
      responseError: false,
      responseMsg: '',
    };
  }

  //根据司机代码查排车单装车单信息
  getInfoByCarrier = (driverCode) => {
    this.props.dispatch({
      type: 'newCheckInAndCheckOut/getByCarrier',
      payload: driverCode,
      callback:response=>{
        console.log();
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
      type: 'newCheckInAndCheckOut/updateTime',
      payload: billNumber,
      callback: (response) => {
        if (response && response.success) { 
         // message.success(commonLocale.confirmSuccessLocale);
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
    console.log("shipBill",shipBill);
    let cols = [
      <CFormItem label={'员工'}
        key='driver'>
        {getFieldDecorator('driver', {
          initialValue: '',
        })(<Input onPressEnter={this.onSubmit} placeholder={"输入员工代码"} />)}
      </CFormItem>,
      <CFormItem label={"排车单号"}
        key='billNumber'>
        {getFieldDecorator('billNumber')
          (<Col>{shipBill ? shipBill.billNumber ? shipBill.billNumber : <Empty /> : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={"车辆信息"}
        key='vehicle'>
        {getFieldDecorator('vehicle')
          (<Col>{shipBill ? shipBill.vehicle ?'['+shipBill.vehicle.code+']'+shipBill.vehicle.name :<Empty /> : <Empty />}</Col>)}
      </CFormItem>,
    
    ];

    return [
      <FormPanel title={"车辆信息"} cols={cols} />,
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
    return ( //F5222D
    <Card title="刷卡结果" bordered={false} style={{ width: '100%' ,height:'640px'}}>
    <Input.TextArea style={responseError ? { color: '#F5222D' ,fontSize:'50px'} : {color:'#013ADF',fontSize:'100px'}} value={responseMsg}  rows={28}/>
    </Card>
  )
  }

  /**
   * 单据信息
   */
  drawBillInfo() {
    
    const { shipPlanBill,shipBill,responseMsg } = this.state;
    console.log("shipPlanBill",shipPlanBill);
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
   <Card title="排车单信息" bordered={false} style={{ width: '100%' ,height:'640px' }}>
      <Row>
        <Col>
        <span>排车单号:</span> <Input value={shipPlanBill.billNumber}></Input>
        </Col>
      </Row>
      <Divider/>
      <Row>
        <Col>
        <span>明细数: </span><Input  value={shipBill.deliveryPointCount}></Input>
        </Col>
      </Row>
      <Divider/>
      <Row>
        <Col>
        <span>出车时间:</span> <Input  value={shipBill.dispatchTime}></Input>
        </Col>
      </Row>
      <Divider/>
      <Row>
        <Col>
        <span>回车时间:</span> <Input  value={shipBill.returnTime}></Input>
        </Col>
      </Row>
      <Divider/>
      <Row>
        <Col>
        <span>重量(吨):</span> <Input  value={shipBill.weight}></Input>
        </Col>
      </Row>
      <Divider/>  
      <Row>
        <Col>
        <span>体积(立方米):</span> <Input  value={shipBill.volume}></Input>
        </Col>
      </Row>
   </Card>
 )
  }

  render() {

    return (
      <div>
        <PageHeaderWrapper>
          <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading}>
            <Page withCollect={true}>
              <Card bordered={false}>
                <NavigatorPanel style={{ marginTop:'-24px',marginLeft:'-22px' }} title={this.state.title}/>
                  <div>
                    <div>{this.drawVehicleInfo()}</div>
                    <div style={{float:'left' ,width:'35%',border:'1px solid  #908B8B',borderRadius:'5px'}}> {this.drawBillInfo()}</div>
                    <div style={{float:'right',width:'64.5%',border:'1px solid #908B8B ',borderRadius:'5px'}}> {this.drawNoticeMessage()}</div>
                  </div>
              </Card>
            </Page>
          </Spin>
        </PageHeaderWrapper>
      </div>
    );
  }
}
