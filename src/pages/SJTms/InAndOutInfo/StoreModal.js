import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { commonLocale } from '@/utils/CommonLocale';
import StandardTable from '@/components/StandardTable';
import { colWidth } from '@/utils/ColWidth';
import { Modal, InputNumber, Button, message } from 'antd';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import Empty from '@/pages/Component/Form/Empty';
import { accAdd } from '@/utils/QpcStrUtil';
import { dispatchReturnLocale } from './DispatchReturnLocale';
@connect(({ dispatchReturnStore, loading }) => ({
  dispatchReturnStore,
  loading: loading.models.dispatchReturnStore,
}))
export default class StoreModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible:props.visible,
      shipBillTmsUuid:props.shipBillTmsUuid,
      data:props.dispatchReturnStore.dataForStore,
      selectedRows:[],
      isView:props.isView,
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {},
        searchKeyValues: {
          companyUuid:loginCompany().uuid,
          dispatchCenterUuid:loginOrg().uuid,
          shipBillTmsUuid:props.shipBillTmsUuid
        },
        likeKeyValues: {}
      }
    }
  }
  componentWillMount(){
    if(this.state.storeUuid){
      this.refresh();
    }
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.shipBillTmsUuid!=this.props.shipBillTmsUuid){
      this.state.pageFilter.searchKeyValues.shipBillTmsUuid = nextProps.shipBillTmsUuid
      this.setState({
        shipBillTmsUuid:nextProps.shipBillTmsUuid,
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

    if(nextProps.dispatchReturnStore.dataForStore&&nextProps.dispatchReturnStore.dataForStore!=this.props.dispatchReturnStore.dataForStore){
      this.setState({
        data:nextProps.dispatchReturnStore.dataForStore
      })
    }
  }

  refresh(pageFilter){
    this.props.dispatch({
      type: 'dispatchReturnStore/queryByStore',
      payload: pageFilter?pageFilter:this.state.pageFilter,
    })
  }

  /**
   * 获取选中行
   *  */
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleOk = ()=>{
    const { selectedRows } = this.state;
    if(selectedRows.length == 0){
      message.warning('请先选择行');
      return;
    }
    selectedRows.forEach(e=>{
      e.feetype = '停车费';
      e.feename = '停车费';
    })
    this.props.dispatch({
      type: 'dispatchReturnStore/onConfirmByStore',
      payload:selectedRows,
      callback:response=>{
        if(response&&response.success){
          this.setState({
            selectedRows:[]
          })
          this.refresh();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })

  }
  handleCancel = ()=>{
    this.props.handleModal()
  }

  handleStandardTableChange = ()=>{
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

    if (this.refresh)
        this.refresh(pageFilter);
  }

  handleFieldChange = (e,  fieldName , line)=>{
     const { data } = this.state;
    let target = data.list[line];
    target[fieldName] = e;
    this.setState({
      data:data
    })
  }
  columns = [
    {
      title: dispatchReturnLocale.archLine,
      dataIndex: 'archLine',
      width: colWidth.billNumberColWidth + 50,
      render:(val,record)=>{
        return record.archlinecode && record.archlinename ?'['+record.archlinecode+']'+record.archlinename:<Empty/>;
      }
      
    },
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'store',
      width: colWidth.billNumberColWidth + 50,
      render:(val,record)=>{
       return record.storecode && record.storename ?'['+record.storecode+']'+record.storename:<Empty/>;
      }

    },
    {
      title: dispatchReturnLocale.parkingFee,
      dataIndex: 'parkingfee',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?val:0
    },
    {
      title: dispatchReturnLocale.stopCarFee,
      dataIndex: 'amount',
      width: colWidth.billNumberColWidth + 50,
      render:(val,record,index)=>this.state.isView?<span>{val}</span>:<InputNumber min={0} value={val?val:0} onChange={e => this.handleFieldChange(e, 'amount', index)}/>
    },

  ];
  render() {
    const { selectedRows,visible,data,isView } = this.state;
    let totalAmountSelect = 0;
    let totalAmountAll = 0;
    selectedRows.forEach(row=>{
      totalAmountSelect = accAdd(row.amount,totalAmountSelect);
    });
    data.list.forEach(item=>{
      totalAmountAll = accAdd(item.amount,totalAmountAll);
    })

    return <Modal
        title={'排车单门店明细费用信息（排车单号：'+(data.list[0]?data.list[0].billnumber:'')+'）'}
        visible={visible}
        destroyOnClose={true}
        onCancel={()=>this.handleCancel()}
        footer={[]}
        okText={commonLocale.confirmLocale}
        cancelText={commonLocale.cancelLocale}
        width={'70%'}
        style = {{overflow:'auto'}}
      >
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          {
            isView?
            <span>{dispatchReturnLocale.totalStopCarFee}：{totalAmountAll}</span>
            :
            <div>
              <span>{dispatchReturnLocale.totalStopCarFee}：{totalAmountAll}</span>
              &emsp;
            <Button type="primary" onClick={()=>this.handleOk()}>{commonLocale.saveLocale}</Button>

            </div>
          }

        </div>
        <StandardTable
          rowKey={record => record.uuid}
          selectedRows={selectedRows}
          unShowRow={isView==true?true:false}
          loading={this.props.loading}
          data={data}
          columns={this.columns}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleStandardTableChange}
        />
    </Modal>
  }
}
