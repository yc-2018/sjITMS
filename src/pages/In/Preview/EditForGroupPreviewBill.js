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
import ItemEditNestTable from '@/pages/Component/Form/ItemEditNestTable';
import { orderLocale } from '@/pages/In/Order/OrderLocale';
import Empty from '@/pages/Component/Form/Empty';
import { convertCodeName } from '@/utils/utils';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EditDtlModal from '@/pages/In/Preview/EditDtlModal';

@connect(({preview, loading}) => ({
  preview,
  loading: loading.models.preview,
}))
@Form.create()

/**
 * 有预检组号的预检单的编辑页面
 */
export default class EditForSinglePreviewBill extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      noSaveAndConfirm: true,
      title: '预检组号' + '：' + props.preview.groupNo,
      groupNo: props.preview.groupNo,
      ocrDate: props.preview.ocrDate,
      entity: {
        list:[{items: []}]},
      pageFilter: {
        page: 0,
        pageSize: 5000,
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
      },
      editVisible: false,
      dtlToEdit: {},
    };
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.preview.entity && nextProps.preview.entity.list && nextProps.preview.entity.list.length > 0) {
      this.setState({
        entity: nextProps.preview.entity,
      });
    }
  }

  onCancel = () => {
    const { groupNo, ocrDate } = this.state;
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'preview/showPage',
      payload: {
        showPage: 'view',
        groupNo: groupNo,
        ocrDate: ocrDate,
      }
    });
  }

  setupCreation = () => {
    const { entity } = this.state;
    Array.isArray(entity.list) && entity.list.forEach(function(order) {
      Array.isArray(order.items) && order.items.forEach(function(item) {
        if (!item.plateAdvice){
          item.plateAdvice = ''
        }
      })
    })
    return entity.list;
  }

  onSave = (data) => {

    let payload = this.setupCreation();
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
    const { entity } = this.state;

    this.props.dispatch({
      type: 'preview/modify',
      payload: this.setupCreation(),
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.modifySuccessLocale);
        }
      }
    });
  }

  refresh = () => {
    const { groupNo, ocrDate } = this.state;
    let payload;
    if(groupNo) {
      payload = {
        groupNo: groupNo,
        ocrDate: ocrDate
      }
      this.props.dispatch({
        type: 'preview/getByGroupNo',
        payload: payload
      });
    }
    else {

    }
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
          initialValue: JSON.stringify(entity.list && entity.list.length > 0? entity.list[0].containerType : undefined),
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

  handleQtyStrModified = (data) => {
    const { entity } = this.state;
    entity.list.forEach(function(preview) {
      preview.items.forEach(function(dtl) {
        if (dtl.uuid === data.uuid){
          dtl.qtyStr = data.qtyStr;
          dtl.qty = data.qty;
        }
      })
    })
    this.setState({
      entity : {...entity},
      editVisible : !this.state.editVisible,
    })
  }

  handleVisible = () => {
    this.setState({
      editVisible : !this.state.editVisible,
    })
  }

  showEditModal = (record) => {
    this.setState({
      dtlToEdit: record,
      editVisible : !this.state.editVisible,
    })
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { entity, dtlToEdit } = this.state;
    let mstCols = [
      {
        title: '预检序号',
        key: 'serialNo',
        width: 80,
        render: record => <EllipsisCol colValue={record.serialNo}/>,
      },
      {
        title: commonLocale.billNumberLocal,
        width: colWidth.billNumberColWidth,
        key: 'billNumber',
        render: record => <EllipsisCol colValue={record.billNumber}/>,
      },
      {
        title: commonLocale.orderBillNumberLocal,
        width: colWidth.billNumberColWidth,
        key: 'orderBillNumber',
        render: record => <EllipsisCol colValue={record.orderBillNumber}/>,
      },
      {
        title: commonLocale.inVendorLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'vendor',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: orderLocale.wrh,
        width: colWidth.codeNameColWidth,
        dataIndex: 'wrh',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: commonLocale.inlogisticModeLocale,
        width: colWidth.enumColWidth,
        render: record => record.logisticMode? LogisticMode[record.logisticMode].caption : <Empty />
      },
      {
        title: '发生时间',
        width: colWidth.dateColWidth,
        render: record => <span>{record.ocrDate ? moment(record.ocrDate).format('YYYY-MM-DD') : <Empty />}</span>,
      },
      {
        title: commonLocale.stateLocale,
        width: colWidth.enumColWidth,
        render: record => <BadgeUtil value={record.state} />
      },
    ];
    let dtlCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => <a onClick={()=>this.showEditModal(record)}>{'[' + record.article.code + ']' + record.article.name}</a>,
      },
      {
        title: commonLocale.qpcStrLocale,
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
        render: (text, record) => <a onClick={()=>this.showEditModal(record)}>{record.qtyStr}</a>,
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
        <ItemEditNestTable
          title = {commonLocale.itemsLocale}
          columns={mstCols}
          nestColumns={dtlCols}
          noAddButton={true}
          notNote
          hasPagination={true}
          data={entity}
        />
        <EditDtlModal
          type={"aaaa"}
          editVisible={this.state.editVisible}
          previewDtl={this.state.dtlToEdit}
          qtyStr={dtlToEdit.qtyStr}
          qty={dtlToEdit.qty}
          editPreview={true}
          onCancel={this.handleVisible}
          onOK={this.handleVisible}
          handleQtyStrModified={this.handleQtyStrModified}
        />
      </div>
    )
  }
}
