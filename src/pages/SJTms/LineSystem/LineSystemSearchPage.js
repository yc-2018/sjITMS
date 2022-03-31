/*
 * @Author: guankongjin
 * @Date: 2022-03-09 10:31:16
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-31 16:56:50
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineSystemSearchPage.js
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Switch, Modal, message, Form, Layout, Menu, Icon, Tree, Tabs } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import Page from '@/pages/Component/Page/inner/NewStylePage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import LineShipAddress from './LineShipAddress';
import LineSystemCreatePage from './LineSystemCreatePage';
import LineMap from './LineMap';
import { dynamicqueryById, dynamicDelete } from '@/services/quick/Quick';
import linesStyles from './LineSystem.less';

const { Content, Sider } = Layout;
const Item = Menu.Item;
const { SubMenu } = Menu;
const { TreeNode } = Tree;
const { TabPane } = Tabs;
@connect(({ lineSystem, loading }) => ({
  lineSystem,
  loading: loading.models.lineSystem,
}))
export default class LineSystemSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineTreeData: [],
      lineData: [],
      expandKeys: [],
      selectLineUuid: '',
      rightContent: '',
    };
  }
  componentDidMount() {
    this.queryLineSystem();
  }

  //查询所有线路体系
  queryLineSystem = async () => {
    await dynamicqueryById({ tableName: 'SJ_ITMS_LINESYSTEM' }).then(async response => {
      if (response.result) {
        const { selectLineUuid, lineData } = this.state;
        let newSelectLineUuid = '';
        let lineTreeData = [];
        const frames = response.result.records;
        frames.forEach(async element => {
          const lines = await this.getSerialArchLineList(element.UUID);
          if (lines.result.records != 'false') {
            lineTreeData.push({
              value: `[${element.CODE}]` + element.NAME,
              key: element.UUID,
              icon: <Icon type="swap" rotate={90} />,
              system: true,
              children: lines.result.records.map(record => {
                lineData.push(record);
                if (newSelectLineUuid == undefined) {
                  newSelectLineUuid = record.UUID;
                }
                return {
                  value: `[${record.CODE}]` + record.NAME,
                  key: record.UUID,
                  icon: <Icon type="swap" rotate={90} />,
                };
              }),
            });
          } else {
            lineTreeData.push({
              value: `[${element.CODE}]` + element.NAME,
              key: element.UUID,
              icon: <Icon type="swap" rotate={90} />,
              system: true,
            });
          }
          this.setState({
            expandKeys: lineTreeData.map(x => x.key),
            lineTreeData,
            lineData,
            selectLineUuid: newSelectLineUuid,
          });
        });
        this.onSelect(this.state.selectLineUuid);
      }
    });
  };
  //查询线路体系下所有线路
  getSerialArchLineList = async defSchemeUuid => {
    const param = {
      tableName: 'SJ_ITMS_LINE',
      condition: {
        params: [{ field: 'systemUuid', rule: 'eq', val: [defSchemeUuid] }],
      },
    };
    return await dynamicqueryById(param);
  };
  //删除体系
  handleDeleteSystem = async systemUuid => {
    const params = [
      {
        tableName: 'SJ_ITMS_LINESYSTEM',
        condition: {
          params: [{ field: 'UUID', rule: 'eq', val: [systemUuid] }],
        },
        deleteAll: 'false',
      },
    ];
    await dynamicDelete(params).then(result => {
      if (result.success) {
        message.success('删除成功！');
        this.queryLineSystem();
      } else {
        message.error('删除失败，请刷新后再操作');
      }
    });
  };
  //删除线路
  handleDeleteLine = lineUuid => {
    Modal.confirm({
      title: '确定删除?',
      onOk: async () => {
        const params = [
          {
            tableName: 'SJ_ITMS_LINE',
            condition: {
              params: [{ field: 'UUID', rule: 'eq', val: [lineUuid] }],
            },
            deleteAll: 'false',
          },
        ];
        await dynamicDelete(params).then(result => {
          if (result.success) {
            message.success('删除成功！');
            this.queryLineSystem();
          } else {
            message.error('删除失败，请刷新后再操作');
          }
        });
      },
    });
  };

  //选中树节点
  onSelect = (selectedKeys, event) => {
    if (event && !event.selected) return;
    const { lineTreeData, lineData } = this.state;
    const system = lineTreeData.find(x => x.key == selectedKeys[0]);
    this.setState({
      rightContent: system ? (
        <div>
          <div className={linesStyles.navigatorPanelWrapper}>
            <span className={linesStyles.sidertitle}>线路体系</span>
            <div className={linesStyles.action}>
              {/* <Button type="primary" icon="plus">导入门店</Button> */}
              <Button type="primary" icon="plus" onClick={() => this.lineCreatePageModalRef.show()}>
                添加路线
              </Button>
              <Button
                onClick={() => {
                  Modal.confirm({
                    title: '确定删除?',
                    onOk: () => {
                      this.handleDeleteSystem(selectedKeys[0]);
                    },
                  });
                }}
              >
                删除
              </Button>
              <Button type="primary" onClick={e => this.lineSystemEditPage.handleSave(e)}>
                保存
              </Button>
            </div>
          </div>
          <LineSystemCreatePage
            key={selectedKeys[0]}
            quickuuid="itms_create_linesystem"
            showPageNow="update"
            noBorder={true}
            noCategory={true}
            params={{ entityUuid: selectedKeys[0] }}
            onRef={node => (this.lineSystemEditPage = node)}
          />
        </div>
      ) : (
        <Tabs defaultActiveKey={`Tab${selectedKeys[0]}`}>
          <TabPane tab="线路门店" key="1">
            <LineShipAddress
              key={`Line${selectedKeys[0]}`}
              quickuuid="itms-lines-shipaddress"
              lineuuid={selectedKeys[0]}
              linecode={
                lineData.length > 0 ? lineData.find(x => x.UUID == selectedKeys[0]).CODE : ''
              }
            />
          </TabPane>
          <TabPane tab="门店地图" key="2">
            <LineMap key={`Map${selectedKeys[0]}`} lineuuid={selectedKeys[0]} />
          </TabPane>
        </Tabs>
      ),
      selectLineUuid: selectedKeys[0],
    });
  };
  //展开/收起节点
  onExpand = (_, event) => {
    const { expandKeys } = this.state;
    if (event.expanded) {
      expandKeys.push(event.node.props.eventKey);
    } else {
      expandKeys.splice(expandKeys.indexOf(event.node.props.eventKey), 1);
    }
    this.setState({ expandKeys });
  };

  //绘制左侧菜单栏
  drawSider = () => {
    const { expandKeys, lineTreeData, selectLineUuid } = this.state;
    const renderTreeNode = data => {
      let nodeArr = data.map(item => {
        item.title = (
          <div>
            <span>{item.value}</span>
            {item.system || item.key != selectLineUuid ? (
              <span />
            ) : (
              <span style={{ float: 'right' }}>
                <a style={{ marginRight: 15 }} onClick={() => this.lineEditPageModalRef.show()}>
                  编辑
                </a>
                <a style={{ marginRight: 15 }} onClick={() => this.handleDeleteLine(item.key)}>
                  删除
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
        return <TreeNode title={item.title} key={item.key} />;
      });
      return nodeArr;
    };
    return (
      <div>
        <div className={linesStyles.navigatorPanelWrapper}>
          <span className={linesStyles.sidertitle}>线路体系</span>
          <div className={linesStyles.action}>
            <Button type="primary" onClick={() => this.lineSystemCreatePageModalRef.show()}>
              新建体系
            </Button>
          </div>
        </div>
        <Tree
          showLine={true}
          showIcon={true}
          selectable
          expandedKeys={expandKeys}
          selectedKeys={[selectLineUuid]}
          onSelect={this.onSelect}
          onExpand={this.onExpand}
        >
          {renderTreeNode(lineTreeData)}
        </Tree>
      </div>
    );
  };

  //绘制右侧内容
  drawContent = () => {
    return this.state.rightContent;
  };

  render() {
    const { createSystemModalVisible, createLineModalVisible, selectLineUuid } = this.state;
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Content className={linesStyles.contentWrapper}>
            <Layout>
              {/* 左侧内容 */}
              <Sider width={300} className={linesStyles.leftWrapper}>
                {this.drawSider()}
                <CreatePageModal
                  modal={{
                    title: '新建线路体系',
                    width: 500,
                    bodyStyle: { marginRight: '40px' },
                  }}
                  page={{ quickuuid: 'itms_create_linesystem', noCategory: true }}
                  onRef={node => (this.lineSystemCreatePageModalRef = node)}
                />
                <CreatePageModal
                  modal={{
                    title: '添加线路',
                    width: 500,
                    bodyStyle: { marginRight: '40px' },
                  }}
                  page={{ quickuuid: 'itms_create_lines', noCategory: true }}
                  onRef={node => (this.lineCreatePageModalRef = node)}
                />
                <CreatePageModal
                  modal={{
                    title: '编辑线路',
                    width: 500,
                    bodyStyle: { marginRight: '40px' },
                  }}
                  page={{
                    quickuuid: 'itms_create_lines',
                    params: { entityUuid: selectLineUuid },
                    showPageNow: 'update',
                    noCategory: true,
                  }}
                  onRef={node => (this.lineEditPageModalRef = node)}
                />
              </Sider>
              {/* 右侧内容 */}
              <Content className={linesStyles.rightWrapper}>{this.drawContent()}</Content>
            </Layout>
          </Content>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
