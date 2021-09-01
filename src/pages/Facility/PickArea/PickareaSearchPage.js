import { Fragment } from 'react';
import { connect } from 'dva';
import { Button, Divider, Popconfirm, message } from 'antd';
import ToolbarPanel from '@/components/MyComponent/ToolbarPanel';
import SearchPage from '@/pages/Component/Page/SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { PICKAREA_RES } from './PickAreaPermission';
import { getBasicIfCaption } from './PickAreaContants';
import { pickAreaLocale } from './PickAreaLocale';
import PickAreaSearchForm from './PickAreaSearchForm';
import OperateCol from '@/pages/Component/Form/OperateCol';


@connect(({ pickArea, loading }) => ({
  pickArea,
  loading: loading.models.pickArea,
}))
export default class PickareaSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: pickAreaLocale.title,
      data: props.pickArea.data,
      suspendLoading: false,
      selectedRows: [],
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      key: 'pickArea.search.table',
      taskInfo: {
        total: 0,
      },
      failedTasks: [],
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.pickArea.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.pickArea.data
    });
  }
  /**
   * 搜索/重置
   */
  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    if (data) {
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
      type: 'pickArea/showPage',
      payload: { ...payload }
    });
  }
  /**
   * 显示详情
   */
  onView = (uuid) => {
    this.props.dispatch({
      type: 'pickArea/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'pickArea/delete',
        payload: record,
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

  // ---- 批量相关 开始---
  onBatchOnRemove = () => {
    this.setState({
      batchAction: commonLocale.batchRemoveLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })

    const { selectedRows, batchAction } = this.state;

    const that = this;

    let bacth = (i) => {
      if (i < selectedRows.length) {
        that.onRemove(selectedRows[i], true).then(res => {
          bacth(i + 1)
        });
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }

    bacth(0);

  }
  // ---- 批量相关 结束---

  //实现父类方法--开始--

  /**
   * 搜索方法-构造搜索面板
   */
  drawSearchPanel = () => {
    const pageFilter = this.state.pageFilter;
    return <PickAreaSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />
  }

  /**
   * 右上角 - 构造按钮们
   */
  drawActionButton = () => {
    return (
      <Fragment>
        <Button icon="plus" disabled={!havePermission(PICKAREA_RES.CREATE)} type="primary" onClick={this.onCreate.bind(this, '')}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }
  /**
   * 工具栏--eg：批量
   */
  drawToolbarPanel = () => {
    return (
      <Button disabled={!havePermission(PICKAREA_RES.DELETE)} onClick={() => this.onBatchOnRemove()}>
        {commonLocale.batchRemoveLocale}
      </Button>
    );
  }
  /**
   * 渲染除搜索，表格界面的其他界面，比如批处理
   */
  drawOtherCom = () => {

    return (
      <div>
        {this.drawProgress()}
      </div>
    );
  }
  /**
   * 查询数据 展示表格
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = {
      ...pageFilter
    };
    // filter 为搜索的条件 为空则为重置
    if (filter) {
      queryFilter = {
        ...pageFilter,
        ...filter
      };
    }
    dispatch({
      type: 'pickArea/query',
      payload: queryFilter,
    });
  };

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record.uuid)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(PICKAREA_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(PICKAREA_RES.DELETE),
      confirm: true,
      confirmCaption: pickAreaLocale.title,
      onClick: this.onRemove.bind(this, record, false)
    }];
  }

  // 表格列
  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (val, record) => <a onClick={this.onView.bind(this, record.uuid)}>{val}</a>
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: pickAreaLocale.binScope,
      width: colWidth.enumColWidth,
      dataIndex: 'binScope',
      sorter: true,
    },
    {
      title: pickAreaLocale.wholeContainer,
      dataIndex: 'wholeContainer',
      width: colWidth.enumColWidth,
      sorter: true,
      render: val => <span>{getBasicIfCaption(val)}</span>,
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,

      render: record => (
        <OperateCol menus={this.fetchOperatePropsOne(record)} />
      ),
    },
  ];
  //实现父类方法--结束
}
