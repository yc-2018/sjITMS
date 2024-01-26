import { connect } from 'dva';
import { Button, Form, Layout, Spin, Card, Row,Col,Modal,Empty,message} from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import moment from 'moment';
import { loginOrg } from '@/utils/LoginContext';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import React from 'react';
import CostPlanSearch from '@/pages/NewCost/CostPlan/CostPlanSearch';
import DriverCustomerLessBuy from '@/pages/SJTms/DriverCustomer/DriverCustomerLessBuy';
import emptySvg from '@/assets/common/img_empoty.svg';
import { v4 as uuidv4 } from 'uuid';
import { onSaveGoodsDetailRecord } from '@/services/sjitms/DriverCustomerService';
import { saveFormData } from '@/services/quick/Quick';
import { commonLocale } from '@/utils/CommonLocale';
import DriverCustomerDutyBuy from '@/pages/SJTms/DriverCustomer/DriverCustomerDutyBuy';
const { Footer, Content } = Layout;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class DriverCustomerCreate extends QuickCreatePage {
  state = {
    ...this.state,
    // flag:true,
    //货物搜索打开开关
    isModalVisible:false,
    //所选择的货品明细数据
    theSelectGoodsDetailDatas:[],
    //新建保存时的uuid
    uuidSave:''
  };

  //表单加载的时候
  formLoaded = () => {
    const { showPageNow } = this.props;
    const { formItems, onlFormInfos } = this.state;
    if (showPageNow == 'create') {
      const mainName = 'sj_driver_customer_service';
      console.log("this.entity[mainName][0]",this.entity[mainName]);
      this.entity[mainName][0]['FEEDBACKTIME'] = moment().format('YYYY-MM-DD HH:mm:ss');
      this.entity[mainName][0]['WAREHOUSE'] = loginOrg().uuid;
    }
  };
  //某个字段发生改变的时候
  exHandleChange = columnEvent => {
    const mainName = 'sj_driver_customer_service';
    const { fieldName, valueEvent } = columnEvent;
    const { formItems, onlFormInfos } = this.state;
    console.log("###formItems#####",formItems);
    // const { formItems, onlFormInfos } = this.state;
    // console.log("fieldName",fieldName);
    // console.log("valueEvent",valueEvent);



    // if (fieldName == 'RESPONSIBILITYGROUP' && valueEvent) {
    //   const { formItems } = this.state;
    //   let rules = formItems['sj_itms_customer_service_RESPONSIBILITYCODE'].rules;
    //   rules.forEach(rule => {
    //     if (rule.hasOwnProperty('required')) {
    //       rule.required = valueEvent.record.DESCRIPTION === '1';
    //     }
    //   });
    //   this.setState({ formItems });
    // }
    // if (fieldName == 'ISDISPOSE' && valueEvent) {
    //   const { formItems } = this.state;
    //   const rules = formItems['sj_itms_customer_service_DISPOSEDEPT']?.rules || [];
    //   rules.forEach(rule => {
    //     if (rule.hasOwnProperty('required')) {
    //       rule.required = valueEvent.value == '1';
    //     }
    //   });
    //   this.setState({ formItems });
    // }
    // if (fieldName == 'DISPOSEDEPT' && valueEvent) {
    //   this.entity[mainName][0]['DISPOSEDEPTNAME'] = valueEvent.record.NAME;
    //   // this.entity[mainName][0]['DISPOSECODE'] = valueEvent.record.MANAGERCODE?.split(',')[0];
    //   this.entity[mainName][0]['DISPOSENAME'] = valueEvent.record.MANAGERNAME?.split(',')[0];
    //   this.setFieldsValue(
    //     mainName,
    //     'DISPOSECODE',
    //     valueEvent.record.MANAGERCODE?.split(',')[0],
    //     undefined,
    //     valueEvent.record.MANAGERNAME?.split(',')[0]
    //   );
    // }
    // if (fieldName == 'COMPLETIONTIME' && valueEvent) {
    //   const feedbackTime = this.entity[mainName][0]['FEEDBACKTIME'];
    //   if (feedbackTime) {
    //     this.entity[mainName][0]['DEADLINE'] = moment(feedbackTime)
    //       .add(Number(valueEvent.value), 'hours')
    //       .format('YYYY-MM-DD HH:mm:ss');
    //   }
    // }
    // if (fieldName == 'FEEDBACKTIME' && valueEvent) {
    //   const completionTime = this.entity[mainName][0]['COMPLETIONTIME'];
    //   if (completionTime) {
    //     this.entity[mainName][0]['DEADLINE'] = moment(valueEvent)
    //       .add(Number(completionTime), 'hours')
    //       .format('YYYY-MM-DD HH:mm:ss');
    //   }
    // }
    // if (fieldName == 'CUSTOMERCODE' && valueEvent) {
    //   this.entity[mainName][0]['CUSTOMERCODE'] = valueEvent.value?.split(']')[0].replaceAll('[',"");
    //
    // }
  }
  //重写afterSave方法
  saveAfterItem= (uuidSave) => {
    const {theSelectGoodsDetailDatas}=this.state
    //发请求保存
    let driverCustomerGoodsDetailList=[];
    for (let i = 0; i <theSelectGoodsDetailDatas.length; i++) {
      let tempObj={}
      tempObj.customercode=theSelectGoodsDetailDatas[i].STORECODE
      tempObj.billuuid = uuidSave
      tempObj.productcode= theSelectGoodsDetailDatas[i].ARTICLECODE
      tempObj.productname=theSelectGoodsDetailDatas[i].ARTICLENAME
      tempObj.productposition=theSelectGoodsDetailDatas[i].PICKBIN
      tempObj.productquantity=theSelectGoodsDetailDatas[i].QTY
      tempObj.deliverydate=theSelectGoodsDetailDatas[i].APPLICATIONDATE
      tempObj.productamount=theSelectGoodsDetailDatas[i].AMOUNT
      driverCustomerGoodsDetailList.push(tempObj)
    }
    onSaveGoodsDetailRecord(driverCustomerGoodsDetailList).then(result => {
      if(!(result && result.success)){
        message.error("客服服务工单保存失败！",2)
      }
    })


  };
  //重写save方法

  handleSave = () => {
    const {theSelectGoodsDetailDatas}=this.state
    // 新增保存工单：设置一个uuid
    const uuidSave=uuidv4();
    this.setState({uuidSave:uuidSave})
    this.entity.sj_driver_customer_service[0].UUID=uuidSave
    // //如果是问题反馈还得选一家门店的问题 TODO
    if(theSelectGoodsDetailDatas && theSelectGoodsDetailDatas.length>0){
      this.entity.sj_driver_customer_service[0].CUSTOMERCODE=theSelectGoodsDetailDatas[0].STORECODE
      this.entity.sj_driver_customer_service[0].CUSTOMERNAME=theSelectGoodsDetailDatas[0].STORENAME
    }
    console.log("this.entity",this.entity)
    //保存客服服务信息
    this.onSave()

    //保存货品详情信息
    //保存客服服务处理记录
    this.saveAfterItem(uuidSave)
  }

  //子传父的货品明细数据
  getGoodsDetailDatas = (isModalVisible,selectedRows) => {
    this.setState({isModalVisible:isModalVisible,theSelectGoodsDetailDatas:selectedRows})
    console.log("theSelectGoodsDetailDatas",selectedRows);
  };


  render() {
    const {isModalVisible,theSelectGoodsDetailDatas}= this.state
    return (
      <Layout style={{ backgroundColor: 'white', height: '100%' }}>
        <div style={{ paddingTop: 20 }}>
          <Button
            type="primary"
            style={{ float: 'right', marginLeft: 10, marginRight: 10 }}
            onClick={this.handleSave}
          >
            保存
          </Button>
          <Button
            style={{ float: 'right' }}
            onClick={() => {
              this.props.switchTab('query');
            }}
          >
            返回
          </Button>
        </div>
        {/*这个用的是低代码的配置，还是自己写好一点*/}
        {/*<Content style={{ marginLeft: '4.6%' }}>{this.drawForm()}</Content>*/}
        <Content>
          <Form>
            <div>
              啊达瓦达瓦
            </div>
          </Form>
        </Content>
        <Footer style={{ backgroundColor: 'white' }}>
        </Footer>
        <div style={{ paddingTop: 20 }}>
          <Button
            type="primary"
            style={{ float: 'left' }}
            onClick={() => {
              this.setState({isModalVisible:true})
            }}
          >
            搜索货品
          </Button>
          <Button
            type="danger"
            style={{ float: 'left' }}
            onClick={() => {
              this.setState({theSelectGoodsDetailDatas:[]})
            }}
          >
            清空货品
          </Button>
        </div>
        <Modal
          footer={null}
          onCancel={()=>{this.setState({isModalVisible:false})}}
          visible={isModalVisible}
          width={'80%'}
          bodyStyle={{ height: 'calc(80vh)', overflowY: 'auto' }}
        >
          {/*//判断是责任买单还是少货买单*/}
          {false ?
            <DriverCustomerLessBuy
              quickuuid="sj_driver_customer_lessbuy"
              getGoodsDetailDatas={this.getGoodsDetailDatas}
            />:
            <DriverCustomerDutyBuy
            quickuuid="sj_driver_customer_dutypayment"
            getGoodsDetailDatas={this.getGoodsDetailDatas}
            />
          }
          <DriverCustomerLessBuy
            quickuuid="sj_driver_customer_lessbuy"
            getGoodsDetailDatas={this.getGoodsDetailDatas}
          />
        </Modal>
        <Row type="flex" justify="end">
          <Col span={23}>
            <Card title="货品明细">
              {theSelectGoodsDetailDatas && theSelectGoodsDetailDatas.length > 0 ?
                theSelectGoodsDetailDatas.map(item =>{
                  return <div>
                          <Card type="inner" title={`货品：${item.ARTICLENAME}`} style={{ marginTop: 16 }}>
                            <Row>
                              <Col span={24}>门店：{`[${item.STORECODE}]${item.STORENAME}`}</Col>
                              <Col span={12}>
                                <span >货位：</span>
                                <span>{item.PICKBIN}</span>
                              </Col>
                              <Col span={12}>
                                <span className="">数量：</span>
                                <span>{item.QTY}</span>
                              </Col>
                              <Col span={12}>
                                <span >价格：</span>
                                <span>{item.PRICE}</span>
                              </Col>
                              <Col span={12}>
                                <span>金额：</span>
                                <span>{item.AMOUNT}</span>
                              </Col>
                            </Row>
                          </Card>

                  </div>
                }): <Empty style={{ marginTop: 80 }} image={emptySvg} description="暂无货品明细，请选择货品！" />
              }
            </Card>
          </Col>
        </Row>
      </Layout>
    );
  }
}
