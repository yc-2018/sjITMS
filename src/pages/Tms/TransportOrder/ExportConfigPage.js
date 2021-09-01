import { connect } from 'dva';
import { Form, Input, Checkbox, InputNumber, message, Radio, Modal, DatePicker } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CreatePage from './CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { convertCodeName } from '@/utils/utils';
import { billImportLocale } from '@/pages/Inner/BillImport/BillImportLocale';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import ExportEditTable from './ExportEditTable';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { filedCodeName, orderBillType } from './TransportOrderContants';

const RadioGroup = Radio.Group;

@connect(({ transportOrder, loading }) => ({
  transportOrder,
  loading: loading.models.transportOrder,
}))
@Form.create()
export default class BillImportMouldCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {//设置初始值
      title: '运输订单导出配置',
      entity: {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
        itmsTemplateFieldsInit: [
          {filedCode:'billNumber',isDisplay:true,filedName:'单号'},
          {filedCode:'wmsNum',isDisplay:true,filedName:'物流单号'},
          {filedCode:'sourceNum',isDisplay:true,filedName:'物流来源单号'},
          {filedCode:'sourceOrderBillTms',isDisplay:true,filedName:'来源运输订单号'},
          {filedCode:'waveNum',isDisplay:true,filedName:'波次号'},
          {filedCode:'cartonCount',isDisplay:true,filedName:'整箱数(估)'},
          {filedCode:'scatteredCount',isDisplay:true,filedName:'零散数(估)'},
          {filedCode:'containerCount',isDisplay:true,filedName:'周转箱数(估)'},
          {filedCode:'weight',isDisplay:true,filedName:'重量'},
          {filedCode:'volume',isDisplay:true,filedName:'体积'},
          {filedCode:'scheduleNum',isDisplay:true,filedName:'排车单号'},
          {filedCode:'realCartonCount',isDisplay:true,filedName:'整箱数(复核)'},
          {filedCode:'realScatteredCount',isDisplay:true,filedName:'零散数(复核)'},
          {filedCode:'realContainerCount',isDisplay:true,filedName:'周转箱数(复核)'},
          {filedCode:'owners',isDisplay:true,filedName:'货主'},
          {filedCode:'orderType',isDisplay:true,filedName:'订单类型'},
          {filedCode:'urgencyLevel',isDisplay:true,filedName:'是否紧急'},
          {filedCode:'pickUppointAddress',isDisplay:true,filedName:'取货点具体位置'},
          {filedCode:'deliveryPointCode',isDisplay:true,filedName:'送货点代码'},
          {filedCode:'deliveryPointName',isDisplay:true,filedName:'送货点名称'},
          {filedCode:'deliveryPointAddress',isDisplay:true,filedName:'送货点地址'},
          {filedCode:'deliveryPointSpecificAddress',isDisplay:true,filedName:'送货点具体位置'},
          {filedCode:'deliveryPointConstracts',isDisplay:true,filedName:'送货点联系人'},
          {filedCode:'deliveryPointPhone',isDisplay:true,filedName:'送货点联系电话'},
          {filedCode:'finalPointCode',isDisplay:true,filedName:'最终点代码'},
          {filedCode:'finalPointName',isDisplay:true,filedName:'最终点名称'},
          {filedCode:'finalPointAddress',isDisplay:true,filedName:'最终点地址'},
          {filedCode:'finalPointConstracts',isDisplay:true,filedName:'最终点联系人'},
          {filedCode:'finalPointSpecificAddress',isDisplay:true,filedName:'最终点具体位置'},
          {filedCode:'finalPointPhone',isDisplay:true,filedName:'最终点联系电话'},
          {filedCode:'stat',isDisplay:true,filedName:'状态'},
          {filedCode:'appointmentTime',isDisplay:true,filedName:'预约时间'},
          {filedCode:'note',isDisplay:true,filedName:'备注'},
          {filedCode:'orderTime',isDisplay:true,filedName:'下单日期'},
        ],
        itmsTemplateFields: [
          {filedCode:'billNumber',isDisplay:false,filedName:'单号'},
          {filedCode:'wmsNum',isDisplay:false,filedName:'物流单号'},
          {filedCode:'sourceNum',isDisplay:false,filedName:'物流来源单号'},
          {filedCode:'sourceOrderBillTms',isDisplay:false,filedName:'来源运输订单号'},
          {filedCode:'waveNum',isDisplay:false,filedName:'波次号'},
          {filedCode:'cartonCount',isDisplay:false,filedName:'整箱数(估)'},
          {filedCode:'scatteredCount',isDisplay:false,filedName:'零散数(估)'},
          {filedCode:'containerCount',isDisplay:false,filedName:'周转箱数(估)'},
          {filedCode:'weight',isDisplay:false,filedName:'重量'},
          {filedCode:'volume',isDisplay:false,filedName:'体积'},
          {filedCode:'scheduleNum',isDisplay:false,filedName:'排车单号'},
          {filedCode:'realCartonCount',isDisplay:false,filedName:'整箱数(复核)'},
          {filedCode:'realScatteredCount',isDisplay:false,filedName:'零散数(复核)'},
          {filedCode:'realContainerCount',isDisplay:false,filedName:'周转箱数(复核)'},
          {filedCode:'owners',isDisplay:false,filedName:'货主'},
          {filedCode:'orderType',isDisplay:false,filedName:'订单类型'},
          {filedCode:'urgencyLevel',isDisplay:false,filedName:'是否紧急'},
          {filedCode:'pickUppointAddress',isDisplay:false,filedName:'取货点具体位置'},
          {filedCode:'deliveryPointCode',isDisplay:false,filedName:'送货点代码'},
          {filedCode:'deliveryPointName',isDisplay:false,filedName:'送货点名称'},
          {filedCode:'deliveryPointAddress',isDisplay:false,filedName:'送货点地址'},
          {filedCode:'deliveryPointSpecificAddress',isDisplay:false,filedName:'送货点具体位置'},
          {filedCode:'deliveryPointConstracts',isDisplay:false,filedName:'送货点联系人'},
          {filedCode:'deliveryPointPhone',isDisplay:false,filedName:'送货点联系电话'},
          {filedCode:'finalPointCode',isDisplay:false,filedName:'最终点代码'},
          {filedCode:'finalPointName',isDisplay:false,filedName:'最终点名称'},
          {filedCode:'finalPointAddress',isDisplay:false,filedName:'最终点地址'},
          {filedCode:'finalPointConstracts',isDisplay:false,filedName:'最终点联系人'},
          {filedCode:'finalPointSpecificAddress',isDisplay:false,filedName:'最终点具体位置'},
          {filedCode:'finalPointPhone',isDisplay:false,filedName:'最终点联系电话'},
          {filedCode:'stat',isDisplay:false,filedName:'状态'},
          {filedCode:'appointmentTime',isDisplay:false,filedName:'预约时间'},
          {filedCode:'note',isDisplay:false,filedName:'备注'},
          {filedCode:'orderTime',isDisplay:false,filedName:'下单日期'},
        ]
      },
      spinning: false,
      index: 0,
      noNote: true
    }
  }

  componentDidMount() {
    this.refresh();
  }
  componentWillReceiveProps(nextProps) {

  }

  refresh = () => {
    const payload = {
      companyUuid: loginCompany().uuid,
      dispatchCenterUuid: loginOrg().uuid
    };
    this.props.dispatch({
      type: 'transportOrder/getExportTemplate',
      payload: {...payload},
      callback: (response) => {
        if (response && response.success) {
          let entity = this.state.entity;
          let fieldItems = [];
          let oldList = [];
          let newList = [];
          oldList = response.data && response.data.itmsTemplateFields ? response.data.itmsTemplateFields : [];
          if(oldList && oldList.length>0){
            newList = entity.itmsTemplateFields;
            for(let i =0;i<newList.length;i++){
              for(let j =0;j<oldList.length;j++){
                if(oldList[j].filedCode === newList[i].filedCode) {
                  newList[i].filedName = oldList[j].filedName;
                  newList[i].isDisplay = oldList[j].isDisplay;
                }
              }
            }
          } else {
            newList = entity.itmsTemplateFieldsInit;
          }
          fieldItems = [...newList];
          if (fieldItems) {
            for(let i =0;i<fieldItems.length;i++){
              fieldItems[i].line = i+1;
            }
          }
          entity.itmsTemplateFields = [...fieldItems];
          this.setState({
            entity: { ...entity }
          });
        }
      },
    });
  }

  onCancel = () => {
    const payload = {
      showPage: 'query'
    }
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        ...payload
      }
    });
  }
  onSave = (data) => {
    // let data = this.state.entity;
    this.onCreate(data)
  }

  onCreate = (data) => {
    const { entity } = this.state;
    const newData = this.validData(data);
    if (!newData) {
      return;
    }
    let type = 'transportOrder/addOrUpdateExportTemplate';
    this.props.dispatch({
      type: type,
      payload: newData,
      callback: (response) => {
        if (response && response.success) {
          message.success('保存成功');
        }
      },
    });
  }

  validData = (data) => {
    const { entity, selectedRows } = this.state;
    if (Array.isArray(selectedRows) && selectedRows.length === 0){
      message.warn('请选择要导出的字段');
      return;
    }
    const newData = { ...entity };
    let items = [];
    for (let i = 0; i < newData.itmsTemplateFields.length; i++) {
      for (let j = i + 1; j < newData.itmsTemplateFields.length; j++) {
        if (newData.itmsTemplateFields[i].filedName && newData.itmsTemplateFields[j].filedName && newData.itmsTemplateFields[i].filedName === newData.itmsTemplateFields[j].filedName) {
          message.error(`明细第${newData.itmsTemplateFields[i].line}行与第${newData.itmsTemplateFields[j].line}行文件列名重复！`);
          return false;
        }
      }
      items.push({
        filedCode: newData.itmsTemplateFields[i].filedCode,
        filedName: newData.itmsTemplateFields[i].filedName,
        isDisplay: newData.itmsTemplateFields[i].isDisplay
      })
    }
    newData.itmsTemplateFields = items;
    return newData;
  }

  drawFormItems = () => {

  }

  onFieldChange = (e, field, index) => {
    const { entity } = this.state;
    if (field === 'isDisplay') {
      entity.itmsTemplateFields[index - 1].isDisplay = e.target.checked;
    } else if (field === 'filedName') {
      entity.itmsTemplateFields[index - 1].filedName = e.target.value;
    }
    this.setState({
      entity: { ...entity }
    });
  };

  drawTable = () => {
    let columns = [
      {
        title: billImportLocale.billFieldName,
        dataIndex: 'filedCode',
        width: colWidth.codeColWidth,
        render:val=>{
          return val?<span>{filedCodeName[val].caption}</span>:<Empty />
        }
      },
      {
        title: '是否导出',
        dataIndex: 'isDisplay',
        width: 200,
        render: (text, record) => {
          return (
            <Checkbox
              checked={record.isDisplay}
              onChange={e => this.onFieldChange(e,'isDisplay', record.line)}
            />
          );
        }
      },
      {
        title: billImportLocale.fileFieldName,
        key: 'filedName',
        dataIndex: 'filedName',
        width: colWidth.codeColWidth,
        render: (text, record) => {
          return (
            <Input
              maxLength={255}
              value={record.filedName}
              onChange={e => this.onFieldChange(e, 'filedName', record.line)}
              placeholder={placeholderLocale(billImportLocale.filedName)}
            />
          );
        }
      }
    ]

    return (
      <div>
        <ExportEditTable
          title={''}
          columns={columns}
          notNote={true}
          data={this.state.entity.itmsTemplateFields}
        />
      </div>
    )
  }

}
