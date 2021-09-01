import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import SearchPage from '@/pages/Component/Page/SearchPage';
import PalletBinTypeSearchForm from './PalletBinTypeSearchForm';
import { CONTAINERTYPE_RES } from './PalletBinTypePermission';
import { palletBinTypeLocale } from './PalletBinTypeLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';

const FormItem = Form.Item;

@connect(({ palletBinType, loading }) => ({
  palletBinType,
  loading: loading.models.palletBinType,
}))
@Form.create()
export default class PalletBinTypeSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      suspendLoading: false,
      title: palletBinTypeLocale.title,
      data: props.palletBinType.data,
      key: 'palletBinType.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    if (!this.state.pageFilter.likeKeyValues.codeNameLike)
      this.state.pageFilter.likeKeyValues.codeNameLike = '';
  }

  componentDidMount() {
    if(this.props.palletBinType.fromView) {
      return;
    } else {
      // this.refreshTable();
    }
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.palletBinType.data,
      entity: {}
    });
  }

  onCreate = (uuid) => {
    const payload = {
      showPage: 'create'
    }
    if (uuid != '') {
      payload.entityUuid = uuid;
    }
    this.props.dispatch({
      type: 'palletBinType/showPage',
      payload: { ...payload }
    });
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'palletBinType/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onRemove = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'palletBinType/remove',
        payload: record.uuid,
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

  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.likeKeyValues = {
        ...pageFilter.likeKeyValues,
        ...data
      },
        pageFilter.searchKeyValues = {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
        pageFilter.likeKeyValues = {
          codeNameLike: ''
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
      type: 'palletBinType/query',
      payload: queryFilter,
    });
  };

  drawActionButton = () => {
    return (
      <Fragment>
        <Button icon="plus" type="primary" onClick={() => this.onCreate()}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  drawToolbarPanel = () => {
    return (
      <Button onClick={() => this.onBatchOnRemove()}>
        {commonLocale.batchRemoveLocale}
      </Button>
    );
  }

  onBatchOnRemove = () => {
    this.setState({
      batchAction: palletBinTypeLocale.remove
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
        if (batchAction === palletBinTypeLocale.remove) {
          that.onRemove(selectedRows[i], true).then(res => {
            bacth(i + 1);
          });
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }
    bacth(0);
  }

  drawOtherCom = () => {
    return (
      <div>
        {this.drawProgress()}
      </div>
    );
  }

  drawSearchPanel = () => {
    return <PalletBinTypeSearchForm filterValue={this.state.pageFilter.likeKeyValues} refresh={this.onSearch} />;
  }

  fetchOperateProps = (record) => {
    return [
      {
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      },
      {
        name: commonLocale.editLocale,
        // disabled: !havePermission(CONTAINERTYPE_RES.EDIT),
        onClick: this.onCreate.bind(this, record.uuid)
      }
    ];
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
      title: palletBinTypeLocale.barCodePrefix,
      dataIndex: 'barCodePrefix',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    },
    {
      title: palletBinTypeLocale.barCodeLength,
      dataIndex: 'barCodeLength',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    },
    {
      title: palletBinTypeLocale.size,
      width: itemColWidth.qpcStrColWidth,
      dataIndex: 'theThreeHigh',
      sorter: true,
      render: (text, record) => {
        return (
          <span>
            {record.length}/{record.width}/{record.height}
          </span>
        );
      }
    },

    {
      title: palletBinTypeLocale.weight,
      width: itemColWidth.qpcStrColWidth,
      sorter: true,
      dataIndex: 'weight'
    },
    {
      title: palletBinTypeLocale.plotRatio,
      width: itemColWidth.qpcStrColWidth,
      sorter: true,
      dataIndex: 'plotRatio'
    },
    {
      key: 'operate',
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => {
        return <OperateCol menus={this.fetchOperateProps(record)} />
      }
    }
  ];
}
