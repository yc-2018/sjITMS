/*
 * @Author: guankongjin
 * @Date: 2023-01-10 10:48:50
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-01-11 16:44:20
 * @Description: 工单处理
 * @FilePath: \iwms-web\src\pages\SJTms\CustomerDispose\DisposePage.js
 */
import React, { Component } from 'react';
import { Button, Form, Modal, Input, Row, Col, Tooltip, Collapse, message } from 'antd';
import IconFont from '@/components/IconFont';
import { getRecords, release, dispose, saveResult } from '@/services/sjitms/Customer';
import Empty from '@/pages/Component/Form/Empty';
import styles from './DisposePage.less';
const Panel = Collapse.Panel;

export default class DisposePageModal extends Component {
  state = { visible: false, bill: {}, records: [], saving: false, remark: '', validate: true };
  modeTxt = {
    Rejected: '驳回',
    Dispose: '处理进度',
    Disposed: '处理结果',
  };
  placeholders = {
    Release: '发布说明',
    Result: '客服结果',
    Dispose: '处理说明',
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  show = async bill => {
    const response = await getRecords(bill.UUID);
    const records = response.success && response.data ? response.data : [];
    this.setState({ visible: true, remark: '', records, validate: true, bill });
  };

  hide = () => {
    this.setState({ visible: false });
  };

  //回复处理进度
  handleDispose = async stat => {
    const { bill, remark } = this.state;
    if (remark === '') {
      this.setState({ validate: false });
      return;
    }
    this.setState({ saving: true });
    const param = {
      billUuid: bill.UUID,
      type: this.modeTxt[stat],
      detail: remark,
    };
    const response = await dispose(stat, param);
    if (response.success) {
      message.success('保存成功！');
      this.setState({ visible: false });
      this.props.onSearch();
    }
    this.setState({ saving: false });
  };

  //客服回复结果
  handleReply = async () => {
    const { bill, remark } = this.state;
    if (remark === '') {
      this.setState({ validate: false });
      return;
    }
    this.setState({ saving: true });
    const response = await saveResult(bill.UUID, remark);
    if (response.success) {
      message.success('保存成功！');
      this.setState({ visible: false });
      this.props.onSearch();
    }
    this.setState({ saving: false });
  };

  //客服发布
  handleRelease = async () => {
    const { bill, remark } = this.state;
    if (remark === '') {
      this.setState({ validate: false });
      return;
    }
    this.setState({ saving: true });
    const response = await release(bill.UUID, remark);
    if (response.success) {
      message.success('发布成功！');
      this.setState({ visible: false });
      this.props.onSearch();
    }
    this.setState({ saving: false });
  };

  onRemarkChange = event => {
    const remark = event.target.value;
    this.setState({ remark, validate: remark !== '' });
  };

  drawButton = operation => {
    const { saving } = this.state;
    switch (operation) {
      case 'Release':
        return (
          <Button type="primary" onClick={() => this.handleRelease()} loading={saving}>
            发布
          </Button>
        );
      case 'Result':
        return (
          <Button type="primary" onClick={() => this.handleReply()} loading={saving}>
            回复结果
          </Button>
        );
      default:
        return (
          <>
            <Button type="primary" onClick={() => this.handleDispose('Rejected')} loading={saving}>
              驳回
            </Button>
            <Button type="primary" onClick={() => this.handleDispose('Dispose')} loading={saving}>
              处理进度
            </Button>
            <Button type="primary" onClick={() => this.handleDispose('Disposed')} loading={saving}>
              处理结果
            </Button>
          </>
        );
    }
  };
  render() {
    const { modal, operation } = this.props;
    const { visible, saving, remark, records, validate, bill } = this.state;
    const validateStatus = validate ? {} : { validateStatus: 'error', help: '请输入回复说明' };
    return (
      <Modal
        bodyStyle={{ overflowY: 'auto', maxHeight: '80vh', margin: -12 }}
        width="70vw"
        visible={visible}
        centered
        onCancel={() => this.hide()}
        confirmLoading={saving}
        title={`客服工单：${bill.BILLNUMBER}`}
        footer={
          <div>
            <Button onClick={this.hide}>取消</Button>
            {this.drawButton(operation)}
          </div>
        }
        {...modal}
      >
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} ref={ref => (this.form = ref)}>
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
                <Tooltip>{bill.COMPLETIONTIME || <Empty />} </Tooltip>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="截止时间">
                <Tooltip>{bill.DEADLINE || <Empty />} </Tooltip>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="投诉描述" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                <Tooltip>{bill.DETAIL || <Empty />} </Tooltip>
              </Form.Item>
            </Col>
          </Row>
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
                {records.map(record => {
                  return (
                    <div className={styles.disposeWrapper}>
                      <div className={styles.disposeTitle}>
                        {record.createInfo.operator.fullName}
                        <span style={{ fontWeight: 'bold' }}>({record.type})</span>
                        <span style={{ float: 'right' }}>{record.createInfo.time}</span>
                      </div>
                      <div>{record.detail || '<空>'}</div>
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
            required
            {...validateStatus}
          >
            <Input.TextArea
              placeholder={'请输入' + this.placeholders[operation]}
              value={remark}
              autoSize={{ minRows: 6, maxRows: 10 }}
              onChange={this.onRemarkChange}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
