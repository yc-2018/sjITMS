import { connect } from 'dva';
import moment from 'moment';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import {
  commonLocale,
  notNullLocale,
  placeholderLocale,
  placeholderChooseLocale,
  confirmLineFieldNotNullLocale,
} from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import UserSelect from '@/pages/Component/Select/UserSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import { formatDate } from '@/utils/utils';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import { containerState } from '@/utils/ContainerState';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { binState, getStateCaption } from '@/utils/BinState';
import Empty from '@/pages/Component/Form/Empty';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import { SHELFLIFE_TYPE } from '@/pages/Basic/Article/Constants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';

const FormItem = Form.Item;
@connect(({ loading, zztest, quick }) => ({
  zztest,
  quick,
  loading: loading.models.zztest,
}))
@Form.create()
export default class ReceiveBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);
    this.state = {
      title: 'test',
      entityUuid: props.entityUuid,
      entity: {
        type: 'NORMAL',
        receiver: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name,
        },
        items: [],
      }, //收货单
      order: {
        items: [],
      }, //入库单明细,
      batchAddVisible: false,
      allArticleList: [],
      searchedArticleList: [],
      auditButton: true,
      showBinCodeModal: false,
      schemaList: [],
      columns: [],
      columns2: [],
    };
  }

  //获取列配置
  queryCoulumns = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: '20220125',
        sysCode: 'tms',
      },
      callback: response => {
        if (response.result) {
          this.initConfig(response.result);
        }
      },
    });
  };

  //初始化配置
  initConfig = queryConfig => {
    const columns = queryConfig.columns;
    let quickColumns = new Array();
    columns.forEach(column => {
      const qiuckcolumn = {
        title: column.fieldTxt,
        dataIndex: column.fieldName,
        key: column.fieldName,
        sorter: true,
        fieldType: column.fieldType,
      };
      quickColumns.push(qiuckcolumn);
    });
    this.setState({
      columns: quickColumns,
    });
  };

  queryCoulumns2 = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: 'quickDemo',
        sysCode: 'tms',
      },
      callback: response => {
        if (response.result) {
          this.initConfig2(response.result);
        }
      },
    });
  };
  //初始化配置
  initConfig2 = queryConfig => {
    const columns = queryConfig.columns;
    let quickColumns = new Array();
    columns.forEach(column => {
      const qiuckcolumn = {
        title: column.fieldTxt,
        dataIndex: column.fieldName,
        key: column.fieldName,
        sorter: true,
        width: itemColWidth.articleEditColWidth,
        fieldType: column.fieldType,
      };
      quickColumns.push(qiuckcolumn);
    });
    this.setState({
      columns2: quickColumns,
    });
  };

  componentDidMount() {
    this.refresh();
    this.queryCoulumns();
    this.queryCoulumns2();
  }

  componentWillReceiveProps(nextProps) {}
  onCancel = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'receive/showPage',
      payload: {
        showPage: 'query',
      },
    });
    this.getOrder(null);
  };

  onSave = data => {
    const creation = this.convertData(data);
    if (!creation) {
      return;
    }
    if (!this.state.entity.uuid) {
      this.props.dispatch({
        type: 'receive/onSave',
        payload: creation,
        callback: response => {
          if (response && response.success) {
            this.props.order.entity = {};
            this.props.form.resetFields();
            //this.getOrder(null);
            message.success(commonLocale.saveSuccessLocale);
          }
        },
      });
    } else {
      creation.uuid = this.state.entity.uuid;
      creation.version = this.state.entity.version;
      this.props.dispatch({
        type: 'receive/onModify',
        payload: creation,
        callback: response => {
          if (response && response.success) {
            this.props.order.entity = {};
            this.props.form.resetFields();
            //this.getOrder(null);
            message.success(commonLocale.modifySuccessLocale);
          }
        },
      });
    }
  };

  onSaveAndCreate = data => {
    const creation = this.convertData(data);
    if (!creation) {
      return;
    }
    this.props.dispatch({
      type: 'receive/onSaveAndCreate',
      payload: creation,
      callback: response => {
        if (response && response.success) {
          this.props.order.entity = {};
          this.setState(
            {
              entity: {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                type: 'NORMAL',
                receiver: {
                  uuid: loginUser().uuid,
                  code: loginUser().code,
                  name: loginUser().name,
                },
                items: [],
              },
            },
            () => {}
          );
          this.props.form.resetFields();
          //this.getOrder(null);
          message.success(commonLocale.saveSuccessLocale);
        }
      },
    });
  };

  convertData(data) {}

  refresh = () => {};

  onOrderChange = value => {};

  getOrder = value => {
    this.props.dispatch({
      type: 'order/getByBillNumberForReceive',
      payload: {
        sourceBillNumber: value,
        dcUuid: loginOrg().uuid,
      },
    });
  };

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    const { columns } = this.state;
    let cols = [];
    columns.forEach(item => {
      let headItem;
      headItem = (
        <CFormItem label={item.title} key={item.title}>
          {getFieldDecorator(item.title)(<Input />)}
        </CFormItem>
      );
      cols.push(headItem);
    });
    //渲染上半部分 主表

    return [
      <FormPanel
        key="basicInfo"
        noteLabelSpan={4}
        title={commonLocale.basicInfoLocale}
        cols={cols}
        noteCol={this.drawNotePanel()}
      />,
    ];
  };

  getArticles = line => {};

  getArticleOptions = () => {};

  getQpcStrs = line => {};

  getQpcStrOptions = line => {};

  getPrices = line => {};

  getPriceOptions = line => {};

  getCanReceiveQty = line => {};

  getShelfLifeType = line => {};

  handleFieldChange(e, fieldName, line) {}

  disabledProductDate(current) {}

  disabledValidDate(current) {}

  drawTable = () => {
    const { entity } = this.state;
    const { columns2 } = this.state;
    //渲染下半部分 从表
    let columns = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth + 50,
        render: val => <EllipsisCol colValue={convertCodeName(val)} />,
      },
    ];
    //debugger;
    if (columns2.length > 0) columns = [];
    columns2.forEach(item => {
      let tailItem;
      tailItem = {
        title: item.title,
        dataIndex: item.dataIndex,
        key: item.key,
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => {
          return <Input />;
        },
      };
      columns.push(tailItem);
    });

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div>
        <ItemEditTable
          title={commonLocale.inArticleLocale}
          columns={columns}
          data={this.state.entity.items}
          handleFieldChange={this.handleFieldChange}
          drawTotalInfo={this.drawTotalInfo}
          drawBatchButton={this.drawBatchButton}
          // scroll={{ x: 2040 }}
          notNote
        />
      </div>
    );
  };

  drawTotalInfo = () => {
    let allQtyStr = '0';
    let allQty = 0;
    let allAmount = 0;
    this.state.entity.items &&
      this.state.entity.items.map(item => {
        if (item.qty) {
          allQty = allQty + parseFloat(item.qty);
        }
        if (item.qtyStr) {
          allQtyStr = add(allQtyStr, item.qtyStr);
        }
        if (item.price) {
          allAmount = allAmount + item.price * item.qty;
        }
      });
    return (
      <span style={{ marginLeft: '10px' }}>
        {commonLocale.inAllQtyStrLocale}：{allQtyStr} |{commonLocale.inAllQtyLocale}：{allQty} |
        {commonLocale.inAllAmountLocale}：{allAmount ? allAmount : 0}
      </span>
    );
  };
  /**
   * 绘制按钮
   */
  drawBatchButton = selectedRowKeys => {};
  /**搜索*/
  onSearch = data => {};

  /** 批量添加弹出框*/
  handlebatchAddVisible = () => {};
  /** 批量设置指定目标货位 */
  handlebatchSetBinVisible = (flag, selectedRowKeys) => {};
  /** 弹出框确认 */
  onOk = () => {};
}
