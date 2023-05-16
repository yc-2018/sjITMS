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
import { queryAllData } from '@/services/quick/Quick';
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
    // defaultSearch.push({
    //   field: 'WAVENUM',
    //   type: 'VARCHAR',
    //   rule: 'eq',
    //   val: moment(new Date()).format('YYMMDD') + '0001',
    // });
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
  handlePrint = async (key,flag) => {
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
    LODOP.SET_PRINT_PAGESIZE(1, 2400, 1400, '240mm*140mm'); //1代表横的打印 2代表竖的打印 3纵向打印，宽度固定，高度按打印内容的高度自适应；
    //LODOP.SET_LICENSES("","EE0887D00FCC7D29375A695F728489A6","C94CEE276DB2187AE6B65D56B3FC2848","");
    LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 1); //去掉双面打印
    key == 'load' || key == 'loadNow'
      ? await this.buildPrintPage(flag)
      : '';
    if (key != 'load' && key != 'loadNow') LODOP.SET_SHOW_MODE('SKIN_TYPE', 1);
    const printPages = document.getElementById('printPagewes').childNodes;
    printPages.forEach(page => {
      LODOP.NewPageA();
      LODOP.ADD_PRINT_TABLE('2%', '2%', '96%', '96%', page.innerHTML);
      //LODOP.ADD_PRINT_HTM('2%', '2%', '96%', '96%', page.innerHTML);
     
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

    
    buildPrintPage = async (flag) => {
      const printPages = [];
      const printPage =  await this.drawBillPage(flag);
        printPages.push(printPage);
      
      this.setState({ printPage: printPages });
    };
 
    drawBillPage = async (flag)=>{
      if(flag=='销售单'){
        const sadf  = await  queryAllData({
          quickuuid: 'v_iwms_saleorder_d',
          superQuery: {
            queryParams: [
              {
                field: 'WSS',
                type: 'VarChar',
                rule: 'eq',
                val: this.state.selectedRows[0].WSS,
              },
            ],
          },
        });
        const xsdd = sadf.data.records;
        const xsddsum = sumBy(xsdd,'REALQTY');

        const henadss  = await  queryAllData({
          quickuuid: 'v_iwms_saleorder_h',
          superQuery: {
            queryParams: [
              {
                field: 'WSS',
                type: 'VarChar',
                rule: 'eq',
                val: this.state.selectedRows[0].WSS,
              },
            ],
          },
        });
        const heands = henadss.data.records;
        const heandsum = sumBy(heands,'TOTALREALAMOUNT');
        const henadsd  = await  queryAllData({
          quickuuid: 'v_iwms_saleorder_h2',
          superQuery: {
            queryParams: [
              {
                field: 'WSS',
                type: 'VarChar',
                rule: 'eq',
                val: this.state.selectedRows[0].WSS,
              },
            ],
          },
        });
        const heandsdd = henadsd.data.records;
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
                      <div style={{ fontSize: 18, textAlign: 'center' }}>彩华销售单</div>
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
                    <th colspan={3} style={{ border: 0, height: 25 }}>
                      配货日期： {convertDateToTime(new Date())}
                    </th>
                    <th colspan={3} style={{ border: 0, height: 25 }}>
                      司机：{xsdd[0].CARRIERNAME}
                    </th>
                    <th colspan={3} style={{ border: 0, height: 25 }}>
                      司机电话：{xsdd[0].TEL}
                    </th>
                    <th colspan={3} style={{ border: 0, height: 25 }}>
                      装车单号：{xsdd[0].SCHEDULENUM}
                    </th>
                    
                  </tr>
                  <tr>
                    <th colspan={3} style={{ border: 0, height: 25 }}>
                      客户电话： {xsdd[0].CONTACTPHONE}
                    </th>
                    <th colspan={3} style={{ border: 0, height: 25 }}>
                      车牌号：{xsdd[0].VEHICLEPLATENUMBER}
                    </th>
                    <th colspan={3} style={{ border: 0, height: 25 }}>
                      业务电话：{xsdd[0].NOTE}
                    </th>
                    <th colspan={3} style={{ border: 0, height: 25 }}>
                      作业号：{xsdd[0].WAVEBILLNUMBER}
                    </th>
                  </tr>
                  <tr>
                    <th colspan={6} style={{ border: 0, height: 25 }}>
                      收货地址 {xsdd[0].STREET}
                    </th>
                    <th colspan={6} style={{ border: 0, height: 25 }}>
                      收货客户：{xsdd[0].STORECODE}
                    </th>
                  </tr>
        
                  <tr style={{ height: 25 }}>
                    <th width={30}>序号</th>
                    <th width={80}>商品代码</th>
                    <th width={80}>国际条码</th>
                    <th width={170}>品名</th>
                    <th width={80}>批次</th>
                    <th width ={30}>单位</th>
                    <th width={80}>数量</th>
                    <th width={80}>包装</th>
                    <th width={80}>件数</th>
                    <th width={80}>销售价</th>
                    <th width={80}>销售金额</th>
                    <th width={80}>折扣金额</th>
                  </tr>
                </thead>
                <tbody>
                  {xsdd ? (
                    xsdd.map((item,index )=> {
                      return (
                        <tr style={{ textAlign: 'center', height: 20 }}>
                          <td width={50}>{index+1}</td>
                          <td width={80}>{item.ARTICLECODE}</td>
                          <td width={100}>{item.BARCODE}</td>
                          <td width={170}>{item.ARTICLENAME}</td>
                          <td width={80}>{item.BATCHNUM}</td>
                          <td width={80}>{item.MUNIT}</td>
                          {/* <td width={80}>{item.CARTONCOUNT}</td> */}
                          <td width={80} >{item.REALQTY}</td>
                          {/* <td width={80} >{item.CONTAINERCOUNT}</td> */}
                          <td width={80}>{item.PAQ}</td>
                          <td width={80} >{item.REALQTYSTR}</td>
                          <td width={80}>{item.PRICE}</td>
                          <td width={80}>{item.PRICE1}</td>
                          <td width={80}>{}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <></>
                  )}
                     {heands ? (
                    heands.map((item,index )=> {
                      return (
                        <tr style={{ textAlign: 'center', height: 20 }}>
                        <td width={100} colSpan={3}>{item.SOURCEBILLNUMBER}</td>
                        <td width={100} colSpan={5}>{item.BILLNUMBER}</td>
                        <td width={80} colSpan={2}>{item.BNUMBERS}</td>
                        <td width={80} colSpan={2}>{item.TOTALREALAMOUNT}</td>
                      </tr>
                      );
                    })
                    
                  ) : (
                    <></>
                  )}
                  {heandsdd ? (
                    heandsdd.map((item,index )=> {
                      return (
                        <tr style={{ textAlign: 'center', height: 20 }}>
                        <td width={100} colSpan={10}>{item.SELLDISCOUNTORDERNO}</td>
                        <td width={100} colSpan={2}>{item.CASHTICKETMONEY}</td>
                      </tr>
                      );
                    })
                    
                  ) : (
                    <></>
                  )}
                  {
                    (<tr>
                      <td style={{ border: 0 }} colSpan={4}>合计：</td>
                      <td style={{ border: 0 }} colSpan={4}>销售数量：{xsddsum}</td>
                      <td style={{ border: 0 }} colSpan={4}>销售金额：{heandsum}</td>
                    </tr>)
                  }
                   {
                    (<tr >
                      <td  colSpan={12} style={{ border: 0 }}>
                      请门店务必核对送货单件数，如有问题请及时联系物流部，调度服务电话:07383338671-6007 (8:00-17:30) 400热线:4008306700<br></br>注意:货物当面点清并检查无破损、融化、否则后果自负。司机送货到店,所有整件、周转箱数量务必当面点清。司机离开后,少整件、少周转箱的情况,物流概不处理.
                      </td>
                    </tr>
                  
                    )
                  }
                  {
                    <tr><td  colSpan={12}   style={{ border: 0 }} >客户收货时间:</td></tr>
                  }
                </tbody>
              </table>
            </div>
            )
      }else{
        const sign  = await  queryAllData({
          quickuuid: 'v_iwms_sign',
          superQuery: {
            queryParams: [
              {
                field: 'PK',
                type: 'VarChar',
                rule: 'eq',
                val: this.state.selectedRows[0].WSS,
              },
            ],
          },
        });
        const signs = sign.data.records; 
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
                    <div style={{ fontSize: 18, textAlign: 'center' }}>签收单</div>
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
                    配货日期： {convertDateToTime(new Date())}
                  </th>
                  <th colspan={5} style={{ border: 0, height: 25 }}>
                    装车单号：{convertDateToTime(new Date())}
                  </th>
                  <th colspan={5} style={{ border: 0, height: 25 }}>
                    打印时间：{convertDateToTime(new Date())}
                  </th>
                </tr>
                <tr>
                  <th colspan={5} style={{ border: 0, height: 25 }}>
                    客户名称： {convertDateToTime(new Date())}
                  </th>
                  <th colspan={5} style={{ border: 0, height: 25 }}>
                    收货地址：{convertDateToTime(new Date())}
                  </th>
                </tr>
      
                {/* <tr style={{ height: 25 }}>
                  <th width={50}>序号</th>
                  <th width={80}>作业号</th>
                  <th width={80}>门店编码</th>
                  <th width={170}>门店名称</th>
                  <th width={80}>拣货次序</th>
                  <th width ={80}>整件板位</th>
                  <th width={100}>整件</th>
                  <th width={100}>周转箱</th>
                  <th width={100}>冷藏箱</th>
                  <th width={100}>冷冻箱</th>
                </tr> */}
              </thead>
              <tbody>
                {signs ? (
                 signs.map((item,index )=> {
                    return (
                      <tr style={{ textAlign: 'center', height: 20 }}>
                        <td width={50}>{index+1}</td>
                        <td width={80}>{item.WAVENUM}</td>
                        <td width={100}>{item.DELIVERYPOINTCODE}</td>
                        <td width={170}>{item.DELIVERYPOINTNAME}</td>
                        <td width={80}>{item.LINECODE}</td>
                        <td width={80}>{item.COLLECTBIN}</td>
                        {/* <td width={80}>{item.CARTONCOUNT}</td> */}
                        <td width={80} >{item.REALCARTONCOUNT}</td>
                        {/* <td width={80} >{item.CONTAINERCOUNT}</td> */}
                        <td width={80}>{item.REALCONTAINERCOUNT}</td>
                        <td width={80} >{item.REALCOLDCONTAINER}</td>
                        <td width={80}>{item.REALFREEZECONTAINER}</td>
                      </tr>
                    );
                  })
                ) : (
                  <></>
                )}
                
                      <tr style={{ textAlign: 'center', height: 20 }}>
                        <td width={50} colSpan={2}>合计</td>
                       
                        <td width={100} colSpan={2}>{this.state.selectedRows.length}</td>
                        <td width={80}>{}</td>
                        <td width={80}>{}</td>
                        {/* <td width={80}>{CARTONCOUNT}</td> */}
                        <td width={100} >{REALCARTONCOUNT}</td>
                        {/* <td width={80} >{CONTAINERCOUNT}</td> */}
                        <td width={100}>{REALCONTAINERCOUNT}</td>
                        <td width={100} >{REALCOLDCONTAINER}</td>
                        <td width={100}>{REALFREEZECONTAINER}</td>
                      </tr>
                    
                
                
                
               
              </tbody>
            </table>
          </div>
        );

      }
      let  REALCARTONCOUNT  =0;
      let  CARTONCOUNT = 0;
      let CONTAINERCOUNT = 0;
      let  REALCONTAINERCOUNT =0;
      let REALCOLDCONTAINER = 0;
      let REALFREEZECONTAINER = 0;
      this.state.selectedRows.map(e=>{
        REALCARTONCOUNT+=e.REALCARTONCOUNT;
        CONTAINERCOUNT+=e.CONTAINERCOUNT;
        CARTONCOUNT+=e.CARTONCOUNT;
        REALCONTAINERCOUNT+=e.REALCONTAINERCOUNT;
        REALFREEZECONTAINER+=e.REALFREEZECONTAINER;
        REALCOLDCONTAINER+=e.REALCOLDCONTAINER;
      })

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
                <th width={100}>整件</th>
                <th width={100}>周转箱</th>
                <th width={100}>冷藏箱</th>
                <th width={100}>冷冻箱</th>
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
                      {/* <td width={80}>{item.CARTONCOUNT}</td> */}
                      <td width={80} >{item.REALCARTONCOUNT}</td>
                      {/* <td width={80} >{item.CONTAINERCOUNT}</td> */}
                      <td width={80}>{item.REALCONTAINERCOUNT}</td>
                      <td width={80} >{item.REALCOLDCONTAINER}</td>
                      <td width={80}>{item.REALFREEZECONTAINER}</td>
                    </tr>
                  );
                })
              ) : (
                <></>
              )}
              
                    <tr style={{ textAlign: 'center', height: 20 }}>
                      <td width={50} colSpan={2}>合计</td>
                     
                      <td width={100} colSpan={2}>{this.state.selectedRows.length}</td>
                      <td width={80}>{}</td>
                      <td width={80}>{}</td>
                      {/* <td width={80}>{CARTONCOUNT}</td> */}
                      <td width={100} >{REALCARTONCOUNT}</td>
                      {/* <td width={80} >{CONTAINERCOUNT}</td> */}
                      <td width={100}>{REALCONTAINERCOUNT}</td>
                      <td width={100} >{REALCOLDCONTAINER}</td>
                      <td width={100}>{REALFREEZECONTAINER}</td>
                    </tr>
                  
              
              
              
             
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
      <div id="printPagewes" style={{ display: 'none' }}>
          {printPage}
        </div>
        <Button
         // hidden={!havePermission(this.state.authority + '.confirmReview')}
          onClick={()=>this.handlePrint("load","销售单")}
        >
         打印销售单
        </Button>
        <Button
         // hidden={!havePermission(this.state.authority + '.printReviewInfo')}
          onClick={()=>this.handlePrint("load","签收单")}
        >
          打印签收单
        </Button>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
     
      

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
     const real = {
        uuid:record.UUID,
        realCartonCount:row.REALCARTONCOUNT,
        realContainerCount:row.REALCONTAINERCOUNT,
        realScatteredCount: row.REALSCATTEREDCOUNT,
        realColdContainerCount: row.REALCOLDCONTAINER,
        realFreezeContainerCount: row.REALFREEZECONTAINER
      }
      const response = await updateReview (real);
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
    if (fieldName == 'REALFREEZECONTAINER') {
      const component = (
        <Input
          className={e.record.ROW_ID + 'REALFREEZECONTAINER'}
          onFocus={(event) => {
            document.getElementsByClassName(e.record.ROW_ID + 'REALFREEZECONTAINER')[0].select();
            this.onfocuschange(record,column.fieldName,event.target.value);
          }}
          min={0}
          defaultValue={record.REALFREEZECONTAINER}
          style={{ width: 100 }}
          onBlur={(event)=>this.blurSave(record,column.fieldName,event.target.value)}
          onChange={event => this.onChange(record, column.fieldName, event.target.value)}
        />
      );
      e.component = component;
    }
    if (fieldName == 'REALCOLDCONTAINER') {
      const component = (
        <Input
          className={e.record.ROW_ID + 'REALCOLDCONTAINER'}
          onFocus={(event) => {
            document.getElementsByClassName(e.record.ROW_ID + 'REALCOLDCONTAINER')[0].select();
            this.onfocuschange(record,column.fieldName,event.target.value);
          }}
          min={0}
          defaultValue={record.REALCOLDCONTAINER}
          style={{ width: 100 }}
          onBlur={(event)=>this.blurSave(record,column.fieldName,event.target.value)}
          onChange={event => this.onChange(record, column.fieldName, event.target.value)}
        />
      );
      e.component = component;
    }
  };
}
