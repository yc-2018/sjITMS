/*
 * @Author: Liaorongchang
 * @Date: 2022-05-31 14:49:23
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-08-20 10:17:49
 * @version: 1.0
 */
import React, { Component } from 'react';
import { Layout, Button, Tree, message, Modal, Empty, Tabs } from 'antd';
import Page from '@/pages/Component/Page/inner/NewStylePage';
import sourceStyle from './BasicSource.less';
import FormFieldSearchPage from './BasicFormFieldSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import ExcelImport from '@/components/ExcelImport';
import BasicHeadCreatPage from './BasicHeadCreatPage';
import BasicDtlCreatPage from './BasicDtlCreatPage';
import { findSourceTree, deleteSourceTree } from '@/services/cost/BasicSource';
import BasicSourceDataSearchPage from './BasicSourceDataSearchPage';

const { Content, Sider } = Layout;
const { TreeNode } = Tree;
const { TabPane } = Tabs;

export default class BasicSourceSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      sourceData: [],
      selectedKeys: '',
      rightContent: '',
    };
  }

  componentDidMount = () => {
    console.log(this.props);
    this.queryTree();
  };

  queryTree = async () => {
    await findSourceTree().then(response => {
      if (response && response.success) {
        this.setState({ treeData: response.data });
      }
    });
  };

  drawSider = () => {
    const { selectedKeys } = this.state;
    var treeData = JSON.parse(JSON.stringify(this.state.treeData));

    const renderTreeNode = data => {
      let nodeArr = data.map(item => {
        item.title = (
          <div>
            <span>{item.title}</span>
            {item.parentUuid == undefined || item.key != selectedKeys ? (
              <span />
            ) : (
              <span>
                <a style={{ float: 'right' }} onClick={() => this.updateDtlModalRef.show()}>
                  编辑
                </a>
              </span>
            )}
          </div>
        );
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
    };

    return (
      <div>
        <div className={sourceStyle.navigatorPanelWrapper}>
          <div className={sourceStyle.action}>
            <Button type="primary" onClick={this.createHeadOnClick.bind()}>
              新增分类
            </Button>
            <Button type="primary" onClick={this.createDtlOnClick.bind()}>
              新增数据源
            </Button>
            <Button onClick={this.handleDeletetree.bind()}>删除</Button>
          </div>
        </div>
        <Tree
          showLine
          showIcon={true}
          selectable
          selectedKeys={[selectedKeys]}
          onSelect={this.onSelect}
        >
          {renderTreeNode(treeData)}
        </Tree>
      </div>
    );
  };

  createHeadOnClick = () => {
    this.headModalRef.show();
  };

  createDtlOnClick = () => {
    this.dtlModalRef.show();
  };

  handleDeletetree = () => {
    const { selectedKeys } = this.state;
    if (!selectedKeys) {
      message.error('请选择一条数据');
      return;
    }
    Modal.confirm({
      title: '确定删除?',
      onOk: async () => {
        await deleteSourceTree(selectedKeys).then(result => {
          if (result.success) {
            message.success('删除成功！');
            this.queryTree();
          } else {
            message.error('删除失败，请刷新后再操作');
          }
        });
      },
    });
  };

  onSelect = (selectedKeys, event) => {
    const { treeData, tabsKey } = this.state;
    const system = treeData.find(x => x.uuid == selectedKeys[0]);
    console.log('event', event);
    if (selectedKeys.length == 1) {
      this.setState({
        rightContent: system ? (
          <div>
            <div className={sourceStyle.navigatorPanelWrapper}>
              <span className={sourceStyle.sidertitle}>
                {event.selectedNodes[0].props.dataRef.tableNameCN}
              </span>
              <div className={sourceStyle.action}>
                <Button type="primary" onClick={e => this.basicHeadCreatPage.onSave(e)}>
                  保存
                </Button>
              </div>
            </div>
            <BasicHeadCreatPage
              key={selectedKeys[0]}
              quickuuid="cost_form_head"
              showPageNow="update"
              noBorder={true}
              noCategory={true}
              params={{ entityUuid: selectedKeys[0] }}
              onRef={node => (this.basicHeadCreatPage = node)}
              refresh={this.queryTree.bind()}
            />
          </div>
        ) : (
          <Tabs defaultActiveKey="data">
            <TabPane tab={'表结构'} key="structure">
              <FormFieldSearchPage
                key={`Line${selectedKeys[0]}`}
                quickuuid={'cost_form_field'}
                selectedRows={selectedKeys[0]}
                selectedNodes={event.selectedNodes[0]}
              />
            </TabPane>
            <TabPane tab={'表数据'} key="data">
              <BasicSourceDataSearchPage
                expanded={event.selectedNodes[0].props.dataRef.expanded}
                title={event.selectedNodes[0].props.dataRef.tableNameCN}
                tableName={event.selectedNodes[0].props.dataRef.tableName}
                key={`Line${selectedKeys[0]}`}
                selectedRows={selectedKeys[0]}
              />
            </TabPane>
            {event.selectedNodes[0].props.dataRef.expanded == '1' ? (
              <TabPane tab={'导入'} key="import">
                <div style={{ marginTop: '20px' }}>
                  <ExcelImport
                    title={event.selectedNodes[0].props.dataRef.tableNameCN}
                    templateType="BASICSOURCE"
                    dispatch={this.props.dispatch}
                    uploadType="basicSource/batchImport"
                    uploadParams={{ sourceUuid: selectedKeys[0] }}
                    cancelCallback={() => {}}
                  />
                </div>
              </TabPane>
            ) : (
              ''
            )}
          </Tabs>
        ),
        selectedKeys: selectedKeys[0],
      });
    }
  };

  drawContent = () => {
    return this.state.rightContent;
  };

  render() {
    const { selectedKeys } = this.state;
    return (
      <Page>
        <Content className={sourceStyle.contentWrapper}>
          <Layout>
            <Sider width={300} style={{ overflow: 'auto', backgroundColor: '#ffffff' }}>
              {this.drawSider()}
            </Sider>
            <Content style={{ backgroundColor: '#ffffff', marginLeft: '8px', paddingLeft: '12px' }}>
              {this.drawContent()}
            </Content>
          </Layout>
        </Content>
        <CreatePageModal
          modal={{
            title: '新增分类',
            width: 500,
            afterClose: () => {
              this.queryTree();
            },
          }}
          page={{ quickuuid: 'cost_form_head', noCategory: true }}
          customPage={BasicHeadCreatPage}
          onRef={node => (this.headModalRef = node)}
        />
        <CreatePageModal
          modal={{
            title: '新增数据源',
            width: 500,
            afterClose: () => {
              this.queryTree();
            },
          }}
          page={{ quickuuid: 'cost_form_children', noCategory: true }}
          customPage={BasicDtlCreatPage}
          onRef={node => (this.dtlModalRef = node)}
        />
        <CreatePageModal
          modal={{
            title: '编辑数据源',
            width: 500,
            afterClose: () => {
              this.queryTree();
            },
          }}
          page={{
            quickuuid: 'cost_form_children',
            noCategory: true,
            showPageNow: 'update',
            params: { entityUuid: selectedKeys },
          }}
          onRef={node => (this.updateDtlModalRef = node)}
        />
      </Page>
    );
  }
}
