import moment from 'moment';
import { connect } from 'dva';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { Form, Select, message, Col } from 'antd';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import CreatePage from '@/pages/Component/Page/CreatePage';
import React from 'react';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import ContainerTypeSelect from '@/pages/Component/Select/ContainerTypeSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';

@connect(({preview, loading}) => ({
  preview,
  loading: loading.models.preview,
}))
@Form.create()

/**
 * 没有预检组号的预检单的编辑页面
 */
export default class EditForSinglePreviewBill extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + '预检单',
      entityUuid: props.preview.entityUuid,
      entity: {
        items: []
      },
      pageFilter: {
        page: 0,
        pageSize: 5000,
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
      },
    };
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.preview.entity && nextProps.preview.entity.uuid) {
      this.setState({
        entity: nextProps.preview.entity,
        title: '预检单' + '：' + nextProps.preview.entity.billNumber,
      });
    }
  }

  onCancel = () => {
    this.props.form.resetFields();
    if (!this.props.preview.entityUuid) {
      this.props.dispatch({
        type: 'preview/showPage',
        payload: {
          showPage: 'query'
        }
      });
    } else {
      this.props.dispatch({
        type: 'preview/showPage',
        payload: {
          showPage: 'view',
          entityUuid: this.props.entityUuid
        }
      });
    }
  }

  setupCreation = () => {
    const { entity } = this.state;
    Array.isArray(entity.items) && entity.items.forEach(function(item) {
      if (!item.plateAdvice){
        item.plateAdvice = ''
      }
    })
    return entity;
  }
  onSave = (data) => {
    let payload = [];
    payload.push(this.setupCreation());
    this.props.dispatch({
      type: 'preview/onModify',
      payload: payload,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.modifySuccessLocale);
        }
      }
    });
  }

  onSaveAndCreate = (data) => {
    let payload = [];
    payload.push(this.setupCreation());
    this.props.dispatch({
      type: 'preview/onModify',
      payload: payload,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.modifySuccessLocale);
        }
      }
    });
  }

  refresh = () => {
    const { entityUuid } = this.state;

    this.props.dispatch({
      type: 'preview/get',
      payload: entityUuid
    });
  }

  handleFieldChange = (e, fieldName, line) => {
    const { entity, } = this.state;
    const target = entity.items[line - 1];

    if (fieldName === 'qtyStr') {
      target.qtyStr = e;
      target.qty = qtyStrToQty(e.toString(), target.qpcStr);
    }

    this.setState({
      entity: { ...entity },
    })
  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let cols = [
      <CFormItem label={'容器类型'} key='containerType'>
        {getFieldDecorator('containerType', {
          initialValue: JSON.stringify(entity.containerType? entity.containerType : undefined),
          rules: [
            { required: true, message: notNullLocale('容器类型') }
          ],
        })(<ContainerTypeSelect single={true} />)}
      </CFormItem>,
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} />
    ];
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { entity } = this.state;
    let cols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => <EllipsisCol colValue={'[' + record.article.code + ']' + record.article.name}/>,
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        dataIndex: 'qpcStr',
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth + 20,
        render: text => <EllipsisCol colValue={text}/>,
      },
      {
        title: commonLocale.inQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => <QtyStrInput value={record.qtyStr}
                                               onChange={e => this.handleFieldChange(e, 'qtyStr', record.line)}/>,
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyColWidth,
        render: (text, record) => <EllipsisCol colValue={record.qty}/>,
      },
    ];
    return (
      <div>
        <ItemEditTable
          title = {commonLocale.itemsLocale}
          columns={cols}
          noAddButton={true}
          notNote
          data={entity.items}
        />
      </div>
    )
  }
}
