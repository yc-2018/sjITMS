/*
 * @Author: Liaorongchang
 * @Date: 2023-03-27 17:04:08
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-29 11:54:43
 * @version: 1.0
 */
/*
 * @Author: Liaorongchang
 * @Date: 2023-03-27 17:04:08
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-06-21 15:44:32
 * @version: 1.0
 */
import React from 'react';
import { connect } from 'dva';
import { Menu, Tabs, Button, message, Empty, Input, Tooltip, Icon } from 'antd';
import emptySvg from '@/assets/common/img_empoty.svg';
import PageLoading from '@/components/PageLoading';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import SiderPage from '@/pages/Component/Page/SiderPage';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import { RESOURCE_IWMS_ACCOUNT_ROLE_CREATE, ROLE_STATUS } from '@/utils/constants';
import RoleToolbarPanel from './RoleToolbarPanel';
import styles from './role.less';
import RoleUserInfo from './RoleUserInfo';
import RoleCreateForm from './RoleCreateForm';
import RoleDeleteConfirmModal from './RoleDeleteConfirmModal';
import RoleAddUserModal from './RoleAddUserModal';
import RolePermissionInfo from './RolePermissionInfo';
import { havePermission } from '@/utils/authority';
import { ROLE_RES } from './RolePermission';
import { commonLocale } from '@/utils/CommonLocale';
import { roleLocale } from './RoleLocale';
import { orgType } from '@/utils/OrgType';
import siderStyle from '@/pages/Component/Page/inner/SiderPage.less';
import BMSAuthorizeCom from '@/pages/Component/BMSAuthorize/BMSAuthorizeCom';
const { SubMenu } = Menu;

const TabPane = Tabs.TabPane;
const taskTypeMap = { delete: 'delete' };

@connect(({ role, loading, user }) => ({
  role,
  user,
  loading: loading.models.role,
}))
export default class Role extends SiderPage {
  constructor(props) {
    super(props);
    this.state = {
      // title: roleLocale.title,
      directory: [],
      selectedKeys: [],
      expandedKeys: [],
      createModalVisible: false,
      selectedRows: [],
      userData: {
        list: [],
        pagination: {},
      },
      pageFilter: {
        page: 0,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {},
        changePage: false,
      },
      loadingUser: false,
      editRole: {},
      selectedRole: {},
      roles: [],
      menuSelectedKeys: [],
      deleteConfrimModalVisible: false,
      addUserModalVisible: false,
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      taskInfo: {
        total: 0,
        type: '',
      },
      failedTasks: [],
      resourceTree: [],
      storeResourceTree: [],
      vendorResourceTree: [],
      carrierResourceTree: [],
      dcResourceTree: [],
      checkedResourceKeys: [],
      storeCheckedResourceKeys: [],
      vendorCheckedResourceKeys: [],
      carrierCheckedResourceKeys: [],
      dispatchCenterResourceTree: [],
      dcCheckedResourceKeys: [],
      dispatchCenterCheckedResourceKeys: [],
      ownerCheckedResourceTree: [],
      ownerCheckedResourceKeys: [],
      bmsCheckedResourceTree: [],
      bmsCheckedResourceKeys: [],
      contentStyle: {
        marginTop: 0,
      },
    };
  }
  componentDidMount() {
    this.refreshView();
    this.fetchResources();
  }

  /**
   * 刷新角色主界面（重新获取角色信息，默认选中第一个）
   */
  refreshView = () => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    this.setState({
      noData: false,
    });

    dispatch({
      type: 'role/getByOrgUuid',
      callback: response => {
        if (response && response.success && response.data) {
          let data = response.data;
          if (data && data.length > 0) {
            let firstEntity = data[0];
            this.setMenuSelectedKeys(firstEntity.uuid);
            this.setState({
              roles: data,
              selectedRole: firstEntity,
            });

            this.fetchUserByRoleUuid(firstEntity.uuid);
            this.fetchRoleResourceKeysByUuid(firstEntity.uuid);
          }
        } else {
          this.setState({
            noData: true,
          });
        }
      },
    });
  };

  /**
   * 获取资源树列表
   */
  fetchResources = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/getResourcesByUser',
      payload: loginUser().uuid,
      callback: response => {
        if (response && response.success) {
          let res;
          if (response.data) {
            res = response.data;
          } else {
            res = new Array();
          }

          this.setState({
            resourceTree: res[orgType.company.name] ? res[orgType.company.name] : [],
            dcResourceTree: res[orgType.dc.name] ? res[orgType.dc.name] : [],
            vendorResourceTree: res[orgType.vendor.name] ? res[orgType.vendor.name] : [],
            storeResourceTree: res[orgType.store.name] ? res[orgType.store.name] : [],
            carrierResourceTree: res[orgType.carrier.name] ? res[orgType.carrier.name] : [],
            dispatchCenterResourceTree: res[orgType.dispatchCenter.name]
              ? res[orgType.dispatchCenter.name]
              : [],
            ownerCheckedResourceTree: res[orgType.owner.name] ? res[orgType.owner.name] : [],
            bmsCheckedResourceTree: res[orgType.bms.name] ? res[orgType.bms.name] : [],
          });
        }
      },
    });
  };

  /**
   * 设置侧边栏selectedKey，清空以前设置过的
   * @param {string, Array} selectedKeys
   */
  setMenuSelectedKeys = selectedKeys => {
    const { menuSelectedKeys } = this.state;

    menuSelectedKeys.splice(0, menuSelectedKeys.length);
    menuSelectedKeys.push(selectedKeys);

    this.setState({
      menuSelectedKeys: menuSelectedKeys,
    });
  };

  fetchUserByRoleUuid = roleUuid => {
    const { dispatch } = this.props;
    const { userData, pageFilter } = this.state;

    this.setState({
      loadingUser: true,
    });

    if (!pageFilter || !pageFilter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }

    pageFilter.searchKeyValues['roleUuid'] = roleUuid;
    if (orgType.company.name === loginOrg().type)
      pageFilter.searchKeyValues['companyUuid'] = loginOrg().uuid;
    dispatch({
      type: 'user/query',
      payload: pageFilter,
      callback: response => {
        if (response && response.success) {
          let list = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
            showTotal: response.data.paging.more ? undefined : total => `共 ${total} 条`,
          };

          userData.list = list;
          userData.pagination = pagination;

          this.setState({
            userData: { ...userData },
          });
        }

        this.setState({
          loadingUser: false,
        });
      },
    });
  };

  handleRoleUserTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { pageFilter, selectedRole } = this.state;

    this.setState({
      loadingUser: true,
    });

    if (pageFilter.page !== pagination.current - 1) {
      pageFilter.changePage = true;
    }

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    if (sorter.field) {
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      // 排序触发表格变化清空表格选中行，分页则不触发
      if (pageFilter.sortFields[sortField] === sortType) {
        pageFilter.changePage = true;
      } else {
        pageFilter.changePage = false;
      }
      // 如果有排序字段，则需要将原来的清空
      pageFilter.sortFields = {};
      pageFilter.sortFields[sortField] = sortType;
    }

    this.setState({
      pageFilter: pageFilter,
    });

    this.fetchUserByRoleUuid(selectedRole.uuid);
  };

  /**
   * 处理选择
   */
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  /**
   * 获取角色的资源
   */
  fetchRoleResourceKeysByUuid = roleUuid => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/getResources',
      payload: roleUuid,
      callback: response => {
        if (response && response.success) {
          let res;
          if (response.data) {
            res = response.data;
          } else {
            res = new Array();
          }

          this.setState({
            checkedResourceKeys: res[orgType.company.name] ? res[orgType.company.name] : [],
            dcCheckedResourceKeys: res[orgType.dc.name] ? res[orgType.dc.name] : [],
            vendorCheckedResourceKeys: res[orgType.vendor.name] ? res[orgType.vendor.name] : [],
            storeCheckedResourceKeys: res[orgType.store.name] ? res[orgType.store.name] : [],
            carrierCheckedResourceKeys: res[orgType.carrier.name] ? res[orgType.carrier.name] : [],
            dispatchCenterCheckedResourceKeys: res[orgType.dispatchCenter.name]
              ? res[orgType.dispatchCenter.name]
              : [],
            ownerCheckedResourceKeys: res[orgType.owner.name] ? res[orgType.owner.name] : [],
            bmsCheckedResourceKeys: res[orgType.bms.name] ? res[orgType.bms.name] : [],
          });
        }
      },
    });
  };

  /**
   * 删除处理 - 弹窗显示控制
   */
  handleDleteModalVisible = flag => {
    this.setState({
      deleteConfrimModalVisible: !!flag,
    });
  };

  /**
   * 批量删除角色用户关系
   */
  handleBatchRemoveUser = () => {
    const { selectedRows } = this.state;
    if (selectedRows) {
      selectedRows.map(item => {
        this.handleRemoveUser(item, false, true);
      });
    }
  };

  /**
   * 删除角色用户关系
   * @param {Object} record 要删除的当前对象
   * @param {Boolean} isRefreshTable 是否刷新表格
   * @param {Boolean} isRecordCompletion 是否记录该任务已经完成
   */
  handleRemoveUser = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;
    const { selectedRole } = this.state;

    dispatch({
      type: 'role/removeUser',
      payload: {
        uuid: selectedRole.uuid,
        userUuid: record.uuid,
      },
      callback: response => {
        if (response && response.success) {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshViewViaTargetRole();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  };

  /**
   * 编辑处理
   */
  handleEdit = value => {
    this.handleCreateModalVisible(true, value);
  };

  /**
   * 新增编辑弹窗显示控制
   */
  handleCreateModalVisible = (flag, role) => {
    this.setState({
      createModalVisible: !!flag,
      editRole: {
        ...role,
      },
    });
  };

  /**
   * 保存
   */
  handleSave = value => {
    const { dispatch } = this.props;

    let type = 'role/add';
    if (value.uuid) {
      type = 'role/modify';
    } else {
      value['companyUuid'] = loginCompany().uuid;
      value['orgUuid'] = loginOrg().uuid;
    }

    dispatch({
      type: type,
      payload: value,
      callback: response => {
        if (response && response.success) {
          if (type === 'role/add') {
            message.success(commonLocale.saveSuccessLocale);
            this.refreshView();
          }
          if (type === 'role/modify') {
            message.success(commonLocale.modifySuccessLocale);
            this.refreshViewViaTargetRole();
          }

          this.setState({
            createModalVisible: false,
          });
        }
      },
    });
  };

  /**
   * 侧边栏点击处理
   */
  handleClickMenuItem = e => {
    const { dispatch } = this.props;

    dispatch({
      type: 'role/get',
      payload: e.key,
      callback: response => {
        if (response && response.success) {
          if (response.data) {
            this.setMenuSelectedKeys(response.data.uuid);

            this.setState({
              selectedRole: response.data,
            });
            this.fetchUserByRoleUuid(response.data.uuid);
            this.fetchRoleResourceKeysByUuid(response.data.uuid);
          } else {
            this.refreshView();
          }
        } else {
          message.error(response.message);
        }
      },
    });
  };
  /**
   * 角色添加用户 - 保存
   */
  handleSaveUser = list => {
    const { dispatch } = this.props;
    const { selectedRole } = this.state;

    dispatch({
      type: 'role/addUser',
      payload: {
        uuid: selectedRole.uuid,
        userUuids: list,
      },
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.handleAddUserModalVisible(false);
          this.refreshViewViaTargetRole();
        } else {
          message.error(response.message);
        }
      },
    });
  };
  //  // -----进度条相关计算  开始-----

  /**
   * 收集批量处理产生的失败任务
   */
  collectFaildedTask = record => {
    const { failedTasks } = this.state;
    if (failedTasks.indexOf(record) == -1) {
      failedTasks.push(record);
      this.setState({
        failedTasks: failedTasks,
      });
    }
  };

  /**
   * 确认执行任务之前回调
   */
  taskConfirmCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    });
  };

  /**
   * 重试取消
   */
  retryCancelCallback = () => {
    this.terminateProgress();
  };

  /**
   * progress流程结束
   */
  terminateProgress = () => {
    this.refreshViewViaTargetRole();
    this.setState({
      batchProcessConfirmModalVisible: false,
      selectedRows: [],
    });
  };

  /**
   * 批量处理弹出框显示处理
   */
  handleBatchProcessConfirmModalVisible = (flag, taskType) => {
    const { selectedRows } = this.state;

    if (selectedRows.length == 0) {
      message.warn(roleLocale.progressWarn);
      return;
    }
    if (flag) {
      const { taskInfo } = this.state;
      taskInfo.total = selectedRows.length;
      taskInfo.type = taskType;

      this.setState({
        taskInfo: taskInfo,
      });
    }

    this.setState({
      batchProcessConfirmModalVisible: !!flag,
    });
  };

  /**
   * 批量执行具体函数包装
   */
  taskExecutionFuncWrapper = taskType => {
    if (taskType === taskTypeMap['delete']) {
      return this.handleBatchRemoveUser;
    }
  };

  /**
   * 任务执行出错时回调，用于重试
   */
  taskFailedCallback = () => {
    const { taskInfo, selectedRows, failedTasks } = this.state;

    // 关掉错误提示
    this.setState({
      isCloseFailedResultModal: false,
      batchProcessConfirmModalVisible: false,
    });

    if (failedTasks.length == 1) {
      // 直接执行
      switch (taskInfo.type) {
        case taskTypeMap['delete']:
          this.handleRemoveUser(failedTasks[0], true, false);
          break;
        default:
          console.error('错误执行类型');
      }
    } else if (failedTasks.length > 1) {
      // 将执行失败的任务加入到selectedRows
      this.setState({
        selectedRows: failedTasks,
      });
      // 继续进行批处理
      this.handleBatchProcessConfirmModalVisible(true, taskInfo.type);
    }
  };

  /**
   * 任务全部执行成功时回调
   */
  taskSuccessedCallback = () => {
    this.terminateProgress();
  };

  /**
   * 任务取消执行
   */
  taskCancelCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    });
  };

  // -----进度条相关计算  结束-----
  /**
   * 授权处理
   */
  handleAuthorize = (data, orgType) => {
    const { dispatch } = this.props;
    const { selectedRole } = this.state;
    let auth = {
      resourceKeys: data,
      orgType: orgType,
      uuid: selectedRole.uuid,
    };

    dispatch({
      type: 'role/authorize',
      payload: auth,
      callback: response => {
        if (response && response.success) {
          message.success(roleLocale.authorizeSuccess);
          // this.setState({
          //   checkedResourceKeys: data
          // })
          this.fetchRoleResourceKeysByUuid(selectedRole.uuid);
        }
      },
    });
  };

  /**
   * 刷新界面（获取角色信息，默认选中角色不变[信息更新]）
   */
  refreshViewViaTargetRole = () => {
    const { selectedRole, pageFilter } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'role/getByOrgUuid',
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          if (data && data.length > 0) {
            this.setMenuSelectedKeys(selectedRole.uuid);
            let tempSelectedRole = {};
            for (let index in data) {
              if (data[index].uuid == selectedRole.uuid) {
                tempSelectedRole = data[index];
                break;
              }
            }

            this.setState({
              roles: data,
              selectedRole: tempSelectedRole,
            });

            this.fetchUserByRoleUuid(selectedRole.uuid);
          }
        }
      },
    });
  };

  /**
   * 删除处理 - 取消
   */
  handleDeleteCancel = () => {
    this.handleDleteModalVisible(false);
  };

  /**
   * 删除处理 - 确认
   */
  handleDeleteConfirm = () => {
    this.handleRoleRemove(this.state.selectedRole);
  };
  /**
   * 角色添加用户 - 弹窗控制
   */
  handleAddUserModalVisible = flag => {
    this.setState({
      addUserModalVisible: !!flag,
    });
  };

  /**
   * 角色添加用户 - 取消
   */
  handleAddUserCancel = () => {
    this.handleAddUserModalVisible(false);
  };

  /**
   * 启用或者禁用处理
   */
  handleEnableOrDisable = (record, isRefreshView) => {
    if (record.status == ROLE_STATUS['ONLINE']) {
      this.handleDisable(record, isRefreshView);
    } else {
      this.handleEnable(record, isRefreshView);
    }
  };

  /**
   * 角色删除处理
   */
  handleRoleRemove = record => {
    const { dispatch } = this.props;
    if (this.state.userData.list == undefined) {
      dispatch({
        type: 'role/remove',
        payload: record,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.removeSuccessLocale);
          }
          this.refreshView();
          this.handleDleteModalVisible(false);
        },
      });
    } else {
      this.handleDleteModalVisible(false);
      message.error(roleLocale.deleteRoleFailed);
    }
  };
  /**
   * 启用处理
   */
  handleEnable = (record, isRefreshView) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/enable',
      payload: record,
      callback: response => {
        if (response && response.success) {
          if (isRefreshView) {
            this.refreshViewViaTargetRole();
          }
        } else {
          message.error(response.message);
        }
      },
    });
  };

  /**
   * 禁用处理
   */
  handleDisable = (record, isRefreshView) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/disable',
      payload: record,
      callback: response => {
        if (response && response.success) {
          if (isRefreshView) {
            this.refreshViewViaTargetRole();
          }
        } else {
          message.error(response.message);
        }
      },
    });
  };

  /**
   * 渲染左侧菜单内容
   */
  renderSilderMenu = () => {
    const { roles } = this.state;
    let menuItems = [];
    let rolesParent = roles.filter(e => e.pcode == undefined);

    // roles.map(item => {
    //   if (!item.sysDefault)
    //     menuItems.push(
    //       <Menu.Item key={`${item.uuid}`}>
    //         <Tooltip title={item.note}>{`[${item.code}] ${item.name}`}</Tooltip>
    //       </Menu.Item>
    //     );
    // });

    // return menuItems;
    return this.getSilderMenus(rolesParent, roles);
  };

  getSilderMenus = (parentItems, roles) => {
    let all = parentItems.map(p => {
      //find children
      let childrens = roles.filter(e => e.pcode == p.code);
      if (childrens && childrens.length > 0) {
        return (
          <SubMenu
            key={p.uuid}
            style={this.state.selectedRole.uuid == p.uuid ? { color: '#3B77E3' } : {}}
            title={
              <span>
                <Icon type="appstore" />
                <span>{`[${p.code}] ${p.name}`}</span>
              </span>
            }
            onTitleClick={this.handleClickMenuItem}
          >
            {this.getSilderMenus(childrens, roles)}
          </SubMenu>
        );
      } else {
        return (
          <Menu.Item key={`${p.uuid}`}>
            <Tooltip title={p.note}>{`[${p.code}] ${p.name}`}</Tooltip>
          </Menu.Item>
        );
      }
    });

    return all;
  };

  /**重写部分 开始 */

  /**
   * 绘制其他组件
   */
  drawOtherCom = () => {
    const {
      createModalVisible,
      editRole,
      addUserModalVisible,
      selectedRole,
      deleteConfrimModalVisible,
      userData,
      batchProcessConfirmModalVisible,
      taskInfo,
      action,
      isCloseFailedResultModal,
    } = this.state;
    const createParentMethods = {
      handleSave: this.handleSave,
      handleCreateModalVisible: this.handleCreateModalVisible,
    };
    const deleteConfrimModalProps = {
      entity: selectedRole,
      confirmLoading: this.props.loading,
      deleteConfrimModalVisible: deleteConfrimModalVisible,
      handleDeleteConfirm: this.handleDeleteConfirm,
      handleDeleteCancel: this.handleDeleteCancel,
    };
    const addUserModalProps = {
      entity: selectedRole,
      confirmLoading: this.props.loading,
      dispatch: this.props.dispatch,
      addUserModalVisible: addUserModalVisible,
      handleAddUserCancel: this.handleAddUserCancel,
      handleSaveUser: this.handleSaveUser,
      defaultSelectedUser: userData.list,
    };
    const progressProps = {
      taskInfo: taskInfo,
      entity: roleLocale.progressTitle,
      action: roleLocale.progressTitle,
      batchProcessConfirmModalVisible: batchProcessConfirmModalVisible,
      isCloseFailedResultModal: isCloseFailedResultModal,
    };

    const progressMethods = {
      taskConfirmCallback: this.taskConfirmCallback,
      taskCancelCallback: this.taskCancelCallback,
      taskFailedCallback: this.taskFailedCallback,
      taskSuccessedCallback: this.taskSuccessedCallback,
      retryCancelCallback: this.retryCancelCallback,
      taskExecutionFunc: this.taskExecutionFuncWrapper(taskInfo.type),
    };
    return (
      <div>
        <RoleCreateForm
          {...createParentMethods}
          createModalVisible={createModalVisible}
          confirmLoading={this.props.loading}
          role={editRole}
        />
        <RoleDeleteConfirmModal {...deleteConfrimModalProps} />
        {addUserModalVisible && <RoleAddUserModal {...addUserModalProps} />}
        <ConfirmProgress {...progressProps} {...progressMethods} ref="batchHandle" />
      </div>
    );
  };

  /**
   * 绘制空数据界面
   */
  drawNoData = () => {
    if (this.props.loading) {
      return <PageLoading />;
    } else {
      return (
        <Empty
          image={emptySvg}
          style={{ position: 'absolute', top: '30%', left: '45%' }}
          description={<span>{roleLocale.noData}</span>}
        >
          <Button
            type="primary"
            icon="plus"
            disabled={!havePermission(RESOURCE_IWMS_ACCOUNT_ROLE_CREATE)}
            onClick={() => this.handleCreateModalVisible(true)}
          >
            {roleLocale.createRole}
          </Button>
        </Empty>
      );
    }
  };

  /**
   * 绘制左侧导航栏
   */
  drawSider = () => {
    return (
      <div>
        <div className={siderStyle.navigatorPanelWrapper}>
          <span className={siderStyle.title}>{roleLocale.title}</span>
        </div>
        <div className={styles.createBtnWrapper}>
          <Button
            className={styles.createBtn}
            type="primary"
            ghost
            icon="plus"
            disabled={!havePermission(ROLE_RES.CREATE)}
            onClick={() => this.handleCreateModalVisible(true)}
          >
            {commonLocale.createLocale + roleLocale.title}
          </Button>
        </div>
        <div style={{ height: 'calc(100vh - 200px)', overflowY: 'scroll' }}>
          <div className={styles.menuWrapper}>
            <Menu
              onClick={this.handleClickMenuItem}
              mode="inline"
              selectedKeys={this.state.menuSelectedKeys}
              style={{ height: '100%' }}
            >
              {this.renderSilderMenu()}
            </Menu>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 绘制右侧内容栏
   */
  drawContent = () => {
    /**
     * 右侧内容工具栏
     */
    const roleToolbarPanelProps = {
      entity: this.state.selectedRole,
      handleEnableOrDisable: this.handleEnableOrDisable,
      handleEdit: this.handleEdit,
      handleDleteModalVisible: this.handleDleteModalVisible,
      handleDeleteConfirm: this.handleDeleteConfirm,
    };
    const roleUserInfoProps = {
      handleRoleUserTableChange: this.handleRoleUserTableChange,
      handleSelectRows: this.handleSelectRows,
      handleAddUserModalVisible: this.handleAddUserModalVisible,
      handleRemoveUser: this.handleRemoveUser,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingUser,
      data: this.state.userData,
      selectedRows: this.state.selectedRows,
    };
    // const rolePermissionInfoProps = {
    //   data: this.state.resourceTree,
    //   checkedKeys: this.state.checkedResourceKeys,
    //   handleAuthorize: this.handleAuthorize,
    //   loading: this.props.loading,
    // }
    return (
      <div style={{ height: '100%' }}>
        <RoleToolbarPanel {...roleToolbarPanelProps} />
        <div className={styles.rightContentWrapper}>
          <Tabs
            className={styles.tabsWrapper}
            defaultActiveKey="1"
            id={'tabsWrapper'}
            ref="tabParent"
          >
            <TabPane tab={roleLocale.tabUserInfoTitle} key="1">
              <RoleUserInfo {...roleUserInfoProps} />
            </TabPane>
            {this.drawTabPanes()}
          </Tabs>
        </div>
      </div>
    );
  };

  drawTabPanes = () => {
    const {
      dcResourceTree,
      resourceTree,
      storeResourceTree,
      vendorResourceTree,
      carrierResourceTree,
      dispatchCenterResourceTree,
      ownerCheckedResourceTree,
      bmsCheckedResourceTree,
    } = this.state;
    const tabPanes = [];
    let i = 2;
    let height = 'calc(100vh - 240px)';
    if (resourceTree && resourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={roleLocale.tabPermissionInfoTitle} key={i}>
          <RolePermissionInfo
            data={resourceTree}
            checkedKeys={this.state.checkedResourceKeys}
            height={height}
            handleAuthorize={this.handleAuthorize}
            loading={this.props.loading}
            orgType={orgType.company.name}
          />
        </TabPane>
      );
      i = i + 1;
    }
    if (dcResourceTree && dcResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={roleLocale.dcTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo
            data={dcResourceTree}
            checkedKeys={this.state.dcCheckedResourceKeys}
            height={height}
            handleAuthorize={this.handleAuthorize}
            loading={this.props.loading}
            orgType={orgType.dc.name}
          />
        </TabPane>
      );
      i = i + 1;
    }
    if (dispatchCenterResourceTree && dispatchCenterResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={roleLocale.dispatchCenterTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo
            data={dispatchCenterResourceTree}
            checkedKeys={this.state.dispatchCenterCheckedResourceKeys}
            height={height}
            handleAuthorize={this.handleAuthorize}
            loading={this.props.loading}
            orgType={orgType.dispatchCenter.name}
          />
        </TabPane>
      );
      i = i + 1;
    }
    if (storeResourceTree && storeResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={roleLocale.storeTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo
            data={storeResourceTree}
            checkedKeys={this.state.storeCheckedResourceKeys}
            height={height}
            handleAuthorize={this.handleAuthorize}
            loading={this.props.loading}
            orgType={orgType.store.name}
          />
        </TabPane>
      );
      i = i + 1;
    }
    if (vendorResourceTree && vendorResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={roleLocale.vendorTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo
            data={vendorResourceTree}
            checkedKeys={this.state.vendorCheckedResourceKeys}
            height={height}
            handleAuthorize={this.handleAuthorize}
            loading={this.props.loading}
            orgType={orgType.vendor.name}
          />
        </TabPane>
      );
      i = i + 1;
    }
    if (carrierResourceTree && carrierResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={roleLocale.carrirTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo
            data={carrierResourceTree}
            checkedKeys={this.state.carrierCheckedResourceKeys}
            height={height}
            handleAuthorize={this.handleAuthorize}
            loading={this.props.loading}
            orgType={orgType.carrier.name}
          />
        </TabPane>
      );
      i = i + 1;
    }
    if (ownerCheckedResourceTree && ownerCheckedResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={roleLocale.ownerTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo
            data={ownerCheckedResourceTree}
            checkedKeys={this.state.ownerCheckedResourceKeys}
            height={height}
            handleAuthorize={this.handleAuthorize}
            loading={this.props.loading}
            orgType={orgType.owner.name}
          />
        </TabPane>
      );
      i = i + 1;
    }
    if (bmsCheckedResourceTree && bmsCheckedResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={roleLocale.bmsTabPermissionInfoTitle} key={i}>
          <Tabs>
            <TabPane tab={roleLocale.bmsTabPermissionInfoTitle} key="1">
              <RolePermissionInfo
                data={bmsCheckedResourceTree}
                checkedKeys={this.state.bmsCheckedResourceKeys}
                height={'calc(100vh - 300px)'}
                handleAuthorize={this.handleAuthorize}
                loading={this.props.loading}
                orgType={orgType.bms.name}
              />
            </TabPane>
            <TabPane tab={roleLocale.bmsDataSourceInfoTitle} key="2">
              <BMSAuthorizeCom type="DataSource" selectedRole={this.state.selectedRole} />
            </TabPane>
            <TabPane tab={roleLocale.bmsPlanTabPermissionInfoTitle} key="3">
              <BMSAuthorizeCom type="CostPlan" selectedRole={this.state.selectedRole} />
            </TabPane>
          </Tabs>
        </TabPane>
      );
      i = i + 1;
    }
    return tabPanes;
  };

  /**重写部分 结束 */
}
