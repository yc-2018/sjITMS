import { connect } from 'dva';
import { isArray } from 'util';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, DatePicker } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { STATE } from '@/utils/constants';
import { loginCompany, loginOrg, getDefOwner, loginUser } from '@/utils/LoginContext';
import { convertCodeName, formatDate } from '@/utils/utils';
import { qtyStrToQty, add } from '@/utils/QpcStrUtil';
import { containerState } from '@/utils/ContainerState';
import { binUsage } from '@/utils/BinUsage';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import BinSelect from '@/pages/Component/Select/BinSelect';
import CreatePage from './CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import UserSelect from '@/pages/Component/Select/UserSelect';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import style from '@/pages/Component/Form/ItemEditTable.less';
import RtnContainerSelect from './RtnContainerSelect';
import { putAwayLocal } from './RtnPutawayBillLocale';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import Empty from '@/pages/Component/Form/Empty';
import { stockState } from '@/utils/StockState';
import TargetContainerSelect from './TargetContainerSelect';

const { TextArea } = Input;
@connect(({ rtnPutaway, stock, container, loading }) => ({
  rtnPutaway,
  stock,
  container,
  loading: loading.models.rtnPutaway,
}))
@Form.create()
export default class RtnPutawayBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + putAwayLocal.title,
      entity: {
        owner: getDefOwner(),
        items: []
      },
      putawayer: {
        uuid: loginUser().uuid,
        code: loginUser().code,
        name: loginUser().name
      },
      items: [],
      stocks: [],
      batchContainerInfos: [],
      auditButton: true,
      batchAddVisible: false,
      pageFilter: {
        page: 0,
        pageSize: 10,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          state: stockState.NORMAL.name,
          binUsages: [binUsage.VendorRtnReceiveTempBin.name],
        }
      },
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    const { stocks, batchContainerInfos } = this.state;

    if (nextProps.rtnPutaway.entity && this.props.rtnPutaway.entityUuid) {
      this.setState({
        entity: nextProps.rtnPutaway.entity,
        items: nextProps.rtnPutaway.entity.items,
        title: putAwayLocal.title + '：' + nextProps.rtnPutaway.entity.billNumber,
      });

      if (nextProps.rtnPutaway.entity && nextProps.rtnPutaway.entity.items
        && this.props.rtnPutaway.entityUuid && !this.state.entity.uuid) {
        const that = this;
        nextProps.rtnPutaway.entity.items.forEach(function (item) {
          that.queryStock(item.sourceContainerBarcode);
        });
      }
    }

    if (nextProps.stock.stocks) {
      nextProps.stock.stocks.forEach(function (stock) {
        var exist = stocks.some(function (e) {
          return e.uuid === stock.uuid;
        })

        if (!exist)
          stocks.push(stock);
      });

      this.setState({
        stocks: stocks
      });
    }

    if (nextProps.stock.data && nextProps.stock.data.list) {
      const newInfos = [];
      nextProps.stock.data.list.forEach(function (stock) {
        var exist = newInfos.some(function (e) {
          return e.position === stock.binCode && e.barcode === stock.containerBarcode;
        })

        if (!exist)
          newInfos.push({
            barcode: stock.containerBarcode,
            position: stock.binCode,
            positionBinUsage: stock.binUsage
          })
      });

      this.setState({
        batchContainerInfos: {
          list: newInfos,
          pagination: nextProps.stock.data.pagination
        }
      })
    }
  }

  queryStock = (containerBarcode) => {
    if (!containerBarcode)
      return;

    const ownerUuid = this.state.entity.owner ? this.state.entity.owner.uuid : null;
    this.props.dispatch({
      type: 'stock/query',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        containerBarcode: containerBarcode,
        ownerUuid: ownerUuid
      }
    });
  }

  queryStocks = () => {
    this.props.dispatch({
      type: 'stock/pageQuery',
      payload: {
        ...this.state.pageFilter.searchKeyValues
      }
    })
  }

  /**
   * 刷新
   */
  refresh = () => {
    this.props.dispatch({
      type: 'rtnPutaway/get',
      payload: this.props.rtnPutaway.entityUuid
    });
  }
  /**
  * 取消
  */
  onCancel = () => {
    this.props.dispatch({
      type: 'rtnPutaway/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  validate = (data) => {
    const { entity } = this.state;

    let bill = {
      ...entity,
    };
    bill.putawayer = JSON.parse(data.putawayer);
    bill.note = data.note;
    bill.companyUuid = loginCompany().uuid;
    bill.dcUuid = loginOrg().uuid;

    if (bill.items.length === 0) {
      message.error('退仓上架明细不能为空');
      return false;
    }

    for (let i = bill.items.length - 1; i >= 0; i--) {
      if (!bill.items[i].sourceContainerBarcode) {
        message.error(`第${bill.items[i].line}行来源容器条码不能为空！`);
        return false;
      }

      if (!bill.items[i].targetContainerBarcode) {
        message.error(`第${bill.items[i].line}行目标容器条码不能为空！`);
        return false;
      }

      if (!bill.items[i].targetBincode) {
        message.error(`第${bill.items[i].line}行目标货位不能为空！`);
        return false;
      }


      if (!bill.items[i].vendor) {
        message.error(`第${bill.items[i].line}行供应商不能为空！`);
        return false;
      }

    }

    for (let i = 0; i < bill.items.length; i++) {
      for (let j = i + 1; j < bill.items.length; j++) {
        if (bill.items[i].sourceContainerBarcode === bill.items[j].sourceContainerBarcode &&
          bill.items[i].vendor.uuid === bill.items[j].vendor.uuid) {
          message.error(`第${bill.items[i].line}行与第${bill.items[j].line}行重复！`);
          return false;
        }

        if (bill.items[i].targetContainerBarcode === bill.items[j].targetContainerBarcode &&
          bill.items[i].targetBincode !== bill.items[j].targetBincode) {
          message.error(`第${bill.items[i].line}行与第${bill.items[j].line}行同一容器不能上架到不同货位！`);
          return false;
        }
      }
    }

    return bill;
  }

  /**
   * 保存
   */
  onSave = (data) => {
    let bill = this.validate(data);
    if (!bill)
      return;

    if (!bill.uuid) {
      this.props.dispatch({
        type: 'rtnPutaway/save',
        payload: bill,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'rtnPutaway/modify',
        payload: bill,
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
    let bill = this.validate(data);
    if (!bill)
      return;

    this.props.dispatch({
      type: 'rtnPutaway/onSaveAndAudit',
      payload: bill,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveAndAuditSuccess);
        }
      }
    });
  }

  handlechangeOwner = (value) => {
    const { entity } = this.state;

    entity.owner = JSON.parse(value);
    this.setState({
      entity: entity
    })
  }

  getVendors = (line) => {
    const { stocks, entity } = this.state;
    let vendors = [];

    if (!entity.items[line - 1]
      || !entity.items[line - 1].sourceContainerBarcode
      || !entity.items[line - 1].sourceBincode) {
      return vendors;
    }

    let vendorUuids = [];
    stocks && stocks.forEach(function (e) {
      if (e.containerBarcode === entity.items[line - 1].sourceContainerBarcode &&
        e.binCode === entity.items[line - 1].sourceBincode &&
        e.vendor && vendorUuids.indexOf(e.vendor.uuid) === -1) {
        vendors.push(e.vendor);
        vendorUuids.push(e.vendor.uuid);
      }
    });

    if (vendors.length === 1) {
      entity.items[line - 1].vendor = {
        uuid: vendors[0].uuid,
        code: vendors[0].code,
        name: vendors[0].name,
      };
    }
    return vendors;
  }

  getVendorOptions = (line) => {
    let vendorOptions = [];
    this.getVendors(line).forEach(function (e) {
      vendorOptions.push(
        <Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>
          {convertCodeName(e)}</Select.Option>
      );
    });
    return vendorOptions;
  }

  /**
 * 表格变化时
 * @param {*} e
 * @param {*} fieldName
 * @param {*} key
 */
  handleFieldChange(e, fieldName, line) {
    const { entity, items } = this.state;
    if (fieldName === 'sourceContainerBarcode') {
      const barcode = JSON.parse(e);
      entity.items[line - 1].sourceContainerBarcode = barcode.barcode;
      entity.items[line - 1].sourceBincode = barcode.bincode;
      entity.items[line - 1].targetContainerBarcode = undefined;
      entity.items[line - 1].targetBincode = undefined;

      this.queryStock(barcode.barcode);

      this.getVendors(line);
    } else if (fieldName === 'vendor') {
      entity.items[line - 1].vendor = JSON.parse(e);
    } else if (fieldName === 'targetContainerBarcode') {
      entity.items[line - 1].targetContainerBarcode = e;
    } else if (fieldName === 'targetBincode') {
      entity.items[line - 1].targetBincode = e;
    }
    this.setState({
      entity: { ...entity }
    });
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;

    let basicCols = [
      <CFormItem key='owner' label={commonLocale.inOwnerLocale}>
        {
          getFieldDecorator('owner', {
            initialValue: entity && entity.owner ? JSON.stringify(entity.owner) : undefined,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
            ],
          })(
            <OwnerSelect
              onChange={this.handlechangeOwner}
              onlyOnline
              placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem label={putAwayLocal.putAwayer} key='putawayer'>
        {getFieldDecorator('putawayer', {
          initialValue: JSON.stringify(entity.putawayer && entity.putawayer.uuid ?
            entity.putawayer : this.state.putawayer),
          rules: [
            {
              required: true,
              message: notNullLocale(putAwayLocal.putAwayer)
            }
          ],
        })(<UserSelect autoFocus single={true} />)}
      </CFormItem>,
    ];

    return [
      <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={basicCols} noteCol={this.drawNotePanel()}/>,
    ];
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, items } = this.state;
    let articleCols = [
      {
        title: putAwayLocal.sourceContainer,
        dataIndex: 'sourceContainerBarcode',
        key: 'sourceContainerBarcode',
        width: itemColWidth.containerEditColWidth,
        render: (text, record) => {
          return <RtnContainerSelect
            value={record.sourceContainerBarcode}
            ownerUuid={entity && entity.owner ? entity.owner.uuid : undefined}
            onChange={e => this.handleFieldChange(e, 'sourceContainerBarcode', record.line)}
            placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
          />
        },
      }, {
        title: putAwayLocal.sourceBin,
        key: 'sourtceBincode',
        width: colWidth.codeColWidth,
        render: (record) => {
          return <span>{record.sourceBincode ? record.sourceBincode : <Empty />}</span>
        }
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          let value;
          if (record.vendor) {
            value = convertCodeName(record.vendor);
          } else {
            if (this.getVendors(record.line).length > 0) {
              record.vendor = this.getVendors(record.line)[0];
              value = JSON.stringify(this.getVendors(record.line)[0]);
            }
          }
          return (
            <Select
              className={style.editWrapper}
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.vendorLocale)}
              onChange={e => this.handleFieldChange(e, 'vendor', record.line)}
            >
              {this.getVendorOptions(record.line)}
            </Select>
          );
        }
      }, {
        title: putAwayLocal.targetBin,
        key: 'targetBincode',
        width: itemColWidth.binCodeEditColWidth,
        render: (text, record) => {
          return (
            <BinSelect
              value={record.targetBincode}
              usage={binUsage.VendorRtnBin.name}
              disabled={false}
              onChange={e => this.handleFieldChange(e, 'targetBincode', record.line)}
              placeholder={placeholderLocale(putAwayLocal.targetBin)} />
          );
        },
      }, {
        title: putAwayLocal.targetContainer,
        dataIndex: 'targetContainerBarcode',
        key: 'targetContainerBarcode',
        width: itemColWidth.containerEditColWidth,
        render: (text, record) => {
          return <TargetContainerSelect
            binCode={record.targetBincode}
            value={record.targetContainerBarcode}
            onChange={e => this.handleFieldChange(e, 'targetContainerBarcode', record.line)}
            placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
          />
        },
      },
    ];

    let batchQueryResultColumns = [
      {
        title: commonLocale.containerLocale,
        key: 'barcode',
        dataIndex: 'barcode',
        width: colWidth.codeColWidth,
      },
      {
        title: commonLocale.bincodeLocale,
        key: 'position',
        dataIndex: 'position',
        width: colWidth.codeColWidth,
      }, {
        title: commonLocale.inBinUsageLocale,
        key: 'positionBinUsage',
        dataIndex: 'positionBinUsage',
        render: (text) => text ? binUsage[text].caption : null,
        width: colWidth.enumColWidth,
      },
    ];

    return (
      <div>
        <ItemEditTable
          scroll={{ x: 1200 }}
          title='商品明细'
          columns={articleCols}
          data={entity.items ? entity.items : []}
          drawTotalInfo={this.drawTotalInfo}
          drawBatchButton={this.drawBatchButton}
        />
        <PanelItemBatchAdd
          searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          columns={batchQueryResultColumns}
          data={this.state.batchContainerInfos}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          onChange={this.tableChange}
          width={'50%'}
        />
      </div>
    )
  }

  /**搜索*/
  onSearch = (data) => {
    const { pageFilter, entity } = this.state;
    let ownerUuid = entity && entity.owner ? entity.owner.uuid : undefined;
    if (!ownerUuid) {
      return;
    }

    if (data) {
      pageFilter.searchKeyValues = {
        page: 0,
        pageSize: 20,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: ownerUuid,
        state: stockState.NORMAL.name,
        binUsages: [binUsage.VendorRtnReceiveTempBin.name],
        ...data
      }
    } else {
      pageFilter.searchKeyValues = {
        page: 0,
        pageSize: 20,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        stateEquals: stockState.NORMAL.name,
        ownerUuid: ownerUuid,
        binUsages: [binUsage.VendorRtnReceiveTempBin.name],
      }
    }
    this.queryStocks();
  }

  tableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues.page = pagination.current - 1;
    pageFilter.searchKeyValues.pageSize = pagination.pageSize;

    this.setState({
      pageFilter: pageFilter
    })

    this.queryStocks();
  }

  /**获取批量增加的集合*/
  getItemList = (value) => {
    const { entity } = this.state;

    var newList = [];
    let line = entity.items.length;
    for (let i = 0; i < value.length; i++) {
      if (entity && entity.items && entity.items.find(function (item) {
        return item.sourceContainerBarcode === value[i].barcode
      }) === undefined) {
        entity.items[line] = {
          sourceContainerBarcode: value[i].barcode,
          sourceBincode: value[i].position,
          targetContainerBarcode: undefined,
          targetBincode: undefined,

          line: line + 1
        }

        this.queryStock(value[i].barcode);
        this.getVendors(line);
        line++;
      }
    }

    this.setState({
      entity: { ...entity }
    })
  }

  drawBatchButton = () => {
    return (
      <span>
        <a onClick={() => this.handlebatchAddVisible()}>批量添加</a>
      </span>
    )
  }

  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible
    })
  }
}
