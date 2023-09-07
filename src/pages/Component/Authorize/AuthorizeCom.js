import { Table, Checkbox, Collapse, Row, Col, Tooltip, Layout, Tree } from 'antd';
import React, { Component, Fragment, useState, PureComponent } from 'react';
import styles from './AuthorizeCom.less';
import { getArrEqual } from '@/utils/utils';
import IToolTip from '@/pages/Component/IToolTip';
import { guid } from '@/utils/utils';
import ReactDOM from 'react-dom';
import ConfigSiderPage from '@/pages/Component/Page/inner/ConfigSiderPage';
// import { CaretRightOutlined } from '@ant-design/icons';
const { Content, Sider } = Layout;
const Panel = Collapse.Panel;
const TreeNode = Tree.TreeNode;
import IconFont from '@/components/IconFont';

/**
 * 权限组件，需传入内容
 * data：权限数据来源，数组
 * disabled：是否可编辑
 * checkedKeys：已选中的选项key，数组
 * authorize：授权方法，传入当前组件的选中项集合
 */
export default class AuthorizeCom extends PureComponent {
  constructor(props) {
    super(props);

    let permKeys = [];
    if (props.data) {
      props.data.forEach(function(record) {
        record.resources.forEach(function(m) {
          m.perms.forEach(function(perm) {
            permKeys.push(perm.key);
          });
        });
      });
    }

    this.state = {
      checkedKeys: props.checkedKeys ? props.checkedKeys : [],
      disabled: props.disabled,
      data: props.data,
      orgType: props.orgType,
      permKeys: permKeys,
      siderCheckKeys: { checked: [], halfChecked: [] },
      contentCheckKeys: [],
      processData: [],
      moduleData: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    let permKeys = [];
    if (nextProps.data) {
      nextProps.data.forEach(function(record) {
        record.resources.forEach(function(m) {
          m.perms.forEach(function(perm) {
            permKeys.push(perm.key);
          });
        });
      });
    }
    if (nextProps.checkedKeys && nextProps.checkedKeys != this.state.checkedKeys) {
      this.filterProcessKeys(
        nextProps.data ? nextProps.data : this.state.data,
        nextProps.checkedKeys
      );
      this.filterModuleKeys(this.state.moduleData, nextProps.checkedKeys);
    }
    this.setState({
      checkedKeys: nextProps.checkedKeys ? nextProps.checkedKeys : [],
      disabled: nextProps.disabled,
      data: nextProps.data,
      permKeys: permKeys,
    });
  }

  componentDidMount() {
    this.filterProcessKeys(this.props.data, this.props.checkedKeys);
  }

  /** 判断所有权限复选框是否处于半选状态*/
  refreshAllIndeterminate = () => {
    let { checkedKeys, permKeys } = this.state;

    if (!checkedKeys || checkedKeys.length === 0) {
      return false;
    }

    let equalKeys = getArrEqual(permKeys, checkedKeys);
    if (equalKeys.length > 0 && equalKeys.length < permKeys.length) {
      return true;
    }

    return false;
  };

  /** 刷新全部权限复选框是否是全选状态*/
  refreshAllChecked = () => {
    let { checkedKeys, permKeys } = this.state;
    if (!checkedKeys) {
      return false;
    }

    for (let i = 0; i < permKeys.length; i++) {
      if (checkedKeys.indexOf(permKeys[i]) < 0) {
        return false;
      }
    }
    return true;
  };

  /** 当全部权限复选框被选中或者取消选中时触发*/
  allOnChange = e => {
    let { checkedKeys, permKeys, orgType } = this.state;
    let nowCheckedKeys = checkedKeys.concat();
    if (e.target.checked) {
      for (let i = 0; i < permKeys.length; i++) {
        if (nowCheckedKeys.indexOf(permKeys[i]) === -1) {
          nowCheckedKeys.push(permKeys[i]);
        }
      }
    } else {
      for (let i = 0; i < permKeys.length; i++) {
        var index = nowCheckedKeys.indexOf(permKeys[i]);
        if (index > -1) {
          nowCheckedKeys.splice(index, 1);
        }
      }
    }
    this.setState({
      checkedKeys: nowCheckedKeys,
    });

    if (this.props.authorize) {
      const diff = this.findDiffPerms(nowCheckedKeys);
      this.props.authorize(nowCheckedKeys, orgType, diff);
    }
  };

  /** 刷新收缩面板头部复选框是否处于半选状态*/
  refreshHeaderIndeterminate = (systemName, newCheckeys) => {
    let { checkedKeys, data } = this.state;
    if (newCheckeys) {
      checkedKeys = newCheckeys;
    }
    if (!checkedKeys) return false;
    let permKeys = [];
    data.forEach(function(record) {
      if (record.systemName === systemName) {
        record.resources.forEach(function(m) {
          m.perms.forEach(function(perm) {
            permKeys.push(perm.key);
          });
        });
      }
    });
    let equalArray = getArrEqual(checkedKeys, permKeys);
    if (equalArray.length === 0 || equalArray.length === permKeys.length) return false;
    return true;
  };

  /** 刷新收缩面板头部复选框是否是全选状态*/
  refreshHeaderChecked = (systemName, newCheckeys) => {
    let { checkedKeys, data } = this.state;
    if (newCheckeys) {
      checkedKeys = newCheckeys;
    }
    if (!checkedKeys) return false;
    let permKeys = [];
    data.forEach(function(record) {
      if (record.systemName === systemName) {
        record.resources.forEach(function(m) {
          m.perms.forEach(function(perm) {
            permKeys.push(perm.key);
          });
        });
      }
    });
    for (let i = 0; i < permKeys.length; i++) {
      if (checkedKeys.indexOf(permKeys[i]) < 0) {
        return false;
      }
    }
    return true;
  };

  /** 当收缩面板头部复选框被选中或者取消选中时触发*/
  headerOnChange = (systemName, e) => {
    let { checkedKeys, data, orgType } = this.state;
    let nowCheckedKeys = checkedKeys.concat();
    let permKeys = [];
    data.forEach(function(record) {
      if (record.systemName === systemName) {
        record.resources.forEach(function(m) {
          m.perms.forEach(function(perm) {
            permKeys.push(perm.key);
          });
        });
      }
    });
    if (e.checked) {
      for (let i = 0; i < permKeys.length; i++) {
        if (nowCheckedKeys.indexOf(permKeys[i]) === -1) nowCheckedKeys.push(permKeys[i]);
      }
    } else {
      for (let i = 0; i < permKeys.length; i++) {
        var index = nowCheckedKeys.indexOf(permKeys[i]);
        if (index > -1) {
          nowCheckedKeys.splice(index, 1);
        }
      }
    }
    this.setState({
      checkedKeys: nowCheckedKeys,
    });

    if (this.props.authorize) {
      const diff = this.findDiffPerms(nowCheckedKeys);
      this.props.authorize(nowCheckedKeys, orgType, diff);
    }
  };

  /** 刷新流程复选框是否是半选状态*/
  refreshProcessIndeterminate = (row, newCheckeys) => {
    let { checkedKeys, data } = this.state;
    if (newCheckeys) {
      checkedKeys = newCheckeys;
    }
    if (!checkedKeys) return false;
    let permKeys = [];
    data.forEach(function(record) {
      if (record.systemName === row.systemName) {
        record.resources.forEach(function(m) {
          let processKey = '';
          if (row.processKey) {
            processKey = row.processKey.split(':')[0];
          }
          if (m.processKey === processKey) {
            m.perms.forEach(function(perm) {
              permKeys.push(perm.key);
            });
          }
        });
      }
    });
    let equalArray = getArrEqual(checkedKeys, permKeys);
    if (equalArray.length === 0 || equalArray.length === permKeys.length) return false;
    return true;
  };

  /** 刷新流程复选框是否处于全选状态*/
  refreshProcessChecked = (row, newCheckeys) => {
    let { checkedKeys, data } = this.state;
    if (newCheckeys) {
      checkedKeys = newCheckeys;
    }
    if (!checkedKeys) return false;
    let permKeys = [];
    data.forEach(function(record) {
      if (record.systemName === row.systemName) {
        record.resources.forEach(function(m) {
          let processKey = '';
          if (row.processKey) {
            processKey = row.processKey.split(':')[0];
          }
          if (m.processKey === processKey) {
            m.perms.forEach(function(perm) {
              permKeys.push(perm.key);
            });
          }
        });
      }
    });
    for (let i = 0; i < permKeys.length; i++) {
      if (checkedKeys.indexOf(permKeys[i]) < 0) {
        return false;
      }
    }
    return true;
  };

  /** 流程复选框被选中或者取消时触发*/
  processOnChange = (row, e) => {
    let { checkedKeys, data, orgType } = this.state;
    let nowCheckedKeys = checkedKeys.concat();
    let permKeys = [];
    data.forEach(function(record) {
      if (record.systemName === row.systemName) {
        record.resources.forEach(function(m) {
          if (m.processKey === row.processKey) {
            m.perms.forEach(function(perm) {
              permKeys.push(perm.key);
            });
          }
        });
      }
    });
    if (e.checked) {
      for (let i = 0; i < permKeys.length; i++) {
        if (nowCheckedKeys.indexOf(permKeys[i]) === -1) nowCheckedKeys.push(permKeys[i]);
      }
    } else {
      for (let i = 0; i < permKeys.length; i++) {
        var index = nowCheckedKeys.indexOf(permKeys[i]);
        if (index > -1) {
          nowCheckedKeys.splice(index, 1);
        }
      }
    }
    this.setState({
      checkedKeys: nowCheckedKeys,
    });

    if (this.props.authorize) {
      const diff = this.findDiffPerms(nowCheckedKeys);
      this.props.authorize(nowCheckedKeys, orgType, diff);
    }
  };

  /** 刷新模板复选框是否是半选状态*/
  refreshModuleIndeterminate = (row, newCheckeys) => {
    let { checkedKeys } = this.state;
    if (newCheckeys) {
      checkedKeys = newCheckeys;
    }
    if (!checkedKeys) return false;
    let permKeys = [];
    row.perms.forEach(function(perm) {
      permKeys.push(perm.key);
    });
    let equalArray = getArrEqual(checkedKeys, permKeys);
    if (equalArray.length === 0 || equalArray.length === permKeys.length) return false;
    return true;
  };

  /** 模块权限是否是全选状态*/
  refreshModuleChecked = (row, newCheckeys) => {
    let { checkedKeys } = this.state;
    if (newCheckeys) {
      checkedKeys = newCheckeys;
    }
    let allChecked = true;
    for (let i = 0; i < row.perms.length; i++) {
      if (checkedKeys.indexOf(row.perms[i].key) === -1) {
        allChecked = false;
      }
    }
    if (allChecked) return true;
    else return false;
  };

  /** 当模块权限被选中或者取消时触发 */
  moduleOnChange = (row, e) => {
    let { checkedKeys, orgType } = this.state;
    let nowCheckedKeys = checkedKeys.concat();
    if (e.checked) {
      for (let i = 0; i < row.perms.length; i++) {
        nowCheckedKeys.push(row.perms[i].key);
      }
    } else {
      for (let i = 0; i < row.perms.length; i++) {
        var index = nowCheckedKeys.indexOf(row.perms[i].key);
        if (index > -1) {
          nowCheckedKeys.splice(index, 1);
        }
      }
    }
    this.setState({
      checkedKeys: nowCheckedKeys,
    });

    if (this.props.authorize) {
      const diff = this.findDiffPerms(nowCheckedKeys);
      this.props.authorize(nowCheckedKeys, orgType, diff);
    }
  };

  findDiffPerms = nowCheckedKeys => {
    const oldCheckedKeys = this.props.checkedKeys ? this.props.checkedKeys : [];
    let addedPermsArr = nowCheckedKeys.filter(i => {
      return !oldCheckedKeys.includes(i);
    });
    let removedPermsArr = oldCheckedKeys.filter(i => {
      return !nowCheckedKeys.includes(i);
    });
    return {
      addedPerms: addedPermsArr,
      removedPerms: removedPermsArr,
    };
  };

  /** 判断操作权限是否被选中*/
  refreshPermChecked = (key, newCheckeys) => {
    let { checkedKeys } = this.state;
    if (newCheckeys) {
      checkedKeys = newCheckeys;
    }
    if (!checkedKeys) {
      return false;
    }

    if (checkedKeys.indexOf(key) >= 0) {
      return true;
    }
    return false;
  };

  /** 操作权限被选中或者取消时触发*/
  permOnChange = (keys, e) => {
    let { checkedKeys, orgType } = this.state;
    let nowCheckedKeys = checkedKeys.concat();
    if (e.checked) {
      keys.forEach(key => {
        if (nowCheckedKeys.indexOf(key) === -1) {
          nowCheckedKeys.push(key);
        }
      });
    } else {
      keys.forEach(key => {
        var index = nowCheckedKeys.indexOf(key);
        if (index > -1) {
          nowCheckedKeys.splice(index, 1);
        }
      });
    }
    this.setState({
      checkedKeys: nowCheckedKeys,
    });

    if (this.props.authorize) {
      const diff = this.findDiffPerms(nowCheckedKeys);
      this.props.authorize(nowCheckedKeys, orgType, diff);
    }
  };

  renderAllCheckbox = () => {
    return (
      <Checkbox
        key="all_perm"
        disabled={this.state.disabled}
        onChange={this.allOnChange}
        indeterminate={this.refreshAllIndeterminate()}
        checked={this.refreshAllChecked()}
      >
        <span style={{ color: '#354052' }}>全部</span>
      </Checkbox>
    );
  };

  /**
   * 获取流程key
   */

  getModuleTreeData = (key, e) => {
    const item = e;
    let treeData = [];
    if (e.perms.length > 0) {
      treeData = e.perms;
    }
    this.setState({ moduleData: treeData });
    return treeData;
  };

  /**
   * 筛选流程key初始值
   */
  filterProcessKeys = (processData, nextCheckKeys) => {
    let siderCheckKeys = { ...this.state.siderCheckKeys };
    if (processData.length > 0) {
      let rows = [];
      processData.forEach(item => {
        if (item.resources && item.resources.length > 0) {
          item.resources.forEach(e => {
            rows.push({
              systemName: e.systemName,
              processKey: e.processKey,
              perms: e.perms,
              modulesKey: e.key,
            });
          });
        }
      });
      if (rows.length > 0) {
        rows.forEach(row => {
          if (this.refreshHeaderIndeterminate(row.systemName, nextCheckKeys)) {
            if (!siderCheckKeys.halfChecked.includes(row.systemName)) {
              siderCheckKeys.halfChecked.push(row.systemName);
            }
          } else {
            let id = siderCheckKeys.halfChecked.findIndex(e => row.systemName === e);
            if (id > -1) {
              siderCheckKeys.halfChecked.splice(id, 1);
            }
          }
          if (this.refreshHeaderChecked(row.systemName, nextCheckKeys)) {
            if (!siderCheckKeys.checked.includes(row.systemName)) {
              siderCheckKeys.checked.push(row.systemName);
            }
          } else {
            let id = siderCheckKeys.checked.findIndex(e => row.systemName === e);
            if (id > -1) {
              siderCheckKeys.checked.splice(id, 1);
            }
          }

          if (this.refreshProcessChecked(row, nextCheckKeys)) {
            if (!siderCheckKeys.checked.includes(row.processKey))
              siderCheckKeys.checked.push(row.processKey);
          } else {
            let id = siderCheckKeys.checked.findIndex(e => row.processKey === e);
            if (id > -1) {
              siderCheckKeys.checked.splice(id, 1);
            }
          }
          if (this.refreshProcessIndeterminate(row, nextCheckKeys)) {
            if (!siderCheckKeys.halfChecked.includes(row.processKey))
              siderCheckKeys.halfChecked.push(row.processKey);
          } else {
            let id = siderCheckKeys.halfChecked.findIndex(e => row.processKey === e);
            if (id > -1) {
              siderCheckKeys.halfChecked.splice(id, 1);
            }
          }

          if (this.refreshModuleChecked(row, nextCheckKeys)) {
            if (!siderCheckKeys.checked.includes(row.modulesKey))
              siderCheckKeys.checked.push(row.modulesKey);
          } else {
            let id = siderCheckKeys.checked.findIndex(e => row.modulesKey === e);
            if (id > -1) {
              siderCheckKeys.checked.splice(id, 1);
            }
          }

          if (this.refreshModuleIndeterminate(row, nextCheckKeys)) {
            if (!siderCheckKeys.halfChecked.includes(row.modulesKey))
              siderCheckKeys.halfChecked.push(row.modulesKey);
          } else {
            let id = siderCheckKeys.halfChecked.findIndex(e => row.modulesKey === e);
            if (id > -1) {
              siderCheckKeys.halfChecked.splice(id, 1);
            }
          }
        });
      }
      this.setState({
        siderCheckKeys,
      });
    }
  };

  filterModuleKeys = (moduleData, nextCheckKeys) => {
    // let {contentCheckKeys} = this.state;
    let contentCheckKeys = [];
    if (moduleData.length > 0) {
      moduleData.forEach(row => {
        if (this.refreshPermChecked(row.key, nextCheckKeys)) {
          if (!contentCheckKeys.includes(row.key)) contentCheckKeys.push(row.key);
        }
      });
    }
    this.setState({
      contentCheckKeys,
    });
  };
  /** 渲染折叠面板，根据权限所属系统渲染多个折叠面板*/
  renderTree = () => {
    let { data, siderCheckKeys } = this.state;
    if (data && data.length > 0) {
      return data.length > 0 ? (
        <Tree
          blockNode
          checkable
          checkStrictly
          onCheck={this.onCheck}
          checkedKeys={siderCheckKeys}
          onSelect={this.onSelect}
        >
          {data.map(item => {
            if (this.props.orgType === 'DC') {
              if (item.systemName != 'SCC' && item.systemName != 'RF') {
                return (
                  <TreeNode
                    isLeaf={false}
                    checkable
                    title={item.systemName}
                    key={item.systemName}
                    dataRef={item}
                    type={'system'}
                    disableCheckbox={this.state.disabled}
                    selectable={true}
                  >
                    {item.resources.length > 0 &&
                      item.resources.map(row => {
                        if (row.first) {
                          return (
                            <TreeNode
                              title={row.processName}
                              dataRef={row}
                              type={'process'}
                              key={row.processKey}
                              disableCheckbox={this.state.disabled}
                              selectable={true}
                              isLeaf={false}
                            >
                              {this.loopMapModules(item.resources, row.processKey)}
                            </TreeNode>
                          );
                        }
                      })}
                  </TreeNode>
                );
              } else {
                return (
                  item.resources.length > 0 &&
                  item.resources.map(row => {
                    if (row.first) {
                      return (
                        <TreeNode
                          title={row.processName}
                          dataRef={row}
                          type={'process'}
                          key={row.processKey}
                          disableCheckbox={this.state.disabled}
                          selectable={true}
                          isLeaf={false}
                        >
                          {this.loopMapModules(item.resources, row.processKey)}
                        </TreeNode>
                      );
                    }
                  })
                );
              }
            } else {
              if (item.systemName != 'SCC' && item.systemName != 'RF')
                return (
                  <TreeNode
                    isLeaf={false}
                    checkable
                    title={item.systemName}
                    key={item.systemName}
                    dataRef={item}
                    type={'system'}
                    disableCheckbox={this.state.disabled}
                    selectable={true}
                  >
                    {item.resources.length > 0 &&
                      item.resources.map(row => {
                        return (
                          row.first &&
                          row.processName != 'SCC供应链协同' &&
                          row.processName != 'RF' && (
                            <TreeNode
                              title={row.processName}
                              dataRef={row}
                              type={'process'}
                              key={row.processKey}
                              disableCheckbox={this.state.disabled}
                              selectable={true}
                              isLeaf={false}
                            >
                              {this.loopMapModules(item.resources, row.processKey)}
                            </TreeNode>
                          )
                        );
                      })}
                  </TreeNode>
                );
            }
          })}
        </Tree>
      ) : null;
    }
  };

  // 渲染Modules节点
  loopMapModules = (arr, firstKey) => {
    let leafArr = [];
    let leafNode = null;
    if (arr.length > 0) {
      arr.forEach(item => {
        if (item.processKey === firstKey) {
          leafArr.push(item);
        }
      });
    }

    if (leafArr.length > 0) {
      leafNode = leafArr.map(modules => {
        return (
          <TreeNode
            title={modules.name}
            key={modules.key}
            type={'modules'}
            dataRef={modules}
            disableCheckbox={this.state.disabled}
            selectable={true}
            isLeaf={true}
          />
        );
      });
    }

    return leafNode;
  };

  onCheck = (checkedKeys, e) => {
    const { siderCheckKeys } = this.state;
    if (e.node.props.type === 'process') {
      this.processOnChange(e.node.props.dataRef, e);
    } else if (e.node.props.type === 'modules') {
      this.moduleOnChange(e.node.props.dataRef, e);
    } else {
      this.headerOnChange(e.node.props.dataRef.systemName, e);
    }

    this.setState({
      siderCheckKeys: checkedKeys,
    });
  };

  onSelect = (selectedKeys, e) => {
    if (
      e.selectedNodes &&
      e.selectedNodes.length > 0 &&
      e.selectedNodes[0].props.type &&
      e.selectedNodes[0].props.type === 'modules'
    ) {
      let { moduleData } = this.state;
      if (selectedKeys.length > 0) {
        moduleData = this.getModuleTreeData(selectedKeys[0], e.node.props.dataRef);
        this.filterModuleKeys(moduleData);
      }
    } else {
      this.setState({
        contentCheckKeys: [],
        moduleData: [],
      });
    }
  };
  /** 渲染content折叠面板，根据权限所属系统渲染多个折叠面板*/
  renderContentTree = (moduleData, checkedKeys) => {
    let { data, contentCheckKeys } = this.state;
    if (checkedKeys) {
      contentCheckKeys = checkedKeys;
    }
    return (
      <Tree checkable onCheck={this.onCheckContent} checkedKeys={contentCheckKeys}>
        {moduleData.map(item => {
          return (
            <TreeNode
              isLeaf={true}
              checkable
              title={item.name}
              key={item.key}
              dataRef={item}
              type={'perms'}
              disableCheckbox={this.state.disabled}
            />
          );
        })}
      </Tree>
    );
  };
  onCheckContent = (checkedKeys, e) => {
    let { contentCheckKeys } = this.state;
    this.getTargetModuleRow(checkedKeys, contentCheckKeys, e);
    this.setState({
      contentCheckKeys: checkedKeys,
    });
  };

  getTargetModuleRow = (nowChecked, oldChecked, e) => {
    const { data, moduleData } = this.state;
    let row = {};
    let nowCheckedKeys = nowChecked;
    let oldCheckedKeys = oldChecked;
    let key = [];
    if (e.checked) {
      for (let i = 0; i < nowCheckedKeys.length; i++) {
        if (!oldCheckedKeys.includes(nowCheckedKeys[i])) {
          key.push(nowCheckedKeys[i]);
        }
      }
    } else {
      for (let i = 0; i < oldCheckedKeys.length; i++) {
        if (!nowCheckedKeys.includes(oldCheckedKeys[i])) {
          key.push(oldCheckedKeys[i]);
        }
      }
    }
    if (key.length > 0) {
      this.permOnChange(key, e);
    }
  };

  render() {
    const { data, moduleData, contentCheckKeys } = this.state;

    return (
      <div className={styles.AuthorizeCom} style={this.props.style}>
        <Content style={{ height: '100%' }}>
          <Layout style={{ height: '100%' }}>
            <Sider width={240} className={styles.leftWrapper}>
              {this.renderAllCheckbox()}
              {this.renderTree()}
            </Sider>
            <Content className={styles.rightWrapper}>
              {moduleData.length > 0 ? this.renderContentTree(moduleData, contentCheckKeys) : null}
            </Content>
          </Layout>
        </Content>
      </div>
    );
  }
}
