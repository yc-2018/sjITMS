import {connect} from 'dva';
import {
    Button, Form, Layout, Card, Row, Col, Modal,
    Empty, message, Select, Radio
} from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import moment from 'moment';
import {loginOrg} from '@/utils/LoginContext';
import React from 'react';
import DriverCustomerLessBuy from '@/pages/SJTms/DriverCustomer/DriverCustomerLessBuy';
import emptySvg from '@/assets/common/img_empoty.svg';
import {getLinkTypeDict, onSaveGoodsDetailRecord} from '@/services/sjitms/DriverCustomerService';
import DriverCustomerDutyBuy from '@/pages/SJTms/DriverCustomer/DriverCustomerDutyBuy';
import TextArea from "antd/lib/input/TextArea";
import RadioGroup from "antd/es/radio/group";
import {SimpleAutoComplete} from "@/pages/Component/RapidDevelopment/CommonComponent";
import getUUID from "@/utils/getUUID";

const {Footer, Content} = Layout;
//联动选择
const {Option} = Select;
@connect(({quick, loading}) => ({
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
//新建：
  //联动数组所需要的两个数组
    //协助类型arr
    assistTypeData:[],
    //协助类型key+问题类型problemType
    assistAndProblemTypeData:[],
    assistanceType: '', // 当前选中的协助类型 用来控制页面的变化
    storeList: [],     // 门店列表
  };


  //表单加载的时候
  formLoaded = () => {
    const { showPageNow } = this.props;
    if (showPageNow == 'create') {
      this.entity.sj_driver_customer_service = [{}]
        //获取联动数组数据
        getLinkTypeDict().then(response =>
          response?.success && this.setState({assistAndProblemTypeData: response.data})
        )
    }
    // 低代码配套里面要设置全部允许空值  因为重写了也看不到那些必填的字段 导致无法校验
  };


  //某个字段发生改变的时候
  exHandleChange = columnEvent => {
  }
  //重写afterSave方法
  saveAfterItem = uuidSave => {
    const {theSelectGoodsDetailDatas} = this.state    // 所选择的货品明细数据

    //发请求保存
    const driverCustomerGoodsDetailList=[];
    // 货物处理（责任买单）和 (少货买单) 字段不一样
    const isCargoHandling = this.state.assistanceType === 'CARGOHANDLING'
    for (let i = 0; i <theSelectGoodsDetailDatas.length; i++) {
      const tempObj={}
      const dtl = theSelectGoodsDetailDatas[i]
      tempObj.billuuid = uuidSave                                           // 主表uuid
      tempObj.customercode=dtl.STORECODE                                    // 门店号码
      tempObj.productcode= isCargoHandling? dtl.SKU:dtl.ARTICLECODE         // 货物代码
      tempObj.productname=isCargoHandling? dtl.DESCR_C: dtl.ARTICLENAME     // 货物名称
      tempObj.productposition=isCargoHandling? dtl.LOCATION:dtl.PICKBIN     // 货位
      tempObj.productquantity=isCargoHandling? dtl.QTY_EACH:dtl.QTY         // 货物数量
      tempObj.deliverydate=isCargoHandling? dtl.ADDTIME:dtl.APPLICATIONDATE // 配送日期
      tempObj.productamount=isCargoHandling? dtl.MONEY:dtl.AMOUNT           // 货物金额
      tempObj.istakedelivery=dtl.ISTAKEDELIVERY??0                          // 是否取货
      tempObj.productprice=dtl.PRICE                                        // 货品价格
      tempObj.customername=dtl.STORENAME                                    // 门店名称
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
    const {theSelectGoodsDetailDatas} = this.state
    if (theSelectGoodsDetailDatas.length === 0 && this.state.assistanceType !== 'PROBLEMFEEDBACK') return message.error('请先选择货物！')

    this.props.form.validateFields((err, values) => {
      if (err) return message.error('请填写完整信息！')    // 如果没填完整，就直接返回

        // 新增保存工单：设置一个uuid
        const uuidSave = getUUID();                                     // 生产一个uuid
        const saveObj = this.entity.sj_driver_customer_service[0]   // 客服服务对象(框架是列表，所以拿到第一个就好了)

        saveObj.UUID = uuidSave                                                   // 客服服务主键
        saveObj.BILLNUMBER = uuidSave                                             // 单号(海鼎
        saveObj.FEEDBACKTIME = moment().format('YYYY-MM-DD HH:mm:ss');     // 反馈时间
        saveObj.WAREHOUSE = loginOrg().uuid;                                      // 仓库
        saveObj.PROCESSINGSTATE = "Saved"                                         // 处理状态（固定就是保存状态）
        saveObj.DRIVERCODE = values['field-driverInfo'].split("@@@")[0]           // 司机编号
        saveObj.DRIVERNAME = values['field-driverInfo'].split("@@@")[1]           // 司机姓名
        saveObj.ASSISTANCETYPE = values['field-assistanceType']                   // 协助类型
        saveObj.PROBLEMTYPE = values['field-problemType']                         // 问题类型
        saveObj.ASSISTCONTENT = values['field-assistanceContent']                 // 协助内容

        if (theSelectGoodsDetailDatas?.length > 0) {                        // 所选择的货品明细数据 > 0
            saveObj.CUSTOMERCODE = theSelectGoodsDetailDatas[0].STORECODE   // 客户(门店)编号
            saveObj.CUSTOMERNAME = theSelectGoodsDetailDatas[0].STORENAME   // 客户(门店)名称
        }
        //通过框架 保存客服服务信息this.entity[tableName]
        this.onSave()

        //不是问题反馈   ==>  保存货品详情信息   保存客服服务处理记录
        this.state.assistanceType !== 'PROBLEMFEEDBACK' && this.saveAfterItem(uuidSave)
    });
  }

    //子传父的货品明细数据
  getGoodsDetailDatas = (isModalVisible,selectedRows) => {
        this.setState({isModalVisible: isModalVisible, theSelectGoodsDetailDatas: selectedRows})
    };

    //表单
  getFormFields = () => {
    const {assistTypeData, assistAndProblemTypeData} = this.state;
    const {getFieldDecorator} = this.props.form;
    const children = [];
    children.push(
      <Col span={8}>
        <Form.Item label={`司机信息`}>
          {getFieldDecorator(`field-driverInfo`,
              {rules: [{required: true, message: '请选择司机'}]})
          (
              <SimpleAutoComplete
                  placeholder="请选择司机"
                  textField="[%CODE%]%NAME%"
                  valueField="%CODE%@@@%NAME%"    // 取值时工号和名字直接分割@@@
                  queryParams={{tableName: "sj_itms_employee", "selects ": ["CODE", "NAME"]}}
                  searchField="CODE,NAME"
                  showSearch={true}
                  style={{width: '100%'}}
                  noRecord
                  autoComplete
              />
          )
          }
        </Form.Item>
      </Col>,
      <Col span={8}>
      <Form.Item label={`协助类型`}>
          {getFieldDecorator(`field-assistanceType`, {rules: [{required: true, message: '请选择协助类型'}]})
          (
                    <Select
                        value={this.state.assistanceType} // 在表单里面是不会生效的
                        onChange={v => {
                            this.setState({assistanceType: v, theSelectGoodsDetailDatas: []}) // 赋值 顺便 子表数据清空
                            this.props.form.setFieldsValue({'field-problemType': undefined})
                        }}
                    >
                        {assistAndProblemTypeData?.filter(item => !item.PRCODE)?.map(province => (
                            <Option key={province.CODE} value={province.CODE}>{province.NAME}</Option>
                        ))}
                    </Select>
                )
                }
            </Form.Item>
        </Col>,
        <Col span={8}>
            <Form.Item label={`问题类型`}>
                {getFieldDecorator(`field-problemType`, {rules: [{required: true, message: '请选择司机'}]})
                (
                    <Select>
                        {assistAndProblemTypeData?.filter(item => item.PRCODE === this.state.assistanceType)?.map(province => (
                            <Option key={province.CODE} value={province.CODE}>{province.NAME}</Option>
                        ))}
                    </Select>
                )}
            </Form.Item>
        </Col>,
        <Col span={8}>
            <Form.Item label={`协助内容`}>
                {getFieldDecorator(`field-assistanceContent`, {
                    rules: [{
                        required: true,
                        message: '请输入协助内容'
                    }]
                })
                (<TextArea placeholder={'请输入需要协助的问题描述(200字以内)'} rows={3}/>)}
            </Form.Item>
        </Col>,
        /* 类型是监控复查的话就显示 */
        <>{this.state.assistanceType === 'REVIEWMONITORING' && (
            <Col span={8}>
                <Form.Item label="是否录制监控">
                    {getFieldDecorator('field-recordMonitoring', {
                        rules: [{required: true, message: '请选择是否录制监控'}],
                        initialValue: 0, // 这里设置默认值为“否”
                    })(
                        <RadioGroup>
                            <Radio value={0}>否</Radio>
                            <Radio value={1}>是</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>
            </Col>
        )}</>,
        <>{this.state.assistanceType === 'PROBLEMFEEDBACK' && (   // === "问题反馈" => 要自己写门店信息
          <Col span={8}>
            <Form.Item label="门店">
              {getFieldDecorator('field-store', {
                  rules: [{required: true, message: '请选门店'}],
              })(
                <SimpleAutoComplete
                  placeholder="请选择门店"
                  textField="[%CODE%]%NAME%"
                  valueField="%CODE%@@@%NAME%"
                  queryParams={{tableName: "sj_itms_ship_address", "selects ": ["CODE", "NAME"]}}
                  searchField="CODE,NAME"
                  showSearch={true}
                  style={{width: '100%'}}
                  noRecord
                  autoComplete
                  onChange={v => {
                    this.entity.sj_driver_customer_service[0].CUSTOMERCODE = v.split('@@@')[0]
                    this.entity.sj_driver_customer_service[0].CUSTOMERNAME = v.split('@@@')[1]
                  }}
                />
              )}
                </Form.Item>
            </Col>
        )}</>
    );

        return children;
    }

    /** 生成货品明细头部
     * @param item {object} 对象
     * @param index {number} 这个对象在列表的位置的索引
     * */
    buildGoodsDetailTable = (item,index) =>
        <>
            <span>货品：{this.state.assistanceType === 'CARGOHANDLING' ? item.DESCR_C : item.ARTICLENAME}</span>
            <span style={{float: 'right'}}>是否取货：&nbsp;
              <Radio.Group defaultValue={0}
                           onChange={v=>this.setState(prevState => ({
                             theSelectGoodsDetailDatas: prevState.theSelectGoodsDetailDatas.map((item, i) => {
                               // 检查是否是第当前对象  是的话，添加属性
                               if (i === index) return { ...item, ISTAKEDELIVERY: v.target.value };
                               return item;  // 对于其他对象，不做修改直接返回
                             })
                           }))}
              >
                <Radio value={0}>不取货</Radio>
                <Radio value={1}>取货</Radio>
              </Radio.Group>
            </span>
        </>

  render() {
    const {isModalVisible,theSelectGoodsDetailDatas}= this.state
    return (
      <Layout style={{ backgroundColor: 'white', height: '100%' }}>
        <div style={{ paddingTop: 20 }}>

          <Button type="primary"
                  style={{ float: 'right', marginLeft: 10, marginRight: 10 }}
                  onClick={this.handleSave}>
            保存
          </Button>

          <Button style={{ float: 'right' }}
                  onClick={() => this.props.switchTab('query')}>
            返回
          </Button>
        </div>
        {/*这个用的是低代码的配置，还是自己写好一点*/}
        {/*<Content style={{ marginLeft: '4.6%' }}>{this.drawForm()}</Content>*/}
        <Content style={{margin:25}}>
          <Form>
            <Row gutter={24}>{this.getFormFields()}</Row>
        </Form>
    </Content>
    <Footer style={{backgroundColor: 'white'}}>
    </Footer>

    {/* 下面的货品选择框显示 */}
    {['REVIEWMONITORING', 'STAMPOFF', 'CARGOHANDLING'].includes(this.state.assistanceType) && <>
      <div>
          <Button type="primary"
                  style={{margin:'0 20px'}}
                  onClick={() => this.setState({isModalVisible: true})}>
            搜索货品
        </Button>

          <Button type="danger"
                  onClick={() => this.setState({theSelectGoodsDetailDatas: []})}>
            清空货品
          </Button>
      </div>

        <Modal
          footer={null}
          onCancel={() => {
              this.setState({isModalVisible: false})
          }}
          visible={isModalVisible}
          width={'80%'}
          bodyStyle={{height: 'calc(80vh)', overflowY: 'auto'}}
        >
          {/*判断是责任买单还是少货买单*/}
          {this.state.assistanceType === 'REVIEWMONITORING' || this.state.assistanceType === 'STAMPOFF' ? /* 复查监控和盖章取消：少货买单 */
            <DriverCustomerLessBuy
              quickuuid="sj_driver_customer_lessbuy"
              getGoodsDetailDatas={this.getGoodsDetailDatas}
            /> : this.state.assistanceType === 'CARGOHANDLING' ?     /* 货物处理:责任买单 */
            <DriverCustomerDutyBuy
              quickuuid="sj_driver_customer_dutypayment"
              getGoodsDetailDatas={this.getGoodsDetailDatas}
            /> : <></>
          }
        </Modal>
        <Row style={{margin:20}}>
          <Col span={23}>
            <Card title="货品明细">
              {theSelectGoodsDetailDatas?.length > 0 ?
                theSelectGoodsDetailDatas.map((item,index) => {
                  return <div>
                    <Card type="inner"
                          title={this.buildGoodsDetailTable(item,index)}
                          style={{marginTop: 16}}>
                            <Row>
                              <Col span={24}>门店：{`[${item.STORECODE}]${item.STORENAME}`}</Col>
                              <Col span={12}>
                                <span>货位：</span>
                                <span>{this.state.assistanceType === 'CARGOHANDLING' ? item.LOCATION : item.PICKBIN}</span>
                              </Col>
                              <Col span={12}>
                                <span className="">数量：</span>
                                <span>{this.state.assistanceType === 'CARGOHANDLING' ? item.QTY_EACH : item.QTY}</span>
                              </Col>
                              <Col span={12}>
                                <span>价格：</span>
                                <span>{item.PRICE}</span>
                              </Col>
                              <Col span={12}>
                                <span>金额：</span>
                                <span>{this.state.assistanceType === 'CARGOHANDLING' ? item.MONEY : item.AMOUNT}</span>
                              </Col>
                            </Row>
                          </Card>

                        </div>
                      }) : <Empty style={{marginTop: 80}} image={emptySvg}
                                  description="暂无货品明细，请选择货品！"/>
                    }
                  </Card>
                </Col>
              </Row>
          </>}


      </Layout>
    );
  }
}
