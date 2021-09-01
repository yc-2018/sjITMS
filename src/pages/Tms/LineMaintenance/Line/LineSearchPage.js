import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, Divider, message, Menu, Dropdown, Tooltip, Icon, Row, Col } from 'antd';
import Empty from '@/pages/Component/Form/Empty';
import { add, accAdd, accMul, accDiv } from '@/utils/QpcStrUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany, getActiveKey } from '@/utils/LoginContext';
import LineSearchForm from './LineSearchForm'
import SearchPage from '../SearchPage';
import LineCreateModal from './LineCreateModal';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';

@connect(({ dispatchSerialArch, loading }) => ({
  dispatchSerialArch,
  loading: loading.models.dispatchSerialArch,
}))
@Form.create()
export default class LineSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '线路',
      key:'dispatchSerialArch.search.table',
      data:{
        list:[]
      },
      selectedRows: [],
      suspendLoading: false,
      noPagination: true,
      createModalVisible:false,
      searchPageType:'LINE',
      showCreatePage:props.showCreatePage,
      scrollValue:{
        x:500,
        y:700

      }
    }

    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;

  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    this.getData();
  }

  componentWillReceiveProps(nextProps) {

  }

  onSearch = (data) => {
    let filter = {};
    if (data) {
      filter = {
        companyUuid :loginCompany().uuid,
        dispatchCenterUuid : loginOrg().uuid,
        ...data
      }
    } else {
      filter = {
        companyUuid :loginCompany().uuid,
        dispatchCenterUuid : loginOrg().uuid,
      }
    }
    this.getData(filter);

  }

  changeSelectedRows = (selectedRows) => {
    let param = [];
    for (let i = 0; i < selectedRows.length; i++) {
      param.push({
        code: selectedRows[i].code
      })
    }
    // this.props.getLeftSelectData(param);
    this.props.refreshStoreLineBillPage(selectedRows);
    this.setState({
      selectLeftData: param
    })
  };

  getData = (filter) => {
    const { dispatch } = this.props;
    const { data } = this.state;
    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
    }
    dispatch({
      type: 'dispatchSerialArch/getSerialArch',
      callback:response=>{
        if(response && response.success && response.data){
          this.setState({
            serialArch: response.data
          });
          dispatch({
            type: 'dispatchSerialArch/getLinesByArchCodeAndClassGroupCodeName',
            payload: filter ? {
              classGroupCodeName:filter.classGroupCodeName1 ? filter.classGroupCodeName1 : '',
              dispatchCenterUuid: loginOrg().uuid,
              serialArchLineCodeName: filter.serialArchLineCodeName ? filter.serialArchLineCodeName : '',
              serialArchUuid: response.data.uuid
            } : {
              classGroupCodeName:'',
              dispatchCenterUuid: loginOrg().uuid,
              serialArchLineCodeName: '',
              serialArchUuid: response.data.uuid
            },
            callback:response=>{
              if(response && response.success && response.data){
                data.list = response.data ? response.data : [];
                this.setState({
                  selectedRows: [],
                  data: { ...data }
                })
              } else {
                this.setState({
                  selectedRows: [],
                  data:{
                    list:[]
                  }
                })
              }
            }
          });
        }
      }
    });
  };

  /**
   * 保存线路
   */
  handleSaveLine = value => {
    const { dispatch } = this.props;
    let type = 'dispatchSerialArch/addLine';
    value['companyUuid'] = loginCompany().uuid;
    value['dispatchCenterUuid'] = loginOrg().uuid;
    dispatch({
      type: type,
      payload: value,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.getData();
          this.setState({
            createModalVisible: false,
          });
        }
      },
    });
  };

  handleShowExcelImportPage = () => {
    const { serialArch } = this.state;
    this.props.refreshLineBillPage('true', serialArch);
  };

  onCancelModal = ()=>{
    this.setState({
      createModalVisible:false,
    });
  };

  onCreate = ()=>{
    this.setState({
      createModalVisible:true,
    })
  };

  columns = [
    {
      title:'线路代码',
      dataIndex:'code',
      fixed: 'left',
      width:80
    },
    {
      title:'线路名称',
      dataIndex:'name',
      width:80
    },
    {
      title: '门店数',
      dataIndex: 'storeNumber',
      width: 60
    },
    {
      title: '班组',
      dataIndex: 'classGroup',
      width: 80,
      render:(val)=>{
        return val?<EllipsisCol colValue={convertCodeName(val)} />:<Empty />
      }
    },
    {
      title: '线路体系',
      dataIndex: 'serialArch',
      width: 80,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
  ];

  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <LineSearchForm filterValue={this.state.pageFilter.searchKeyValues}
                       refresh={this.onSearch}/>
    );
  }
  // drawBussiness = ()=>{
  //   return  <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'12px' ,marginBottom:'3%'}}>
  //     <Button style={{marginRight:'12px'}} onClick={() => this.handleShowExcelImportPage()}>导入</Button>
  //     <Button style={{marginRight:'12px'}} onClick={()=>this.onCreate()}>新增</Button>
  //   </div>
  // }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return [
      <Button key={1} style={{marginRight:'12px',marginBottom:'10px'}} onClick={() => this.handleShowExcelImportPage()}>
        {'导入'}
      </Button>,
      <Button key={2} onClick={() => this.onCreate()}>
        {'新增'}
      </Button>
    ];
  }

  drawOther = ()=>{
    const { createModalVisible} = this.state;
    return  <LineCreateModal
      visible = {createModalVisible}
      onCancelModal = {this.onCancelModal}
      handleSaveLine = {this.handleSaveLine}
    />


  }

}
