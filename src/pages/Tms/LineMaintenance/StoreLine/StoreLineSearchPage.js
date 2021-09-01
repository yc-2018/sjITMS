
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Input, Divider, message, Popconfirm, InputNumber, Tooltip, Icon, Row, Col } from 'antd';
import Empty from '@/pages/Component/Form/Empty';
import { add, accAdd, accMul, accDiv } from '@/utils/QpcStrUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany, getActiveKey } from '@/utils/LoginContext';
import StoreLineSearchForm from './StoreLineSearchForm'
import SearchPage from '../SearchPage';
import { SerialArchLocale, SerialArchPerm } from '../../DispatchCenterSerialArch/SerialArchLocale';
import { bookLocale } from '../../../In/Book/BookLocale';
import styles from '../LineMaintenance.less';

@connect(({ dispatchSerialArch, loading }) => ({
  dispatchSerialArch,
  loading: loading.models.dispatchSerialArch,
}))
@Form.create()
export default class StoreLineSearchPage extends SearchPage {
  constructor(props) { 
    super(props);
    this.state = {
      ...this.state,
      title: '门店线路',
      key:'dispatchSerialArch.search.table',
      data:{
        list:[]
      },
      selectedRows: [],
      suspendLoading: false,
      searchPageType:'STORE_LINE',
      scrollValue:{
        x:500,
        y:700

      }
    };

    this.state.pageFilter.dispatchCenterUuid = loginOrg().uuid;
    this.state.pageFilter.searchKeyValues.sortFields = {
      orderNo: true
    }

  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
    this.getData();
  }

  componentWillReceiveProps(nextProps) {

  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.searchKeyValues = {
        companyUuid :loginCompany().uuid,        
        sort:{
          orderNo: true
        },
        ...data
      }
      pageFilter.dispatchCenterUuid = loginOrg().uuid;
    } else {
      pageFilter.searchKeyValues = {
        companyUuid :loginCompany().uuid,       
        sort:{
          orderNo: true
        },
      }
      pageFilter.dispatchCenterUuid = loginOrg().uuid;
    }
    this.getData(pageFilter);

  }

  changeSelectedRows = (selectedRows) => {
    this.setState({
      selectCenterData: selectedRows
    })
  };

  getData = (filter,list) => {
    const { dispatch } = this.props;
    const { pageFilter, data } = this.state;
    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
    }

    if(list){
      this.setState({
        leftList: list,
      })
    }
    let leftList = list? list : this.state.leftList? this.state.leftList : [];

    let selectedLinesUuid = [];
    Array.isArray(leftList) && leftList.forEach(line => {
      selectedLinesUuid.push(line.uuid);
    });

    let payload = filter?filter:pageFilter;
    payload.archLineUuid = selectedLinesUuid;
    dispatch({
      type: 'dispatchSerialArch/getSerialArch',
      callback:response=>{
        if(response && response.success && response.data){
          payload.serialArchUuid = response.data.uuid;
          this.setState({
            serialArch: response.data
          });
          dispatch({
            type: 'dispatchSerialArch/queryDispatchSerialArchLineStore',
            payload: payload,
            callback:response=>{
              if(response && response.success && response.data){
                let centerData = response.data && response.data.records ? response.data.records : [];
                data.list = centerData;
                this.setState({
                  data: { ...data }
                })
              } else {
                this.setState({
                  selectedRows: [],
                  data: {
                    list: []
                  }
                })
              }
            }
          });
        }
      }
    });
  };

  onRemove = () => {
    const { selectCenterData } = this.state;
    if (!selectCenterData || selectCenterData.length === 0) {
      message.warning(SerialArchLocale.pleaseSelectToRemoveStore);
      return;
    }
    let uuids = [];
    if ( selectCenterData && selectCenterData.length>0 ) {
      for (let i = 0; i < selectCenterData.length; i++) {
        uuids.push(selectCenterData[i].uuid);
      }
    }
    this.props.dispatch({
      type: 'dispatchSerialArch/batchRemoveLineStore',
      payload: uuids,
      callback: (response) => {
        if (response && response.success) {
          this.getData();
          this.props.refreshLineBillPage();
          this.props.refreshStoreBillPage();
        }
      }
    })

  }

  onAdjustNo = () => {
    const { selectCenterData, serialArch } = this.state;
    if (!selectCenterData || selectCenterData.length === 0) {
      message.warning('请先选择要调整的线路门店');
      return;
    }
    if (selectCenterData && selectCenterData.length > 1) {
      message.warning('只能修改一条线路门店顺序');
      return;
    }
    if ( selectCenterData && selectCenterData.length>0 ) {
      if(!selectCenterData[0].orderNo) {
        message.warning('顺序号不能为0或空');
        return;
      }
      for (let i = 0; i < selectCenterData.length; i++) {
        this.props.dispatch({
          type: 'dispatchSerialArch/sort',
          payload: {
            orderNo: selectCenterData[0].orderNo,
            serialArchLineUuid: selectCenterData[0].archLine.uuid,
            storeUuid: selectCenterData[0].store && selectCenterData[0].store.uuid ? selectCenterData[0].store.uuid : ''
          },
          callback: (response) => {
            if (response && response.success) {
              this.getData();
            }
          }
        })
      }
    }

  }

  handleFieldChange = (e, fieldName, line) => {
    const { data } = this.state;
    const target = data.list[line];
    if (fieldName === 'orderNo') {
      target.orderNo = e;
    }
    this.setState({
      data: {...data}

    })
  }

  columns = [
    {
      title:'线路代码',
      dataIndex:'archLine.code',
      fixed: 'left',
      width:80
    },
    {
      title:'顺序号',
      dataIndex:'orderNo',
      width:120,
      render:(val,record, index)=>{
        return (
          <InputNumber
            className={styles.height}
            style={{ width: '80%', height: '20px'}}
            min={0}
            precision={0}
            value={record.orderNo}
            onChange={
              e => this.handleFieldChange(e, 'orderNo', index)
            }
          />

        )
      }
    },
    {
      title:'门店代码',
      dataIndex:'store.code',
      width:80
    },
    {
      title:'门店名称',
      dataIndex:'store.name',
      width:150
    },
    {
      title: '联系人',
      dataIndex: 'qtyStr1',
      width: 60,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: '联系方式',
      dataIndex: 'qtyStr',
      width: 80,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: '门店地址',
      dataIndex: 'storeAddress',
      width: 400,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: '备注',
      dataIndex: 'note',
      width: 100
    },
  ];

  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <StoreLineSearchForm filterValue={this.state.pageFilter.searchKeyValues}
                       refresh={this.onSearch}/>
    );
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return [
      <Button key={1} style={{marginRight:'12px',marginBottom:'10px'}} onClick={() => this.onRemove()}>
        {'删除'}
      </Button>,
      <Button key={2} onClick={() => this.onAdjustNo()}>
        {'修改顺序'}
      </Button>
    ];
  }

  // drawOther = ()=>{
  //   return <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'12px' ,marginBottom:'3%'}}>
  //     <Popconfirm title={SerialArchLocale.sureToRemoveSelectedStore} onConfirm={() => this.onRemove()}>
  //       <Button style={{marginRight:'12px'}}>
  //         删除
  //       </Button>
  //     </Popconfirm>
  //     <Button onClick={()=>this.onAdjustNo()}>修改顺序</Button>
  //   </div>
  // }

}
