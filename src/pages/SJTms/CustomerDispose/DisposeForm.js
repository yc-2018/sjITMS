import React, { Component } from 'react';
import { Form, Input, Row, Col, Tooltip, Collapse, Divider,DatePicker } from 'antd';
import IconFont from '@/components/IconFont';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import Empty from '@/pages/Component/Form/Empty';
import styles from './DisposePage.less';
import moment from 'moment';
import log from '@/models/common/log';
import Select from '@/components/ExcelImport/Select';
const Panel = Collapse.Panel;

@Form.create()
export default class DisposeForm extends Component {
  placeholders = {
    Release: '发布说明',
    Result: '客服结果',
    Dispose: '处理说明',
  };
  state={
    records:[],
    operation:""
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
  componentDidMount(){
      const { bill, records, operation } = this.props;
      this.setState({bill:bill,records:records,operation:operation});
  }
  render() {
    const formItem = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const { bill, records, operation } = this.state;
    console.log('b',bill?.DEADLINE);
    const { getFieldDecorator } = this.props.form;
    return (
      bill ? <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Row gutter={[12, 0]}>
          <Col span={8}>
            <Form.Item label="客诉单号">
              <Tooltip>{bill.SERVICENUMBER || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item label="客户" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
              <Tooltip title={`[${bill.CUSTOMERCODE}]${bill.CUSTOMERNAME}`}>
                {`[${bill.CUSTOMERCODE}]${bill.CUSTOMERNAME}`}
              </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="客户标签">
              <Tooltip>{bill.CUSTOMERTYPE || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="投诉来源">
              <Tooltip>{bill.FEEDBACKSOURCE || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="投诉时间">
              <Tooltip>{bill.FEEDBACKTIME || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="业务类型1">
              <Tooltip>{bill.SERVICETYPE || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="业务类型2">
              <Tooltip>{bill.BUSINESSTYPE || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="业务类型3">
              <Tooltip>{bill.SPECIFICTYPE || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="紧急程度">
              <Tooltip>{bill.URGENCY || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="完成时效">
              {
               (getFieldDecorator('COMPLETIONTIME', { 
                  rules: [{ required: true, message: '请选择完成时效'},],
                  initialValue: bill.COMPLETIONTIME, getValueFromEvent :(e)=>{
                    const{bill} = this.state;
                    bill.DEADLINE = moment(bill.FEEDBACKTIME)
                     .add(Number(e), 'hours')
                      .format('YYYY-MM-DD HH:mm:ss');
                      this.setState({bill})
                      return e;
                    
                  }})(
                  <SimpleAutoComplete
                    placeholder={'请选择完成时效'}
                    dictCode="completionTime"
                    allowClear
                    noRecord
                  />
                
                ))
              }
             
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="截止时间">
              {
                 (getFieldDecorator('DEADLINE', { 
                  rules: [{ required: true, message: '请填写截止时间'}],
                  initialValue:moment(bill.DEADLINE,'YYYY-MM-DD HH:mm:ss')} )(
                  <DatePicker
                  style={{width:'100%'}}  format="YYYY-MM-DD HH:mm:ss" showTime
                  />
                ))
              }
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="处理部门">
              <Tooltip>{bill.DISPOSEDEPTNAME || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="处理人">
              <Tooltip>{bill.DISPOSENAME || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="投诉描述" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
              <Tooltip>{bill.DETAIL || <Empty />} </Tooltip>
            </Form.Item>
          </Col>
        </Row>
        {/* 处理记录 */}
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
                      {record.createInfo.operator.fullName}
                      <span style={{ fontWeight: 'bold' }}>({record.type})</span>
                      <span style={{ float: 'right' }}>{record.createInfo.time}</span>
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
          label={this.placeholders[operation]}
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 22 }}
        >
          {getFieldDecorator('remark', {
            rules: [{ required: true, message: '请输入' + this.placeholders[operation] }],
            initialValue: operation == 'Result' ? bill.STAFFRESULT : '',
          })(
            <Input.TextArea
              placeholder={'请输入' + this.placeholders[operation]}
              autoSize={{ minRows: 6, maxRows: 10 }}
              style={{ width: '100%' }}
            />
          )}
        </Form.Item>
        {operation == 'Result' ? (
          <Row justify="space-around">
            <Col span={6}>
              <Form.Item label="结果类型" {...formItem}>
                {getFieldDecorator('resultTag', { initialValue: bill.RESULTTAG })(
                  <SimpleAutoComplete
                    placeholder={'请选择结果类型'}
                    dictCode="serviceResultTag"
                    allowClear
                    noRecord
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="责任部门" {...formItem}>
                {getFieldDecorator('responsibilityDept', {
                  rules: [{ required: true, message: '请选择责任部门' }],
                  initialValue: bill.RESPONSIBILITYDEPT,
                })(
                  <SimpleAutoComplete
                    placeholder={'请选择责任部门'}
                    dictCode="serviceDept"
                    allowClear
                    noRecord
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="责任组别" {...formItem}>
                {getFieldDecorator('responsibilityGroup', {
                  initialValue: bill.RESPONSIBILITYGROUP,
                })(
                  <SimpleAutoComplete
                    placeholder={'请选择责任组别'}
                    allowClear
                    dictCode="serviceGroup"
                    noRecord
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="责任人" {...formItem}>
                {getFieldDecorator('responsibilityCode', { initialValue: bill.RESPONSIBILITYCODE })(
                  <SimpleAutoComplete
                    placeholder={'请选择责任人'}
                    allowClear
                    textField="[%CODE%]%NAME%"
                    valueField={'CODE'}
                    queryParams={{
                      tableName: 'SJ_ITMS_EMPLOYEE',
                      selects: ['UUID', 'CODE', 'NAME'],
                      condition: {
                        params: [{ field: 'STATE', rule: 'eq', val: [1] }],
                      },
                    }}
                    searchField="CODE,NAME"
                    autoComplete={true}
                    onChange={this.onResponsibilityChange}
                  />
                )}
              </Form.Item>
              <Form.Item label="责任人名称" {...formItem} style={{ display: 'none' }}>
                {getFieldDecorator('responsibilityName', { initialValue: bill.RESPONSIBILITYNAME })(
                  <Input />
                )}
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <></>
        )}
      </Form>:<></>
    );
  }
}
