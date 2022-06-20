import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import { Form, Input, Upload, Button, Icon, message, Select, Tabs, Layout } from 'antd';
import { savePlan } from '@/services/cost/Cost';
import {makeFormData} from '@/pages/Cost/CostProject/CostProjectCreate'
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CreatePage from '@/pages/Component/RapidDevelopment/CommonLayout/CreatePage';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import CostPlanSearch from './CostPlanSearch'
import Item from 'antd/lib/list/Item';
const { Header, Footer, Sider, Content } = Layout;
const { TabPane } = Tabs

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostPlanDefCreate extends QuickCreatePage {
  state = {
    ...this.state,
    isNotHd: true,
    filelist: []
  }
  //继承QuickForm 重写drawTab方法 该方法用于重写跳转的界面
  /**
   * 
   * e的对象格式为{
      component: component,
      showPageNow: showPageNow,
      props: props,
   * }
   * props为{
   *  showPageNow: showPageNow,
      quickuuid: quickuuid,
      onlFormField: onlFormField,
      switchTab: (tab, param) => this.switchTab(tab, param),
      onlFormField: onlFormField,
      params: params,
      tableName: tableName,
      pathname: location.pathname,
   * }
   */
  constructor(props){
    super(props)
    props.onRef && props.onRef(this);
  }
  /**
     * 初始化表单数据
     */
  initEntity = async () => {
    const { onlFormInfos } = this.state;
    //初始化entity
    onlFormInfos.forEach(item => {
      this.entity[item.onlFormHead.tableName] = [];
    });
    if (this.props.showPageNow == 'update') {
      await this.initUpdateEntity(onlFormInfos);
      this.initFile();
    } else {
      this.initCreateEntity(onlFormInfos);
    }
  };

  initFile = () => {
    let savedList = [];
    if (this.entity.cost_plan[0]?.ACCESSORY_NAME) {
      let entity = this.entity.cost_plan[0];
      let entitys = this.entity.cost_plan[0].ACCESSORY_NAME.split(',');
      let filePaths = this.entity.cost_plan[0].ACCESSORY.split(',');
      entitys.forEach((item, index) => {
        let file = {
          UUID: entity.UUID,
          uid: index,
          name: item,
          status: 'saved',
          ACCESSORY: filePaths[index],
          ACCESSORY_NAME: item,
          isSaved: true,
        };
        savedList.push(file);
        this.setState({ filelist: savedList });
      });
    }
  };
  onSave = async (e) => {
    e.preventDefault();
     this.props.form.validateFields(async(err,values)=>{
      if(!err){
        const {list} = this.setting.state.data
    var formDatas = new FormData();
    makeFormData(this.entity.cost_plan[0], formDatas);
    if(list!=undefined && list.length>0){
      let paramList = []
      list.map(item=>{
        let param = {
          uuid:item.uuid,
          planUuid:item.PLAN_UUID,
          projectUuid:item.UUID,
          calcSort:item.CALC_SORT
        }
        paramList.push(param);

      })
      formDatas.append("costPlans",JSON.stringify(paramList));
    }
     
    this.state.filelist.forEach(element => {
      if (!element.isSaved) {
        formDatas.append('files', element.originFileObj);
      }
      // formDatas.append('files', element.originFileObj);
    });
    let res = await savePlan(formDatas);
    const success = res.data.success == true;
    this.afterSave(success);
    this.onSaved(success);
    if (success) {
      message.success('保存成功！');
    }
      }
    });
  }
  formLoaded = () => {
    const { formItems } = this.state;
    formItems.cost_plan_ACCESSORY.component = this.uploadComponent;
    this.setState({})
  };
  uploadComponent = props => {
    return (
      <Upload
        name="file"
        beforeUpload={() => {
          return false;
        }}
        //listType="picture"
        defaultFileList={[...this.state.filelist]}
        // fileList={[...this.state.filelist]}
        className="upload-list-inline"
        // onPreview={this.onPreview}
        onChange={file => {
          this.setState({ filelist: file.fileList });
        }}
        onRemove={file => {
          if (file.UUID) {
            let res = deleteFile(file);
            if (res.success) {
              message.success('删除成功！');
            }
          }
        }}
      >
        <Button>
          <Icon type="upload" />
          上传
        </Button>
      </Upload>
    );
  };
  render() {
    return <Layout style={{ backgroundColor: "white", height:'100%'}}>
      <div style={{paddingTop:20}}>
        <Button type='primary' style={{float:'right',marginLeft:10,marginRight:10}} onClick={this.onSave}>保存</Button>
        <Button style={{float:'right'}} onClick={() => { this.props.switchTab("query") }}>返回</Button>
      </div>
      <Content style={{marginLeft:'4.6%'}}>{this.drawForm()}</Content>
      <Footer style={{ backgroundColor: "white"}}> <CostPlanSearch quickuuid ="cost_plan_item" PLAN_UUID = {this.props?.params?.entityUuid} 
    onRef={c => (this.setting = c)}></CostPlanSearch></Footer>
    </Layout>
  }
}
