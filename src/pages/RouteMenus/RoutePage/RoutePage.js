import React, { Component } from 'react';
import { Layout, Row, Col, Modal, Button, Tabs, Divider, Tree, Input, Empty, message } from 'antd';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { getRoutesTreeByParam } from '@/services/route/Route';
import {
  queryCreateConfig,
  dynamicqueryById,
  updateEntity,
  saveFormData,
  dynamicQuery,
} from '@/services/quick/Quick';
import { org } from './RouteConfig';
import styles from './Route.less';
// import Create from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageDefault';
import Create from './RouteCreate';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import zhCN from '@/locales/zh-CN';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { TreeNode } = Tree;

export default class RoutePage extends Component {
  checkMenus = [];
  createRef = {};
  state = {
    menusTree: [],
    menusInfo: undefined,
    onlFormField: undefined,
    tableName: undefined,
    entityUuid: undefined,
    tabKey: 'DISPATCH_CENTER', //org[0].key,
    createPage: undefined,
    createPageKey: 'route',
  };

  componentDidMount() {
    this.initData();
  }

  initData = async () => {
    let params = this.getKeyParam(this.state.tabKey);
    let res = await getRoutesTreeByParam(params);
    if (res?.success) {
      this.setState({ menusTree: res.data }, async () => {
        let formRes = await queryCreateConfig('sj_itms_route_menus');
        if (formRes?.success) {
          this.setState({
            onlFormField: formRes.result,
            tableName: formRes.result[0].onlFormHead.tableName,
          });
        }
      });
    }
  };

  getKeyParam = key => {
    let params = {
      pageSize: 50,
      page: 1,
      superQuery: {
        queryParams: [
          {
            nestCondition: {
              matchType: 'or',
              queryParams: [
                {
                  field: 'org',
                  type: 'VarChar',
                  rule: 'like',
                  val: key,
                },
                {
                  field: 'org',
                  type: 'VarChar',
                  rule: 'isNull',
                  val: '',
                },
              ],
            },
          },
        ],
      },
    };
    return params;
  };

  tabChange = async key => {
    this.setState({ tabKey: key });
    let params = this.getKeyParam(key);
    if (key == 'SUPER') {
      params = {};
    }
    let res = await getRoutesTreeByParam(params);
    if (res.success) {
      let entityUuid = this.state.entityUuid;
      this.setState({ menusTree: res.data, entityUuid: undefined }, () => {
        this.onSelect([entityUuid]);
      });
    }
  };

  drawContent = () => {
    let orgMenus = [];
    org.map(e => {
      orgMenus.push(
        <TabPane tab={e.value} key={e.key}>
          {this.drawPage()}
        </TabPane>
      );
    });

    return (
      <Tabs
        // defaultActiveKey={org[0].key}
        activeKey={this.state.tabKey}
        onChange={e => this.tabChange(e)}
        destroyInactiveTabPane
      >
        {orgMenus}
      </Tabs>
    );
  };

  inputChange = (e, t) => {
    this.state.menusInfo[t] = e.target.value;
    this.setState({});
  };

  changeCreate = e => {
    if (e == 'route') {
      this.onSelect([this.state.entityUuid]);
    } else {
      let entityParam = this.createRef[this.state.tabKey]?.entity['sj_itms_route_menus']
        ? this.createRef[this.state.tabKey]?.entity['sj_itms_route_menus'][0].AUTHORITY
        : undefined;
      let permissionProps = {
        quickuuid: 'itms_permission',
        noBorder: true,
        showPageNow: 'update',
        params: { entityUuid: entityParam },
        searchField: 'KEY',
      };
      let createPage = (
        <div>
          <Create {...permissionProps} onRef={ref => (this.createRef[this.state.tabKey] = ref)} />
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <Button
              type="primary"
              onClick={async () => {
                await this.createRef[this.state.tabKey].onSave();
                // this.tabChange(this.state.tabKey);
              }}
            >
              保存
            </Button>
          </div>
        </div>
      );
      this.setState({ createPage: undefined }, () => {
        // if (entityParam)
        this.setState({ createPage });
      });
    }
    this.setState({ createPageKey: e });
  };

  drawPage = () => {
    const { onlFormField, tableName } = this.state;
    if (!(onlFormField || tableName)) return;
    let e = !this.state.createPage ? { display: 'none' } : {};
    return (
      <Row>
        <div className={styles.AuthorizeCom} style={{ ...this.props.style }}>
          <Content style={{ height: '100%', background: '#ffff !important' }}>
            <Layout style={{ height: '100%' }}>
              <Sider
                width={240}
                className={styles.leftWrapper}
                style={{ height: window.innerHeight - 200 }}
              >
                {/* {this.renderAllCheckbox()} */}
                {this.renderTree()}
              </Sider>
              <Divider type="vertical" style={{ height: window.innerHeight - 200 }} />
              <Content className={styles.rightWrapper}>
                <Tabs
                  // defaultActiveKey={this.state.createPageKey}
                  activeKey={this.state.createPageKey}
                  onChange={e => this.changeCreate(e)}
                  destroyInactiveTabPane
                >
                  <TabPane tab="前端路由" key="route">
                    <div style={{ height: '100%' }}>
                      <div style={e}>
                        {/* <Create {...createProps} onRef={ref => (this.createRef = ref)} /> */}
                        {this.state.createPage ? this.state.createPage : null}
                      </div>
                      <Empty hidden={this.state.entityUuid} />
                    </div>
                  </TabPane>
                  <TabPane tab="权限" key="permission">
                    {this.state.createPage ? this.state.createPage : null}
                  </TabPane>
                </Tabs>
              </Content>
            </Layout>
          </Content>
        </div>
      </Row>
    );
  };

  onSelect = async e => {
    const { onlFormField, tableName } = this.state;
    let createProps = {
      onlFormField,
      //   quickuuid: 'sj_itms_route_menus',
      tableName,
      noBorder: true,
      showPageNow: 'update',
      params: { entityUuid: e[0] },
      test: this.state.tabKey,
    };
    let createPage = (
      <div>
        <Create {...createProps} onRef={ref => (this.createRef[this.state.tabKey] = ref)} />
        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            onClick={async () => {
              await this.createRef[this.state.tabKey].onSave();
              this.tabChange(this.state.tabKey);
            }}
          >
            保存
          </Button>
        </div>
      </div>
    );

    this.setState({ entityUuid: e[0], createPage: undefined, createPageKey: 'route' }, () => {
      if (this.state.entityUuid) {
        this.setState({ createPage });
      }
    });
  };

  onCheck = (checkedKeys, e) => {
    let uuid = e?.node?.props?.eventKey;
    let checked = e?.node.props.checked;
    let param = {
      tableName: this.state.tableName,
      sets: { is_Enable: checked ? 0 : 1 },
      condition: {
        params: [
          {
            field: 'UUID',
            rule: 'eq',
            val: [uuid],
          },
        ],
      },
      updateAll: false,
    };
    updateEntity(param).then(e => {
      if (e.result > 0) {
        this.tabChange(this.state.tabKey);
        message.success('操作成功！');
      }
    });
    // console.log('check', e, e.node.props.eventKey);
  };

  renderTree = () => {
    const { menusTree } = this.state;
    if (menusTree.length <= 0) return;
    this.checkMenus = [];
    let treeNodes = this.getChild(menusTree);
    // let defaultCheck = menusTree.filter(e => e.isEnable == 1).map(e => e.uuid);
    return (
      <Tree
        checkStrictly
        checkable
        defaultExpandedKeys={[this.state.entityUuid]}
        defaultSelectedKeys={[this.state.entityUuid]}
        // defaultCheckedKeys={defaultCheck}
        checkedKeys={this.checkMenus}
        onSelect={this.onSelect}
        onCheck={this.onCheck}
      >
        {treeNodes}
      </Tree>
    );
  };

  newClick = e => {
    //阻止冒泡
    const ev = e || window.event;
    ev.stopPropagation();
    let { onlFormField } = this.state;

    onlFormField[0].onlFormFields.find(
      e => e.dbFieldName == 'P_UUID'
    ).fieldDefaultValue = this.state.entityUuid;

    onlFormField[0].onlFormFields.find(
      e => e.dbFieldName == 'ORG'
    ).fieldDefaultValue = this.createRef[this.state.tabKey].entity['sj_itms_route_menus'][0].ORG;

    onlFormField[0].onlFormFields.find(
      e => e.dbFieldName == 'PATH'
    ).fieldDefaultValue = this.createRef[this.state.tabKey].entity['sj_itms_route_menus'][0].PATH;

    this.setState({ onlFormField }, () => {
      this.routeCreateModal.show();
    });
  };

  getChild = menusTree => {
    if (!menusTree) return;
    let menus = [];
    menusTree.map(menu => {
      //找父级name 关联zhCN
      let pname = undefined;
      if (menu.puuid) {
        pname = this.state.menusTree.find(e => e.uuid == menu.puuid)?.name;
      }
      let title = (
        <div>
          {menu.puuid ? (
            <span>
              {zhCN[`menu.${pname}.${menu.name}`] ? zhCN[`menu.${pname}.${menu.name}`] : menu.name}
            </span>
          ) : (
            <span>{zhCN[`menu.${menu.name}`] ? zhCN[`menu.${menu.name}`] : menu.name}</span>
          )}
          {this.state.entityUuid == menu.uuid ? (
            <a
              style={{ marginRight: 15, marginLeft: 5 }}
              onClick={e => this.newClick(e)}
              // hidden={!havePermission(this.state.authority + '.leftEdit')}
            >
              新增
            </a>
          ) : null}
        </div>
      );
      menus.push(
        <TreeNode title={title} key={menu.uuid}>
          {this.getChild(menu.routes)}
        </TreeNode>
      );
      if (menu.isEnable == 1) {
        this.checkMenus.push(menu.uuid);
      }
    });
    return menus;
  };

  onSaved = async e => {
    //保存成功后 若有填写authority 新增默认权限
    let authority = e.param.entity['sj_itms_route_menus'][0]?.AUTHORITY;
    if (e.response?.success && authority) {
      //先判断是否存在该key 存在则不新增
      let queryParams = {
        tableName: 'sj_menus_permissions',
        condition: {
          params: [{ field: 'key', rule: 'eq', val: [authority] }],
        },
      };
      let queryRes = await dynamicQuery(queryParams);
      if (queryRes.success && queryRes?.result?.records == 'false') {
        let parentEntity = this.createRef[this.state.tabKey].entity['sj_itms_route_menus'][0];
        let entity = {
          sj_menus_permissions: [
            {
              KEY: authority,
              NAME: e.param.entity['sj_itms_route_menus'][0]?.NAME,
              SYSTEM_NAME: 'TMS系统功能',
              PROCESS_KEY: parentEntity.AUTHORITY,
              PROCESS_NAME: parentEntity.NAME, //关联zhCN太麻烦，生成后自行修改
              ORGS: parentEntity.ORG,
            },
          ],
          sj_menus_permissions_items: [
            // {
            //   KEY: authority+'.view',
            //   NAME: '查看',
            // },
          ],
        };
        const saveParam = { code: 'itms_permission', entity };
        let saveRes = await saveFormData(saveParam);
        if (saveRes.success) {
          message.success('权限：' + authority + '新增成功');
        } else {
          message.error('权限：' + authority + '新增失败');
        }
      }
    }
    this.routeCreateModal?.hide();
  };

  render() {
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Content style={{ marginLeft: '8px', height: '100%', overflow: 'hidden' }}>
            {this.drawContent()}
            <CreatePageModal
              modal={{
                title: '新增路由',
                width: 800,
                bodyStyle: { marginRight: '40px' },
                afterClose: () => {
                  this.tabChange(this.state.tabKey);
                },
              }}
              onSaved={e => this.onSaved(e)}
              page={{
                quickuuid: 'sj_itms_route_menus',
                noCategory: true,
                // params: { entityUuid: selectLineUuid },
                showPageNow: 'insert',
                onlFormField: this.state.onlFormField,
              }}
              onRef={node => (this.routeCreateModal = node)}
              //   customPage={LineSystemAddPage}
            />
          </Content>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
