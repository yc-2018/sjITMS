import { connect } from 'dva';
import { PureComponent } from "react";
import moment from 'moment';
import { Modal, Form, Input, Button, Col, Row, Table, Select, Drawer, DatePicker } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { confirmLocale, cancelLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import StandardTable from '@/components/StandardTable';
import Empty from '@/pages/Component/Form/Empty';

@Form.create()
@connect(({ stock, decincConfig, loading }) => ({
  stock,
  decincConfig,
  loading: loading.models.stock,
}))
export default class ItemBatchAddModal extends PureComponent {
  state = {
    stockList: [],
    fieldsValue: {},
    selectedRows: [],
    itemList: [],
    binUsages: [],
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'decincConfig/query',
      payload: {
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          configType: "DEC",
        },
        page: 0,
        pageSize: 100
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stock && nextProps.stock.stocks != this.props.stock.stocks) {
      this.setState({
        stockList: nextProps.stock.stocks,
      })
    }
    if (nextProps.decincConfig.data) {
      this.setState({
        binUsages: nextProps.decincConfig.data.list.map(item => { return item.binUsage })
      })
    }
  }

  /**添加 */
  handleOk = () => {
    this.handlebatchAddVisible();
    this.props.getItemList(this.state.selectedRows);
  }
  /**
   * 条件查询
   */
  handleSearch = (e) => {
    e.preventDefault();
    const { form, dispatch, wrhUuid, ownerUuid } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!wrhUuid || !ownerUuid || this.state.binUsages.length === 0) {
        return;
      }
      const payload = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        wrhUuid: wrhUuid,
        ownerUuid: ownerUuid,
        binUsages: this.state.binUsages,
        state: 'NORMAL',
        articleCodeOrNameLike: fieldsValue.articleCodeOrNameLike
      }
      if (fieldsValue.binCodes) {
        payload.binCodes = fieldsValue.binCodes.split(',');
      }
      if (fieldsValue.containerBarcodes) {
        payload.containerBarcodes = fieldsValue.containerBarcodes.split(',');
      }
      this.props.dispatch({
        type: 'stock/query',
        payload: { ...payload }
      });
    });
  }

  /**重置搜索条件 */
  reset = () => {
    this.setState({
      fieldsValue: {},
      selectedRows: [],
    })
    this.props.form.resetFields();
  }

  /**
   * 控制弹出框展示
   */
  handlebatchAddVisible = () => {
    this.setState({
      stockList: [],
      selectedRows: [],
    });
    this.props.form.resetFields();
    this.props.handlebatchAddVisible();
  }

  /**
   * 获取选中行
   */
  handleRowSelectChange = (rows, keys) => {
    this.setState({
      selectedRows: rows,
    })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectedRows, fieldsValue, stockList, waveList, deliveryCycleList } = this.state
    let cols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth,
        render: (val) => <EllipsisCol colValue={`[${val.articleCode}]${val.articleName}`} />
      },
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        dataIndex: 'binCode',
        width: colWidth.codeColWidth
      },
      {
        title: commonLocale.inBinUsageLocale,
        dataIndex: 'binUsage',
        key: 'binUsage',
        width: colWidth.enumColWidth,
        render: text => text ? getUsageCaption(text) : <Empty />
      },
      {
        title: commonLocale.containerLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: itemColWidth.containerEditColWidth,
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        dataIndex: 'vendor',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />,
        width: colWidth.codeNameColWidth,
      },
      {
        title: commonLocale.productionBatchLocale,
        key: 'productionBatch',
        dataIndex: 'productionBatch',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productionDate',
        width: colWidth.dateColWidth,
        dataIndex: 'productionDate',
        render: val => {
          return (
            <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: colWidth.dateColWidth,
        render: record => {
          return (
            <span>{record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: '规格',
        key: 'qpcStr',
        dataIndex: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        dataIndex: 'qty',
        width: itemColWidth.qtyColWidth,
      }
    ];

    const rowSelection = {
      selectedRows,
      onChange: this.handleRowSelectChange,
    };

    return (
      <Drawer
        title="批量添加"
        placement="right"
        closable={false}
        onClose={this.handlebatchAddVisible}
        visible={this.props.visible}
        width='72%'
      >
        <div>
          <Form onSubmit={this.handleSearch} layout="inline">
            <Form.Item key="articleCodeOrNameLike" label={commonLocale.inArticleLocale}>
              {
                getFieldDecorator('articleCodeOrNameLike', {
                  initialValue: fieldsValue.articleCodeOrNameLike
                })(
                  <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
                )}
            </Form.Item>
            <Form.Item key="binCodes" label={'货位'}>
              {
                getFieldDecorator('binCodes', {
                  initialValue: fieldsValue.binCodes
                })(
                  <Input placeholder={placeholderLocale('包含的货位代码')} />
                )}
            </Form.Item>
            <Form.Item key="containerBarcodes" label={commonLocale.inContainerBarcodeLocale}>
              {
                getFieldDecorator('containerBarcodes',
                  { initialValue: fieldsValue.containerBarcodes }
                )(
                  <Input placeholder={placeholderLocale('包含的容器条码')} />
                )
              }
            </Form.Item>
            <div style={{ float: "right" }}>
              <Button type="primary" htmlType="submit">
                查询
                  </Button>
              <Button style={{ marginLeft: 12, background: '#516173', color: '#FFFFFF' }} onClick={this.reset}>
                重置
                  </Button>
            </div>
          </Form>
        </div>
        <div>
          <StandardTable
            selectedRows={selectedRows}
            rowKey={record => record.uuid}
            data={{ list: stockList }}
            columns={cols}
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
            padding: '10px 16px',
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