import { connect } from 'dva';
import moment from 'moment';
import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import TextArea from 'antd/lib/input/TextArea';
import { Modal,message, Form,Tabs,Row,Col,Select,DatePicker,InputNumber } from 'antd';
import { convertCodeName,formatDate } from '@/utils/utils';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import Empty from '@/pages/Component/Form/Empty';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { SuperType,SHELFLIFE_TYPE,STATE } from './SuperManagementBoardContants';
import { SuperManagementBoardLocale } from './SuperManagementBoardLocale';
import styles from './SuperManagementBoard.less';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const superTypeOptions = [];
Object.keys(SuperType).forEach(function (key) {
    superTypeOptions.push(<Select.Option key={key} value={SuperType[key].name}>{SuperType[key].caption}</Select.Option>);
});


const FormItem = Form.Item;
@connect(({ supermanagement,article, loading }) => ({
  supermanagement,article,
  loading: loading.models.supermanagement,
}))
@Form.create()

export default class SuperManagementBoardCreatePage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isCreateVisible: props.isCreateVisible,
      modalLoading:false,

      entity: props.entity,
      controlDaysLable:SuperManagementBoardLocale.oldControlDays,
      deliveryControlDays:0,
      receiveControlDays:0,
      returnControlDays:0,
    }
  }
  componentWillReceiveProps(nextProps){

    if(nextProps.isCreateVisible!=this.props.isCreateVisible){
      this.setState({
        isCreateVisible:nextProps.isCreateVisible,
      })
    }
    if(nextProps.entity!=this.props.entity){
      this.setState({
        entity:nextProps.entity,
      })
    }
    if(nextProps.article.entity && nextProps.article.entity!=this.props.article.entity){
      this.state.entity.shelfLifeDays = nextProps.article.entity.shelfLifeDays;
      this.state.entity.shelfLifeType = nextProps.article.entity.shelfLifeType;
      this.state.entity.oldControlDays = undefined;
      this.setState({
          entity:{...this.state.entity},
          deliveryControlDays : nextProps.article.entity.deliveryControlDays,
          receiveControlDays : nextProps.article.entity.receiveControlDays,
          returnControlDays : nextProps.article.entity.returnControlDays,
      })
    }
  }

  /**
   * 保存
   */
  handleOk() {

    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
        if (err) return;
        fieldsValue.article = JSON.parse(fieldsValue.article);
        this.setState({
          modalLoading: true
        });
        const data = {
            ...fieldsValue,
            companyUuid:loginCompany().uuid,
            dcUuid:loginOrg().uuid,
            startDate:formatDate(fieldsValue.time[0], true),
            endDate:formatDate(fieldsValue.time[1], true),
        };

        this.props.dispatch({
            type: 'supermanagement/onSave',
            payload: data,
            callback: (response) => {
                if (response && response.success) {
                    this.setState({
                        isCreateVisible: false,
                        modalLoading: false
                    });
                    this.props.form.resetFields();
                    message.success(commonLocale.saveSuccessLocale);
                    this.props.refreshTable();
                } else {
                    this.setState({
                        modalLoading: false
                    });
                }
            }
        });
    });
  }

  /**
   * 取消添加
   */
  handleCancel() {
    this.setState({
        isCreateVisible:!this.state.isCreateVisible,
        controlDaysLable:SuperManagementBoardLocale.oldControlDays,
        deliveryControlDays:0,
        receiveControlDays:0,
        returnControlDays:0,
        entity:{}
    });
    this.props.form.resetFields();
    this.props.refreshTable();
  }
   /**
     * 更改商品
     */
  handleArticleChange = (value)=>{

    let article = JSON.parse(value);
    this.props.dispatch({
        type: 'article/get',
        payload: {
          uuid: article.uuid
        }
    });
    const { form } = this.props;

    form.setFieldsValue({
      type:undefined,
      oldControlDays:undefined
    });
  }

  /**
   * 更改超保类型
   */
  handleSuperTypeChange =(value)=>{
    const { entity } = this.state;
    let text = ''
    if(value ===SuperType.RECEIVECONTROLDAY.name){
        entity.oldControlDays = this.state.receiveControlDays;
        text = SuperType.RECEIVECONTROLDAY.caption;
    }else if(value ===SuperType.DELIVERYCONTROLDAY.name){
        entity.oldControlDays = this.state.deliveryControlDays;
        text = SuperType.DELIVERYCONTROLDAY.caption;
    }else if(value ===SuperType.RETURNCONTROLDAY.name){
        entity.oldControlDays = this.state.returnControlDays;
        text = SuperType.RETURNCONTROLDAY.caption;
    }
    this.setState({
        entity:{...entity},
        controlDaysLable:text
    });
  }
  /**
   * 设置不可选择的日期
   */
  disabledDate = (current)=>{
    return current && current < moment().add(-1, 'days').endOf('day');
  }

  render(){
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    return (
      <Modal
        title={SuperManagementBoardLocale.add}
        visible={this.state.isCreateVisible}
        confirmLoading={this.state.modalLoading}
        destroyOnClose={true}
        onOk={()=>this.handleOk()}
        onCancel={()=>this.handleCancel()}
        okText={commonLocale.confirmLocale}
        cancelText={commonLocale.cancelLocale}
      >
        <Form>
            <FormItem label={commonLocale.articleLocale}
              {...baseFormItemLayout}
            >
              {getFieldDecorator('article', {
                  initialValue: entity &&entity.article ? convertCodeName(entity.article) : undefined ,
                  rules: [
                      { required: true, message: notNullLocale(commonLocale.articleLocale) }
                  ],
              })(
                  <ArticleSelect
                      placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
                      onChange={e=>this.handleArticleChange(e)}
                      showSearch={true}
                      single
                  />
              )}
            </FormItem>
            <FormItem
                {...baseFormItemLayout}
                label={SuperManagementBoardLocale.shelf}>
                {getFieldDecorator('shelfLifeDays', {
                    initialValue:  entity&&entity.shelfLifeDays?entity.shelfLifeDays:undefined,

                })(
                    entity&&entity.shelfLifeDays?<span>{entity.shelfLifeDays}</span>:<Empty/>
                )}
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.shelfType}>
              {getFieldDecorator('shelfLifeType', {
                  initialValue:  entity&&entity.shelfLifeType?entity.shelfLifeType:undefined
              })(
                  entity&&entity.shelfLifeType?<span>{SHELFLIFE_TYPE[entity.shelfLifeType].caption}</span>:<Empty/>
              )}
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.type}>
              {getFieldDecorator('type', {
                  initialValue: entity&&entity.type ? convertCodeName(entity.type):undefined,
                  rules: [
                      { required: true, message: notNullLocale(SuperManagementBoardLocale.type) }
                  ],
              })(
              <Select
                  onChange = {e=>this.handleSuperTypeChange(e)}
                  placeholder={placeholderChooseLocale(SuperManagementBoardLocale.type)}>
                  {superTypeOptions}
              </Select>
                )}
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={this.state.controlDaysLable}>
              {getFieldDecorator('oldControlDays', {
                  initialValue:  entity&&entity.oldControlDays?entity.oldControlDays:undefined,
              })(
                  entity&&entity.oldControlDays?<span>{entity.oldControlDays}</span>:<Empty/>
              )}
            </FormItem>
            <FormItem label={SuperManagementBoardLocale.startToEndDate}
                {...baseFormItemLayout}
            >
              {getFieldDecorator('time', {
                  initialValue: entity &&entity.startDate&&entity.endDate ?
                  [moment(entity.startDate,'YYYY-MM-DD'),moment(entity.endDate,'YYYY-MM-DD')]:undefined,
                  rules: [
                      { required: true, message: notNullLocale(SuperManagementBoardLocale.startToEndDate) }
                  ],
              })(
                  <RangePicker
                      disabledDate={this.disabledDate}
                  />
              )}
            </FormItem>
            <FormItem
                {...baseFormItemLayout}
                label={SuperManagementBoardLocale.newControlDays}>
                {getFieldDecorator('newControlDays', {
                    initialValue: entity &&entity.newControlDays ? entity.newControlDays:undefined,
                    rules: [
                        { required: true, message: notNullLocale(SuperManagementBoardLocale.newControlDays) }
                    ],
                })(
                    <InputNumber
                        min={0}
                        precision={0}
                        max={10000}
                        style={{ width: '100%' }}
                        placeholder={placeholderLocale(SuperManagementBoardLocale.newControlDays)}
                    />
                )}
            </FormItem>
            <FormItem
                {...baseFormItemLayout}
                label={commonLocale.noteLocale}
            >
              {
                getFieldDecorator('note', {
                    rules: [{max: 255, message: tooLongLocale(commonLocale.noteLocale),}],
                    initialValue: entity.note,
                })(
                    <TextArea placeholder={placeholderLocale(commonLocale.noteLocale)} />
                )
              }
            </FormItem>
        </Form>
    </Modal>
    );
  }
}
