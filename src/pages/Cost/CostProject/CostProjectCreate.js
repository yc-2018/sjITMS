import { connect } from 'dva';
import { Form, Input, Upload, Button, Icon } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { save } from '@/services/cost/Cost';

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
  state = { ...this.state, filelist: [], fileList: [] };
  drawcell = e => {
    if (e.fieldName == 'CALCULATION_RULES') {
      const component = Input.TextArea;
      e.component = component;
      e.props = { ...e.props, style: { width: '100%', height: '200px' } };
    }
    if (e.fieldName == 'NOTE') {
      const component = Input.TextArea;
      e.component = component;
      e.props = { ...e.props, style: { width: '100%', height: '200px' } };
    }
    if (e.fieldName == 'ACCESSORY') {
      let item = () => {
        return (
          <Upload
            name="file"
            beforeUpload={() => {
              return false;
            }}
            //listType="picture"
            defaultFileList={[...this.state.filelist]}
            className="upload-list-inline"
            // onPreview={this.onPreview}
            onChange={file => {
              this.setState({ filelist: file.fileList });
            }}
          >
            <Button>
              <Icon type="upload" />
              上传
            </Button>
          </Upload>
        );
      };
      const component = item;
      e.component = component;
      // e.props = { ...e.props, style: { width: '100%', height: '200px' } };
    }
  };

  onSave = async e => {
    var formDatas = new FormData();
    makeFormData(this.entity.COST_PROJECT[0], formDatas);
    this.state.filelist.forEach(element => {
      formDatas.append('files', element.originFileObj);
    });
    let res = await save(formDatas);
    console.log('res', res);
    const success = res.success == true;
    this.afterSave(success);
    this.onSaved(success);
    if (success) {
      message.success(commonLocale.saveSuccessLocale);
    }
  };
}
