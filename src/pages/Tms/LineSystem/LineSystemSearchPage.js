/*
 * @Author: guankongjin
 * @Date: 2022-03-09 10:31:16
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-19 17:34:45
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\Tms\LineSystem\LineSystemSearchPage.js
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, message, Modal, Form, Layout, Menu, Icon } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import Page from '@/pages/Component/Page/inner/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import LineShipAddress from './LineShipAddress';
import LineSystemCreatePage from './LineSystemCreatePage';
import { dynamicqueryById } from '@/services/quick/Quick';
import linesStyles from './LineSystem.less';

const { Content, Sider } = Layout;
const Item = Menu.Item;
const { SubMenu } = Menu;
@connect(({ lineSystem, loading }) => ({
  lineSystem,
  loading: loading.models.lineSystem,
}))
export default class LineSystemSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = { frames: [], createSystemModalVisible: false, selectLineUuid: '' };
  }
  componentDidMount() {
    this.queryLineSystem();
  }

  //查询所有线路体系
  queryLineSystem = async () => {
    await dynamicqueryById({ tableName: 'SJ_ITMS_LINESYSTEM' }).then(async response => {
      if (response.result) {
        const frames = response.result.records;
        frames.forEach(async element => {
          const lines = await this.getSerialArchLineList(element.UUID);
          if (lines.result.records != 'false') element.lines = lines.result.records;
          this.setState({ frames });
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
  okHandleSystem = () => {};
  //新建新路
  handleCreateLine = () => {};
  //选中线路
  handleLineMenuItem = (systemUuid, lineUuid) => {
    // const { frames } = this.state;
    // const newFrames = [...frames];
    // newFrames.find(x => x.UUID == systemUuid).find(x => x.UUID == lineUuid).display = true;
    this.setState({ selectLineUuid: lineUuid });
  };
  //绘制左侧菜单栏
  drawSider = () => {
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
        <Menu
          defaultSelectedKeys={[this.state.frames.length > 0 ? this.state.frames[0].uuid : '']}
          defaultOpenKeys={[this.state.frames.length > 0 ? this.state.frames[0].uuid : '']}
          mode="inline"
          theme="light"
        >
          {this.renderSilderMenu()}
        </Menu>
      </div>
    );
  };
  //渲染菜单列表
  renderSilderMenu = () => {
    const { frames } = this.state;
    let menuItems = [];
    frames.map(scheme => {
      menuItems.push(
        <SubMenu
          // onTitleClick={this.handleClickSubMenuItem}
          key={scheme.uuid}
          title={
            <span>
              <Icon type="folder" style={{ color: '#3B77E3' }} />
              <span>{`[${scheme.CODE}]` + scheme.NAME}</span>
            </span>
          }
        >
          {scheme.lines
            ? scheme.lines.map(line => {
                return (
                  <Menu.Item
                    key={line.UUID}
                    onClick={() => this.handleLineMenuItem(scheme.UUID, line.UUID)}
                  >
                    <span>
                      <Icon type="swap" rotate={90} />
                      {`[${line.CODE}]` + line.NAME}
                    </span>
                    {line.display ? (
                      <span style={{ float: 'right' }}>
                        <a
                          className={linesStyles.menuItemA}
                          onClick={() => {
                            this.handleCreateModalVisible(true, line, scheme);
                          }}
                        >
                          编辑
                        </a>
                        <a
                          className={linesStyles.menuItemA}
                          onClick={() => {
                            this.handleModalVisible(commonLocale.deleteLocale, line);
                          }}
                        >
                          删除
                        </a>
                      </span>
                    ) : null}
                  </Menu.Item>
                );
              })
            : null}
        </SubMenu>
      );
    });

    return menuItems;
  };

  //绘制右侧内容
  drawContent = () => {
    const { selectLineUuid } = this.state;
    return <LineShipAddress quickuuid="itms-lines-shipaddress" lineuuid={selectLineUuid} />;
  };

  render() {
    const { createSystemModalVisible } = this.state;
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
                  onOk={this.okHandleSystem}
                  confirmLoading={false}
                  onCancel={() => this.setState({ createSystemModalVisible: false })}
                  destroyOnClose
                >
                  <LineSystemCreatePage quickuuid="itms_create_linesystem" />
                </Modal>
              </Sider>
              {/* 右侧内容 */}
              <Content
                style={{ marginLeft: '8px', height: '100%', overflow: 'hidden' }}
                className={linesStyles.rightWrapper}
              >
                {this.drawContent()}
              </Content>
            </Layout>
          </Content>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
