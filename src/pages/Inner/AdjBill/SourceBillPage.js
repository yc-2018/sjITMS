import { connect } from 'dva';
import { PureComponent } from "react";
import moment from 'moment';
import { Modal, Form, Input, Button, Col, Row, Table, Select, Drawer, DatePicker, message } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { confirmLocale, cancelLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import SearchPanel from '@/pages/Component/Page/inner/SearchPanel';
import SearchForm from '@/pages/Component/Form/SearchForm';
import { State, Type } from '@/pages/Inner/AdjBill/AdjBillContants';
import StandardTable from '@/components/StandardTable';
import styles from './SourceBillPage.less';
@Form.create()
@connect(({ adj, receive, storeRtn, vendorHandover, loading }) => ({
  adj, receive, storeRtn, vendorHandover,
  loading: loading.models.adj,
}))
export default class SourceBillPage extends PureComponent {
  state = {
    data:{
      list:[],
      pagination:{},
    },
    fieldsValue: {},
    selectedRowKeys: [],
    pageFilter: {
      page: 0,
      pageSize: 10,
      sortFields: {},
      searchKeyValues: {},
    },
    noPagination:true,
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.type == Type.RECEIVE.name) {
      if (nextProps.receive.data && this.props.receive.data&&this.props.receive.data!=nextProps.receive.data
        &&nextProps.receive.data.list.length>0
        &&nextProps.receive.data.list[0].dcUuid == loginOrg().uuid) {
        this.setState({
          data: nextProps.receive.data,
          noPagination:false,
        })
      }
    } else if (this.props.type == Type.STORE_RTN.name) {
      if (nextProps.storeRtn.data && this.props.storeRtn.data&&this.props.storeRtn.data!=nextProps.storeRtn.data
        &&nextProps.storeRtn.data.list&&nextProps.storeRtn.data.list.length>0
        &&nextProps.storeRtn.data.list[0].dcUuid == loginOrg().uuid) {
        this.setState({
          data: nextProps.storeRtn.data,
          noPagination:false,
        })
      }
    } else if (this.props.type == Type.VENDOR_RTN.name) {
      if (nextProps.vendorHandover.data && this.props.vendorHandover.data&&this.props.vendorHandover.data!=nextProps.vendorHandover.data
        &&nextProps.vendorHandover.data.list&&nextProps.vendorHandover.data.list.length>0
        &&nextProps.vendorHandover.data.list[0].dcUuid == loginOrg().uuid) {
        this.setState({
          data: nextProps.vendorHandover.data,
          noPagination:false,
        })
      }
    }
  }
  /**添加 */
  handleOk = () => {
    if (this.state.selectedRowKeys.length <= 0) {
      message.warning('请先选择要添加的行');
      return;
    }
    this.props.getAdjBillNumberList(this.state.selectedRowKeys);
    this.handleAddVisible();
  }
  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { pageFilter } = this.state;
    let type = '';
    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;
    this.refreshTable(pageFilter);
  };
  /**
   * 条件查询
   */
  handleSearch = (e) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    let { pageFilter } = this.state;
    let type = '';
    form.validateFields((err, fieldsValue) => {
      const payload = {}
      if (this.props.type == Type.STORE_RTN.name) {
        if (fieldsValue.store) {
          payload.storeUuid = JSON.parse(fieldsValue.store).uuid
        }
      } else {
        if (fieldsValue.vendor) {
          payload.vendorUuid = JSON.parse(fieldsValue.vendor).uuid
        }
      }
      pageFilter.searchKeyValues = {
        ...payload,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        state: State.AUDITED.name,
        billNumber: fieldsValue.billNumber,
      };
      pageFilter.likeKeyValues = {
        billNumber: fieldsValue.billNumber
      }
      this.refreshTable(pageFilter);
    });
  }
  refreshTable = (pageFilter) => {
    let type = '';
    if (this.props.type == Type.RECEIVE.name) {
      type = 'receive/query';
    } else if (this.props.type == Type.STORE_RTN.name) {
      type = 'storeRtn/query';
    } else if (this.props.type == Type.VENDOR_RTN.name)  {
      type = 'vendorHandover/query';
    }else{
      message.warning('请先选择修正类型');
      return;
    }
    this.props.dispatch({
      type: type,
      payload: pageFilter
    });
  };
  /**重置搜索条件 */
  reset = () => {
    this.setState({
      fieldsValue: {},
      selectedRowKeys: [],
    })
    this.props.form.resetFields();
    this.state.pageFilter.searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      state: State.AUDITED.name,
    };
    this.state.pageFilter.likeKeyValues ={}
    this.refreshTable(this.state.pageFilter);
  }
  /**
   * 控制弹出框展示
   */
  handleAddVisible = () => {
    this.setState({
      data: { list: [] ,pagination:{}},
      selectedRowKeys: [],
      noPagination:true,
    },()=>{
      this.props.form.resetFields();
      this.props.receive.data = {list:[],
        pagination:{}};
      this.props.storeRtn.data = {list:[],
        pagination:{},};
      this.props.vendorHandover.data = {list:[],
        pagination:{},};
      this.props.handleAddVisible();
    });
  }
  /**
   * 获取选中行
   */
  handleRowSelectChange = (keys, rows) => {
    this.setState({
      selectedRowKeys: keys,
    })
  };
  renderContent = () => {
    const { getFieldDecorator } = this.props.form;
    const { fieldsValue } = this.state;
    if (this.props.type == Type.STORE_RTN.name) {
      return (<Col md={8} sm={24}>
        <Form.Item key="store" label={commonLocale.inStoreLocale}>
          {
            getFieldDecorator('store',
              { initialValue: fieldsValue.store ? fieldsValue.store : undefined }
            )(
              <OrgSelect
                placeholder={placeholderLocale(commonLocale.codeLocale)}
                upperUuid={loginCompany().uuid}
                type={'STORE'}
                single
              />)
          }
        </Form.Item>
      </Col>)
    } else {
      return (
        <Col md={8} sm={24}>
          <Form.Item key="vendor" label={commonLocale.inVendorLocale}>
            {
              getFieldDecorator('vendor',
                { initialValue: fieldsValue.vendor ? fieldsValue.vendor : undefined }
              )(
                <OrgSelect
                  placeholder={placeholderLocale(commonLocale.inVendorLocale)}
                  upperUuid={loginCompany().uuid}
                  type={'VENDOR'}
                  single
                />)
            }
          </Form.Item>
        </Col>)
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectedRowKeys, fieldsValue, data } = this.state;
    let adjCols = [{
      title: commonLocale.billNumberLocal,
      key: 'billNumber',
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth + 50,
      render: (val) =>
        <span>
          <a>{val}</a>
        </span>
    },
      {
        title: commonLocale.inWrhLocale,
        key: 'wrh',
        dataIndex: 'wrh',
        width: colWidth.enumColWidth,
        render: text => <EllipsisCol colValue={convertCodeName(text)} />
      },]
    if (this.props.type == Type.STORE_RTN.name) {
      adjCols = [...adjCols, {
        title: commonLocale.inStoreLocale,
        dataIndex: 'store',
        key: 'store',
        width: colWidth.codeNameColWidth,
        render: text => <EllipsisCol colValue={convertCodeName(text)} />
      },
        {
          title: commonLocale.ownerLocale,
          dataIndex: 'owner',
          key: 'owner',
          width: colWidth.codeNameColWidth,
          render: text => <EllipsisCol colValue={convertCodeName(text)} />
        },
        {
          title: "退仓员",
          dataIndex: 'rtner',
          key: 'rtner',
          width: colWidth.codeNameColWidth,
          render: text => <EllipsisCol colValue={convertCodeName(text)} />
        },]
    } else {
      adjCols = [...adjCols, {
        title: commonLocale.vendorLocale,
        dataIndex: 'vendor',
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: text => <EllipsisCol colValue={convertCodeName(text)} />
      },
        {
          title: commonLocale.ownerLocale,
          dataIndex: 'owner',
          key: 'owner',
          width: colWidth.codeNameColWidth,
          render: text => <EllipsisCol colValue={convertCodeName(text)} />
        },]
      if (this.props.type == Type.RECEIVE.name) {
        adjCols = [...adjCols, {
          title: "收货员",
          dataIndex: 'receiver',
          key: 'receiver',
          width: colWidth.codeNameColWidth,
          render: text => <EllipsisCol colValue={convertCodeName(text)} />
        },]
      } else {
        adjCols = [...adjCols, {
          title: "交接员",
          dataIndex: 'handover',
          key: 'handover',
          width: colWidth.codeNameColWidth,
          render: text => <EllipsisCol colValue={convertCodeName(text)} />
        },]
      }
    }
    adjCols.forEach(e => {
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
        title="添加"
        placement="right"
        closable={false}
        onClose={this.handleAddVisible}
        visible={this.props.visible}
        width='85%'
      >
        <div className={styles.formItems}>
          <Form onSubmit={this.handleSearch}>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={8} sm={24}>
                <Form.Item key="billNumber" label={commonLocale.billNumberLocal}>
                  {
                    getFieldDecorator('billNumber', {
                      initialValue: fieldsValue.billNumber
                    })(
                      <Input placeholder={placeholderLocale("单号")} />
                    )}
                </Form.Item>
              </Col>
              {this.renderContent()}
              <Col md={8} sm={24}>
                <div style={{ float: "right" }}>
                  <Button type="primary" htmlType="submit" loading={this.props.loading}>
                    查询
                  </Button>
                  <Button style={{ marginLeft: 12, background: '#516173', color: '#FFFFFF' }} onClick={this.reset}>
                    重置
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
        <div>
          <StandardTable
            rowSelection={{type:'radio',...rowSelection}}
            selectedRows={selectedRowKeys}
            rowKey={record => record.uuid}
            data={data}
            noPagination = {this.state.noPagination}
            columns={adjCols}
            onSelectRow={this.handleRowSelectChange}
            onChange={this.handleStandardTableChange}
          />
        </div>
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
          <Button onClick={this.handleAddVisible} style={{ marginRight: 8 }}>
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
