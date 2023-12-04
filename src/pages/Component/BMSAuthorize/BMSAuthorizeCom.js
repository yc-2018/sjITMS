import React, { Component } from 'react';
import { Spin, Layout, Tree, message, Empty, Table, Input, Checkbox, InputNumber } from 'antd';
import styles from './BMSAuthorizeCom.less';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { getSourceTree } from '@/services/bms/BasicSource';
import { costAuthorize, getCostRoleResource } from '@/services/bms/RoleResource';
import { getConfigInfo, updateConfigInfo } from '@/services/bms/CostPlan';
import { getPlanTree } from '@/services/bms/Cost';
import ConfigTable from './ConfigTable';

const { Content, Sider } = Layout;
const { TreeNode } = Tree;

export default class BMSAuthorizeCom extends Component {
  state = {
    treeData: '',
    checkedKeys: [],
    configInfo: [],
    selectedKeys: '',
    typeState: this.props.type,
  };

  componentDidMount = () => {
    const { selectedRole, type } = this.props;
    this.queryTree(type);
    this.queryResource(selectedRole, type);
  };

  componentWillReceiveProps = newProps => {
    const { selectedRole, type } = this.props;
    const { typeState } = this.state;
    if (newProps.selectedRole != selectedRole) {
      this.queryTree(newProps.type == undefined ? typeState : newProps.type);
      this.queryResource(
        newProps.selectedRole,
        newProps.type == undefined ? typeState : newProps.type
      );
    }
  };

  queryTree = async type => {
    if (type == 'DataSource') {
      await getSourceTree().then(response => {
        if (response && response.success) {
          this.setState({ treeData: response.data });
        }
      });
    } else {
      await getPlanTree().then(response => {
        if (response && response.success) {
          this.setState({ treeData: response.data });
        }
      });
    }
  };

  queryResource = async (selectedRole, type) => {
    await getCostRoleResource(selectedRole.uuid, type).then(response => {
      if (response && response.success) {
        this.setState({ checkedKeys: response.data });
      }
    });
  };

  drawSider = () => {
    const { treeData, checkedKeys } = this.state;
    var treeDatas = '';
    if (treeData != '' && treeData != undefined) {
      treeDatas = JSON.parse(JSON.stringify(treeData));
    }

    const renderTreeNode = data => {
      if (data != '' && data != undefined) {
        let nodeArr = data.map(item => {
          if (item.children) {
            return (
              <TreeNode title={item.title} key={item.key} dataRef={item}>
                {renderTreeNode(item.children)}
              </TreeNode>
            );
          }
          return <TreeNode title={item.title} key={item.key} dataRef={item} />;
        });
        return nodeArr;
      }
    };

    return (
      <div>
        <Tree
          checkable
          showIcon={true}
          selectable
          onCheck={this.onCheck}
          onSelect={this.onSelect}
          checkedKeys={checkedKeys}
        >
          {renderTreeNode(treeDatas)}
        </Tree>
      </div>
    );
  };

  drawContent = () => {
    const { type } = this.props;
    const { selectedKeys } = this.state;
    if (type == 'CostPlan') {
      return <ConfigTable key={selectedKeys} selectedKeys={selectedKeys} />;
    } else {
      return <Empty />;
    }
  };

  drawConfigTable = () => {
    const { configInfo } = this.state;
    const columns = [
      {
        title: '节点',
        dataIndex: 'typeName',
        key: 'typeName',
      },
      {
        title: '跳过',
        dataIndex: 'skip',
        key: 'skip',
        render: (text, record) => {
          return (
            <Checkbox
              defaultChecked={text}
              onChange={e => {
                this.saveConfig(record, 'skip', e.target.checked);
              }}
            />
          );
        },
      },
      {
        title: '操作人',
        dataIndex: 'operator',
        key: 'operator',
        render: (text, record) => {
          return (
            <Input
              defaultValue={text}
              onBlur={e => this.saveConfig(record, 'operator', e.target.value)}
            />
          );
        },
      },
      {
        title: '每月提醒时间',
        dataIndex: 'warnTime',
        key: 'warnTime',
        render: (text, record) => {
          return (
            <InputNumber
              min={0}
              max={31}
              defaultValue={text}
              onBlur={e => this.saveConfig(record, 'warnTime', e.target.value)}
            />
          );
        },
      },
    ];

    return <Table dataSource={configInfo} columns={columns} />;
  };

  onCheck = async checkedKeys => {
    const { selectedRole, type } = this.props;
    const response = await costAuthorize(selectedRole.uuid, type, checkedKeys);
    if (response && response.success) {
      message.success('赋权成功！');
      this.queryResource(selectedRole, type);
    }
  };

  onSelect = async (selectedKeys, e) => {
    const { type } = this.props;
    this.setState({ selectedKeys: selectedKeys });
    if (type == 'CostPlan') {
      await getConfigInfo(selectedKeys).then(response => {
        if (response.success && response.data) {
          this.setState({ configInfo: response.data });
        } else {
          this.setState({ configInfo: [] });
        }
      });
    }
  };

  saveConfig = async (record, column, value) => {
    const { selectedKeys } = this.state;
    record[column] = value;
    const response = await updateConfigInfo(record);
    if (response && response.success) {
      message.success('修改成功');
    }
  };

  render() {
    const style = {
      // 'marginTop': '12px',
      overflow: 'hidden',
      height: 'calc(100vh - 300px)',
    };
    return (
      <Spin
        indicator={LoadingIcon('default')}
        tip="处理中..."
        spinning={false}
        style={{ height: '100%' }}
      >
        <ViewTabPanel style={style}>
          <div className={styles.AuthorizeCom}>
            <Content style={{ height: '100%' }}>
              <Layout style={{ height: '100%' }}>
                <Sider width={240} className={styles.leftWrapper}>
                  {this.drawSider()}
                </Sider>
                <Content className={styles.rightWrapper}>{this.drawContent()}</Content>
              </Layout>
            </Content>
          </div>
        </ViewTabPanel>
      </Spin>
    );
  }
}
