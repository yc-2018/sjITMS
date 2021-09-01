import { connect } from 'dva';
import { PureComponent } from "react";
import { Button, Drawer,Table } from 'antd';
import moment from 'moment';
import { commonLocale } from '@/utils/CommonLocale';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import StandardTable from '@/components/StandardTable';
import { convertCodeName, formatDate } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binUsage } from '@/utils/BinUsage';
import styles from '@/pages/Component/Form/PanelItemBatchAdd.less';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';

import SearchFormforBatch  from './SearchFormforBatch';
import { putawayLocale } from './PutawayLocale';
/**
 * 上架批量新增组件
 */
@connect(({ putaway, loading }) => ({
  putaway,
  loading: loading.models.putaway,
}))
export default class ItemBatchAddModal extends PureComponent {
	state = {
    selectedRows: [],
    batchStocks:{
      list: [],
      pagination: {},
    },
    pageFilter: {
      page: 0,
      pageSize: 200,
    }
  }
  componentDidMount(){
    if(this.props.putaway.batchStocks){
      this.props.putaway.batchStocks = undefined;
    }
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.putaway.batchStocks&&this.props.putaway.batchStocks){
      this.setState({
        batchStocks:nextProps.putaway.batchStocks
      });
    }
    
    if(nextProps.ownerUuid&&nextProps.ownerUuid!=this.props.ownerUuid){
      this.onSearch({
        binCode:'!'
      });
    }
  }
  /**
   * 批量添加搜索框
   */
  onSearch = (data) => {
		const payload = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      ownerUuid:this.props.ownerUuid,
      page:this.state.pageFilter.page,
      pageSize:this.state.pageFilter.pageSize,
      ...data
    }
    this.props.dispatch({
      type: 'putaway/queryForBatch',
      payload: { ...payload },
    });
  }

	/**添加 */
	handleOk = () => {
    let list = [];
    for(let i = 0;i<this.state.selectedRows.length;i++){
      let obj = this.state.selectedRows[i];
      if (list && list.find(function (item) {
        return item.sourceContainerBarcode === obj.sourceContainerBarcode&&item.article.uuid === obj.article.uuid
        &&item.qpcStr === obj.qpcStr&&item.productionBatch === obj.productionBatch&&item.stockBatch === obj.stockBatch
      }) === undefined) {
        list.push({ ...obj });
      }
    }
    this.props.getSeletedItems(list);
		this.handlebatchAddVisible();    
	}

	/** 控制弹出框展示*/
	handlebatchAddVisible = () => {
		this.setState({
			selectedRows: [],
		});
		this.props.handlebatchAddVisible();
	}

	/** 获取选中行*/
	handleRowSelectChange = (rows, keys) => {
    let arr=[];
    for(let i =0;i<rows.length;i++){
      this.state.batchStocks.list.map(item=>{
        if(item.sourceContainerBarcode== rows[i].sourceContainerBarcode){
          arr.push(item);
        }
      })
    }
		this.setState({
			selectedRows: arr,
		});
  };
  
  /**
   * 表格变化时
   */
  handleTableChange = (pagination, filtersArg, sorter) => {
		const { pageFilter } = this.state;

		pageFilter.page = pagination.current - 1;
		pageFilter.pageSize = pagination.pageSize;

		// 判断是否有过滤信息
		const filters = Object.keys(filtersArg).reduce((obj, key) => {
			const newObj = { ...obj };
			newObj[key] = getValue(filtersArg[key]);
			return newObj;
		}, {});
		this.onSearch();
  }

	render() {
		const { selectedRows,batchStocks } = this.state
		const rowSelection = {
      selectedRows,
			onChange: this.handleRowSelectChange,
    };
    let batchColumns=[
    {
      title: commonLocale.containerLocale,
      dataIndex: 'sourceContainerBarcode',
      key: 'sourceContainerBarcode',
      width: colWidth.containerEditColWidth-200,
    },
    {
      title: '来源货位',
      width: itemColWidth.articleEditColWidth-100,
      render: record => {
        return (
          <EllipsisCol colValue={record.sourceBinCode?<span>{record.sourceBinCode+'['+binUsage[record.sourceBinUsage].caption+']'}</span>:<Empty/>} />
        );
      }
    },
    {
      title: commonLocale.articleLocale,
      dataIndex: 'article',
      key: 'article',
      width: colWidth.codeNameColWidth,
      render:val=>{
        return <EllipsisCol colValue={convertCodeName(val)} />;
      }
    },
    {
      title: commonLocale.vendorLocale,
      dataIndex: 'vendor',
      key: 'vendor',
      width: colWidth.codeNameColWidth,
      render:val=>{
        return <EllipsisCol colValue={convertCodeName(val)} />;
      }
    },
    {
      title: commonLocale.inQpcAndMunitLocale,
      key: 'qpcStrAndMunit',
      width: itemColWidth.qpcStrColWidth,
      render: record => record.qpcStr || record.munit ? (record.qpcStr + '/' + record.munit) : ''
    },
    {
      title: putawayLocale.spec,
      key: 'spec',
      dataIndex: 'spec',
      width: itemColWidth.qpcStrColWidth-20,
    },
    {
      title: commonLocale.inQtyLocale,
      key: 'qty',
      dataIndex: 'qty',
      width: itemColWidth.qtyStrColWidth-100,
    },
    {
      title: commonLocale.inProductDateLocale,
      key: 'productDate',
      width: colWidth.dateColWidth-50,
      render: record => {
        return moment(record.productDate).format('YYYY-MM-DD');
      }
    },
    {
      title: commonLocale.inValidDateLocale,
      key: 'validDate',
      width: colWidth.dateColWidth-50,
      render: record => record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : ''
    }, 
    {
      title: commonLocale.inPriceLocale,
      key: 'price',
      width: itemColWidth.priceColWidth,
      dataIndex:'price'
    }, 
  ];
		return (
			<Drawer
				title={this.props.title ? this.props.title : "批量添加"}
				placement="right"
				closable={false}
				onClose={this.handlebatchAddVisible}
				visible={this.props.visible}
				width='77%'
			>
				<div className={styles.panelSearch}>
					<SearchFormforBatch refresh={this.onSearch} fieldsValue={''} />
				</div>
				<StandardTable
					selectedRows={selectedRows}
					rowKey={record => record.uuid}
					data={batchStocks}
					columns={batchColumns}
					onSelectRow={this.handleRowSelectChange}
					onChange={this.handleTableChange}
        />
				<div className={styles.buttonBottom}>
					<Button onClick={this.handlebatchAddVisible} style={{ marginRight: 8 }}>
						{commonLocale.cancelLocale}
					</Button>
					<Button onClick={this.handleOk} type="primary">
						添加
          </Button>
				</div>
			</Drawer>
		);
	}
}