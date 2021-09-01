import React, { Component } from 'react';
import { Modal, Input, Pagination, Icon } from 'antd';
import PropTypes from 'prop-types';
import styles from './operationPoint.less';
import { commonLocale } from '@/utils/CommonLocale';
import operationPointLocal from './OperationPointLocal';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { formatMessage, getLocale } from 'umi/locale';

const Search = Input.Search;

class GatewayCreateModal extends Component {

  static propTypes = {
    entity: PropTypes.object,
    GatewayCreateModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    defaultSelectedGateway: PropTypes.array,
    handleSaveGateway: PropTypes.func,
    handleAddGatewayCancel: PropTypes.func,
  }

  state = {
    pageFilter: {
      page: 0,
      pageSize: 20,
      searchKeyValues: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
    },
    selectedGateway: [],
    gatewayList: [],
    gatewayPagination: {},
    showPagination: true,
  }

  componentDidMount() {
    this.initialSelectedGateway();
    this.fetchGateway();
  }

  /**
   * 初始化已选择网关
   */
  initialSelectedGateway = () => {
    const { defaultSelectedGateway } = this.props;
    const { selectedGateway } = this.state;

    selectedGateway.splice(0, selectedGateway.length);
    let arr = [];
    if (defaultSelectedGateway !== undefined) {
      arr = selectedGateway.concat(defaultSelectedGateway);
    }

    this.setState({
      selectedGateway: arr,
    })
  }

  /**
   * 获取可用的网关集合
   */
  fetchGateway = () => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    dispatch({
      type: 'facilitiesMaintenance/query',
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
            gatewayList: list,
            gatewayPagination: pagination,
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
    this.fetchGateway();
  };

  /**
   * 渲染网关列表
   */
  renderGatewayList = () => {
    const { gatewayList } = this.state;

    let items = [];
    Array.isArray(gatewayList) && gatewayList.map((item) => {
      items.push(
        <div key={`${item.uuid}`} onClick={this.handleClickItem.bind(this, item)}>
          {`[${item.code}] ${item.name}`}
        </div>
      )
    });

    return items;
  }

  /**
   * 处理左边点击item
   */
  handleClickItem = (item) => {
    const { selectedGateway } = this.state;

    let existing = false;

    for (let index in selectedGateway) {
      if (selectedGateway[index].uuid === item.uuid) {
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
      selectedGateway.push(data);
      this.setState({
        selectedGateway: selectedGateway
      })
    }
  }

  /**
   * 处理右边点击删除icon
   */
  handleDeleteItem = (item) => {
    const { selectedGateway } = this.state;

    for (let index in selectedGateway) {
      if (selectedGateway[index].uuid === item.uuid) {
        selectedGateway.splice(index, 1);
        this.setState({
          selectedGateway: selectedGateway,
        })
        break;
      }
    }
  }

  /**
   * 保存
   */
  handleSaveGateway = () => {
    const { selectedGateway } = this.state;

    let controlleruuids = [];

    Array.isArray(selectedGateway) && selectedGateway.map((item) => {
      controlleruuids.push(item.uuid);
    })

    this.props.handleSaveGateway(controlleruuids);
  }

  renderAllreadyAddCountTips = (number) => {
    if (getLocale() === 'en-US') {
      let s = '';
      if (number > 1) {
        s = 's';
      }
      return 'Allready add ' + number + ' gateway' + s;
    } else if (getLocale() === 'zh-CN') {
      return operationPointLocal.added + number + operationPointLocal.number + operationPointLocal.gateway;
    }
  }

  render() {
    const {
      handleAddGatewayCancel,
      GatewayCreateModalVisible,
      confirmLoading
    } = this.props;

    const {
      showPagination,
      gatewayPagination,
      selectedGateway,
    } = this.state;

    return (
      <Modal
        title={operationPointLocal.addGateway}
        visible={GatewayCreateModalVisible}
        onOk={this.handleSaveGateway}
        onCancel={handleAddGatewayCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}>
        <div className={styles.addGatewayWrapper}>
          <div className={styles.leftWrapper}>
            <div className={styles.list}>
              {this.renderGatewayList()}
            </div>

            <div style={{ display: showPagination ? 'block' : 'none' }} className={styles.pagination}>
              <Pagination size="small" {...gatewayPagination} onChange={this.handlePaginationChange} />
            </div>
          </div>
          <div className={styles.rightWrapper} style={{overflow:'auto'}}>
            <span className={styles.count}>{this.renderAllreadyAddCountTips(selectedGateway.length)}</span>
            <div className={styles.list}>
              {selectedGateway.map((item, index) => {
                return <div key={index}>
                  <span>[{item.code}]{item.name}</span>
                  <Icon onClick={this.handleDeleteItem.bind(this, item)} style={{float: 'right', position: 'relative', top: '12px'}} type="close" />
                </div>
              })}
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default GatewayCreateModal;
