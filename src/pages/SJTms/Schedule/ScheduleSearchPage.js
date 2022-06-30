/*
 * @Author: guankongjin
 * @Date: 2022-06-29 16:26:59
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-30 10:02:22
 * @Description: 排车单列表
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\ScheduleSearchPage.js
 */
import { connect } from 'dva';
import { Button, message, Popconfirm } from 'antd';
import { convertDateToTime } from '@/utils/utils';
import { loginUser } from '@/utils/LoginContext';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { queryAllData } from '@/services/quick/Quick';
import { aborted, shipRollback } from '@/services/sjitms/ScheduleBill';
import { getLodop } from '@/pages/Component/Printer/LodopFuncs';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class ScheduleSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showRollBackPop: false,
    showAbortPop: false,
    scroll: {
      x: 'auto',
      y: '50vh',
    },
    isNotHd: true,
  };
  drawTopButton = () => {};
  drawToolsButton = () => {};
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

  //按钮面板
  drawToolbarPanel = () => {
    const { printPage, selectedRows, showRollBackPop, showAbortPop } = this.state;
    return (
      <div style={{ marginBottom: 10 }}>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <Popconfirm
          title="确定取消批准选中排车单?"
          visible={showRollBackPop}
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
          <Button style={{ marginBottom: -5 }} onClick={() => this.onBatchRollBack()}>
            取消批准
          </Button>
        </Popconfirm>
        <Popconfirm
          title="确定作废选中排车单?"
          visible={showAbortPop}
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
          <Button style={{ marginLeft: 12 }} onClick={() => this.onBatchAbort()}>
            作废
          </Button>
        </Popconfirm>
        <Button style={{ marginLeft: 12 }} onClick={() => this.onMoveCar()}>
          移车
        </Button>
        <Button style={{ marginLeft: 12 }} onClick={() => this.handlePrint()} icon="printer">
          打印
        </Button>
        <div id="printPage" style={{ display: 'none' }}>
          {printPage}
        </div>
      </div>
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

  //打印
  handlePrint = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择需要打印的排车单！');
      return;
    }
    const hide = message.loading('加载中...', 0);
    let LODOP = getLodop();
    if (LODOP == undefined) return;
    LODOP.PRINT_INIT('排车单打印');
    LODOP.SET_PRINT_PAGESIZE(2, 281, 240, '280mm*241mm'); //1代表横的打印 2代表竖的打印 3纵向打印，宽度固定，高度按打印内容的高度自适应；
    LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 1); //去掉双面打印
    LODOP.SET_SHOW_MODE('LANDSCAPE_DEFROTATED', 1); //纸张旋转横过来
    LODOP.SET_PRINT_STYLEA(0, 'Horient', 2); //打印项在纸张中水平居中
    const strStyle = '<style> td,th {height:30px}</style>';
    await this.buildPrintPage();
    const printPages = document.getElementById('printPage').childNodes;
    printPages.forEach(page => {
      LODOP.NewPageA();
      LODOP.ADD_PRINT_TABLE('2%', '2%', '96%', 220, strStyle + page.innerHTML);
    });
    LODOP.PREVIEW();
    hide();
    this.setState({ printPage: undefined });
  };

  buildPrintPage = async () => {
    const { selectedRows } = this.state;
    const printPages = [];
    for (let index = 0; selectedRows.length > index; index++) {
      const response = await queryAllData({
        quickuuid: 'sj_itms_schedule_order',
        superQuery: {
          queryParams: [
            {
              field: 'billuuid',
              type: 'VarChar',
              rule: 'eq',
              val: selectedRows[index].UUID,
            },
          ],
        },
      });
      const scheduleDetails = response.success ? response.data.records : [];
      const printPage = drawPrintPage(selectedRows[index], scheduleDetails);
      printPages.push(printPage);
    }
    this.setState({ printPage: printPages });
  };
}

const drawPrintPage = (schedule, scheduleDetails) => {
  return (
    <div>
      <table
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}
        border={1}
        cellPadding={0}
        cellSpacing={0}
      >
        <thead>
          <tr style={{ height: 50 }}>
            <th colspan={2} style={{ border: 0 }} />
            <th colspan={4} style={{ border: 0 }}>
              <div style={{ fontSize: 22, textAlign: 'center' }}>广东时捷物流有限公司排车单</div>
            </th>
            <th colspan={2} style={{ border: 0 }}>
              <div style={{ fontSize: 16, textAlign: 'center' }}>
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
            <th colspan={8} style={{ border: 0 }}>
              <div style={{ display: 'flex', textAlign: 'left' }}>
                <div style={{ flex: 1 }}>调度签名：</div>
                <div style={{ flex: 1 }}>装车人签名：</div>
                <div style={{ flex: 1 }}>打印时间： {convertDateToTime(new Date())}</div>
                <div style={{ flex: 1, textAligin: 'left' }}>制单人： {loginUser().name}</div>
              </div>
            </th>
          </tr>

          <tr>
            <th colspan={8} style={{ border: 0 }}>
              <div style={{ display: 'flex', textAlign: 'left' }}>
                <div style={{ flex: 1 }}>单号： {schedule.BILLNUMBER}</div>
                <div style={{ flex: 1 }}> 车牌号： {schedule.VEHICLEPLATENUMBER}</div>
                <div style={{ flex: 1 }}> 送货员： {schedule.STEVEDORE || ''}</div>
                <div style={{ flex: 1 }} />
              </div>
            </th>
          </tr>

          <tr>
            <th width={50}>序号</th>
            <th width={120}>销售单号</th>
            <th width={100}>客户编号</th>
            <th width={150}>客户名称</th>
            <th width={80}>整件</th>
            <th width={80}>散件</th>
            <th width={100}>板位</th>
            <th width={100}>备注</th>
          </tr>
        </thead>
        <tbody>
          {scheduleDetails ? (
            scheduleDetails.map((item, index) => {
              return (
                <tr style={{ textAlign: 'center' }}>
                  <td>{index + 1}</td>
                  <td width={120}>{item.ORDERNUMBER}</td>
                  <td>{item.DELIVERYPOINTCODE}</td>
                  <td>{item.DELIVERYPOINTNAME}</td>
                  <td>{item.REALCARTONCOUNT}</td>
                  <td>{item.REALSCATTEREDCOUNT}</td>
                  <td />
                  <td>{item.NOTE || ''}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
        <tfoot>
          <tr style={{ height: 35 }}>
            <td colspan={4}>合计:</td>
            <td style={{ textAlign: 'center' }}>
              <font color="blue" tdata="SubSum" format="#,##" tindex="5">
                ######
              </font>
            </td>
            <td style={{ textAlign: 'center' }}>
              <font color="blue" tdata="SubSum" format="#,##" tindex="6">
                ######
              </font>
            </td>
            <td colspan={2} />
          </tr>
          <tr style={{ height: 35 }}>
            <td colspan={8}>备注:</td>
          </tr>
          <tr style={{ height: 35 }}>
            <td colspan={8} style={{ border: 0 }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>装车员:</div>
                <div style={{ flex: 1 }}>司机:</div>
                <div style={{ flex: 1 }}> 送货员:</div>
                <div style={{ flex: 1 }}>调度:</div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
