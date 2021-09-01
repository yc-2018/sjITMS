import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Popconfirm, Switch, Divider, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BinTypeSearchForm from './BinTypeSearchForm';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { BinType_RES } from './BinTypePermission';
import { BinTypeLocale } from './BinTypeLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';

@connect(({ binType, loading }) => ({
  binType,
  loading: loading.models.binType,
}))
export default class BinTypeSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: BinTypeLocale.title,
      data: props.binType.data,
      key: 'dock.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      created: true
    };
  }

  componentDidMount() {
    if(this.props.binType.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.binType.data
    });
  }

  onCreate = () => {
    this.props.dispatch({
      type: 'binType/showPage',
      payload: {
        showPage: 'create'
      }
    });
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'binType/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onEdit = (record) => {
    this.props.dispatch({
      type: 'binType/showPage',
      payload: {
        showPage: 'create',
        entityUuid: record.uuid
      }
    });
  }
  ///////
  remove = (record, callback) => {
    this.props.dispatch({
      type: 'binType/remove',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: callback ? callback : (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.removeSuccessLocale);
        }
      }
    });
  }

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

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'binType/query',
      payload: queryFilter,
    });
  };

  onBatchRemove = () => {
    this.setState({
      batchAction: basicState.REMOVE.caption
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    selectedRows.forEach(function (e) {
      if (batchAction === basicState.REMOVE.caption) {
        that.remove(e, that.batchCallback);
      }
    });
  }

  drawActionButton = () => {
    return (
      <Fragment>
        <Button icon="plus"
          disabled={!havePermission(BinType_RES.EDIT)}
          type="primary" onClick={this.onCreate}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  drawToolbarPanel() {
    return [
      <Button key="remove"
        disabled={!havePermission(BinType_RES.DELETE)}
        onClick={() => this.onBatchRemove()}>
        {commonLocale.batchRemoveLocale}
      </Button>
    ];
  }

  drawSearchPanel = () => {
    return <BinTypeSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
  }

  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (text, record) => {
        return (
          <a onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      }
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: formatMessage({ id: 'bintype.index.table.column.length' }),
      dataIndex: 'length',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    },
    {
      title: formatMessage({ id: 'bintype.index.table.column.width' }),
      dataIndex: 'width',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    },
    {
      title: formatMessage({ id: 'bintype.index.table.column.height' }),
      dataIndex: 'height',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    },
    {
      title: formatMessage({ id: 'bintype.index.table.column.weight' }),
      dataIndex: 'weight',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    }, {
      title: formatMessage({ id: 'bintype.index.table.column.plotRatio' }),
      dataIndex: 'plotRatio',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    }, {
      title: formatMessage({ id: 'bintype.index.table.column.storageNumber' }),
      dataIndex: 'storageNumber',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => <OperateCol menus={this.fetchOperatePropsOne(record)} />
    },
  ];

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(BinType_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(BinType_RES.EDIT),
      onClick: this.onEdit.bind(this, record)
    }];
  }

}
