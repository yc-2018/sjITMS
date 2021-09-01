
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, Divider, message, Menu, Dropdown, Tooltip, Icon, Row, Col } from 'antd';
import Empty from '@/pages/Component/Form/Empty';
import { add, accAdd, accMul, accDiv } from '@/utils/QpcStrUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import StoreSearchForm from './StoreSearchForm'
import SearchPage from '../SearchPage';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';

@connect(({ dispatchSerialArch, loading }) => ({
  dispatchSerialArch,
  loading: loading.models.dispatchSerialArch,
}))
@Form.create()
export default class StoreSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '门店',
      key:'dispatchSerialArch.search.table',
      data:{
        list:[]
      },
      selectedRows: [],
      suspendLoading: false,
      searchPageType:'STORE',
      noPagination:false,
      showCreatePage:props.showCreatePage,
      leftList:props.leftList, // target
      scrollValue:{
        x:500,
        y:700

      },
      reSendModalVisible:false,
      reShipModalVisible:false,
    }
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    this.getData();
  }

  componentWillReceiveProps(nextProps) {

  }

  refreshTable = (filter) => {
    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
    }
    this.getData(filter);
  }

  getData = (filter) => {
    const { dispatch } = this.props;
    const { data } = this.state;
    let mFilter = this.state.pageFilter;
    
    dispatch({
      type: 'dispatchSerialArch/getSerialArch',
      callback:response=>{
        if(response && response.success && response.data){
          this.setState({
            serialArch: response.data
          });
          if (filter) {
            mFilter.searchKeyValues = filter.searchKeyValues;
          }else{
            mFilter.searchKeyValues = {
              companyUuid: loginCompany().uuid,
              storeCodeName: '',
              serialArchUuid: response.data.uuid
            }
          }
          dispatch({
            type: 'dispatchSerialArch/getStoreUCNByStoreCodeName',
            payload: mFilter,
            callback:response=>{
              if(response && response.success && response.data){
                data.list = response.data ? response.data.records? response.data.records : [] : [];
                data.pagination = {
                  total: response.data.paging.recordCount,
                  pageSize: response.data.paging.pageSize,
                  current: response.data.page + 1,
                  showTotal: total => `共 ${total} 条`,
                },
                this.setState({
                  data: { ...data }
                })
              } else {
                this.setState({
                  selectedRows: [],
                  data: {
                    list: [],
                    // pagination: {}
                  }
                })
              }
            }
          });
        }
      }
    });
  };

  onReset = () => {
    this.getData();
  }

  onRefresh = (data) => {
    if (data){
      this.onSearch(data)
    }else{
      this.onReset();
    }
  }
  onSearch = (data) => {
    let filter = this.state.pageFilter;
    if (data) {
      filter.searchKeyValues.companyUuid = loginCompany().uuid;
      filter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
      filter.searchKeyValues.storeCodeName = data.codeName1 ? data.codeName1 : ''
      } else {
        filter.searchKeyValues.companyUuid = loginCompany().uuid;
        filter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
    }
    this.getData(filter);
  }

  changeSelectedRows = (selectedRows) => {
    this.setState({
      selectRightData: selectedRows
    })
  };

  addToLine = ()=> {
    const { dispatch, leftList } = this.props;
    const { selectRightData, serialArch } = this.state;
    let endData = [];
    if (!leftList || leftList.length === 0) {
      message.warning('请先选择要调整的线路');
      return;
    }
    if (!selectRightData || selectRightData.length === 0) {
      message.warning('请先选择要加入的门店');
      return;
    }
    if (leftList && leftList.length > 1) {
      message.warning('只能添加一条线路的门店');
      return;
    }
    if (Array.isArray(selectRightData)) {

      for (let item of selectRightData) {
        let data = {};
        data.serialArch = {
          uuid: serialArch.uuid,
          code: serialArch.code,
          name: serialArch.name
        };
        data.archLine = {
          uuid: leftList[0].uuid,
          code: leftList[0].code,
          name: leftList[0].name
        };
        data.storeType = 'STORE';
        data.store = item.store;
        data.companyUuid = loginCompany().uuid;
        data.dispatchCenterUuid = loginOrg().uuid;
        endData.push(data);
      }
    }
    dispatch({
      type: 'dispatchSerialArch/saveLineStore',
      payload: endData,
      callback:response=>{
        if(response && response.success){
          this.setState({
            selectedRows: [],
            selectRightData: []
          });
          this.getData();
          this.props.refreshStoreLineBillPage('');
          this.props.refreshLineBillPage();
        }
      }
    });
  };

  columns = [
    {
      title:'门店代码',
      dataIndex:'store.code',
      fixed: 'left',
      width:80,
    },
    {
      title:'门店名称',
      dataIndex:'store.name',
      width:150
    },
    {
      title:'简称',
      dataIndex:'storeShortName',
      width:120
    },
    {
      title:'班组',
      dataIndex:'classGroup',
      width:80,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title:'门店类型',
      dataIndex:'storeType',
      width:80
    },
    {
      title:'到货条件',
      dataIndex:'arrivalType',
      width:80
    }
  ];

  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <StoreSearchForm filterValue={this.state.pageFilter.searchKeyValues}
                       refresh={this.onRefresh}/>
    );
  }
  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return [
      <Button key={1} style={{marginBottom:'10px'}} onClick={() => this.addToLine()}>
        {'添加到线路'}
      </Button>
    ];
  }

  // drawOther = ()=>{
  //   return <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'12px' ,marginBottom:'3%'}}>
  //     <Button onClick={()=>this.addToLine()}>添加到线路</Button>
  //   </div>
  // }

}
