import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import HighLowStockSearchForm from './HighLowStockSearchForm';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { HIGHLOWSTOCK_RES } from './HighLowStockPermission';
import { highLowStockLocale } from './HighLowStockLocale';
import BatchEditModal from './BatchEditModal';
import EditModal from './EditModal';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { isBlank } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import { convertCodeName } from '@/utils/utils';
import { RESOURCE_IWMS_BASIC_ARTICLE_VIEW } from '@/pages/Basic/Article/Permission';
import { BinType_RES } from '@/pages/Facility/BinType/BinTypePermission';
import { routerRedux } from 'dva/router';

@connect(({ highLowStock, loading }) => ({
  highLowStock,
  loading: loading.models.highLowStock,
}))
export default class HighLowStockSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: highLowStockLocale.title,
      data: props.highLowStock.data,
      batchEditModalVisible: false,
      editModalVisible: false,
      selectedRows: [],
      noMessage: true,
      suspendLoading: false,
      key: 'highLowStock.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    if (!this.state.pageFilter.searchKeyValues.binType) {
      this.state.pageFilter.searchKeyValues.binType = ' ';
    }
  }

  componentDidMount() {
    this.refreshTable();
  }
  /**  批量编辑相关 开始  **/

  onBatchEdit = () => {
    this.setState({
      batchAction: basicState.EDIT.caption,
    });

    this.handleBatchProcessConfirmModalVisible(true);

  };

  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows } = this.state;
    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        that.batchEdit(selectedRows[i], true).then(res => {
          bacth(i + 1)
        });
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }
    bacth(0);
    this.props.dispatch({
      type: 'highLowStock/clearEntitysAndParams',
    });

  }

  batchEdit = (record, callback) => {
    const { dispatch } = this.props;
    let that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'highLowStock/batchUpdate',
        payload: record,
        callback: response => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.onlineSuccessLocale);
          }
        }
      });
    })
  };
  /**  批量编辑相关 结束  **/

  componentWillReceiveProps(nextProps) {
    let highLowStock = nextProps.highLowStock;
    this.setState({
      data: highLowStock.data
    });
    if (Array.isArray(highLowStock.entitys) && highLowStock.editParam) {
      if (highLowStock.entitys.length == 0) {
        message.warn('暂无符合条件的数据');
        this.props.dispatch({
          type: 'highLowStock/clearEntitysAndParams',
        });
        return;
      }
      let rows = [];
      highLowStock.entitys.forEach(function (en) {
        rows.push(
          {
            articleUuid: en.article.uuid,
            dcUuid: loginOrg().uuid,
            binCode: en.binCode,
            highStockType: highLowStock.editParam.highStockType,
            highStockQtyStr: highLowStock.editParam.highStockQtyStr,
            lowStockType: highLowStock.editParam.lowStockType,
            lowStockQtyStr: highLowStock.editParam.lowStockQtyStr
          }
        );
      });
      this.setState({
        selectedRows: rows
      })

      //这里的判断只是为了等待把rows变量成功赋值给selectedRows，不然的话批量操作的提示语句“是否批量删除N个选项”中的N不准确
      // if (this.state.selectedRows.length === highLowStock.entitys.length) {
      //   this.onBatchEdit();
      // }
    } else {
      this.setState({
        batchEditModalVisible: false,
        selectedRows: []
      })
    }
  }

  /**
   * 跳转到商品详情页面
   */
  onArticleView = (article) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/article',
      payload: {
        showPage: 'view',
        entityUuid: article ? article.uuid : undefined
      }
    }));
  }

  /**
   * 跳转到货位类型详情页面
   */
  onBinTypeView = (binType) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/binType',
      payload: {
        showPage: 'view',
        entityUuid: binType ? binType.uuid : undefined
      }
    }));
  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    if (data) {
      if (!isBlank(data.binType)) {
        data.binTypeUuid = JSON.parse(data.binType).uuid;
      }
      delete data['binType'];
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      }
    }
    this.refreshTable();
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    this.props.dispatch({
      type: 'highLowStock/clearEntitysAndParams',
    });
    dispatch({
      type: 'highLowStock/query',
      payload: queryFilter,
    });
  };

  //disabled={!havePermission(HIGHLOWSTOCK_RES.EDIT)}
  drawToolbarPanel() {
    return [
      <Button key='edit' disabled={!havePermission(HIGHLOWSTOCK_RES.EDIT)} onClick={() =>
        this.handleBatchEditModalVisible(true)
      }>
        {formatMessage({ id: 'common.button.edit' })}
      </Button>
    ];
  }

  drawSearchPanel = () => {
    return <HighLowStockSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
  }

	/**
   * 批量编辑弹出框
   */
  handleBatchEditModalVisible = (flag) => {
    this.setState({
      batchEditModalVisible: flag
    })
    if (flag === false) {
      this.handleBatchProcessConfirmModalVisible(false);
      this.setState({
        selectedRows: []
      })
      this.setState({
        highPlaceholder: '请输入固定的最高库存件数，如10。',
        highMonad: '件',
        lowPlaceholder: '请输入固定的最低库存件数，如10。',
        lowMonad: '件',
      })
    }
  }

  /**
   * 编辑
   */
  // handleEdit = record => {
  //   this.handleEditModalVisible(true, record);
  // }

	/**
   * 编辑弹出框
   */
  // handleEditModalVisible = (flag, entity) => {
  //   this.setState({
  //     editModalVisible: !!flag,
  //     entity: entity,
  //     plateAdvice: entity ? entity.plateAdvice : null
  //   })
  //   if (entity && entity.uuid) {
  //     this.props.dispatch({
  //       type: 'highLowStock/getQpcByQueryStock',
  //       payload: {
  //         articleUuid: entity.article.uuid,
  //         binCode: entity.binCode,
  //         companyUuid: loginCompany().uuid,
  //         dcUuid: loginOrg().uuid
  //       },
  //       callback: (response) => {
  //         if (response && response.success && Array.isArray(response.data)) {
  //           this.setState({
  //             qpcStr: response.data[0].qpcStr
  //           })
  //         }
  //       }
  //     })
  //   }
  //   if (flag === undefined) {
  //     this.refreshTable();
  //   }
  // }



  /**
   * 渲染modal
   */
  drawOtherCom = () => {
    return (
      <div>
        {/*<EditModal*/}
          {/*handleEditModalVisible={this.handleEditModalVisible}*/}
          {/*editModalVisible={this.state.editModalVisible}*/}
          {/*dispatch={this.props.dispatch}*/}
          {/*entity={this.state.entity}*/}
          {/*qpcStr={this.state.qpcStr}*/}
          {/*plateAdvice={this.state.plateAdvice}*/}
        {/*/>*/}
        <BatchEditModal
          handleBatchEditModalVisible={this.handleBatchEditModalVisible}
          batchEditModalVisible={this.state.batchEditModalVisible}
          handleBatchProcessConfirmModalVisible={this.handleBatchProcessConfirmModalVisible}
          selectedRows={this.state.selectedRows}
          dispatch={this.props.dispatch}
        />
      </div>
    );
  }

  columns = [
    {
      title: highLowStockLocale.article,
      dataIndex: 'article',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text) => <a onClick={this.onArticleView.bind(this, text)}
        disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_VIEW)}><EllipsisCol colValue={convertCodeName(text)} /></a>,

    },
    {
      title: highLowStockLocale.binCode,
      dataIndex: 'binCode',
      width: colWidth.codeColWidth,
      sorter: true,
    },
    {
      title: highLowStockLocale.binType,
      dataIndex: 'binType',
      width: colWidth.enumColWidth,
      sorter: true,
      render: (text) => <a onClick={this.onBinTypeView.bind(this, text)}
        disabled={!havePermission(BinType_RES.VIEW)}><EllipsisCol colValue={convertCodeName(text)} /></a>,
    },
    {
      title: highLowStockLocale.qpcStr,
      dataIndex: 'qpcStr',
      width: itemColWidth.qpcStrColWidth,
      sorter: true,
    },
    {
      title: '装盘建议',
      dataIndex: 'plateAdvice',
      width: itemColWidth.qpcStrColWidth,
      sorter: true,
      render:val=>val?val:<Empty/>
    },
    {
      title: highLowStockLocale.lowStockQtyStr,
      align: 'center',
      dataIndex: 'lowStockQtyStr',
      sorter: true,
      width: itemColWidth.qtyStrColWidth,
    },
    {
      title: highLowStockLocale.lowStockQty,
      dataIndex: 'lowStockQty',
      align: 'center',
      sorter: true,
      width: itemColWidth.qtyColWidth,
    },
    {
      title: highLowStockLocale.highStockQtyStr,
      dataIndex: 'highStockQtyStr',
      align: 'center',
      sorter: true,
      width: itemColWidth.qtyStrColWidth,
    },
    {
      title: highLowStockLocale.highStockQty,
      dataIndex: 'highStockQty',
      align: 'center',
      sorter: true,
      width: itemColWidth.qtyColWidth,
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        <Fragment>
          <a disabled={!havePermission(HIGHLOWSTOCK_RES.EDIT)} onClick={this.handleEdit.bind(this, record)}>
            {commonLocale.editLocale}
          </a>
        </Fragment>
      ),
    },
  ];
}
