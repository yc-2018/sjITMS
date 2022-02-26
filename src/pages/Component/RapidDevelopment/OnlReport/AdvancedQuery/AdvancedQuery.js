import React, { Component, Fragment } from 'react';
import {
  Empty,
  Button,
  Row,
  Col,
  Form,
  Select,
  Card,
  Modal,
  Input,
  Radio,
  Table,
  Tree,
  message,
} from 'antd';
import ColsAdvanced from './ColsAdvanced';
import { saveOrUpdateEntities, dynamicqueryById, dynamicDelete } from '@/services/quick/Quick';

const layout = {
  wrapperCol: { span: 18 },
};

export default class AdvancedQuery extends Component {
  state = {
    superQueryModalVisible: false,
    saveModalVisible: false,
    saveName: '',
    treeDatas: [],
  };

  componentDidMount = () => {
    this.getData();
  };

  //获取高级查询保存的条件
  getData = async () => {
    const param = {
      tableName: 'itms_query_conditions',
      condition: {
        params: [{ field: 'reportCode', rule: 'eq', val: [this.props.reportCode] }],
      },
    };
    await dynamicqueryById(param).then(result => {
      const treeDatas = [];
      console.log('result', result);
      if (result.result.records !== 'false') {
        result.result.records.forEach(data => {
          treeDatas.push({
            alias: data.ALIAS,
            matchType: data.MATCHTYPE,
            queryParams: JSON.parse(data.QUERYPARAMS),
          });
        });
      }
      this.setState({ treeDatas });
    });
  };

  //查询
  advanceQuery = () => {
    this.props.refresh(this.formRef.handleSubmit());
    this.hideModal();
  };

  //重置
  onReset = () => {
    this.setState({ treeName: '' });
    this.formRef.onReset();
  };

  //保存查询条件
  onSave = () => {
    this.setState({ saveModalVisible: true });
  };

  //关闭窗口
  hideModal = () => {
    this.setState({ superQueryModalVisible: false });
  };

  hideSaveModal = () => {
    this.setState({ saveModalVisible: false });
  };

  //保存高级查询
  saveQueryConditions = () => {
    const messages = this.formRef.handleSubmit();
    const { treeDatas, saveName } = this.state;
    const { matchType, queryParams } = messages;
    const queryParam = [];
    if (queryParams.length === 0) {
      message.error('查询条件为空，不能保存');
      return;
    }
    queryParams.forEach((value, index) => {
      queryParam.push({
        key: index + 1,
        searchField: value.field,
        searchCondition: value.rule,
        defaultValue: value.val,
      });
    });
    const dataIndex = treeDatas.findIndex(x => x.alias === saveName);
    if (dataIndex > -1) {
      Modal.confirm({
        title: saveName + '已存在，是否覆盖？',
        okText: '是',
        cancelText: '否',
        onOk: () => {
          this.onSaveData(queryParam, matchType).then(result => {
            if (result.result) {
              let arr = treeDatas;
              arr[dataIndex] = {
                alias: saveName,
                matchType: matchType,
                queryParams: queryParam,
              };
              this.setState({ treeDatas: arr });
            }
          });
        },
        onCancel() {},
      });
    } else {
      this.onSaveData(queryParam, matchType).then(result => {
        if (result.result) {
          const newTreeDatas = treeDatas.concat({
            alias: saveName,
            matchType: matchType,
            queryParams: queryParam,
          });
          this.setState({ treeDatas: newTreeDatas });
        }
      });
    }
    this.hideSaveModal();
  };

  onSaveData = async (queryParam, matchType) => {
    const { saveName } = this.state;
    const payload = [
      {
        tableName: 'itms_query_conditions',
        data: [
          {
            alias: saveName,
            reportCode: this.props.reportCode,
            matchType: matchType,
            queryParams: JSON.stringify(queryParam),
          },
        ],
      },
    ];
    return await saveOrUpdateEntities(payload);
  };

  handleRightClick = ({ event, node }) => {
    let key = node.props.eventKey;
    Modal.confirm({
      title: '是否删除' + key + '?',
      okText: '确定',
      onOk: () => {
        this.handleDelete(key);
      },
    });
  };

  //删除高级查询保存列表
  handleDelete = async key => {
    const params = {
      tableName: 'itms_query_conditions',
      condition: {
        params: [
          { field: 'alias', rule: 'eq', val: [key] },
          { field: 'reportCode', rule: 'eq', val: [this.props.reportCode] },
        ],
      },
      deleteAll: 'false',
    };
    await dynamicDelete(params).then(result => {
      if (result.success) {
        message.success('删除成功！');
        this.getData();
      } else {
        message.error('删除失败，请刷新后再操作');
      }
    });
  };

  changeSaveName = value => {
    this.setState({ saveName: value });
  };

  onSelectTree = selectedKeys => {
    this.formRef.onReset();
    const { treeDatas } = this.state;
    const data = [];
    if (selectedKeys.length > 0) {
      const passParams = treeDatas.find(x => x.alias === selectedKeys[0]).queryParams;
      this.child.getSearchParams(passParams);
      this.setState({ saveName: selectedKeys[0] });
    }
  };

  //高级查询保存查询列表
  getTree = () => {
    const { treeDatas } = this.state;
    let tree = [];
    const treeData = [];
    if (treeDatas.length > 0) {
      treeDatas.forEach(datas => {
        treeData.push({
          title: datas.alias,
          key: datas.alias,
        });
      });
      tree.push(
        <Tree
          blockNode
          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
          treeData={treeData}
          onSelect={this.onSelectTree}
          onRightClick={this.handleRightClick}
        />
      );
    } else {
      tree.push(<Empty description={<span style={{ color: '#aeb8c2' }}>没有保存任何查询</span>} />);
    }
    return tree;
  };

  render() {
    const { superQueryModalVisible, saveModalVisible, saveName } = this.state;
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
                formRefs={this.formRef}
                searchFields={searchFields}
                reportCode={reportCode}
                filterValue={filterValue}
                refresh={this.props.refresh}
                wrappedComponentRef={form => (this.formRef = form)}
                onRef={ref => {
                  this.child = ref;
                }}
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
          onOk={this.saveQueryConditions}
        >
          <Form>
            <Input
              placeholder="请输入保存的名称"
              onChange={e => this.changeSaveName(e.target.value)}
              value={saveName}
            />
          </Form>
        </Modal>
      </Fragment>
    );
  }
}
