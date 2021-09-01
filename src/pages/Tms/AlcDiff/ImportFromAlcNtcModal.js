import { connect } from 'dva';
import { PureComponent } from "react";
import { Form, Input, Button, Col, Row, Drawer, message, Select } from 'antd';
import { commonLocale, notNullLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import styles from '@/pages/Out/Wave/ItemBatchAddModal.less';
import StandardTable from '@/components/StandardTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import AlcNtcBillNumberSelect from '@/pages/Tms/AlcDiff/AlcNtcBillNumberSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { alcDiffLocal } from '@/pages/Tms/AlcDiff/AlcDiffBillLocale';
import CFormItem from '@/pages/Component/Form/CFormItem';
import SFormItem from '@/pages/Component/Form/SFormItem';

@Form.create()
@connect(({ alcNtc, pickup, loading }) => ({
  alcNtc, pickup,
  loading: loading.models.alcNtc,
}))

export default class ImportFromAlcNtcModal extends PureComponent {
  state = {
    alcNtcBill: {},
    alcPickupStockItem: [],
    fieldsValue:{},
    selectedRowKeys: [],
  }

  componentWillMount(){

  }

  componentWillReceiveProps(nextProps) {

  }

  /**添加 */
  handleOk=()=>{

    if(this.state.selectedRowKeys.length<=0){
            message.warning('请先选择要添加的行');
            return;
        }

    this.props.getImportedData(this.state.selectedRowKeys);
    this.props.getImportedHeadDate(this.state.alcNtcBill);

    this.setState({
      selectedRowKeys: [],
    });
    this.props.form.resetFields();
  }

  getAlcNtcBill=(value)=>{

    this.setState({alcNtcBill: JSON.parse(value)});
  }
  /**
   * 条件查询
   */
  handleSearch=(e)=>{
    const {alcNtcBill} = this.state;
    if (!alcNtcBill.uuid){
      message.warn('请先选择一张配货通知单。');
      return;
    }
    const { dispatch } = this.props;
    const payload = {uuid: alcNtcBill.uuid};
    dispatch({
      type: 'pickup/pickupStockItem',
      payload: payload,
      callback: (response) => {
        if (response && response.success && response.data) {
          this.setState({
            alcPickupStockItem: response.data,
          })
        }
      }
    });
  }

  /**重置搜索条件 */
  reset = () => {
    this.setState({
      fieldsValue:{},
      selectedRowKeys: [],
    })
    this.props.form.resetFields();
  }

  /**
   * 控制弹出框展示
   */
  handlebatchAddVisible=()=>{
    this.setState({
      alcNtcBillList:[],
      selectedRowKeys: [],
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectedRowKeys, fieldsValue, alcPickupStockItem, items} = this.state
    let alcNtcDtlCols = [
      {
        title: commonLocale.articleLocale,
        key: 'article',
        dataIndex: 'article',
        width: itemColWidth.articleColWidth,
        render: (text, record) => <EllipsisCol colValue={record.article? '[' + record.article.articleCode + ']' + record.article.articleName : ''} />
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        dataIndex: 'qpcStr',
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth,
        render: (text, record) => <EllipsisCol colValue={record? record.qpcStr + '/' + record.article.munit : ''} />
      },
      {
        title: commonLocale.inQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: commonLocale.inQtyLocale,
        dataIndex: 'qty',
        key: 'qty',
        width: itemColWidth.qtyColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: commonLocale.bincodeLocale,
        dataIndex: 'binCode',
        key: 'binCode',
        width: itemColWidth.binCodeEditColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: commonLocale.productionBatchLocale,
        dataIndex: 'productionBatch',
        key: 'productionBatch',
        width: itemColWidth.articleEditColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: commonLocale.inVendorLocale,
        dataIndex: 'vendor',
        key: 'vendor',
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => <EllipsisCol colValue={record.vendor ? convertCodeName(record.vendor) : undefined}/>
      },
    ];

    alcNtcDtlCols.forEach(e => {
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
        title='从配单导入'
        placement="right"
        closable={false}
        onClose={this.handlebatchAddVisible}
        visible={this.props.visible}
        width='85%'
      >
        <div className={styles.formItems}>
          <Form onSubmit={this.handleSearch}>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={8} sm={24}>
                <Form.Item md={8} sm={24} label={"配货通知单"}>
                  {
                    getFieldDecorator('alcNtcBillNumber', {rules: [
                        {
                          required: true,
                          message: notNullLocale('配货通知单')
                        }
                      ],})(
                      <AlcNtcBillNumberSelect key="alcNtcBillNumber" label={'配货通知单'} onChange = {this.getAlcNtcBill}/>
                  )}
               </Form.Item>
              </Col>
              <Col md={24} sm={24}>
                <div style={{float:"right"}}>
                  <Button type="primary" htmlType="submit">
                    查询
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
            data={{list:alcPickupStockItem}}
            columns={alcNtcDtlCols}
            onSelectRow={this.handleRowSelectChange}
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
