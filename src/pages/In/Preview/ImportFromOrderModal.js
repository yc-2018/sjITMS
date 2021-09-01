import { connect } from 'dva';
import React, { PureComponent } from "react";
import { Form, Input, Button, Col, Row, Drawer, message, Select } from 'antd';
import { commonLocale, notNullLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import styles from '@/pages/Out/Wave/ItemBatchAddModal.less';
import StandardTable from '@/components/StandardTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { alcDiffLocal } from '@/pages/Tms/AlcDiff/AlcDiffBillLocale';
import OrderBillNumberSelect from '@/pages/In/Preview/OrderBillNumberSelect';
import { orderLocale } from '@/pages/In/Order/OrderLocale';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import moment from 'moment';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { State } from '@/pages/In/Order/OrderContants';

@Form.create()
@connect(({ order, loading }) => ({
  order,
  loading: loading.models.order,
}))

export default class ImportFromOrderModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
      data: {},
      fieldsValue:{},
      selectedRowKeys: [],
      pageFilter: {
        page: 0,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          states: [ State.INITIAL.name, State.BOOKING.name, State.BOOKED.name, State.PREVEXAM.name, State.INPROGRESS.name ],
        }
      }
    }
  }

  componentWillMount(){
    
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.visible != nextProps.visible) {
      this.setState({
        visible: nextProps.visible,  
      })
      this.handleSearch();
    }
    if(nextProps.order && nextProps.order.data && nextProps.order.data){
      this.setState({
        data: nextProps.order.data,
      })
    }
  }

  /**添加 */
  handleOk=()=>{

    if(this.state.selectedRowKeys.length<=0){
      message.warning('请先选择要添加的行');
      return;
    }

    this.props.getImportedData(this.state.selectedRowKeys);

    this.setState({
      selectedRowKeys: [],
    });
    this.props.form.resetFields();
  }

  /**
   * 条件查询
   */
  handleSearch=(e)=>{
    const {pageFilter} = this.state;

    this.props.dispatch({
      type: 'order/query',
      payload: pageFilter,
    });
  }

  /**重置搜索条件 */
  reset = () => {
    const {pageFilter} = this.state;
    this.setState({
      fieldsValue:{},
      selectedRowKeys: [],
    })
    if(pageFilter.searchKeyValues) {
      pageFilter.searchKeyValues.vendorUuid = '';
      pageFilter.searchKeyValues.billNumberAndSource = '';
    }
    this.setState({
      pageFilter:{...pageFilter},
      selectValue:''
    });
    this.handleSearch();
    this.props.form.resetFields();
  }

  /**
   * 控制弹出框展示
   */
  handlebatchAddVisible=()=>{
    this.setState({
      orderBillList:[],
      selectedRowKeys: [],
      data: {},
    });
    this.props.form.resetFields();
    this.props.handlebatchAddVisible();
  }

  /**
   * 获取选中行
   */
  handleRowSelectChange = (rows) => {
    this.setState({
      selectedRowKeys: rows,
    })
  };

  onOrderBillNumberChange = (e) => {
    const value = e.target.value;
    const {pageFilter} = this.state;

    let keyValues = pageFilter.searchKeyValues;
      keyValues.billNumberAndSource = value;

    pageFilter.searchKeyValues = keyValues;

    this.setState({
      pageFilter: pageFilter
    })
  }

  onVendorChange = e => {
    const value = JSON.parse(e);
    const {pageFilter} = this.state;

    let keyValues = pageFilter.searchKeyValues;
    keyValues.vendorUuid = value.uuid;

    pageFilter.searchKeyValues = keyValues;

    this.setState({
      pageFilter: pageFilter,
      selectValue: e
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectedRowKeys, data, pageFilter, selectValue} = this.state
    let orderCols = [
      {
        title: commonLocale.billNumberLocal,
        sorter: true,
        width: colWidth.billNumberColWidth,
        render: record => <EllipsisCol colValue={record.billNumber} />
      },
      {
        title: orderLocale.type,
        width: colWidth.enumColWidth,
        render: record => <EllipsisCol colValue={record.type} />
      },
      {
        title: commonLocale.inVendorLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'vendor',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: orderLocale.wrh,
        width: colWidth.codeNameColWidth,
        dataIndex: 'wrh',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: commonLocale.inOwnerLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'owner',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: commonLocale.inlogisticModeLocale,
        width: colWidth.enumColWidth,
        render: record => LogisticMode[record.logisticMode].caption
      },
      {
        title: orderLocale.createTime,
        width: colWidth.dateColWidth,
        render: record => <span>{moment(record.createTime).format('YYYY-MM-DD')}</span>,
      },
      {
        title: commonLocale.inValidDateLocale,
        width: colWidth.dateColWidth + 30,
        render: record => <span>{moment(record.expireDate).format('YYYY-MM-DD')}</span>,
      },
      {
        title: commonLocale.stateLocale,
        width: colWidth.enumColWidth,
        render: record => <BadgeUtil value={record.state} />
      },
    ];

    orderCols.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        }
      }
    });

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };

    return (
      <Drawer
        title='从订单导入'
        placement="right"
        closable={false}
        onClose={this.handlebatchAddVisible}
        visible={this.props.visible}
        width='85%'
      >
        <div className={styles.formItems} style={{marginTop:'20px'}}>
          <Form>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24} >
                  <Form.Item md={8} sm={24} label={"配货通知单"}>
                    {
                      getFieldDecorator('billNumberAndSource')(
                        <Input placeholder={placeholderLocale(commonLocale.orderBillNumberLocal)}
                               key="billNumberAndSource"
                               value={pageFilter.searchKeyValues.billNumberAndSource ? pageFilter.searchKeyValues.billNumberAndSource : ''}
                               onChange= {this.onOrderBillNumberChange}/>
                      )}
                  </Form.Item>
                </Col>
              <Col md={8} sm={24}>
                <Form.Item md={8} sm={24} label={"供应商"}>
                  {
                    getFieldDecorator('vendor')(
                      <OrgSelect
                        upperUuid={loginCompany().uuid}
                        type={'VENDOR'}
                        single
                        placeholder={placeholderChooseLocale('供应商')}
                        onChange={this.onVendorChange}
                      />
                    )}
                </Form.Item>
              </Col>
              <Col md={24} sm={24}>
                <div style={{float:"right"}}>
                  <Button type="primary" onClick={this.handleSearch}>
                    查询
                  </Button>
                  <Button htmlType="submit" onClick={this.reset} style={{marginLeft:'10px'}}>
                    重置
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
        <div>
          <StandardTable
            noPagination={true}
            selectedRows={selectedRowKeys}
            rowKey={record => record.uuid}
            data={{list:data.list}}
            columns={orderCols}
            onSelectRow={this.handleRowSelectChange}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 10,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '0.5px 16px',
            background: '#fff',
            textAlign: 'right',
            paddingTop:'10px'
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
