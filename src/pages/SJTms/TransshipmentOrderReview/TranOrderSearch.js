/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-03-28 15:48:34
 * @version: 1.0
 */
import React from 'react';
import { Button, Popconfirm, message, Menu, Modal, Form, Input ,InputNumber} from 'antd';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { batchAudit, audit, cancel, removeOrder,updateOrderWavenum,updateReview,onConfirm } from '@/services/sjitms/OrderBill';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import moment from 'moment';
import { getLodop } from '@/pages/Component/Printer/LodopFuncs';
import { groupBy, sumBy, orderBy } from 'lodash';
import { log } from 'lodash-decorators/utils';
import { convertDate, convertDateToTime } from '@/utils/utils';
import { loginOrg, loginUser } from '@/utils/LoginContext';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class TranOrderSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    showAuditPop: false,
    showCancelPop: false,
    uploadModal: false,
    showRemovePop: false,
    dispatchCenter: '',
    showUpdateWaven:false,
    handUpdateReview:false,
    changeData:[]
  };

  onUpload = () => {
    this.props.switchTab('import');
  };

  defaultSearch = () => {
    //默认查询
    let ex = this.state.queryConfigColumns.filter(item => {
      return item.searchDefVal != null && item.searchDefVal != '';
    });
    let defaultSearch = [];
    let exSearchFilter;
    for (const item of ex) {
      if (item.fieldType == 'Date') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else if (item.fieldType == 'DateTime') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD 00:00:00');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else {
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: item.searchDefVal,
        };
      }
      defaultSearch.push(exSearchFilter);
    }
    //暂时通过这种方式赋予默认值
    defaultSearch.push({
      field: 'WAVENUM',
      type: 'VARCHAR',
      rule: 'eq',
      val: moment(new Date()).format('YYMMDD') + '0001',
    });
    return defaultSearch;
  };
  // drawcell = e => {
  //   debugger;
  //   console.log("a",e);
  //   const column = e.column;
  //   const record = e.record;
  //   const fieldName = column.fieldName;
   
    
  //   if (fieldName == 'REALCARTONCOUNT') {
  //     const component = (
  //       <Input
  //         className={e.record.ROW_ID + 'REALCARTONCOUNT'}
  //         step={0.01}
  //         style={{ width: 100 }}
  //         onFocus={() => {
  //           document.getElementsByClassName(e.record.ROW_ID + 'REALCARTONCOUNT')[0].select();
  //         }}
  //         onChange={event => this.onChange(record, column.fieldName, event.target.value)}
  //         min={0}
  //         defaultValue={record.REALCARTONCOUNT}
  //       />
  //     );
  //     e.component = component;
  //   }
  //   if (fieldName == 'REALCONTAINERCOUNT') {
  //     const component = (
  //       <Input
  //         className={e.record.ROW_ID + 'REALCONTAINERCOUNT'}
  //         onFocus={() => {
  //           document.getElementsByClassName(e.record.ROW_ID + 'REALCONTAINERCOUNT')[0].select();
  //         }}
  //         min={0}
  //         defaultValue={record.REALCONTAINERCOUNT}
  //         style={{ width: 100 }}
  //         onChange={event => this.onChange(record, column.fieldName, Number(event.target.value))}
  //       />
  //     );
  //     e.component = component;
  //   }
  // };

  handleRemove = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length <= 0) {
      message.error('请先选择排车单！');
      return;
    }
    this.setState({ showRemovePop: true });
  };
  handleUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length <= 0) {
      message.error('至少选择一条数据！');
      return;
    }
    this.setState({ showUpdateWaven: true });
  };

  handUpdateReview = ()=>{
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.error('请选择一条数据！');
      return;
    }
    this.setState({
       handUpdateReview: true,
      Carton:selectedRows[0].REALCARTONCOUNT,
      Container:selectedRows[0].REALCONTAINERCOUNT,
      scattered:selectedRows[0].REALSCATTEREDCOUNT
    });
  }

  // drawRightClickMenus = () => {
  //   return (
  //     <Menu>
  //       <Menu.Item
  //         key="1"
  //         hidden={!havePermission(this.state.authority + '.remove')}
  //         onClick={() => this.handleRemove()}
  //       >
  //         转仓
  //       </Menu.Item>
  //     </Menu>
  //   );
  // };

  handleOk = async () => {
    const { selectedRows, dispatchCenter } = this.state;
    if (selectedRows.length == 1) {
      const response = await removeOrder(selectedRows[0].UUID, dispatchCenter);
      if (response && response.success) {
        message.success('转仓成功');
        this.setState({ showRemovePop: false });
        this.onSearch();
      } else {
        message.error('转仓失败');
      }
    } else {
      this.batchProcessConfirmRef.show('转仓', selectedRows, this.remove, this.onSearch);
      this.setState({ showRemovePop: false });
    }
  };
  showUpdateWavenHandleOk =async ()=>{
    const { selectedRows,WAVENUM } = this.state;
    if(selectedRows.length ==0 ){
      message.error('至少选择一条数据');
      return;
    }
    if(!WAVENUM){
      message.error('请填写作业号'); 
      return;
    }
     const response = await updateOrderWavenum (selectedRows.map(e=>e.UUID),WAVENUM);
     if(response && response.success){
      message.success("修改成功");
      this.setState({showUpdateWaven:false})
      this.onSearch();
     }
    
  }
  updatReviewHandleOk = async()=>{
    const { 
      selectedRows,
      Carton,
      Container,
      scattered
     } = this.state;
    const response = await updateReview (selectedRows.map(e=>e.UUID),Carton,Container,scattered);
    if(response && response.success){
     message.success("修改成功");
     this.setState({handUpdateReview:false})
     this.onSearch();
    }
  }
  remove = async record => {
    const { dispatchCenter } = this.state;
    return await removeOrder(record.UUID, dispatchCenter);
  };
  //打印
  handlePrint = async key => {
    const { selectedRows, dc } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择需要打印的单据！');
      return;
    }
    const hide =
      key == 'loadNow' ? message.loading('打印中，请稍后...', 6) : message.loading('加载中...', 5);
    const LODOP = getLodop();
    if (LODOP == undefined) return;
    LODOP.PRINT_INIT('复合打印');
    LODOP.SET_PRINT_PAGESIZE(1, 2100, 1400, '210mm*140mm'); //1代表横的打印 2代表竖的打印 3纵向打印，宽度固定，高度按打印内容的高度自适应；
    //LODOP.SET_LICENSES("","EE0887D00FCC7D29375A695F728489A6","C94CEE276DB2187AE6B65D56B3FC2848","");
    LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 1); //去掉双面打印
    key == 'load' || key == 'loadNow'
      ? await this.buildPrintPage()
      : '';
    if (key != 'load' && key != 'loadNow') LODOP.SET_SHOW_MODE('SKIN_TYPE', 1);
    const printPages = document.getElementById('printPagewe').childNodes;
    printPages.forEach(page => {
      LODOP.NewPageA();
      LODOP.ADD_PRINT_HTM('2%', '2%', '96%', '96%', page.innerHTML);
     
    });
    key == 'loadNow' ? LODOP.PRINT() : LODOP.PREVIEW();
    // LODOP.PREVIEW();
    if (key == 'loadNow') {
      setTimeout(() => {
        message.success('打印成功！', 5);
      }, 7000);
    }

    this.setState({ printPage: undefined });
  };

    
    buildPrintPage = async () => {
      const printPages = [];
      const printPage = this.drawBillPage();
        printPages.push(printPage);
      
      this.setState({ printPage: printPages });
    };
    drawBillPage = ()=>{
      return (
        <div>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, border: 0 }}
            border={1}
            cellPadding={0}
            cellSpacing={0}
          >
            <thead>
              <tr style={{ height: 50 }}>
                <th colspan={2} style={{ border: 0 }} />
                <th colspan={4} style={{ border: 0 }}>
                  <div style={{ fontSize: 18, textAlign: 'center' }}>福建时捷转运单复核单据</div>
                </th>
                <th colspan={2} style={{ border: 0 }}>
                  <div style={{ fontSize: 14, textAlign: 'center' }}>
                    <span>第</span>
                    <font tdata="PageNO" color="blue">
                      ##
                    </font>
                    <span>页/共</span>
                    <font color="blue" style={{ textDecoration: 'underline blue' }} tdata="PageCount">
                      ##
                    </font>
                    <span>页</span>
                  </div>
                </th>
              </tr>
    
              <tr>
                <th colspan={5} style={{ border: 0, height: 25 }}>
                  操作人： {loginUser().name}
                </th>
                <th colspan={5} style={{ border: 0, height: 25 }}>
                  制单时间：{convertDateToTime(new Date())}
                </th>
              </tr>
    
              <tr style={{ height: 25 }}>
                <th width={50}>序号</th>
                <th width={80}>作业号</th>
                <th width={80}>门店编码</th>
                <th width={170}>门店名称</th>
                <th width={80}>拣货次序</th>
                <th width ={80}>整件板位</th>
                <th width={80}>预估整件</th>
                <th width={80}>复核整件</th>
                <th width={80}>预估周转筐</th>
                <th width={80}>复核周转筐</th>
                <th width={80}>周转筐(冷藏)</th>
                <th width={80}>周转筐(冷冻)</th>
              </tr>
            </thead>
            <tbody>
              {this.state.selectedRows ? (
                this.state.selectedRows.map((item,index )=> {
                  return (
                    <tr style={{ textAlign: 'center', height: 20 }}>
                      <td width={50}>{index+1}</td>
                      <td width={80}>{item.WAVENUM}</td>
                      <td width={100}>{item.DELIVERYPOINTCODE}</td>
                      <td width={170}>{item.DELIVERYPOINTNAME}</td>
                      <td width={80}>{item.LINECODE}</td>
                      <td width={80}>{item.COLLECTBIN}</td>
                      <td width={80}>{item.CARTONCOUNT}</td>
                      <td width={80} >{item.REALCARTONCOUNT}</td>
                      <td width={80} >{item.CONTAINERCOUNT}</td>
                      <td width={80}>{item.REALCONTAINERCOUNT}</td>
                      <td width={80} >{item.REALCOLDCONTAINER}</td>
                      <td width={80}>{item.REALFREEZECONTAINER}</td>
                    </tr>
                  );
                })
              ) : (
                <></>
              )}
             
            </tbody>
          </table>
        </div>
      );
    }
  drawToolsButton = () => {
    const { showAuditPop,
       showCancelPop,
        selectedRows,
         dispatchCenter,
          showRemovePop,
          showUpdateWaven,
          Carton,
          Container,
          scattered,
          handUpdateReview,
          printPage
         } = this.state;
    return (
      <>
      <div id="printPagewe" style={{ display: 'none' }}>
          {printPage}
        </div>
        <Button
          hidden={!havePermission(this.state.authority + '.updateReviewCount')}
          onClick={() =>this.handUpdateReview()}
        >
          修改复核数
        </Button>
        <Popconfirm
          title="你确定要复核所选中的内容吗?"
          onConfirm={() => {
            if(selectedRows.length==0){
              message.error("请选择一条数据")
              return;
            }
            onConfirm(selectedRows.map(e=>e.UUID)).then(response => {
              if (response.success) {
                message.success('复核成功！');
                this.onSearch();
              }
            });
          }}
        >
        <Button
          hidden={!havePermission(this.state.authority + '.confirmReview')}
        >
          复核确认
        </Button>
        </Popconfirm>

        <Button
          hidden={!havePermission(this.state.authority + '.printReviewInfo')}
          onClick={()=>this.handlePrint("load")}
        >
          打印复核单据
        </Button>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <Modal
          title="转仓"
          visible={showRemovePop}
          onOk={() => {
            this.handleOk();
          }}
          onCancel={() => {
            this.setState({ showRemovePop: false });
          }}
        >
          <Form>
            <Form.Item label="转仓:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <SimpleAutoComplete
                showSearch
                placeholder="请选择调度中心"
                dictCode="dispatchCenter"
                value={dispatchCenter}
                onChange={e => this.setState({ dispatchCenter: e })}
                noRecord
                style={{ width: 150 }}
                allowClear={true}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="修改作业号"
          visible={showUpdateWaven}
          onOk={() => {
            this.showUpdateWavenHandleOk();
          }}
          onCancel={() => {
            this.setState({ showUpdateWaven: false });
          }}
        >
          <Form>
            <Form.Item label="作业号:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <Input
                onChange={e =>{
                  this.setState({ WAVENUM: e.target.value })
                } }
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="修改复核数"
          visible={handUpdateReview}
          onOk={() => {
            this.updatReviewHandleOk();
          }}
          onCancel={() => {
            this.setState({ handUpdateReview: false });
          }}
        >
          <Form>
            <Form.Item label="复核整件数:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <InputNumber 
               value={Carton}
                onChange={e =>{
                  this.setState({ Carton: e })
                } }
              />
            </Form.Item>
            <Form.Item label="复核筐数:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <InputNumber 
              value={Container}
                onChange={e =>{
                  this.setState({Container: e })
                } }
              />
            </Form.Item>
            <Form.Item label="复核散件:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <InputNumber 
                value={scattered}
                onChange={e =>{
                  this.setState({ scattered: e })
                } }
              />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  };

  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  // drawTopButton = () => {
  //   return (
  //     <span>
  //       <Button
  //         hidden={!havePermission(this.state.authority + '.import')}
  //         type="primary"
  //         onClick={this.onUpload}
  //       >
  //         导入
  //       </Button>
  //     </span>
  //   );
  // };

  /**
   * 编辑界面
   */
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0 && selectedRows[0].STAT === 'Saved') {
      const { onlFormField } = this.props;
      var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
      this.props.switchTab('update', {
        entityUuid: selectedRows[0][field],
      });
    } else {
      message.error('请至少选中一条数据或该单据状态不是保存状态，不能修改');
    }
  };

  //审核
  onAudit = async record => {
    return await audit(record.BILLNUMBER);
  };
  //批量审核（多选）
  onBatchAudit = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showAuditPop: true })
      : this.batchProcessConfirmRef.show('审核', selectedRows, this.onAudit, this.onSearch);
  };
  //批量审核（查询结果）
  onBatchAllAudit = async () => {
    const response = await batchAudit(this.state.pageFilters);
    if (response.success) {
      message.success('审核成功!');
      this.onSearch();
    }
  };

  //取消
  onCancel = async record => {
    return await cancel(record.BILLNUMBER);
  };
  //批量取消
  onBatchCancel = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showCancelPop: true })
      : this.batchProcessConfirmRef.show('取消', selectedRows, this.onCancel, this.onSearch);
  };
 
  onChange = (record, fieldName, value) => {
    const { data } = this.state;
    let newData = { ...data };
    let row = newData.list.find(x => x.uuid == record.uuid);
    const  oldvalue = row[fieldName];
    row[fieldName] = value;
    const index = newData.list.findIndex(x => x.uuid == row.uuid);
    newData.list[index] = row;
    this.setState({ data: newData});
  };
  onfocuschange =(record, fieldName, value)=>{
    const { changeData} = this.state;
    const change = changeData.find(x=>x.UUID==record.UUID);
    if(change){
      change[fieldName] = value;
    }else{
      const sa ={};
      sa[fieldName]= value;
      sa.UUID = record.UUID;
      changeData.push(sa); 
    }
    this.setState({changeData});
  }
  blurSave  = async (record,fieldName,value)=>{
    const { data, changeData} = this.state;
    let newData = { ...data };
    let row = newData.list.find(x => x.uuid == record.uuid);
    const change = changeData.find(x=>x.UUID==record.UUID);
    if(change && change[fieldName] != value){
      const sa ={};
      sa[fieldName]= value;
      sa.UUID = record.UUID;
      changeData.push(sa); 
      const response = await updateReview (record.UUID,row.REALCARTONCOUNT,row.REALCONTAINERCOUNT,row.REALSCATTEREDCOUNT);
      if(response && response.success){
       message.success("修改成功");
       this.setState({changeData})
       this.onSearch();
    }
    }
  }

  drawcell = e => {
    const column = e.column;
    const record = e.record;
    const fieldName = column.fieldName;
    if (e.column.fieldName == 'STAT') {
      let color = this.colorChange(e.record.STAT, e.column.textColorJson);
      let textColor = color ? this.hexToRgb(color) : 'black';
      e.component = (
        <div style={{ backgroundColor: color, textAlign: 'center', color: textColor }}>{e.val}</div>
        // <div style={{ border: '1px solid ' + color, textAlign: 'center' }}>{e.val}</div>
      );
    }
    if (fieldName == 'REALCARTONCOUNT') {
      const component = (
        <Input
          className={e.record.ROW_ID + 'REALCARTONCOUNT'}
          step={0.01}
          style={{ width: 100 }}
          onFocus={(event) => {
            document.getElementsByClassName(e.record.ROW_ID + 'REALCARTONCOUNT')[0].select();
              this.onfocuschange(record,column.fieldName,event.target.value);
          }}
          onBlur={(event)=>this.blurSave(record,column.fieldName,event.target.value)}
          onChange={event => this.onChange(record, column.fieldName, event.target.value)}
          min={0}
          defaultValue={record.REALCARTONCOUNT}
        />
      );
      e.component = component;
    }
    if (fieldName == 'REALCONTAINERCOUNT') {
      const component = (
        <Input
          className={e.record.ROW_ID + 'REALCONTAINERCOUNT'}
          onFocus={(event) => {
            document.getElementsByClassName(e.record.ROW_ID + 'REALCONTAINERCOUNT')[0].select();
            this.onfocuschange(record,column.fieldName,event.target.value);
          }}
          min={0}
          defaultValue={record.REALCONTAINERCOUNT}
          style={{ width: 100 }}
          onBlur={(event)=>this.blurSave(record,column.fieldName,event.target.value)}
          onChange={event => this.onChange(record, column.fieldName, event.target.value)}
        />
      );
      e.component = component;
    }
  };
}
