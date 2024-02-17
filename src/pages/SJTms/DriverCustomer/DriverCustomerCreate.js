/*
* @Description: 司机服务新建页面
* @authors: xuqifeng ChenGuangLong
* @注意：低代码配置里面要设置全部允许空值  因为重写了也看不到那些必填的字段 会导致无法校验
*/


import {connect} from 'dva';
import { Button, Form, Layout, Row, Col, Modal, message, Select, Radio, Table
} from 'antd'
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import moment from 'moment';
import {loginOrg} from '@/utils/LoginContext';
import React from 'react';
import DriverCustomerLessBuy from '@/pages/SJTms/DriverCustomer/DriverCustomerLessBuy';
import { getBillNo, getLinkTypeDict, onSaveGoodsDetailRecord } from '@/services/sjitms/DriverCustomerService'
import DriverCustomerDutyBuy from '@/pages/SJTms/DriverCustomer/DriverCustomerDutyBuy';
import TextArea from "antd/lib/input/TextArea";
import RadioGroup from "antd/es/radio/group";
import {SimpleAutoComplete} from "@/pages/Component/RapidDevelopment/CommonComponent";
import getUUID from "@/utils/getUUID";

const {Footer, Content} = Layout;
const {Option} = Select;

@connect(({quick, loading}) => ({
    quick,
    loading: loading.models.quick,
}))
@Form.create()
export default class DriverCustomerCreate extends QuickCreatePage {
  state = {
    ...this.state,                  // QuickCreatePage的state
    isModalVisible:false,           // 货物搜索打开开关
    theSelectGoodsDetailDatas:[],   // 所选择的货品明细数据
    assistAndProblemTypeData:[],    // 协助类型key+问题类型problemType
    assistanceType: '',             // 当前选中的协助类型 用来控制页面的变化
  };


  //表单加载的时候
  formLoaded = () => {
    const { showPageNow } = this.props;
    if (showPageNow === 'create') {
      this.entity.sj_driver_customer_service = [{}]     // 初始化>>>通过框架提交到数据库<<<的数据
        //获取联动数组数据
        getLinkTypeDict().then(response =>
          response?.success && this.setState({assistAndProblemTypeData: response.data})
        )
    }
  };


  //重写afterSave方法
  saveAfterItem = uuidSave => {
    const { theSelectGoodsDetailDatas } = this.state    // 所选择的货品明细数据

    //发请求保存
    const driverCustomerGoodsDetailList = []
    // 货物处理（责任买单）和 (少货买单) 字段不一样
    const isCargoHandling = this.state.assistanceType === 'CARGOHANDLING'
    for (let i = 0; i < theSelectGoodsDetailDatas.length; i++) {
      const tempObj = {}
      const dtl = theSelectGoodsDetailDatas[i]
      tempObj.billuuid = uuidSave                                                // 主表uuid
      tempObj.customercode = dtl.STORECODE                                       // 门店号码
      tempObj.productcode = isCargoHandling ? dtl.SKU : dtl.ARTICLECODE          // 货物代码
      tempObj.productname = isCargoHandling ? dtl.DESCR_C : dtl.ARTICLENAME      // 货物名称
      tempObj.productposition = isCargoHandling ? dtl.LOCATION : dtl.PICKBIN     // 货位
      tempObj.productquantity = isCargoHandling ? dtl.QTY_EACH : dtl.QTY         // 货物数量
      tempObj.deliverydate = isCargoHandling ? dtl.ADDTIME : dtl.APPLICATIONDATE // 配送日期
      tempObj.productamount = isCargoHandling ? dtl.MONEY : dtl.AMOUNT           // 货物金额
      tempObj.istakedelivery = dtl.ISTAKEDELIVERY ?? 0                           // 是否取货
      tempObj.productprice = dtl.PRICE                                           // 货品价格
      tempObj.customername = dtl.STORENAME                                       // 门店名称
      driverCustomerGoodsDetailList.push(tempObj)
    }
    onSaveGoodsDetailRecord(driverCustomerGoodsDetailList).then(result => {
      if (!(result && result.success)) {
        message.error('客服服务工单保存失败！', 2)
      }
    })
  }

  /** 重写save方法 => 保存保存司机客服服务信息和调用保存货品明细 */
  handleSave = () => {
    const { theSelectGoodsDetailDatas,assistAndProblemTypeData } = this.state

    this.props.form.validateFields(async (err, values) => {
      if (err) return message.error('请填写完整信息！')    // 如果没填完整，就直接返回
      if (theSelectGoodsDetailDatas.length === 0 && this.state.assistanceType !== 'PROBLEMFEEDBACK') return message.error('请先选择货物！')

      // 向后端获取单号
      const billNo = await getBillNo(loginOrg().code)
      if (!billNo?.success) return message.error('单号生成失败！请重试')

      const saveObj = this.entity.sj_driver_customer_service[0]   // 客服服务对象(框架是列表，所以拿到第一个就好了)

      saveObj.UUID = getUUID()                                                  // 客服服务主键
      saveObj.BILLNUMBER = billNo.data                                          // 单号(海鼎
      saveObj.FEEDBACKTIME = moment().format('YYYY-MM-DD HH:mm:ss')      // 反馈时间
      saveObj.WAREHOUSE = loginOrg().uuid                                       // 仓库
      saveObj.WAREHOUSENAME = loginOrg().name                                   // 仓库名称
      saveObj.PROCESSINGSTATE = 'Saved'                                         // 处理状态（固定就是保存状态）
      saveObj.DRIVERCODE = values['field-driverInfo'].split('@@@')[0]           // 司机编号
      saveObj.DRIVERNAME = values['field-driverInfo'].split('@@@')[1]           // 司机姓名
      saveObj.ASSISTANCETYPE = values['field-assistanceType']                   // 协助类型
      saveObj.PROBLEMTYPE = values['field-problemType']                         // 问题类型
      saveObj.ASSISTCONTENT = values['field-assistanceContent']                 // 协助内容
      saveObj.ISRECORDEMONITOR = values['field-recordMonitoring']               // 复查监控（复查监控专属）
      saveObj.PROCESSINGTIMELINESS =                                            // 处理时效（小时）
        assistAndProblemTypeData.find(item => item.CODE === saveObj.PROBLEMTYPE).TIMELINESS
      saveObj.DEADLINE = getFormattedTime(saveObj.PROCESSINGTIMELINESS)         // 处理截止时效

      if (theSelectGoodsDetailDatas?.length > 0) {                        // 所选择的货品明细数据 > 0
        saveObj.CUSTOMERCODE = theSelectGoodsDetailDatas[0].STORECODE    // 客户(门店)编号
        saveObj.CUSTOMERNAME = theSelectGoodsDetailDatas[0].STORENAME   // 客户(门店)名称
      }
      //通过框架 保存司机客服服务信息this.entity[tableName]
      this.onSave()

      //不是问题反馈   就执行==>  保存货品详情信息   保存客服服务处理记录
      this.state.assistanceType !== 'PROBLEMFEEDBACK' && this.saveAfterItem(saveObj.UUID)
    })
  }

  //子传父的货品明细数据
  getGoodsDetailDatas = (isModalVisible,selectedRows) => {
    this.setState({ isModalVisible: isModalVisible, theSelectGoodsDetailDatas: selectedRows })
  };

  //表单
  getFormFields = () => {
    const { assistAndProblemTypeData } = this.state
    const { getFieldDecorator } = this.props.form
    const children = []
    children.push(
      <Col span={8}>
        <Form.Item label={`司机信息`}>
          {getFieldDecorator(`field-driverInfo`,
            { rules: [{ required: true, message: '请选择司机' }] })
          (
            <SimpleAutoComplete
              placeholder="请选择司机"
              textField="[%CODE%]%NAME%"
              valueField="%CODE%@@@%NAME%"    // 取值时工号和名字直接分割@@@
              queryParams={{ tableName: 'sj_itms_employee', 'selects ': ['CODE', 'NAME'] }}
              searchField="CODE,NAME"
              showSearch={true}
              style={{ width: '100%' }}
              noRecord
              autoComplete
            />
          )}
        </Form.Item>
      </Col>,
      <Col span={8}>
        <Form.Item label={`协助类型`}>
          {getFieldDecorator(`field-assistanceType`, { rules: [{ required: true, message: '请选择协助类型' }] })
          (
            <Select
              value={this.state.assistanceType} // 在表单里面是不会生效的
              onChange={v => {
                this.setState({ assistanceType: v, theSelectGoodsDetailDatas: [] }) // 赋值 顺便 子表数据清空
                this.props.form.setFieldsValue({ 'field-problemType': undefined })
              }}
            >
              {assistAndProblemTypeData?.filter(item => !item.PRCODE)?.map(province => (
                <Option key={province.CODE} value={province.CODE}>{province.NAME}</Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </Col>,
      <Col span={8}>
        <Form.Item label={`问题类型`}>
          {getFieldDecorator(`field-problemType`, { rules: [{ required: true, message: '请选择司机' }] })
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
          {getFieldDecorator(`field-assistanceContent`, { rules: [{ required: true, message: '请输入协助内容' }] })
          (<TextArea placeholder={'请输入需要协助的问题描述(200字以内)'} rows={3}/>)}
        </Form.Item>
      </Col>,
      /* 类型是监控复查的话就显示 */
      <>{this.state.assistanceType === 'REVIEWMONITORING' && (
        <Col span={8}>
          <Form.Item label="是否录制监控">
            {getFieldDecorator('field-recordMonitoring', {
              rules: [{ required: true, message: '请选择是否录制监控' }],
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
              rules: [{ required: true, message: '请选门店' }],
            })(
              <SimpleAutoComplete
                placeholder="请选择门店"
                textField="[%CODE%]%NAME%"
                valueField="%CODE%@@@%NAME%"
                queryParams={{ tableName: 'sj_itms_ship_address', 'selects ': ['CODE', 'NAME'] }}
                searchField="CODE,NAME"
                showSearch={true}
                style={{ width: '100%' }}
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
    )

    return children
  }
  whetherToPickUpTheGoods = index =>
    <Radio.Group defaultValue={0}
                 onChange={v => this.setState(prevState => ({
                   theSelectGoodsDetailDatas: prevState.theSelectGoodsDetailDatas.map((item, i) => {
                     // 检查是否是第当前对象  是的话，添加属性
                     if (i === index) return { ...item, ISTAKEDELIVERY: v.target.value }
                     return item  // 对于其他对象，不做修改直接返回
                   })
                 }))}
    >
      <Radio value={0}>不取货</Radio>
      <Radio value={1}>取货</Radio>
    </Radio.Group>

  render () {
    const { isModalVisible, theSelectGoodsDetailDatas } = this.state
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
        <Content style={{ margin: 25 }}>
          <Form>
            <Row gutter={24}>{this.getFormFields()}</Row>
          </Form>
        </Content>
        <Footer style={{ backgroundColor: 'white' }}>
        </Footer>

        {/* 下面的货品选择框显示 */}
        {['REVIEWMONITORING', 'STAMPOFF', 'CARGOHANDLING'].includes(this.state.assistanceType) && <>
          <div>
            <Button type="primary"
                    style={{ margin: '0 20px' }}
                    onClick={() => this.setState({ isModalVisible: true })}>
              搜索货品
            </Button>

            <Button type="danger"
                    onClick={() => this.setState({ theSelectGoodsDetailDatas: [] })}>
              清空货品
            </Button>
            <span style={{ marginLeft: '34%', fontSize: 'large', fontWeight: 800 }} className={'ant-form-item-required'}>
              {this.state.assistanceType === 'CARGOHANDLING' ?'责任买单':'少货买单'}货品明细
            </span>
          </div>

          <Modal
            footer={null}
            onCancel={() => {
              this.setState({ isModalVisible: false })
            }}
            visible={isModalVisible}
            width={'80%'}
            bodyStyle={{ height: 'calc(80vh)', overflowY: 'auto' }}
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

          <Table dataSource={theSelectGoodsDetailDatas.map(item => ({...item, store: item.STORECODE + ' ' + item.STORENAME}))}
                 scroll={{ x: true }} style={{margin: '0 20px'}}
                 pagination={false} // 隐藏分页并显示所有数据
                 columns={[
                   { title: '货品', dataIndex: this.state.assistanceType === 'CARGOHANDLING' ? 'DESCR_C' : 'ARTICLENAME', key: '1' },
                   { title: '门店', dataIndex: 'store', width: 350, key: '2' },
                   { title: '数量', dataIndex: this.state.assistanceType === 'CARGOHANDLING' ? 'QTY_EACH' : 'QTY', key: '3' },
                   { title: '价位', dataIndex: this.state.assistanceType === 'CARGOHANDLING' ? 'LOCATION' : 'PICKBIN', key: '4' },
                   { title: '价格', dataIndex: 'PRICE', key: '5' },
                   { title: '金额', dataIndex: this.state.assistanceType === 'CARGOHANDLING' ? 'MONEY' : 'AMOUNT', key: '6' },
                   { title: '是否取货', render:(_text, _record, index)=>this.whetherToPickUpTheGoods(index) }]}
          /></>}
      </Layout>
    );
  }
}






/** 获取格式化时间
 * @param hoursToAdd 加上的小时数
 * @author chenGuangLong
 * @since 2024-02-07 17:36:00
 * @return string 格式化的时间
 */
function getFormattedTime (hoursToAdd = 0) {
  const date = new Date() // 获取当前日期和时间
  date.setHours(date.getHours() + hoursToAdd) // 在当前时间上增加指定的小时数
  // 定义格式化时间的函数
  const formatTime = date => {
    const pad = num => (num < 10 ? '0' + num : num)
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1) // 月份从0开始，所以加1
    const day = pad(date.getDate())
    const hour = pad(date.getHours())
    const minute = pad(date.getMinutes())
    const second = pad(date.getSeconds())
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
  return formatTime(date) // 返回格式化的时间字符串
}
