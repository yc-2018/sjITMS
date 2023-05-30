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
import { modify, query, getFeeType, saveOrUpdateFee,deleteFee } from '@/services/sjtms/OtherFeeService';
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
        confirmModal: false,
        confirmMessage: '',
      },

      defaultFeeType: '',
      feeTypeData: [],
      defaultActiveKey: '1',
      feeUuid: null,
    };
  }
  componentWillMount() {
    this.refresh();
  }
  componentWillReceiveProps(nextProps) {
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
  }

  refresh = async value => {
    const pageFilter = value ? value : this.state.pageFilter;
    await query(pageFilter).then(response => {
      const payload = {
        list: response.data?.records ? response.data?.records : [],
        pagination: {
          total: response.data?.paging.recordCount,
          pageSize: response.data?.paging.pageSize,
          current: response.data?.page + 1,
          showTotal: total => `共 ${total} 条`,
        },
      };
      this.setState({ data: payload });
    });
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

  handleSave = async confirm => {
    const { amount, feeType, feeName, feeUuid, scheduleBillTmsUuid,billcount } = this.state;
    const params = {
      uuid: feeUuid,
      amount: amount,
      feetype: feeType,
      feename: feeName,
      billuuid: scheduleBillTmsUuid,
      companyuuid: loginCompany().uuid,
      dispatchcenteruuid: loginOrg().uuid,
      confirm: confirm,
      billcount:billcount
    };
    this.save(params);
  };

  save = async params => {
    const response = await saveOrUpdateFee(params);
    if (response && response.data > 0) {
      message.success('保存成功');
      this.callback(1);
    } else if (response && response.data?.indexOf('确认保存') > 0) {
      this.setState({ confirmModal: true, confirmMessage: response.data });
    } 
    
  };

  modify = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 1) {
      console.log('selectedRows', selectedRows);
      this.setState({
        defaultActiveKey: '2',
        feeType: selectedRows[0].feetype,
        feeName: selectedRows[0].feename,
        amount: selectedRows[0].amount,
        billcount:selectedRows[0].billcount,
        isView: false,
        feeUuid: selectedRows[0].uuid,
      });
      this.getFeeType();
      //this.callback(2);
    } else {
      message.info('请选取一条记录');
    }
  };
  delete = async()=>{
    Modal.confirm({
      title:"确定删除吗?",
      onOk:async ()=>{
        const { selectedRows } = this.state;
        const response = await deleteFee(selectedRows);
        if(response && response.success){
          message.success("删除成功")
          this.refresh();
        }else{
          message.error(response.message)
        }
      }
    })
   
  }
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
      dataIndex: 'feename',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : 0),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : 0),
    },
    {
      title: '票据数量',
      dataIndex: 'billcount',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : 0),
    },
  ];
  render() {
    console.log("asda",this.state);
    const { getFieldDecorator } = this.props.form;
    const { selectedRows, visible, data, isView, confirmModal, confirmMessage } = this.state;

    return (
      <div>
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
              <><Button type="primary" onClick={() => this.modify()}>
                编辑
              </Button>
              <Button  type="danger" style={{marginLeft:3}} onClick={() => this.delete()}>
                删除
            </Button></>
            ) : (
              <Button type="primary" onClick={() => this.handleSave(false)}>
                保存
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
                <Form wrapperCol={{ span: 16 }} labelCol={{ span: 8 }}>
                  <Col span={6}>
                    <Form.Item label={'费用类型'}>
                      {getFieldDecorator('feeType', {
                        initialValue: this.state.feeType,
                        rules: [{ required: true, message: '请选项费用类型' }],
                      })(
                        <SimpleSelect
                          style={{ width: 120 }}
                          onSelect={(value, key) => {
                            this.setState({ feeType: value, feeName: key.props.label });
                          }}
                          dictCode={'FeeType'}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label={'金额'}>
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
                  <Col span={6}>
                    <Form.Item label={'票据数量'}>
                      {getFieldDecorator('billcount', {
                        initialValue: this.state.billcount,
                        rules: [{ required: true, message: '请填写票据数量' }],
                      })(
                        <Input
                          name="billcount"
                          style={{ width: 120, float: 'left' }}
                          onBlur={e => {
                            this.setState({ billcount: e.target.value });
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
        <Modal
          title="提示"
          visible={confirmModal}
          onCancel={() => {
            this.setState({ confirmModal: false });
          }}
          onOk={() => {
            this.handleSave(true);
            this.setState({ confirmModal: false });
          }}
        >
          <p style={{ fontSize: '15px', color: 'red' }}>{confirmMessage}</p>
        </Modal>
      </div>
    );
  }
}
