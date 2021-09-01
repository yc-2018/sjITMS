import React, { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { binUsage } from '@/utils/BinUsage';
import { PreviewLocale } from './PreviewLocale';
import { PREVEXAM_RES } from './PreviewPermission';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import { state, moveType, getStateCaption, getTypeCaption } from './PreviewContants';
import ViewNestTablePanel from './ViewNestTablePanel';
import { receiveLocale } from '@/pages/In/Receive/ReceiveLocale';
import { State } from '@/pages/In/Receive/ReceiveContants';
import { orderLocale } from '@/pages/In/Order/OrderLocale';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { loginOrg } from '@/utils/LoginContext';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';

const TabPane = Tabs.TabPane;

@connect(({ preview, loading }) => ({
  preview,
  loading: loading.models.preview,
}))

export default class PreviewBillViewPage extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      entityUuid: props.entityUuid,
      version: props.version,
      groupNo: props.groupNo,
      ocrDate: props.ocrDate,
      isGroupPreview: !!props.groupNo,
      title: '',
      operate: '',
      modalVisible: false,
      entity: [],
      printBillNumbers: [],
      createPermission: PREVEXAM_RES.CREATE,
      billState:'',
      noShowBeforeNext: true,
      noShowInput: true
    };
  }

  componentDidMount() {
    this.refresh(this.props.groupNo, this.props.ocrDate, this.props.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    const {billState} = this.state;
    if (nextProps.refresh) {
      this.refresh(nextProps.groupNo, nextProps.ocrDate, nextProps.entityUuid);     
      return;
    }
    let printBillNumbers = [];
    if (nextProps.preview.entity) {
      if (nextProps.preview.entity.list) {
        Array.isArray(nextProps.preview.entity.list)&&nextProps.preview.entity.list.forEach(bill => {
          printBillNumbers.push(bill.billNumber);
        });

        this.setState({
          entity: nextProps.preview.entity,
          printBillNumbers: printBillNumbers,
          groupNo: nextProps.preview.entity.list[0].groupNo,
          ocrDate: nextProps.preview.entity.list[0].ocrDate, 
          isGroupPreview: true,
          title:'预检组号' + '：' + nextProps.preview.entity.list[0].groupNo,
          showProcessView: false,
        });
      } else {
        let items = [];
        items.push(nextProps.preview.entity);
        printBillNumbers.push(nextProps.preview.entity.billNumber);
        this.setState({
          entity: items,
          entityUuid: nextProps.preview.entity.uuid,
          title: '预检单号' + '：' + nextProps.preview.entity.billNumber,
          printBillNumbers: printBillNumbers,
          isGroupPreview: false,
          showProcessView: false,
          billState:billState
        });
      }
    }
  }

  refresh = (groupNo, ocrDate, entityUuid) => {
    const { entity } = this.state;
    let payload;
    if (groupNo) {
      payload = {
        groupNo: groupNo,
        ocrDate: ocrDate,
      };
      this.props.dispatch({
        type: 'preview/getByGroupNo',
        payload: payload
      });
    } else {
      payload = entityUuid;
      this.props.dispatch({
        type: 'preview/get',
        payload: payload,
        callback: response => {
          if (response && response.success && response.data) {
            this.setState({
              billState: response.data.state
            })
          }
        },
      });
    }
  }

  onBack = () => {
    this.props.dispatch({
      type: 'preview/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      },
    });
  };

  /**
   * 点击上一单
   */
  previousBill = () => {
    const { entity } = this.state;
    let billNumber = '';
    if(entity.list) {
      billNumber = entity.list[0].billNumber;
    } else {
      billNumber = entity[0].billNumber;
    }
    if (billNumber == '') {
      return;
    }
    this.props.dispatch({
      type: 'preview/previousBill',
      payload: billNumber,
      callback: response => {
        if (response && response.success && response.data) {
          this.props.dispatch({
            type: 'preview/showPage',
            payload: {
              showPage: 'view',
              entityUuid: response.data.uuid,
              version: response.data.version,
              groupNo: response.data.groupNo,
              ocrDate: response.data.ocrDate,
              refresh: true,
            }
          });
        }
      },
    });
  }
  /**
   * 点击下一单
   */
  nextBill = () => {
    const { entity } = this.state;
    let billNumber = '';
    if(entity.list) {
      billNumber = entity.list[0].billNumber;
    } else {
      billNumber = entity[0].billNumber;
    }
    if (billNumber == '') {
      return;
    }
    this.props.dispatch({
      type: 'preview/nextBill',
      payload: billNumber,
      callback: response => {
        if (response && response.success && response.data) {
          this.props.dispatch({
            type: 'preview/showPage',
            payload: {
              showPage: 'view',
              entityUuid: response.data.uuid,
              version: response.data.version,
              groupNo: response.data.groupNo,
              ocrDate: response.data.ocrDate,
              refresh: true,
            }
          });
        }
      },
    });
  }


  /*
  * 新增
  */
  onCreate = () => {
    this.props.dispatch({
      type: 'preCheck/showPage',
      payload: {
        showPage: 'create',
        billNumber: this.state.billNumber
      }
    });
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate) {
      this.setState({
        operate: operate,
      });
    }
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  };
  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate,entity } = this.state;
    if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
    const that = this;

    if (operate === commonLocale.finishLocale) {
      if(entity.list){
        let bacth = (i) => {
          if (i < entity.list.length) {
              if (entity.list[i].state === state.audited.name) {
                that.onGroupFinish(entity.list[i], true).then(res => {
                  bacth(i + 1);
                });
              } else {
                bacth(i + 1);
              }
          } else {
            this.setState({
              modalVisible: !this.state.modalVisible,
            });
            that.refresh(this.state.groupNo, this.state.ocrDate, this.state.entityUuid);
            message.success(commonLocale.finishSuccessLocale)
          }
        }
        bacth(0);
      }else{
        this.onFinish();
      }

    }
  };


  onGroupFinish = (record, batch)=>{
    const that = this;
		return new Promise(function (resolve, reject) {
			that.props.dispatch({
				type: 'preview/finish',
				payload: {
          uuid: record.uuid,
          version: record.version,
				},
				callback: response => {
					if (batch) {
            resolve({ success: response.success });
            return;
          }
				}
			});
		})
  }


  onFinish = ()=>{
    
    this.props.dispatch({
      type: 'preview/finish',
      payload: {
        uuid:this.state.entity[0].uuid,
        version:this.state.entity[0].version,
      },
      callback: response => {
        if (response && response.success) {
          this.refresh(this.state.groupNo, this.state.ocrDate, this.state.entityUuid);
          message.success(commonLocale.finishSuccessLocale);
        }
      },
    });
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  }
  onAudit = () => {
    let audits = {
      uuid: this.state.entityUuid,
      groupNo: this.state.groupNo,
      ocrDate: this.state.ocrDate,
      dcUuid: loginOrg().uuid,
    };

    this.props.dispatch({
      type: 'preview/audit',
      payload: audits,
      callback: response => {
        if (response && response.success) {
          this.refresh(this.state.groupNo, this.state.ocrDate, this.state.entityUuid);
          message.success(commonLocale.auditSuccessLocale);
        } else {
          message.error(response.message);
          this.setState({
            modalLoading: false,
          });
        }
      },
    });
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  };

  drawStateTag = () => {
    if (this.state.billState) {
      return (
        <TagUtil value={this.state.billState}/>
      );
    } else {
      return <div>{''}</div>
    }
  };

  onCreate = (record) => {
    let showPage = '';
    if (!record){
      showPage = 'create'
    }else {  //编辑页面重新做，不和新建放一起
      if (record.groupNo) {
        showPage = 'editForGroup'
      } else {
        showPage = 'editForSingle'
      }
    }
    this.props.dispatch({
      type: 'preview/showPage',
      payload: {
        showPage: showPage,
        entityUuid: record? record.uuid : undefined,
        groupNo: record? record.groupNo : undefined,
        ocrDate: record? record.ocrDate : undefined,
      }
    });
  }

  onEdit = () => {
    let showPage;
    let groupNo;
    let ocrDate;
    let uuid;
    const { isGroupPreview, entity } = this.state;
      if (isGroupPreview) {
        showPage = 'editForGroup';
        groupNo = entity.list[0].groupNo;
        ocrDate = entity.list[0].ocrDate;
      } else {
        showPage = 'editForSingle'
        uuid = entity.uuid;
      }

    this.props.dispatch({
      type: 'preview/showPage',
      payload: {
        showPage: showPage,
        entityUuid: uuid,
        groupNo: groupNo,
        ocrDate: ocrDate,
      }
    });
  }

  drawFinishButton = ()=>{
    const {entity} = this.state
    if(!this.state.isGroupPreview && entity.length > 0 && state.audited.name === entity[0].state){
      return  <Button type="primary" onClick={() => this.handleModalVisible(commonLocale.finishLocale)} disabled={!havePermission(PREVEXAM_RES.FINISH)}>
          {commonLocale.finishLocale}
      </Button>
    }else if(this.state.isGroupPreview&& entity.list && entity.list.length > 0){
      let hasAudit = false;
      entity.list.forEach(item=>{
        if(item.state === state.audited.name){
          hasAudit = true;
        }
      });

      if(hasAudit){
        return  <Button type="primary" onClick={() => this.handleModalVisible(commonLocale.finishLocale)} disabled={!havePermission(PREVEXAM_RES.FINISH)}>
          {commonLocale.finishLocale}
        </Button>;
      }else{
        return null;
      }
    }
  }

  drawActionButtion = () => {
    const { entity, printBillNumbers } = this.state;
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        <PrintButton
            reportParams={[{ 'billNumber': printBillNumbers }]}
            moduleId={'PREVEXAMBILL'} />
        {
          (!this.state.isGroupPreview && entity.length > 0 && State.SAVED.name === entity[0].state) ||
          (this.state.isGroupPreview && entity.list && entity.list.length > 0 && State.SAVED.name === entity.list[0].state)?
            <Button type="primary" onClick={() => this.onEdit()} disabled={!havePermission(PREVEXAM_RES.CREATE)}>
              {commonLocale.editLocale}
            </Button>
            : null
        }
        {
          (!this.state.isGroupPreview && entity.length > 0 && State.SAVED.name === entity[0].state) ||
          (this.state.isGroupPreview && entity.list && entity.list.length > 0 && State.SAVED.name === entity.list[0].state)?
            <Button type="primary" onClick={() => this.handleModalVisible(commonLocale.auditLocale)} disabled={!havePermission(PREVEXAM_RES.AUDIT)}>
              {commonLocale.auditLocale}
            </Button>
            : null
        }
        {this.drawFinishButton()}
      </Fragment>
    );
  };

  drawPreviewInfoTab = () => {
    const { entity } = this.state;
    let profileItems;
    if (this.state.isGroupPreview) {
      profileItems = [
        {
          label: '预检组号',
          value: (entity.list && entity.list.length > 0 && entity.list[0].groupNo) ?
            entity.list[0].groupNo : 'undefined',
        },
        {
          label: '容器类型',
          value: (entity.list && entity.list.length > 0 && entity.list[0].containerType) ?
            '[' + entity.list[0].containerType.code + ']' + entity.list[0].containerType.name : 'undefined',
        },
        {
          label: '发生时间',
          value: (entity.list && entity.list.length > 0 && entity.list[0].ocrDate) ?
            entity.list[0].ocrDate : 'undefined',
        },
        {
          label: commonLocale.noteLocale,
          value: entity.note
        }
      ];
    } else {
      profileItems = [
        {
          label: '容器类型',
          value: entity && entity.length > 0 && entity[0].containerType ?
            '[' + entity[0].containerType.code + ']' + entity[0].containerType.name : 'undefined',
        },
        {
          label: '发生时间',
          value: entity && entity.length > 0 && entity[0].ocrDate ?
            entity[0].ocrDate : 'undefined',
        },
        {
          label: commonLocale.noteLocale,
          value: entity.note
        }
      ];
    }
    //
    // let timeLineData = [
    //   { title: receiveLocale.startReceiveTime, time: entity.startReceiveTime },
    // ];
    // if (entity.state === State.AUDITED.name) {
    //   timeLineData.push({ title: receiveLocale.endReceiveTime, time: entity.endReceiveTime });
    // } else {
    //   timeLineData.push({ title: receiveLocale.endReceiveTime, time: undefined });
    // }
    // if (entity.uploadDate) {
    //   timeLineData.push({ title: commonLocale.inUploadDateLocale, time: entity.uploadDate });
    // }
    // let current = 0;
    // for (let i = timeLineData.length - 1; i >= 0; i--) {
    //   if (timeLineData[i].time) {
    //     current = i;
    //     break;
    //   }
    // }
    let orderCols = [
      {
        title: '预检序号',
        key: 'serialNo',
        width: 80,
        render: record => <EllipsisCol colValue={record.serialNo}/>,
      },
      {
        title: '预检单号',
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
        render: record => record.logisticMode? LogisticMode[record.logisticMode].caption : ''
      },
      {
        title: commonLocale.stateLocale,
        width: colWidth.enumColWidth,
        render: record => <BadgeUtil value={record.state} />
      },
    ];

    let orderDtlCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={'[' + record.article.code + ']' + record.article.name}/>,
      },
      {
        title: '货品条码',
        key: 'articleBarCode',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={record? record.articleBarCode : ''}/>,
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        dataIndex: 'qpcStr',
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth + 20,
        render: (text, record) => <EllipsisCol colValue={record.qpcStr + '/' + record.munit}/>,
      },
      {
        title: commonLocale.inQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => <EllipsisCol colValue={record.qtyStr}/>,
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyColWidth,
        render: (text, record) => <EllipsisCol colValue={record.qty}/>,
      },
    ];

    let dataSource;
    if(this.state.isGroupPreview) {
      dataSource = entity.list ? entity.list : [];
    }
    else{
      dataSource = entity;
    }
    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
          <ViewPanel onCollapse={this.onCollapse} items={profileItems} title={commonLocale.profileItemsLocale}
                     // rightTile={this.darwProcess()}
          />
          <ViewNestTablePanel
            title={commonLocale.itemsLocale}
            notNote={true}
            columns={orderCols}
            nestColumns={orderDtlCols}
            data={dataSource}
          />
          <div>
            <ConfirmModal
              visible={this.state.modalVisible}
              operate={this.state.operate}
              object={'预检单'}
              onOk={this.handleOk}
              onCancel={this.handleModalVisible}
            />
          </div>
      </TabPane>
    );
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  }

  // darwProcess = () => {
  //   return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  // }

  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      const data = [{
        title: '开始预检',
        subTitle: entity.startReceiveTime ? entity.startReceiveTime : '',
        current: entity.state !== '',
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.totalQtyStr
        },
          {
            label: '品项数',
            value: entity.totalArticleCount
          },
          {
            label: commonLocale.inAllAmountLocale,
            value: entity.totalAmount
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: entity.totalVolume
          },
          {
            label: commonLocale.inAllWeightLocale,
            value: entity.totalWeight
          }
        ]
      },{
        title: '结束',
        subTitle: entity.endReceiveTime,
        current: entity.state == state.finished.name,
        description: [
          {
            label: '已收货件数',
            value: entity.totalReceivedQtyStr
          }, {
            label: '已收货品项数',
            value: entity.totalReceivedArticleCount
          }, {
            label: '已收货金额',
            value: entity.totalReceivedAmount
          }, {
            label: '已收货体积',
            value: entity.totalReceivedVolume
          }, {
            label: '已收货重量',
            value: entity.totalReceivedWeight
          }, {
            label: '总订单数',
            value: entity.totalOrderBillCount
          }]
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawPreviewInfoTab(),
    ];

    return tabPanes;
  };

}
