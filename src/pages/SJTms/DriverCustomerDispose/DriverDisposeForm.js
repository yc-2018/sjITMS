import React, { Component } from 'react';
import { Form, Input, Row, Col, Tooltip, Collapse, Divider,DatePicker,Card,Checkbox } from 'antd';
import IconFont from '@/components/IconFont';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import Empty from '@/pages/Component/Form/Empty';
// import styles from './DisposePage.less';
import styles from'./DriverCustomerPage.less'
import cargoDetailStyles from './DriverDisposeForm.less'
import moment from 'moment';
import log from '@/models/common/log';
import Select from '@/components/ExcelImport/Select';
import { getCargoDetails } from '@/services/sjitms/DriverCustomerService';
import { length } from 'localforage';
const Panel = Collapse.Panel;

@Form.create()
export default class DriverDisposeForm extends Component {
  constructor(props) {
    super(props);
  }
  placeholders = {
    Rejected: '驳回说明',
    Release: '发布说明',
    Result: '最终结果',
    Dispose: '处理说明',
  };
  state={
    records:[],
    operation:"",
    //货品明细详情数据
    cargoDetailsList:[],
    //货品选中复选框数组uuid
    cargoCheckArr: [],
  }
  onResponsibilityChange = data => {
    this.props.form.setFieldsValue({ responsibilityName: data.record.NAME });
  };

  componentWillReceiveProps(nextProps){
    if(this.props.bill !== nextProps.bill){
      this.setState({bill:nextProps.bill,records:nextProps.records,operation:nextProps.operation});
    }
  }
  componentWillUnmount (){
    this.setState = (state,callback)=>{
      return;
    };
  }


  componentDidMount() {
    this.getInitialData()
  }
  componentDidUpdate(prevProps) {
    // 打开了 并且不是之前的uuid 获取货品明细数据，因为第一是空所以在componentDidMount钩子也获取一下
    if (this.props.visible && this.props.bill.UUID !== prevProps.bill.UUID)
      this.getInitialData()
  }

  /**加载该条单的初始数据*/
  async getInitialData() {
    const { bill, records, operation } = this.props;
    this.setState({ bill: bill, records: records, operation: operation });

    if (operation === 'Result') {
      const response = await getCargoDetails(bill.UUID);
      if (response?.success && response.data) {
        this.setState({
          cargoDetailsList: response?.data,
          cargoCheckArr: response?.data?.filter(item => item.istakedelivery === 1)?.map(item => item.uuid)
        });
      } else {
        this.setState({ cargoDetailsList: [], cargoCheckArr: [] }); // 如果后端返回空数组，则自行处理。
      }
    }
  }




  //
  checkAllCargo= () => {
    //cargoCheckArr:cargoDetailsList的主键uuid集合  ||   cargoDetailsList就是货品详情明细集合
     const {cargoCheckArr,cargoDetailsList}=this.state
      const cargoCheckUUIDs = cargoDetailsList?.map((x) => x.uuid);
    //全选
    if (cargoCheckArr.length !== cargoDetailsList.length) {
      this.setState({ cargoCheckArr: cargoCheckUUIDs })
      this.props.getRequireTakeDeliveryData(cargoCheckUUIDs)
      //取消全选
    }else {
      this.setState({ cargoCheckArr: [] })
      this.props.getRequireTakeDeliveryData([])
    }
  }


  render() {
    const formItem = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const { bill, records, operation,typeDictArr,cargoDetailsList,cargoCheckArr} = this.state;
    const { getFieldDecorator } = this.props.form;
    return (

      bill ? <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Row gutter={[12, 0]}>
          <Col span={24}>
            <Form.Item label="客户信息" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
              <Tooltip title={`[${bill.CUSTOMERCODE}]${bill.CUSTOMERNAME}`}>
                {`[${bill.CUSTOMERCODE}]${bill.CUSTOMERNAME}`}
              </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="协助类型">
              <Tooltip>{bill.ASSISTANCETYPE_CN  || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="问题类型">
              <Tooltip>{bill.PROBLEMTYPE_CN || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="反馈时间">
              <Tooltip>{bill.FEEDBACKTIME || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="司机信息">
              <Tooltip>{`[${bill.DRIVERCODE}]${bill.DRIVERNAME}`}  </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="提交次数">
              <Tooltip>{bill.SUBMISSIONSNUMBER || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="反馈来源">
              <Tooltip>{bill.FEEDBACKSOURCE || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="紧急程度">
              <Tooltip>{bill.URGENCY || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="处理时效">
              <Tooltip>{bill.PROCESSINGTIMELINESS+'小时' || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="截止时间">
              <Tooltip>{bill.DEADLINE || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="处理部门">
              <Tooltip>{bill.DISPOSEDEPT || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="处理人">
              <Tooltip>{bill.DISPOSENAME || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="投诉描述" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
              <Tooltip>{bill.ASSISTCONTENT || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
        </Row>

        {/*处理结果：客服决定司机是否取货某些货品*/}
        {
          this.props.operation === "Result" && cargoDetailsList.length > 0 ? (
            <Row type="flex" justify="end">
              <Checkbox
                // indeterminate={this.state.indeterminate}
                checked={cargoCheckArr.length === cargoDetailsList.length}
                onChange={this.checkAllCargo}
              >
                全选
              </Checkbox>
            </Row>
          ) : <></>
        }
        <Row style={{display:"flex",flexWrap:"wrap"}}>
        {
          this.props.operation==="Result" && cargoDetailsList.length > 0?(
            cargoDetailsList.map((item)=>{
                return   <Col span={6}>
                  {/*<Card title={item.productname} bordered={true} className={cargoDetailStyles.antCardBody}>*/}
                  <label>
                    <div className={cargoDetailStyles.cargoDetail} onClick={this.bigCheck}>
                      <Row>
                        <Col span={4}>货品:</Col>
                        <Col span={18}>{item.productname}</Col>
                        <Col span={2}>
                          <Checkbox
                            checked={cargoCheckArr.indexOf(item.uuid) > -1}
                            onChange={(e) => {
                              const uuids = e.target.checked ? [...cargoCheckArr, item.uuid] : cargoCheckArr.filter((x) => x !== item.uuid);
                              this.setState({ cargoCheckArr: uuids });
                              this.props.getRequireTakeDeliveryData(uuids);
                            }}
                            iconSize='10px'
                          />
                        </Col>
                      </Row>
                      <Divider style={{ margin: '0px' }} />
                      <Row>
                        <Col span={3}>价格:</Col>
                        <Col span={9}>{item.productprice || '<空>'}</Col>
                        <Col span={3}>金额:</Col>
                        <Col span={9}>{item.productamount || '<空>'}</Col>
                      </Row>
                      <Row>
                        <Col span={3}>货位:</Col>
                        <Col span={9}>{item.productposition || '<空>'}</Col>
                        <Col span={3}>件数:</Col>
                        <Col span={9}>{item.productquantity || '<空>'}</Col>
                      </Row>

                    </div>
                  </label>
                  {/*</Card>*/}
                </Col>
            })



          ):<></>
        }
        </Row>
         {/*处理记录*/}
        {records.length > 0 ? (
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
                      <span style={{ fontWeight: 'bold' }}>({record.type})</span>
                      <span style={{ float: 'right' }}>{record.created}</span>
                    </div>
                    <div>{record.detail || '<空>'}</div>
                    {index == records.length - 1 ? <Divider /> : <></>}
                  </div>
                );
              })}
            </Panel>
          </Collapse>
        ) : (
          <></>
        )}
        <Form.Item
          label={this.placeholders.operation}
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 22 }}
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
      </Form>:<></>
    );
  }
}
