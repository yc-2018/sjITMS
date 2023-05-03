import React, { Component } from 'react';
import { Layout, Row, Col, Modal, Button, Tabs, Divider, Tree, Input, Empty, message } from 'antd';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { getRoutesTreeByParam, dragRouteMenu } from '@/services/route/Route';
import { query, getResourceKeys, authorize } from '@/services/account/Company';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { confirmLeaveFunc, formatDate } from '@/utils/utils';
import { orderBy, uniqBy } from 'lodash';

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

  inputChange = (e, t) => {
    this.state.menusInfo[t] = e.target.value;
    this.setState({});
  };

  //权限保存后 自动赋权
  permissionSaved = res => {
    let newResources = res.param.entity['sj_menus_permissions_items']?.map(e => e.KEY);
    if (newResources && newResources.length > 0) {
      this.grantedPermission(newResources);
    }
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
          <Create
            {...permissionProps}
            onRef={ref => (this.createRef[this.state.tabKey] = ref)}
            onSaved={this.permissionSaved}
          />
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

  //点击树事件
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

  //是否勾选
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

  deepCopy = source => {
    if (typeof source != 'object') {
      return source;
    }
    if (source == null) {
      return source;
    }
    var newObj = source.constructor === Array ? [] : {}; //开辟一块新的内存空间
    for (var i in source) {
      newObj[i] = this.deepCopy(source[i]);
    }
    return newObj;
  };
  //查找树里面的节点
  getNodeById = (tree, id) => {
    let arr = Array.isArray(tree) ? this.deepCopy(tree) : this.deepCopy([tree]);
    let result = null;
    while (arr.length) {
      let item = arr.pop();
      if (item && item.uuid === id) {
        result = item;
        break;
      } else if (item && item.routes && item.routes.length) {
        arr.push(...item.routes);
      }
    }
    return result;
  };

  //拖拽
  onDrop = async info => {
    const { dropToGap, dragNode, node } = info;
    let dragKey = dragNode.props.eventKey; //移动的树节点
    let dragPos = dragNode.props.pos.split('-');
    let nodeKey = node.props.eventKey; //目标树节点
    let dropPos = node.props.pos.split('-');
    let param = {
      dropNodeKey: dragKey,
    };
    let requestBody = [];
    //dropToGap false为更改父uuid
    if (!dropToGap) {
      param = {
        ...param,
        targetKey: nodeKey,
      };
    } else {
      //排序 修改序号
      const { menusTree } = this.state;
      let dragInfo = this.getNodeById(menusTree, dragKey);
      let nodeInfo = this.getNodeById(menusTree, nodeKey);
      if (dragInfo.puuid != nodeInfo.puuid) {
        //父级不同则需要更改父级
        param = { ...param, targetKey: nodeInfo.puuid };
      }
      let nodes = this.getNodeById(menusTree, nodeInfo?.puuid)?.routes;
      if (!nodes) {
        //无child则为顶级
        nodes = menusTree;
      }
      //先将移动的节点移出数组
      nodes = nodes.filter(e => e.uuid != dragKey);
      //找到目标位置的下标
      let i = nodes.findIndex(e => e.uuid == nodeKey);
      let nodeSort = Number(dropPos[dropPos.length - 1]); //end position
      let sort = info.dropPosition;
      //antd tree节点index计算规则 参考https://www.cnblogs.com/tommymarc/p/16718446.html
      let trueDropPosition = sort - nodeSort;
      if (trueDropPosition === -1) {
        // 移动到最顶级第一个位置
        nodes.splice(i, 0, dragInfo);
      } else {
        // trueDropPosition:   1 | 0
        nodes.splice(i + 1, 0, dragInfo);
      }
      //sort赋值
      nodes.map((e, index) => {
        e.sort = index;
      });
      requestBody = nodes;
    }
    let res = await dragRouteMenu(param, requestBody);
    if (res.success) {
      this.tabChange(this.state.tabKey);
      message.success('操作成功！');
    }
  };

  onDragEnter = info => {
    //console.log(info);
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  };

  //新建菜单
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

  //判断b数组是否全部在a数组内
  isContained = (a, b) => {
    // a和b其中一个不是数组，直接返回false
    if (!(a instanceof Array) || !(b instanceof Array)) return false;
    const len = b.length;
    // a的长度小于b的长度，直接返回false
    if (a.length < len) return false;
    for (let i = 0; i < len; i++) {
      // 遍历b中的元素，遇到a没有包含某个元素的，直接返回false
      if (!a.includes(b[i])) return false;
    }
    // 遍历结束，返回true
    return true;
  };

  //企业端赋权
  grantedPermission = async newResources => {
    let res = await query({ searchKeyValues: { codeName: loginCompany().code } });
    if (res.data?.records) {
      const company = res.data.records[0];
      const { uuid, version, validDate } = company;
      getResourceKeys(uuid).then(async resourceRes => {
        let resources = resourceRes.data;
        let isContained = this.isContained(resources, newResources);
        //全部包含则不更新
        if (isContained) return;
        let uniqResources = uniqBy([...resources, ...newResources]);

        if (resourceRes.success && resources) {
          const auth = {
            validDate: formatDate(validDate),
            resources: uniqResources,
            uuid: uuid,
            version: version,
          };
          let au = await authorize(auth);
          if (au.success) {
            message.success('企业端权限赋权成功！');
          }
        }
      });
    }
  };

  //菜单保存后新增权限
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
          //默认父级为init 需要后面自行调整
          sj_menus_permissions: [
            {
              KEY: authority,
              NAME: e.param.entity['sj_itms_route_menus'][0]?.NAME,
              SYSTEM_NAME: 'TMS系统功能',
              PROCESS_KEY: 'sj.exec.init', //parentEntity.AUTHORITY,
              PROCESS_NAME: '初始化权限', //parentEntity.NAME, //关联zhCN太麻烦，生成后自行修改
              ORGS: parentEntity.ORG,
            },
          ],
          sj_menus_permissions_items: [
            {
              KEY: authority + '.view',
              NAME: '查看',
            },
          ],
        };
        const saveParam = { code: 'itms_permission', entity };
        let saveRes = await saveFormData(saveParam);
        if (saveRes.success) {
          message.success('权限：' + authority + '新增成功');
          //权限增加成功后 自动给企业赋权 简化操作
          this.grantedPermission([authority + '.view']);
        } else {
          message.error('权限：' + authority + '新增失败');
        }
      }
    }
    this.routeCreateModal?.hide();
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
        onDrop={this.onDrop}
        draggable
        onDragEnter={this.onDragEnter}
      >
        {treeNodes}
      </Tree>
    );
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
