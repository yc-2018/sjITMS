/*
 * @Author: Liaorongchang
 * @Date: 2022-04-01 15:58:47
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-12-08 16:56:04
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { Checkbox, Select, Input, Button, Popconfirm, message, Dropdown, Menu, Empty, Modal} from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { dynamicQuery, saveFormData } from '@/services/quick/Quick';
import { confirm, cancelReceipted,dispose } from '@/services/sjitms/Checkreceipt';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import { havePermission } from '@/utils/authority';
import SimpleQuery from '@/pages/Component/RapidDevelopment/OnlReport/SimpleQuery/SimpleQuery';
 import styless from '@/pages/Tms/TransportOrder/transportOrder.less';
const { Option } = Select;
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class CheckreceiptBillSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = {
     ...this.state, noActionCol: false, isShow: false, sourceData: [],
     notDispatchCenterUuids:[
      '000008150000002',
     '000008150000001',
     '000000750000004',
     '000000750000005',
     '000000750000006',
     '000008150000003'
    ],
     updateReceiptedLoading:false
    };
  componentDidMount() {
    const pageFilter = this.state.pageFilter;
    pageFilter.pageSize = 50;
    this.setState({pageFilter:pageFilter})
    this.queryCoulumns();
    this.getCreateConfig();
    this.initOptionsData();
    const param = {
      tableName: 'SJ_ITMS_PRETYPE',
      condition: {
        params: [
          { field: 'DISPATCHCENTERUUID', rule: 'eq', val: [loginOrg().uuid] },
          { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] }
        ],
      },
    };
    dynamicQuery(param).then(e=>{
      if(e.success){
        this.setState({
          pretype:e.result.records
        })
      }
    });

  }
  setrowClassName = (record,index)=>{
   
    const pre = this.state.pretype?.filter(e=>e.NAME ==record.DEALMETHOD)[0]
    if( record.RECEIPTED==2 && pre.ISCOLOR=='是'){
      if (pre.COLOR=='Blue' ){
        return styless.gaizBlueStyle;
      } else if (pre.COLOR=='Yellow'){
        return styless.gaizYellowStyle;
      } else if (pre.COLOR=='Green'){
        return styless.gaizGreenStyle;
      } else if (pre.COLOR=='Red'){
      return styless.gaizRedStyle;
     } else if (pre.COLOR=='Purple'){
      return styless.oneself.gaizPurpleStyle;
    }
    }
   
}
  onType = () => {
    this.props.switchTab('view');
  };
  editColumns =(data)=>{
    if(loginOrg().uuid=='000000750000005' || loginOrg().uuid=='000008150000002'){
      data.columns.forEach(e=>{
        if(e.fieldName=='SCHEDULENUMBER'){
            e.searchDefVal ='30YD'
        }
    })
    }else if (loginOrg().uuid=='000000750000006' || loginOrg().uuid=='000008150000003'){
      data.columns.forEach(e=>{
        if(e.fieldName=='SCHEDULENUMBER'){
            e.searchDefVal ='30YX'
        }
    })
    }
    return data;
  }
  onCheckreceiptSave = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      let list = [];
      let msg = true;
      selectedRows.forEach(row => {
        if ((typeof row.DEALMETHOD == 'undefined' || row.DEALMETHOD == '') && row.RECEIPTED == 0) {
          message.error('第' + row.ROW_ID + '行，回单或处理方式为空，不能保存');
          msg = false;
        }
        let data = {
          receipted: row.RECEIPTED == '0' ? false : true,
          uuid: row.UUID,
          dealMethod: row.DEALMETHOD,
          note: row.NOTE,
        };
        list.push(data);
      });
      if (msg) {
        this.setState({updateReceiptedLoading:true})
        const result = await confirm(list);
        if (result.success) {
          message.success('保存成功');
          this.refreshTable();
        }
        this.setState({updateReceiptedLoading:false})
      }
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  cancelReceipted = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      let list = [];
      selectedRows.forEach(row => {
        let data = {
          receipted: row.RECEIPTED == '0' ? false : true,
          uuid: row.UUID,
          dealMethod: row.DEALMETHOD,
          note: row.NOTE,
        };
        list.push(data);
      });
      const result = await cancelReceipted(list);
      if (result.success) {
        message.success('取消成功');
        this.refreshTable();
      }
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  updateReceipted = () => {
    const { selectedRows,notDispatchCenterUuids } = this.state;
    if (selectedRows.length !== 0) {
      selectedRows.forEach(row => {
        row.RECEIPTED = 1;
        row.DEALMETHOD = '';
      });
      this.setState({ selectedRows });
      if(notDispatchCenterUuids.includes(loginOrg().uuid)){
        this.onCheckreceiptSave()
      }else{
        Modal.confirm({
          title:"确定全部回单吗？",
          onOk:()=>this.onCheckreceiptSave()
        })
      }
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  dispose = async ()=>{
    const { selectedRows } = this.state;
    const list = [];
    if (selectedRows.length !== 0) {  
      selectedRows.forEach(row => {
        let data = {
          receipted: row.RECEIPTED == '0' ? false : true,
          uuid: row.UUID,
          dealMethod: row.DEALMETHOD,
          note: row.NOTE,
        };
        list.push(data);
      });
      await dispose(list).then(e=>{
        if(e && e.success){
          message.success('保存成功！');
          this.refreshTable();
        }
      })
    } else {
      message.error('请至少选中一条数据！');
    }
  }

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    //额外的菜单选项
    const menus = [];
    menus.push({
      // disabled: !havePermission(STORE_RES.CREATE), //权限认证
      name: '测试', //功能名称
      onClick: this.test, //功能实现
    });
    const dispatchCenterUuid = loginOrg().uuid;
    return (
      <div>
        <Button
          hidden={!havePermission(this.state.authority + '.management')}
          onClick={() => this.onType()}
        >
          管理回单处理方式
        </Button>
        <Button
          hidden={!havePermission(this.state.authority + '.setUp')}
          onClick={() => this.updateDtlModalRef.show()}
        >
          设置
        </Button>
        <CreatePageModal
          modal={{
            title: '设置',
            width: 500,
          }}
          page={{
            quickuuid: 'sj_itms_receiptbill_config',
            noCategory: true,
            showPageNow: 'update',
            params: { entityUuid: dispatchCenterUuid },
          }}
          onRef={node => (this.updateDtlModalRef = node)}
        />
      </div>
    );
  };

  initOptionsData = async () => {
    let queryParamsJson = {
      tableName: 'SJ_ITMS_PRETYPE',
      condition: {
        params: [
          { field: 'PRETYPE', rule: 'eq', val: ['DEALMETHOD'] },
          { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
          { field: 'dispatchCenterUuid', rule: 'eq', val: [loginOrg().uuid] },
        ],
      },
    };
    await dynamicQuery(queryParamsJson).then(datas => {
      this.setState({ sourceData: datas.result.records });
    });
  };

  buildOptions = () => {
    const { sourceData } = this.state;
    if (sourceData != 'false') {
      return sourceData.map(data => {
        return <Select.Option value={data.NAME}>{data.NAME}</Select.Option>;
      });
    }
  };

  buildMenu = () => {
    const { sourceData } = this.state;
    if (sourceData != 'false') {
      return (
        <Menu onClick={this.handleMenuClick}>
          {sourceData.map(data => {
            return <Menu.Item key={data.NAME}>{data.NAME}</Menu.Item>;
          })}
        </Menu>
      );
    } else {
      return (
        <Empty
          style={{ textAlign: 'center' }}
          description={<span style={{ color: '#aeb8c2' }}>暂无数据</span>}
        />
      );
    }
  };

  handleMenuClick = ({ key }) => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      selectedRows.forEach(row => {
        row.RECEIPTED = 0;
        row.DEALMETHOD = key;
      });
      this.setState({ selectedRows });
      if(this.state.notDispatchCenterUuids.includes(loginOrg().uuid)){
        this.onCheckreceiptSave()
      }else{
        Modal.confirm({
          title:`确定`+key+`吗`,
          onOk:()=>this.onCheckreceiptSave()
        })
      }
      
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  //扩展render
  drawcell = e => {
    if (e.column.fieldName == 'RECEIPTED') {
      e.component = (
        <Checkbox
          style={{ width: 120 ,height:10}}
          checked={e.val == '1' ? true : false}
          key={e.record.UUID}
          onClick={v => {
            v.preventDefault();
            e.record.RECEIPTED = v.target.checked ? 1 : 0;
            if (v.target.checked) {
              e.record.DEALMETHOD = '';
            }
          }}
        >
          <Button  onClick={v => {
            v.preventDefault();
            e.record.RECEIPTED = e.record.RECEIPTED==1?0:1
            if (e.record.RECEIPTED==1) {
              e.record.DEALMETHOD = '';
            }
          }}>回单</Button>
        </Checkbox>
      );
    } else if (e.column.fieldName == 'DEALMETHOD') {
      e.component = (
        <Select
          allowClear
          value={e.val}
          style={{ width: 120 }}
          onChange={v => {
            e.record.DEALMETHOD = v;
            e.record.RECEIPTED = '0';
          }}
        >
          {this.buildOptions()}
        </Select>
      );
    } else if (e.column.fieldName == 'NOTE') {
      e.component = (
        <Input
          defaultValue={e.val}
          onFocus={e => {
            e.currentTarget.select();
          }}
          placeholder="请输入备注"
          onChange={v => (e.record.NOTE = v.target.value)}
        />
      );
    }
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    const superQuery = this.state.pageFilters.superQuery;
    let c;
    if (superQuery) {
      const queryParams = superQuery.queryParams;
      const receipted = queryParams.find(x => x.field === 'RECEIPTED');
      if (receipted) {
        c = receipted.val;
      }
    }
    if (c === '0' || c=='2') {
      return (
        <span>
          <Popconfirm
            title="你确定要保存所选中的内容吗?"
            onConfirm={() => this.onCheckreceiptSave()}
            okText="确定"
            cancelText="取消"
          >
            <Button hidden={!havePermission(this.state.authority + '.save')} type="primary">
              保存
            </Button>
          </Popconfirm>
          {/* <Popconfirm
            title="确定选中的内容都为已回单吗?"
            onConfirm={() => this.updateReceipted()}
            okText="确定"
            cancelText="取消"
          >
           
          </Popconfirm> */}
            
            <Button 
            hidden={!havePermission(this.state.authority + '.allReceipted')}
            onClick = {() => this.updateReceipted() }
            loading = {this.state.updateReceiptedLoading}
            >
                全部回单
              </Button>
          <Dropdown overlay={this.buildMenu.bind()}>
            <Button hidden={!havePermission(this.state.authority + '.batchHandle')}>
              批量设置处理方式
            </Button>
          </Dropdown>
         {c==2 &&<Button 
          hidden={!havePermission(this.state.authority + '.batchHandle')}
          onClick = {() => this.dispose()}
           >
              跟进处理
          </Button>}
        </span>
      );
    }else if (c==2){
      
    } else {
      return (
        <Popconfirm
          title="确定取消回单所选的内容吗?"
          onConfirm={() => this.cancelReceipted()}
          okText="确定"
          cancelText="取消"
        >
          <Button hidden={!havePermission(this.state.authority + '.cancleReceipted')}>
            取消回单
          </Button>
        </Popconfirm>
      );
    }
  };

  //该方法用于写操作列的render
  renderOperateCol = record => {
    return <OperateCol menus={this.fetchOperatePropsCommon(record)} />;
  };
  //操作列举例 具体看OperateCol内介绍
  fetchOperatePropsCommon = record => {
    return [
      {
        name: '查看历史',
        onClick: () => this.props.onClose(record),
      },
    ];
  };
}
