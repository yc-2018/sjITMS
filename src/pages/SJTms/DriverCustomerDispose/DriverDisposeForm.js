import React, { Component } from 'react';
import { Form, Input, Row, Col, Tooltip, Collapse, Divider,DatePicker } from 'antd';
import IconFont from '@/components/IconFont';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import Empty from '@/pages/Component/Form/Empty';
// import styles from './DisposePage.less';
import styles from'./DriverCustomerPage.less'
import moment from 'moment';
import log from '@/models/common/log';
import Select from '@/components/ExcelImport/Select';
const Panel = Collapse.Panel;

@Form.create()
export default class DriverDisposeForm extends Component {
  placeholders = {
    Rejected: '驳回说明',
    Release: '发布说明',
    Result: '最终结果',
    Dispose: '处理说明',
  };
  state={
    records:[],
    operation:"",
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
    const { bill, records, operation } = this.props;
    this.setState({bill:bill,records:records,operation:operation});
  }
  render() {
    const formItem = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const { bill, records, operation,typeDictArr} = this.state;

    const { getFieldDecorator } = this.props.form;

    console.log('records',records);
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
          label={this.placeholders[operation]}
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
