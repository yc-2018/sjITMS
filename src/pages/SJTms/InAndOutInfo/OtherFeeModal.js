import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { commonLocale } from '@/utils/CommonLocale';
import StandardTable from '@/components/StandardTable';
import { colWidth } from '@/utils/ColWidth';
import {
  Modal,
  InputNumber,
  Button,
  message,
  Tabs,
  Row,
  Col,
  Form,
  Select,
  Icon,
  Input,
} from 'antd';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import Empty from '@/pages/Component/Form/Empty';
import { accAdd } from '@/utils/QpcStrUtil';
import { modify, query, getFeeType, saveOrUpdateFee } from '@/services/sjtms/OtherFeeService';
import { dispatchReturnLocale } from './DispatchReturnLocale';
import { alterBinType } from '@/services/facility/Bin';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
const { TabPane } = Tabs;
const { Option } = Select;
// @connect(({ dispatchReturn, loading }) => ({
//   dispatchReturn,
//   loading: loading.models.dispatchReturn,
// }))
@Form.create()
export default class OtherFeeModal extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef;
    this.state = {
      visible: props.visible,
      scheduleBillTmsUuid: props.shipBillTmsUuid,
      scheduleBillNumber: props.scheduleBillNumber,
      data: {}, //props.dispatchReturn.dataForStore,
      selectedRows: [],
      isView: true,
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {},
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dispatchCenterUuid: loginOrg().uuid,
          scheduleBillNumber: props.scheduleBillNumber,
        },
        likeKeyValues: {},
      },

      defaultFeeType: '',
      feeTypeData: [],
      defaultActiveKey: '1',
      feeUuid: null,
    };
  }
  componentWillMount() {
    //if(this.state.storeUuid){
    this.refresh();
    // }
  }
  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps', nextProps, this.props);
    if (nextProps.scheduleBillNumber != this.props.scheduleBillNumber) {
      this.state.pageFilter.searchKeyValues.scheduleBillNumber = nextProps.scheduleBillNumber;
      this.setState(
        {
          scheduleBillTmsUuid: nextProps.shipBillTmsUuid,
          scheduleBillNumber: nextProps.scheduleBillNumber,
          pageFilter: this.state.pageFilter,
        },
        () => {
          this.refresh(this.state.pageFilter);
        }
      );
    }
    if (nextProps.visible != this.props.visible) {
      this.refresh();
      this.setState({
        visible: nextProps.visible,
      });
    }

    // if(nextProps.dispatchReturn.dataForStore&&nextProps.dispatchReturn.dataForStore!=this.props.dispatchReturn.dataForStore){
    //   this.setState({
    //     data:nextProps.dispatchReturn.dataForStore
    //   })
    // }
  }

  refresh = async value => {
    console.log('refresh', value, this.state.pageFilter);
    const pageFilter = value ? value : this.state.pageFilter;
    await query(pageFilter).then(response => {
      const payload = {
        list: response.data.records ? response.data.records : [],
        pagination: {
          total: response.data.paging.recordCount,
          pageSize: response.data.paging.pageSize,
          current: response.data.page + 1,
          showTotal: total => `共 ${total} 条`,
        },
      };
      this.setState({ data: payload });
    });
    // this.props.dispatch({
    //   type: 'dispatchReturn/queryByStore',
    //   payload: pageFilter?pageFilter:this.state.pageFilter,
    // })
  };

  getFeeType = async () => {
    const params = {
      companyUuid: loginCompany().uuid,
      dispatchCenterUuid: loginOrg().uuid,
    };
    await getFeeType(params).then(result => {
      this.setState({ feeTypeData: result.data });
    });
  };
  /**
   * 获取选中行
   *  */
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleOk = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warning('请先选择行');
      return;
    }
    selectedRows.forEach(row => {
      row.feeType = dispatchReturnLocale.stopCarFee;
      row.feeName = dispatchReturnLocale.stopCarFee;
    });

    this.props.dispatch({
      type: 'dispatchReturn/onConfirmByStore',
      payload: selectedRows,
      callback: response => {
        if (response && response.success) {
          this.setState({
            selectedRows: [],
          });
          this.refresh();
          message.success(commonLocale.saveSuccessLocale);
        }
      },
    });
  };
  handleCancel = () => {
    this.props.handleModal();
  };

  handleStandardTableChange = () => {
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

    if (this.refresh) this.refresh(pageFilter);
  };

  handleFieldChange = (e, fieldName, line) => {
    const { data } = this.state;
    let target = data.list[line - 1];
    target.amount = e;
    this.setState({
      data: data,
    });
  };

  callback = key => {
    console.log('key', key);
    if (key == 1) {
      this.setState({ isView: true, defaultActiveKey: '1' });
      this.refresh();
      return;
    } else if (key == 2) {
      this.getFeeType();
      this.setState({
        isView: false,
        defaultActiveKey: '2',
        amount: '',
        feeType: '',
        feeUuid: null,
      });
    }
  };

  save = async () => {
    const { amount, feeType, feeUuid, scheduleBillTmsUuid } = this.state;
    const params = {
      uuid: feeUuid,
      amount: amount,
      feetype: feeType,
      billuuid: scheduleBillTmsUuid,
      companyuuid: loginCompany().uuid,
      dispatchcenteruuid: loginOrg().uuid,
    };
    console.log('parms', params);
    await saveOrUpdateFee(params).then(result => {
      if (result && result.data > 0) {
        message.success('保存成功');
        this.setState({ amount: '', feeType: '' });
      } else {
        message.error('保存失败');
      }
    });
  };
  modify = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 1) {
      this.setState({
        defaultActiveKey: '2',
        feeType: selectedRows[0].feetype,
        amount: selectedRows[0].amount,
        isView: false,
        feeUuid: selectedRows[0].uuid,
      });
      this.getFeeType();
      //this.callback(2);
    } else {
      message.info('请选取一条记录');
    }
  };

  columns = [
    {
      title: '排车单号',
      dataIndex: 'billnumber',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : <Empty />),
    },
    {
      title: '车辆',
      dataIndex: 'vehicletypename',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : <Empty />),
    },
    {
      title: '司机',
      dataIndex: 'carriername',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : <Empty />),
    },
    {
      title: '费用类型',
      dataIndex: 'feetype',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : 0),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : 0),
    },
    // {
    //   title: '是否审核',
    //   dataIndex: 'checked',
    //   width: colWidth.billNumberColWidth + 50,
    //   render: val => (val ? '是' : '否'),
    // },
  ];
  render() {
    console.log('render', this.state);
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    const { selectedRows, visible, data, isView } = this.state;
    let totalAmountSelect = 0;
    let totalAmountAll = 0;
    // selectedRows.forEach(row=>{
    //   totalAmountSelect = accAdd(row.amount,totalAmountSelect);
    // });
    // data.list.forEach(item=>{
    //   totalAmountAll = accAdd(item.amount,totalAmountAll);
    // })

    return (
      <Modal
        title={'其他费用'}
        visible={visible}
        destroyOnClose={true}
        onCancel={() => this.handleCancel()}
        footer={[]}
        okText={commonLocale.confirmLocale}
        cancelText={commonLocale.cancelLocale}
        width={'70%'}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {isView ? (
            <Button type="primary" onClick={() => this.modify()}>
              {'编辑'}
            </Button>
          ) : (
            <Button type="primary" onClick={() => this.save()}>
              {'保存'}
            </Button>
          )}
        </div>
        <Tabs activeKey={this.state.defaultActiveKey} onChange={this.callback}>
          <TabPane tab="费用信息" key="1">
            <StandardTable
              rowKey={record => record.uuid}
              selectedRows={selectedRows}
              unShowRow={false}
              loading={this.props.loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </TabPane>
          <TabPane tab="费用录入" key="2">
            <Row>
              <Form>
                <Col span={6}>
                  <Form.Item label={'费用类型'} labelCol={{ span: 8 }}>
                    {getFieldDecorator('feeType', {
                      initialValue: this.state.feeType,
                      rules: [{ required: true, message: '请选项费用类型' }],
                    })(
                      <SimpleSelect style={{ width: 120 }}  onBlur={e => {this.setState({feeType:e})}} dictCode={'FeeType'}>

                      </SimpleSelect>
                      // <Select
                      //   style={{ width: 120 }}
                      //   onBlur={e => {
                      //     this.setState({ feeType: e });
                      //   }}
                      // >
                      //   {this.state.feeTypeData?.map(e => {
                      //     return <Option value={e.name}>{e.name}</Option>;
                      //   })}
                      // </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={'金额'} labelCol={{ span: 12 }}>
                    {getFieldDecorator('amount', {
                      initialValue: this.state.amount,
                      rules: [{ required: true, message: '请填写金额' }],
                    })(
                      <Input
                        name="amount"
                        style={{ width: 120, float: 'left' }}
                        onBlur={e => {
                          this.setState({ amount: e.target.value });
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Form>
            </Row>
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
