import { connect } from 'dva';
import moment from 'moment';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { Modal,Form, Select, Input, InputNumber, message, DatePicker } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { PRETYPE } from '@/utils/constants';
import { convertCodeName } from '@/utils/utils';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import PickOrderSchemeSelect from '@/pages/Component/Select/PickOrderSchemeSelect';
import StockAllocateSchemeSelect from '@/pages/Component/Select/StockAllocateSchemeSelect';
import CollectBinMgrSchemeSelect from '@/pages/Component/Select/CollectBinMgrSchemeSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import { SchedulingType, State } from '@/pages/Out/AlcNtc/AlcNtcContants';
import { alcNtcLocale } from '@/pages/Out/AlcNtc/AlcNtcLocale';
import PreType from '@/components/MyComponent/PreType';
import { isArray } from 'util';
import { waveBillLocale,clearConfirm } from './WaveBillLocale';
import { WaveBillState,WaveAlcNtcItemState,StockAllocateType } from './WaveBillContants';
import ItemBatchAddModal from './ItemBatchAddModal';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { getActiveKey} from '@/utils/LoginContext';

const stockAllocateTypes = [];
Object.keys(StockAllocateType).forEach(function (key) {
  stockAllocateTypes.push(<Select.Option value={StockAllocateType[key].name} key={StockAllocateType[key].name}>{StockAllocateType[key].caption}</Select.Option>);
});

const { TextArea } = Input;
@connect(({ wave,alcNtc,pretype,collectSchemeConfig, loading }) => ({
  wave,
  alcNtc,
  pretype,
  collectSchemeConfig,
  loading: loading.models.wave,
}))
@Form.create()
export default class WaveBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + waveBillLocale.title,
      batchAddVisible:false,
      entity: { // 波次单
        owner: getDefOwner(),
      },
      entityItems: [], // 波次单对应的配货通知单详情
      line:1,
      alcNtcBillNumberList:[],
      showStockScheme:true,
      collectBinMgrSchemes:[],
      defCollectBinMgrScheme:{},
      pageFilter: {
        page: 0,
        pageSize: 5000,
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
      },
      defPickScheme:{
        uuid:'',
        code:'',
        name:'',
      },
      defStockScheme:{
        uuid:'',
        code:'',
        name:'',
      }
    }
  }
  componentDidMount() {
    this.refresh();
    this.props.dispatch({
      type: 'collectSchemeConfig/getByDcUuid',
      payload: {
        dcUuid: loginOrg().uuid,
      }
    });
  }

  componentWillReceiveProps(nextProps) {

    let {  line, entity } = this.state;
    if (nextProps.wave.entity && this.props.wave.entityUuid && this.props.wave.entity != nextProps.wave.entity) {
      // 平均分配->隐藏 库存分配顺序
      if (nextProps.wave.entity.stockAllocateType === StockAllocateType['AVG'].name) {
        this.setState({
          showStockScheme: false
        })
      } else {
        this.setState({
          showStockScheme: true
        })
      }
      this.setState({
        entity: nextProps.wave.entity,
        title: waveBillLocale.title +':'+ nextProps.wave.entity.billNumber,
      });
    }

    if (nextProps.alcNtc.waveAlcNtcData && this.props.alcNtc.waveAlcNtcData != nextProps.alcNtc.waveAlcNtcData) {
         for (var i = 0; i < nextProps.alcNtc.waveAlcNtcData.list.length; i++) {
           nextProps.alcNtc.waveAlcNtcData.list[i].line = i + 1;
         }
      this.setState({
        entityItems: nextProps.alcNtc.waveAlcNtcData.list?nextProps.alcNtc.waveAlcNtcData.list : []
      });
    }

    if (nextProps.collectSchemeConfig.data.companyUuid) {
      this.setState({
        defCollectBinMgrScheme: nextProps.collectSchemeConfig.data.unifyCollectBinScheme
      });
    }
  }

  /**
   * 刷新
   */
  refresh = () => {
    this.props.dispatch({
      type: 'wave/get',
      payload: {
        uuid: this.props.wave.entityUuid
      }
    });
    if (this.props.wave.entityUuid){
      // 查询波次-配单表
      this.getAlcNtcBills();
    }
  }
   /**
   * 获取该波次单对应的配单
   */
  getAlcNtcBills() {
    const { pageFilter } = this.state;
    this.state.pageFilter.searchKeyValues = {
      ...this.state.pageFilter.searchKeyValues,
      waveBillNumber: this.props.wave.waveBillNumber
    }
    let queryFilter = {
      ...pageFilter
    }
    this.props.dispatch({
      type: 'alcNtc/queryWaveAlcNtc',
      payload: queryFilter
    });
  }
  /**
  * 取消
  */
  onCancel = () => {
    this.props.dispatch({
      type: 'wave/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 批量添加弹出框
   */
  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible:!this.state.batchAddVisible
    })
  }

  /**
   * 改变库存分配类型
   */
  handleChangeStockType =(value) =>{
    if (value === StockAllocateType['AVG'].name){
      // 隐藏 库存分配顺序
      this.setState({
        showStockScheme:false
      })
    }else{
      this.setState({
        showStockScheme: true
      })
    }
  }

  /**
   * 获取批量增加的配货通知单集合
   */
  getAlcNtcBillNumberList =(value)=>{
    var newAlcNtcBIllList = [];
    for(let i =0;i<value.length;i++){
      if (this.state.entityItems && this.state.entityItems.find(function (item) {
          return item.billNumber === value[i].billNumber
        }) === undefined) {
          newAlcNtcBIllList.push(value[i]);
        }
    }
    var alcNtcBillNumberList = [];
    this.state.line = this.state.entityItems.length+1;
    newAlcNtcBIllList.map(bill => {
      alcNtcBillNumberList.push(bill.billNumber);
      bill.line = this.state.line;
      this.state.line++;
    });
    this.setState({
      alcNtcBillNumberList: alcNtcBillNumberList,
    });
    this.state.entityItems = [...this.state.entityItems, ...newAlcNtcBIllList];

    this.handlebatchAddVisible()
  }
  /**
   * 保存
   */
  onSave = (data) => {
    let wave = {
      ...this.state.entity,
      ...data,
    };

    if (this.state.entityItems.length <=0){
      message.error('明细不能为空');
      return;
    }
    if (!wave.uuid) {
      var alcNtcBillNumbers = [];
      this.state.entityItems.map(item => {
        alcNtcBillNumbers.push(item.billNumber);
      })

      if (wave.collectBinMgrScheme){
        wave.collectBinMgrScheme = JSON.parse(wave.collectBinMgrScheme);
      }
      if (wave.stockAllocateScheme){
        wave.stockAllocateScheme = JSON.parse(wave.stockAllocateScheme);
      } else if (this.state.defStockScheme.uuid != '') {
        wave.stockAllocateScheme = this.state.defStockScheme;
      }
      if(wave.pickOrderScheme){
        wave.pickOrderScheme = JSON.parse(wave.pickOrderScheme);
      } else if (this.state.defPickScheme.uuid!=''){
        wave.pickOrderScheme = this.state.defPickScheme;
      }
      wave.dcUuid = loginOrg().uuid;
      wave.companyUuid = loginCompany().uuid;
      wave.alcNtcBillNumbers = alcNtcBillNumbers;

      this.props.dispatch({
        type: 'wave/onSave',
        payload: wave,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      var billNumbers = [];
      var modifyWave = {};
      const { entity,entityItems } = this.state;

      this.state.entityItems.map(item => {
        billNumbers.push(item.alcNtcBillNumber ? item.alcNtcBillNumber : item.billNumber);
      })

      modifyWave.uuid = entity.uuid;
      modifyWave.version = entity.version;
      modifyWave.companyUuid = loginCompany().uuid;
      modifyWave.dcUuid = loginOrg().uuid;
      if (data.pickOrderScheme){
        modifyWave.pickOrderScheme = JSON.parse(data.pickOrderScheme);
      } else if (this.state.defPickScheme.uuid != '' && modifyWave.pickOrderScheme==undefined) {
        modifyWave.pickOrderScheme = this.state.defPickScheme;
      }
      if (data.stockAllocateScheme){
        modifyWave.stockAllocateScheme = JSON.parse(data.stockAllocateScheme);
      } else if (this.state.defStockScheme.uuid != '' && modifyWave.stockAllocateScheme==undefined) {
        modifyWave.stockAllocateScheme = this.state.defStockScheme;
      }
      modifyWave.stockAllocateType = data.stockAllocateType;
      if (data.collectBinMgrScheme) {
        modifyWave.collectBinMgrScheme = JSON.parse(data.collectBinMgrScheme);
      }
      modifyWave.note = data.note;
      modifyWave.type = data.type;
      modifyWave.alcNtcBillNumbers = billNumbers;
      this.props.dispatch({
        type: 'wave/modify',
        payload: modifyWave,
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
    var alcNtcBillNumbers = [];
    let wave = {
      ...this.state.entity,
      ...data,
    };
    if (this.state.entityItems.length <= 0) {
      message.error('明细不能为空');
      return;
    }
    this.state.entityItems.map(item => {
      alcNtcBillNumbers.push(item.billNumber);
    })

    if (wave.collectBinMgrScheme) {
      wave.collectBinMgrScheme = JSON.parse(wave.collectBinMgrScheme);
    }
    if (wave.stockAllocateScheme) {
      wave.stockAllocateScheme = JSON.parse(wave.stockAllocateScheme);
    } else if (this.state.defStockScheme.uuid != '') {
      wave.stockAllocateScheme = this.state.defStockScheme;
    }
    if (wave.pickOrderScheme) {
      wave.pickOrderScheme = JSON.parse(wave.pickOrderScheme);
    } else if (this.state.defPickScheme.uuid != '') {
      wave.pickOrderScheme = this.state.defPickScheme;
    }
    wave.companyUuid = loginCompany().uuid;
    wave.dcUuid = loginOrg().uuid;
    wave.alcNtcBillNumbers = alcNtcBillNumbers;

    this.props.dispatch({
      type: 'wave/onSaveAndCreate',
      payload: wave,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            entity: {
              companyUuid: loginCompany().uuid,
              owner: getDefOwner(),
            },
            entityItems:[],
            showStockScheme:true
          });
          this.props.form.resetFields();
        }else{
          message.error(response.message)
        }
      }
    });
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner,entityItems,defCollectBinMgrScheme } = this.state;
    let basicCols = [
      <CFormItem key='preType' label={waveBillLocale.type}>
				{
					getFieldDecorator('type', {
						rules: [
							{ required: true, message: notNullLocale(waveBillLocale.type) },
						],
						initialValue: entity.type,
					})(
						<PreTypeSelect placeholder={placeholderChooseLocale(waveBillLocale.type)}
              preType={PRETYPE.waveType} />
					)
				}
      </CFormItem>,
      <CFormItem key='collectBinMgrScheme' label={waveBillLocale.collectBinMgrScheme}>
        {
          getFieldDecorator('collectBinMgrScheme', {
            initialValue: entity.collectBinMgrScheme ? JSON.stringify(entity.collectBinMgrScheme)
            : (JSON.stringify(defCollectBinMgrScheme) != "{}" ? JSON.stringify(defCollectBinMgrScheme):undefined),
            rules: [
              { required: true, message: notNullLocale(waveBillLocale.collectBinMgrScheme) }
            ],
          })(
            <CollectBinMgrSchemeSelect placeholder={placeholderLocale(waveBillLocale.collectBinMgrScheme)} />
          )
        }
      </CFormItem>,
      <CFormItem key='stockAllocateType' label={waveBillLocale.stockAllocateType}>
        {
          getFieldDecorator('stockAllocateType', {
          initialValue: entity.stockAllocateType ? entity.stockAllocateType : StockAllocateType.INTURN.name,
          rules: [{
            required: true,
            message: notNullLocale(waveBillLocale.stockAllocateType)
          }],
          })(
            <Select initialValue='' onChange={this.handleChangeStockType}
              placeholder={placeholderChooseLocale(waveBillLocale.stockAllocateType)}>
              {stockAllocateTypes}
            </Select>
          )
        }
      </CFormItem>,
      <CFormItem key='stockAllocateScheme' label={waveBillLocale.stockAllocateScheme}>
        {
          getFieldDecorator('stockAllocateScheme', {
            initialValue: entity.stockAllocateScheme ? JSON.stringify(entity.stockAllocateScheme) : undefined,
          })(
            <StockAllocateSchemeSelect
              defStockScheme={this.state.defStockScheme}
              placeholder={placeholderLocale(waveBillLocale.stockAllocateScheme)} forModify/>
          )
        }
      </CFormItem>,
      <CFormItem key='pickOrderScheme' label={waveBillLocale.pickOrderScheme}>
        {
          getFieldDecorator('pickOrderScheme', {
            initialValue: entity.pickOrderScheme ? JSON.stringify(entity.pickOrderScheme) : undefined,
          })(
            <PickOrderSchemeSelect
              defPickScheme={this.state.defPickScheme}
              placeholder={placeholderLocale(waveBillLocale.pickOrderScheme)}
              forModify
            />
          )
        }
      </CFormItem>,
    ];

    if (!this.state.showStockScheme){
      basicCols.splice(3,1)
    }

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} noteLabelSpan={4} noteCol={this.drawNotePanel()}/>,
    ];
  }
  /**
   * 绘制总数量
   */
  drawTotalInfo = () => {
    var alcNtcBillAmount = 0;
    var storeAmount = 0;
    var storeList = [];
    var isExist = false;
    if (this.state.entityItems){
      alcNtcBillAmount = this.state.entityItems.length;

      this.state.entityItems.map(item => {
        for(let i =0;i<storeList.length;i++){
          if(storeList[i] === item.store.uuid){
            isExist = true;
          }else{
            isExist = false;
          }
          i++;
        }
        if (!isExist){
          storeList.push(item.store.uuid);
        }
      });

      storeAmount = storeList.length
    }

    return (
      <span style={{ marginLeft: '10px' }}>
        {waveBillLocale.alcNtcBillAmount+' : '+alcNtcBillAmount}&nbsp;|&nbsp;
        {waveBillLocale.storeAmount + ' : ' + storeAmount}
      </span>
    );
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, vendorArticle } = this.state;
    let alcNtcCols = [
      {
        title: commonLocale.billNumberLocal,
        key: 'alcNtcBillNumber',
        width: colWidth.billNumberColWidth+50,
        render: record => {
          return <span>
                  <a>{record.alcNtcBillNumber ? record.alcNtcBillNumber:record.billNumber}</a>
                </span>
        }
      },
      {
        title: alcNtcLocale.sourceBillNumber,
        key: 'sourceBillNumber',
        dataIndex: 'sourceBillNumber',
        width: colWidth.enumColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: waveBillLocale.alcNtcType,
        key: 'type',
        dataIndex: 'type',
        width: colWidth.enumColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: '调度类型',
        key: 'schedulingType',
        dataIndex: 'schedulingType',
        width: colWidth.enumColWidth,
        render: text => <EllipsisCol colValue={SchedulingType[text].caption} />
      },
      {
        title: waveBillLocale.store,
        dataIndex: 'store',
        key: 'store',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.store)} />
      },
      {
        title: commonLocale.ownerLocale,
        dataIndex: 'owner',
        key: 'owner',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.owner)} />
      },
      {
        title: commonLocale.stateLocale,
        dataIndex: 'state',
        key: 'state',
        width: colWidth.enumColWidth-50,
        render: (text, record) => {
          return <span>{record.state?State[record.state].caption:null}</span>
        }
      },
      {
        title: commonLocale.inAllVolumeLocale,
        dataIndex: 'totalVolume',
        key: 'totalVolume',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.inAllWeightLocale,
        dataIndex: 'totalWeight',
        key: 'totalWeight',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.inAllQtyStrLocale,
        dataIndex: 'totalQtyStr',
        key: 'totalQtyStr',
        width: itemColWidth.qtyColWidth,
      },
      {
        title: "组别",
        dataIndex: 'groupName',
        key: 'groupName',
        width: itemColWidth.qtyColWidth,
      },
      {
        title: commonLocale.noteLocale,
        dataIndex: 'note',
        key: 'note',
        width: itemColWidth.qtyColWidth,
      },
    ];
    return (
      <div>
        <ItemEditTable
          title = {commonLocale.itemsLocale}
          columns={alcNtcCols}
          batchAdd={true}
          notNote
          handlebatchAddVisible={this.handlebatchAddVisible}
          data={this.state.entityItems}
          drawTotalInfo={this.drawTotalInfo}
          scroll={{ y:450, x:1000 }}
        />
        <ItemBatchAddModal
          type={"aaaa"}
          visible={this.state.batchAddVisible}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getAlcNtcBillNumberList={this.getAlcNtcBillNumberList}
          waveBillNumber={this.state.entity.billNumber}
        />
      </div>
    )
  }
}
