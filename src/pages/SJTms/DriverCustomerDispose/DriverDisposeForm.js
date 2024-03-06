import React, { Component } from 'react';
import { Form, Input, Row, Col, Tooltip, Collapse, Divider, Checkbox, Switch, Table } from 'antd'
import IconFont from '@/components/IconFont';
import Empty from '@/pages/Component/Form/Empty';
import styles from './DriverCustomerPage.less'
import cargoDetailStyles from './DriverDisposeForm.less'
import { getCargoDetails, getDriverSvcPickupData } from '@/services/sjitms/DriverCustomerService'
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
    //货品选中复选框数组uuid
    cargoCheckArr: [],
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
          cargoCheckArr: response?.data?.filter(item => item.istakedelivery === 1)?.map(item => item.uuid)
        });
        // 货品明细数据要初始化 不然没动父组件什么都拿不到
        this.props.getRequireTakeDeliveryData(response?.data?.filter(item => item.istakedelivery === 1)?.map(item => item.uuid))
      } else this.setState({ cargoDetailsList: [], cargoCheckArr: [] }); // 如果后端返回空数组，则自行处理。

      // 获取货品交接记录
      const goodsHandoverRecord = await getDriverSvcPickupData(bill.UUID);
      if (response.success) {
        this.setState({ goodsHandoverRecordList: goodsHandoverRecord.data || [] });
      }
    }
  }

  checkAllCargo = () => {
    //cargoCheckArr:cargoDetailsList的主键uuid集合  ||   cargoDetailsList就是货品详情明细集合
    const { cargoCheckArr, cargoDetailsList } = this.state
    const cargoCheckUUIDs = cargoDetailsList?.map((x) => x.uuid);
    //全选
    if (cargoCheckArr.length !== cargoDetailsList.length) {
      this.setState({ cargoCheckArr: cargoCheckUUIDs })
      this.props.getRequireTakeDeliveryData(cargoCheckUUIDs)
      //取消全选
    } else {
      this.setState({ cargoCheckArr: [] })
      this.props.getRequireTakeDeliveryData([])
    }
  }

  bigCheck = (checked, item) => {
    const { cargoCheckArr } = this.state;
    const uuids = checked ? [...cargoCheckArr, item.uuid] : cargoCheckArr.filter((x) => x !== item.uuid);
    this.setState({ cargoCheckArr: uuids });
    this.props.getRequireTakeDeliveryData(uuids);
  }

  render() {
    /** 取货卡片用 */
    const build2Col = (text, value, textSpan = 2, valueSpan = 4) =>
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
      cargoCheckArr,
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
          {buildColFormItem('投诉描述', bill.ASSISTCONTENT, 24, { labelCol: { span: 2 }, wrapperCol: { span: 22 } })}
        </Row>

        {
          /*处理结果：客服决定司机是否取货某些货品*/
          this.props.operation === "Result" && cargoDetailsList.length > 0 ? (
            <Row type="flex" justify="end">
              <label>
                <span style={{ marginRight: '5px' }}>全部取货</span>
                <Checkbox
                  checked={cargoCheckArr.length === cargoDetailsList.length}
                  onChange={this.checkAllCargo}
                />
              </label>
            </Row>
          ) : <></>
        }
        {/* 货品明细 */}
        <Collapse
          bordered={false}
          defaultActiveKey={['0']}
          className={styles.collapse}
          expandIcon={({ isActive }) => (
            <div className={styles.titleWrappr}>
              <div className={styles.navTitle}>
                <span>货品明细</span>
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
            <Row style={{ display: "flex", flexWrap: "wrap" }}>
              {
                bill.ASSISTANCETYPE !== 'PROBLEMFEEDBACK' && cargoDetailsList.length > 0 ? (
                  cargoDetailsList.map((item) => {
                    return <Col span={12} className={cargoDetailStyles.cargoDetail}
                      onClick={() => this.bigCheck(cargoCheckArr.indexOf(item.uuid) == -1, item)}>
                      <Row>
                        {build2Col('货品', item.productname, 2, 22)}
                        <Divider style={{ margin: '0px' }} />
                        {build2Col('价格', item.productprice)}
                        {build2Col('金额', item.productamount)}
                        {build2Col('货位', item.productposition)}
                        {build2Col('件数', item.productquantity)}
                        <Divider style={{ margin: '0px' }} />
                        <Col span={24}>
                          {
                            /* 取货开关 */
                            item.takecode ? `已取货：[${item.takecode}]${item.takename} 时间：${item.taketime}` :
                              <div>
                                <span style={{ marginRight: '5px' }}>是否取货</span>
                                <Switch
                                  checked={cargoCheckArr.indexOf(item.uuid) != -1}
                                  onChange={(checked) => this.bigCheck(checked, item)}
                                />
                              </div>
                          }
                        </Col>
                      </Row>
                    </Col>
                  })
                ) : <></>
              }
            </Row>
          </Panel>
        </Collapse>
        {
          //货物交接
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
                columns={[
                  { title: '货物代码', width: 100, dataIndex: 'productcode', key: 'productcode' },
                  { title: '货物名称', width: 200, dataIndex: 'productname', key: 'productname' },
                  { title: '数量', width: 70, dataIndex: 'productquantity', key: 'productquantity' },
                  { title: '金额', width: 70, dataIndex: 'productamount', key: 'productamount' },
                  { title: '交接状态', width: 80, dataIndex: 'type', key: 'type' },
                  {
                    title: '收货人', width: 120, dataIndex: 'takecode', key: 'takecode',
                    render: (val, record) => {return <span>{`[${val}]${record.takename}`}</span> }
                  },
                  {
                    title: '交货人', width: 120, dataIndex: 'receivecode', key: 'receivecode',
                    render: (val, record) => {return <span>{`[${val}]${record.receivename}`}</span> }
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
      </Form>
    );
  }
}
