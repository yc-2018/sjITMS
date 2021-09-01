import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { TimePicker, message, Form, Checkbox, Table, Button, Tabs } from 'antd';
import Page from '@/pages/Component/Page/inner/Page';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import DailyLogTab from './DailyLogTab';
import { havePermission } from '@/utils/authority';
import { CONFIG_RES } from '../ConfigPermission';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import ResourceDescHeader from '@/pages/Component/Page/inner/ResourceDescHeader';

const FormItem = Form.Item;
const format = 'HH:mm';
const TabPane = Tabs.TabPane;
@connect(({ dailyKnotsConfig, loading }) => ({
    dailyKnotsConfig,
    loading: loading.models.dailyKnotsConfig,
}))
@Form.create()
export default class BillDailyKnotsConfig extends Component {
  state = {
    submitting: false,
    configList:[],
    tabOneKey:1,
    tabTwoKey:2,
  }

  componentDidMount() {
    this.fetchBillTypeByDCUuid();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dailyKnotsConfig.data && nextProps.dailyKnotsConfig.data.length > 0) {

      this.setState({
        configList:nextProps.dailyKnotsConfig.data
      });
    }
  }

  /**
   * 获取该配送中心的单据日结配置
   */
  fetchBillTypeByDCUuid = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'dailyKnotsConfig/getBycompanyUuidAndDcUuid',
      payload: {
        dcUuid:loginOrg().uuid,
        companyUuid:loginCompany().uuid
      },
    });
  };

  /**
   * 保存
   */
  save = () => {
    const { dispatch } = this.props;
    const { configList } = this.state;
    this.setState({
      submitting: true,
    })
    let arr =[];
    configList.map(config=>{
      let map={
        uuid:config.uuid,
        time:config.time,
      };
      arr.push(map)
    });
    dispatch({
      type: 'dailyKnotsConfig/onModify',
      payload: arr,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.modifySuccessLocale);
          this.fetchBillTypeByDCUuid();
        }
        this.setState({
          submitting: false,
        })
      },
    });
  };

  /**判断流程多选框是否是半选状态 */
  refreshProcessIndeterminate = (row)=>{
    let {configList } = this.state;
    let processNameMap={};
    let processNameMapCheck={};

    processNameMap[row.processName] = [];
    processNameMapCheck[row.processName] = [];

    configList.map(config=>{
      if(config.processName== row.processName){
        processNameMap[row.processName].push(config);
      }
      if(config.processName== row.processName&& config.dailyKnots){
        processNameMapCheck[row.processName].push(config);
      }
    });

    if(processNameMap[row.processName].length==processNameMapCheck[row.processName].length){
      return false;
    }else if(processNameMapCheck[row.processName].length!=0&&processNameMap[row.processName].length>processNameMapCheck[row.processName].length){
      return true;
    }

  }

  /** 判断流程多选框是否被全部选中 */
  refreshProcessChecked =(row)=>{
    let {configList } = this.state;
    let processNameMapCheck={};
    processNameMapCheck[row.processName] = [];

    configList.map(config=>{
      if(config.processName== row.processName&& config.dailyKnots){
        processNameMapCheck[row.processName].push(config);
      }
    });
    if(processNameMapCheck[row.processName].length==0){
      return false;
    }else{
      return true;
    }
  }

  /**当流程多选框改变时 */
  processOnChange = (row,e) =>{
    let {configList } = this.state;
    configList.map(config=>{
      if(config.processName== row.processName){
        config.dailyKnots = e.target.checked
        if(!config.time){
          config.time = '01:00';
        }
        if(!e.target.checked){
          config.time = undefined
        }
      }
    });
    this.setState({
      configList:[...configList]
    })
  }

  /** 判断单据日结配置是否被选中*/
  refreshModuleChecked =(row) =>{
    if(row.dailyKnots){
      return true;
    }else{
      return false;
    }
  }

  /**当日结配置多选框改变时 */
  moduleOnChange = (row,e)=>{
    let {configList } = this.state;
    configList.map(config=>{
      if(config.uuid == row.uuid){
        config.dailyKnots = e.target.checked
        if(!config.time){
          config.time = '01:00';
        }
        if(!e.target.checked){
          config.time = undefined
        }
      }
    });
    this.setState({
      configList:[...configList]
    })
  }

  /**
   * 时间选择器改变时触发
   */
  onChangeTime = (row,time,timeString) => {
    let { configList } = this.state;
    configList.map(config=>{
      if(config.uuid == row.uuid){
        config.time = timeString;
      }
    });
    this.setState({
      configList:[...configList]
    })
  }
   /**
   * 切换tab页
   */
  handleChangeTab =(key)=>{
    if(key == "2"){
      this.setState({
        tabOneKey:this.state.tabOneKey+1
      })
    }else if(key == "3"){
      this.setState({
        tabTwoKey:this.state.tabTwoKey+1
      })
    }
  }

 // --绘制表格 开始--
  renderProcessCol = (value, row, index) => {
    if (row.first) {
      return ({
        children: <Checkbox
                    indeterminate={this.refreshProcessIndeterminate(row)}
                    onChange={this.processOnChange.bind(this, row)}
                    checked={this.refreshProcessChecked(row)}
                    key={row.processName}>
                    {row.processName}
                  </Checkbox>,
        props: {
          rowSpan: row.count
        }
      });
    } else {
      return ({
        props: { rowSpan: 0 }
      });
    }
  }

  renderModuleCol = (value, row, index) => {
    return (
      <Checkbox
        checked={this.refreshModuleChecked(row)}
        onChange={this.moduleOnChange.bind(this,row)}
        key={row.key}>
          {row.daliyName}
      </Checkbox>
    );
  }
  renderTimeCol = (value, row, index) => {
    if(row.dailyKnots){
      return (
        <TimePicker
          key={row.time}
          value ={moment(row.time?row.time:'01:00', format)}
          format={format}
          onChange={this.onChangeTime.bind(this, row)}
        />
      )
    }
  }

  drawActionButton = () => {
    return (
      <Fragment>
        <Button loading={this.state.submitting} type='primary' onClick={this.save}
              //  disabled={!havePermission(CONFIG_RES.BILLDAILYKNOTSCONFIGEDIT)}
        >
          {commonLocale.saveLocale}
        </Button>
      </Fragment>
    );
  }
  /**
   * 表格列
   */
  columns = [{
      title: 'processName',
      dataIndex: 'processName',
      width: '200px',
      render: this.renderProcessCol
    },
    {
      title: 'count',
      dataIndex: 'count',
      width: '500px',
      render: this.renderModuleCol
    },
    {
      title: 'time',
      dataIndex: 'time',
      width: '180px',
      render: this.renderTimeCol
    },
  ];
  // --绘制表格 结束--
  render() {
    const { dailyKnotsConfig: { data }, loading,form } = this.props;
    const { configList,tabOneKey,tabTwoKey } = this.state;
    return (
      <div>
        {(this.drawActionButton) &&
        <div className={styles.topWrapper}>
          <span className={styles.title}>{configLocale.dailyKnotsConfig.billDailyKnotsConfig.name}</span>
          <ResourceDescHeader title={this.state.title} />
          <div className={styles.action}>
            {this.drawActionButton && this.drawActionButton()}
          </div>
        </div>
        }
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab='日结配置' key="1">
            <ViewTabPanel style={{'marginTop': '0px'}} withoutTable={true}>
            <Table
              rowKey={record => record.uuid}
              columns={this.columns}
              dataSource={configList}
              bordered
              showHeader={false}
              pagination={false} />
            </ViewTabPanel>
          </TabPane>
          <TabPane tab='配置日志' key="2" onChange>
            <EntityLogTab entityUuid={loginOrg().uuid+'DailyKnots'} key={tabOneKey}/>
          </TabPane>
          <TabPane tab='日结日志' key="3" onChange>
            <DailyLogTab key={tabTwoKey}/>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
