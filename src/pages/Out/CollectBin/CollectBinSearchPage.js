import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Divider, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { commonLocale } from '@/utils/CommonLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginCompany,getActiveKey } from '@/utils/LoginContext';
import { collectBinLocale } from './CollectBinLocale';
import { COLLECTBIN_RES } from './CollectBinPermission';
import { CollectBinMgrType, LogisticMode } from './CollectBinContants';
import CollectBinSearchForm from './CollectBinSearchForm';
import OperateCol from '@/pages/Component/Form/OperateCol';

@connect(({ collectBinScheme, loading }) => ({
  collectBinScheme,
  loading: loading.models.collectBinScheme,
}))
@Form.create()
export default class CollectBinSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: collectBinLocale.title,
      data: props.collectBinScheme.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      suspendLoading:false,
      key: 'collectBin.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.collectBinScheme.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.collectBinScheme.data
    });
  }

  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if (this.state.batchAction === commonLocale.deleteLocale) {
      pageFilter.page = 0;
      this.setState({
        batchAction: ''
      })
    }
    let queryFilter = { ...pageFilter };
    dispatch({
      type: 'collectBinScheme/query',
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
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        mgrType: data.mgrType,
        codeName: data.codeName
      }
      pageFilter.likeKeyValues = {
        codeName: data.codeName
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      }
      pageFilter.likeKeyValues = {}
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
      type: 'collectBinScheme/showPage',
      payload: {
        ...payload
      }
    });
  }

  /**
   * 批量删除
   */
  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  // 批量操作
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth=(i)=>{
      if(i<selectedRows.length){
        if(batchAction === commonLocale.deleteLocale){
          this.onRemove(selectedRows[i], true).then(res=>{
            bacth(i+1)
          })
        }
      }else{
        this.setState({
          suspendLoading:false
        })
      }
    }
    
    bacth(0);
  }

  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const that = this;
    const { dispatch } =this.props;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'collectBinScheme/onRemove',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.state.pageFilter.page = 0;
            that.refreshTable()
            message.success(commonLocale.removeSuccessLocale)
          }
        }
      })
    })
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'collectBinScheme/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  fetchOperateProps = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      onClick: this.onCreate.bind(this, record.uuid),
      disabled:!havePermission(COLLECTBIN_RES.EDIT),
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      confirmCaption: collectBinLocale.title,
      onClick: this.onRemove.bind(this, record, false),
      disabled:!havePermission(COLLECTBIN_RES.DELETE)
    }];
  }

  renderOperateCol = (record) => {
    return <OperateCol menus={this.fetchOperateProps(record)} />
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
      render: (val, record) =>
        <a onClick={this.onView.bind(this, record)}>{val}</a>
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (val, record) => record.name
    },
    {
      title: collectBinLocale.mgrType,
      dataIndex: 'mgrType',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (val, record) => record.mgrType ? CollectBinMgrType[record.mgrType].caption : ''
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return (
      <Fragment>
        <Button icon="plus" type="primary" onClick={this.onCreate.bind(this, '')}
        disabled={!havePermission(COLLECTBIN_RES.CREATE)}
        >
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    )
  }

  /**
  * 绘制批量工具栏
  */
  drawToolbarPanel() {
    return [
      <Button key={1} onClick={() => this.onBatchRemove()}
      disabled={!havePermission(COLLECTBIN_RES.DELETE)}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
    ];
  }

  /**
  * 绘制搜索表格
  */
  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <div>
        <CollectBinSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
        />
      </div>
    );
  }
}
