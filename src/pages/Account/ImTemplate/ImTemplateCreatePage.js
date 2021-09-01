import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Radio, Button,message, Select,Upload,Icon } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import configs from '@/utils/config';
import { imTemplateLocale } from './ImTemplateLocale';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import styles from './ImTemplate.less';
import { ImportTemplateType } from './ImTemplateContants';
import {loginKey} from '@/utils/LoginContext';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const templateOptions = [];
Object.keys(ImportTemplateType).forEach(function (key) {
  templateOptions.push(<Select.Option value={ImportTemplateType[key].name} key={ImportTemplateType[key].name}>{ImportTemplateType[key].caption}</Select.Option>);
});

@connect(({ imTemplate, loading }) => ({
  imTemplate,
  loading: loading.models.imTemplate,
}))
@Form.create()
class ImTemplateCreatePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      i:Math.random(),
      fileList:[],
      attachments: {},
      operate: '',
      path:'',
      modalVisible: false, //确认删除提示框
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedImportTemplate&&nextProps.selectedImportTemplate!=this.props.selectedImportTemplate) {
      this.setState({
        entity: nextProps.selectedImportTemplate?nextProps.selectedImportTemplate[0]:{},
        attachments:{},
        fileList:[],
        i:this.state.i+2
      })
    }
    if(nextProps.selectedImportTemplate==undefined&&nextProps.selectedType!=this.props.selectedType){
      this.setState({
        entity:{},
        attachments:{},
        fileList:[],
        i:this.state.i++
      });
    }
  }

  getPath=(key)=>{
    this.props.dispatch({
      type:'oss/get',
      payload:key,
      callback:response=>{
        if(response&&response.success){
          this.state.entity.path = response.data;
          this.setState({
            entity:this.state.entity,
            path: response.data
          })
        }
      }
    })
  }
  /**
   * 保存
   */
  handleSave = e => {
    e.preventDefault();
    const { form,selectedType } = this.props;
    const { entity } = this.state;
    
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      let data ={};

      if(entity.uuid){
        data = {
          uuid: entity.uuid,
          name: entity.name,
          type: entity.type,
          path:entity.path,
          version:entity.version
        };
      }else{
        data = {
          name: selectedType.caption+imTemplateLocale.title,
          type: selectedType.name,
          path:entity.path?entity.path:this.state.path
        };
      }
      this.props.handleSave(data);
    });
  };

  /**
   * 当选择的文件改变时调用
   */
  handleChange=(info)=>{
    const {attachments}=this.state;
    if (info.file.status === 'removed') {
      if (attachments[info.file.name] != undefined) {
        delete attachments[info.file.name];
        this.state.fileList.length =0;
        this.setState({
          fileList:[]
        })
      }
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name}`+imTemplateLocale.uploadSuccess);
      attachments[info.file.name] = info.file.response.data;
      this.getPath(attachments[info.file.name]);
      this.setState({
        attachments:attachments,
        fileList:info.fileList
      })

    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}`+imTemplateLocale.uploadFail);
    }
  }

  render() {
    const { form,selectedImportTemplate,selectedType } = this.props;
    const { entity,attachments,i } = this.state;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 7 },
    };
    
    const that = this;
    const props = {
      name: 'file',
      action: configs[API_ENV].API_SERVER + "/iwms-account/account/oss/upload",
      accept:'.xl*',
      headers: {
        iwmsJwt: loginKey()
      },
      withCredentials: true,
      onChange: this.handleChange,
    };

    return (
      <div>
        <div style={{marginTop:'-30px'}} className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{selectedImportTemplate&&entity?entity.name:imTemplateLocale.createTemp}</span>
        </div>
        <div className={styles.content}>
          <Form onSubmit={this.handleSave} {...formItemLayout}>
            <FormItem label={imTemplateLocale.tempName}>
              {form.getFieldDecorator('name')(
                <span>{entity.name?entity.name:selectedType.caption+imTemplateLocale.title}</span>
              )}
            </FormItem>
            <FormItem label={imTemplateLocale.tempType}>
              {form.getFieldDecorator('type')(
                <span>{entity.type?ImportTemplateType[entity.type].caption :selectedType.caption}</span>
              )}
            </FormItem>
            <FormItem label={imTemplateLocale.title}  key={selectedType.name+i}>
              {
                form.getFieldDecorator('upload',{
                  rules:[{
                    required:true,message:notNullLocale(imTemplateLocale.title)
                  }]
                })(
                    <Upload {...props}>
                      <Button disabled={this.state.fileList.length>0?true:false} onClick={this.onClick}>
                        <Icon type="upload" />{imTemplateLocale.title}
                      </Button>
                    </Upload>
                  
                )
              }
              <div style={{ width: '100%' }}> 支持扩展名：.xls xlsx</div>
            </FormItem>
            <FormItem
              wrapperCol={{
                xs: { span: 24, offset: 0 },
                sm: { span:16, offset: 11 },
              }}
            >
              <Button style={{marginLeft:'-60px'}} loading={this.state.submitting} type="primary" htmlType="submit">{commonLocale.saveLocale}</Button>
            </FormItem>
          </Form>
        </div>
      </div>
      
    );
  }
};
export default ImTemplateCreatePage;