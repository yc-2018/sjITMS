import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, Divider, message, Menu, Dropdown } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import ContainerRecycleSearchForm from './ContainerRecycleSearchForm';
import { State } from './ContainerRecycleContants';
import { containerRecycleLocale } from './ContainerRecycleLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { CONTAINERRECYCLE_RES } from './ContainerRecyclePremission';

@connect(({ containerRecycle, loading }) => ({
  containerRecycle,
  loading: loading.models.containerRecycle,
}))
@Form.create()
export default class ContainerRecycleSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: containerRecycleLocale.title,
      data: props.containerRecycle.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      key: 'containerRecycle.search.table',
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.sortFields = {
      storeUuid: true
    }
  }

  componentDidMount() {
    if(this.props.containerRecycle.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.containerRecycle.data
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
      type: 'containerRecycle/query',
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
      let serialArchUuid = undefined;
      let storeUuid = undefined;
      let fromOrgUuid = undefined;
      if (data.store)
        storeUuid = JSON.parse(data.store).uuid;
      if (data.fromOrg)
        fromOrgUuid = JSON.parse(data.fromOrg).uuid;
      if (data.serialArch)
        serialArchUuid = JSON.parse(data.serialArch).uuid;

      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        storeUuid: storeUuid,
        fromOrgUuid: fromOrgUuid,
        serialArchUuid: serialArchUuid
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid
      }
    }
    this.refreshTable();
  }


  onEdit = (record) => {
    this.props.dispatch({
      type: 'containerRecycle/showPage',
      payload: {
        showPage: 'create',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'containerRecycle/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'storeUuid',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) =>
        <a onClick={() => this.onView(record)}>
          {convertCodeName(record.store)}
        </a>
    },
    {
      title: containerRecycleLocale.fromOrg,
      dataIndex: 'fromOrgCode',
      sorter: true,
      width: colWidth.sourceBillNumberColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.fromOrg)} />
    },
    {
      title: containerRecycleLocale.storeQty,
      width: colWidth.codeNameColWidth,
      dataIndex: 'storeCount',
      sorter: true
    },
    {
      title: containerRecycleLocale.recycleQty,
      dataIndex: 'recycleCount',
      width: colWidth.codeNameColWidth,
      sorter: true
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: (text, record) => (
        <OperateCol menus={this.fetchOperatePropsTow(record)} />
      ),
    },
  ];

  fetchOperatePropsTow = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return [
      <Button key={2} onClick={() => this.onBatchRecycle()}
              disabled={!havePermission(CONTAINERRECYCLE_RES.RECYCLE)}
      >
        {containerRecycleLocale.recycleByStores}
      </Button>
    ];
  }
  onBatchRecycle = () => {
    this.setState({
      batchAction: containerRecycleLocale.recycleByQty
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  // 批量操作
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;
    this.setState({
      suspendLoading: true
    })
    const that = this;
    let batch = (i) => {
      if (i < selectedRows.length) {
        let e = selectedRows[i];
        if (batchAction === containerRecycleLocale.recycleByQty) {
          if (e.storeCount - e.recycleCount > 0)
            that.onRecycle(e, true).then(res => { batch(i + 1) });
          else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }
    batch(0);
  }

  onRecycle = (record, batch) => {
    const that = this
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'containerRecycle/recycleByStores',
        payload: {
          storeUuid: record.store.uuid,
          companyUuid: record.companyUuid,
          fromOrgUuid: record.fromOrg.uuid
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.removeSuccessLocale)
          }
        }
      })
    })
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return (
      <ContainerRecycleSearchForm
        filterValue={this.state.pageFilter.searchKeyValues}
        refresh={this.onSearch}
      />
    );
  }
}
