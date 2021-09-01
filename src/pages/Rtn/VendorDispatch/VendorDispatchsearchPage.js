import { connect } from 'dva';
import VendorDispatchSearchForm from './VendorDispatchSearchForm';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { vendorDispatchLocal } from './VendorDispatchLocale';
import FetchOperateMethod from './FetchOperateMethod';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { VENDORDISPATCH_RES } from './VendorDispatchPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { havePermission } from '@/utils/authority';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ vendorDispatch, allowVendorRtnConfig, loading }) => ({
  vendorDispatch,
  allowVendorRtnConfig,
  loading: loading.models.vendorDispatch,
}))
@Form.create()
export default class VendorDispatchSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: vendorDispatchLocal.title,
      data: props.vendorDispatch.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      methodModalVisible: false,
      suspendLoading: false,
      allowVendorRtnConfig: [],
      key: 'vendorDispatch.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      vendorCode: true
    }
  }

  componentDidMount() {
    if(this.props.vendorDispatch.fromView) {
      return;
    } else {
      this.refreshTable();
    }
    this.fetchAllowVendorRtnConfig();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.vendorDispatch.data,
      allowVendorRtnConfig: nextProps.allowVendorRtnConfig.data.list || [],
    });
  }

  fetchAllowVendorRtnConfig = () => {
    let queryFilter = {
      searchKeyValues: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      }
    }

    this.props.dispatch({
      type: 'allowVendorRtnConfig/query',
      payload: queryFilter,
    });
  }

  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
      if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
        pageFilter.searchKeyValues.days = getQueryBillDays()
      }
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'vendorDispatch/query',
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
      let ownerUuid = undefined;
      var days = '';
      if (data.owner)
        ownerUuid = JSON.parse(data.owner).uuid;
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        ownerUuid: ownerUuid,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        days: getQueryBillDays()
      }
    }
    this.refreshTable();
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'vendorDispatch/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 生成拣货单
   */
  onGenPickupBill = (record) => {
    const { method } = this.state;

    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorDispatch/genPickupBillByVendor',
        payload: {
          vendorUuid: record.vendor.uuid,
          ownerUuid: record.owner.uuid,
          companyUuid: record.companyUuid,
          dcUuid: record.dcUuid,
          method: method
        },
        callback: (response) => {
          that.batchCallback(response, record);
          resolve({ success: response.success });
          return;
        }
      })
    })
  }

  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.vendorLocale,
      dataIndex: 'vendor',
      key:'vendor',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) =>
        <a onClick={() => this.onView(record)}>
          {convertCodeName(record.vendor)}
        </a>
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      key:'owner',
      sorter: true,
      width: 90,
      render: (text, record) =>
        <EllipsisCol colValue={convertCodeName(record.owner)} />
    },
    {
      title: vendorDispatchLocal.unShelveInfo,
      children: [
        {
          title: vendorDispatchLocal.containerCount,
          dataIndex: 'unContainerCount',
          sorter: true,
          key: 'unContainerCount',
          width: 100,
        }, {
          title: commonLocale.inAllArticleCountLocale,
          dataIndex: 'unArticleItemCount',
          sorter: true,
          key: 'unArticleItemCount',
          width: 100,
        }, {
          title: commonLocale.inQtyStrLocale,
          dataIndex: 'unQtyStr',
          sorter: true,
          key: 'unQtyStr',
          width: 80,
        }, {
          title: commonLocale.inAllAmountLocale,
          dataIndex: 'unAmount',
          sorter: true,
          key: 'unAmount',
          width: 80,
        }, {
          title: commonLocale.inAllWeightLocale,
          dataIndex: 'unWeight',
          sorter: true,
          key: 'unWeight',
          width: 110,
        }, {
          title: commonLocale.inAllVolumeLocale,
          dataIndex: 'unVolume',
          sorter: true,
          key: 'unVolume',
          width: 100,
        },
      ]

    }, {
      title: vendorDispatchLocal.shelveInfo,
      children: [
        {
          title: vendorDispatchLocal.containerCount,
          dataIndex: 'containerCount',
          key: 'containerCount',
          sorter: true,
          width: 100,
        }, {
          title: commonLocale.inAllArticleCountLocale,
          dataIndex: 'articleItemCount',
          sorter: true,
          key: 'articleItemCount',
          width: 100,
        }, {
          title: commonLocale.inQtyStrLocale,
          dataIndex: 'qtyStr',
          sorter: true,
          key: 'qtyStr',
          width: 80,
        }, {
          title: commonLocale.inAllAmountLocale,
          dataIndex: 'amount',
          sorter: true,
          key: 'amount',
          width: 80,
        }, {
          title: commonLocale.inAllWeightLocale,
          dataIndex: 'weight',
          sorter: true,
          key: 'weight',
          width: 110,
        }, {
          title: commonLocale.inAllVolumeLocale,
          dataIndex: 'volume',
          sorter: true,
          key: 'volume',
          width: 100,
        },
      ]
    },
    {
      title: commonLocale.stateLocale,
      width: 80,
      key:'state',
      dataIndex: 'state',
      sorter: true,
      render: (text, record) => <BadgeUtil value={record.state} />
    },
    {
      title: commonLocale.operateLocale,
      width: 80,
      render: (text, record) => (
        <OperateCol menus={this.fetchOperatePropsThree(record)} />)
    },
  ];

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORDISPATCH_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }];
  }

  onBatchGenPickUp = (value) => {
    this.setState({
      batchAction: vendorDispatchLocal.genPickupBill,
      methodModalVisible: false,
      method: value.method
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
        if (batchAction === vendorDispatchLocal.genPickupBill) {
          that.onGenPickupBill(e).then(res => { batch(i + 1) });;
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }
    batch(0);
  }

  handleMethodModalVisible = () => {
    this.setState({
      methodModalVisible: !this.state.methodModalVisible,
    })
  }

  handleModifyMethod = (value) => {
    this.onBatchGenPickUp(value);
  }


  FetchOperateMethod = () => {
    const { selectedRows, allowVendorRtnConfig } = this.state;

    if (selectedRows.length <= 0) {
      message.warn('请先勾选，再进行操作');
      return false;
    }

    if (allowVendorRtnConfig.length == 0) {
      message.warn("所有供应商不允许生成拣货单");
      return;
    }

    if (allowVendorRtnConfig.length > 1 || (allowVendorRtnConfig.length == 1 && allowVendorRtnConfig[0].vendor.code != '-')) {
      for (let rowItem of selectedRows) {
        let temp = allowVendorRtnConfig.filter(allowItem => allowItem.vendor.code === rowItem.vendor.code);
        if (temp.length == 0) {
          message.warn("供应商：" + rowItem.vendor.code + "不允许生成拣货单");
          return;
        }
      }
    }

    this.setState({
      methodModalVisible: true,
    })
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    const { methodModalVisible } = this.state;

    return [
      <Button key={1} onClick={() => this.FetchOperateMethod()}
              disabled={!havePermission(VENDORDISPATCH_RES.GENVENDORRTNPICK)}
      >
        {vendorDispatchLocal.genPickupBill}
      </Button>,

      <FetchOperateMethod
        key='methodModal'
        ModalTitle={vendorDispatchLocal.method}
        methodModalVisible={methodModalVisible}
        handleMethodModalVisible={this.handleMethodModalVisible}
        handleSave={this.handleModifyMethod}
      />
    ];
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return (
      <VendorDispatchSearchForm
        filterValue={this.state.pageFilter.searchKeyValues}
        refresh={this.onSearch}
      />
    );
  }
}
