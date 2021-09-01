import React, {Component,Fragment} from 'react';
import { Form, Button, Input, message, Spin, Card, DatePicker, Col, Row, } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { havePermission } from '@/utils/authority';
import { STOCKORDER_RES } from '@/pages/Out/StockOrder/StockOrderPermission';
import { codePattern_4 } from '@/utils/PatternContants';
import {stockOrderLocale} from '@/pages/Out/StockOrder/StockOrderLocale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { codePattern } from '@/utils/PatternContants';
import { commonLocale, notNullLocale,tooLongLocale, placeholderLocale, placeholderChooseLocale, confirmLineFieldNotNullLocale } from '@/utils/CommonLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import {orgType} from '@/utils/OrgType';
import { STATE } from '@/utils/constants';
import moment from 'moment';
import styles from './Contract.less';
import SearchPanel from '@/pages/Component/Page/inner/SearchPanel';
const FormItem = Form.Item;

@connect(({ stockAllocateOrder, loading }) => ({
  stockAllocateOrder,
  loading: loading.models.stockAllocateOrder,
}))
@Form.create()
export default class ContractMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      entity: {},
      operate: '',
      modalVisible: false, //确认删除提示框
      createModalVisible: false, //新增 编辑顺序的modal
    }
  }
  componentDidMount = () => {
    this.getScheme();
  }
  componentDidUpdate(){
    if(document.getElementById('code')!=null&&(document.activeElement.tagName =='BUTTON' || document.activeElement.tagName =='A'||document.activeElement.id == 'code')){
      document.getElementById('code').focus();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.stockAllocateOrder.stockScheme) {
      this.setState({
        entity: nextProps.stockAllocateOrder.stockScheme
      })
    }
    if (this.props.scheme != nextProps.scheme && nextProps.scheme) {
      this.getScheme(nextProps.scheme.uuid);
    }
    if (nextProps.scheme==undefined){
      this.setState({
        entity:{}
      })
    }
    if (nextProps.scheme == undefined && this.props.scheme != undefined) {
      this.props.form.resetFields();
    }
  }

  /**
   * 查询一条方案的信息
   */
  getScheme=(uuid)=>{
    const { dispatch,scheme,form} = this.props;
    form.resetFields();
    dispatch({
      type: 'stockAllocateOrder/getScheme',
      payload: {
        uuid: uuid ? uuid : (scheme?scheme.uuid:null)
      },
    });
  }

  /**
   * 新增拣货顺序的弹窗显示控制
   */
  handleCreateModalVisible = (flag) => {
    this.setState({
      createModalVisible: !!flag,
    });
  };

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible =(operate)=>{
    if(operate){
      this.setState({
        operate:operate
      })
    }
    this.setState({
      modalVisible:!this.state.modalVisible
    });
  }
  /**
   * 模态框确认操作
   */
  handleOk = () =>{
    const {operate,entity} = this.state;
    if (operate === commonLocale.deleteLocale){
      this.handleRemove(entity);
    }
  }

  /**
   * 删除
   */
  handleRemove = (entity) =>{
    const { dispatch } = this.props;
    dispatch({
      type: 'stockAllocateOrder/removeScheme',
      payload: {
        uuid:entity.uuid,
        version:entity.version
      },
      callback: response => {
        if (response&&response.success) {
          message.success(formatMessage({ id: 'common.message.success.delete' }));
          this.props.reFreshSider();
        }
      },
    });
    this.setState({
      modalVisible:!this.state.modalVisible
    })
  }


  /**
   * 保存
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { form,dispatch } = this.props;
    const { entity } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      this.setState({
        submitting: true,
      })

      let type = 'stockAllocateOrder/saveScheme';
      if (entity.uuid) {
        type = 'stockAllocateOrder/modifyScheme';
        fieldsValue.uuid = entity.uuid
      }
      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid:loginOrg().uuid,
        version: entity.version
      };
      dispatch({
        type: type,
        payload: { ...values },
        callback: (response) => {
          if (response && response.success) {
            message.success(formatMessage({ id: 'common.message.success.operate' }));
            form.resetFields();
            this.props.reFreshSider();
            // TODO:留在当前新增的界面
          }
          this.setState({
            submitting: false,
          })
        },
      });
    });
  }

  /**根据子类构造的查询条件列，构造搜索表单的行 */
  drawRows = () => {
    let rows = [];
    let currentRowCols = [];
    let cols = this.drawCols ? this.drawCols() : [];
    //增加查询天数条件
    const { form, filterValue } = this.props;
    for (let i = 0; i < cols.length; i++) {
      let col = cols[i];
      if (currentRowCols.length < 3) {
        currentRowCols.push(col);
      } else {
        rows.push(<Row key={i} gutter={16}>{currentRowCols}</Row>);
        currentRowCols = [];
        currentRowCols.push(col);
      }

      if (i === cols.length - 1) {
        currentRowCols.push(this.drawButtonGroup());
        rows.push(<Row key={i + 'btn'} gutter={16}>{currentRowCols}</Row>);
      }
    }
    return rows;
  }

  render() {
    const { stockAllocateOrder: { data }, loading, scheme } = this.props;
    const {entity,createModalVisible} = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };

    const noteItemLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 36 },
      colon: false,
    };

    let cols = [
      <CFormItem key="code" label={commonLocale.codeLocale}>
        {getFieldDecorator('code', {
          initialValue: entity.code,
          rules: [
            { required: true, message: notNullLocale(commonLocale.codeLocale) },
            {
              pattern: codePattern.pattern,
              message: codePattern.message,
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
      </CFormItem>,
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {getFieldDecorator('name', {
          initialValue: entity ? entity.name : null,
          rules: [
            { required: true, message: notNullLocale(commonLocale.nameLocale) },
            {
              max: 50,
              message: tooLongLocale(commonLocale.nameLocale, 50),
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
      </CFormItem>,
      <CFormItem key='expireDate' label={'开始时间'}>
        {
          getFieldDecorator('expireDate', {
            initialValue: entity.expireDate ? moment(entity.expireDate, 'YYYY-MM-DD') : undefined,
            rules: [
              { required: true, message: notNullLocale(commonLocale.validDateLocale) }
            ],
          })(
            <DatePicker style={{ width: '100%' }} placeholder={placeholderChooseLocale(commonLocale.validDateLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='alcDate' label={'结束时间'}>
        {
          getFieldDecorator('alcDate', {
            initialValue: entity.alcDate ? moment(entity.alcDate, 'YYYY-MM-DD') : undefined,
            rules: [
              { required: true, message: notNullLocale('结束时间') }
            ],
          })(
            <DatePicker style={{ width: '100%' }} placeholder={placeholderChooseLocale('结束时间')} />
          )
        }
      </CFormItem>,
      <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
        {getFieldDecorator('owner', {
          initialValue: JSON.stringify(entity.owner),
          rules: [
            { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
          ]
        })(
          <OwnerSelect onChange={this.onOwnerChange} onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
        )}
      </CFormItem>,
      <CFormItem label={commonLocale.inVendorLocale} key='vendor'>
        {getFieldDecorator('vendor', {
          initialValue: entity.vendor ? entity.vendor : undefined
        })(
          <OrgSelect
            upperUuid={loginCompany().uuid}
            state={STATE.ONLINE}
            type={orgType.vendor.name}
            single
            placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
          />
        )}
      </CFormItem>,
    ]

    return (
      <div>
        <PageHeaderWrapper>
          <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading} >
            <Page>
              <Card bordered={false}>
                <Form autoComplete="off">
                  <FormPanel key='basicInfo' cols={cols} />
                  <div>
                    <div style={{'color':'#7f8fa4','marginBottom':'5px'}}>
                      {'合同文本'}
                    </div>
                    <Row style={{ marginLeft: 30 }}>
                      <Col span={36}>
                        <FormItem {...noteItemLayout}>
                          {getFieldDecorator('note', {
                            initialValue: this.state.entity.note
                          })(<Input.TextArea onChange={this.onChange} rows={6} placeholder='请输入合同文本' />)}
                        </FormItem>
                      </Col>
                    </Row>
                  </div>
                </Form>
              </Card>
            </Page>
          </Spin>
        </PageHeaderWrapper>
        {/*<SearchPanel>*/}
          {/*<Form  {...formItemLayout}  className={styles.searchForm} autoComplete="off">*/}
            {/*{this.drawRows()}*/}
          {/*</Form>*/}
        {/*</SearchPanel>*/}
      </div>

    )
  }
}
