
import CreatePage from '@/pages/Component/Page/CreatePage';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import { Select, Form, Modal, message, Input } from 'antd';
import { connect } from 'dva';
import { convertCodeName } from '@/utils/utils';
import {
  placeholderChooseLocale,
  notNullLocale,
  placeholderLocale,
  commonLocale,
  confirmAuditLocale,
  confirmClearItemsLocale,
} from '@/utils/CommonLocale';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { PRETYPE } from '@/utils/constants';
import UserSelect from '@/pages/Component/Select/UserSelect';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import { wrhCloseType, getTypeCaption } from './WrhCloseBillType';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { loginUser, loginCompany, loginOrg } from '@/utils/LoginContext';
import { wrhCloseState, getStateCaption } from './WrhCloseBillState';
import { closeLocale, binCodeRepeat } from './WrhCloseBillLocale';
import { colWidth, itemColWidth, operateColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import { SHELFLIFE_TYPE } from '@/pages/Basic/Article/Constants';
import WrhCloseBillBatchAddModal from './WrhCloseBillBatchAddModal';
import { guid } from '@/utils/utils.js'
import { getActiveKey} from '@/utils/LoginContext';
import lodash from 'lodash'
const Option = Select.Option;

@connect(({ close, loading }) => ({
  close,
  loading: loading.models.close,
}))
@Form.create()
export default class WrhCloseBillCreatePage extends CreatePage {

  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + closeLocale.title,
      entity: {
        closer: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        type: wrhCloseType.CLOSE.name,
        items: []
      },
      isShowAuditedCloseBill: false,
      bins: [],
      auditedCloseBills: [],
      selectedAuditedCloseBill: {},
      pageFilter: {
        page: 0,
        pageSize: 20,
        sortFields: {
          code: true
        },
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
      },
      batchTableData: {
        list: [],
        pagination: {}
      },
      type: wrhCloseType.CLOSE.name,
      flag: false,
      auditButton : true,
      batchAddVisible: false,
      auditPermission:'iwms.inner.close.audit'
    }

  }

  componentDidMount() {
    this.fetchCloseBill();
  }

  componentWillReceiveProps(nextProps) {
    /**
     * 编辑时get接口获取详情
     */
    if (nextProps.entityUuid && !this.state.entity.uuid) {
      let type = nextProps.close.entity.type
      if (type == 'CLOSE') {
        this.setState({
          flag: false
        })
      } else {
        this.setState({
          flag: true
        })
      }
      if (nextProps.close.entity && nextProps.close.entity.items && nextProps.close.entity.items.length > 0) {
        this.setState({
          entity: nextProps.close.entity,
          title: closeLocale.title + '：' + nextProps.close.entity.billNumber
        });
      }
    }
    if (nextProps.close.data != this.props.close.data) {
      this.setState({
        batchTableData: nextProps.close.data
      })
    }
  }

  /**
   * 重置初始值
   */
  resetInitialValue = () => {
    this.setState({
      entity: {
        closer: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        type: wrhCloseType.CLOSE.name,
        items: []
      },
      batchTableData: {
        list: [],
        pagination: {}
      },
      selectValue: {},
      isShowAuditedCloseBill: false,
      bins: [],
      auditedCloseBills: [],
      selectedAuditedCloseBill: {},
    });
    this.props.form.resetFields();
  }

  /**
   * 根据uuid查询封仓解仓单
   */
  fetchCloseBill = () => {
    if (this.props.entityUuid) {
      this.props.dispatch({
        type: 'close/get',
        payload: {
          uuid: this.props.entityUuid
        },
        // callback: response => {
        //   if (response && response.success) {
        //     this.fetchUnCloseBins()
        //   }
        // }
      });
    } else {
      this.fetchCloseBins()
    }
  }

  /**
   * 获取已审核的单据类型为“封仓”的封仓单
   */
  fetchAudiedtCloseBill = (type) => {
    const { dispatch } = this.props;
    const { auditedCloseBills } = this.state;

    if (type === wrhCloseType.UNCLOSE.name && auditedCloseBills.length === 0) {
      dispatch({
        type: 'close/query',
        payload: {
          page: 0,
          pageSize: 10,
          searchKeyValues: {
            companyUuid: loginCompany().uuid,
            dcUuid: loginOrg().uuid,
            state: wrhCloseState.AUDITED.name,
            type: wrhCloseType.CLOSE.name,
          },
        },
        callback: response => {
          if (response && response.success) {
            let data = response.data;
            if (data) {
              this.setState({
                auditedCloseBills: data.records ? data.records : [],
              })
            }
          }
        }
      });
    }
  }
  selectChange = (data) => {
    this.setState({selectValue: JSON.parse(data)})
  }
  /**
   * 获取可封仓的货位
   */
  fetchCloseBins = (data) => {
    if (typeof data === 'string') {
      this.state.pageFilter.searchKeyValues = {
        ...this.state.pageFilter.searchKeyValues,
        binUsage: '',
        binCode: data
      }
    } else {
      this.state.pageFilter.searchKeyValues = {
        ...this.state.pageFilter.searchKeyValues,
        binUsage: data ? data.binUsage : '',
        binCode: data ? data.binCode : ''
      }
    }
    let queryFilter = {
      ...this.state.pageFilter
    }
    let obj = {}
    for (let key in queryFilter.searchKeyValues) {
      if (queryFilter.searchKeyValues[key]) {
        obj[key] = queryFilter.searchKeyValues[key]
      }
    }
    queryFilter.searchKeyValues = obj

    this.props.dispatch({
      type: 'close/queryCloseBin',
      payload: queryFilter,
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          if (data && data.records && data.records.length > 0) {
            data.records.forEach((item, index) => {
              item.line = index + 1
            })
          }
          if (data) {
            this.setState({
              bins: data,
              batchTableData: {
                list: data.records,
                pagination:{
                  total: response.data.paging.recordCount,
                  pageSize: response.data.paging.pageSize,
                  current: response.data.page + 1,
                  showTotal: total => `共 ${total} 条`,
                }
              }
            });
          }
        }
      }
    });
  }

  /**
   * 获取可解仓的货位
   */
  fetchUnCloseBins = (data) => {
    if (typeof data === 'string') {
      this.state.pageFilter.searchKeyValues = {
        ...this.state.pageFilter.searchKeyValues,
        binUsage: '',
        binCode: data
      }
    } else {
      this.state.pageFilter.searchKeyValues = {
        ...this.state.pageFilter.searchKeyValues,
        binUsage: data ? data.binUsage : '',
        binCode: data ? data.binCode : ''
      }
    }
    let queryFilter = {
      ...this.state.pageFilter
    }
    let obj = {}
    for (let key in queryFilter.searchKeyValues) {
      if (queryFilter.searchKeyValues[key]) {
        obj[key] = queryFilter.searchKeyValues[key]
      }
    }
    queryFilter.searchKeyValues = obj
    this.props.dispatch({
      type: 'close/queryUnCloseBin',
      payload: queryFilter,
      callback: response => {
        if (response && response.success) {
          if (response.data && response.data.records && response.data.records.length > 0) {
            response.data.records.forEach((item, index) => {
              item.line = index + 1
            })
          }
          this.setState({
            bins: response.data,
            batchTableData: {
              list: response.data.records,
              pagination: {
                total: response.data.paging.recordCount,
                pageSize: response.data.paging.pageSize,
                current: response.data.page + 1,
                showTotal: total => `共 ${total} 条`,
              },
            }
          });
        }
      }
    });
  }
  /**
   * 批量添加弹出框
   */
  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible:!this.state.batchAddVisible,
      batchTableData: {
        list: [],
        pagination: {}
      },
    })
  }
  /**获取批量增加的集合*/
  getItemList = (value) => {
    if (value && value.length > 0) {
      let arr = value.concat(this.state.entity.items)
      arr = lodash.uniqBy(arr,(e)=>{ return e.code||e.binCode});
      if (arr && arr.length > 0) {
        arr.forEach((item, index) => {
          item.line = index + 1
        })
      }
      this.state.entity.items =arr; 
      this.setState({
        entity: {...this.state.entity},
        flag: false
      });
    }
  }
  columns = [
    {
      title: commonLocale.bincodeLocale,
      key: 'code',
      dataIndex: 'code',
      sorter: true,
      width: colWidth.operateColWidth + 100,
      render: (val) => { return val ? val : <Empty /> }
    },
    {
      title: commonLocale.inBinUsageLocale,
      key: 'usage',
      dataIndex: 'usage',
      width: colWidth.operateColWidth + 100,
      render: (val) => { return val ? getUsageCaption(val) : <Empty /> }
    }
  ];
  
  /**
   * 通过单号查询
   */
  fetchCloseBillByBillNumber = (billNumber) => {
    this.props.dispatch({
      type: 'close/getByBillNumber',
      payload: {
        billNumber: billNumber,
        dcUuid: loginOrg().uuid,
      },
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          if (data) {
            let items = [];
            if ((Array.isArray(data.items))) {
              items = data.items;
            } else {
              message.warn(billNumber + '没有可用来解仓的货位');
              data['items'] = [];
            }
            this.renderItems(items);
            this.setState({
              selectedAuditedCloseBill: data,
              entity: {...this.state.entity},
              flag: true
            });
          }
        }
      }
    });
  }

  /**
   * 当选择解仓时，渲染下列表
   */
  renderItems = (items) => {
    const { entity } = this.state;

    if (!Array.isArray(items)) {
      return;
    }
    
    if (items.length == 0) {
      return;
    }

    let sourceItems = entity.items;
    let initialLine = sourceItems.length;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let isExist = false;
      for (let x in sourceItems) {
        if (sourceItems[x].binCode === item.binCode) {
          isExist = true;
          break;
        }
      }
      // 判断货位状态为封仓锁定
      if (!isExist) {
        item['line'] = initialLine + 1;
        entity.items.push(item);
        initialLine++;
      }
    }

    this.setState({
      entity: entity,
    })
  }

  /**
   * 清空明细
   */
  clearItems = (okCallBack, cancelCallback) => {
    const { entity, batchTableData } = this.state;

    if (entity.items.length > 0) {
      Modal.confirm({
        title: confirmClearItemsLocale(commonLocale.itemsLocale),
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          entity.items = [];
          this.setState({
            entity: { ...entity },
            bins: [],
            selectedAuditedCloseBill: {},
            batchTableData: {}
          });
          if (okCallBack) okCallBack();
        },
        onCancel: () => {
          if (cancelCallback) cancelCallback();
        }
      });
    } else {
      // 本来就是空，代表成功
      if (okCallBack) okCallBack();
    }
  }

  onCancel = () => {
    this.resetInitialValue();
    this.props.dispatch({
      type: 'close/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 保存时校验数据
   */
  validData = (data) => {
    const { entity, flag } = this.state;

    let newData = { ...entity };
    newData.closer = JSON.parse(data.closer);
    newData.note = data.note;
    newData.reason = data.reason;

    if (newData.items.length === 0) {
      message.error(notNullLocale(commonLocale.itemsLocale))
      return false;
    }
    for (let i = 0; i < newData.items.length; i++) {
      if (!flag) {
        if (!newData.items[i].code && !newData.items[i].binCode) {
          message.error('第' + newData.items[i].line + '行货位不能为空');
          return false;
        }
        if (!newData.items[i].usage && !newData.items[i].binUsage) {
          message.error('第' + newData.items[i].line + '行货位用途不能为空');
          return false;
        }
      } else {
        if (!newData.items[i].binCode) {
          message.error('第' + newData.items[i].line + '行货位不能为空');
          return false;
        }
        if (!newData.items[i].binUsage) {
          message.error('第' + newData.items[i].line + '行货位用途不能为空');
          return false;
        }
      }

      if (entity.items[i].note && entity.items[i].note.length > 255) {
        message.error('第' + entity.items[i].line + '行备注长度最大为255');
        return false;
      }
    }

    // 检测重复
    for (let i = 0; i < newData.items.length; i++) {
      for (let j = 0; j < newData.items.length; j++) {
        if (newData.items[i].line !== newData.items[j].line && newData.items[i].code === newData.items[j].code && newData.items[i].binCode === newData.items[j].binCode) {
          message.error(binCodeRepeat(newData.items[i].line, newData.items[j].line));
          return false;
        }
      }
    }
    if (newData && newData.items && newData.items.length > 0) {
      newData.items.forEach( (item, index) => {
        let obj = {}
        for (let sub in item) {
          if (sub == 'code') {
            obj['binCode'] = item[sub]
          } else if (sub == 'usage') {
            obj['binUsage'] = item[sub]
          } else {
            obj[sub] = item[sub]
          }
        }
        newData.items[index] = obj
      })
    }
    return newData;
  }

  onSave = (data) => {
    let newData = this.validData(data);
    if (!newData) {
      return;
    }

    let type = 'close/onSave';
    if (newData.uuid) {
      type = 'close/onModify';
    }
    newData['companyUuid'] = loginCompany().uuid;
    newData['dcUuid'] = loginOrg().uuid;
    // newData['type'] = this.state.type

    this.props.dispatch({
      type: type,
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.resetInitialValue();
        }
      }
    });
  }

  onSaveAndCreate = (data) => {
    const newData = this.validData(data);
    if (!newData) {
      return;
    }
    newData['companyUuid'] = loginCompany().uuid;
    newData['dcUuid'] = loginOrg().uuid;
    this.props.dispatch({
      type: 'close/onSaveAndCreate',
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.resetInitialValue();
        }
      }
    });
  }

  /**
   * 渲染货位列表
   */
  renderBinCodeOptions = () => {
    const { bins } = this.state;
    const binCodeOptions = [];

    Array.isArray(bins.records) && bins.records.forEach(e => {
      let obj = {
        code: e.code,
        usage: e.usage,
        state: e.state,
      };

      binCodeOptions.push(
        <Select.Option key={e.code} value={JSON.stringify(obj)}>
          {e.code}
        </Select.Option>
      );
    });
    return binCodeOptions;
  }

  /**
   * 渲染封仓单列表
   */
  renderAuditedCloseBillOptions = () => {
    const { auditedCloseBills } = this.state;
    const options = [];

    Array.isArray(auditedCloseBills) && auditedCloseBills.forEach(e => {
      let obj = {
        billNumber: e.billNumber,
        uuid: e.uuid,
      };

      options.push(
        <Select.Option key={e.uuid} value={JSON.stringify(obj)}>
          {e.billNumber}
        </Select.Option>
      );
    });
    return options;
  }

  /**
   * 处理类型变化
   */
  onTypeChange = value => {
    // 清空items（确认提醒）onTypeChange
    this.clearItems(
      () => this.handleShowAuditedCloseBill(value),
      () => {
        this.props.form.setFieldsValue({
          type: this.state.entity.type
        });
      });
  }

  /**
   * 处理显示封仓单
   */
  handleShowAuditedCloseBill = (value) => {
    const { entity } = this.state;
    let isShowAuditedCloseBill;

    if (value === wrhCloseType.UNCLOSE.name) {
      isShowAuditedCloseBill = true;
      this.fetchAudiedtCloseBill(value);
    } else if (value === wrhCloseType.CLOSE.name) {
      isShowAuditedCloseBill = false;
    }
    entity['type'] = value;
    this.setState({
      isShowAuditedCloseBill: isShowAuditedCloseBill,
      entity: entity,
      batchTableData: {
        list: [],
        pagination: {}
      },
      type: value
    })
    if (value == 'UNCLOSE') {
      this.fetchUnCloseBins()
    }
    if(value == 'CLOSE') {
      this.fetchCloseBins()
    }
  }

  /**
   * 处理表格中字段改变
   */
  onFieldChange = (value, field, index) => {
    const { batchTableData, entity, flag } = this.state;
    if (field === 'code' || field === 'binCode') {
      let obj = JSON.parse(value);
      if (this.state.batchAddVisible) { // 表示弹出模态框
        if (obj.code && obj.usage) {
          let item = batchTableData.list[index - 1];
          item['code'] = obj.code;
          item['usage'] = obj.usage;

          this.setState({
            batchTableData: {
              list: batchTableData.list,
              pagination:batchTableData.pagination
            }
          })
        } else {
          let item = batchTableData.list[index - 1];
          item['binCode'] = obj.code;
          item['binUsage'] = obj.usage;
          this.setState({
            batchTableData: {
              list: batchTableData.list,
              pagination:batchTableData.pagination
            }
          })
        }
      } else { // 关闭模态框
        if (obj.code && obj.usage) {
          let item = entity.items[index - 1];
          if (item.code) {
            item['code'] = obj.code;
            item['usage'] = obj.usage;
          } else {
            item['binCode'] = obj.code;
            item['binUsage'] = obj.usage;
          }
          this.state.entity.items = entity.items;
          this.setState({
            entity: {...this.state.entity},
          });
        } else {
          let item = entity.items[index - 1];
          if (item.code) {
            item['code'] = obj.code;
            item['usage'] = obj.usage;
          } else {
            item['binCode'] = obj.code;
            item['binUsage'] = obj.usage;
          }
          this.setState({
            entity: {
              items: entity.items
            }
          })
        }
      }
    } else if (field === 'note') {
      batchTableData.list[index - 1]['note'] = value;
      this.setState({
        batchTableData: {
          list: batchTableData.list,
          pagination:batchTableData.pagination
        }
      })
    } else if (field === 'auditedCloseBill') {
      this.fetchCloseBillByBillNumber(JSON.parse(value).billNumber);
    }
  }

  /**
   * 处理binCode 搜索
   */
  onBinCodeSearch = (value) => {
    const { entity, type } = this.state;
    if (entity.type === wrhCloseType.CLOSE.name) {
      this.fetchCloseBins(value);
    } else if (entity.type === wrhCloseType.UNCLOSE.name) {
      this.fetchUnCloseBins(value);
    }
  }

  onResetSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    this.onBinCodeSearch(data)
  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, isShowAuditedCloseBill } = this.state;

    let cols = [
      <CFormItem label={closeLocale.type} key='type'>
        {getFieldDecorator('type', {
          initialValue: entity.type ? entity.type : wrhCloseType.CLOSE.name,
          rules: [
            { required: true, message: notNullLocale(closeLocale.type) }
          ],
        })(
          <Select
            placeholder={placeholderChooseLocale(closeLocale.type)}
            style={{ width: '100%' }}
            onChange={this.onTypeChange}
            autoFocus
            id ='type'
          >
            <Option value={wrhCloseType.CLOSE.name}>{wrhCloseType.CLOSE.caption}</Option>
            <Option value={wrhCloseType.UNCLOSE.name}>{wrhCloseType.UNCLOSE.caption}</Option>
          </Select>
        )}
      </CFormItem>,
      <CFormItem label={closeLocale.reason} key='reason'>
        {getFieldDecorator('reason', {
          initialValue: entity.reason,
          rules: [
            { required: true, message: notNullLocale(closeLocale.reason) }
          ],
        })(<PreTypeSelect placeholder={placeholderChooseLocale(closeLocale.reason)} preType={PRETYPE.closeReason} />)}
      </CFormItem>,
      <CFormItem label={closeLocale.closer} key='closer'>
        {getFieldDecorator('closer', {
          initialValue: JSON.stringify(entity.closer),
          rules: [
            { required: true, message: notNullLocale(closeLocale.closer) }
          ],
        })(<UserSelect single={true} />)}
      </CFormItem>,
    ];

    if (isShowAuditedCloseBill) {
      cols.push(
        <CFormItem label={closeLocale.closeBill} key='auditedCloseBill'>
          {getFieldDecorator('auditedCloseBill')(
            <Select
              placeholder={placeholderChooseLocale(closeLocale.closeBill)}
              onChange={e => this.onFieldChange(e, 'auditedCloseBill', 0)}
            >
              {this.renderAuditedCloseBillOptions()}
            </Select>
          )}
        </CFormItem>
      )
    }

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()}  noteLabelSpan={4}/>
    ];
  }
  /**
   * 绘制按钮
   */
  drawBatchButton = () => {
    return (
      <span>
				<a onClick={() => this.handlebatchAddVisible()}>添加</a>
			</span>
    )
  }

  /**
   * 分页回调事件
   * @param pagination
   * @param filtersArg
   * @param sorter
   */
  tableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter } = this.state;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    // 判断是否有过滤信息
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    if (sorter.field) {
      // 如果有排序字段，则需要将原来的清空
      pageFilter.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter.sortFields[sortField] = sortType;
    }
    this.onBinCodeSearch(pageFilter.searchKeyValues);
  }
  
  drawTable = () => {
    let { flag } = this.state;
    let columns = [
      {
        title: commonLocale.bincodeLocale,
        key: !flag ? 'code' : 'binCode',
        dataIndex: !flag ? 'code' : 'binCode',
        width: itemColWidth.stockBatchColWidth,
        render: (text, record, index) => {
          return (
            <Select
              disabled={this.state.batchAddVisible}
              value={ record.binCode ? record.binCode : record.code }
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
              onSearch={this.onBinCodeSearch}
              onChange={e => this.onFieldChange(e, !flag ? 'code' : 'binCode', record.line)}
              showSearch={true}
              style={{width:'100%'}}
            >
              {this.renderBinCodeOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inBinUsageLocale,
        key: guid(),
        dataIndex: !flag ? 'usage' : 'binUsage',
        width: itemColWidth.stockBatchColWidth,
        render: (text, record, index) => {
          if (record.usage) {
            return (
              <span>{getUsageCaption(record.usage)}</span>
            );
          } else if (record.binUsage) {
            return (
              <span>{getUsageCaption(record.binUsage)}</span>
            );
          } else {
            return (
              <span>{ <Empty />}</span>
            );
          }

        }
      },
    ];
    return (
      <div>
        <ItemEditTable
          title={commonLocale.itemsLocale}
          columns={columns}
          notNote={true}
          drawBatchButton={this.drawBatchButton}
          handlebatchAddVisible={this.handlebatchAddVisible}
          data={this.state.entity.items}
        />
        <PanelItemBatchAdd
          searchPanel={<WrhCloseBillBatchAddModal change={this.selectChange} refresh={this.onResetSearch} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          columns={this.columns}
          data={this.state.batchTableData}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          onChange={this.tableChange}
          width={'66%'}
        />
      </div>
    )
  }
}
