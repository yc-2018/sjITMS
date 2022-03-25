/*
 * @Author: guankongjin
 * @Date: 2022-03-09 10:31:16
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-25 09:20:02
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\Tms\LineSystem\LineSystemSearchPage.js
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, message, Modal, Form, Layout, Menu, Icon, Tree } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import Page from '@/pages/Component/Page/inner/NewStylePage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import LineShipAddress from './LineShipAddress';
import LineSystemCreatePage from './LineSystemCreatePage';
import LineMap from './LineMap';
import { dynamicqueryById } from '@/services/quick/Quick';
import linesStyles from './LineSystem.less';

const { Content, Sider } = Layout;
const Item = Menu.Item;
const { SubMenu } = Menu;
const { TreeNode } = Tree;
@connect(({ lineSystem, loading }) => ({
  lineSystem,
  loading: loading.models.lineSystem,
}))
export default class LineSystemSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineTreeData: [],
      createSystemModalVisible: false,
      createLineModalVisible: false,
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
        const { lineTreeData } = this.state;
        const frames = response.result.records;
        frames.forEach(async (element, index) => {
          const lines = await this.getSerialArchLineList(element.UUID);
          if (lines.result.records != 'false') {
            lineTreeData.push({
              value: `[${element.CODE}]` + element.NAME,
              key: element.UUID,
              icon: <Icon type="swap" rotate={90} />,
              system: true,
              children: lines.result.records.map((record, lineIndex) => {
                return {
                  value: `[${record.CODE}]` + record.NAME,
                  key: record.UUID,
                  icon: <Icon type="swap" rotate={90} />,
                  selected: index == 0 && lineIndex == 0 ? true : false,
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

          this.setState({ lineTreeData });
        });
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

  //新建体系
  handleCreateSystem = () => {
    this.setState({ createSystemModalVisible: true });
  };

  //新建新路
  handleCreateLine = () => {};

  //选中树节点
  onSelect = selectedKeys => {
    const { lineTreeData } = this.state;
    const system = lineTreeData.find(x => x.key == selectedKeys[0]);
    this.setState({
      rightContent: system ? (
        <LineSystemCreatePage
          key={selectedKeys[0]}
          quickuuid="itms_create_linesystem"
          showPageNow="update"
          noBorder={true}
          params={{ entityUuid: selectedKeys[0] }}
        />
      ) : (
        <LineShipAddress
          key={selectedKeys[0]}
          quickuuid="itms-lines-shipaddress"
          lineuuid={selectedKeys[0]}
        />
      ),
    });
  };

  //绘制左侧菜单栏
  drawSider = () => {
    const renderTreeNode = data => {
      let nodeArr = data.map(item => {
        item.title = (
          <div>
            <span>{item.value}</span>
            {item.system ? (
              <span />
            ) : (
              <span style={{ float: 'right' }}>
                <a style={{ marginRight: 15 }}>编辑</a>
                <a style={{ marginRight: 15 }}>删除</a>
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
            <Button type="primary" onClick={this.handleCreateSystem}>
              新建体系
            </Button>
          </div>
        </div>
        <Tree showLine={true} showIcon={true} selectable defaultExpandAll onSelect={this.onSelect}>
          {renderTreeNode(this.state.lineTreeData)}
        </Tree>
      </div>
    );
  };

  //绘制右侧内容
  drawContent = () => {
    return this.state.rightContent;
  };

  render() {
    const { createSystemModalVisible, createLineModalVisible } = this.state;
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Content className={linesStyles.contentWrapper}>
            <Layout>
              {/* 左侧内容 */}
              <Sider width={300} className={linesStyles.leftWrapper}>
                {this.drawSider()}
                <Modal
                  title="新建线路体系"
                  width={800}
                  height={500}
                  visible={createSystemModalVisible}
                  onOk={e => this.lineSystemCreatePage.handleSave(e)}
                  onCancel={() => this.lineSystemCreatePage.handleCancel()}
                  confirmLoading={false}
                  destroyOnClose
                >
                  <LineSystemCreatePage
                    quickuuid="itms_create_linesystem"
                    noBorder={true}
                    noCategory={true}
                    onCancel={() => this.setState({ createSystemModalVisible: false })}
                    onRef={node => (this.lineSystemCreatePage = node)}
                  />
                </Modal>
                <Modal
                  title="编辑线路"
                  width={800}
                  height={500}
                  visible={createLineModalVisible}
                  onOk={e => this.lineSystemCreatePage.handleSave(e)}
                  onCancel={() => this.lineSystemCreatePage.handleCancel()}
                  confirmLoading={false}
                  destroyOnClose
                >
                  <LineSystemCreatePage
                    quickuuid="itms_create_lines"
                    noBorder={true}
                    noCategory={true}
                    onCancel={() => this.setState({ createLineModalVisible: false })}
                    onRef={node => (this.lineSystemCreatePage = node)}
                  />
                </Modal>
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
