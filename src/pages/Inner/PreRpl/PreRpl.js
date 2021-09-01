import { connect } from 'dva';
import { Fragment, PureComponent } from 'react';
import { Button, Modal, message, Spin, Icon, Progress } from 'antd';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import StandardTable from '@/components/StandardTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { RplMode } from '@/pages/Facility/PickArea/PickAreaContants';
import { RplBillType } from '@/pages/Out/Rpl/RplContants';
import PreRplForm from './PreRplForm';
import Empty from '@/pages/Component/Form/Empty';
import { rplLocale } from '@/pages/Out/Rpl/RplLocale';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import styles from '@/pages/Out/PickUp/PickUpBill.less';
import { routerRedux } from 'dva/router';
import { WaveBillState } from '@/pages/Out/Wave/WaveBillContants';
import { guid } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
@connect(({ preRpl, rpl, wave, loading }) => ({
  preRpl, rpl, wave,
  loading: loading.models.preRpl == undefined ? false : loading.models.preRpl,
}))
export default class PreRpl extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        list: [],
        pagination: {}
      },
      title: formatMessage({ id: 'menu.inner.prerpl' }),
      filterValue: {

      },
      scheduleModalvisible: false,//执行进度模态框
      schedule: {},//执行进度
      operate: '',
      modalVisible: false,
      abortAndConfirmButtonVisible: false
    }
  }

  shouldComponentUpdate() {
    if (this.props.location.pathname && this.props.location.pathname !== window.location.pathname) {
      return false;
    } else {
      return true;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.rpl.data
    });
    if (nextProps.preRpl.schedule) {
      this.setState({
        schedule: nextProps.preRpl.schedule
      });
      if (nextProps.preRpl.schedule.state == WaveBillState.STARTED.name ||
        nextProps.preRpl.schedule.state == WaveBillState.STARTEXCEPTION.name) {
        clearInterval(this.timerID);
        this.setState({
          traceId: undefined
        })
      }
    }

    this.setState({
      entity: nextProps.wave.entity
    });
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/out/rpl',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    }));
  }

  getWaveBill = (billNumber) => {
    this.props.dispatch({
      type: 'wave/getByNumber',
      payload: billNumber
    })
  }

  handleButtonVisible = (flag) => {
    this.setState({
      abortAndConfirmButtonVisible: flag
    });
  }

  /**
   * 执行预补波次
   */
  onExecute = (fieldsValue) => {
    this.props.preRpl.schedule = {};
    this.setState({
      noPagination: undefined,
      schedule: {},
    })
    let pickAreas = [];
    if (fieldsValue.pickArea) {
      for (let i = 0; i < fieldsValue.pickArea.length; i++) {
        pickAreas.push(JSON.parse(fieldsValue.pickArea[i]));
      }
    }
    let traceId = guid();
    this.setState({
      traceId: traceId
    })
    const param = {
      ...fieldsValue,
      pickAreas: pickAreas,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      traceId: traceId
    }
    delete param.pickArea;
    this.handleScheduleModalVisible(traceId);
    this.props.dispatch({
      type: 'preRpl/onExecute',
      payload: param,
      callback: response => {
        if (response && response.success) {
          if (response.data) {
            this.handleButtonVisible(true);
            this.getWaveBill(response.data);
            this.props.dispatch({
              type: 'rpl/query',
              payload: {
                page: 0,
                pageSize: 10,
                searchKeyValues: {
                  companyUuid: loginCompany().uuid,
                  dcUuid: loginOrg().uuid,
                  waveBillNumber: response.data
                }
              },
            })
          }
        } else {
          clearInterval(this.timerID);
          this.setState({
            traceId: undefined
          })
        }
      }
    })
  }
  /**
   * 查看进度显示/隐藏
   */
  handleScheduleModalVisible = (traceId) => {
    let id = traceId ? traceId : this.state.traceId;
    this.setState({
      scheduleModalvisible: !this.state.scheduleModalvisible
    }, () => {
      if (this.state.scheduleModalvisible == true && id) {
        this.timerID = setInterval(
          () => this.getSchedule(id),
          1000
        );
      } else if (this.state.scheduleModalvisible == false) {
        clearInterval(this.timerID)
      }
    });
  }
  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate) {
      this.setState({
        operate: operate
      })
    }
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === '确认') {
      this.onConfirm();
    } else if (operate === '回滚') {
      this.onAbort();
    }
  }
  /**
   * 确认
   */
  onConfirm = () => {
    this.props.dispatch({
      type: 'wave/onConfirm',
      payload: {
        uuid: this.state.entity.uuid,
        version: this.state.entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.handleButtonVisible(false);
          this.resetTable();
          message.success(commonLocale.confirmSuccessLocale);
        }
      }
    })
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 清空表格数据
   */
  resetTable = () => {
    this.setState({
      data: {
        list: [],
        pagination: {}
      },
      noPagination: true
    }, () => {
      this.props.rpl.data.list = [];
      this.props.rpl.data.pagination = {};
    })
  }
  /**
   * 作废
   */
  onAbort = () => {
    this.props.dispatch({
      type: 'wave/onAbort',
      payload: this.state.entity.billNumber,
      callback: response => {
        if (response && response.success) {
          this.handleButtonVisible(false);
          this.resetTable();
          message.success(commonLocale.rollBackSuccessLocale)
        }
      }
    })
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 获取执行进度
   */
  getSchedule(traceId) {
    this.props.dispatch({
      type: 'preRpl/getSchedule',
      payload: traceId,
    });
  }
  /**
   * 表格改变
   */
  onTableChange = (pagination, filters, sorter) => {
    this.props.dispatch({
      type: 'rpl/query',
      payload: {
        page: pagination.current - 1,
        pageSize: pagination.pageSize,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          waveBillNumber: this.state.entity.billNumber
        }
      },
    });
  }
  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth,
      render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>
    },
    {
      title: rplLocale.pickArea,
      dataIndex: 'pickarea',
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: rplLocale.type,
      width: colWidth.enumColWidth,
      render: record => RplBillType[record.type].caption
    },
    {
      title: rplLocale.mode,
      width: colWidth.codeNameColWidth,
      render: record => RplMode[record.rplMode].caption
    },
    {
      title: '应补件数',
      width: itemColWidth.qpcStrColWidth + 100,
      dataIndex: 'totalQtyStr',
    },
    {
      title: '实补件数',
      width: itemColWidth.qpcStrColWidth + 100,
      dataIndex: 'realTotalQtyStr',
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      render: record => <BadgeUtil value={record.state} />,
    },
  ];
  render() {
    const { data, filterValue, schedule, traceId, abortAndConfirmButtonVisible } = this.state;
    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} spinning={this.props.loading} >
          <Page>
            <NavigatorPanel title={this.state.title} />
            <div style={{padding:'12px 0'}}>
              <PreRplForm onExecute={this.onExecute} filterValue={''} buttonVisible={abortAndConfirmButtonVisible ? false : true} />
            </div>
            <div style={{position:'relative', marginTop:'15px'}}>
              <div style={{position:'absolute',top:'0px',left:'0px',height:'20px',lineHeight:'20px',color: '#354052',fontSize:'12px',fontWeight:'600'}}>{'执行结果'}</div>
              {abortAndConfirmButtonVisible ? <div className={styles.tableListOperator} style={{borderBottom:'0'}}>
                  <Button onClick={() => this.handleModalVisible('回滚')}
                  >回滚</Button><Button type="primary" onClick={() => this.handleModalVisible('确认')}
                >确认</Button>
                </div>
                : (traceId ? <div className={styles.tableListOperator} style={{borderBottom:'0'}}>
                  <Button onClick={() => this.handleScheduleModalVisible()}
                  >执行进度</Button>
                </div> : <div className={styles.header}  style={{borderBottom:'0'}}></div>)}
              <StandardTable
                rowKey={record => record.uuid}
                comId={'preRpl.search.table'}
                data={data}
                columns={this.columns}
                selectedRows={[]}
                unShowRow
                onChange={this.onTableChange}
                noPagination={this.state.noPagination}
              />
            </div>
            <Modal
              title='执行进度'
              visible={this.state.scheduleModalvisible}
              footer={null}
              onCancel={this.handleScheduleModalVisible}
              destroyOnClose
            >
              <Progress percent={(schedule.execuedStep / schedule.totalStep).toFixed(1) * 100} status={
                schedule.state === 'STARTED' ? 'success' : (schedule.state === 'STARTEXCEPTION' ? 'exception' : 'active')} />
              <span>{schedule.executeMessage}</span>
            </Modal>
            <ConfirmModal
              visible={this.state.modalVisible}
              operate={this.state.operate}
              object={'预补'}
              onOk={this.handleOk}
              onCancel={this.handleModalVisible}
            />
          </Page>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}
