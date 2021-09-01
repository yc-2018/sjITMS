
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { TimePicker,message,Form,Checkbox,Table,Button,Tabs } from 'antd';
import Page from '@/pages/Component/Page/inner/Page';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import InterfaceLogTab from './InterfaceLogTab';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
const FormItem = Form.Item;
const format = 'HH:mm';
const TabPane = Tabs.TabPane;
@connect(({ interfaceConfig, loading }) => ({
    interfaceConfig,
    loading: loading.models.interfaceConfig,
}))
@Form.create()
export default class InterfaceConfig extends Component {
  state = {
    submitting: false,
    configList:[],
    tabOneKey:1,
    tabTwoKey:2,
  }

  componentDidMount() {
    this.query();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.interfaceConfig.data && nextProps.interfaceConfig.data.length > 0) {

      if(nextProps.interfaceConfig.data!=this.props.interfaceConfig.data){
        this.setState({
          configList:nextProps.interfaceConfig.data
        });
      }
    }
  }

  /**
   * 获取该配送中心的单据接口配置
   */
  query = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'interfaceConfig/query',
      payload: {
        orgId:loginOrg().uuid,
      },
    });
  };

  /**
   * 保存
   */
  save = (arr) => {
    const { dispatch } = this.props;
    const that = this;
    this.setState({
      submitting: true,
    })
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'interfaceConfig/openOrClose',
        payload: arr,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
            resolve({ success: true });
            that.setState({
              submitting: false,
            })
            return;
          } else {
            resolve({ success: false });
            that.setState({
              submitting: false,
            })
            return;
          }
        },
      });
    })
  };

  /**判断模块多选框是否是半选状态 */
  refreshModuleIndeterminate = (row)=>{
    let {configList } = this.state;
    let moduleNameMap={};
    let moduleNameMapCheck={};

    moduleNameMap[row.moduleName] = [];
    moduleNameMapCheck[row.moduleName] = [];

    configList.map(config=>{
      if(config.moduleName== row.moduleName){
        moduleNameMap[row.moduleName].push(config);
      }
      if(config.moduleName== row.moduleName&& config.open){
        moduleNameMapCheck[row.moduleName].push(config);
      }
    });

    if(moduleNameMap[row.moduleName].length==moduleNameMapCheck[row.moduleName].length){
      return false;
    }else if(moduleNameMapCheck[row.moduleName].length!=0&&moduleNameMap[row.moduleName].length>moduleNameMapCheck[row.moduleName].length){
      return true;
    }

  }

  /** 判断模块多选框是否被全部选中 */
  refreshModuleChecked =(row)=>{
    let {configList } = this.state;
    let moduleNameMapCheck={};
    moduleNameMapCheck[row.moduleName] = [];

    configList.map(config=>{
      if(config.moduleName== row.moduleName&& config.open){
        moduleNameMapCheck[row.moduleName].push(config);
      }
    });
    if(moduleNameMapCheck[row.moduleName].length==0){
      return false;
    }else{
      return true;
    }
  }

  /**当模块多选框改变时 */
  moduleOnChange = (row,e) =>{
    let {configList } = this.state;

    let arr =[];
    configList.map(config=>{
      if(config.moduleName== row.moduleName){
        config.open = e.target.checked
        let map ={
          uuid:config.uuid,
          open:e.target.checked
        };
        arr.push(map);
      }
    });

    this.save(arr).then(res => {
      if (res.success) {
        this.setState({
          configList:[...configList]
        });
      }
    }).catch(e => console.error(e));
  }

  /** 判断接口配置是否被选中*/
  refreshInterfaceChecked =(row) =>{
    if(row.open){
      return true;
    }else{
      return false;
    }
  }

  /**当接口配置框改变时 */
  interfaceOnChange = (row,e)=>{
    let {configList } = this.state;
    let arr =[];

    configList.map(config=>{
      if(config.uuid == row.uuid){
        config.open = e.target.checked
        let map ={
          uuid:config.uuid,
          open:e.target.checked
        };
        arr.push(map);
      }
    });

    this.save(arr).then(res => {
      if (res.success) {
        this.setState({
          configList:[...configList]
        });
      }
    }).catch(e => console.error(e));
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
  renderModuleCol = (value, row, index) => {
    if (row.first) {
      return ({
        children: <Checkbox
                    indeterminate={this.refreshModuleIndeterminate(row)}
                    onChange={this.moduleOnChange.bind(this, row)}
                    checked={this.refreshModuleChecked(row)}
                    key={row.moduleName}>
                    {row.moduleName}
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

  renderInterfaceCol = (value, row, index) => {
    return (
      <Checkbox
        checked={this.refreshInterfaceChecked(row)}
        onChange={this.interfaceOnChange.bind(this,row)}
        key={row.key}>
          {row.interfaceName}
      </Checkbox>
    );
  }
  /**
   * 表格列
   */
  columns = [{
      title: 'moduleName',
      dataIndex: 'moduleName',
      width: '200px',
      render: this.renderModuleCol
    },
    {
      title: 'count',
      dataIndex: 'count',
      width: '500px',
      render: this.renderInterfaceCol
    },
  ];
  // --绘制表格 结束--
  render() {
    const { interfaceConfig: { data }, loading,form } = this.props;
    const { configList,tabOneKey,tabTwoKey } = this.state;
    return (
      <div>
        <div className={styles.topWrapper}>
          <span className={styles.title}>{configLocale.interfaceConfig.interfaceConfig.name}</span>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab='接口配置' key="1">
            <ViewTabPanel style={{ 'marginTop': '0px' }} withoutTable={true}>
            <Table
              rowKey={record => record.uuid}
              columns={this.columns}
              dataSource={configList}
              bordered
              loading={this.state.submitting}
              showHeader={false}
              pagination={false} />
            </ViewTabPanel>
          </TabPane>
          <TabPane tab='配置日志' key="2">
            <EntityLogTab entityUuid={loginOrg().uuid+'InterfaceConfig'} key={tabOneKey}/>
          </TabPane>
          <TabPane tab='接口日志' key="3" onChange>
            <InterfaceLogTab key={tabTwoKey}/>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
