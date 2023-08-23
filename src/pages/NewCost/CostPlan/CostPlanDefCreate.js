import React, { useDebugValue } from 'react';
import { connect } from 'dva';
import { Form, Upload, Button, Icon, message, Layout } from 'antd';
import { savePlan, addHistory } from '@/services/cost/Cost';
import { makeFormData } from '@/pages/NewCost/CostProject/CostProjectCreate';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import CostPlanSearch from './CostPlanSearch';
const { Footer, Content } = Layout;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostPlanDefCreate extends QuickCreatePage {
  state = {
    ...this.state,
    isNotHd: true,
    filelist: [],
  };

  constructor(props) {
    super(props);
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
  onSave = async e => {
    const { onlFormFields } = this.state.onlFormInfos[0];
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const { list } = this.setting.state.data;
        var formDatas = new FormData();
        makeFormData(this.entity.cost_plan[0], formDatas);
        if (list != undefined && list.length > 0) {
          let paramList = [];
          list.map(item => {
            let param = {
              uuid: item.uuid,
              planUuid: item.PLAN_UUID,
              projectUuid: item.UUID,
              calcSort: item.CALC_SORT,
            };
            paramList.push(param);
          });
          formDatas.append('costPlans', JSON.stringify(paramList));
        }

        var columns = {};
        if (onlFormFields != undefined && onlFormFields.length > 0) {
          onlFormFields.map(item => {
            if (item.dbFieldName.toLowerCase() != 'stat') {
              let dbFieldName = item.dbFieldName.toLowerCase();
              columns[dbFieldName] = item.dbFieldTxt;
            }
          });
          formDatas.append('columns', JSON.stringify(columns));
        }
        this.state.filelist.forEach(element => {
          if (!element.isSaved) {
            formDatas.append('files', element.originFileObj);
          }
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
  };
  addHistory = async () => {
    await addHistory(this.props?.params?.entityUuid).then(e => {
      if (e && e.success) {
        message.success('添加历史版本成功');
      }
    });
  };
  formLoaded = () => {
    const { formItems } = this.state;
    formItems.cost_plan_ACCESSORY.component = this.uploadComponent;
    this.setState({});
  };
  uploadComponent = props => {
    return (
      <Upload
        name="file"
        beforeUpload={() => {
          return false;
        }}
        defaultFileList={[...this.state.filelist]}
        className="upload-list-inline"
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
    return (
      <Layout style={{ backgroundColor: 'white', height: '100%' }}>
        <div style={{ paddingTop: 20 }}>
          <Button
            type="primary"
            style={{ float: 'right', marginLeft: 10, marginRight: 10 }}
            onClick={this.addHistory}
          >
            添加历史记录
          </Button>
          <Button
            type="primary"
            style={{ float: 'right', marginLeft: 10, marginRight: 10 }}
            onClick={this.onSave}
          >
            保存
          </Button>
          <Button
            style={{ float: 'right' }}
            onClick={() => {
              this.props.switchTab('query');
            }}
          >
            返回
          </Button>
        </div>
        <Content style={{ marginLeft: '4.6%' }}>{this.drawForm()}</Content>
        <Footer style={{ backgroundColor: 'white' }}>
          {' '}
          <CostPlanSearch
            quickuuid="cost_plan_item"
            PLAN_UUID={this.props?.params?.entityUuid}
            onRef={c => (this.setting = c)}
          />
        </Footer>
      </Layout>
    );
  }
}
