import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Divider, Tooltip, Switch, Modal } from 'antd';
import UserSearchForm from './UserSearchForm';
import SearchPage from '@/pages/Component/Page/SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { strSeparatorEllipsis } from '@/utils/utils';
import { USER_RES } from './UserPermission';
import { userLocale } from './UserLocale';
import { loginUser, loginCompany, loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { colWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import OperateCol from '@/pages/Component/Form/OperateCol';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';

@connect(({ user, loading }) => ({
  user,
  loading: loading.models.user,
}))
export default class UserSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: userLocale.title,
      data: props.user.data,
      suspendLoading: false,
      key: 'user.search.table',
      noActionCol: false
    };

    if (loginOrg().type === orgType.company.name) {
      console.log('用户=====================', loginOrg().type)
      this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    } else {
      this.state.pageFilter.searchKeyValues = {};
    }
  }

  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.user.data
    });
  }
  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'user/query',
      payload: queryFilter,
    });
  };

  /**
   * 搜索
   */
  onSearch = (data) => {
    const {
      pageFilter
    } = this.state;
    pageFilter.page = 0;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data
      }
    } else {
      if (loginOrg().type === orgType.company.name) {
        pageFilter.searchKeyValues = {
          companyUuid: loginCompany().uuid
        }
      } else {
        pageFilter.searchKeyValues = {}
      }
    }
    this.refreshTable();
  }

  /**
   * 显示新建/编辑界面
   */
  onCreate = (uuid) => {
    const payload = {
      showPage: 'create'
    }
    if (uuid != '') {
      payload.entityUuid = uuid;
    }
    this.props.dispatch({
      type: 'user/showPage',
      payload: {
        ...payload
      }
    });
  }

  /**
   * 跳转到详情页面
   */
	onView = (uuid) => {
		this.props.dispatch({
			type: 'user/showPage',
			payload: {
				showPage: 'view',
				entityUuid: uuid
			}
		});
	}

  /**
   * 批量删除
   */
  onBatchRemove = () => {
    this.setState({
      batchAction: userLocale.remove
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  // 批量操作
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;
    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (selectedRows[i].uuid === loginUser().uuid) {
          that.refs.batchHandle.calculateTaskSkipped();
          bacth(i + 1)
        } else {
          that.onRemove(selectedRows[i], true).then(res => {
            bacth(i + 1)
          })
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }

    bacth(0);
  }
  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'user/remove',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }

          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.removeSuccessLocale);
          }
        }
      });
    });
  }

  onResetPassword = (record) => {
    let that = this;
    this.props.dispatch({
      type: 'login/resetPassword',
      payload: {
        userUuid: record.uuid,
      },
      callback: response => {
        if (response && response.success) {
          that.refreshTable();
          message.success(record.code + userLocale.resetPasswordSuccess);
        }
      }
    });
  }

  /**
   * 检测用户在当前登录组织中是否启用
   */
  checkUserOrgEnable = (orgs) => {
    if (!Array.isArray(orgs)) {
      return false;
    }

    if (orgType.company.name === loginOrg().type) {
      for (let x in orgs) {
        if (orgs[x].enable)
          return true;
      }
    } else {
      for (let x in orgs) {
        if (orgs[x].orgUuid === loginOrg().uuid) {
          return orgs[x].enable;
        }
      }
    }

    return false;
  }

  /**
   * 启用或者禁用处理
   */
  handleOnlineOrOffline = (record, enable) => {
    if (enable) {
      this.handleOffline(record, false);
    } else {
      this.handleOnline(record, false);
    }
  };

  /**
   * 启用处理
   *
   * @param {boolean} batch 是否为批量
   */
  handleOnline = (record, batch) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/online',
      payload: record,
      callback: response => {
        if (batch) {
          this.batchCallback(response, record);
          return;
        }
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.onlineSuccessLocale);
        }
      }
    });
  };

  /**
   * 禁用处理
   *
   * @param {boolean} batch 是否为批量
   */
  handleOffline = (record, batch) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'user/offline',
      payload: record,
      callback: response => {
        if (batch) {
          this.batchCallback(response, record);
          return;
        }
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.offlineSuccessLocale);
        }
      }
    });
  };

  // --- 批量导入相关 ---

  handleShowExcelImportPage = () => {
    this.props.dispatch({
      type: 'user/showPage',
      payload: {
        showPage: 'import',
      }
    });
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.editLocale,
      disabled: !havePermission(USER_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }]
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.editLocale,
      disabled: !havePermission(USER_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: userLocale.resetPassword,
      disabled: !havePermission(USER_RES.RESET_PASSWORD),
      confirm: true,
      confirmCaption: userLocale.title,
      onClick: this.onResetPassword.bind(this, record)
    }];
  }

  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (val, record) => <a onClick={this.onView.bind(this, record.uuid)}>{val}</a>,
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: userLocale.phone,
      dataIndex: 'phone',
      width: colWidth.sourceBillNumberColWidth,
    },
    {
      title: userLocale.orgs,
      dataIndex: 'orgs',
      width: colWidth.sourceBillNumberColWidth,
      invisible: loginOrg().type !== orgType.company.name,
      render: (text, record, index) => {
        let names = [];
        if (record.orgs) {
          record.orgs.map((item) => {
            names.push(item.orgName);
          });
        }
        let maxVisibleCount = 3;
        let res = strSeparatorEllipsis(names, maxVisibleCount, '、', true);
        let items = res.items;
        let allItems = res.allItems;
        return items ? <EllipsisCol colValue={allItems} /> : <Empty />
      },
    },
    {
      title: userLocale.roles,
      dataIndex: 'roles',
      width: colWidth.sourceBillNumberColWidth,
      render: (text, record, index) => {
        let names = [];
        if (record.roles) {
          record.roles.map((item) => {
            if (item.orgUuid === loginOrg().uuid) {
              names.push(item.name);
            }
          });
        }
        let maxVisibleCount = 3;
        let res = strSeparatorEllipsis(names, maxVisibleCount, '、', true);
        let items = res.items;
        let allItems = res.allItems;

        if (items) {
          if (maxVisibleCount > names.length) {
            return <span>{allItems}</span>;
          } else {
            return <Tooltip title={allItems}>
              <span>{items}</span>
            </Tooltip>
          }
        } else {
          return <Empty />;
        }
      },
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      width: colWidth.enumColWidth,
      //invisible: loginOrg().type === orgType.company.name,
      render: (text, record) => {
        let enabled = this.checkUserOrgEnable(record.orgs);
        let confirm = enabled ? commonLocale.offlineLocale : commonLocale.onlineLocale;
        return (
          <div>
            <IPopconfirm onConfirm={this.handleOnlineOrOffline.bind(this, record, enabled)}
              operate={confirm}
              object={userLocale.title}
              disabled={record.uuid === loginUser().uuid || !havePermission(USER_RES.ONLINE)}
            >
              <Switch
                disabled={record.uuid === loginUser().uuid || !havePermission(USER_RES.ONLINE)}
                checked={enabled}
                size="small"
              />
              &emsp;
              </IPopconfirm>
            {enabled ? commonLocale.onlineLocale : commonLocale.offlineLocale}
          </div>
        )
      },
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        !record.roles || record.roles.length === 0 || record.uuid === loginUser().uuid ? <OperateCol menus={this.fetchOperatePropsOne(record)}/> :
          <OperateCol menus={this.fetchOperatePropsTwo(record)} />),
    },
  ];

  /**
   * 编辑按钮禁用逻辑
   */
  disabledEditBtn = (record) => {
    // 检测一个当前记录是否为登录的用户
    if (record.uuid === loginUser().uuid) {
      return true;
    }

    // 检测是否有权限
    if (!havePermission(USER_RES.CREATE)) {
      return true;
    }

    return false;
  }

  /**
   * 删除按钮禁用逻辑
   */
  disabledDeleteBtn = (record) => {
    // 检测一个当前记录是否为登录的用户
    if (record.uuid === loginUser().uuid) {
      return true;
    }

    // 检测是否有权限
    if (!havePermission(USER_RES.DELETE)) {
      return true;
    }

    return false;
  }

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return (
      <Fragment>
        <Button disabled={!havePermission(USER_RES.CREATE)}
          onClick={() => this.handleShowExcelImportPage()}>
          {commonLocale.importLocale}
        </Button>
        <Button icon="plus" type="primary"
          onClick={this.onCreate.bind(this, '')} disabled={!havePermission(USER_RES.CREATE)}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return [
      <Button key={commonLocale.batchRemoveLocale} disabled={!havePermission(USER_RES.DELETE)} onClick={() => this.onBatchRemove()}>
        {commonLocale.batchRemoveLocale}
      </Button>,
    ];
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return <UserSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
  }
}
