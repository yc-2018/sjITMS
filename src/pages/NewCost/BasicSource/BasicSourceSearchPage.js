/*
 * @Author: Liaorongchang
 * @Date: 2022-05-31 14:49:23
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2024-01-27 10:25:39
 * @version: 1.0
 */
import React, { Component } from 'react';
import { Layout, Button, Tree, message, Modal, Icon, Tabs } from 'antd';
import Page from '@/pages/Component/Page/inner/NewStylePage';
import sourceStyle from './BasicSource.less';
import FormFieldSearchPage from './BasicFormFieldSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import ExcelImport from '@/pages/NewCost/SourceExcelImport/index';
import BasicHeadCreatPage from './BasicHeadCreatPage';
import BasicDtlCreatPage from './BasicDtlCreatPage';
import { getAllSource, deleteSourceTree, sortDateSourceTree } from '@/services/bms/BasicSource';
import BasicSourceDataSearchPage from './BasicSourceDataSearchPage';
import { havePermission } from '@/utils/authority';
import BasicSourceOperateLogSearchPage from './BasicSourceOperateLogSearchPage';
import BasicConfigCreatePage from './BasicConfigCreatePage';
import { queryDictByCode, dynamicQuery } from '@/services/quick/Quick';

const { Content, Sider } = Layout;
const { TreeNode } = Tree;
const { TabPane } = Tabs;

export default class BasicSourceSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allData: '',
      treeData: '',
      sourceData: [],
      dict: [],
      selectedKeys: '',
      rightContent: '',
      authority: props.route?.authority ? props.route.authority[0] : null,
    };
  }

  componentDidMount = () => {
    this.getOrg();
    this.queryTree();
  };

  getOrg = async () => {
    // 查询字典
    queryDictByCode(['bmsDispatchCenter']).then(res => this.setState({ dict: res.data }));
  };

  queryTree = async () => {
    await getAllSource().then(response => {
      if (response && response.success) {
        this.setState({ treeData: response.data?.tree, allData: response.data?.all });
      }
    });
  };

  drawSider = () => {
    const { selectedKeys, treeData } = this.state;
    var treeDatas = '';
    if (treeData != '' && treeData != undefined) {
      treeDatas = JSON.parse(JSON.stringify(treeData));
    }

    const renderTreeNode = data => {
      if (data != '' && data != undefined) {
        let nodeArr = data.map(item => {
          item.title = (
            <div style={{ height: '24px', lineHeight: '24px' }}>
              <span>
                <Icon
                  type={item.type == undefined ? 'folder-open' : 'file-text'}
                  style={{ marginRight: '2px' }}
                />
                {item.title}
                {/* {item.uuid} */}
              </span>
              {item.type == undefined || item.key != selectedKeys ? (
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
      }
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
          selectable
          draggable
          blockNode
          onDrop={this.onDrop}
          selectedKeys={[selectedKeys]}
          onSelect={this.onSelect}
        >
          {renderTreeNode(treeDatas)}
        </Tree>
      </div>
    );
  };

  onDrop = async info => {
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropToGap = info.dropToGap;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const payload = {
      dropKey: dropKey,
      dragKey: dragKey,
      dropToGap: dropToGap,
      dropPosition: dropPosition,
    };
    const response = await sortDateSourceTree(payload);
    if (response && response.success) {
      this.queryTree();
    }
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

  onSelect = async (selectedKeys, event) => {
    const { allData, dict } = this.state;
    const system = allData.find(x => x.uuid == selectedKeys[0]);
    let tableParam = {
      tableName: 'cost_form',
      condition: {
        params: [{ field: 'UUID', rule: 'eq', val: [selectedKeys[0]] }],
      },
    };
    await dynamicQuery(tableParam, system?.system).then(tableConfig => {
      let queryByOrg = false;
      if (tableConfig.result.records.length > 0 && tableConfig.result.records[0].QUERYBYORG == 1) {
        queryByOrg = true;
      }
      if (selectedKeys.length == 1) {
        this.setState({
          rightContent:
            system.type == undefined ? (
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
                {havePermission(this.state.authority + '.structure') ? (
                  <TabPane tab={'表结构'} key="structure">
                    <FormFieldSearchPage
                      key={`Line${selectedKeys[0]}`}
                      quickuuid={'cost_form_field'}
                      selectedRows={selectedKeys[0]}
                      selectedNodes={event.selectedNodes[0]}
                      system={system}
                    />
                  </TabPane>
                ) : (
                  ''
                )}
                {havePermission(this.state.authority + '.manage') ? (
                  <TabPane tab={'管理'} key="manage">
                    <div className={sourceStyle.config}>
                      <Button
                        style={{ float: 'right' }}
                        type="primary"
                        onClick={e => this.configCreatPage.onSave(e)}
                      >
                        保存
                      </Button>
                    </div>
                    <div>
                      <BasicConfigCreatePage
                        key={selectedKeys[0]}
                        quickuuid="cost_datasource_manage"
                        showPageNow="update"
                        noBorder={true}
                        noCategory={true}
                        params={{ entityUuid: selectedKeys[0] }}
                        onRef={node => (this.configCreatPage = node)}
                        uuid={selectedKeys[0]}
                      />
                    </div>
                  </TabPane>
                ) : (
                  ''
                )}
                <TabPane tab={'表数据'} key="data">
                  <BasicSourceDataSearchPage
                    expanded={event.selectedNodes[0].props.dataRef.expanded}
                    title={event.selectedNodes[0].props.dataRef.tableNameCN}
                    system={system}
                    key={`Line${selectedKeys[0]}`}
                    selectedRows={selectedKeys[0]}
                    setFunc={node => (this.sourceDataRef = node)}
                    dict={dict}
                    queryByOrg={queryByOrg}
                  />
                </TabPane>
                <TabPane tab={'操作日志'} key="operate">
                  <BasicSourceOperateLogSearchPage
                    quickuuid={'cost_sourcedata_log'}
                    key={`Line${selectedKeys[0]}`}
                    selectedRows={selectedKeys[0]}
                  />
                </TabPane>
                {/* {event.selectedNodes[0].props.dataRef.expanded == '1' ? ( */}
                <TabPane tab={'导入'} key="import">
                  <div style={{ marginTop: '20px' }}>
                    <ExcelImport
                      key={selectedKeys[0]}
                      title={event.selectedNodes[0].props.dataRef.tableNameCN}
                      selectedRows={selectedKeys[0]}
                      templateType="BASICSOURCE"
                      dispatch={this.props.dispatch}
                      uploadType="basicSource/newBatchImport"
                      uploadParams={{ sourceUuid: selectedKeys[0] }}
                      cancelCallback={() => {}}
                      costForm={system}
                      refDataSource={() => this.sourceDataRef.onSearch()}
                      dict={dict}
                      queryByOrg={queryByOrg}
                    />
                  </div>
                </TabPane>
                {/* ) : (
                  ''
                )} */}
              </Tabs>
            ),
          selectedKeys: selectedKeys[0],
        });
      }
    });
  };

  drawContent = () => {
    return this.state.rightContent;
  };
  // //导入组件（子传父，父传子）导入成功以后，刷新表数据
  // callbackRefreshesData =()=>{
  //
  // }

  setFunc = func => {
    this.getFunc = func;
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
            width: 1300,
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
            width: 1300,
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
