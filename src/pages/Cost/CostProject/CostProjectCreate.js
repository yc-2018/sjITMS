import { connect } from 'dva';
import { Form, Input, Upload, Button, Icon, message, Select } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { save, deleteFile, analysisSql } from '@/services/cost/Cost';

function makeFormData(obj, form_data) {
  var data = [];
  if (obj instanceof File) {
    data.push({ key: '', value: obj });
  } else if (obj instanceof Array) {
    for (var j = 0, len = obj.length; j < len; j++) {
      var arr = makeFormData(obj[j]);
      for (var k = 0, l = arr.length; k < l; k++) {
        var key = !!form_data ? j + arr[k].key : '[' + j + ']' + arr[k].key;
        data.push({ key: key, value: arr[k].value });
      }
    }
  } else if (typeof obj == 'object') {
    for (var j in obj) {
      var arr = makeFormData(obj[j]);
      for (var k = 0, l = arr.length; k < l; k++) {
        var key = !!form_data ? j + arr[k].key : '.' + j + '' + arr[k].key;
        data.push({ key: key, value: arr[k].value });
      }
    }
  } else {
    data.push({ key: '', value: obj });
  }
  if (!!form_data) {
    // 封装
    for (var i = 0, len = data.length; i < len; i++) {
      form_data.append(data[i].key, data[i].value);
    }
  } else {
    return data;
  }
}

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostProjectCreate extends QuickCreatePage {
  state = { ...this.state, filelist: [], fileList: [], sqlFileds: [] };

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
    if (this.entity.COST_PROJECT[0]?.ACCESSORY_NAME) {
      let entity = this.entity.COST_PROJECT[0];
      let entitys = this.entity.COST_PROJECT[0].ACCESSORY_NAME.split(',');
      let filePaths = this.entity.COST_PROJECT[0].ACCESSORY.split(',');
      entitys.forEach((item, index) => {
        let file = {
          uuid: entity.UUID,
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

  parseSql = async () => {
    let sql = this.entity.COST_PROJECT[0].SQL;
    let param = {
      sql: sql,
    };
    let res = await analysisSql(param);
    console.log('res', res);
    if (res.success) {
      this.setState({ sqlFileds: res.data });
    }
  };

  sqlComponent = props => {
    return (
      <div style={{ textAlign: 'center' }}>
        <Input.TextArea {...props} style={{ width: '100%', height: '200px' }} />
        <Button type="primary" onClick={this.parseSql}>
          解析sql
        </Button>
      </div>
    );
  };

  selectComponent = props => {
    const { sqlFileds } = this.state;
    return (
      <Select {...props}>
        {sqlFileds.map(item => {
          return <Option value={item}>{item}</Option>;
        })}
      </Select>
    );
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
          console.log('file', file);
          if (file.uuid) {
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

  formLoaded = () => {
    const { formItems } = this.state;
    formItems.COST_PROJECT_SQL.component = this.sqlComponent;
    formItems.COST_PROJECT_ACCESSORY.component = this.uploadComponent;
    formItems.COST_PROJECT_CYCLE_FIELD.component = this.selectComponent;
    formItems.COST_PROJECT_CYCLE_BODY_FIELD.component = this.selectComponent;
    formItems.COST_PROJECT_BILLING_FIELD.component = this.selectComponent;
  };

  drawcell = e => {
    // if (e.fieldName == 'CYCLE_FIELD') {
    //   const component = this.selectComponent;
    //   e.component = component;
    //   e.props = { ...e.props, style: { width: '100%', height: '200px' } };
    // }
  };

  onSave = async e => {
    var formDatas = new FormData();
    makeFormData(this.entity.COST_PROJECT[0], formDatas);
    this.state.filelist.forEach(element => {
      console.log('element', element);
      if (!element.isSaved) {
        formDatas.append('files', element.originFileObj);
      }
      // formDatas.append('files', element.originFileObj);
    });
    let res = await save(formDatas);
    console.log('res', res);
    const success = res.data.success == true;
    this.afterSave(success);
    this.onSaved(success);
    if (success) {
      message.success('保存成功！');
    }
  };
}
