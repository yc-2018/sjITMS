import React, { Component, Fragment } from 'react';
import { Empty, Button, Row, Col, Form, Select, Card, Modal } from 'antd';
import ColsAdvanced from './ColsAdvanced';

export default class AdvancedQuery extends Component {
  state = { superQueryModalVisible: false };

  //查询
  advanceQuery = () => {
    this.props.refresh(this.formRef.handleSubmit());
    this.hideModal();
  };

  //重置
  onReset = () => {
    this.formRef.onReset();
  };

  //关闭窗口
  hideModal = () => {
    this.setState({ superQueryModalVisible: false });
  };

  render() {
    const { superQueryModalVisible } = this.state;
    const { searchFields, filterValue, reportCode } = this.props;
    return (
      <Fragment>
        <Button type="primary" onClick={() => this.setState({ superQueryModalVisible: true })}>
          高级查询
        </Button>
        <Modal
          title="高级查询"
          onCancel={this.hideModal}
          visible={superQueryModalVisible}
          width={1000}
          footer={[
            <Button key="1" onClick={this.onReset} style={{ float: 'left' }}>
              重置
            </Button>,
            <Button key="2" style={{ float: 'left' }}>
              保存查询条件
            </Button>,
            <Button key="3" onClick={this.hideModal}>
              关闭
            </Button>,
            <Button key="4" type="primary" onClick={this.advanceQuery}>
              查询
            </Button>,
          ]}
        >
          <Row>
            <Col span={16}>
              <ColsAdvanced
                formRefs={this.formRef}
                searchFields={searchFields}
                reportCode={reportCode}
                filterValue={filterValue}
                refresh={this.props.refresh}
                hideModal={this.hideModal}
                wrappedComponentRef={form => (this.formRef = form)}
              />
            </Col>
            <Col span={8}>
              <Card title="保存的查询">
                <Empty description={<span style={{ color: '#aeb8c2' }}>没有保存任何查询</span>} />
              </Card>
            </Col>
          </Row>
        </Modal>
      </Fragment>
    );
  }
}
