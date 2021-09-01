import { connect } from 'dva';
import { isArray } from 'util';
import moment from 'moment';
import Item from 'antd/lib/list/Item';
import { Form, Select, Input, InputNumber, message, DatePicker, Modal } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg, loginUser, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName, formatDate } from '@/utils/utils';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { binUsage } from '@/utils/BinUsage';
import { containerState } from '@/utils/ContainerState';
import { PutawayBillState, OperateMethod } from './PutawayContants';
import { putawayLocale } from './PutawayLocale';
import PutawaytBinSelect from './PutawayBinSelect';
import ItemBatchAddModal from './ItemBatchAddModal';
import { PUTAWAY_RES } from './PutawayPermission';

const { TextArea } = Input;
@connect(({ putaway, loading }) => ({
  putaway,
  loading: loading.models.putaway,
}))
@Form.create()
export default class PutawayCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + putawayLocale.title,
      entity: {
        items: [],
        putawayer: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        owner: getDefOwner(),
      },
      putawayBillitems: [],
      selectedRowKeys: [],
      selectedRows: [],
      stocks: [],
      auditButton : true,
      owner: getDefOwner(),
      containers: [],// 当前货主下拥有的容器们--使用状态的
      batchAddVisible: false,
     auditPermission: PUTAWAY_RES.AUDIT,
    }
  }
  componentDidMount() {
    this.refresh();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.putaway.entity && this.props.putaway.entityUuid
      && nextProps.putaway.entity.items && nextProps.putaway.entity != this.props.putaway.entity) {
      this.setState({
        entity: nextProps.putaway.entity,
        title: putawayLocale.title + '：' + nextProps.putaway.entity.billNumber,
        putawayBillitems: nextProps.putaway.entity.items
      });
    }

    if (nextProps.putaway.stocks && this.props.putaway.stocks) {
      if (nextProps.putaway.stocks.records && this.props.putaway.stocks.records) {
        //设置库存下的容器展示 
        let temp = [];
        this.state.containers.length = 0;
        this.state.stocks.length = 0;
        for (let i = 0; i < nextProps.putaway.stocks.records.length; i++) {
          if (nextProps.putaway.stocks.records[i].sourceContainerBarcode != '-' && temp.indexOf(nextProps.putaway.stocks.records[i].sourceContainerBarcode) == -1) {
            this.state.containers.push(nextProps.putaway.stocks.records[i])
            temp.push(nextProps.putaway.stocks.records[i].sourceContainerBarcode);
          }

          if (nextProps.putaway.stocks.records[i].sourceContainerBarcode != '-') {
            // 记录库存
            this.state.stocks.push(nextProps.putaway.stocks.records[i]);
          }
        }
        this.setState({
          stocks: [...this.state.stocks]
        });
      }
    }
    if (nextProps.putaway.batchStocks && this.props.putaway.batchStocks) {
      this.setState({
        batchStocks: nextProps.putaway.batchStocks
      });
    }

  }
  //  ---- 批量添加 开始 ----

  /**
   * 批量添加弹出框
    */
  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible,
      batchStocks: {
        list: [],
        pagination: {},
      },
    });
  }

  /**
   * 获取批量添加选中行
   */
  getItemList = (value) => {
    const { putawayBillitems } = this.state;
    var newList = [];
    for (let i = 0; i < value.length; i++) {
      let obj = value[i];
      if (putawayBillitems && putawayBillitems.find(function (item) {
        return item.sourceContainerBarcode === obj.sourceContainerBarcode
      }) === undefined) {
          newList.push({ ...obj });
      }
    }
    let line = putawayBillitems.length + 1;
    newList.map(item => {
      item.line = line;
      line++;
    });
    this.setState({
      putawayBillitems: [...putawayBillitems, ...newList]
    })
    this.handlebatchAddVisible()
  }
  //  ---- 批量添加 结束 ----

  /**
   * 选择货主
   * @param {} e 
   */
  handleChangeOwner(value) {
    const { entity, putawayBillitems, stocks, } = this.state;
    let originalOwner = this.props.form.getFieldValue('owner');
    if (putawayBillitems.length == 0 && entity.items.length == 0) {
      entity.owner = JSON.parse(value);
      this.setState({
        owner: JSON.parse(value),
        putawayBillitems: [],
        stocks: [],
      });
      return;
    } else if (putawayBillitems.length > 0 || entity.items.length > 0) {
      Modal.confirm({
        title: '修改货主会导致库存信息清空，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          entity.items = [];
          entity.owner = JSON.parse(value);
          this.setState({
            putawayBillitems: [],
            stocks: [],
            containers: [],
            entity: { ...entity }
          }, () => {
            this.props.form.setFieldsValue({
              owner: value,
            });
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            owner: originalOwner
          });
        }
      });
    }
  }

  /**
   * 刷新
   */
  refresh = () => {
    this.props.dispatch({
      type: 'putaway/get',
      payload: this.props.putaway.entityUuid
    });
    // 清空this.props
    if(this.props.putaway.stocks){
      this.props.putaway.stocks.paging={};
      this.props.putaway.stocks.recordCount=0;
      this.props.putaway.stocks.records=[];
    }
  }
  /**
  * 取消
  */
  onCancel = () => {
    this.props.dispatch({
      type: 'putaway/showPage',
      payload: {
        showPage: 'query'
      }
    });
    this.setState({
      putawayBillitems: [],
      stocks: [],
    })
  }

  /**
   * 校验数据
   */
  checkData = (data) => {
    const { entity, putawayBillitems } = this.state;
    let putaway = {
      ...this.state.entity,
      ...data,
    };


    for (let i = 0; i < putawayBillitems.length; i++) {
			if (!putawayBillitems[i].sourceContainerBarcode) {
				putawayBillitems.splice(i, 1);
				if (putawayBillitems[i] && putawayBillitems[i].line) {
					putawayBillitems[i].line = i + 1;
				}
				i = i - 1;
			}
		}

    if (putawayBillitems.length === 0) {
      message.error(notNullLocale(commonLocale.itemsLocale));
      return;
    }
    for (let i = 0; i < putawayBillitems.length; i++) {
      if (!putawayBillitems[i].targetBinCode) {
        message.error('第' + putawayBillitems[i].line + '行的目标货位不能为空');
        return;
      }
    }

    putaway.companyUuid= loginCompany().uuid;
    putaway.dcUuid = loginOrg().uuid;
    putaway.owner = JSON.parse(putaway.owner);
    putaway.putawayer = JSON.parse(putaway.putawayer);
    putaway.items = putawayBillitems;
    return putaway;
  }

  /**
   * 保存
   */
  onSave = (data) => {
    const { entity, putawayBillitems } = this.state;

    let putaway = this.checkData(data);
    if (!putaway.uuid) {
      this.props.dispatch({
        type: 'putaway/onSave',
        payload: putaway,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {

      this.props.dispatch({
        type: 'putaway/modify',
        payload: putaway,
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
    let putaway = this.checkData(data);

    if(putaway){
      this.props.dispatch({
        type: 'putaway/onSaveAndCreate',
        payload: putaway,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.state.putawayBillitems.length = 0;
          }
        }
      });
    }
  }
  /**
 * 表格变化时
 * @param {*} e 
 * @param {*} fieldName 
 * @param {*} key 
 */
  handleFieldChange(e, fieldName, line) {
    const { entity, putawayBillitems, stocks } = this.state;
    let target = putawayBillitems[line - 1];
    if (fieldName === 'sourceContainerBarcode') {

      // 判断当前是否存在，存在则忽略
      var existBarCodes = [];
      for (let i = 0; i < putawayBillitems.length; i++) {
        existBarCodes.push(putawayBillitems[i].sourceContainerBarcode)
      }

      // 选中的容器的库存
      for (let i = 0; i < stocks.length; i++) {

        if (stocks[i].sourceContainerBarcode == e && existBarCodes.indexOf(stocks[i].sourceContainerBarcode) == -1) {
          // 转换
          let putawayBillitem = stocks[i];
          putawayBillitems.push(putawayBillitem);
        }
      }
      //判断选中是否与当前一样，不一样则更换
      if (target.sourceContainerBarcode && target.sourceContainerBarcode != e) {
        let i = putawayBillitems.length;
        while (i--) {
          if (target && putawayBillitems[i] != undefined && target.sourceContainerBarcode == putawayBillitems[i].sourceContainerBarcode) {
            putawayBillitems.splice(i, 1);
          }
        }
      }
      // 删除空白行
      for (var i = putawayBillitems.length - 1; i >= 0; i--) {
        if (putawayBillitems[i].sourceContainerBarcode == undefined) {
          putawayBillitems.splice(i, 1);
        }
      }
      // 设置行号
      for (let i = 0; i < putawayBillitems.length; i++) {
        putawayBillitems[i].line = i + 1;
      }

    } else if (fieldName === 'targetBinCode') {
      putawayBillitems.map(item => {
        if (putawayBillitems[line - 1].sourceContainerBarcode == item.sourceContainerBarcode) {
          item.targetBinCode = JSON.parse(e).binCode
          item.targetBinUsage = JSON.parse(e).binUsage
        }
      });
    }

    this.setState({
      putawayBillitems: putawayBillitems.slice(),
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
            initialValue: entity ? (entity.owner ? JSON.stringify(entity.owner) : undefined) : null,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
            ],
          })(
            <OwnerSelect onlyOnline onChange={e => this.handleChangeOwner(e)} placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem label={putawayLocale.putawayer} key='putawayer'>
        {getFieldDecorator('putawayer', {
          initialValue: JSON.stringify(entity.putawayer),
          rules: [
            { required: true, message: notNullLocale(putawayLocale.putawayer) }
          ],
        })(<UserSelect single={true} />)}
      </CFormItem>,
    ];

    return [
      <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={basicCols}  noteCol={this.drawNotePanel()}/>,
    ];
  }

  /**
   * 删除
   */
  remove = (line) => {
    const { putawayBillitems } = this.state;
    var data = putawayBillitems
    let containerBarcode;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].line === line) {
        containerBarcode = data[i].containerBarcode ? data[i].containerBarcode : data[i].sourceContainerBarcode;
      }
    }
    for (let i = data.length - 1; i >= 0; i--) {
      if ((data[i].containerBarcode ? data[i].containerBarcode : data[i].sourceContainerBarcode) === containerBarcode) {
        data.splice(i, 1);
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i].line = i + 1;
    }
    if (putawayBillitems.length == 0) {
      this.setState({
        putawayBillitems: [],
      })
    } else {
      this.setState({
        putawayBillitems: [...data],
      })
    }
  }

  /**
   * 批量删除
   */
  batchRemove = (selectedRowKeys) => {
    const { putawayBillitems } = this.state;
    var data = putawayBillitems
    let containerBarcodes = [];

    for (let i = 0; i < selectedRowKeys.length; i++) {
      data.map(item => {
        if (item.line === selectedRowKeys[i]) {
          containerBarcodes.push(item.sourceContainerBarcode);
        }
      })
    }
    for (var i = 0; i < containerBarcodes.length; i++) {
      if (containerBarcodes.indexOf(containerBarcodes[i]) != i) {
        containerBarcodes.splice(i, 1); //删除数组元素后数组长度减1后面的元素前移
        i--; //数组下标回退

      }
    }

    Modal.confirm({
      title: '是否要删除选择行？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        for (let i = data.length - 1; i >= 0; i--) {
          if (selectedRowKeys.indexOf(data[i].line) >= 0
            || containerBarcodes.indexOf(data[i].sourceContainerBarcode) >= 0) {
            data.splice(i, 1);
          }
        }

        for (let i = 0; i < data.length; i++) {
          data[i].line = i + 1;
        }

        if (putawayBillitems.length == 0) {
          this.setState({
            putawayBillitems: [],
          })
        } else {
          this.setState({
            putawayBillitems: [...data],
          })
        }
        this.state.selectedRowKeys.length = 0
        this.state.selectedRows.length = 0
      }
    });
  }

  /**
   * 查询当前货主的库存
   */
  onSearchStocksByOwner = (value) => {
    const payload = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      ownerUuid: this.state.entity.owner.uuid,
      containerBarcode: value,
      page: 0,
      pageSize: 200,
    }
    this.props.dispatch({
      type: 'putaway/queryPutawayContainers',
      payload: { ...payload },
    });
  }

  /**
   * 设置容器选择器下拉列表
   */
  getContainerOptions = () => {
    let options = [];

    const { containers, entity } = this.state;
    containers.map(item => {
      if (item.ownerUuid == entity.owner.uuid) {
        // if(item.targetBinCode&&(item.targetBinUsage!=binUsage.UnifyReceiveStorageBin.name&&item.targetBinUsage!=binUsage.PickTransitBin.name))
        options.push(
          <Select.Option key={item.sourceContainerBarcode} value={item.sourceContainerBarcode}>
            {item.sourceContainerBarcode}
          </Select.Option>
        );
      }
    });
    return options;
  }

  /**
   * 信息统计
   */
  drawTotalInfo = () => {
    let allAmount = 0;
    this.state.putawayBillitems.map(item => {
      if (item.price && item.qty) {
        allAmount = allAmount + item.price * item.qty;
      }
    });
    return (
      <span style={{ marginLeft: '10px' }}>
        {commonLocale.inAllAmountLocale}：{allAmount}
      </span>
    );
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, putawayBillitems, stocks, batchStocks } = this.state;
    let data = putawayBillitems;

    let itemsCols = [
      {
        title: commonLocale.inContainerBarcodeLocale,
        key: 'sourceContainerBarcode',
        width: itemColWidth.containerEditColWidth + 50,
        render: record => {
          let containerBarcode = record.sourceContainerBarcode;
          return (
            <Select
              showSearch
              value={containerBarcode}
              placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
              onSearch={this.onSearchStocksByOwner}
              onChange={e => this.handleFieldChange(e, 'sourceContainerBarcode', record.line)}
            >
              {this.getContainerOptions()}
            </Select>
          );
        }
      },
      {
        title: '来源货位',
        width: itemColWidth.articleEditColWidth - 50,
        render: record => {
          return (
            record.sourceBinCode ? <span>{record.sourceBinCode + '[' + binUsage[record.sourceBinUsage].caption + ']'}</span> : <Empty />
          );
        }
      },
      {
        title: putawayLocale.targetBin,
        key: 'targetBinCode',
        width: itemColWidth.containerEditColWidth,
        render: (text, record) => {
          return (
            <PutawaytBinSelect
              containerBarcode={record.sourceContainerBarcode}
              value={record.targetBinCode ? JSON.stringify({ binCode: record.targetBinCode, binUsage: record.targetBinUsage }) : undefined}
              onChange={e => this.handleFieldChange(e, 'targetBinCode', record.line)}
              placeholder={placeholderLocale(putawayLocale.targetBin)}
            />
          );
        },
        width: '10%'
      },
      {
        title: commonLocale.inArticleLocale,
        width: itemColWidth.articleEditColWidth,
        key: 'article',
        render: record => {
          return <EllipsisCol colValue={convertCodeName(record.article)} />;
        }
      },
      {
        title: commonLocale.inVendorLocale,
        width: colWidth.codeNameColWidth,
        key: 'vendor',
        render: record => <EllipsisCol colValue={convertCodeName(record.vendor)} />
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStrAndMunit',
        width: itemColWidth.qpcStrColWidth,
        render: record => record.qpcStr || record.munit ? (record.qpcStr + '/' + record.munit) : ''
      },
      {
        title: putawayLocale.spec,
        key: 'spec',
        width: itemColWidth.qpcStrColWidth,
        render: record => record.spec
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyStrColWidth,
        render: record => record.qty
      },
      {
        title: commonLocale.inProductDateLocale,
        key: 'productDate',
        width: colWidth.dateColWidth,
        render: record => {
          return moment(record.productDate).format('YYYY-MM-DD');
        }
      },
      {
        title: commonLocale.inPriceLocale,
        key: 'price',
        width: itemColWidth.priceColWidth,
        dataIndex: 'price'
      },
    ];

    return (
      <div>
        <ItemEditTable
          scroll={{ x: 2000 }}
          title={putawayLocale.stockTableTitle}
          columns={itemsCols}
          remove={this.remove}
          batchRemove={this.batchRemove}
          selectedRowKeys={this.state.selectedRowKeys}
          selectedRows={this.state.selectedRows}
          data={data}
          drawBatchButton={this.drawBatchButton}
          drawTotalInfo={this.drawTotalInfo}
        />
        <ItemBatchAddModal
          ownerUuid={this.state.entity.owner.uuid}
          visible={this.state.batchAddVisible}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
        />
      </div>
    )
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
}
