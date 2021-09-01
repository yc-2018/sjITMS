import { Fragment } from 'react';
import { connect } from 'dva';
import { message, Button } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import PreviewBillSearchForm from './PreviewBillSearchForm';
import { PREVEXAM_RES } from './PreviewPermission';
import { PreviewLocale } from './PreviewLocale';
import { state, moveType, getStateCaption, getTypeCaption } from './PreviewContants';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { getQueryBillDays } from '@/utils/LoginContext';
@connect(({ preview, loading }) => ({
	preview,
	loading: loading.models.preview,
}))

export default class PreviewBillSearchPage extends SearchPage {

	constructor(props) {
		super(props);

		this.state = {
			...this.state,
			title: '预检单',
			data: props.preview.data,
			suspendLoading: false,		
      reportParams: [],
      key: 'preview.search.table',
		};

		this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
		this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
	}

	componentDidMount() {
    if(this.props.preview.fromView) {
      return;
    } else {
      this.refreshTable();
    }
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			data: nextProps.preview.data
		});
	}

	changeSelectedRows = (selectedRows) => {
    let param = [];
    for (let i = 0; i < selectedRows.length; i++) {
      param.push({
        billNumber: selectedRows[i].billNumber
      })
    }
    this.setState({
      reportParams: param
    }, () => { })
	}
	
	refreshTable = (filter) => {
		const { dispatch } = this.props;
		const { pageFilter } = this.state;
		if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
        reportParams: []
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
			type: 'preview/query',
			payload: queryFilter,
		});
	};

	onSearch = (data) => {
		const { pageFilter } = this.state;
		pageFilter.page = 0;
    var days = '';
		if (data) {
      if (data.days) {
        days = data.days
      }
			pageFilter.searchKeyValues = {
				...pageFilter.searchKeyValues,
				...data,
        days: days
      }
		} else {
			pageFilter.searchKeyValues = {
				companyUuid: loginCompany().uuid,
				dcUuid: loginOrg().uuid,
				state: '',
        days: getQueryBillDays()
      }
		}

    if (data && data.vendor) {
      pageFilter.searchKeyValues.vendorUuid = JSON.parse(data.vendor).uuid;
    }

		this.refreshTable();
	}

	drawActionButton = () => {
		return (
			<Fragment>
				<Button icon="plus" type="primary"
					  disabled={!havePermission(PREVEXAM_RES.CREATE)}
					onClick={() => this.onCreate(null)}>
					{commonLocale.createLocale}
				</Button>
			</Fragment>
		);
	}

	onCreate = (record) => {
	  let showPage = '';
	  if (!record){
	    showPage = 'create'
    }else {  //编辑页面重新做，不和新建放一起
      if (record.groupNo) {
        showPage = 'editForGroup'
      } else {
        showPage = 'editForSingle'
      }
    }
		this.props.dispatch({
			type: 'preview/showPage',
			payload: {
				showPage: showPage,
				entityUuid: record? record.uuid : undefined,
        groupNo: record? record.groupNo : undefined,
        ocrDate: record? record.ocrDate : undefined,
			}
		});
	}

	onView = (record) => {
    this.props.dispatch({
      type: 'preview/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid,
        version: record.version,
        groupNo: record.groupNo,
        ocrDate: record.ocrDate,
      }
    });
	}

	 /**
   * 批量完成
   */
  onBatchFinish = () => {
    this.setState({
      batchAction: commonLocale.finishLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
	}
	

	// 批量操作
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.finishLocale) {
          if (selectedRows[i].state === state.audited.name) {
            that.onFinish(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
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

	onAudit = (record, batch) => {
		const that = this;
		return new Promise(function (resolve, reject) {
			that.props.dispatch({
				type: 'preview/audit',
				payload: {
          uuid: record.uuid,
          groupNo: record.groupNo,
          ocrDate: record.ocrDate,
					dcUuid: record.dcUuid,
				},
				callback: response => {
					if (response && response.success) {
						that.refreshTable();
						message.success(commonLocale.auditSuccessLocale);
					} else {
						message.error(response.message)
					}
				}
			});
		})
	}
	
	onFinish = (record, batch) => {
		const that = this;
		return new Promise(function (resolve, reject) {
			that.props.dispatch({
				type: 'preview/finish',
				payload: {
          uuid: record.uuid,
          version: record.version,
				},
				callback: response => {
					if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
					if (response && response.success) {
						that.refreshTable();
						message.success(commonLocale.finishSuccessLocale);
					}
				}
			});
		})
	}

	fetchOperatePropsOne = (record) => {
		return [{
			name: commonLocale.viewLocale,
			onClick: this.onView.bind(this, record)
		},{
			name: commonLocale.finishLocale,
			onClick: this.onFinish.bind(this, record,false),
			disabled: !havePermission(PREVEXAM_RES.FINISH),
		}];
	}

	fetchOperatePropsTwo = (record) => {
		return [
		  {
			name: commonLocale.viewLocale,
			onClick: this.onView.bind(this, record)
	  	},
      {
        name: commonLocale.editLocale,
        disabled: !havePermission(PREVEXAM_RES.CREATE),
        confirm: false,
        confirmCaption: '预检单',
        onClick: this.onCreate.bind(this, record)
      },
      {
			name: commonLocale.auditLocale,
			disabled: !havePermission(PREVEXAM_RES.AUDIT),
			confirm: true,
			confirmCaption: '预检单',
			onClick: this.onAudit.bind(this, record)
		}];
	}

	renderOperateCol = (record) => {
		if (record.state === state.SAVED.name) {
			return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
		}
		if (record.state === state.audited.name) {
			return <OperateCol menus={this.fetchOperatePropsOne(record)} />
		}
	}

	drawSearchPanel = () => {
		return (
			<PreviewBillSearchForm
				filterValue={this.state.pageFilter.searchKeyValues}
				refresh={this.onSearch}
        toggleCallback={this.toggleCallback}
			/>
		);
	}

	/**
  * 绘制批量工具栏
  */
 drawToolbarPanel() {
    return [
      <Button onClick={() => this.onBatchFinish()} disabled={!havePermission(PREVEXAM_RES.FINISH)}>
        {commonLocale.batchFinishLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={this.state.reportParams}
        moduleId={'PREVEXAMBILL'} />
    ];
}

	columns = [
    {
      key: 'billNumber',
      title: commonLocale.billNumberLocal,
      sorter: true,
      width: colWidth.billNumberColWidth,
      dataIndex: 'billNumber',
      render: (val, record) =>
        <span>
					<a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
				</span>
    },
		{
			key: 'groupNo',
			title: '预检组号',
			width: colWidth.codeNameColWidth,
			dataIndex: 'groupNo',
			sorter: true,
			render: val => <EllipsisCol colValue={val ? val : ''} />
		},
		{
			key: 'serialNo',
			title: '预检序号',
			width: 80,
			sorter: true,
			dataIndex: 'serialNo',
			render: val => <EllipsisCol colValue={val ? val : ''} />
		},
		{
			key: 'orderBillNumber',
			title: '订单号',
			sorter: true,
			width: colWidth.billNumberColWidth,
			dataIndex: 'orderBillNumber',
			render: val => <EllipsisCol colValue={val ? val : ''} />
		},
		{
			key: 'vendor',
			title: '供应商',
			dataIndex: 'vendor',
			sorter: true,
			width: colWidth.enumColWidth,
			render: val => <EllipsisCol colValue={convertCodeName(val)} />
		},
		{
			key: 'state',
			title: commonLocale.stateLocale,
			width: colWidth.enumColWidth,
			dataIndex: 'state',
			sorter: true,
			render: val => <BadgeUtil value={val} />
		},
		{
			title: commonLocale.operateLocale,
			width: colWidth.operateColWidth,
			render: (text, record) => (
					this.renderOperateCol(record)
			),
		},
	];
}
