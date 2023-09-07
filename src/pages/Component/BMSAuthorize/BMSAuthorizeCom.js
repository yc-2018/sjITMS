import React, { Component } from 'react';
import { Spin, Layout, Tree, message, Empty } from 'antd';
import styles from './BMSAuthorizeCom.less';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { findSourceTree, getSourceTree } from '@/services/cost/BasicSource';
import { costAuthorize, getCostRoleResource } from '@/services/cost/RoleResource';
import { getPlanTree } from '@/services/cost/Cost';

const { Content, Sider } = Layout;
const { TreeNode } = Tree;

export default class BMSAuthorizeCom extends Component {
  state = {
    treeData: '',
    checkedKeys: [],
  };

  componentDidMount = () => {
    this.queryTree();
    this.queryResource();
  };

  queryTree = async () => {
    const { type } = this.props;
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

  queryResource = async () => {
    const { selectedRole, type } = this.props;
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

    console.log('treeDatas', treeData, treeDatas);

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
        <Tree checkable showIcon={true} selectable onCheck={this.onCheck} checkedKeys={checkedKeys}>
          {renderTreeNode(treeDatas)}
        </Tree>
      </div>
    );
  };

  onCheck = async checkedKeys => {
    const { selectedRole, type } = this.props;
    const response = await costAuthorize(selectedRole.uuid, type, checkedKeys);
    if (response && response.success) {
      message.success('赋权成功！');
      this.queryResource();
    }
  };

  render() {
    const { loading } = this.props;
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
                <Content className={styles.rightWrapper}>
                  <Empty />
                </Content>
              </Layout>
            </Content>
          </div>
        </ViewTabPanel>
      </Spin>
    );
  }
}
