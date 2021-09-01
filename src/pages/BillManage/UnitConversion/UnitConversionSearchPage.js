import { Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Menu, Dropdown, Button, Popconfirm, Switch, Divider, message } from 'antd';
import SearchPanel from '@/components/MyComponent/SearchPanel';
import ToolbarPanel from '@/components/MyComponent/ToolbarPanel';
import Ellipsis from '@/components/Ellipsis';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import SearchPage from '@/pages/Component/Page/SearchPage';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { orgType } from '@/utils/OrgType';
import { colWidth } from '@/utils/ColWidth';
import { articleLocale } from '@/pages/Basic/Article/ArticleLocale';
import { ARTICLE_IMPORT_TYPE } from '@/pages/Basic/Article/Constants';
import UnitConversionSearchForm from './UnitConversionSearchForm';
import {
  RESOURCE_IWMS_BASIC_ARTICLE_VIEW,
  RESOURCE_IWMS_BASIC_ARTICLE_CREATE,
  RESOURCE_IWMS_BASIC_ARTICLE_ONLINE,
  RESOURCE_IWMS_BASIC_ARTICLE_DELETE,
  RESOURCE_IWMS_BASIC_ARTICLE_EDIT
} from '@/pages/Basic/Article/Permission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { importTemplateType } from '@/utils/ImportTemplateType';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { CATEGORY_RES } from '@/pages/Basic/Category/CategoryPermission';
import { routerRedux } from 'dva/router';
import {unitConversionLocal} from './UnitConversionLocal';

@connect(({ unitConversion, loading }) => ({
  unitConversion,
  loading: loading.models.unitConversion,
}))
export default class UnitConversionSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: '单位换算',
      data: this.props.unitConversion.data,
      suspendLoading: false,
      selectedRows: [],
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      taskInfo: {
        total: 0,
        type: '',
      },
      failedTasks: [],
      importTemplateUrl: '',
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.sortFields = { 'lastModified': true };
  }

  componentDidMount() {
    if(this.props.unitConversion.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps,'props')
    this.setState({
      data: nextProps.unitConversion.data
    });
    const currentShowPage = this.props.unitConversion.showPage;
    const nextShowPage = nextProps.unitConversion.showPage;
    if (currentShowPage !== nextShowPage && nextShowPage === 'query')
      this.refreshTable();
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'unitConversion/query',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        state: ''
      }
      pageFilter.sortFields = { 'lastModified': true }
    }
    this.refreshTable();
  }


  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.editLocale,
      disabled: !havePermission(RESOURCE_IWMS_BASIC_ARTICLE_EDIT),
      onClick: this.onCreate.bind(this, record.uuid)
    }];
  }

  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter:true,
      width: colWidth.codeColWidth,
      render: (val, record) => <a disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_VIEW)}
        onClick={this.onView.bind(this, record.uuid)}>
        {val}
      </a>,
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter:true,
      width: colWidth.codeColWidth,
      render: (val,record) => <EllipsisCol colValue={record.name} />
    },
    {
      title: unitConversionLocal.searchPage_conversionRate,
      dataIndex: 'conversionRatio',
      sorter:true,
      width: colWidth.codeColWidth,
      render: (val,record) => <EllipsisCol colValue={record.conversionRatio+'%'} />
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,

      render: record => (
          <OperateCol menus={this.fetchOperatePropsTwo(record)} />
      ),
    },
  ];

  /**
   * 国际化 - 表格中启用禁用确认文字
   */
  confirmEnableDisableTips = (state) => {
    let text = state === basicState.ONLINE.name
      ? formatMessage({ id: 'common.operate.disable' })
      : formatMessage({ id: 'common.operate.enable' });
    return formatMessage({ id: 'common.operate.confirm' }) + " " + text.toLowerCase() + "?";
  }

  /**
   * 启用或者禁用处理
   */
  handleOnlineOrOffline = (record) => {
    if (record.state == basicState.ONLINE.name) {
      this.handleOffline(record, false);
    } else if (record.state == basicState.OFFLINE.name) {
      this.handleOnline(record, false);
    }
  };


  /**
   * 禁用处理
   *
   * @param {boolean} batch 是否为批量
   */
  handleOffline = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'unitConversion/remove',
        payload: {
          uuids: [record.uuid],
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
  };

  //  -------- 批处理相关 START -------

  /**
   * 批量禁用
   */
  handleBatchRemove= () => {
    this.setState({
      batchAction:'删除'
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量处理统一入口
   */
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === basicState.ONLINE.caption) {
          if (selectedRows[i].state === basicState.ONLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          } else {
            this.handleOnline(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          }
        } else {
          if (selectedRows[i].state === basicState.OFFLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          } else {
            that.handleOffline(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          }
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }

    bacth(0);
  }

  //  -------- 批处理相关 END -------

  onView = (uuid) => {
    this.props.dispatch({
      type: 'unitConversion/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'unitConversion/showPage',
      payload: {
        showPage: 'edit',
        entityUuid: uuid?uuid:'',
      }
    });
  }

  onShowUnloadAdviceView = () => {
    this.props.dispatch({
      type: 'unitConversion/showPage',
      payload: {
        showPage: 'unLoadAdvice'
      }
    });
  }

  drawActionButton() {
    return (
      <Fragment>
        {loginOrg().type === orgType.company.name &&
          <div>
            <Button disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)} icon="plus"
              type="primary" onClick={() => this.onCreate()}>
              {commonLocale.createLocale}
            </Button>
          </div>
        }
      </Fragment>
    );
  }

  drawSearchPanel() {
    const { pageFilter } = this.state;
    return (<UnitConversionSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
  }

  drawToolbarPanel() {
    return (
      <Fragment>
        {loginOrg().type === orgType.company.name &&
          <div>
            {/* <Button
              disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_ONLINE)}
              onClick={() =>
                this.handleBatchOnline()
              }
            >
              {commonLocale.batchOnlineLocale}
            </Button> */}
            <Button
              // disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_ONLINE)}
              onClick={() =>
                this.handleBatchRemove()
              }
            >
              {commonLocale.batchRemoveLocale}
            </Button>
          </div>
        }
      </Fragment>
    );
  }

}
