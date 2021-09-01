import { PureComponent } from "react";
import { Modal, Form, message, Col, Row, Input, Button, Select } from "antd";
import { connect } from "dva";
import { commonLocale, placeholderLocale } from "@/utils/CommonLocale";
import { vehicleDispatchingLocale } from "@/pages/Tms/VehicleDispatching/VehicleDispatchingLocale";
import { convertCodeName } from "@/utils/utils";
import StandardTable from "@/components/StandardTable";
import Empty from '@/pages/Component/Form/Empty';
import { OrderStat } from "@/pages/Tms/VehicleDispatching/VehicleDispatchingContants";
import DriverSearchForm from './DriverSearchForm';
import { WorkType } from '@/pages/Account/User/WorkTypeConstants';
import styles from '../../Out/Wave/ItemBatchAddModal.less';

const Option = Select.Option;

const driverOptions = [];
driverOptions.push(<Option key="all" value='' > 全部 </Option>);
Object.keys(WorkType).forEach(function (key) {
  driverOptions.push(<Option key={WorkType[key].name} value={WorkType[key].name}>{WorkType[key].caption}</Option>);
});

@connect(({ dispatchCenterShipPlanBill, loading }) => ({
  dispatchCenterShipPlanBill,
  loading: loading.models.dispatchCenterShipPlanBill,
}))
@Form.create()
export default class DriverSearchModal extends PureComponent{

  constructor(props){
    super(props);
    this.state = {
      visible:props.visible,
      selectedRows: [],
      filter:{
        memberCodeName:'',
        memberType:''
      },
      data:{
        list:[],
        pagination: {}
      }
    }
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

  refresh = (record)=>{
    this.props.dispatch({
      type:'dispatchCenterShipPlanBill/getByMember',
      payload: {
        memberCodeName: record && record.memberCodeName ? record.memberCodeName:'',
        memberType: record && record.memberType?record.memberType:'',
      },
      callback:response=>{
        if(response&&response.success){
          let dataList = [];
          if(response.data){
            dataList = response.data;
            for(let i = 0;i<dataList.length;i++){
              dataList[i].line = i+1;
            }
          }
          this.state.data.list = dataList;
          this.setState({
            data :{...this.state.data}
          })
        }
      }
    })
  }

  onCancel = ()=>{
    this.setState({
      selectedRows:[],
      data:{list:[]}
    });
    this.props.form.resetFields();
    this.props.onCancel(false)
  }
  onOk = ()=>{
    const { selectedRows } = this.state;
    if(selectedRows.length==0){
      message.warning('请先选择行');
      return;
    }
    let list = [];
    selectedRows.forEach(row=>{
      list.push(row.member.code)
    });
    this.props.onAddToDriverForm(list);
    this.setState({
      selectedRows:[]
    })
  }

  /**重置搜索条件 */
  reset = () => {
    this.setState({
      fieldsValue:{},
      selectedRowKeys: [],
    })
    this.props.form.resetFields();
    this.refresh();
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

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  onClickedRow = (record)=>{
    this.props.onCreate(record);
  };

  handleSearch=(e)=>{
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      const payload = {
        memberCodeName: '',
        memberType: '',
      }
      if (fieldsValue.memberCodeName) {
        payload.memberCodeName = fieldsValue.memberCodeName
      }

      if (fieldsValue.memberType) {
        payload.memberType = fieldsValue.memberType
      }

      this.refresh({...payload});
    });
  }

  columns = [
    {
      title:'序号',
      dataIndex:'line',
      width:50
    },
    {
      title:'代码',
      dataIndex:'member.code',
      width:100,
      render:val=>val?val:<Empty/>
    },
    {
      title:'名称',
      dataIndex:'member.name',
      width:120,
      render:val=>val?val:<Empty/>
    },
    {
      title:'已排车辆',
      dataIndex:'scheduleVehicle',
      width:150,
      render: val => {
        let data = '';
        if(val && val.length>0){
          data = val.toString()
          return <span>{data}</span>
        } else {
          return <Empty/>
        }

      }
    },
    {
      title:'手机号',
      dataIndex:'phone',
      width:100,
      render:val=>val?val:<Empty/>
    },
    {
      title:'职能',
      width:200,
      dataIndex:'memberType',
      render: val => {
        let data = '';
        let list = [];
        if(val && val.length>0){
          for(let i =0;i<val.length;i++){
            list.push(WorkType[val[i]].caption)
          }
        data = list.toString();
        return <span>{data}</span>
      } else {
      return <Empty/>
    }

}
    }
  ];

  render(){
    const { visible,data,selectedRows, filterValue } = this.state;
    const { loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return <div>
      <Modal
        visible = {visible}
        title = '司机查询'
        width='80%'
        onCancel = {this.onCancel}
        onOk = {this.onOk}
      >
        <div className={styles.formItems}>
          <Form onSubmit={this.handleSearch}>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={8} sm={24}>
                <Form.Item key="memberCodeName" label={'代码/名称'}>
                  {
                    getFieldDecorator('memberCodeName', {
                      initialValue: filterValue && filterValue.memberCodeName ? filterValue.memberCodeName : ''
                    })(
                      <Input placeholder={placeholderLocale('代码/名称')} />
                    )}
                </Form.Item>
              </Col>
              <Col md={8} sm={24}>
                <Form.Item key="memberType" label={'职能'}>
                  {
                    getFieldDecorator('memberType', {
                      initialValue: filterValue && filterValue.memberType ? filterValue.memberType : ''
                    })(
                      <Select>
                        {driverOptions}
                      </Select>
                    )}
                </Form.Item>
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
          rowSelectionWidth={10}
          newScroll={{
            x:'-',
            y:400
          }}
          rowKey={record => record.uuid}
          selectedRows={selectedRows}
          fixed={true}
          loading={loading}
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
