import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Form } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import StockTakePlanSearchForm from './StockTakePlanSearchForm';
import {
  StockTakeSchema, StockTakePlanLocale, StockTakePlanPerm, OperateMethod
} from './StockTakePlanLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { getQueryBillDays } from '@/utils/LoginContext';

const FormItem = Form.Item;

@connect(({ stockTakePlanBill, loading }) => ({
  stockTakePlanBill,
  loading: loading.models.stockTakePlanBill,
}))
@Form.create()
export default class StockTakePlanSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: StockTakePlanLocale.title,
      data: props.stockTakePlanBill.data,
      key: 'stocktakeplan.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    // if (!this.state.pageFilter.likeKeyValues.codeNameLike)
    //     this.state.pageFilter.likeKeyValues.codeNameLike = null;
    // if (!this.state.pageFilter.searchKeyValues.stateEquals)
    //     this.state.pageFilter.searchKeyValues.stateEquals = null;
  }

  componentDidMount() {
    if (this.props.stockTakePlanBill.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.stockTakePlanBill.data,
      entity: {}
    });
  }

  onCreate = (billNumber) => {
    const payload = {
      showPage: 'create'
    }
    if (billNumber != '') {
      payload.billNumber = billNumber;
    }
    this.props.dispatch({
      type: 'stockTakePlanBill/showPage',
      payload: { ...payload }
    });
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'stockTakePlanBill/showPage',
      payload: {
        showPage: 'view',
        billNumber: record.billNumber
      }
    });
  }

  onDelete = (record, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'stockTakePlanBill/remove',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: response => {
        if (response && response.success) {
          this.refreshTable();
          message.success("盘点计划已删除");
        } else {
          message.error(response.message);
        }
      }
    });
  }

  onFinish = (record, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'stockTakePlanBill/finish',
      payload: {
        uuid: record.uuid,
        version: record.version,
      },
      callback: callback ? callback : (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success('盘点计划已完成');
        }
      }
    });
  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    var days = '';
    if (data) {
      if (data.days) {
        days = data.days
      }
      pageFilter.likeKeyValues = {
        ...pageFilter.likeKeyValues,
        billNumberLike: data.billNumberLike
      },
        pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          stateEquals: data.stateEquals,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          ownerEquals: data.owner ? JSON.parse(data.owner).uuid : null,
          serialNum: data.serialNum,
          stockTakeSchema: data.stockTakeSchema,
          operateMehthod: data.operateMehthod,
          ...data,
          days: days
        }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        stateEquals: null,
        days: getQueryBillDays()
      },
        pageFilter.likeKeyValues = {
          billNumberLike: ''
        }
    }
    this.refreshTable();
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
      pageFilter.searchKeyValues.days = getQueryBillDays()
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'stockTakePlanBill/query',
      payload: queryFilter,
    });
  };

  drawActionButton = () => {
    return (
      <Fragment>
        <Button disabled={havePermission(StockTakePlanPerm.CREATE)} icon="plus" type="primary" onClick={() => this.onCreate()}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  drawToolbarPanel = () => {
    return [
      <Button key='finish' disabled={havePermission(StockTakePlanPerm.FINISH)} onClick={() => this.onBatchFinish()}>
        {'批量完成'}
      </Button>,
    ];
  }

  onBatchFinish = () => {
    this.setState({
      batchAction: '完成'
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    selectedRows.forEach(function (e) {
      that.onFinish(e, that.batchCallback);
    });
  }

  drawOtherCom = () => {
    return (
      <div>
        {this.drawProgress()}
      </div>
    );
  }

  drawSearchPanel = () => {
    return <StockTakePlanSearchForm filterValue={this.state.pageFilter.searchKeyValues}
      filterLikeValue={this.state.pageFilter.likeKeyValues}
      refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
  }

  renderOperateCol = (record) => {
    const options = [];
    options.push(
      {
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record),
        disabled: StockTakePlanPerm.VIEW
      }
    )
    if (record && record.state === 'INITIAL')
      options.push(
        {
          name: commonLocale.editLocale,
          disabled: StockTakePlanPerm.EDIT || record.state !== 'INITIAL',
          onClick: this.onCreate.bind(this, record.billNumber),
        }
      )
    if (record && record.state !== 'FINISHED')
      options.push(
        {
          name: commonLocale.finishLocale,
          disabled: StockTakePlanPerm.FINISH || record.state == 'FINISHED',
          onClick: this.onFinish.bind(this, record, false),
          confirm: true,
          confirmCaption: StockTakePlanLocale.title
        }
      )
    if (record && record.state === 'INITIAL')
      options.push(
        {
          name: commonLocale.deleteLocale,
          disabled: StockTakePlanPerm.DELETE || record.state != 'INITIAL',
          onClick: this.onDelete.bind(this, record),
          confirm: true,
          confirmCaption: StockTakePlanLocale.title
        })

    return <OperateCol menus={options} />
  }

  columns = [
    {
      title: '单号',
      dataIndex: 'billNumber',
      sorter: true,
      render: (text, record) => {
        return (
          <a onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      }
    },
    {
      title: '序列号',
      dataIndex: 'serialNum',
      sorter: true,
    },
    {
      title: '货主',
      dataIndex: 'owner',
      sorter: true,
      render: (text, record) =>
        record.owner ? '[' + record.owner.code + ']' + record.owner.name : ''
    },
    {
      title: '盘点模式',
      sorter: true,
      dataIndex: 'stockTakeSchema',
      render: (text, record) =>
        StockTakeSchema[text]
    },
    {
      title: '盘点方式',
      sorter: true,
      dataIndex: 'stockTakeMethod',
      render: (text, record) =>
        OperateMethod[text]
    },
    {
      title: commonLocale.stateLocale,
      sorter: true,
      dataIndex: 'state',
      key: 'state',
      render: (text, record) => {
        return (<BadgeUtil value={record.state} />)
      }
    },
    {
      title: commonLocale.operateLocale,
      render: record => this.renderOperateCol(record)
    },
  ];
}
