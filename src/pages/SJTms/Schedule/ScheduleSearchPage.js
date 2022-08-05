/*
 * @Author: guankongjin
 * @Date: 2022-06-29 16:26:59
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-08-03 10:14:45
 * @Description: 排车单列表
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\ScheduleSearchPage.js
 */
import { connect } from 'dva';
import { Dropdown, Menu, Icon, Button, message, Popconfirm, Modal, Form, InputNumber } from 'antd';
import { convertDate, convertDateToTime } from '@/utils/utils';
import { loginUser } from '@/utils/LoginContext';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { queryAllData } from '@/services/quick/Quick';
import { aborted, shipRollback } from '@/services/sjitms/ScheduleBill';
import { depart, back } from '@/services/sjitms/ScheduleProcess';
import { getLodop } from '@/pages/Component/Printer/LodopFuncs';
import { groupBy, sumBy, orderBy } from 'lodash';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class ScheduleSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    returnMileageModal: false,
    returnMileage: 0,
    showRollBackPop: false,
    showAbortPop: false,
    minHeight: '50vh',
    isNotHd: true,
  };

  drawTopButton = () => {
    const { returnMileageModal, printPage } = this.state;
    return (
      <>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <div id="printPage" style={{ display: 'none' }}>
          {printPage}
        </div>
        <Modal
          width="20%"
          title={'回车里程数录入'}
          onOk={() => this.onBack()}
          visible={returnMileageModal}
          onCancel={() => this.setState({ returnMileageModal: false })}
          destroyOnClose={true}
        >
          <Form>
            <Form.Item label="回车里程数" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <InputNumber
                placeholder="请输入回车里程数"
                onChange={this.onReturnMileageChange}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedRows != this.props.selectedRows) {
      this.queryCoulumns();
    }
  }
  handleOnRow = record => {
    return {
      onClick: () => {
        this.props.refreshSelectedRow(record);
      },
    };
  };

  //添加操作列
  drawExColumns = e => {
    const editableState = ['Saved', 'Approved', 'Shipping', 'Shiped'];
    if (e.column.fieldName == 'BILLNUMBER') {
      return {
        title: '操作',
        width: 60,
        render: (_, record) => {
          return (
            <a
              disabled={!editableState.includes(record.STAT)}
              onClick={() => {
                this.props.memberModalClick(record);
              }}
            >
              编辑
            </a>
          );
        },
      };
    }
  };

  handleMenuClick = e => {
    this.handlePrint(e.key);
  };

  //按钮面板
  drawToolsButton = () => {
    const { selectedRows, showRollBackPop, showAbortPop } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="load">装车单</Menu.Item>
        <Menu.Item key="out">出车单</Menu.Item>
      </Menu>
    );
    return (
      <>
        <Popconfirm
          title="确定取消批准选中排车单?"
          visible={showRollBackPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showRollBackPop: visible });
          }}
          onCancel={() => {
            this.setState({ showRollBackPop: false });
          }}
          onConfirm={() => {
            this.setState({ showRollBackPop: false });
            this.onRollBack(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('取消批准成功！');
                this.queryCoulumns();
              }
            });
          }}
        >
          <Button onClick={() => this.onBatchRollBack()}>取消批准</Button>
        </Popconfirm>
        <Popconfirm
          title="确定作废选中排车单?"
          visible={showAbortPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showAbortPop: visible });
          }}
          onCancel={() => {
            this.setState({ showAbortPop: false });
          }}
          onConfirm={() => {
            this.setState({ showAbortPop: false });
            this.onAbort(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('作废成功！');
                this.queryCoulumns();
              }
            });
          }}
        >
          <Button onClick={() => this.onBatchAbort()}>作废</Button>
        </Popconfirm>
        <Button onClick={() => this.onMoveCar()}>移车</Button>
        <Dropdown overlay={menu}>
          <Button onClick={() => this.handlePrint()} icon="printer">
            打印 <Icon type="down" />
          </Button>
        </Dropdown>
        <Popconfirm title="确定发运选中排车单?" onConfirm={this.handleDepart}>
          <Button type="primary" ghost>
            发运
          </Button>
        </Popconfirm>
        <Button type="danger" ghost onClick={this.handleBack}>
          回厂
        </Button>
      </>
    );
  };

  //批量取消批准
  onBatchRollBack = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showRollBackPop: true })
      : this.batchProcessConfirmRef.show(
          '取消批准',
          selectedRows,
          this.onRollBack,
          this.queryCoulumns
        );
  };

  //批量作废
  onBatchAbort = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showAbortPop: true })
      : this.batchProcessConfirmRef.show('作废', selectedRows, this.onAbort, this.queryCoulumns);
  };

  //移车
  onMoveCar = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 1) {
      this.props.removeCarModalClick(selectedRows);
    } else message.warn('请选中一条数据！');
  };

  //回滚
  onRollBack = async record => {
    return await shipRollback(record.UUID);
  };

  //作废
  onAbort = async record => {
    return await aborted(record.UUID);
  };

  //发运
  handleDepart = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 1) {
      const response = await depart(selectedRows[0].BILLNUMBER, selectedRows[0].FVERSION);
      if (response.success) {
        message.success('发运成功！');
        this.queryCoulumns();
      }
    } else message.warn('请选中一条数据！');
  };

  handleBack = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 1) {
      this.setState({ returnMileageModal: true, returnMileage: 0 });
    } else message.warn('请选中一条数据！');
  };
  onReturnMileageChange = returnMileage => {
    this.setState({ returnMileage });
  };
  //回厂
  onBack = async () => {
    const { returnMileage, selectedRows } = this.state;
    const response = await back(
      selectedRows[0].BILLNUMBER,
      selectedRows[0].FVERSION,
      returnMileage
    );
    if (response.success) {
      message.success('回厂成功！');
      this.queryCoulumns();
    }
    this.setState({ returnMileageModal: false, returnMileage: 0 });
  };

  //打印
  handlePrint = async key => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择需要打印的排车单！');
      return;
    }
    const hide = message.loading('加载中...', 0);
    const LODOP = getLodop();
    if (LODOP == undefined) return;
    LODOP.PRINT_INIT('排车单打印');
    LODOP.SET_PRINT_PAGESIZE(1, 2100, 1400, '210mm*140mm'); //1代表横的打印 2代表竖的打印 3纵向打印，宽度固定，高度按打印内容的高度自适应；
    LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 1); //去掉双面打印
    key == 'load' ? await this.buildPrintPage() : await this.buildSchedulePrintPage();
    if (key != 'load') LODOP.SET_SHOW_MODE('SKIN_TYPE', 1);
    const printPages = document.getElementById('printPage').childNodes;
    printPages.forEach(page => {
      LODOP.NewPageA();
      LODOP.ADD_PRINT_TABLE('2%', '2%', '96%', '96%', page.innerHTML);
    });
    LODOP.PREVIEW();
    hide();
    this.setState({ printPage: undefined });
  };

  //出车单
  buildSchedulePrintPage = async () => {
    const { selectedRows } = this.state;
    const printPages = [];
    for (let index = 0; selectedRows.length > index; index++) {
      const response = await queryAllData({
        quickuuid: 'sj_itms_print_schedule_order',
        superQuery: {
          queryParams: [
            { field: 'billuuid', type: 'VarChar', rule: 'eq', val: selectedRows[index].UUID },
          ],
        },
      });
      const memberWageResponse = await queryAllData({
        quickuuid: 'sj_itms_member_wage',
        superQuery: {
          queryParams: [
            {
              field: 'billnumber',
              type: 'VarChar',
              rule: 'eq',
              val: selectedRows[index].BILLNUMBER,
            },
          ],
        },
      });
      let scheduleDetails = response.success ? response.data.records : [];
      scheduleDetails = orderBy(scheduleDetails, x => x.DELIVERYPOINTCODE);
      let memberWage = memberWageResponse.success ? memberWageResponse.data.records : [];
      if (memberWage) {
        memberWage = memberWage.filter(x => x.AMOUNT);
        let output = groupBy(memberWage, x => x.MEMBERNAME);
        memberWage = Object.keys(output).map(member => {
          const wages = output[member];
          return {
            memberName: member,
            wage: Math.round(sumBy(wages, 'AMOUNT') * 1000) / 1000,
          };
        });
      }
      const printPage = drawScheduleBillPage(selectedRows[index], scheduleDetails, memberWage);
      printPages.push(printPage);
    }
    this.setState({ printPage: printPages });
  };

  //装车单
  buildPrintPage = async () => {
    const { selectedRows } = this.state;
    const printPages = [];
    for (let index = 0; selectedRows.length > index; index++) {
      const response = await queryAllData({
        quickuuid: 'sj_itms_print_schedule_order',
        superQuery: {
          queryParams: [
            { field: 'billuuid', type: 'VarChar', rule: 'eq', val: selectedRows[index].UUID },
          ],
        },
      });
      let scheduleDetails = response.success ? response.data.records : [];
      scheduleDetails = orderBy(scheduleDetails, x => x.DELIVERYPOINTCODE);
      const printPage = drawPrintPage(selectedRows[index], scheduleDetails);
      printPages.push(printPage);
    }
    this.setState({ printPage: printPages });
  };
}
//出车单
const drawScheduleBillPage = (schedule, scheduleDetails, memberWage) => {
  const driver = schedule.DRIVER ? schedule.DRIVER.substr(schedule.DRIVER.indexOf(']') + 1) : '';
  const stevedore = schedule.STEVEDORE
    ? schedule.STEVEDORE.substr(schedule.STEVEDORE.indexOf(']') + 1)
    : '';
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
              <div style={{ fontSize: 18, textAlign: 'center' }}>广东时捷物流有限公司出车单</div>
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
            <th colspan={8} style={{ border: 0, height: 25 }}>
              <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                <div style={{ float: 'left', width: '28%' }}>出车单号： {schedule.BILLNUMBER}</div>
                <div style={{ float: 'left', width: '25%' }}>
                  车牌号： {schedule.VEHICLEPLATENUMBER}
                </div>
                <div style={{ float: 'left', width: '22%' }}>司机: {driver}</div>
                <div style={{ float: 'left', width: '20%' }}>送货员： {stevedore}</div>
              </div>
            </th>
          </tr>

          <tr style={{ height: 25 }}>
            <th width={120}>单号</th>
            <th width={80}>单据类别</th>
            <th width={100}>客户编号</th>
            <th width={170}>客户名称</th>
            <th width={60}>整件</th>
            <th width={60}>散件</th>
            <th width={80}>差异单号</th>
            <th width={80}>备注</th>
          </tr>
        </thead>
        <tbody>
          {scheduleDetails ? (
            scheduleDetails.map(item => {
              return (
                <tr style={{ textAlign: 'center', height: 20 }}>
                  <td width={120}>{item.SOURCENUM}</td>
                  <td width={80}>{item.BILLTYPE}</td>
                  <td width={100}>{item.DELIVERYPOINTCODE}</td>
                  <td width={170}>{item.DELIVERYPOINTNAME}</td>
                  <td width={60}>{item.REALCARTONCOUNT}</td>
                  <td width={60}>{item.REALSCATTEREDCOUNT}</td>
                  <td width={80} />
                  <td width={80}>{item.NOTE || ''}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
          <tr style={{ height: 25 }}>
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
          <tr style={{ height: 25 }}>
            <td colspan={8}>
              <div style={{ float: 'left', width: '10%' }}>提成工资:</div>
              {memberWage.length > 0 ? (
                memberWage.map(item => {
                  return (
                    <div style={{ float: 'left', marginRight: 15 }}>
                      {item.memberName}：{item.wage}
                    </div>
                  );
                })
              ) : (
                <></>
              )}
            </td>
          </tr>
          <tr style={{ height: 25 }}>
            <td colspan={8}>
              备注：
              {schedule.NOTE}
            </td>
          </tr>
          <tr style={{ height: 25 }}>
            <td colspan={8} style={{ border: 0 }}>
              该出车单工资包含车次补贴和伙食补贴
            </td>
          </tr>
          <tr style={{ height: 25 }}>
            <td colspan={8} style={{ border: 0 }}>
              <div style={{ float: 'left', width: '50%' }}>
                （备注：白色~放行 黄色~送货、交收退 红色~财务）
              </div>
              <div style={{ float: 'left', width: '25%' }}>打印日期: {convertDate(new Date())}</div>
              <div style={{ float: 'left', width: '22%' }}> 制单人: {loginUser().name}</div>
            </td>
          </tr>
          <tr style={{ height: 25 }}>
            <td colspan={8} style={{ border: 0 }}>
              <div style={{ float: 'left', width: '25%' }}>出车公里数:</div>
              <div style={{ float: 'left', width: '25%' }}>出车时间:</div>
              <div style={{ float: 'left', width: '25%' }}>回车公里数:</div>
              <div style={{ float: 'left', width: '22%' }}>回车时间:</div>
            </td>
          </tr>
          <tr style={{ height: 25 }}>
            <td colspan={8} style={{ border: 0 }}>
              <div style={{ float: 'left', width: '25%' }}>发货主管:</div>
              <div style={{ float: 'left', width: '25%' }}> 司机签名:</div>
              <div style={{ float: 'left', width: '25%' }}>送货员签名:</div>
              <div style={{ float: 'left', width: '22%' }}>收退签名:</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

//装车单
const drawPrintPage = (schedule, scheduleDetails) => {
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
              <div style={{ fontSize: 18, textAlign: 'center' }}>广东时捷物流有限公司装车单</div>
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
};
