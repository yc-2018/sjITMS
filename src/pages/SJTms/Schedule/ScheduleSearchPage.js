/*
 * @Author: guankongjin
 * @Date: 2022-06-29 16:26:59
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-07-18 10:08:50
 * @Description: 排车单列表
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\ScheduleSearchPage.js
 */
import { connect } from 'dva';
import {
  Dropdown,
  Menu,
  Icon,
  Button,
  message,
  Popconfirm,
  Modal,
  Form,
  InputNumber,
  Select,
  Checkbox,
  Row,
  Col,
} from 'antd';
import { convertDate, convertDateToTime } from '@/utils/utils';
import { loginOrg, loginUser } from '@/utils/LoginContext';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { queryAllData } from '@/services/quick/Quick';
import {
  aborted,
  shipRollback,
  abortedAndReset,
  updatePris,
  updateOutSerialApi,
  getPris,
  refreshETC,
  getTengBoxRecord,
} from '@/services/sjitms/ScheduleBill';
import { depart, back, recordLog, callG7Interface } from '@/services/sjitms/ScheduleProcess';
import DispatchMap from '@/pages/SJTms/Schedule/ScheduleMap';
import { getLodop } from '@/pages/Component/Printer/LodopFuncs';
import { groupBy, sumBy, orderBy } from 'lodash';
import scher from '@/assets/common/scher.jpg';
import { havePermission } from '@/utils/authority';
import moment from 'moment';
import { dynamicQuery } from '@/services/quick/Quick';
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
    showRefreshPop: false,
    minHeight: '50vh',
    isNotHd: true,
    showAbortAndReset: false,
    showUpdatePirsPop: false,
    showUpdateOutSerial: false,
    basketMovement: false,
    outSerial: '1',
    newPirs: '',
    sourceData: [],
    authority: this.props.authority ? this.props.authority[0] : null,
    dc: [
      '000000750000004',
      '000008150000001',
      '000000750000005',
      '000008150000002',
      '000008150000003',
      '000000750000006',
    ],
    isRadio: true,
    billnumbers: [],
  };

  componentDidMount() {
    this.queryCoulumns();
    this.getCreateConfig();
  }

  componentWillReceiveProps(newProps) {
    const { comKey } = this.props;
    if (newProps.comKey != comKey) {
      this.queryCoulumns();
      this.getCreateConfig();
    }
  }

  // defaultSearch = () => {
  //   //默认查询
  //   let ex = this.state.queryConfigColumns.filter(item => {
  //     return item.searchDefVal != null && item.searchDefVal != '';
  //   });
  //   let defaultSearch = [];
  //   let exSearchFilter;
  //   for (const item of ex) {
  //     if (item.fieldType == 'Date') {
  //       let days = parseInt(item.searchDefVal);
  //       if (days != days) days = 0;
  //       let endDate = moment(new Date()).format('YYYY-MM-DD');
  //       let startDate = moment(new Date())
  //         .add(-item.searchDefVal, 'days')
  //         .format('YYYY-MM-DD');
  //       exSearchFilter = {
  //         field: item.fieldName,
  //         type: item.fieldType,
  //         rule: item.searchCondition,
  //         val: `${startDate}||${endDate}`,
  //       };
  //     } else if (item.fieldType == 'DateTime') {
  //       let days = parseInt(item.searchDefVal);
  //       if (days != days) days = 0;
  //       let endDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
  //       let startDate = moment(new Date())
  //         .add(-item.searchDefVal, 'days')
  //         .format('YYYY-MM-DD 00:00:00');
  //       exSearchFilter = {
  //         field: item.fieldName,
  //         type: item.fieldType,
  //         rule: item.searchCondition,
  //         val: `${startDate}||${endDate}`,
  //       };
  //     } else {
  //       exSearchFilter = {
  //         field: item.fieldName,
  //         type: item.fieldType,
  //         rule: item.searchCondition,
  //         val: item.searchDefVal,
  //       };
  //     }
  //     defaultSearch.push(exSearchFilter);
  //   }
  //   defaultSearch.push({
  //     field: 'WAVENUM',
  //     type: 'VARCHAR',
  //     rule: 'in',
  //     val: moment(new Date()).format('YYMMDD') + '0001',
  //   });
  //   return defaultSearch;
  // };

  goG7 = async apiName => {
    const { selectedRows } = this.state;
    if (selectedRows.length <= 0 && apiName != 'truck.webapi.newMonitor') {
      message.error('请先选择排车单！');
      return;
    }
    let params = {};
    switch (apiName) {
      case 'truck.webapi.newFollow':
        params = {
          carnum: `粤${selectedRows[0].VEHICLEPLATENUMBER}`,
        };
        break;
      case 'truck.webapi.newReview':
        params = {
          carnum: `粤${selectedRows[0].VEHICLEPLATENUMBER}`,
          begintime: selectedRows[0].DISPATCHTIME,
          endtime: selectedRows[0].RETURNTIME,
        };
        break;
      case 'truck.webapi.newMonitor':
        params = {};
        break;
    }
    let result = await callG7Interface(apiName, params);

    if (result.success) {
      window.open(encodeURI(result.data.web_url));
    }
  };

  drawRightClickMenus = () => {
    return (
      <Menu>
        <Menu.Item key="1" onClick={() => this.goG7('truck.webapi.newFollow')}>
          车辆地图轨迹(G7)
        </Menu.Item>
        <Menu.Item key="2" onClick={() => this.goG7('truck.webapi.newReview')}>
          车辆地图轨迹回放(G7)
        </Menu.Item>
        <Menu.Item key="3" onClick={() => this.goG7('truck.webapi.newMonitor')}>
          车辆实时位置(G7)
        </Menu.Item>
      </Menu>
    );
  };

  //查询数据
  getData = pageFilters => {
    const { dispatch } = this.props;
    let newFilters = { ...pageFilters };
    const deliverypointCode = newFilters.superQuery.queryParams.find(
      x => x.field == 'DELIVERYPOINTCODE'
    );
    let queryParams = [...newFilters.superQuery.queryParams];
    if (deliverypointCode) {
      newFilters.applySql = ` uuid in (select billuuid from sj_itms_schedule_order where deliverypointcode='${
        deliverypointCode.val
      }')`;
      queryParams = newFilters.superQuery.queryParams.filter(x => x.field != 'DELIVERYPOINTCODE');
    }
    dispatch({
      type: 'quick/queryData',
      payload: {
        ...newFilters,
        superQuery: { matchType: newFilters.superQuery.matchType, queryParams },
      },
      callback: response => {
        if (response.data) this.initData(response.data);
      },
    });
  };

  initOptionsData = async () => {
    await getPris().then(datas => {
      this.setState({ sourceData: datas });
    });
  };

  buildOptions = () => {
    const { sourceData } = this.state;
    const color = [
      { stat: '空闲', color: 'green' },
      { stat: '已预约', color: 'blue' },
      { stat: '使用中', color: 'red' },
    ];
    if (sourceData.success == true && sourceData.data) {
      return sourceData.data.map(data => {
        const textColor = color.find(x => x.stat == data.stat).color;
        return (
          <Select.Option value={data.dockno}>
            <span style={{ color: textColor }}>{data.dockno + ' ' + data.stat}</span>
          </Select.Option>
        );
      });
    } else {
      return null;
    }
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
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.selectedRows != this.props.selectedRows) {
  //     this.queryCoulumns();
  //   }
  // }

  // handleOnRow = record => {
  //   return {
  //     onClick: () => {
  //       let { data, selectedRows, selectedRowKeys } = this.state;
  //       data.list?.map(item => {
  //         item.clicked = item.UUID == record.UUID;
  //         return item;
  //       });
  //       selectedRows = [];
  //       selectedRows.push(record);
  //       // selectedRowKeys.push(record.UUID);
  //       record.disabled = true;
  //       this.setState({ data, selectedRows, selectedRowKeys });
  //       this.props.refreshSelectedRow(record);
  //     },
  //   };
  // };

  handleRowClick = record => {
    let { data } = this.state;
    data.list?.map(item => {
      item.clicked = item.UUID == record.UUID;
      return item;
    });
    this.setState({ data });

    this.props.refreshSelectedRow(record);
  };

  onUpdatePirs = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 1) {
      this.initOptionsData();
      this.setState({ showUpdatePirsPop: true });
    } else {
      message.warn('请选择一条数据！');
    }
  };
  onUpdateOutSerial = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 1) {
      this.setState({ showUpdateOutSerial: true });
    } else {
      message.warn('请选择一条数据！');
    }
  };

  drawcell = e => {
    if (e.column.fieldName == 'SHIPAREANAME') {
      const { AREAUUID, SHIPAREA } = e.record;
      let sizeColor = '';
      let list;
      if (AREAUUID != undefined) {
        list = AREAUUID.split(',');
        list.map(data => {
          if (SHIPAREA == undefined || SHIPAREA.indexOf(data) < 0) {
            sizeColor = 'Red';
          }
        });
      }
      const component = <span style={{ color: sizeColor }}>{e.record.SHIPAREANAME}</span>;
      e.component = component;
    }

    if (e.column.fieldName == 'STAT') {
      let color = this.colorChange(e.record.STAT, e.column.textColorJson);
      let textColor = color ? this.hexToRgb(color) : 'black';
      e.component = (
        <div
          style={{
            height: '24px',
            // verticalAlign: 'middle',
            lineHeight: '24px',
            backgroundColor: color,
            textAlign: 'center',
            color: textColor,
            borderRadius: '10px',
          }}
          onClick={() => this.progressingMapRef?.show(e.record)}
        >
          {e.val}
        </div>
        // <div style={{ border: '1px solid ' + color, textAlign: 'center' }}>{e.val}</div>
      );
    }

    if (e.column.fieldName == 'SHIPSTAT') {
      let color = this.colorChange(e.record.SHIPSTAT, e.column.textColorJson);
      let textColor = color ? this.hexToRgb(color) : 'black';
      e.component = (
        // <div style={{ backgroundColor: color, textAlign: 'center', color: textColor }}>{e.val}</div>
        // <div style={{ border: '1px solid ' + color, textAlign: 'center' }}>{e.val}</div>
        <Button size="small" type="primary" ghost style={{ borderColor: color, color: color }}>
          {e.val}
        </Button>
      );
    }
  };

  //添加操作列
  drawExColumns = e => {
    const editableState = ['Saved', 'Approved', 'Shipping', 'Shiped'];
    if (e.column.fieldName == 'BILLNUMBER') {
      return {
        title: '操作 ',
        width: 60,
        render: (_, record) => {
          return (
            <a
              hidden={!havePermission(this.state.authority + '.editor')}
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

  updatePirs = async () => {
    const { selectedRows, newPirs } = this.state;
    if (selectedRows[0].STAT != 'Approved' || selectedRows[0].PIRS == undefined) {
      message.warn('该排车单未签到或不是批准状态，不能修改码头！');
      return;
    }
    if (newPirs == '') {
      message.warn('修改码头不能为空！');
      return;
    }
    const response = await updatePris(selectedRows[0].UUID, newPirs);
    if (response.success) {
      message.success(response.data);
      this.setState({ showUpdatePirsPop: false });
      this.queryCoulumns();
    }
  };

  updateOutSerial = async () => {
    const { selectedRows, outSerial } = this.state;
    if (selectedRows[0].STAT != 'Approved') {
      message.warn('该排车单不是批准状态，不能修改顺序！');
      return;
    } else if (outSerial == undefined) {
      message.warn('请填写顺序');
      return;
    }
    await updateOutSerialApi(selectedRows[0].UUID, outSerial).then(result => {
      if (result.success) {
        message.success('修改成功！');
        this.setState({ showUpdateOutSerial: false });
        this.onSearch();
      } else {
        message.success('修改失败！');
      }
    });
  };

  handleMenuClick = e => {
    this.handlePrint(e.key);
  };

  //按钮面板
  drawToolsButton = () => {
    const {
      selectedRows,
      showRollBackPop,
      showAbortPop,
      showAbortAndReset,
      showUpdatePirsPop,
      showUpdateOutSerial,
      showRefreshPop,
      basketMovement,
      billnumbers,
    } = this.state;
    const menu = (
      <Menu>
        <Menu.Item
          key="load"
          onClick={this.handleMenuClick}
          hidden={!havePermission(this.state.authority + '.load')}
        >
          装车单预览打印
        </Menu.Item>
        <Menu.Item
          key="loadNow"
          onClick={this.handleMenuClick}
          hidden={!havePermission(this.state.authority + '.loadNow')}
        >
          装车单打印
        </Menu.Item>
        <Menu.Item
          key="out"
          onClick={this.handleMenuClick}
          hidden={!havePermission(this.state.authority + '.out')}
        >
          出车单
        </Menu.Item>
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
          <Button
            onClick={() => this.onBatchRollBack()}
            hidden={!havePermission(this.state.authority + '.rollBack')}
          >
            取消批准
          </Button>
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
          <Button
            onClick={() => this.onBatchAbort()}
            hidden={!havePermission(this.state.authority + '.aborted')}
          >
            作废
          </Button>
        </Popconfirm>

        <Popconfirm
          title="确定作废并重排选中排车单?"
          visible={showAbortAndReset}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showAbortAndReset: visible });
          }}
          onCancel={() => {
            this.setState({ showAbortAndReset: false });
          }}
          onConfirm={() => this.onBatchAbortAndReset()}
        >
          <Button
            onClick={() => this.handleBatchAbortAndReset()}
            hidden={!havePermission(this.state.authority + '.abortAndReset')}
          >
            作废并重排
          </Button>
        </Popconfirm>
        <Button
          onClick={() => {
            this.onUpdatePirs();
          }}
          hidden={!havePermission(this.state.authority + '.updatePirs')}
        >
          修改码头
        </Button>
        <Button
          onClick={() => {
            this.onUpdateOutSerial();
          }}
          hidden={!havePermission(this.state.authority + '.updateOutSerial')}
        >
          修改出车顺序
        </Button>
        <Button
          onClick={() => this.onMoveCar()}
          hidden={!havePermission(this.state.authority + '.moveCar')}
        >
          移车
        </Button>

        <Popconfirm
          title="确定刷新选中排车单的ETC资料吗?"
          visible={showRefreshPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showRefreshPop: visible });
          }}
          onCancel={() => {
            this.setState({ showRefreshPop: false });
          }}
          onConfirm={() => {
            this.setState({ showRefreshPop: false });
            this.onRefresh(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('刷新成功！');
                this.queryCoulumns();
              }
            });
          }}
        >
          <Button
            onClick={() => this.onBatchRefresh()}
            hidden={!havePermission(this.state.authority + '.refresh')}
          >
            ETC资料刷新
          </Button>
        </Popconfirm>

        <Dropdown overlay={menu}>
          <Button
            // onClick={() => this.handlePrint()}
            icon="printer"
            // hidden={!havePermission(this.state.authority + '.print')}
          >
            打印 <Icon type="down" />
          </Button>
        </Dropdown>
        <Popconfirm title="确定发运选中排车单?" onConfirm={this.handleDepart}>
          <Button type="primary" ghost hidden={!havePermission(this.state.authority + '.depart')}>
            发运
          </Button>
        </Popconfirm>
        <Button
          type="danger"
          ghost
          onClick={this.handleBack}
          hidden={!havePermission(this.state.authority + '.back')}
        >
          回厂
        </Button>
        <Modal
          title="修改码头"
          key={selectedRows[0]?.UUID}
          visible={showUpdatePirsPop}
          onOk={() => {
            this.updatePirs();
          }}
          onCancel={() => {
            this.setState({ showUpdatePirsPop: false });
          }}
        >
          <Form>
            <Form.Item label="排车单号" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <span>{selectedRows.length == 1 ? selectedRows[0].BILLNUMBER : ''}</span>
            </Form.Item>
            <Form.Item label="码头号" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <span>{selectedRows.length == 1 ? selectedRows[0].PIRS : ''}</span>
            </Form.Item>
            <Form.Item label="修改码头" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {/* <Input
                onChange={e => {
                  this.setState({ newPirs: e.target.value });
                }}
              /> */}
              <Select
                allowClear
                // value={e.val}
                showSearch={true}
                style={{ width: 120 }}
                onChange={v => {
                  this.setState({ newPirs: v });
                }}
              >
                {this.buildOptions()}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="修改出车顺序"
          visible={showUpdateOutSerial}
          onOk={() => {
            this.updateOutSerial();
          }}
          onCancel={() => {
            this.setState({ showUpdateOutSerial: false });
          }}
        >
          <Form>
            <Form.Item label="排车单号" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <span>{selectedRows.length == 1 ? selectedRows[0].BILLNUMBER : ''}</span>
            </Form.Item>
            <Form.Item label="原顺序号" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <span>{selectedRows.length == 1 ? selectedRows[0].OUTSERIAL : '空'}</span>
            </Form.Item>
            <Form.Item label="修改出车顺序" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {/* <Input
                onChange={e => {
                  this.setState({ newPirs: e.target.value });
                }}
              /> */}
              <InputNumber
                allowClear
                step={1}
                min={1}
                max={100}
                defaultValue={1}
                // value={e.val}
                style={{ width: 120 }}
                onChange={v => {
                  this.setState({ outSerial: v });
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="请选择需要藤筐迁移的排车单"
          visible={basketMovement}
          footer={
            <Button onClick={this.again} type="primary">
              确定
            </Button>
          }
          onCancel={() => this.setState({ basketMovement: false })}
        >
          <Row gutter={[8, 16]}>
            {billnumbers?.map(bill => {
              return (
                <Col span={12}>
                  <Checkbox
                    value={bill.checked}
                    onChange={e => {
                      bill.checked = !e.target.value;
                      this.setState({ billnumbers });
                    }}
                  >
                    {bill.billnumber}
                  </Checkbox>
                </Col>
              );
            })}
          </Row>
        </Modal>
        <DispatchMap onRef={node => (this.progressingMapRef = node)} />
      </>
    );
  };
  again = () => {
    const { billnumbers, selectedRows } = this.state;
    billnumbers.forEach(e => {
      const billNumber = selectedRows.filter(j => j.BILLNUMBER == e.billnumber)[0];
      this.abortedAndReset(billNumber, e.checked);
    });
    message.success('作废成功！已生成新的排车单据！,所选排车单藤筐已迁移');
    this.setState({ basketMovement: false });
    this.queryCoulumns();
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

  //刷新ETC资料
  onBatchRefresh = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showRefreshPop: true })
      : this.batchProcessConfirmRef.show(
          'ETC资料刷新',
          selectedRows,
          this.onRefresh,
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

  //作废并重排
  onBatchAbortAndReset = async () => {
    const { selectedRows } = this.state;
    this.setState({ showAbortAndReset: false });
    const billnumbers = [];
    for (const i in selectedRows) {
      const e = selectedRows[i];
      const response = await getTengBoxRecord(e.BILLNUMBER);
      if (response.success && response.data) {
        billnumbers.push({
          billnumber: e.BILLNUMBER,
          checked: false,
        });
      } else {
        this.abortedAndReset(e, false);
      }
    }
    if (billnumbers.length == 0) {
      message.success('作废成功！已生成新的排车单据！');
      this.queryCoulumns();
      return;
    }
    this.setState({ billnumbers: billnumbers, basketMovement: true });
  };

  //     // Modal.confirm({
  //     //   title: '该排车单已审核腾筐，是否将腾筐继承给新单？',
  //     //   okText: '是',
  //     //   cancelText: '否',
  //     //   onOk: () => this.abortedAndReset(selectedRows[0], true),
  //     //   onCancel: () => this.abortedAndReset(selectedRows[0], false),
  //     // });
  //     // return;
  //   }
  //   this.abortedAndReset(selectedRows[0], false);
  // };
  handleBatchAbortAndReset = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请至少选中一条数据！');
      return;
    }
    this.setState({ showAbortAndReset: true });
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

  //ETC资料刷新
  onRefresh = async record => {
    return await refreshETC(record.UUID);
  };

  //作废
  onAbort = async record => {
    return await aborted(record.UUID);
  };

  abortedAndReset = async (record, moveTengBox) => {
    const response = await abortedAndReset(record.UUID, moveTengBox);
    // if (response.success) {
    //   message.success('作废成功！已生成新的排车单据！');
    //   this.queryCoulumns();
    // }
  };

  //发运
  handleDepart = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 1) {
      await recordLog(selectedRows[0].BILLNUMBER, '发运');
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
    await recordLog(selectedRows[0].BILLNUMBER, '回厂');
    const response = await back(
      selectedRows[0].BILLNUMBER,
      selectedRows[0].FVERSION,
      returnMileage
    );
    if (response.success) {
      message.success('回厂成功！');
      this.queryCoulumns();
    }
    this.setState({ returnMileage: false, returnMileage: 0 });
  };

  //打印
  handlePrint = async key => {
    const { selectedRows, dc } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择需要打印的排车单！');
      return;
    }
    const hide =
      key == 'loadNow' ? message.loading('打印中，请稍后...', 6) : message.loading('加载中...', 5);
    const LODOP = getLodop();
    if (LODOP == undefined) return;
    LODOP.PRINT_INIT('排车单打印');
    LODOP.SET_PRINT_PAGESIZE(1, 2100, 1400, '210mm*140mm'); //1代表横的打印 2代表竖的打印 3纵向打印，宽度固定，高度按打印内容的高度自适应；
    //LODOP.SET_LICENSES("","EE0887D00FCC7D29375A695F728489A6","C94CEE276DB2187AE6B65D56B3FC2848","");
    LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 1); //去掉双面打印
    key == 'load' || key == 'loadNow'
      ? await this.buildPrintPage()
      : await this.buildSchedulePrintPage();
    if (key != 'load' && key != 'loadNow') LODOP.SET_SHOW_MODE('SKIN_TYPE', 1);
    const printPages = document.getElementById('printPage').childNodes;
    printPages.forEach(page => {
      LODOP.NewPageA();
      if (
        dc.find(x => x == loginOrg().uuid) != undefined ||
        loginOrg().uuid == '000000750000008' ||
        loginOrg().uuid == '000008150000005'
        ||  loginOrg().uuid == '000008150000006'
        || loginOrg().uuid == '000000750000010'
      ) {
        LODOP.ADD_PRINT_HTM('2%', '2%', '96%', '96%', page.innerHTML);
      } else {
        LODOP.ADD_PRINT_TABLE('2%', '2%', '96%', '96%', page.innerHTML);
      }
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
    const { selectedRows, dc } = this.state;
    const printPages = [];
    for (let index = 0; selectedRows.length > index; index++) {
      const response = await queryAllData({
        quickuuid: 'sj_itms_print_schedule_order',
        order: 'ARCHLINECODE,dascend',
        superQuery: {
          queryParams: [
            { field: 'billuuid', type: 'VarChar', rule: 'eq', val: selectedRows[index].UUID },
          ],
        },
      });
      let scheduleDetails = response.success ? response.data.records : [];
      // scheduleDetails = orderBy(scheduleDetails, x => x.DELIVERYPOINTCODE);
      const printPage = await drawPrintPage(selectedRows[index], scheduleDetails, dc);
      printPages.push(printPage);
    }
    this.setState({ printPage: printPages });
  };
}
//出车单
const drawScheduleBillPage = (schedule, scheduleDetails, memberWage) => {
  const driver = schedule.DRIVER ? schedule.DRIVER.substr(schedule.DRIVER.indexOf(']') + 1) : '';
  const DELIVERYMAN = schedule.DELIVERYMAN
    ? schedule.DELIVERYMAN.substr(schedule.DELIVERYMAN.indexOf(']') + 1)
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
                <div style={{ float: 'left', width: '20%' }}>送货员： {DELIVERYMAN}</div>
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
              {memberWage ? (
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
const drawPrintPage = async (schedule, scheduleDetails, dc) => {
  if (schedule.TASKTYPESEARCH == 'TakeDelivery') {
    const param = {
      tableName: 'SJ_ITMS_ORDER_ARTICLE',
      condition: {
        params: [{ field: 'billuuid', rule: 'in', val: scheduleDetails.map(e => e.ORDERUUID) }],
      },
    };
    const paramOrder = {
      tableName: 'SJ_ITMS_ORDER',
      condition: {
        params: [{ field: 'UUID', rule: 'in', val: scheduleDetails.map(e => e.ORDERUUID) }],
      },
    };
    const response = await dynamicQuery(param);
    const article =
      response.success && Array.isArray(response.result.records) ? response.result.records : [];
    article.forEach(e => {
      e.QTYSTR = parseFloat(e.QTYSTR);
    });
    const responseOrder = await dynamicQuery(paramOrder);
    const orders =
      responseOrder.success && responseOrder.result.records ? responseOrder.result.records : [];
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
            <tr style={{ height: 30 }}>
              <th colspan={10} style={{ border: 0, height: 30 }}>
                <div>
                  <div style={{ height: 30, width: '30%', float: 'left', textAlign: 'left' }}>
                    <img style={{ height: 30, width: 120 }} src={scher} />
                  </div>
                  <div style={{ width: '40%', fontSize: 17, float: 'left', textAlign: 'center' }}>
                    东莞市时捷物流有限公司提货计划表
                  </div>
                  <div style={{ fontSize: 12, float: 'left', textAlign: 'center', width: '30%' }}>
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
              <th colspan={10} style={{ border: 0, height: 30 }}>
                <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                  {/* <div style={{ float: 'left', width: '25%' }}>
                    排车序号： 
                  </div> */}
                  <div style={{ float: 'left', width: '30%', fontWeight: 'normal' }}>
                    排车单号： {schedule.BILLNUMBER}
                  </div>
                  <div style={{ float: 'left', width: '30%', fontWeight: 'normal' }}>
                    车牌号： {schedule.VEHICLECODE}
                  </div>
                  <div style={{ float: 'left', width: '40%', fontWeight: 'normal' }}>
                    供应商：
                    {'[' +
                      scheduleDetails[0].DELIVERYPOINTCODE +
                      ']' +
                      scheduleDetails[0].DELIVERYPOINTNAME}
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th colspan={10} style={{ border: 0, height: 20 }}>
                <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    驾驶员电话： {schedule.TEL}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    驾驶员:
                    {schedule.DRIVER}
                  </div>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      提货点： {scheduleDetails[0].DELIVERYPOINTCODE}
                    </div>
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    送货点： {schedule.NOTE}
                  </div>
                </div>
              </th>
            </tr>
            <tr style={{ height: 25 }}>
              <th width={76}>商品代码</th>
              <th width={76}>商品条码</th>
              <th width={130}>商品名称</th>
              <th width={50}>仓位</th>
              <th width={50}>装盘</th>
              <th width={50}>单价</th>
              <th width={40}>件数</th>
              <th width={50}>重量（吨）</th>
              <th width={50}>体积（m3）</th>
              <th width={80}>订单号</th>
            </tr>
          </thead>
          <tbody>
            {article ? (
              article.map((item, index) => {
                return (
                  <tr style={{ textAlign: 'center', height: 30 }}>
                    <td>{item.ARTICLECODE}</td>
                    <td style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                      {item.BARCODE}
                    </td>
                    <td>{item.ARTICLENAME}</td>
                    <td>{item.FREIGHTSPACE}</td>
                    <td>{item.FPAQSTANDARD}</td>
                    <td>{item.AMOUNT.toFixed(2)}</td>
                    <td>{item.QTYSTR}</td>
                    <td>{(item.WEIGHT / 1000).toFixed(2)}</td>
                    <td>{item.VOLUME.toFixed(3)}</td>
                    <td>{orders.find(e => e.UUID == item.BILLUUID).SOURCENUM}</td>
                  </tr>
                );
              })
            ) : (
              <></>
            )}
            {
              <tr>
                <td style={{ textAlign: 'center' }}>合计</td>
                <td style={{ textAlign: 'center' }}>{article.length}</td>
                <td style={{ textAlign: 'center' }}>{}</td>
                <td style={{ textAlign: 'center' }}>{}</td>
                <td style={{ textAlign: 'center' }}>{}</td>
                <td style={{ textAlign: 'center' }}>{}</td>
                <td style={{ textAlign: 'center' }}>{sumBy(article, 'QTYSTR')}</td>
                <td style={{ textAlign: 'center' }}>
                  {(sumBy(article, 'WEIGHT') / 1000).toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>{sumBy(article, 'VOLUME').toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{}</td>
              </tr>
            }
          </tbody>
          <tfoot border={0}>
            <tr style={{ height: 20, border: 0 }} border={0}>
              <td style={{ border: 0, paddingTop: 10 }} colSpan={2}>
                <div style={{ fontWeight: 'normal' }}>调度签名(盖章)： {}</div>
              </td>
              <td
                style={{ border: 0, textAlign: 'left', paddingTop: 10, fontWeight: 'normal' }}
                colSpan={3}
              >
                <div>
                  打印日期:
                  {convertDateToTime(new Date())}
                </div>
              </td>
              <td style={{ border: 0, fontWeight: 'normal', paddingTop: 10 }} colspan={5}>
                (白联：时捷收货部，红联：供应商，黄联：驾驶员)
              </td>
            </tr>
            <tr style={{ border: 0, height: 20 }}>
              <td style={{ border: 0, fontWeight: 'normal' }} colspan={2}>
                制单人：
                {loginUser().name}
              </td>
              <td style={{ border: 0, fontWeight: 'normal' }} colspan={3}>
                驾驶员签名：
                {}
              </td>
              <td style={{ border: 0, fontWeight: 'normal' }} colspan={3}>
                时捷收货签名：
                {}
              </td>
              {/* <td style={{ border: 0 }} colspan={6}>
                收退货签字：
              </td> */}
              <td style={{ border: 0 }} colspan={2}>
                <div border={0} style={{ fontSize: 12, textAlign: 'center', fontWeight: 'normal' }}>
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

    //茶山调度
  } else if (dc.find(x => x == loginOrg().uuid) != undefined) {
    // if (loginOrg().uuid == '000000750000004' || loginOrg().uuid == '000008150000001') {
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
              <th colspan={12} style={{ border: 0, height: 30 }}>
                <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                  {/* <div style={{ float: 'left', width: '25%' }}>
                    排车序号： 
                  </div> */}
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    排车单号： {schedule.BILLNUMBER}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    车牌号： {schedule.VEHICLECODE}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    码头：
                    {schedule.PIRS}
                  </div>
                </div>
                <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    驾驶员： {schedule.DRIVER}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    送货员:
                    {schedule.DELIVERYMAN}
                  </div>
                  <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                    <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      副驾驶员： {schedule.COPILOT}
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
                    {schedule.USEETC == '是'
                      ? '粤通卡信息：请到调度窗口领取粤通卡，按规定行驶，该次费用为' +
                        schedule.ETCAMOUNT +
                        '元'
                      : '粤通卡信息：'}
                    <br />
                    [线路]去程入口:
                    {schedule.ETCROUTE}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;回程出口:
                    {schedule.ETCROUTERETURN}
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
                  <tr style={{ textAlign: 'center', height: 33 }}>
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
                  {schedule.VOLUME}
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
  } else if (loginOrg().uuid == '000000750000008' || loginOrg().uuid == '000008150000005') {
    let scheduleDetailSum = {};
    let REALCARTONCOUNT = 0;
    let REALSCATTEREDCOUNT = 0;
    let REALCONTAINERCOUNT = 0;
    let OWECARTONCOUNT = 0;
    let CONTAINERSum = 0;
    let cartonCounts = 0;
    let REALCOLDCONTAINERCOUNT = 0;
    let REALFREEZECONTAINERCOUNT = 0;
    //scheduleDetails =   sumBy(scheduleDetails,'DELIVERYPOINTCODE');
    // console.log("scheduleDetails",scheduleDetails);
    scheduleDetails.forEach(item => {
      REALCARTONCOUNT += item.REALCARTONCOUNT;
      REALSCATTEREDCOUNT += item.REALSCATTEREDCOUNT;
      REALCONTAINERCOUNT += item.REALCONTAINERCOUNT;
      OWECARTONCOUNT += item.OWECARTONCOUNT;
      REALCOLDCONTAINERCOUNT += !item.REALCOLDCONTAINERCOUNT ? 0 : item.REALCOLDCONTAINERCOUNT;
      REALFREEZECONTAINERCOUNT += !item.REALFREEZECONTAINERCOUNT
        ? 0
        : item.REALFREEZECONTAINERCOUNT;
      CONTAINERSum += item.REALCONTAINERCOUNT + item.OWECARTONCOUNT;
      cartonCounts +=
        (!item.REALCONTAINERCOUNT ? 0 : item.REALCONTAINERCOUNT) +
        (!item.REALCOLDCONTAINERCOUNT ? 0 : item.REALCOLDCONTAINERCOUNT) +
        (!item.REALFREEZECONTAINERCOUNT ? 0 : item.REALFREEZECONTAINERCOUNT);
    });
    let sds = [];
    scheduleDetails.forEach(e => {
      let data = sds.find(f => f.DELIVERYPOINTCODE == e.DELIVERYPOINTCODE);
      if (data) {
        data.REALCARTONCOUNT = data.REALCARTONCOUNT + e.REALCARTONCOUNT;
        data.REALSCATTEREDCOUNT = data.REALSCATTEREDCOUNT + e.REALSCATTEREDCOUNT;
        data.REALCONTAINERCOUNT = data.REALCONTAINERCOUNT + e.REALCONTAINERCOUNT;
        data.REALCOLDCONTAINERCOUNT = data.REALCOLDCONTAINERCOUNT + e.REALCOLDCONTAINERCOUNT;
        data.REALFREEZECONTAINERCOUNT = data.REALFREEZECONTAINERCOUNT + e.REALFREEZECONTAINERCOUNT;
        const index = sds.map(g => g.DELIVERYPOINTCODE).indexOf(e.DELIVERYPOINTCODE);
        sds.splice(index, 1, data);
      } else {
        let fs = {};
        fs.DELIVERYPOINTCODE = e.DELIVERYPOINTCODE;
        fs.REALCARTONCOUNT = e.REALCARTONCOUNT;
        fs.OWNERNAME = e.OWNERNAME;
        fs.SHIPAREANAME = e.SHIPAREANAME;
        fs.REALSCATTEREDCOUNT = e.REALSCATTEREDCOUNT;
        fs.COLLECTBIN = e.COLLECTBIN;
        fs.DELIVERYPOINTNAME = e.DELIVERYPOINTNAME;
        fs.REALCONTAINERCOUNT = e.REALCONTAINERCOUNT;
        fs.REALCOLDCONTAINERCOUNT = e.REALCOLDCONTAINERCOUNT;
        fs.REALFREEZECONTAINERCOUNT = e.REALFREEZECONTAINERCOUNT;
        sds.push(fs);
      }
    });
    scheduleDetailSum.REALCARTONCOUNT = REALCARTONCOUNT;
    scheduleDetailSum.REALSCATTEREDCOUNT = REALSCATTEREDCOUNT;
    scheduleDetailSum.REALCONTAINERCOUNT = REALCONTAINERCOUNT;
    scheduleDetailSum.OWECARTONCOUNT = OWECARTONCOUNT;
    scheduleDetailSum.CONTAINERSum = CONTAINERSum;
    scheduleDetailSum.StoreSum = sds.length;
    scheduleDetailSum.cartonCounts = cartonCounts;
    scheduleDetailSum.REALCOLDCONTAINERCOUNT = REALCOLDCONTAINERCOUNT;
    scheduleDetailSum.REALFREEZECONTAINERCOUNT = REALFREEZECONTAINERCOUNT;
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
              <th colspan={14} style={{ border: 0, height: 27 }}>
                <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    排车单号： {schedule.BILLNUMBER}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    车牌号： {schedule.VEHICLECODE}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    驾驶员： {schedule.DRIVER}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    送货员:
                    {schedule.DELIVERYMAN}
                  </div>
                </div>
                <div style={{ textAlign: 'left', fontWeight: 'normal', marginTop: '2' }}>
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
                    {schedule.USEETC == '是'
                      ? 'ETC信息：请到调度窗口领取ETC卡，按规定行驶，该次费用为' +
                        schedule.ETCAMOUNT +
                        '元'
                      : 'ETC信息：'}
                    <br />
                    [线路]去程入口:
                    {schedule.ETCROUTE}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;回程出口:
                    {schedule.ETCROUTERETURN}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;途径高速:
                    {schedule.ETCROUTEINFO}
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
              <th width={50} rowSpan={2}>
                委托方
              </th>
              <th width={120} rowSpan={2}>
                配送区域
              </th>
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
                板位
              </th>
              <th width={50} rowSpan={2}>
                装车排序
              </th>
            </tr>
            <tr style={{ height: 25 }}>
              <th>整件</th>
              <th>散件</th>
              <th>周转箱</th>
              <th>冷藏箱</th>
              <th>冷冻箱</th>
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
                    <td width={30}>{index + 1}</td>
                    <td width={50}>{item.OWNERNAME}</td>
                    <td width={80} style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                      {item.SHIPAREANAME}
                    </td>
                    <td width={130}>
                      {'[' + item.DELIVERYPOINTCODE + ']' + item.DELIVERYPOINTNAME}
                    </td>
                    <td width={50}>{item.REALCARTONCOUNT}</td>
                    <td width={50}>{item.REALSCATTEREDCOUNT}</td>
                    <td width={50}>{item.REALCONTAINERCOUNT}</td>
                    <td width={50}>
                      {!item.REALCOLDCONTAINERCOUNT ? 0 : item.REALCOLDCONTAINERCOUNT}
                    </td>
                    <td width={50}>
                      {!item.REALFREEZECONTAINERCOUNT ? 0 : item.REALFREEZECONTAINERCOUNT}
                    </td>
                    <td width={50}>
                      {(!item.REALCONTAINERCOUNT ? 0 : item.REALCONTAINERCOUNT) +
                        (!item.REALFREEZECONTAINERCOUNT ? 0 : item.REALFREEZECONTAINERCOUNT) +
                        (!item.REALCOLDCONTAINERCOUNT ? 0 : item.REALCOLDCONTAINERCOUNT)}
                    </td>
                    <td width={50}>{0}</td>

                    {/* <td width={50}>{0}</td>
                      <td width={50}>{0}</td> */}
                    <td width={50}>{}</td>
                    <td style={{ wordWrap: 'break-word', wordBreak: 'break-all' }} width={120}>
                      {item.COLLECTBIN}
                    </td>
                    {/* <td width={80} style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                      {item.SCATTEREDCOLLECTBIN}
                    </td> */}
                    <td width={50}>{}</td>
                  </tr>
                );
              })
            ) : (
              <></>
            )}
            {scheduleDetails ? (
              <tr style={{ textAlign: 'center', height: 25 }}>
                <td width={80} colSpan={2}>
                  {'合计'}
                </td>
                <td style={{ textAlign: 'center' }} />
                <td width={80} style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                  {scheduleDetailSum.StoreSum}
                </td>
                {/* <td width={120}>
                {scheduleDetailSum.StoreSum}
              </td> */}
                <td width={50}>{scheduleDetailSum.REALCARTONCOUNT}</td>
                <td width={50}>{scheduleDetailSum.REALSCATTEREDCOUNT}</td>
                <td width={50}>{scheduleDetailSum.REALCONTAINERCOUNT}</td>
                <td width={50}>{scheduleDetailSum.REALCOLDCONTAINERCOUNT}</td>
                <td width={50}>{scheduleDetailSum.REALFREEZECONTAINERCOUNT}</td>
                <td width={50}>{scheduleDetailSum.cartonCounts}</td>
                <td width={50}>{}</td>

                {/* <td width={50}>{ }</td>
                  <td  width={50}>
                    { }
                  </td> */}
                <td width={50}>{}</td>
                <td width={120}>{}</td>
                {/* <td width={120}>{}</td> */}
                <td width={50}>{}</td>
              </tr>
            ) : (
              <></>
            )}
            {
              <tr style={{ textAlign: 'left', height: 25 }}>
                <td colSpan={2} width={80}>
                  总配货额：
                  {0}
                </td>
                <td
                  width={80}
                  colSpan={4}
                  style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
                >
                  最远市区:
                  {}
                </td>
                <td width={50} colSpan={3}>
                  满载率:
                  {schedule.CUBEDOUT}
                </td>
                <td width={50} colSpan={3}>
                  {' '}
                  体积(方):
                  {schedule.VOLUME}
                </td>
                <td width={50} colSpan={4}>
                  重量:
                  {schedule.WEIGHT}
                </td>
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
                排车单备注：
                {schedule.NOTES}
              </td>
            </tr>
            <tr>
              <td style={{ border: 0, fontWeight: 'normal', textAlign: 'center' }} colSpan={16}>
                总计周转箱(蓝)________总计回冷藏箱(绿)__________ 总计回冷冻箱(灰)_________
              </td>
            </tr>
            <tr style={{ border: 0, height: 20 }}>
              <td style={{ border: 0, fontWeight: 'bold' }} colspan={12}>
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
  }else if(loginOrg().uuid == '000000750000010' || loginOrg().uuid == '000008150000006'){
    const storeMap = groupBy(scheduleDetails,x=>x.DELIVERYPOINTCODE);
    let returnOrders = [];
    for(const data in storeMap){
      const param = {
        tableName: 'SJ_ITMS_RETURN_ORDER',
        condition: {
          params: [
          { field: 'TCREATED', rule: 'eq', val:[storeMap[data][0].ORDERCREATED]},
          {field: 'STORECODE', rule: 'eq', val: [data]}
        ],
        },
      };
      let returnOrder = await dynamicQuery(param);
      if(returnOrder.success && returnOrder.result?.records!='false'){
        returnOrders = [...returnOrders,...returnOrder.result.records];
      }
    }
    let scheduleDetailSum = {};
    let REALCARTONCOUNT = 0;
    let REALSCATTEREDCOUNT = 0;
    let REALCONTAINERCOUNT = 0;
    let OWECARTONCOUNT = 0;
    let CONTAINERSum = 0;
    let cartonCounts = 0;
    let REALCOLDCONTAINERCOUNT = 0;
    let REALFREEZECONTAINERCOUNT = 0;
    //scheduleDetails =   sumBy(scheduleDetails,'DELIVERYPOINTCODE');
    // console.log("scheduleDetails",scheduleDetails);
    scheduleDetails.forEach(item => {
      REALCARTONCOUNT += item.REALCARTONCOUNT;
      REALSCATTEREDCOUNT += item.REALSCATTEREDCOUNT;
      REALCONTAINERCOUNT += item.REALCONTAINERCOUNT;
      OWECARTONCOUNT += item.OWECARTONCOUNT;
      REALCOLDCONTAINERCOUNT += !item.REALCOLDCONTAINERCOUNT ? 0 : item.REALCOLDCONTAINERCOUNT;
      REALFREEZECONTAINERCOUNT += !item.REALFREEZECONTAINERCOUNT
        ? 0
        : item.REALFREEZECONTAINERCOUNT;
      CONTAINERSum += item.REALCONTAINERCOUNT + item.OWECARTONCOUNT;
      cartonCounts +=
        (!item.REALCONTAINERCOUNT ? 0 : item.REALCONTAINERCOUNT) +
        (!item.REALCOLDCONTAINERCOUNT ? 0 : item.REALCOLDCONTAINERCOUNT) +
        (!item.REALFREEZECONTAINERCOUNT ? 0 : item.REALFREEZECONTAINERCOUNT)+
        (!item.OWECARTONCOUNT ? 0 : item.OWECARTONCOUNT);
    });
    let sds = [];
    scheduleDetails.forEach(e => {
      let data = sds.find(f => f.DELIVERYPOINTCODE == e.DELIVERYPOINTCODE);
      if (data) {
        data.REALCARTONCOUNT = data.REALCARTONCOUNT + e.REALCARTONCOUNT;
        data.REALSCATTEREDCOUNT = data.REALSCATTEREDCOUNT + e.REALSCATTEREDCOUNT;
        data.REALCONTAINERCOUNT = data.REALCONTAINERCOUNT + e.REALCONTAINERCOUNT;
        data.REALCOLDCONTAINERCOUNT = data.REALCOLDCONTAINERCOUNT + e.REALCOLDCONTAINERCOUNT;
        data.REALFREEZECONTAINERCOUNT = data.REALFREEZECONTAINERCOUNT + e.REALFREEZECONTAINERCOUNT;
        data.ISHAVEREFRIGERATION = data.ISHAVEREFRIGERATION==0?e.ISHAVEREFRIGERATION:data.ISHAVEREFRIGERATION;
        const index = sds.map(g => g.DELIVERYPOINTCODE).indexOf(e.DELIVERYPOINTCODE);
        sds.splice(index, 1, data);
      } else {
        let fs = {};
        fs.DELIVERYPOINTCODE = e.DELIVERYPOINTCODE;
        fs.REALCARTONCOUNT = e.REALCARTONCOUNT;
        fs.OWNERNAME = e.OWNERNAME;
        fs.SHIPAREANAME = e.SHIPAREANAME;
        fs.REALSCATTEREDCOUNT = e.REALSCATTEREDCOUNT;
        fs.COLLECTBIN = e.COLLECTBIN;
        fs.DELIVERYPOINTNAME = e.DELIVERYPOINTNAME;
        fs.REALCONTAINERCOUNT = e.REALCONTAINERCOUNT;
        fs.REALCOLDCONTAINERCOUNT = e.REALCOLDCONTAINERCOUNT;
        fs.REALFREEZECONTAINERCOUNT = e.REALFREEZECONTAINERCOUNT;
        fs.ISHAVEREFRIGERATION = e.ISHAVEREFRIGERATION;
        fs.ARCHLINECODE = e.ARCHLINECODE;
        fs.CONTAINERSUM = e.CONTAINERSUM;
        sds.push(fs);
      }
    });
    scheduleDetailSum.REALCARTONCOUNT = REALCARTONCOUNT;
    scheduleDetailSum.REALSCATTEREDCOUNT = REALSCATTEREDCOUNT;
    scheduleDetailSum.REALCONTAINERCOUNT = REALCONTAINERCOUNT;
    scheduleDetailSum.OWECARTONCOUNT = OWECARTONCOUNT;
    scheduleDetailSum.CONTAINERSum = CONTAINERSum;
    scheduleDetailSum.StoreSum = sds.length;
    scheduleDetailSum.cartonCounts = cartonCounts;
    scheduleDetailSum.REALCOLDCONTAINERCOUNT = REALCOLDCONTAINERCOUNT;
    scheduleDetailSum.REALFREEZECONTAINERCOUNT = REALFREEZECONTAINERCOUNT;
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
                <div style={{ fontSize: 18, textAlign: 'center' }}>东莞彩华装车单</div>
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
              <th colspan={14} style={{ border: 0, height: 27 }}>
                <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    装车单号： {schedule.SHIPBILLNUMBER?.replace("SBE",'01')}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    车牌号： {schedule.VEHICLECODE}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    信箱： {schedule.MAILNUMBER}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                    驾驶员： {schedule.DRIVER}
                  </div>
                 
                </div>
                <div style={{ textAlign: 'left', fontWeight: 'normal', marginTop: '2' }}>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      排车单:
                      {schedule.BILLNUMBER}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      送货员:
                      {schedule.DELIVERYMAN}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      操作员： {loginUser().name}
                  </div>
                  <div style={{ float: 'left', width: '25%', fontWeight: 'normal' }}>
                      打印时间：
                      {convertDateToTime(new Date())}
                  </div>
                  {/* <div style={{ float: 'left', width: '50%', fontWeight: 'normal' }}>
                      注：周转箱:蓝色,冷藏箱:绿色,冷冻箱:灰色
                  </div> */}
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
            {/* <tr>
              <th colspan={14} style={{ border: 0, height: 20 }}>
                <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                  <div style={{ float: 'left', width: '80%' }}>
                    {schedule.USEETC == '是'
                      ? 'ETC信息：请到调度窗口领取ETC卡，按规定行驶，该次费用为' +
                        schedule.ETCAMOUNT +
                        '元'
                      : 'ETC信息：'}
                    <br />
                    [线路]去程入口:
                    {schedule.ETCROUTE}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;回程出口:
                    {schedule.ETCROUTERETURN}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;途径高速:
                    {schedule.ETCROUTEINFO}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;如有异常需超额使用ETC卡的，请致电（670607）
                  </div>
                </div>
              </th>
            </tr> */}
            <tr style={{ height: 25 }}>
              <th rowSpan={2} width={30}>
                序号
              </th>
              <th width={80} rowSpan={2}>
                线路
              </th>
              <th width={120} rowSpan={2}>
                板位
              </th>
              <th width={80} rowSpan={2}>
                配送排序
              </th>
              <th width={100} rowSpan={2}>
                门店名称
              </th>
              <th width={170} colSpan={6}>
                送出
              </th>
              <th width={50} colSpan={1}>
                回收
              </th>
              {/* <th width={120} rowSpan={2}>
                板位
              </th> */}
             
            </tr>
            <tr style={{ height: 25 }}>
              <th>整件</th>
              <th>散件</th>
              <th>周转箱</th>
              <th>保温箱</th>
              <th>欠筐数</th>
              <th>箱总数</th>
              <th>周转筐</th>
              {/* <th>福袋数</th>
                <th>深通卡</th>
                <th>退货单</th>
                <th>差异单</th> */}
              {/* <th>周转</th>
                <th>冷藏</th>
                <th>冷冻</th> */}
              {/* <th>箱总数</th> */}
            </tr>
          </thead>
          <tbody>
            {sds ? (
              sds.map((item, index) => {
                return (
                  <tr style={{ textAlign: 'center', height: 33 }}>
                    <td width={30}>{index + 1}</td>
                    <td width={80}>{item.SHIPAREANAME+item.ARCHLINECODE}</td>
                    {/* <td width={80} style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                      {item.SHIPAREANAME}
                    </td> */}
                      <td style={{ wordWrap: 'break-word', wordBreak: 'break-all' }} width={120}>
                      {item.COLLECTBIN}
                    </td>
                    <td>{}</td>
                    <td width={130}>
                      {'[' + item.DELIVERYPOINTCODE + ']' + item.DELIVERYPOINTNAME}
                    </td>
                    <td width={50}>{item.REALCARTONCOUNT}</td>
                    <td width={50}>{item.REALSCATTEREDCOUNT}</td>
                    <td width={50}>{item.REALCONTAINERCOUNT}</td>
                    {/* <td width={50}>
                      {!item.REALCOLDCONTAINERCOUNT ? 0 : item.REALCOLDCONTAINERCOUNT}
                    </td>
                    <td width={50}>
                      {!item.REALFREEZECONTAINERCOUNT ? 0 : item.REALFREEZECONTAINERCOUNT}
                    </td> */}
                     <td width={50}>{item.ISHAVEREFRIGERATION==1?'是':""}</td>
                    <td width={50}>
                      {item.OWECARTONCOUNT || 0}
                    </td>
                    <td width={50}>{item.CONTAINERSUM}</td>

                    {/* <td width={50}>{0}</td>
                      <td width={50}>{0}</td> */}
                    <td width={50}>{}</td>
                    {/* <td style={{ wordWrap: 'break-word', wordBreak: 'break-all' }} width={120}>
                      {item.COLLECTBIN}
                    </td> */}
                    {/* <td width={80} style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                      {item.SCATTEREDCOLLECTBIN}
                    </td> */}
                    {/* <td width={50}>{}</td> */}
                  </tr>
                );
              })
            ) : (
              <></>
            )}
            {scheduleDetails ? (
              <tr style={{ textAlign: 'center', height: 25 }}>
                <td width={80} colSpan={2}>
                  {'合计'}
                </td>
                <td style={{ textAlign: 'center' }} />
                <td style={{ textAlign: 'center' }} />
                <td width={80} style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                  {scheduleDetailSum.StoreSum}
                </td>
                {/* <td width={120}>
                {scheduleDetailSum.StoreSum}
              </td> */}
                <td width={50}>{scheduleDetailSum.REALCARTONCOUNT}</td>
                <td width={50}>{scheduleDetailSum.REALSCATTEREDCOUNT}</td>
                <td width={50}>{scheduleDetailSum.REALCONTAINERCOUNT}</td>
                <td width={50}>{}</td>
                <td width={50}>{scheduleDetailSum.OWECARTONCOUNT || 0}</td>
                <td width={50}>{scheduleDetailSum.cartonCounts}</td>
                <td width={50}></td>
              </tr>
            ) : (
              <></>
            )}
            {
              <tr style={{ textAlign: 'left', height: 25, border: 0}}>
                <td colSpan={2} width={80} style={{border: 0}}>
                  总体积(方)：
                  {schedule.VOLUME}
                </td>
                <td width={50} colSpan={2} style={{border: 0}}>
                  重量:
                  {schedule.WEIGHT}
                </td>
                <td
                  width={80}
                  colSpan={2}
                  style={{ wordWrap: 'break-word', wordBreak: 'break-all',border: 0 }}
                >
                  总店数:
                  {schedule.STORECOUNT}
                </td>
                <td width={50} colSpan={3} style={{border: 0}}>
                  总件数:
                  {scheduleDetailSum.REALCARTONCOUNT+scheduleDetailSum.REALSCATTEREDCOUNT}
                </td>
                {/* <td width={50} colSpan={3}>
                  {' '}
                  体积(方):
                  {schedule.VOLUME}
                </td> */}
                <td width={50} colSpan={3} style={{border: 0}}>
                  脏筐数：___________
                </td>
              </tr>
            }
            {  
              (returnOrders&&returnOrders.length> 0)?(
                <>
                <tr  style={{ textAlign: 'center' }}>
                <td colSpan={2}>类型</td>
                <td colSpan={2}>彩华单号</td>
                <td colSpan={2}>客户</td>
                <td colSpan={3}>数量</td>
                <td colSpan={3}>金额</td>
              </tr>
              {returnOrders.map(r=>{
                return (<tr style={{ textAlign: 'center' }}>
                     <td  colSpan={2}>{r.ORDERTYPE}</td>
                    <td  colSpan={2}>{r.SOURCENUM}</td>
                    <td  colSpan={2}>{r.STORECODE+r.STORENAME}</td>
                    <td  colSpan={3}>{r.QUANTITY}</td>
                    <td  colSpan={3}>{r.PRICE}</td>
                  </tr>
                  )
                })
                }
              </>):<></>
            }
          </tbody>
          <tfoot border={0}>
            <tr style={{ border: 0, height: 20 }}>
              <td style={{ border: 0, fontWeight: 'normal' }} colspan={12}>
                单据备注: 白色~收据，红色~驾驶员、配送员，黄色~发货
              </td>
            </tr>
            <tr>
              <td style={{ border: 0, fontWeight: 'normal' }} colspan={12}>
              驾驶/配送员签字：：
                {}
              </td>
            </tr>
            <tr>
              <td style={{ border: 0 }} colspan={10}>
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
  }
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
