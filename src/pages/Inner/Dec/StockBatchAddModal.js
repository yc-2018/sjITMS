import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Drawer, Button, message } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth } from '@/utils/ColWidth';
import { convertCodeName, convertArticleDocField } from '@/utils/utils'
import StandardTable from '@/components/StandardTable';
import { checkReceiptBillLocale } from '@/pages/Tms/CheckReceiptBill/CheckReceiptBillLocale';
import { commonLocale } from '@/utils/CommonLocale'
import { itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';

@connect(({ dec, loading }) => ({
  dec,
  loading: loading.models.dec,
}))
export default class StockBatchAddModal extends PureComponent{

  constructor(props) {
    super(props);
    this.state = {
      visible:props.visible,
      binCode:props.binCode,
      wrh:props.wrh,
      owner:props.owner,
      selectedRowKeys: []
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.visible!=this.props.visible){
      if(nextProps.binCode && nextProps.wrh && nextProps.owner) {
        this.props.dispatch({
          type: 'dec/queryDecArticles',
          payload: {
            companyUuid: loginCompany().uuid,
            dcUuid: loginOrg().uuid,
            binCode: nextProps.binCode,
            wrhUuid: nextProps.wrh ? nextProps.wrh.uuid : '-',
            ownerUuid: nextProps.owner ? nextProps.owner.uuid : '-',
            page: 0,
            pageSize: 1000
          },
          callback: response => {
            if (response && response.success) {
              this.setState({
                batchTableData: response.data && response.data.records ? response.data.records : []
              })
            }
          }
        });
      }
      this.setState({
        visible:nextProps.visible,
      })
    }
  }

  handleCancel =()=>{
    this.setState({
      selectedRowKeys: []
    });
    this.props.handleCancel();
  }

  /**
   * 获取选中行
   *  */
  handleSelectRows = rows => {
    this.setState({
      selectedRowKeys: rows,
    });
  }

  /**添加 */
  handleOk=()=>{
    if(this.state.selectedRowKeys.length<=0){
      message.warning('请先选择要添加的行');
      return;
    }
    this.props.getItemList(this.state.selectedRowKeys);
    this.setState({
      batchTableData: [],
      selectedRowKeys: []
    });
  }

  /**
   * 控制弹出框展示
   */
  handlebatchAddVisible=()=>{
    this.setState({
      batchTableData: [],
      selectedRowKeys: []
    });
    this.props.handleCancel();
  }

  columns=[
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
      title: commonLocale.inPriceLocale,
      key: 'price',
      width: itemColWidth.priceColWidth,
      dataIndex:'price'
    },
    {
      title: commonLocale.inQpcAndMunitLocale,
      key: 'qpcStrAndMunit',
      width: itemColWidth.qpcStrColWidth,
      render: record => record.qpcStr || record.munit ? (record.qpcStr + '/' + record.munit) : ''
    },
    {
      title: commonLocale.inProductDateLocale,
      key: 'productionDate',
      width: colWidth.dateColWidth-50,
      render: record => {
        return moment(record.productionDate).format('YYYY-MM-DD');
      }
    },
    {
      title: commonLocale.inValidDateLocale,
      key: 'validDate',
      width: colWidth.dateColWidth-50,
      render: record => record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : ''
    },
    {
      title: commonLocale.productionBatchLocale,
      key: 'productionBatch',
      dataIndex:'productionBatch',
      width: itemColWidth.numberEditColWidth + 50,
    }
  ];

  render(){

    const { batchTableData, selectedRowKeys } = this.state;

    return (
      <Drawer
        title={'库存明细'}
        placement="right"
        onClose={this.handleCancel}
        visible={this.state.visible}
        width={'77%'}
        destroyOnClose
      >
        <StandardTable
          noPagination={true}
          rowKey={record => record.uuid}
          loading={this.props.loading}
          data={{list: batchTableData}}
          selectedRows={selectedRowKeys && selectedRowKeys.length > 0 ? selectedRowKeys : []}
          onSelectRow={this.handleSelectRows}
          columns={this.columns}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '0.5px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
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
