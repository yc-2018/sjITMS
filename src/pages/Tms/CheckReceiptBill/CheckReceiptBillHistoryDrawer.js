

import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Drawer } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils'
import Empty from '@/pages/Component/Form/Empty'
import StandardTable from '@/components/StandardTable';
import { checkReceiptBillLocale } from './CheckReceiptBillLocale';

@connect(({ checkReceiptBill, loading }) => ({
  checkReceiptBill,
  loading: loading.models.checkReceiptBill,
}))
export default class CheckReceiptBillHistoryDrawer extends PureComponent{

  constructor(props) {
    super(props);
    this.state = {
      visible:props.visible,
      billNumber:props.billNumber,
      list:[],
      data:{},
      pageFilter:{
        page: 0,
        pageSize: 10,
        searchKeyValues:{
          companyUuid: loginCompany().uuid,
          dispatchCenterUuid: loginOrg().uuid,
          orderBillNumber:props.billNumber,
        }
      }
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.billNumber!=this.props.billNumber){
      this.state.pageFilter.searchKeyValues.orderBillNumber = nextProps.billNumber
      this.setState({
        billNumber:nextProps.billNumber,
        pageFilter:this.state.pageFilter
      },()=>{
        this.refresh(this.state.pageFilter);
      });
    }
    
    if(nextProps.visible!=this.props.visible){
      this.refresh();
      this.setState({
        visible:nextProps.visible
      })
    }
    if(nextProps.checkReceiptBill.dataForHistory&&nextProps.checkReceiptBill.dataForHistory!=this.props.checkReceiptBill.dataForHistory){
      this.setState({
        data:nextProps.checkReceiptBill.dataForHistory
      })
    }
  }


  /**
   * 查询
   */
  refresh =(pageFilter)=>{
    this.props.dispatch({
      type: 'checkReceiptBill/queryForHistory',
      payload: pageFilter?pageFilter:this.state.pageFilter
    });
  }

  handleCancel =()=>{
    this.props.handleCancel();
  }

  /**
     * 表格内容改变时，调用此方法，排序触发
     */
    handleStandardTableChange = (pagination, filtersArg, sorter) => {
      const { dispatch } = this.props;
      const { pageFilter } = this.state;

      if (pageFilter.page !== pagination.current - 1) {
          pageFilter.changePage = true;
      }

      pageFilter.page = pagination.current - 1;
      pageFilter.pageSize = pagination.pageSize;

      // 判断是否有过滤信息
      const filters = Object.keys(filtersArg).reduce((obj, key) => {
          const newObj = { ...obj };
          newObj[key] = getValue(filtersArg[key]);
          return newObj;
      }, {});

      if (sorter.field) {
          var sortField = `${sorter.field}`;
          var sortType = sorter.order === 'descend' ? true : false;
          // 排序触发表格变化清空表格选中行，分页则不触发
          if (pageFilter.sortFields[sortField] === sortType) {
              pageFilter.changePage = true;
          } else {
              pageFilter.changePage = false;
          }
          // 如果有排序字段，则需要将原来的清空
          pageFilter.sortFields = {};
          pageFilter.sortFields[sortField] = sortType;
      }
      this.refresh(pageFilter);
  };

  columns=[
    {
      title: checkReceiptBillLocale.archLine,
      dataIndex: 'archLine',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: checkReceiptBillLocale.orderNo,
      dataIndex: 'orderNo',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: checkReceiptBillLocale.shipPlanBillNumber,
      dataIndex: 'shipPlanBillNumber',
      width:200,
      render:val=>val?val:<Empty/>

    },
    {
      title: checkReceiptBillLocale.orderBillNumber,
      dataIndex: 'orderBillNumber',
      width:200,
      render:val=>val?val:<Empty/>
    },
    {
      title: checkReceiptBillLocale.shipBillNumber,
      dataIndex: 'shipBillNumber',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?val:<Empty/>
    },
    {
      title: checkReceiptBillLocale.wmsNumber,
      dataIndex: 'wmsNumber',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?val:<Empty/>
    },
    {
      title: checkReceiptBillLocale.driver,
      dataIndex: 'driver',
      width:200,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: checkReceiptBillLocale.carrier,
      dataIndex: 'carrier',
      width:200,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: checkReceiptBillLocale.receiptedOper,
      dataIndex: 'receiptedOper',
      width:200,
      render:val=>val&&val.fullName?val.fullName:<Empty/>
    },
    {
      title: checkReceiptBillLocale.receiptedTime,
      dataIndex: 'receiptedTime',
      width:200,
      render:val=>val?moment(val).format('YYYY-MM-DD HH:mm:ss'):<Empty/>
    },
  ]; 

  render(){

    const { entity ,list,data } = this.state;

    
    return (
      <Drawer
				title={checkReceiptBillLocale.drawerTitle}
				placement="right"
				onClose={this.handleCancel}
				visible={this.state.visible}
				width={'77%'}
        destroyOnClose
			>
         <StandardTable
            rowKey={record => record.uuid}
            loading={this.props.loading}
            data={data}
            selectedRows={[]}
            columns={this.columns}
            onChange={this.handleStandardTableChange}
        />
      </Drawer>
    );
  }
}