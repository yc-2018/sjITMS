/*
 * @Author: guankongjin
 * @Date: 2022-03-10 09:59:43
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-28 14:36:08
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineShipAddress.js
 */
import { connect } from 'dva';
import { Modal, Button, Input, message, Form, Row, Col, Select, TreeSelect } from 'antd';
import OperateCol from '@/pages/Component/Form/OperateCol';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import {
  deleteLineStoreAddressById,
  findLineByNameLike,
  addToNewLine,
  findChildLine,
  updateStoreNum,
  inScheduleStore
} from '@/services/sjtms/LineSystemHis';
import {
  updateStoreAddressList
} from '@/services/sjtms/LineSystemHis';
import { dynamicqueryById, dynamicDelete, dynamicQuery } from '@/services/quick/Quick';
import { commonLocale } from '@/utils/CommonLocale';
import TableTransfer from './TableTransfer';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import LineShipAddressPlan from "./LineShipAddressPlan";
import AlcNumModal from '@/pages/Wcs/Dps/Job/AlcNumModal';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class LineShipAddress extends QuickFormSearchPage {
  state = {
    ...this.state,
    canDragTable: true,
    noActionCol: false,
    unShowRow: false,
    isNotHd: true,
    modalVisible: false,
    modalTitle: '',
    modalQuickuuid: '',
    transferColumnsTitle: '',
    transferDataSource: [],
    targetKeys: [],
    buttonDisable: false,
    lineModalVisible: false,
    lineData: [],
    lineValue: undefined,
    isModalVisible:false
  };
  constructor(props) {
    super(props);
  }

  getLineShipAddress = () => {
    return this.state.data;
  };

  drawcell = event => {
    if (event.column.fieldName == 'ORDERNUM') {
      const component = (
        <Input
          defaultValue={event.val}
          value={event.val}
          style={{ width: 80, textAlign: 'center' }}
          onChange={event => {}}
        />
      );
      event.component = component;
    }
    
    if(event.column.fieldName == 'TYPE'){
      const component = (
        <a onClick={()=>this.fetchOperateSheculeStore(event.record)}>
             {"移入待定池"}
        </a>
      );
      event.component = component;
    }
  };

  exSearchFilter = async() => {
    // debugger
    let e =  await findChildLine ({"uuid":this.props.lineuuid});
    let parmas = []
      if(e && e.success){
        updateStoreNum({"lineUuid":this.props.lineuuid});
        const uuids = e.data.map(d=>{
          return d.uuid;
        }).join("||");
        parmas = [{
            field: 'LINEUUID',
            type: 'VarChar',
            rule: 'in',
            val: uuids,
          },{
            field: 'DELFLAG',
            type: 'VarChar',
            rule: 'eq',
            val: '1',
          }]
        }
        
        return parmas;  
    
  };
  onSearch = async filter => {
    let exSearchFilter = await this.exSearchFilter();
    if (!exSearchFilter) exSearchFilter = [];

    let defaultSearch = this.defaultSearch();
    if (!defaultSearch) defaultSearch = [];
    if (typeof filter == 'undefined') {
      let queryParams = this.state.pageFilters.superQuery?.queryParams?.filter(item => {
        return (
          item.field != 'dispatchCenterUuid' &&
          item.field != 'dcUuid' &&
          item.field != 'companyuuid'
        );
      });
      let pageFilters = this.state.pageFilters;
      if (this.state.pageFilters.superQuery && exSearchFilter.length == 0) {
        pageFilters = {
          ...this.state.pageFilters,
          superQuery: {
            ...this.state.pageFilters.superQuery,
            queryParams: [...queryParams, ...this.state.isOrgQuery],
          },
        };
        this.getData(pageFilters);
      } else {
        this.state.pageFilters = {
          order: this.state.defaultSort,
          quickuuid: this.props.quickuuid,
          superQuery: {
            matchType: '',
            queryParams: [...this.state.isOrgQuery, ...exSearchFilter, ...defaultSearch],
          },
        }; //增加组织 公司id查询条件
        this.getData(this.state.pageFilters);
      }
    } else if (filter == 'reset') {
      //点击重置时，重置搜索条件
      this.state.pageFilters = {
        order: this.state.defaultSort,
        quickuuid: this.props.quickuuid,
        superQuery: {
          matchType: '',
          queryParams: [...this.state.isOrgQuery, ...exSearchFilter, ...defaultSearch],
        },
      }; //增加组织 公司id查询条件
      this.getData(this.state.pageFilters);
    } else {
      const { dispatch } = this.props;
      const { columns } = this.state;
      const pageFilters = {
        ...this.state.pageFilters,
        superQuery: {
          matchType: '',
          queryParams: [...filter.queryParams, ...this.state.isOrgQuery, ...exSearchFilter],
        },
      };
      this.state.pageFilters = pageFilters;
      this.refreshTable();
    }
  };
  drawExColumns =(e)=>{
    // const c = {
    //   title: '移入待定池',
    //   //dataIndex: '移入待定池',
    //   //key: '移入待定池',
    //   sorter: true,
    //   width: colWidth.codeColWidth,
    //   render: (val, record) => {
    //     return (
    //       <a onClick={()=>this.fetchOperateSheculeStore(record)}>
    //         {"移入待定池"}
    //       </a>
    //     );
    //   },
    // };
    // return c;
    
      
    
  }
  //列删除操作
  renderOperateCol = record => {
    return <>
    <OperateCol menus={this.fetchOperatePropsCommon(record)} />
    </>
    
  };
  fetchOperatePropsCommon = record => {
    return [
      {
        name: '移除',
        onClick: () => {
          Modal.confirm({
            title: '是否移除' + record.ADDRESSNAME + '门店?',
            onOk: () => {
              this.handleDelete(record.UUID);
            },
          });
        },
      },
    ];
  };
  fetchOperateSheculeStore = record => {
    console.log(record);
          Modal.confirm({
            title:  record.ADDRESSNAME + '是否移入待定池?',
            onOk: () => {
              this.inScheduleStore(record.UUID);
            },
          });
  };
  //删除执行
  handleDelete = async shipAddressUuid => {
    const { pageFilters } = this.state;
    await deleteLineStoreAddressById(shipAddressUuid).then(result => {
      if (result.success) {
        message.success('删除成功！');
        this.getData(pageFilters);
      } else {
        // message.error('删除失败，请刷新后再操作');
      }
    });
  };
   //添加待排门店池
   inScheduleStore = async shipAddressUuid => {
    const { pageFilters } = this.state;
    await inScheduleStore(shipAddressUuid).then(result => {
      if (result.success) {
        message.success('操作成功');
        this.getData(pageFilters);
      } 
    });
  };

  //添加门店
  handleAddStore = () => {
    this.setState({
      modalVisible: true,
      modalTitle: '添加门店',
      modalQuickuuid: 'sj_itms_ship_not_store',
      transferColumnsTitle: '门店',
    });
  };
  //添加供应商
  handleAddVendor = () => {
    this.setState({
      modalVisible: true,
      modalTitle: '添加供应商',
      modalQuickuuid: 'sj_itms_vendor',
      transferColumnsTitle: '供应商',
    });
  };
  //保存
  handleStoreSave = () => {
    const { targetKeys, transferDataSource, data } = this.state;
    const { lineuuid, linecode } = this.props;
    const saveData = transferDataSource
      .filter(
        x =>
          targetKeys.indexOf(x.UUID) != -1 &&
          (data.list ? data.list.findIndex(d => d.ADDRESSUUID == x.UUID) == -1 : true)
      )
      .map((address, index) => {
        const orderNum = this.state.data.pagination.total + index + 1;
        return {
          LINEUUID: lineuuid,
          LINECODE: linecode + '-' + orderNum.toString().padStart(3, '0'),
          ADDRESSUUID: address.UUID,
          ADDRESSCODE: address.CODE,
          ADDRESSNAME: address.NAME,
          LONGITUDE: address.LONGITUDE,
          LATITUDE: address.LATITUDE,
          TYPE: address.TYPE,
          ORDERNUM: orderNum,
          COMPANYUUID: loginCompany().uuid,
          DISPATCHCENTERUUID: loginOrg().uuid,
        };
      });
    if (saveData.length > 0) {
      this.saveFormData2(saveData);
    } else {
      this.setState({ modalVisible: false });
    }
  };
  saveFormData =async saveData => {
    const { pageFilters } = this.state;
    await  updateStoreAddressList({addressList:saveData}).then(e=>{
      if(e && e.success){
        message.success("修改成功");
          this.setState({ modalVisible: false });
          this.getData(pageFilters);
      }
    })
   
   
  };
  saveFormData2 = (saveData)=>{
    const { pageFilters } = this.state;
     const param = {
      code: 'sj_itms_line_shipaddress',
      entity: { SJ_ITMS_LINE_SHIPADDRESS: saveData },
    };
    this.props.dispatch({
      type: 'quick/saveFormData',
      payload: { param },
      callback: response => {
        if (response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({ modalVisible: false });
          this.getData(pageFilters);
        }
      },
    });
  }
  onTransferChange = targetKeys => {
    this.setState({ targetKeys });
  };
  onTranferFetch = dataSource => {
    this.setState({ transferDataSource: dataSource });
  };
  handleOk = ()=>{

  }
  handleCancel = ()=>{
      this.setState({isModalVisible:false})
  }
  ofterClosePlan =()=>{
    this.onSearch();
  }
  drawActionButton =  () => {
// const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props;
    const {
      modalVisible,
      modalTitle,
      modalQuickuuid,
      transferColumnsTitle,
      targetKeys,
      lineModalVisible,
      lineData,
    } = this.state;
   
    const options = lineData.map(a => {
      return <Select.Option key={a.uuid}>{a.name}</Select.Option>;
    });
    return (
      <div>
         <Modal
          visible={this.state.isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'80%'}
          bodyStyle={{ height: 'calc(70vh)', overflowY: 'auto' }}
          destroyOnClose= {true}
          afterClose = {this.ofterClosePlan}
          footer = {null}
        >
          {/* <CostBillDtlSeacrhPage key={e.UUID} params={e} /> */}
          <LineShipAddressPlan
            //key={e.UUID}
            //showPageNow="query"
            quickuuid="sj_itms_line_shipAddress_plan"
           // location={{ pathname: '1' }}
           lineuuid = {this.props.lineuuid}
           //pageFilters={{queryParams :[{field:"systemuuid", type:"VarChar", rule:"eq", val:"000000750000004"}]}}
           />
        </Modal>
        <Modal
          title={modalTitle}
          width={1290}
          visible={modalVisible}
          onOk={this.handleStoreSave}
          confirmLoading={false}
          onCancel={() => this.setState({ modalVisible: false })}
          destroyOnClose
        >
          <TableTransfer
            targetKeys={targetKeys}
            columnsTitle={transferColumnsTitle}
            onChange={this.onTransferChange}
            handleFetch={this.onTranferFetch}
            quickuuid={modalQuickuuid}
          />
        </Modal>
        <Modal
          title={modalTitle}
          width={800}
          visible={lineModalVisible}
          onOk={this.handleAddToNewLine}
          confirmLoading={false}
          onCancel={() => this.setState({ lineModalVisible: false })}
          destroyOnClose
        >
          <Form ref="xlref">
            <Row>
              <Col>
                <Form.Item label="线路">
                  {/* <Select
        showSearch
        value={this.state.lineValue}
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={this.handleChange}
        notFoundContent={null}
      >
        {options}
      </Select> */}
                  <TreeSelect
                    allowClear={true}
                    optionFilterProp="children"
                    treeData={this.props.lineTreeData}
                    labelInValue={true}
                    // 将value进行了一层包装，以方便日后扩展
                    value={this.state.lineValue}
                    onChange={this.handleChange}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
        <Button type="primary" icon="plus" onClick={()=>this.setState({isModalVisible:true})}>
          待排门店
        </Button>
        <Button type="primary" icon="plus" onClick={this.handleAddStore}>
          添加门店
        </Button>
        {/* <Button type="primary" icon="plus" onClick={this.handleAddVendor}>
          添加供应商
        </Button> */}
        <Button onClick={() => this.lineCreatePageModalRef.show()}>添加子路线</Button>
        <CreatePageModal
          modal={{
            title: '添加子路线',
            width: 500,
            bodyStyle: { marginRight: '40px' },
            afterClose: this.props.showadfa,
          }}
          page={{ quickuuid: 'sj_itms_create_lines', noCategory: true }}
          onRef={node => (this.lineCreatePageModalRef = node)}
        />
      </div>
    );
  };

  handleSearch = async value => {
    if (value) {
      await findLineByNameLike(value).then(result => {
        if (result && result.data) {
          this.setState({ lineData: result.data });
        } else {
          this.setState({});
        }
      });
    }
  };
  handleChange = e => {
    this.setState({ lineValue: e });
  };
  handleAddToNewLine = async () => {
    const { selectedRows, lineValue } = this.state;

    let params = {
      lineuuid: lineValue.value,
      addressIds: selectedRows.map(e => e.UUID),
    };
    await addToNewLine(params).then(result => {
      if (result.success) {
        message.success('添加成功');
      } else {
        // message.error('添加失败');
      }
      this.setState({
        lineValue: undefined,
        lineData: [],
        selectedRows: [],
        lineModalVisible: false,
      });
    });
  };
  drawToolbarPanel = () => {
    const { buttonDisable } = this.state;
    return (
      <div style={{ marginBottom: 15 }}>
        {buttonDisable ? <Button onClick={this.tableSortSave}>排序并保存</Button> : <></>}
        {/* <Button onClick={this.addToNewLine}>添加到新线路</Button> */}
      </div>
    );
  };

  //拖拽排序
  drapTableChange = list => {
    const { data } = this.state;
    data.list = list.map((record, index) => {
      record.ORDERNUM = index + 1;
      let linecode = record.LINECODE;
      linecode = linecode.substr(0,linecode.lastIndexOf("-"));
      linecode = linecode+"-"+ this.addZero(record.ORDERNUM );
      record.LINECODE  = linecode;
      return record;
    });
     
    this.setState({ buttonDisable: true });
    //this.saveFormData(data.list);
  };
  addZero =(num)=>{
    if(num < 10){
      return '00'+num;
    }else if(num < 100){
      return '0'+num;
    }else if (num <1000){
      return num;
    }
  }
  tableSortSave = () => {
    const { data } = this.state;
    this.saveFormData(data.list);
  };

  addToNewLine = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length > 0) {
      this.setState({ lineModalVisible: true, modalTitle: '添加到新的线路' });
    } else {
      message.warn('至少选择一条记录');
    }
  };
}
