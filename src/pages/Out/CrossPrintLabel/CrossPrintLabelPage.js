import { Fragment } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Form, Button, message,Modal, Tooltip, Icon } from 'antd'
import SearchPage from '@/pages/Component/Page/SearchPage'
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm'
import BadgeUtil from '@/pages/Component/BadgeUtil'
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth'
import { commonLocale, notNullLocale } from '@/utils/CommonLocale'
import { havePermission } from '@/utils/authority'
import { convertCodeName } from '@/utils/utils'
import { loginOrg, loginCompany, loginUser } from '@/utils/LoginContext'
import CrossPrintLabelPageSearchForm from './CrossPrintLabelPageSearchForm'
import configs from '@/utils/config'
import { groupBy } from '@/utils/groupByUtil'
import { getPrintLabel, setPrintLabel } from '@/utils/PrintTemplateStorage'
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants'
import PrintTemplateSelect from '@/pages/Component/Select/PrintTemplateSelect'
import { PickupBillItemState } from '../PickUp/PickUpBillContants'

@connect(({ pickup,template, loading }) => ({
  pickup,template,
  loading: loading.models.pickup
}))
@Form.create()
export default class CrossPrintLabelPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '分播标签打印',
      data: {
        list:[]
      },
      visible: false,

      noPagination:true,
      selectedRows: [],
      printTemplate:getPrintLabel()
    }

    this.state.pageFilter.searchKeyValues.containerCode =''
  }

  componentDidMount() {
    this.refreshTable();

    this.props.dispatch({
      type: 'template/queryByTypeAndOrgUuid',
      payload: {
        printType: PrintTemplateType.CROSSLABELPICK.name,
        orgUuid: loginCompany().uuid
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    const { data } = this.state;
    if(nextProps.pickup.crossPrintLabelItems&&nextProps.pickup.crossPrintLabelItems!=this.props.pickup.crossPrintLabelItems){
      let items  = groupBy(nextProps.pickup.crossPrintLabelItems, function (item) {
        return [item.containerBarcode];
      });

      data.list = items;
      this.setState({
        data:{...data}
      })
    }
    if(!nextProps.pickup.crossPrintLabelItems||nextProps.pickup.crossPrintLabelItems.length==0){
      data.list = [];
      this.setState({
        data:{...data}
      })
    }
    let templateList = nextProps.template.menuList;
    let defaultValue=undefined;
    if (getPrintLabel()=='null' && templateList && templateList.length > 0 && 
      nextProps.template.menuList[0].type === PrintTemplateType.CROSSLABELPICK.name) {
      templateList.forEach(function (item, index) {
        if (item.def) {
          defaultValue = JSON.stringify({
            uuid: item.uuid,
            name: item.name,
            path: item.path
          });
        }
      });
      this.state.printTemplate=defaultValue;
    }
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'pickup/queryCrossPrintLabelItem',
      payload: queryFilter.searchKeyValues,
    });
  };

  onSearch = (data) => {
    const {pageFilter} = this.state;
    pageFilter.page = 0;

    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
      }
    } else {
      pageFilter.searchKeyValues = {
        containerCode:''
      }
    }
    this.refreshTable();
  }

  /**
   * 模态框显示/隐藏
   */
  onshowModal = () => {
    const checked = this.checkPrint();
    if (!this.state.visible) {
      if (checked) {
        this.setState({
          visible: !this.state.visible
        })
      }
    } else {
      this.setState({
        visible: !this.state.visible
      })
    }
  }
   /**
   * 模态框确认操作
   */
  onOk = (e) => {
    const { form } = this.props;
    const { filterValue } = this.state;
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      setPrintLabel(fieldsValue.printTemplate);
      this.onshowModal();
    });
  }
  
  /**
  * 绘制右上角按钮
  */
  drawActionButton = () => {
    return (
      <Fragment>
        <Tooltip title={this.state.printTemplate != null && JSON.parse(this.state.printTemplate) && JSON.parse(this.state.printTemplate).name}>
          <Button type='primary'
            // disabled={!havePermission(PRINTLABEL_RES.TEMPLATE)}
            onClick={() => this.onshowModal()}
          ><Icon type="printer" />{commonLocale.printTemplateConfigLocale}
          </Button>
        </Tooltip>
      </Fragment>
    );
  }

  printFR = (selectedRows) => {
    var reportlets = [];
    let dataList = [];
    selectedRows.forEach(row=>{
      row.forEach(r=>{

        let data = {
          containerBarcode:r.containerBarcode,
          crossPickupBillNumber:r.crossPickupBillNumber,
        }

        if(dataList.indexOf(JSON.stringify(data))==-1){
          dataList.push(JSON.stringify(data));
        }
      })
    });

    dataList.forEach(data=>{
      reportlets.push({
          reportlet: this.state.printTemplate?JSON.parse(this.state.printTemplate).path:'',
          containerBarcode: JSON.parse(data).containerBarcode,
          crossPickupBillNumber: JSON.parse(data).crossPickupBillNumber,
          userUuid: loginUser().uuid,
          userCode: loginUser().code,
          userName: loginUser().name,
          dcUuid: loginOrg().uuid,
          dcCode: loginOrg().code,
          dcName: loginOrg().name,
          companyUuid: loginCompany().uuid,
          companyCode: loginCompany().code,
          companyName: loginCompany().name
        })
    })

    var config = {
      printUrl: configs[API_ENV].RPORTER_SERVER,
      isPopUp: false, // 是否弹出设置窗口，true为弹出，false为不弹出
      data: {
        reportlets: reportlets // 需要打印的模板列表
      }
    };
    FR.doURLPrint(config);
  }

  /**
   * 检查是否安装
   */
  checkPrint = () => {
    let hasLocalPrint = true;
    try {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", "http://localhost:9092/socket.io/?EIO=3&transport=polling", false);
      xmlHttp.send(null);
    } catch (error) {
      hasLocalPrint = false;
    }

    if (hasLocalPrint) {
      return true;
    }

    Modal.confirm({
      content: <div>
        {!hasLocalPrint ? <p>没有安装或启动本地打印服务，点击<a href={window.location.origin + '/FinePrint_windows_4_0.exe'} target="_blank">下载安装</a></p> : ''}
        <p>安装完成后，点击确定</p>
      </div>,
      onOk: () => {
        this.onshowModal();
      }
    });

    return false;
  }

  /**
   * 点击打印按钮
   */
  onCheckPrint = ()=>{
    // 检测是否配置打印机
    const checked = this.checkPrint();
    if(checked){
      this.onPrint();
    }

  }

  /**
   * 打印
   */
  onPrint = ()=>{
    const {selectedRows} = this.state;
    let itemUuids = [];
    let finishedFlag = true;
    selectedRows.forEach(row=>{
      row.forEach(r=>{
        itemUuids.push(r.uuid)
        if(r.state !=PickupBillItemState.FINISHED.name){
          finishedFlag = false
        }
      });
    });
    if(finishedFlag){
      this.printFR(selectedRows);
    }else{
      let data = {
        // "printer": "string",
        pickerCode: loginUser().code,
        dcUuid: loginOrg().uuid,
        companyUuid: loginCompany().uuid,
        itemUuids: itemUuids
      }
      this.props.dispatch({
        type: 'pickup/printCrossLabel',
        payload: data,
        callback: response => {
          if (response && response.success) {
            this.printFR(selectedRows);
            this.refreshTable();
  
            message.success(commonLocale.printSuccessLocale);
          } else {
            message.error('打印失败：' + (response && response.message ? response.message : '原因未知'));
          }
        }
      })
    }
    

  }
  /**
   * 单一打印
   */
  onSinglePrint = (record)=>{
    const checked = this.checkPrint();
    if(!checked){
      return;
    }
    let itemUuids = [];
    record.forEach(r=>{
      itemUuids.push(r.uuid)
    });
    let data = {
      // "printer": "string",
      pickerCode: loginUser().code,
      dcUuid: loginOrg().uuid,
      companyUuid: loginCompany().uuid,
      itemUuids: itemUuids
    }
    this.props.dispatch({
      type: 'pickup/printCrossLabel',
      payload: data,
      callback: response => {
        if (response && response.success) {
          this.printFR([record]);
          this.refreshTable();
          message.success(commonLocale.printSuccessLocale);
        } else {
          message.error('打印失败：' + (response && response.message ? response.message : '原因未知'));
        }
      }
    })
  }

  onPrintAgain = (record)=>{
    const checked = this.checkPrint();
    if(checked){
      message.success('打印成功！')
      this.printFR([record]);
    }
  }
  renderOperateCol = (record) => {
    let finishedFlag = true;
    for(let i =0;i<record.length;i++){
      if(record[i].state !=PickupBillItemState.FINISHED.name){
        finishedFlag = false
      }
    }
    return <OperateCol menus={finishedFlag?this.fetchOperatePropsAgain(record):this.fetchOperatePropsCommon(record)} />
  }

  fetchOperatePropsCommon = (record) => {
    return [{
      name: '打印',
      onClick: this.onSinglePrint.bind(this, record)
    }];
  }

  fetchOperatePropsAgain = (record) => {
    return [{
      name: '重新打印',
      onClick: this.onPrintAgain.bind(this, record)
    }];
  }

  columns = [
    {
      title: '容器条码',
      width: colWidth.billNumberColWidth + 50,
      render:(record)=>{
      return <span>{record[0].containerBarcode}</span>
      }
    },{
      title: '集合拣货单号',
      width: colWidth.billNumberColWidth + 50,
      render:(record)=>{
      return <span>{record[0].crossPickupBillNumber}</span>
      }
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

  // drawToolbarPanel() {
  //   return [
  //     <Button key={1} type="primary" onClick={() => this.onCheckPrint()}>
  //       {'打印'}
  //     </Button>,
  //   ];
  // }

  drawSearchPanel = () => {
    return <CrossPrintLabelPageSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch}/>;
  }

  drawOtherCom = ()=>{
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const layout = {
      labelCol: { span: 15 },
      wrapperCol: { span: 10 },
    };
    const { form: { getFieldDecorator }, loading } = this.props;
    return <Modal
      title={commonLocale.printTemplateConfigLocale}
      visible={this.state.visible}
      onOk={this.onOk}
      onCancel={() => this.onshowModal()}
      destroyOnClose={true}>
      <Form {...formItemLayout}>
        <Form.Item key='printTemplate' label={commonLocale.printTemplateLocale}>
          {
            getFieldDecorator('printTemplate', {
              initialValue: this.state.printTemplate=='null' ? undefined :  this.state.printTemplate,
              rules: [
                { required: true, message: notNullLocale(commonLocale.printTemplateLocale) }
              ],
            })(
              <PrintTemplateSelect templateType={PrintTemplateType.CROSSLABELPICK.name} />
            )
          }
        </Form.Item>
      </Form >
    </Modal>
  }
}
