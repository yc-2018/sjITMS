/*
 * @Author: guankongjin
 * @Date: 2022-07-13 14:22:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-15 14:56:40
 * @Description: 司机刷卡
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\DriverSwipePrint.js
 */
import { PureComponent } from 'react';
import { Card, Col, Input, Row, Spin, Select, message } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import Empty from '@/pages/Component/Form/Empty';
import { driverSwipePrint } from '@/services/sjitms/ScheduleProcess';
import { queryDictByCode } from '@/services/quick/Quick';
import { loginOrg, loginUser } from '@/utils/LoginContext';
import scher from '@/assets/common/scher.jpg';
import { convertDateToTime } from '@/utils/utils';
import { queryAllDataByOpen } from '@/services/quick/Open';
import { getLodop } from '@/pages/Component/Printer/LodopFuncs';
import { log } from 'lodash-decorators/utils';
export default class DriverSwipePrint extends PureComponent {
  state = {
    loading: false,
    dict: [],
    scheduleBill: {},
    empId: '',
    message: undefined,
    errMsg: '',
    isShip: false,
    companyUuid: undefined,
    dispatchUuid: undefined,
    dispatchName: undefined,
    dc: [
      '000000750000004',
      '000008150000001',
      '000000750000005',
      '000008150000002',
      '000008150000003',
      '000000750000006',
     
    ],
  };
  componentDidMount() {
    // ScheduleSearchPage.drawPrintPage();
    this.empInputRef.focus();
    // 查询字典
    queryDictByCode(['dispatchCenter']).then(res => this.setState({ dict: res.data }));
    if (
      localStorage.getItem('dispatchUuid') != undefined &&
      localStorage.getItem('dispatchName') &&
      localStorage.getItem('companyUuid')
    ) {
      this.setState({
        dispatchUuid: localStorage.getItem('dispatchUuid'),
        dispatchName: localStorage.getItem('dispatchName'),
        companyUuid: localStorage.getItem('companyUuid'),
      });
    }
  }

  speech = message => {
    var Speech = new SpeechSynthesisUtterance();
    Speech.lang = 'zh';
    Speech.rate = 0.7;
    Speech.pitch = 1.5;
    Speech.text = message;
    speechSynthesis.speak(Speech);
  };

  //刷卡
  onSubmit = async event => {
    const { dispatchUuid, companyUuid,dc } = this.state;
    if (dispatchUuid == undefined || companyUuid == undefined) {
      message.error('企业中心或调度中心值缺失！');
      return;
    }
    localStorage.setItem('showMessage', '0');
    this.setState({ loading: true, errMsg: undefined });
    const response = await driverSwipePrint(event.target.value, companyUuid, dispatchUuid);
    localStorage.setItem('showMessage', '1');
    if (response.success) {
      this.speech('刷卡打印成功');
      const detailsResp = await queryAllDataByOpen({
        quickuuid: 'sj_itms_print_schedule_order',
        order: 'ARCHLINECODE,ascend',
        superQuery: {
          queryParams: [
            { field: 'billuuid', type: 'VarChar', rule: 'eq', val: response.data.uuid },
          ],
        },
      });
      let scheduleDetails = detailsResp.success ? detailsResp.data.records : [];
      const hide = message.loading('打印中，请稍等...', 6);
      const LODOP = getLodop();
      if (LODOP == undefined) {
        this.setState({ loading: false, errMsg: undefined });
        hide();
        return;
      }
      LODOP.PRINT_INIT('排车单打印');
      LODOP.SET_LICENSES("","EE0887D00FCC7D29375A695F728489A6","C94CEE276DB2187AE6B65D56B3FC2848","");
      LODOP.SET_PRINT_PAGESIZE(1, 2100, 1400, '210mm*140mm'); //1代表横的打印 2代表竖的打印 3纵向打印，宽度固定，高度按打印内容的高度自适应；
      LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 1); //去掉双面打印
      const printPagess = await this.drawPrintPage(response.data, scheduleDetails);
      this.setState({ printPage: printPagess });
      LODOP.SET_SHOW_MODE('SKIN_TYPE', 1);
      const printPages = document.getElementById('printCell').childNodes;
      printPages.forEach(page => {
        LODOP.NewPageA();
        if (dc.find(x => x == dispatchUuid) != undefined 
        || dispatchUuid =='000000750000008'
         || dispatchUuid =='000008150000005') {
          LODOP.ADD_PRINT_HTM('2%', '2%', '96%', '96%', page.innerHTML);
        } else {
          LODOP.ADD_PRINT_TABLE('2%', '2%', '96%', '96%', page.innerHTML);
        }
      });
      //TODO 测试先显示打印界面 上线前改为直接打印
      //LODOP.PREVIEW();
      LODOP.PRINT();
      //hide();
      setTimeout(() => {
        message.success('打印成功！', 5);
      }, 7000);
      this.setState({ printPage: undefined });

      this.setState({
        empId: '',
        loading: false,
        scheduleBill: response.data,
        message: '刷卡打印成功',
        // isShip: response.data.message.indexOf('装车') != -1,
      });
    } else {
      this.speech('刷卡打印失败');
      this.setState({ empId: '', loading: false, scheduleBill: {}, errMsg: response.message });
    }
  };
  drawPrintPage = (schedule, scheduleDetails) => {
    const { dispatchUuid, companyUuid,dc } = this.state;
    let scheduleDetailSum = {};
      let REALCARTONCOUNT = 0;
      let REALSCATTEREDCOUNT = 0;
      let REALCONTAINERCOUNT = 0;
      let OWECARTONCOUNT = 0;
      let CONTAINERSum = 0;
      scheduleDetails.forEach(item => {
        REALCARTONCOUNT += item.REALCARTONCOUNT;
        REALSCATTEREDCOUNT += item.REALSCATTEREDCOUNT;
        REALCONTAINERCOUNT += item.REALCONTAINERCOUNT;
        OWECARTONCOUNT += item.OWECARTONCOUNT;
        CONTAINERSum += item.REALCONTAINERCOUNT + item.OWECARTONCOUNT;
      });
      scheduleDetailSum.REALCARTONCOUNT = REALCARTONCOUNT;
      scheduleDetailSum.REALSCATTEREDCOUNT = REALSCATTEREDCOUNT;
      scheduleDetailSum.REALCONTAINERCOUNT = REALCONTAINERCOUNT;
      scheduleDetailSum.OWECARTONCOUNT = OWECARTONCOUNT;
      scheduleDetailSum.CONTAINERSum = CONTAINERSum;
      scheduleDetailSum.StoreSum = scheduleDetails.length;
      const stevedore = schedule.memberDetails
      .filter(e => e.memberType == 'DeliveryMan')
      .map(e => '[' + e.member.code + ']' + e.member.name);
    const copilot = schedule.memberDetails
      .filter(e => e.memberType == 'Copilot')
      .map(e => '[' + e.member.code + ']' + e.member.name);
    //茶山调度
    // if (dispatchUuid == '000000750000004' 
    // || dispatchUuid == '000008150000001') 
    if(dc.find(x => x == dispatchUuid) != undefined) {
      return (
        <div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
              border: 0,
              fontWeight: 'normal',
            }}
            border={1}
            cellPadding={0}
            cellSpacing={0}
          >
            <thead>
              <tr style={{ height: 50 }}>
                <th colspan={2} style={{ border: 0 }}>
                  <img style={{ height: 30, width: 120 }} src={scher} />
                </th>
                <th colspan={8} style={{ border: 0 }}>
                  <div style={{ fontSize: 18, textAlign: 'center' }}>时捷物流配送装车/出车单</div>
                </th>
                <th colspan={4} style={{ border: 0 }}>
                  <div style={{ fontSize: 14, textAlign: 'center' }}>
                    <span>第</span>
                    <font tdata="PageNO" color="blue">
                      ##
                    </font>
                    <span>页/共</span>
                    <font
                      color="blue"
                      style={{ textDecoration: 'underline blue' }}
                      tdata="PageCount"
                    >
                      ##
                    </font>
                    <span>页</span>
                  </div>
                </th>
              </tr>
              <tr>
                <th colspan={12} style={{ border: 0, height: 30 }}>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    {/* <div style={{ float: 'left', width: '25%' }}>
                        排车序号： 
                      </div> */}
                    <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      排车单号： {schedule.billNumber}
                    </div>
                    <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      车牌号： {'[' + schedule.vehicle.code + ']' + schedule.vehicle.name}
                    </div>
                    <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      码头：
                      {schedule.pirs}
                    </div>
                  </div>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      驾驶员： {'[' + schedule.carrier.code + ']' + schedule.carrier.name}
                    </div>
                    <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      送货员：
                      {stevedore.length > 0 ? stevedore.join(',') : ''}
                    </div>
                    <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                      <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                        副驾驶员： {copilot && copilot.length > 0 ? copilot.join(',') : ''}
                      </div>
                    </div>
                    <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      操作员： {loginUser().name}
                    </div>
                    <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      打印时间：
                      {convertDateToTime(new Date())}
                    </div>
                  </div>
                </th>
              </tr>
              {/* <tr>
                  <th colspan={16} style={{ border: 0, height: 20 }}>
                    <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                      <div style={{ float: 'left', width: '25%' }}>副司机： {schedule.COPILOT}</div>
                    </div>
                  </th>
                </tr> */}
              <tr>
                <th colspan={12} style={{ border: 0, height: 20 }}>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    <div style={{ float: 'left', width: '80%' }}>
                      {schedule.useETC
                        ? '粤通卡信息：请到调度窗口领取粤通卡，按规定行驶，该次费用为' +
                          schedule.etcamount +
                          '元'
                        : '粤通卡信息：'}
                      <br />
                      [线路]去程入口:
                      {schedule.etcroute}
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;回程出口:
                      {schedule.etcrouteReturn}
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;途径高速:
                      {schedule.etcrouteInfo}
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;如有异常需超额使用粤通卡的，请致电（670607）
                    </div>
                  </div>
                </th>
              </tr>
              <tr style={{ height: 25 }}>
                <th width={50} rowSpan={2}>
                  线路
                </th>
                <th width={100} rowSpan={2}>
                  零板位
                </th>
                <th width={170} rowSpan={2}>
                  门店名称
                </th>
                <th width={150} colSpan={6}>
                  送出
                </th>
                <th width={50} colSpan={1}>
                  回收
                </th>
                <th width={120} rowSpan={2}>
                  整箱板位
                </th>
                <th width={50} rowSpan={2}>
                  装车排序
                </th>
              </tr>
              <tr style={{ height: 25 }}>
                <th>整件</th>
                <th>散件</th>
                <th>周转筐</th>
                <th>欠筐数</th>
                <th>箱总数</th>
                <th>腾箱数</th>
                {/* <th>福袋数</th>
                  <th>深通卡</th>
                  <th>退货单</th>
                  <th>差异单</th> */}
                <th>箱数</th>
              </tr>
            </thead>
            <tbody>
              {scheduleDetails ? (
                scheduleDetails.map((item, index) => {
                  return (
                    <tr style={{ textAlign: 'center', height: 33}}>
                      <td width={100}>{item.ARCHLINECODE}</td>
                      <td width={80} style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                        {item.SCATTEREDCOLLECTBIN}
                      </td>
                      <td width={130}>
                        {'[' + item.DELIVERYPOINTCODE + ']' + item.DELIVERYPOINTNAME}
                      </td>
                      <td width={50}>{item.REALCARTONCOUNT}</td>
                      <td width={50}>{item.REALSCATTEREDCOUNT}</td>
                      <td width={50}>{item.REALCONTAINERCOUNT}</td>
                      <td width={50}>{item.OWECARTONCOUNT}</td>
                      <td width={50}>{item.REALCONTAINERCOUNT + item.OWECARTONCOUNT}</td>
                      <td width={50}>{}</td>
                      <td width={50}>{}</td>
                      {/* <td width={80}>{}</td>
                        <td width={80}>{}</td>
                        <td width={80}>{}</td>
                        <td width={80}>{}</td> */}
                      <td style={{ wordWrap: 'break-word', wordBreak: 'break-all' }} width={120}>
                        {item.COLLECTBIN}
                      </td>
                      <td width={50} />
                    </tr>
                  );
                })
              ) : (
                <></>
              )}
              {scheduleDetails ? (
                <tr style={{ textAlign: 'center', height: 25 }}>
                  <td width={100}>{'合计'}</td>
                  <td
                    colspan={2}
                    width={80}
                    style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
                  >
                    {scheduleDetailSum.StoreSum}
                  </td>
                  {/* <td width={120}>
              {scheduleDetailSum.StoreSum}
            </td> */}
                  <td width={50}>{scheduleDetailSum.REALCARTONCOUNT}</td>
                  <td width={50}>{scheduleDetailSum.REALSCATTEREDCOUNT}</td>
                  <td width={50}>{scheduleDetailSum.REALCONTAINERCOUNT}</td>
                  <td width={50}>{scheduleDetailSum.OWECARTONCOUNT}</td>
                  <td width={50}>{scheduleDetailSum.CONTAINERSum}</td>
                  <td width={50}>{}</td>
                  <td width={50}>{}</td>
                  {/* <td width={80}>{}</td>
            <td width={80}>{}</td>
            <td width={80}>{}</td>
            <td width={80}>{}</td> */}
                  <td style={{ wordWrap: 'break-word', wordBreak: 'break-all' }} width={120}>
                    {}
                  </td>
                  <td width={50} />
                </tr>
              ) : (
                <></>
              )}
            </tbody>
            <tfoot border={0}>
              <tr style={{ height: 20, border: 0, fontSize: '15px' }} border={0}>
                <td style={{ border: 0, paddingTop: 10 }} colSpan={8}>
                  <div style={{ paddingLeft: 20, fontWeight: 'normal' }}>
                    总体积(m³)：
                    {schedule.volume}
                  </div>
                </td>
                <td
                  style={{ border: 0, textAlign: 'right', paddingTop: 10, fontWeight: 'normal' }}
                  colSpan={8}
                >
                  <div>脏筐数：_____________</div>
                </td>
              </tr>
              <tr style={{ border: 0, height: 20 }}>
                <td style={{ border: 0, fontWeight: 'normal' }} colspan={16}>
                  单据备注: 白色~收据，红色~驾驶员、配送员，黄色~发货
                </td>
              </tr>
              <tr style={{ border: 0, height: 20 }}>
                <td style={{ border: 0, fontWeight: 'normal' }} colspan={8}>
                  驾驶/配送员签字：
                </td>
                {/* <td style={{ border: 0 }} colspan={6}>
                    收退货签字：
                  </td> */}
                <td style={{ border: 0 }} colspan={7}>
                  <div
                    border={0}
                    style={{ fontSize: 14, textAlign: 'center', fontWeight: 'normal' }}
                  >
                    <span>第</span>
                    <font tdata="PageNO" color="blue">
                      ##
                    </font>
                    <span>页/共</span>
                    <font
                      color="blue"
                      style={{ textDecoration: 'underline blue' }}
                      tdata="PageCount"
                    >
                      ##
                    </font>
                    <span>页</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    } else if (dispatchUuid == '000000750000003' || dispatchUuid == '000008110000001') {
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
                  <div style={{ fontSize: 18, textAlign: 'center' }}>
                    广东时捷物流有限公司装车单
                  </div>
                </th>
                <th colspan={2} style={{ border: 0 }}>
                  <div style={{ fontSize: 14, textAlign: 'center' }}>
                    <span>第</span>
                    <font tdata="PageNO" color="blue">
                      ##
                    </font>
                    <span>页/共</span>
                    <font
                      color="blue"
                      style={{ textDecoration: 'underline blue' }}
                      tdata="PageCount"
                    >
                      ##
                    </font>
                    <span>页</span>
                  </div>
                </th>
              </tr>
              {/* <tr>
              <th colspan={8} style={{ border: 0, height: 20 }}>
                <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                  <div style={{ float: 'left', width: '25%' }}>调度签名：</div>
                  <div style={{ float: 'left', width: '25%' }}>装车人签名：</div>
                  <div style={{ float: 'left', width: '25%' }}>
                    打印时间： {convertDateToTime(new Date())}
                  </div>
                  <div style={{ float: 'left', width: '22%' }}>制单人： {loginUser().name}</div>
                </div>
              </th>
            </tr> */}
              <tr>
                <th colspan={8} style={{ border: 0, height: 20 }}>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    <div style={{ float: 'left', width: '25%' }}>单号： {schedule.BILLNUMBER}</div>
                    <div style={{ float: 'left', width: '25%' }}>
                      车牌号： {schedule.VEHICLEPLATENUMBER}
                    </div>
                    <div style={{ float: 'left', width: '25%' }}>
                      打印时间： {convertDateToTime(new Date())}
                    </div>
                    <div style={{ float: 'left', width: '22%' }}>制单人： {loginUser().name}</div>
                    {/* <div style={{ float: 'left', width: '25%' }}>
                    送货员： {schedule.STEVEDORE || ''}
                  </div>
                  <div style={{ float: 'left', width: '25%' }} /> */}
                  </div>
                </th>
              </tr>
              <tr style={{ height: 25 }}>
                <th width={50}>序号</th>
                <th width={120}>销售单号</th>
                <th width={100}>客户编号</th>
                <th width={170}>客户名称</th>
                <th width={80}>整件</th>
                <th width={80}>散件</th>
                <th width={80}>板位</th>
                <th width={60}>备注</th>
              </tr>
            </thead>
            <tbody>
              {scheduleDetails ? (
                scheduleDetails.map((item, index) => {
                  return (
                    <tr style={{ textAlign: 'center', height: 20 }}>
                      <td width={50}>{index + 1}</td>
                      <td width={120}>{item.SOURCENUM}</td>
                      <td width={100}>{item.DELIVERYPOINTCODE}</td>
                      <td width={170}>{item.DELIVERYPOINTNAME}</td>
                      <td width={80}>{item.REALCARTONCOUNT}</td>
                      <td width={80}>{item.REALSCATTEREDCOUNT}</td>
                      <td width={80}>{item.COLLECTBIN}</td>
                      <td width={60}>{item.NOTE || ''}</td>
                    </tr>
                  );
                })
              ) : (
                <></>
              )}
            </tbody>
            <tfoot>
              <tr style={{ height: 20 }}>
                <td colspan={4}>合计:</td>
                <td style={{ textAlign: 'center' }}>
                  <font color="blue" tdata="AllSum" format="#,##" tindex="5">
                    ######
                  </font>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <font color="blue" tdata="AllSum" format="#,##" tindex="6">
                    ######
                  </font>
                </td>
                <td colspan={2} />
              </tr>
              <tr style={{ height: 20 }}>
                <td colspan={8}>
                  备注：
                  {schedule.NOTE}
                </td>
              </tr>
              <tr style={{ height: 25 }}>
                <td colspan={8} style={{ border: 0 }}>
                  <div style={{ float: 'left', width: '25%' }}>装车员:</div>
                  <div style={{ float: 'left', width: '25%' }}>司机:</div>
                  <div style={{ float: 'left', width: '25%' }}> 送货员:</div>
                  <div style={{ float: 'left', width: '22%' }}>调度:</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    } else if ( dispatchUuid =='000000750000008' || dispatchUuid =='000008150000005'){
        let scheduleDetailSum = {};
        let REALCARTONCOUNT = 0;
        let REALSCATTEREDCOUNT = 0;
        let REALCONTAINERCOUNT = 0;
        let OWECARTONCOUNT = 0;
        let CONTAINERSum = 0;
        let cartonCounts = 0;
        let REALCOLDCONTAINERCOUNT = 0;
        let REALFREEZECONTAINERCOUNT = 0;
        let sds = [];
        scheduleDetails.forEach(e=>{
          let data = sds.find(f=>f.DELIVERYPOINTCODE == e.DELIVERYPOINTCODE);
          if(data){
            data.REALCARTONCOUNT = data.REALCARTONCOUNT+e.REALCARTONCOUNT;
            data.REALSCATTEREDCOUNT =  data.REALSCATTEREDCOUNT+e.REALSCATTEREDCOUNT;
            data.REALCONTAINERCOUNT = data.REALCONTAINERCOUNT+e.REALCONTAINERCOUNT;
            data.REALCOLDCONTAINERCOUNT = data.REALCOLDCONTAINERCOUNT+e.REALCOLDCONTAINERCOUNT;
            data.REALFREEZECONTAINERCOUNT = data.REALFREEZECONTAINERCOUNT+e.REALFREEZECONTAINERCOUNT;
            const index =  sds.map(g=>g.DELIVERYPOINTCODE).indexOf(e.DELIVERYPOINTCODE)
            sds.splice(index,1,data);
          }else{
            let fs ={}; 
            fs.DELIVERYPOINTCODE = e.DELIVERYPOINTCODE;
            fs.REALCARTONCOUNT = e.REALCARTONCOUNT;
            fs.OWNERNAME = e.OWNERNAME;
            fs.REALSCATTEREDCOUNT = e.REALSCATTEREDCOUNT;
            fs.COLLECTBIN = e.COLLECTBIN;
            fs.DELIVERYPOINTNAME = e.DELIVERYPOINTNAME;
            fs.REALCONTAINERCOUNT = e.REALCONTAINERCOUNT
            fs.REALCOLDCONTAINERCOUNT = e.REALCOLDCONTAINERCOUNT;
            fs.REALFREEZECONTAINERCOUNT = e.REALFREEZECONTAINERCOUNT
            sds.push(fs);
          }
        })
        scheduleDetails.forEach(item => {
          REALCARTONCOUNT += item.REALCARTONCOUNT;
          REALSCATTEREDCOUNT += item.REALSCATTEREDCOUNT;
          REALCONTAINERCOUNT += item.REALCONTAINERCOUNT;

         REALCOLDCONTAINERCOUNT+=(!item.REALCOLDCONTAINERCOUNT?0:item.REALCOLDCONTAINERCOUNT);
         REALFREEZECONTAINERCOUNT+=(!item.REALFREEZECONTAINERCOUNT?0:item.REALFREEZECONTAINERCOUNT);
        CONTAINERSum += item.REALCONTAINERCOUNT + item.OWECARTONCOUNT;
        cartonCounts += (!item.REALCONTAINERCOUNT?0:item.REALCONTAINERCOUNT)
        +(!item.REALCOLDCONTAINERCOUNT?0:item.REALCOLDCONTAINERCOUNT)+(!item.REALFREEZECONTAINERCOUNT?0:item.REALFREEZECONTAINERCOUNT)
        });
        scheduleDetailSum.REALCARTONCOUNT = REALCARTONCOUNT;
        scheduleDetailSum.REALSCATTEREDCOUNT = REALSCATTEREDCOUNT;
        scheduleDetailSum.REALCONTAINERCOUNT = REALCONTAINERCOUNT;
        scheduleDetailSum.OWECARTONCOUNT = OWECARTONCOUNT;
        scheduleDetailSum.CONTAINERSum = CONTAINERSum;
        scheduleDetailSum.StoreSum = scheduleDetails.length;
        scheduleDetailSum.cartonCounts = cartonCounts;
        scheduleDetailSum.REALCOLDCONTAINERCOUNT = REALCOLDCONTAINERCOUNT;
        scheduleDetailSum.REALFREEZECONTAINERCOUNT = REALFREEZECONTAINERCOUNT;
        const stevedore = schedule.memberDetails
        .filter(e => e.memberType == 'DeliveryMan')
        .map(e => '[' + e.member.code + ']' + e.member.name);
        return (
          <div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12,
                border: 0,
                fontWeight: 'normal',
              }}
              border={1}
              cellPadding={0}
              cellSpacing={0}
            >
              <thead>
                <tr style={{ height: 50 }}>
                  <th colspan={2} style={{ border: 0 }}>
                    <img style={{ height: 30, width: 120 }} src={scher} />
                  </th>
                  <th colspan={8} style={{ border: 0 }}>
                    <div style={{ fontSize: 18, textAlign: 'center' }}>时捷物流配送装车/出车单</div>
                  </th>
                  <th colspan={4} style={{ border: 0 }}>
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
                  <th colspan={14} style={{ border: 0, height: 27 }}>
                    <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                      <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                        排车单号： {schedule.billNumber}
                      </div>
                      <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                        车牌号： {'[' + schedule.vehicle.code + ']' +schedule.vehicle.name}
                      </div>
                      <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                        驾驶员： {'[' + schedule.carrier.code + ']' + schedule.carrier.name}
                      </div>
                      <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                        送货员:
                        {stevedore.length > 0 ? stevedore.join(',') : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'left', fontWeight: 'normal' ,marginTop:'2' }}>
                      <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                        操作员： {loginUser().name}
                      </div>
                      <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                        打印时间：
                        {convertDateToTime(new Date())}
                      </div>
                      <div style={{ float: 'left', width: '50%', fontWeight: 'normal' }}>
                        注：周转箱:蓝色,冷藏箱:绿色,冷冻箱:灰色
                      </div>
                    </div>
                  </th>
                </tr>
                {/* <tr>
                  <th colspan={16} style={{ border: 0, height: 20 }}>
                    <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                      <div style={{ float: 'left', width: '25%' }}>副司机： {schedule.COPILOT}</div>
                    </div>
                  </th>
                </tr> */}
                <tr>
                  <th colspan={14} style={{ border: 0, height: 20 }}>
                    <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                      <div style={{ float: 'left', width: '80%' }}>
                        {schedule.useETC == '是'
                          ? 'ETC信息：请到调度窗口领取ETC卡，按规定行驶，该次费用为' +
                          schedule.ETCAmount +
                          '元'
                          : 'ETC信息：'}
                        <br />
                        [线路]去程入口:
                        {schedule.ETCRoute}
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;回程出口:
                        {schedule.ETCRouteReturn}
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;途径高速:
                        {schedule.ETCRouteInfo}
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;如有异常需超额使用ETC卡的，请致电（670607）
                      </div>
                    </div>
                  </th>
                </tr>
                <tr style={{ height: 25 }}>
                  <th rowSpan={2} width={30}>
                    序号
                  </th>
                  <th width={50}  rowSpan={2}>委托方</th>
                  <th width={100} rowSpan={2}>
                    门店名称
                  </th>
                  <th width={170} colSpan={7}>
                    送出
                  </th>
                  <th width={50} colSpan={1}>
                    回收
                  </th>
                  <th width={120} rowSpan={2}>
                    整箱板位
                  </th>
                  <th width={120} rowSpan={2}>
                    零板位
                  </th>
                  <th width={50} rowSpan={2}>
                    装车排序
                  </th>
                </tr>
                <tr style={{ height: 25 }}>
                  <th>整件</th>
                  <th>散件</th>
                  <th>周转箱</th>
                  <th>冷冻箱</th>
                  <th>保温箱</th>
                  <th>箱总数</th>
                  <th>腾筐</th>
                  {/* <th>福袋数</th>
                  <th>深通卡</th>
                  <th>退货单</th>
                  <th>差异单</th> */}
                  {/* <th>周转</th>
                  <th>冷藏</th>
                  <th>冷冻</th> */}
                  <th>箱总数</th>
                </tr>
              </thead>
              <tbody>
                {sds ? (
                  sds.map((item, index) => {
                    return (
                      <tr style={{ textAlign: 'center', height: 33 }}>
                        <td width={30}>{index+1}</td>
                        <td width={50}>{item.OWNERNAME}</td>
                        <td width={130}>
                          {'[' + item.DELIVERYPOINTCODE + ']' + item.DELIVERYPOINTNAME}
                        </td>
                        <td width={50}>{item.REALCARTONCOUNT}</td>
                        <td width={50}>{item.REALSCATTEREDCOUNT}</td>
                        <td width={50}>{item.REALCONTAINERCOUNT}</td>
                        <td width={50}>{!item.REALFREEZECONTAINERCOUNT?0:item.REALFREEZECONTAINERCOUNT}</td>
                        <td width={50}>{!item.REALCOLDCONTAINERCOUNT?0:item.REALCOLDCONTAINERCOUNT}</td>
                        <td width={50}>{(!item.REALCONTAINERCOUNT?0:item.REALCONTAINERCOUNT)+
                      (!item.REALFREEZECONTAINERCOUNT?0:item.REALFREEZECONTAINERCOUNT)+(!item.REALCOLDCONTAINERCOUNT?0:item.REALCOLDCONTAINERCOUNT)
                    }</td>                        <td width={50}>{0}</td>
                        
                        {/* <td width={50}>{0}</td>
                        <td width={50}>{0}</td> */}
                        <td width={50}>{}</td>
                        <td style={{ wordWrap: 'break-word', wordBreak: 'break-all' }} width={120}>
                          {item.COLLECTBIN}
                        </td>
                        <td width={80} style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                          {item.SCATTEREDCOLLECTBIN}
                        </td>
                        <td width={50}>{ }</td>
                        
                      </tr>
                    );
                  })
                ) : (
                  <></>
                )}
                {scheduleDetails ? (
                  <tr style={{ textAlign: 'center', height: 25 }}>
                    <td width={80} colSpan={2}>{'合计'}</td>
                    <td
                     
                      width={80}
                      style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
                    >
                      {scheduleDetailSum.StoreSum}
                    </td>
                    {/* <td width={120}>
                  {scheduleDetailSum.StoreSum}
                </td> */}
                    <td width={50}>{scheduleDetailSum.REALCARTONCOUNT}</td>
                    <td width={50}>{scheduleDetailSum.REALSCATTEREDCOUNT}</td>
                    <td width={50}>{scheduleDetailSum.REALCONTAINERCOUNT}</td>
                    <td width={50}>{scheduleDetailSum.REALFREEZECONTAINERCOUNT}</td>
                    <td width={50}>{scheduleDetailSum.REALCOLDCONTAINERCOUNT}</td>
                    <td width={50}>{scheduleDetailSum.cartonCounts}</td>
                    <td width={50}>{ }</td>
                   
                    {/* <td width={50}>{ }</td>
                    <td  width={50}>
                      { }
                    </td> */}
                    <td  width={50}>
                      {}
                    </td>
                    <td  width={120}>
                      { }
                    </td>
                    <td  width={120}>
                      { }
                    </td>
                    <td  width={50}>
                      { }
                    </td>
                    
                    
                  </tr>
                ) : (
                  <></>
                )}
                  {
                  <tr style={{ textAlign: 'left', height: 25 }}>
                  <td colSpan={2} width={80}>总配货额：{0}</td>
                  <td
                    width={80}
                    colSpan={5}
                    style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
                  >
                   最远市区:{}
                  </td>
                  <td width={50} colSpan={3}>满载率:{schedule.cubedOut*100}%</td>
                  <td width={50} colSpan={2}> 体积(方):{schedule.volume.toFixed(2)}</td>
                  <td width={50} colSpan={4}>重量:{(schedule.weight/1000).toFixed(2)}</td>
                </tr>
              }
              </tbody>
              <tfoot border={0}>
              <tr style={{ border: 0, height: 20 }}>
                <td style={{ border: 0, fontWeight: 'normal' }} colspan={16}>
                  单据备注: 白色~收据，红色~驾驶员、配送员，黄色~发货
                </td>
              </tr>
              <tr>
              <td style={{ border: 0, fontWeight: 'normal' }} colspan={8}>
                排车单备注：{schedule.NOTES}
                </td>
              </tr>
              <tr><td  style = {{border: 0, fontWeight: 'normal',textAlign: 'center'}} colSpan={16}>总计周转箱(蓝)________总计回冷藏箱(绿)__________  总计回冷冻箱(灰)_________</td></tr>
              <tr style={{ border: 0, height: 20 }}>
                <td style={{ border: 0, fontWeight:'bold' }} colspan={12}>
                注：现金高速路桥、停车费报销每月5号前必须清除掉上月的票据报销，逾期不报销
                </td>
                 {/* <td style={{ border: 0 }} colspan={6}>
                  收退货签字：
                </td> */} 
                <td style={{ border: 0 }} colspan={5}>
                  <div border={0} style={{ fontSize: 14, textAlign: 'center', fontWeight: 'normal' }}>
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
                </td> 
              </tr>
              </tfoot>
            </table>
          </div>
        );
    } else {
      return (
        <div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
              border: 0,
              fontWeight: 'bold',
            }}
            border={1}
            cellPadding={0}
            cellSpacing={0}
          >
            <thead>
              <tr style={{ height: 50 }}>
                <th colspan={2} style={{ border: 0 }}>
                  <img style={{ height: 30, width: 120 }} src={scher} />
                </th>
                <th colspan={10} style={{ border: 0 }}>
                  <div style={{ fontSize: 18, textAlign: 'center' }}>时捷物流配送装车/出车单</div>
                </th>
                <th colspan={4} style={{ border: 0 }}>
                  <div style={{ fontSize: 14, textAlign: 'center' }}>
                    <span>第</span>
                    <font tdata="PageNO" color="blue">
                      ##
                    </font>
                    <span>页/共</span>
                    <font
                      color="blue"
                      style={{ textDecoration: 'underline blue' }}
                      tdata="PageCount"
                    >
                      ##
                    </font>
                    <span>页</span>
                  </div>
                </th>
              </tr>
              {/* <tr>
                  <th colspan={8} style={{ border: 0, height: 20 }}>
                    <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                      <div style={{ float: 'left', width: '25%' }}>调度签名：</div>
                      <div style={{ float: 'left', width: '25%' }}>装车人签名：</div>
                      <div style={{ float: 'left', width: '25%' }}>
                        打印时间： {convertDateToTime(new Date())}
                      </div>
                      <div style={{ float: 'left', width: '22%' }}>制单人： {loginUser().name}</div>
                    </div>
                  </th>
                </tr> */}
              <tr>
                <th colspan={16} style={{ border: 0, height: 20 }}>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    <div style={{ float: 'left', width: '25%' }}>排车序号：</div>
                    <div style={{ float: 'left', width: '25%' }}>操作员： {loginUser().name}</div>
                    <div style={{ float: 'left', width: '25%' }}>
                      驾驶员： {'[' + schedule.carrier.code + ']' + schedule.carrier.name}
                    </div>
                    <div style={{ float: 'left', width: '25%' }}>
                      排车单号： {schedule.billNumber}
                    </div>
                  </div>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    <div style={{ float: 'left', width: '25%' }}>
                      车号： {'[' + schedule.vehicle.code + ']' + schedule.vehicle.name}
                    </div>
                    <div style={{ float: 'left', width: '25%' }}>
                      信箱号：
                      {schedule.pirs}
                    </div>
                    <div style={{ float: 'left', width: '25%' }}>
                      装车员：
                      {stevedore && stevedore.length > 0 ? stevedore.join(',') : ''}
                    </div>
                    <div style={{ float: 'left', width: '25%' }}>
                      打印时间：
                      {convertDateToTime(new Date())}
                    </div>
                  </div>
                </th>
              </tr>
              <tr>
                <th colspan={16} style={{ border: 0, height: 20 }}>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    <div style={{ float: 'left', width: '25%' }}>
                      副司机： {copilot.length > 0 ? copilot.join(',') : ''}
                    </div>
                  </div>
                </th>
              </tr>
              <tr>
                <th colspan={16} style={{ border: 0, height: 20 }}>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    <div style={{ float: 'left', width: '80%' }}>
                      {schedule.useetc
                        ? '粤通卡信息：请到调度窗口领取粤通卡，按规定行驶，该次费用为' +
                          schedule.etcamount +
                          '元'
                        : '粤通卡信息：'}
                      <br />
                      [线路]去程入口:
                      {schedule.etcroute}
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;回程出口:
                      {schedule.etcrouteReturn}
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;途径高速:
                      {schedule.ETCROUTEINFO}
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;如有异常需超额使用粤通卡的，请致电（670607）
                    </div>
                  </div>
                </th>
              </tr>
              <tr style={{ height: 25 }}>
                <th width={50} rowSpan={2}>
                  线路
                </th>
                <th width={50} rowSpan={2}>
                  零板位
                </th>
                <th width={50} rowSpan={2}>
                  门店名称
                </th>
                <th width={170} colSpan={8}>
                  送出
                </th>
                <th width={170} colSpan={3}>
                  回收
                </th>
                <th width={50} rowSpan={2}>
                  整箱板位
                </th>
                <th width={50} rowSpan={2}>
                  电商
                </th>
              </tr>
              <tr style={{ height: 25 }}>
                <th>整件</th>
                <th>散件</th>
                <th>周转筐</th>
                <th>欠筐数</th>
                <th>箱总数</th>
                <th>腾箱数</th>
                <th>福袋数</th>
                <th>深通卡</th>
                <th>退货单</th>
                <th>差异单</th>
                <th>箱数</th>
              </tr>
            </thead>
            <tbody>
              {scheduleDetails ? (
                scheduleDetails.map((item, index) => {
                  return (
                    <tr style={{ textAlign: 'center', height: 20 }}>
                      <td width={100}>{item.ARCHLINECODE}</td>
                      <td width={80}>{item.SCATTEREDCOLLECTBIN}</td>
                      <td width={120}>
                        {'[' + item.DELIVERYPOINTCODE + ']' + item.DELIVERYPOINTNAME}
                      </td>
                      <td width={80}>{item.REALCARTONCOUNT}</td>
                      <td width={80}>{item.REALSCATTEREDCOUNT}</td>
                      <td width={80}>{item.REALCONTAINERCOUNT}</td>
                      <td width={80}>{0}</td>
                      <td width={80}>{item.REALCONTAINERCOUNT + 0}</td>
                      <td width={80}>{}</td>
                      <td width={80}>{}</td>
                      <td width={80}>{}</td>
                      <td width={80}>{}</td>
                      <td width={80}>{}</td>
                      <td width={80}>{}</td>
                      <td width={100}>{item.COLLECTBIN}</td>
                      <td width={60}>{0}</td>
                    </tr>
                  );
                })
              ) : (
                <></>
              )}
            </tbody>
            <tfoot border={0}>
              <tr style={{ height: 20, border: 0, fontSize: '15px' }} border={0}>
                <td style={{ border: 0, paddingTop: 10 }} colSpan={8}>
                  <div style={{ paddingLeft: 20 }}>
                    总体积(m³)：
                    {schedule.volume}
                  </div>
                </td>
                <td style={{ border: 0, textAlign: 'right', paddingTop: 10 }} colSpan={8}>
                  <div>脏筐数：_____________</div>
                </td>
              </tr>
              <tr style={{ border: 0, height: 20 }}>
                <td style={{ border: 0 }} colspan={16}>
                  单据备注: 白色~收据，红色~驾驶员、配送员，黄色~发货
                </td>
                {/* <td style={{ textAlign: 'center' }}>
                    <font color="blue" tdata="AllSum" format="#,##" tindex="5">
                      ######
                    </font>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <font color="blue" tdata="AllSum" format="#,##" tindex="6">
                      ######
                    </font>
                  </td>
                  <td colspan={2} /> */}
              </tr>
              <tr style={{ border: 0, height: 20 }}>
                <td style={{ border: 0 }} colspan={6}>
                  驾驶/配送员签字：
                </td>
                <td style={{ border: 0 }} colspan={6}>
                  收退货签字：
                </td>
                <td style={{ border: 0 }} colspan={4}>
                  <div border={0} style={{ fontSize: 14, textAlign: 'center' }}>
                    <span>第</span>
                    <font tdata="PageNO" color="blue">
                      ##
                    </font>
                    <span>页/共</span>
                    <font
                      color="blue"
                      style={{ textDecoration: 'underline blue' }}
                      tdata="PageCount"
                    >
                      ##
                    </font>
                    <span>页</span>
                  </div>
                </td>
              </tr>
              {/* <tr style={{ height: 20 }}>
                  <td colspan={8}>
                    备注：
                    {schedule.NOTE}
                  </td>
                </tr>
                <tr style={{ height: 25 }}>
                  <td colspan={8} style={{ border: 0 }}>
                    <div style={{ float: 'left', width: '25%' }}>装车员:</div>
                    <div style={{ float: 'left', width: '25%' }}>司机:</div>
                    <div style={{ float: 'left', width: '25%' }}> 送货员:</div>
                    <div style={{ float: 'left', width: '22%' }}>调度:</div>
                  </td>
                </tr> */}
            </tfoot>
          </table>
        </div>
      );
    }
  };

  render() {
    const {
      loading,
      dict,
      empId,
      scheduleBill,
      errMsg,
      message,
      isShip,
      dispatchName,
      printPage,
    } = this.state;
    return (
      <div style={{ height: '100vh' }} onClick={() => this.empInputRef.focus()}>
        <div id="printCell" style={{ display: 'none' }}>
          {printPage}
        </div>
        <Spin indicator={LoadingIcon('default')} spinning={loading} size="large">
          <div
            style={{
              height: 100,
              lineHeight: '100px',
              borderBottom: '1px solid #e8e8e8',
            }}
          >
            <div style={{ float: 'left', width: '15%', paddingLeft: 24 }}>
              <Select
                placeholder="请选择调度中心"
                onChange={val => {
                  const item = dict.find(x => x.itemValue == val);
                  localStorage.setItem('dispatchUuid', val);
                  localStorage.setItem('dispatchName', item.itemText);
                  localStorage.setItem('companyUuid', item.description);
                  this.setState({
                    dispatchUuid: val,
                    dispatchName: item.itemText,
                    companyUuid: item.description,
                  });
                }}
                value={dispatchName}
                allowClear={true}
                style={{ width: '100%' }}
              >
                {dict.map(d => {
                  return <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>;
                })}
              </Select>
            </div>
            {/* <div style={{ float: 'left', width: '8%', marginLeft: '1%' }}>
              <Checkbox>锁定</Checkbox>
            </div> */}

            <div
              style={{
                fontSize: 55,
                fontWeight: 'normal',
                textAlign: 'center',
                marginRight: '15%',
                color: dispatchName == undefined ? 'red' : 'black',
              }}
            >
              {dispatchName == undefined ? '请选择调度中心' : dispatchName + '打印装车单'}
            </div>
          </div>

          {/* <div
            style={{
              height: 50,
              lineHeight: '50px',
              fontSize: 16,
              fontWeight: 800,
              color: '#363e4b',
              paddingLeft: 24,
              borderBottom: '1px solid #e8e8e8',
            }}
          >
            司机刷卡
          </div> */}
          <div style={{ fontSize: 16, textAlign: 'center' }}>
            工号：
            <Input
              style={{
                width: 250,
                height: 40,
                fontSize: 16,
                margin: 15,
              }}
              value={empId}
              ref={input => (this.empInputRef = input)}
              onChange={event => this.setState({ empId: event.target.value })}
              onPressEnter={this.onSubmit}
              placeholder={'输入员工代码'}
            />
          </div>
          <Card
            title="刷卡结果"
            bordered={true}
            style={{ height: '35vh', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
            bodyStyle={{
              height: '25vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {errMsg ? (
              <div style={{ color: '#F5222D', fontSize: '45px', margin: 'auto' }}>{errMsg}</div>
            ) : isShip ? (
              <div style={{ color: '#00DD00', fontSize: '45px', margin: 'auto' }}>{message}</div>
            ) : (
              <div style={{ color: '#1354DA', fontSize: '45px', margin: 'auto' }}>{message}</div>
            )}
          </Card>
          <Card
            title="排车单信息"
            style={{ height: 250, marginTop: 20, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
          >
            <Row gutter={[4, 28]}>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  排车单号：
                  {scheduleBill.billNumber ? scheduleBill.billNumber : <Empty />}
                </span>
              </Col>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  车牌号：
                  {scheduleBill.vehicle ? scheduleBill.vehicle.name : <Empty />}
                </span>
              </Col>
              {/* <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  重量(t)：
                  {scheduleBill.weight ? scheduleBill.weight : <Empty />}
                </span>
              </Col> */}
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  体积(m³)：
                  {scheduleBill.volume ? scheduleBill.volume : <Empty />}
                </span>
              </Col>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  驾驶员：
                  {scheduleBill.carrier ? (
                    '[' + scheduleBill.carrier.code + ']' + scheduleBill.carrier.name
                  ) : (
                    <Empty />
                  )}
                </span>
              </Col>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  出车时间：
                  {scheduleBill.dispatchTime ? scheduleBill.dispatchTime : <Empty />}
                </span>
              </Col>
              <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  回车时间：
                  {scheduleBill.returnTime ? scheduleBill.returnTime : <Empty />}
                </span>
              </Col>
            </Row>
          </Card>
        </Spin>
      </div>
    );
  }
}
