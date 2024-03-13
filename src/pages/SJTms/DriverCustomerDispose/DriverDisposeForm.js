import React, { Component } from 'react';
import { Form, Input, Row, Col, Tooltip, Collapse, Divider, Radio, Switch, Table, Select, Button } from 'antd';
import IconFont from '@/components/IconFont';
import Empty from '@/pages/Component/Form/Empty';
import styles from './DriverCustomerPage.less';
import cargoDetailStyles from './DriverDisposeForm.less';
import { getCargoDetails, getDriverSvcPickupData, getPickDtl } from '@/services/sjitms/DriverCustomerService';
import { drawPrintPage } from './Print';
import print from 'print-js';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent'
const Panel = Collapse.Panel;

@Form.create()
export default class DriverDisposeForm extends Component {
  constructor(props) {
    super(props);
  }
  placeholders = {
    Rejecte: '驳回说明',
    Release: '发布说明',
    Result: '最终结果',
    Dispose: '处理说明',
    formReply: '回复内容'
  };
  processingStatus = {  // 处理状态
    Released: '已发布',
    Disposed: '已处理',
    Rejected: '已驳回',
    Finished: '已完成',
    TimeoutFinished: '超时完成',
    Saved: '保存',
    Rejecte: '驳回',
    Dispose: '处理进度',
    Result: '处理结果',
    CancelFinish: '取消完成'
  };
  state = {
    records: [],
    operation: "",
    //货品明细详情数据
    cargoDetailsList: [],
    cargoCheckObj: {}, //货品选中复选框对象uuid 因为状态不在这 所以用这个对象来判断取货开关  对象{uuid:状态,uuid:状态...}
    printPage: "",
    goodsHandoverRecordList: [] // 货品交接记录
  }
  onResponsibilityChange = data => {
    this.props.form.setFieldsValue({ responsibilityName: data.record.NAME });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.bill !== nextProps.bill) {
      this.setState({ bill: nextProps.bill, records: nextProps.records, operation: nextProps.operation });
    }
  }

  componentDidMount() {
    this.getInitialData() // 获取货品明细数据
  }

  componentDidUpdate(prevProps) {
    // 打开了 并且不是之前的uuid 获取货品明细数据，因为第一次是空所以在componentDidMount钩子也获取一下
    if (this.props.visible && this.props.bill.UUID !== prevProps.bill.UUID)
      this.getInitialData()
  }

  /**加载该条单的初始货品数据*/
  async getInitialData() {
    const { bill, records, operation } = this.props;
    this.setState({ bill: bill, records: records, operation: operation });

    // 如果该条单是问题反馈单 它就没有货品明细数据
    if (bill.ASSISTANCETYPE !== 'PROBLEMFEEDBACK') {
      // 获取货品明细数据
      const response = await getCargoDetails(bill.UUID);
      if (response?.success && response.data) {
        this.setState({
          cargoDetailsList: response?.data,
          cargoCheckObj: response?.data.reduce((acc, item) => {   // 只做展示的货品状态
            acc[item.uuid] = item.istakedelivery;
            return acc}, {})
          // 给后端处理的货品状态// 货品明细数据要初始化 不然没动父组件什么都拿不到
        },()=>this.props.getRequireTakeDeliveryData(Object.entries(this.state.cargoCheckObj).map(([uuid, istakedelivery]) => `${uuid}@${istakedelivery}`)));
      } else this.setState({ cargoDetailsList: [], cargoCheckObj: {} }); // 如果后端返回空对象，则自行处理。

      // 获取货品交接记录
      const goodsHandoverRecord = await getDriverSvcPickupData(bill.UUID);
      if (response.success) {
        this.setState({ goodsHandoverRecordList: goodsHandoverRecord.data || [] });
      }
    }else {
      this.setState({ cargoDetailsList: [], cargoCheckObj: {} })
      this.props.getRequireTakeDeliveryData([])
    }
  }

  /** 改变货品选中状态 */
  onCheck = (uuid, i) => {
    this.setState({ cargoCheckObj: { ...this.state.cargoCheckObj, [uuid]: i } },
      ()=>this.props.getRequireTakeDeliveryData(Object.entries(this.state.cargoCheckObj).map(([uuid, istakedelivery]) => `${uuid}@${istakedelivery}`)))
  }

  onPrint = async (detail) => {
    await this.buildPrintPage(detail);
    print({ printable: 'stkinPrint', type: 'html', targetStyles: ["*"], scanStyles: false });
    this.setState({ printPage: "" });
  }

  buildPrintPage = async (detail) => {
    const response = await getPickDtl(detail.jobid, detail.storecode, detail.pickbin);
    if (response.success) {
      const records = response.data || [];
      const printPage = drawPrintPage(detail, records);
      this.setState({ printPage: printPage });
    }
  };

  render() {
    /** 取货卡片用 */
    const build2Col = (text, value, textSpan = 3, valueSpan = 5) =>
      <>
        <Col span={textSpan}>{text}:</Col>
        <Col span={valueSpan}>{value || '<空>'}</Col>
      </>

    /** 表单查看用 */
    const buildColFormItem = (label, value, colSpan = 8, ItemAttribute = {}) =>
      <Col span={colSpan}>
        <Form.Item label={label} {...ItemAttribute}>
          <Tooltip title={value}>
            {value || <Empty />}
          </Tooltip>
        </Form.Item>
      </Col>

    const {
      bill,
      records,
      operation,
      cargoDetailsList,
      cargoCheckObj,
      printPage,
      goodsHandoverRecordList
    } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (!bill ? <></> :
      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Row gutter={[12, 0]}>
          {buildColFormItem('客户信息', `[${bill.CUSTOMERCODE}]${bill.CUSTOMERNAME}`, 24, { labelCol: { span: 2 }, wrapperCol: { span: 22 } })}
          {buildColFormItem('协助类型', bill.ASSISTANCETYPE_CN)}
          {buildColFormItem('问题类型', bill.PROBLEMTYPE_CN)}
          {buildColFormItem('反馈时间', bill.FEEDBACKTIME)}
          {buildColFormItem('司机信息', `[${bill.DRIVERCODE}]${bill.DRIVERNAME}`)}
          {buildColFormItem('提交次数', bill.SUBMISSIONSNUMBER)}
          {buildColFormItem('反馈来源', bill.FEEDBACKSOURCE)}
          {buildColFormItem('紧急程度', bill.URGENCY)}
          {buildColFormItem('处理时效', bill.PROCESSINGTIMELINESS + '小时')}
          {buildColFormItem('截止时间', bill.DEADLINE)}
          {buildColFormItem('处理部门', bill.DISPOSEDEPT)}
          {buildColFormItem('处理人', bill.DISPOSENAME)}
          {buildColFormItem('处理结果类型', bill.PROCRESTYPE_CN)}
          {buildColFormItem('投诉描述', bill.ASSISTCONTENT, 24, { labelCol: { span: 2 }, wrapperCol: { span: 22 } })}
        </Row>


        {/* 货品明细 */bill.ASSISTANCETYPE !== 'PROBLEMFEEDBACK' && cargoDetailsList.length > 0 &&
          <Collapse
            bordered={false}
            defaultActiveKey={['0']}
            className={styles.collapse}
            expandIcon={({ isActive }) => (
              <div className={styles.titleWrappr}>
                <div className={styles.navTitle}>
                  <span>货品明细</span>
                  <IconFont className={styles.icon} type={isActive ? 'icon-arrow_fold' : 'icon-arrow_unfold'} />
                </div>
              </div>
            )}
          >
            <Panel style={{ border: 0 }}>
              <Row>
                <Table dataSource={cargoDetailsList ?? []}
                       scroll={{ x: true }}
                       pagination={false}           // 去掉翻页组件
                       size={'small'}               // 表格尺寸
                       columns={[
                         {
                           title: '商品', width: 266, dataIndex: 'articlecode', key: 'articlecode',
                           render: (val, { articlename }) => { return <span>{`[${val}]${articlename}`}</span> }
                         },
                         { title: '件数', width: 80, dataIndex: 'qty', key: 'qty' },
                         { title: '价格', width: 80, dataIndex: 'price', key: 'price' },
                         { title: '金额', width: 80, dataIndex: 'amount', key: 'amount' },
                         { title: '商品条码', width: 133, dataIndex: 'articlebarcode', key: 'articlebarcode' },
                         { title: '拣货位', width: 80, dataIndex: 'pickbin', key: 'pickbin' },
                         { title: '是否可退', width: 77, dataIndex: 'isreturnvendor', key: 'isreturnvendor' },
                         {
                           title: '货物交接', width: 255, key: '货物交接', align: 'center',fixed: 'right',
                           render: (_, item) =>
                             <Radio.Group
                               value={this.state.cargoCheckObj[item.uuid] ?? item.istakedelivery ?? 0}  // 用||遇到0会有问题
                               onChange={e => this.onCheck(item.uuid, e.target.value)}
                             >
                               <Radio.Button value={0}>不交接</Radio.Button>
                               <Radio.Button value={1}>司机交货</Radio.Button>
                               <Radio.Button value={2}>司机取货</Radio.Button>
                             </Radio.Group>
                         },
                         {
                           title: '操作', width: 80, key: '操作', align: 'center',fixed: 'right',
                           render: (_, item) => <Button type="default" onClick={() => this.onPrint(item)}>打印</Button>
                         },
                       ]}
                />
              </Row>
            </Panel>
          </Collapse>
        }

        {//货物交接
          bill.ASSISTANCETYPE !== 'PROBLEMFEEDBACK' && goodsHandoverRecordList?.length > 0 &&
          <Collapse
            bordered={false}
            defaultActiveKey={['0']}
            className={styles.collapse}
            expandIcon={({ isActive }) => (
              <div className={styles.titleWrappr}>
                <div className={styles.navTitle}>
                  <span>货物交接记录</span>
                  <IconFont className={styles.icon} type={isActive ? 'icon-arrow_fold' : 'icon-arrow_unfold'} />
                </div>
              </div>
            )}
          >
            <Panel style={{ border: 0 }}>
              <Table dataSource={goodsHandoverRecordList ?? []}
                pagination={false}           // 去掉翻页组件
                size={'small'}               // 表格尺寸
                scroll={{ x: true }}
                columns={[
                  { title: '货物代码', width: 100, dataIndex: 'productcode', key: 'productcode' },
                  { title: '货物名称', width: 200, dataIndex: 'productname', key: 'productname' },
                  { title: '数量', width: 70, dataIndex: 'productquantity', key: 'productquantity' },
                  { title: '金额', width: 70, dataIndex: 'productamount', key: 'productamount' },
                  { title: '交接状态', width: 80, dataIndex: 'type', key: 'type' },
                  {
                    title: '收货人', width: 120, dataIndex: 'takecode', key: 'takecode',
                    render: (val, record) => { return <span>{`[${val}]${record.takename}`}</span> }
                  },
                  {
                    title: '交货人', width: 120, dataIndex: 'receivecode', key: 'receivecode',
                    render: (val, record) => { return <span>{`[${val}]${record.receivename}`}</span> }
                  },
                  { title: '交接时间', width: 150, dataIndex: 'disposetime', key: 'disposetime' },
                ]}
              />
            </Panel>
          </Collapse>
        }


        {
          // 处理记录
          records.length > 0 &&
          <Collapse
            bordered={false}
            defaultActiveKey={['0']}
            className={styles.collapse}
            expandIcon={({ isActive }) => (
              <div className={styles.titleWrappr}>
                <div className={styles.navTitle}>
                  <span>处理记录</span>
                  {isActive ? (
                    <IconFont className={styles.icon} type="icon-arrow_fold" />
                  ) : (
                    <IconFont className={styles.icon} type="icon-arrow_unfold" />
                  )}
                </div>
              </div>
            )}
          >
            <Panel style={{ border: 0 }}>
              {records.map((record, index) => {
                return (
                  <div className={styles.disposeWrapper}>
                    <Divider />
                    <div className={styles.disposeTitle}>
                      {record.creatorname}
                      <span style={{ fontWeight: 'bold' }}>({this.processingStatus[record.type] ?? record.type})</span>
                      <span style={{ float: 'right' }}>{record.created}</span>
                    </div>
                    <div>{record.detail || '<空>'}</div>
                    {index == records.length - 1 ? <Divider /> : <></>}
                  </div>
                );
              })}
            </Panel>
          </Collapse>
        }
        <Row>
          <Col span={12}>
            <Form.Item label="处理结果类型" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              {getFieldDecorator('procResType')(
                <Select placeholder="回复处理结果时必须选择,回复进度时不会保存。" allowClear>
                  {Object.entries(procResTypeMapping).map(([key, value]) =>
                    <Select.Option key={key} value={key}>
                      {value}
                    </Select.Option>
                  )}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="责任人" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              {getFieldDecorator('responsible', { initialValue: bill.PERSONRESPCODE })(
                <SimpleAutoComplete
                  placeholder="请选择责任人"
                  textField="[%CODE%]%NAME%[%DEPARTMENT%]"
                  valueField="CODE"//"%CODE%@@@%NAME%@@@%DEPARTMENT%"    // 取值时工号 名字 部门直接分割@@@
                  duplicate={'CODE'}              // 当valueField不是一个字段的时候加上这个，不加valueField就只会显示一个
                  queryParams={{ tableName: 'sj_itms_employee', 'selects ': ['CODE', 'NAME','DEPARTMENT'] }}
                  searchField="CODE,NAME,DEPARTMENT"
                  showSearch={true}
                  style={{ width: '100%' }}
                  onChange={v=>this.props.form.setFieldsValue({ responsiblePerson: `${v.value}@@@${v.record.NAME}@@@${v.record.DEPARTMENT}` })}
                  autoComplete
                />
              )}
            </Form.Item>
            <Form.Item label="责任人隐藏" style={{ display: 'none'}}>
              {getFieldDecorator('responsiblePerson')(<Input/>)}
            </Form.Item>
          </Col>
        </Row>


        <Form.Item
          label={this.placeholders[operation]}
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 21 }}
        >
          {getFieldDecorator('remark', {
            rules: [{ required: true, message: '请输入' + this.placeholders[operation] }],
            initialValue: operation === 'Result' ? bill.STAFFRESULT : '',
          })(
            <Input.TextArea
              placeholder={'请输入' + this.placeholders[operation]}
              autoSize={{ minRows: 6, maxRows: 10 }}
              style={{ width: '100%' }}
            />
          )}
        </Form.Item>
        <div style={{ display: "none" }}>
          <div id="stkinPrint">{printPage}</div>
        </div>
      </Form>
    );
  }
}


/** 处理结果类型映射 */
const procResTypeMapping = {
  orderCancelled: '已取消买单',
  orderNonCancellable: '无法取消买单',
  replacementGiven: '已给予换货',
  redirectedToStore: '已引导退回门店',
  basketMisplaced: '放错筐',
  leakageOccurred: '漏出',
  pickedUp: '有拣',
  wrongItemDelivered: '出错货'
};