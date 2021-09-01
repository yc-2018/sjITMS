import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { Form, Select, Input, InputNumber, Popconfirm, message, DatePicker, Divider } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { convertCodeName, formatDate } from '@/utils/utils';
import moment from 'moment';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import { isArray } from 'util';
import { pickBinAdjBillLocale } from './PickBinAdjBillLocale';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';
import PickSchemeArticleSelect from './PickSchemeArticleSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';

const { TextArea } = Input;
@connect(({ pickBinAdjBill, pickSchema, loading }) => ({
  pickBinAdjBill, pickSchema,
  loading: loading.models.pickBinAdjBill,
}))
@Form.create()
export default class PickBinAdjBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + pickBinAdjBillLocale.title,
      auditButton: true,
      entity: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        method: 'MANUAL',
        items: [],
        pickBinAdjer: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        }
      },
      items: [],
      sourceBinCode: '',
      targetBinCode: '',
      pickSchemas: [],

      batchAddVisible: false,
      pageFilter: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        }
      },
      auditPermission:"iwms.inner.pickBinAdj.audit"
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    const { pickSchemas } = this.state;
    if (nextProps.pickBinAdjBill.entity && this.props.pickBinAdjBill.entityUuid) {
      this.setState({
        entity: nextProps.pickBinAdjBill.entity,
        items: nextProps.pickBinAdjBill.entity.items,
        title: '编辑拣货位调整单'
      });

      if (nextProps.pickBinAdjBill.entity.items && this.props.pickBinAdjBill.entityUuid
        && !this.state.entity.uuid) {
        const that = this;
        nextProps.pickBinAdjBill.entity.items.forEach(function (e) {
          that.queryPickSchema(e.article.uuid);
        });
      }
    }

    if (nextProps.pickSchema.entity && nextProps.pickSchema.entity.uuid
      && !pickSchemas[nextProps.pickSchema.entity.uuid]) {
      pickSchemas[nextProps.pickSchema.entity.article.uuid] = nextProps.pickSchema.entity;
      this.setState({
        pickSchemas: pickSchemas
      });
    }
  }

  queryPickSchema = (value) => {
    this.props.dispatch({
      type: 'pickSchema/getByDcUuidAndArticleUuid',
      payload: {
        dcUuid: loginOrg().uuid,
        articleUuid: value
      }
    });
  }

  queryPickSchemas = () => {
    this.props.dispatch({
      type: 'pickSchema/query',
      payload: {
        ...this.state.pageFilter
      }
    });
  }

  /**
   * 刷新
   */
  refresh = () => {
    if (this.props.pickBinAdjBill.entityUuid)
      this.props.dispatch({
        type: 'pickBinAdjBill/get',
        payload: this.props.pickBinAdjBill.entityUuid
      });
  }
  /**
  * 取消
  */
  onCancel = () => {
    const { entityUuid } = this.props.pickBinAdjBill;

    if (entityUuid) {
      this.props.dispatch({
        type: 'pickBinAdjBill/showPage',
        payload: {
          showPage: 'view',
          entityUuid: entityUuid
        }
      });
    } else {
      this.props.dispatch({
        type: 'pickBinAdjBill/showPage',
        payload: {
          showPage: 'query'
        }
      });
    }
  }

  validItems = () => {
    const { items } = this.state;

    const newItems = items;
    if (newItems.length === 0) {
      message.error("明细不能为空");
      return false;
    }

    for (let i = newItems.length - 1; i >= 0; i--) {
      if (!newItems[i].article) {
        message.error(`明细第${newItems[i].line}行商品不能为空！`);
        return false;
      }

      if (newItems[i].article && !newItems[i].sourceBinCode) {
        message.error(`明细第${newItems[i].line}行来源货位代码不能为空！`);
        return false;
      }

      if (newItems[i].article && !newItems[i].targetBinCode) {
        message.error(`明细第${newItems[i].line}行目标货位代码不能为空！`);
        return false;
      }

      if (newItems[i].article && newItems[i].targetBinCode === newItems[i].sourceBinCode) {
        message.error(`明细第${newItems[i].line}行来源货位不能等于目标货位！`);
        return false;
      }
    }

    for (let i = 0; i < newItems.length; i++) {
      for (let j = i + 1; j < newItems.length; j++) {
        if (newItems[i].article.uuid === newItems[j].article.uuid &&
          newItems[i].sourceBinCode === newItems[j].targetBinCode
          && newItems[i].targetBinCode === newItems[j].targetBinCode) {
          message.error(`明细第${newItems[i].line}行与第${newItems[j].line}行重复！`);
          return false;
        }

        if (newItems[i].article.uuid === newItems[j].article.uuid &&
          newItems[i].sourceBinCode !== newItems[j].targetBinCode
          && newItems[i].targetBinCode === newItems[j].targetBinCode) {
          message.error(`明细第${newItems[i].line}行与第${newItems[j].line}行同一货位不能同时作为同一商品的整件,拆零拣货位！`);
          return false;
        }

        if (newItems[i].article.uuid !== newItems[j].article.uuid
          && newItems[i].targetBinCode === newItems[j].targetBinCode) {
          message.error(`明细第${newItems[i].line}行与第${newItems[j].line}行商品不同,目标货位相同！`);
          return false;
        }
      }
    }

    return newItems;
  }

  /**
   * 保存
   */
  onSave = (data) => {
    let pickBinAdjBill = {
      ...this.state.entity,
      ...data,
    };

    pickBinAdjBill.pickBinAdjer = JSON.parse(pickBinAdjBill.pickBinAdjer);
    const newItems = this.validItems();
    if (!newItems) {
      return;
    }
    pickBinAdjBill.items = newItems;

    if (!pickBinAdjBill.uuid) {
      this.props.dispatch({
        type: 'pickBinAdjBill/save',
        payload: pickBinAdjBill,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'pickBinAdjBill/modify',
        payload: pickBinAdjBill,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
          }
        }
      });
    }
  }
  /**
   * 保存并新建
   */
  onSaveAndCreate = (data) => {
    let pickBinAdjBill = {
      ...this.state.entity,
      ...data,
    };

    pickBinAdjBill.pickBinAdjer = JSON.parse(pickBinAdjBill.pickBinAdjer);
    const newItems = this.validItems();
    if (!newItems) {
      return;
    }
    pickBinAdjBill.items = newItems;

    this.props.dispatch({
      type: 'pickBinAdjBill/saveAndAudit',
      payload: pickBinAdjBill,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveAndAuditSuccess);
        }
      }
    });
  }

  getSourceBins = (record) => {
    const { pickSchemas } = this.state;
    if (!record.article) {
      return [];
    }

    const sourceBins = [];

    const pickSchema = pickSchemas[record.article.uuid];
    if (!pickSchema)
      return [];

    if (pickSchema && pickSchema.caseBinCode) {
      sourceBins.push(pickSchema.caseBinCode)
    }
    if (pickSchema && pickSchema.splitBinCode) {
      sourceBins.push(pickSchema.splitBinCode)
    }

    return sourceBins;
  }

  getSourceBinOptions = (record) => {
    const sourceBins = this.getSourceBins(record);
    const sourceBinOptions = [];

    sourceBins.forEach(e => {
      sourceBinOptions.push(
        <Select.Option key={e} value={e}>
          {e}</Select.Option>
      );
    });

    return sourceBinOptions;
  }

  /**
 * 表格变化时
 * @param {*} e 
 * @param {*} fieldName 
 * @param {*} key 
 */
  handleFieldChange(e, fieldName, line) {
    const { entity, items, pickSchemas } = this.state;
    if (fieldName === 'article') {
      items[line - 1].article = {
        uuid: JSON.parse(e).uuid,
        code: JSON.parse(e).code,
        name: JSON.parse(e).name
      };
      items[line - 1].sourceBinCode = undefined;
      items[line - 1].targetBinCode = undefined;

      this.queryPickSchema(JSON.parse(e).uuid);
    } else if (fieldName === 'sourceBinCode') {
      items[line - 1].sourceBinCode = e;
    } else if (fieldName === 'targetBinCode') {
      items[line - 1].targetBinCode = e;
    }

    this.setState({
      items: items.slice()
    });
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    // 员工选择
    let basicCols = [
      <CFormItem key='pickBinAdjer' label={pickBinAdjBillLocale.operator}>
        {
          getFieldDecorator('pickBinAdjer', {
            initialValue: entity.pickBinAdjer ? JSON.stringify(entity.pickBinAdjer) : undefined,
            rules: [
              { required: true, message: notNullLocale(pickBinAdjBillLocale.operator) }
            ],
          })(
            <UserSelect autoFocus
              placeholder={placeholderLocale(pickBinAdjBillLocale.operator)}
              single={true}
            />
          )
        }
      </CFormItem>
    ]

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
    ];
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, items } = this.state;
    const usages = ['PickUpBin', 'PickUpStorageBin'];

    let articleCols = [
      {
        title: '商品',
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <PickSchemeArticleSelect
              value={record.article ? convertCodeName(record.article) : null}
              onChange={e => this.handleFieldChange(e, 'article', record.line)}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              single
              style={{ width: '100%' }}
            />
          );
        }
      },
      {
        title: '来源货位',
        dataIndex: 'sourceBinCode',
        key: 'sourceBinCode',
        width: itemColWidth.binCodeEditColWidth,
        render: (text, record) => {
          let value
          if (record.sourceBinCode)
            value = record.sourceBinCode;
          else {
            if (this.getSourceBins(record).length > 0) {
              record.sourceBinCode = this.getSourceBins(record)[0];
              value = this.getSourceBins(record)[0];
            }
          }

          return (
            <Select
              value={value}
              placeholder='选择货位'
              onChange={
                e => this.handleFieldChange(e, 'sourceBinCode', record.line)
              }
            >
              {
                this.getSourceBinOptions(record)
              }
            </Select>
          );
        },
      },
      {
        title: '目标货位',
        dataIndex: 'targetBinCode',
        key: 'targetBinCode',
        width: itemColWidth.binCodeEditColWidth,
        render: (text, record) => {
          return (
            <BinSelect
              value={record.targetBinCode}
              usages={usages}
              states={[binState.FREE.name, binState.USING.name]}
              disabled={false}
              onChange={e => this.handleFieldChange(e, 'targetBinCode', record.line)}
              placeholder="请选择货位"
            />
          );
        }
      },
    ];

    let batchQueryResultColumns = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth,
        render: (val) => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: pickBinAdjBillLocale.caseBinCode,
        key: 'caseBinCode',
        dataIndex: 'caseBinCode',
        render: (text, record) => record.caseBinCode ? record.caseBinCode : <Empty />,
        width: colWidth.codeColWidth
      },
      {
        title: pickBinAdjBillLocale.splitBinCode,
        key: 'splitBinCode',
        dataIndex: 'splitBinCode',
        render: (text, record) => record.splitBinCode ? record.splitBinCode : <Empty />,
        width: colWidth.codeColWidth
      },
    ];
    return (
      <div>

        <ItemEditTable
          title={commonLocale.itemsLocale}
          columns={articleCols}
          data={items}
          drawBatchButton={this.drawBatchButton}
        />
        <PanelItemBatchAdd
          searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          columns={batchQueryResultColumns}
          data={this.props.pickSchema.data}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          onChange={this.tableChange}
          width={'70%'}
        />
      </div>
    )
  }

  /**搜索*/
  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ...data
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      }
    }
    this.queryPickSchemas();
  }

  tableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter } = this.state;
    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    this.setState({
      pageFilter: pageFilter
    })

    this.queryPickSchemas();
  }

  /**获取批量增加的集合*/
  getItemList = (value) => {
    const { entity, items } = this.state;
    var newList = [];
    let line = items.length;
    for (let i = 0; i < value.length; i++) {
      if (items && items.find(function (item) {
        return item.article && item.article.uuid === value[i].article.articleUuid && (
          item.sourceBinCode === value[i].caseBinCode || item.sourceBinCode === value[i].splitBinCode)
      }) === undefined) {
        items[line] = {
          article: {
            uuid: value[i].article.uuid,
            code: value[i].article.code,
            name: value[i].article.name
          },
          sourceBinCode: value[i].caseBinCode,
          targetBinCode: undefined,
          line: line + 1
        }

        this.queryPickSchema(value[i].article.uuid);
        line++;
      }
    }

    this.setState({
      items: items.slice()
    })
  }

  drawBatchButton = () => {
    return (
      <span>
        <a onClick={() => this.handlebatchAddVisible()}>添加</a>
      </span>
    )
  }

  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible
    })
  }
}