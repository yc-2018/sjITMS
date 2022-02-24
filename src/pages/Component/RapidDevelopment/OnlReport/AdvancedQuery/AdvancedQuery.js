import React, { Component, Fragment } from 'react';
import { Empty, Button, Row, Col, Form, Select, Card, Modal, Input, Radio, Table, Tree } from 'antd';
import ColsAdvanced from './ColsAdvanced';

const layout = {
  wrapperCol: { span: 18 },
};

export default class AdvancedQuery extends Component {
  state = {
    superQueryModalVisible: false,
    saveModalVisible: false,
    saveName: '',
    treeDatas: '',
    passParams: ''
  };

  //查询
  advanceQuery = () => {
    this.props.refresh(this.formRef.handleSubmit());
    this.hideModal();
  };

  //重置
  onReset = () => {
    this.formRef.onReset();
    this.setState({passParams:''})
  };

  //保存查询条件
  onSave = () => {
    this.setState({ saveModalVisible: true })
  }

  //关闭窗口
  hideModal = () => {
    this.setState({ superQueryModalVisible: false });
  };



  hideSaveModal = () => {
    this.setState({ saveModalVisible: false });
  }

  onOk = () => {
    const message = this.formRef.handleSubmit()
    const { matchType, queryParams } = message
    const queryParam = [];
    queryParams.forEach((value, index) => {
      queryParam.push({
        key: index,
        searchField: value.field,
        searchCondition: value.rule,
        defaultValue: value.val
      })
    })
    let aa = new Array();
    aa.push({
      alias: this.state.saveName,
      matchType: matchType,
      queryParams: queryParam
    })
    this.setState({ treeDatas: [...this.state.treeDatas, aa] })
    this.hideSaveModal()
  }

  changeSaveName = (value) => {
    this.setState({ saveName: value })
  }

  onSelectTree = (selectedKeys) => {
    this.formRef.onReset();
    const { treeDatas } = this.state
    const data = []
    treeDatas.forEach(datas => {
      const treeData = datas.find(x => x.alias === selectedKeys[0])
      if (treeData) {
        data.push(treeData)
      }
    })
    data.forEach(a => {
      this.setState({ passParams: a.queryParams })
    })
  }

  getTree = () => {
    const { treeDatas } = this.state
    let tree = []
    const treeData = []
    if (treeDatas.length > 0) {
      treeDatas.forEach(datas => {
        datas.forEach(data => {
          treeData.push({
            title: data.alias,
            key: data.alias,
          })
        })
      })
      tree.push(
        <Tree
          blockNode
          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
          treeData={treeData}
          onSelect={this.onSelectTree}
        />
      )
    } else {
      tree.push(<Empty description={<span style={{ color: '#aeb8c2' }}>没有保存任何查询</span>} />)
    }
    return tree;
  }

  render() {
    const { superQueryModalVisible, saveModalVisible, passParams } = this.state;
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
            <Button key="2" onClick={this.onSave} style={{ float: 'left' }}>
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
                passParams={passParams}
                formRefs={this.formRef}
                searchFields={searchFields}
                reportCode={reportCode}
                filterValue={filterValue}
                refresh={this.props.refresh}
                hideModal={this.hideModal}
                wrappedComponentRef={form => (this.formRef = form)}
              />
            </Col>
            <Col span={6}>
              <Card size="small" title="保存的查询">
                {this.getTree()}
              </Card>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="保存名称"
          visible={saveModalVisible}
          onCancel={this.hideSaveModal}
          onOk={this.onOk}
        >
          <Form>
            <Input placeholder="请输入保存的名称" onChange={(e) => this.changeSaveName(e.target.value)} />
          </Form>
        </Modal>
      </Fragment>
    );
  }
}
