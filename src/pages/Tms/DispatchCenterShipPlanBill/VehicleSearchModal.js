import { PureComponent } from "react";
import { Modal, Form, message, Col, Row, Input, Button, Select } from "antd";
import { connect } from "dva";
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale } from "@/utils/CommonLocale";
import { vehicleDispatchingLocale } from "@/pages/Tms/VehicleDispatching/VehicleDispatchingLocale";
import { convertCodeName } from "@/utils/utils";
import StandardTable from "@/components/StandardTable";
import { OrderStat } from "@/pages/Tms/VehicleDispatching/VehicleDispatchingContants";
import VehicleSearchForm from './VehicleSearchForm';
import Empty from '@/pages/Component/Form/Empty';
import { LogisticMode } from '../../In/Order/OrderContants';
import styles from '../../Out/Wave/ItemBatchAddModal.less';
@connect(({ vehicle, loading }) => ({
  vehicle,
  loading: loading.models.vehicle,
}))
@Form.create()
export default class ReSendModal extends PureComponent{

  constructor(props){
    super(props);
    this.state = {
      visible:props.visible,
      selectedRows: [],
      data:{
        list:[],
        pagination: {}
      },
      pageFilter: {
        likeKeyValues:{},
        page: 0,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {},
      },
    }
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.visible!=undefined&&nextProps.visible!=this.props.visible){
      this.setState({
        visible:nextProps.visible
      },()=>{
        if(nextProps.visible==true){

        }
      });
    }
  }

  refresh = (filter)=>{
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues
    };

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = {
        ...pageFilter,
        ...filter
      };
    }

    dispatch({
      type: 'vehicle/query',
      payload: queryFilter,
      callback:response=>{
        if(response&&response.success){
          let dataList = [];
          if(response.data && response.data.records){
            dataList = response.data.records;
            for(let i = 0;i<dataList.length;i++){
              dataList[i].line = i+1;
            }
          }
          this.state.data.list = dataList;
          this.state.data.pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
            // showTotal: total => `共 ${total} 条`,
          };
          this.setState({
            data :{...this.state.data}
          })
        }
      }
    });
  }

  handleSearch=(e)=>{
    e.preventDefault();
    const { pageFilter } = this.state;
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
      };
      pageFilter.likeKeyValues = {
      }
      if (fieldsValue.codeOrPlate) {
        pageFilter.likeKeyValues = {
          ...pageFilter.likeKeyValues,
          codeOrPlate: fieldsValue.codeOrPlate
        };
        pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          codeOrPlate: fieldsValue.codeOrPlate,
          ...fieldsValue
        }
      }
      this.refresh({...pageFilter});
    });
  }

  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { pageFilter } = this.state;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    pageFilter.searchKeyValues = {
      'companyUuid': loginCompany().uuid,
      // 'dcUuid': loginOrg().uuid,
    };
    const { dispatch } = this.props;
    dispatch({
      type: 'vehicle/query',
      payload: pageFilter,
    });
  };

  onCancel = ()=>{
    this.setState({
      selectedRows:[],
      data:{list:[]}
    });
    this.props.form.resetFields();
    this.props.onCancel(false)
  }

  /**重置搜索条件 */
  reset = () => {
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues = {
      companyUuid: loginCompany().uuid,
    };
    pageFilter.likeKeyValues = {
    }
    this.props.form.resetFields();
    this.refresh({...pageFilter});
  }

  onOk = ()=>{
    const { selectedRows } = this.state;
    if(selectedRows.length==0){
      message.warning('请先选择行');
      return;
    }
    let list = [];
    selectedRows.forEach(row=>{
      list.push(row.plateNumber)
    })
    this.props.onAddToVehicleForm(list);
    this.setState({
      selectedRows:[]
    })
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  onClickedRow = (record)=>{
    this.props.onCreate(record);
  };

  columns = [
    {
      title:'序号',
      dataIndex:'line',
      width:50
    },
    {
      title:'车辆代码',
      dataIndex:'code',
      width:80,
      render:val=>val?val:<Empty/>
    },
    {
      title:'车型',
      dataIndex:'vehicleType',
      width:120,
      render: (text, record) => <span> {convertCodeName(record.vehicleType)} </span>
    },
    {
      title:'车型分类',
      dataIndex:'type',
      width:80,
      render:val=>val?val:<Empty/>
    },
    {
      title:'车牌号',
      dataIndex:'plateNumber',
      width:80,
      render:val=>val?val:<Empty/>
    },
    {
      title:'驾驶员代码',
      width:80,
      render: (text, record) => {
        let list = [];
        let data = [];
        let str = '';
        if(record.employees && record.employees.length>0) {
          list = record.employees;
          for(let i =0;i<list.length;i++){
            if(list[i].workType === 'DRIVER') {
              data.push(list[i].empCode)
            }
          }
          str = data.toString();
          if(str) {
            return <span>{str}</span>
          } else {
            return <Empty/>
          }
        }else {
          return <Empty/>
        }
      }
    },
    {
      title:'驾驶员名称',
      width:110,
      render: (text, record) => {
        let list = [];
        let data = [];
        let str = '';
        if(record.employees && record.employees.length>0) {
          list = record.employees;
          for(let i =0;i<list.length;i++){
            if(list[i].workType === 'DRIVER') {
              data.push(list[i].empName)
            }
          }
          str = data.toString();
          if(str) {
            return <span>{str}</span>
          } else {
            return <Empty/>
          }
        }else {
          return <Empty/>
        }
      }
    },
    {
      title:'配送员代码',
      width:100,
      render: (text, record) => {
        let list = [];
        let data = [];
        let str = '';
        if(record.employees && record.employees.length>0) {
          list = record.employees;
          for(let i =0;i<list.length;i++){
            if(list[i].workType === 'DELIVERYMAN') {
              data.push(list[i].empCode)
            }
          }
          str = data.toString();
          if(str) {
            return <span>{str}</span>
          } else {
            return <Empty/>
          }

        }else {
          return <Empty/>
        }
      }
    },
    {
      title:'配送员名称',
      width:110,
      render: (text, record) => {
        let list = [];
        let data = [];
        let str = '';
        if(record.employees && record.employees.length>0) {
          list = record.employees;
          for(let i =0;i<list.length;i++){
            if(list[i].workType === 'DELIVERYMAN') {
              data.push(list[i].empName)
            }
          }
          str = data.toString();
          if(str) {
            return <span>{str}</span>
          } else {
            return <Empty/>
          }
        }else {
          return <Empty/>
        }
      }
    }
  ];

  render(){
    const { visible,data,selectedRows,filterValue } = this.state
    const { loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return <div>
      <Modal
        visible = {visible}
        title = '车辆查询'
        width='70%'
        onCancel = {this.onCancel}
        onOk = {this.onOk}
      >
        <div className={styles.formItems}>
          <Form onSubmit={this.handleSearch}>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={8} sm={24}>
                <Form.Item key="codeOrPlate" label={'代码/车牌'}>
                  {
                    getFieldDecorator('codeOrPlate', {
                      initialValue: filterValue && filterValue.codeOrPlate ? filterValue.codeOrPlate : ''
                    })(
                      <Input placeholder={placeholderLocale('代码/车牌')} />
                    )}
                </Form.Item>
              </Col>
              <Col md={8} sm={24}>
              </Col>
              <Col md={8} sm={24}>
                <div style={{float:"right"}}>
                  <Button type="primary" htmlType="submit" loading = {loading}>
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
        <StandardTable
          hasOnRow
          dbOnclick
          columns = {this.columns}
          data = {data}
          rowKey={record => record.uuid}
          rowSelectionWidth={10}
          selectedRows={selectedRows}
          fixed={true}
          loading={loading}
          newScroll={{
            x:true,
            y:400
          }}
          size="small"
          defaultPageSize={50}
          onChange={this.handleStandardTableChange}
          onSelectRow={this.handleSelectRows}
          onClickRow={this.onClickedRow}
        />
      </Modal>
    </div>
  }
}
