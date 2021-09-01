import React, { Component } from 'react';
import { Modal, Input, Pagination, Icon } from 'antd';
import PropTypes from 'prop-types';
import styles from './role.less';
import { commonLocale } from '@/utils/CommonLocale';
import { roleLocale } from './RoleLocale';
import { formatMessage, getLocale } from 'umi/locale';
import { orgType } from '@/utils/OrgType';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';

const Search = Input.Search;

class RoleAddUserModal extends Component {

  static propTypes = {
    entity: PropTypes.object,
    addUserModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    defaultSelectedUser: PropTypes.array,
    handleSaveUser: PropTypes.func,
    handleAddUserCancel: PropTypes.func,
  }

  state = {
    pageFilter: {
      page: 0,
      pageSize: 20,
      searchKeyValues: {},
    },
    selectedUser: [],
    userList: [],
    userPagination: {},
    showPagination: true,
  }

  componentDidMount() {
    this.initialSelectedUser();
    this.fetchUser();
  }

  /**
   * 初始化已选择用户
   */
  initialSelectedUser = () => {
    const { defaultSelectedUser } = this.props;
    const { selectedUser } = this.state;

    selectedUser.splice(0, selectedUser.length);
    let arr = [];
    if (defaultSelectedUser != undefined) {
      arr = selectedUser.concat(defaultSelectedUser);
    }

    this.setState({
      selectedUser: arr,
    })
  }

  /**
   * 获取可用的用户集合
   */
  fetchUser = () => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

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
          };

          this.setState({
            userList: list,
            userPagination: pagination,
            showPagination: pagination.total > 8 ? true : false
          });
        }
      }
    });
  }

  /**
   * 表格内容改变时，调用此方法
   */
  handlePaginationChange = (page) => {
    const { pageFilter } = this.state;

    pageFilter.page = page - 1;
    this.setState({
      pageFilter: pageFilter,
    })
    this.fetchUser();
  };

  /**
   * 渲染用户列表
   */
  renderUserList = () => {
    const { userList } = this.state;

    let items = [];
    Array.isArray(userList) && userList.map((item) => {
      items.push(
        <div key={`${item.uuid}`} onClick={this.handleClickItem.bind(this, item)}>
          {`[${item.code}] ${item.name}`}
        </div>
      )
    });

    return items;
  }

  /**
   * 查询
   */
  handleSearch = (value) => {
    const { pageFilter } = this.state;

    pageFilter.page = 0;
    pageFilter.searchKeyValues['codeName'] = value;

    this.setState({
      pageFilter: pageFilter,
    });
    this.fetchUser();
  };

  /**
   * 处理左边点击item
   */
  handleClickItem = (item) => {
    const { selectedUser } = this.state;

    let existing = false;

    for (let index in selectedUser) {
      if (selectedUser[index].uuid === item.uuid) {
        existing = true;
        break;
      }
    }

    if (!existing) {
      let data = {
        uuid: item.uuid,
        code: item.code,
        name: item.name
      }
      selectedUser.push(data);
      this.setState({
        selectedUser: selectedUser,
      })
    }
  }

  /**
   * 处理右边点击删除icon
   */
  handleDeleteItem = (item) => {
    const { selectedUser } = this.state;

    for (let index in selectedUser) {
      if (selectedUser[index].uuid === item.uuid) {
        selectedUser.splice(index, 1);
        this.setState({
          selectedUser: selectedUser,
        })
        break;
      }
    }
  }

  /**
   * 保存
   */
  handleSaveUser = () => {
    const { selectedUser } = this.state;

    let userUuids = [];

    Array.isArray(selectedUser) && selectedUser.map((item) => {
      userUuids.push(item.uuid);
    })

    this.props.handleSaveUser(userUuids);
  }

  renderAllreadyAddCountTips = (number) => {
    if (getLocale() === 'en-US') {
      let s = '';
      if (number > 1) {
        s = 's';
      }
      return 'Allready add ' + number + ' user' + s;
    } else if (getLocale() === 'zh-CN') {
      return roleLocale.added + number + roleLocale.number + roleLocale.user;
    }
  }

  render() {
    const {
      handleSaveUser,
      handleAddUserCancel,
      addUserModalVisible,
      confirmLoading,
      defaultSelectedUser,
    } = this.props;

    const {
      showPagination,
      userPagination,
      selectedUser,
    } = this.state;

    return (
      <Modal
        title={roleLocale.addUser}
        visible={addUserModalVisible}
        onOk={this.handleSaveUser}
        onCancel={handleAddUserCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}>
        <div className={styles.addUserWrapper}>
          <div className={styles.leftWrapper}>
            <div className={styles.searchWrapper}>
              <Search
                autoFocus
                placeholder={roleLocale.searchPlaceholder}
                onSearch={this.handleSearch}
              />
            </div>
            <div className={styles.list}>
              {this.renderUserList()}
            </div>

            <div style={{ display: showPagination ? 'block' : 'none' }} className={styles.pagination}>
              <Pagination size="small" {...userPagination} onChange={this.handlePaginationChange} />
            </div>
          </div>
          <div className={styles.rightWrapper} style={{ overflow: 'auto' }}>
            <span className={styles.count}>{this.renderAllreadyAddCountTips(selectedUser.length)}</span>
            <div className={styles.list}>
              {selectedUser.map((item, index) => {
                return <div key={index}>
                  <span>[{item.code}]{item.name}</span>
                  <Icon onClick={this.handleDeleteItem.bind(this, item)} style={{ float: 'right', position: 'relative', top: '12px' }} type="close" />
                </div>
              })}
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default RoleAddUserModal;