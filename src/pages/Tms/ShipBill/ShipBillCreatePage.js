import { connect } from 'dva';
import moment from 'moment';
import { Select, Form, message, InputNumber, Tabs } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
//import ItemEditTable from './ItemEditTable';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';

import {
    commonLocale, notNullLocale, placeholderChooseLocale,
    placeholderLocale
} from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import { shipBillLocale } from './ShipBillLocale';
import { WorkType,State, getStateCaption } from './ShipBillContants';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { add, accAdd, accMul } from '@/utils/QpcStrUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import ShipPlanBillSelect from './ShipPlanBillSelect';
import AttachmentSelect from './AttachmentSelect';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import UserSelect from '@/pages/Component/Select/UserSelect';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import ShipBillSearchFormItemBatchAdd from './ShipBillSearchFormItemBatchAdd';
import ShiperSelectModal from './ShiperSelectModal';
import AtricleDtlModal from './AtricleDtlModal';
import FromOrgSelect from './FromOrgSelect';
import ToOrgSelect from './ToOrgSelect';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
@connect(({ shipbill, shipplanbill, collectbinreviewshipconfig, loading }) => ({
    shipbill,
    shipplanbill,
    collectbinreviewshipconfig,
    loading: loading.models.shipbill
}))

@Form.create()
export default class ShipBillCreatePage extends CreatePage {
    constructor(props) {
        super(props);

        this.state = {
            title: commonLocale.createLocale + shipBillLocale.title,
            currentView: CONFIRM_LEAVE_ACTION.NEW,
            entity: {
                employees: [],
                billItems: [],
                attachmentItems: [],
                shipPlanBillNumber: undefined
            },
            unShipItems: [],
            shipPlanBillItems: [],
            isReviewResultShipMap: new Map(),
            /** 批量*/
            containerShipBatchAddVisible: false,
            unShipContainerData: {
                list: [],
                pagination: {}
            },
            detailAtricleData: {
              list: []
            },
            shiperModalVisible: false,
            attachmentShipBatchAddVisible: false,
            atricleModalVisible: false,
            unShipAttachmentList: [],
            containerShipSelectedRowKeys: [],
            attachmenShipSelectedRowKeys: [],
            shipType: "container",
            containerPageFilter: {
                page: 0,
                pageSize: 10,
                companyUuid: loginCompany().uuid
            }
        }
    }

    componentDidMount() {
        if (this.props.shipbill.entityUuid) {
            this.setState({
                currentView: CONFIRM_LEAVE_ACTION.EDIT
            })
            this.props.dispatch({
                type: 'shipbill/get',
                payload: this.props.shipbill.entityUuid,
                callback: response => {
                  if (response && response.success) {
                    if (response.data && response.data.shipPlanBillNumber) {
                      this.onGetShipPlanBillItems(response.data.shipPlanBillNumber)
                    }
                  }
                }
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.shipbill.entity && nextProps.shipbill.entity.uuid && !this.state.entity.uuid &&
            nextProps.shipbill.entity != this.props.shipbill.entity) {
            let billItems = nextProps.shipbill.entity.billItems ? nextProps.shipbill.entity.billItems : [];
            if (billItems) {
                billItems.forEach(function (data, index) {
                    data.line = index + 1;
                });
                nextProps.shipbill.entity.billItems = billItems;
            }
            let attachmentItems = nextProps.shipbill.entity.attachmentItems ? nextProps.shipbill.entity.attachmentItems : [];
            if (attachmentItems) {
                attachmentItems.forEach(function (data, index) {
                    data.line = index + 1;
                });
                nextProps.shipbill.entity.attachmentItems = attachmentItems;
            }
            this.setState({
                title: shipBillLocale.title + ':' + nextProps.shipbill.entity.billNumber,
                entity: nextProps.shipbill.entity,
                noNote:nextProps.shipbill.entity.state === State.INPROGRESS.name?true:false
            });

            if ("-" != nextProps.shipbill.entity.shipPlanBillNumber) {
                // this.onQueryUnShipItems(nextProps.shipbill.entity.shipPlanBillNumber);
                // this.onGetShipPlanBillItems(nextProps.shipbill.entity.shipPlanBillNumber);
            }
        }

        if (nextProps.shipbill.entity && nextProps.shipbill.entity.shipPlanBillNumber && !nextProps.shipbill.entity.uuid
            && !this.state.entity.shipPlanBillNumber) {
            this.setState({
                entity: { ...this.state.entity, shipPlanBillNumber: nextProps.shipbill.entity.shipPlanBillNumber }
            });
            // this.onQueryUnShipItems(nextProps.shipbill.entity.shipPlanBillNumber);
            // this.onGetShipPlanBillItems(nextProps.shipbill.entity.shipPlanBillNumber);
        }

        if (nextProps.shipbill.entity && "-" != nextProps.shipbill.entity.shipPlanBillNumber && nextProps.shipbill.unShipItems && nextProps.shipbill.unShipItems.length>0) {
            this.setState({
                unShipItems: nextProps.shipbill.unShipItems
            })
        }

        if (nextProps.shipbill.entity && "-" === nextProps.shipbill.entity.shipPlanBillNumber && nextProps.shipbill.toOrgData && nextProps.shipbill.toOrgData.list && nextProps.shipbill.toOrgData.list.length>0) {
            this.setState({
                unShipItems: nextProps.shipbill.toOrgData.list
            });
        }

        if (nextProps.shipbill.unShipContainerData) {
            this.setState({
                unShipContainerData: nextProps.shipbill.unShipContainerData
            })
        }

      if (nextProps.shipbill.detailAtricleData) {
        this.setState({
          detailAtricleData: nextProps.shipbill.detailAtricleData
        })
      }

        if (nextProps.collectbinreviewshipconfig) {
            let key = nextProps.collectbinreviewshipconfig.sourceDcUuid;
            let value = nextProps.collectbinreviewshipconfig.data;
            let reviewResultShipMap = this.state.isReviewResultShipMap;
            reviewResultShipMap.set(key, value);
            this.setState({
                isReviewResultShipMap: reviewResultShipMap
            })
        }

        if (nextProps.shipplanbill.entity
            && nextProps.shipplanbill.entity.items
            && nextProps.shipplanbill.entity.items.length > 0) {
            this.setState({
                shipPlanBillItems: nextProps.shipplanbill.entity.items
            })
        }

    }

    onSaveAndCreate = (data) => {
        let newData = { ...this.state.entity };
        newData.note = data.note;

        newData = this.validData(newData);
        if (!newData) {
            return;
        }

        let type = 'shipbill/onSaveAndCreate';
        newData.companyUuid = loginCompany().uuid;
        this.props.dispatch({
            type: type,
            payload: newData,
            callback: response => {
                if (response && response.success) {
                    this.setState({
                        entity: {
                            employees: [],
                            billItems: [],
                            attachmentItems: [],
                            shipPlanBillNumber: undefined
                        },
                    })
                    this.props.form.resetFields();
                    message.success(commonLocale.saveSuccessLocale);
                }
            }
        });
    }


    onSave = (data) => {
        let newData = { ...this.state.entity };
        newData.note = data.note;

        newData = this.validData(newData);
        if (!newData) {
            return;
        }

        let type = 'shipbill/onSave';
        if (newData.uuid) {
            type = 'shipbill/onModify';
        }
        newData.companyUuid = loginCompany().uuid;
        this.props.dispatch({
            type: type,
            payload: newData,
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                }
            }
        });
    }

    validData = (newData) => {
        if (newData.billItems.length === 0 && newData.attachmentItems.length === 0) {
            message.error("排车任务明细和附件明细不能同时为空");
            return false;
        }

        for (let i = newData.billItems.length - 1; i >= 0; i--) {
            if (!newData.billItems[i].fromOrg) {
                message.error(`明细第${newData.billItems[i].line}行来源不能为空！`);
                return false;
            }

            if (!newData.billItems[i].store) {
                message.error(`明细第${newData.billItems[i].line}行门店不能为空！`);
                return false;
            }
            if (!newData.billItems[i].shiper) {
                message.error(`明细第${newData.billItems[i].line}行装车员不能为空！`);
                return false;
            }
        }

        for (let i = 0; i < newData.billItems.length; i++) {
            for (let j = i + 1; j < newData.billItems.length; j++) {
                if (newData.billItems[i].containerBarcode === newData.billItems[j].containerBarcode &&
                    newData.billItems[i].binCode === newData.billItems[j].binCode &&
                    newData.billItems[i].fromOrg.uuid === newData.billItems[j].fromOrg.uuid &&
                    newData.billItems[i].store.uuid === newData.billItems[j].store.uuid) {
                    message.error(`明细第${newData.billItems[i].line}行与第${newData.billItems[j].line}行重复！`);
                    return false;
                }
            }
        }

        for (let i = newData.attachmentItems.length - 1; i >= 0; i--) {

            if (!newData.attachmentItems[i].fromOrg) {
                message.error(`附件明细第${newData.attachmentItems[i].line}行来源不能为空！`);
                return false;
            }

            if (!newData.attachmentItems[i].store) {
                message.error(`附件明细第${newData.attachmentItems[i].line}行门店不能为空！`);
                return false;
            }

            if (!newData.attachmentItems[i].attachment || !newData.attachmentItems[i].attachment.uuid) {
                message.error(`附件明细第${newData.attachmentItems[i].line}行附件不能为空！`);
                return false;
            }

            if (!newData.attachmentItems[i].shiper) {
                message.error(`附件明细第${newData.attachmentItems[i].line}行装车员不能为空！`);
                return false;
            }

            if (!newData.attachmentItems[i].qtyStr || newData.attachmentItems[i].qtyStr <= 0) {
                message.error(`附件明细第${newData.attachmentItems[i].line}行件数必须大于0！`);
                return false;
            }
        }

        return newData;
    }

    onCancel = () => {
        this.props.dispatch({
            type: 'shipbill/showPage',
            payload: {
                showPage: 'query'
            }
        });
        this.setState({
            entity: {}
        })
    }

  onQueryUnShipItemsForShip = (shipPlanBillNumber) => {
        const { entity, unShipItems } = this.state;
      let stevedores = [];
      let drivers = [];
      if (entity.employees) {
        entity.employees.forEach(function (employee) {
          if (WorkType.DRIVER.name == employee.vehicleEmployeeType)
            drivers.push(employee.vehicleEmployee);
          else
            stevedores.push(employee.vehicleEmployee);
        });
      }
        this.props.dispatch({
            type: 'shipbill/queryUnShipItemsForShip',
            payload: {
                shipPlanBillNumber: shipPlanBillNumber
            },
            callback: response => {
              if (response && response.success && response.data) {
                let data = response.data;
                if( data && data.length>0 ) {
                  data.forEach(function (item, index) {
                    item.line = index + 1;
                    if(stevedores.length >0) {
                      item.shiper = stevedores[0]
                    }
                  });
                }
                entity.billItems = data;
                this.setState({
                  entity: {...entity},
                  unShipItems: data
                })
              }
            }
        });
    }

  onQueryUnShipItems = (shipPlanBillNumber) => {
    const { entity, unShipItems } = this.state;
    let stevedores = [];
    let drivers = [];
    if (entity.employees) {
      entity.employees.forEach(function (employee) {
        if (WorkType.DRIVER.name == employee.vehicleEmployeeType)
          drivers.push(employee.vehicleEmployee);
        else
          stevedores.push(employee.vehicleEmployee);
      });
    }
    this.props.dispatch({
      type: 'shipbill/queryUnShipItems',
      payload: {
        shipPlanBillNumber: shipPlanBillNumber
      },
      callback: response => {
        if (response && response.success && response.data) {
          let data = response.data;
          if( data && data.length>0 ) {
            data.forEach(function (item, index) {
              item.line = index + 1;
              if(stevedores.length >0) {
                item.shiper = stevedores[0]
              }
            });
          }
          entity.billItems = data;
          this.setState({
            entity: {...entity},
            unShipItems: data
          })
        }
      }
    });
  }

    onGetShipPlanBillItems = (shipPlanBillNumber) => {
        this.props.dispatch({
            type: 'shipplanbill/getByBillNumber',
            payload: {
                billNumber: shipPlanBillNumber
            },
            callback: response => {
              if (response && response.success && response.data) {
                let data = response.data;
                this.setState({
                  showValue: data.sourceBillNumber ? true : false
                })
                if( data.sourceBillNumber ) {
                  this.onQueryUnShipItemsForShip(shipPlanBillNumber);
                } else {
                  this.onQueryUnShipItems(shipPlanBillNumber);
                }

              }
            }
        });
    }

    onQueryIsReviewResultShip = (dcUuid) => {
        this.props.dispatch({
            type: 'collectbinreviewshipconfig/get',
            payload: {
                dcUuid: dcUuid
            }
        });
    }

    listToStr = (list) => {
        let listStr = '';
        Array.isArray(list) && list.forEach(function (data, index) {
            listStr = listStr + convertCodeName(data);
            if (index < list.length - 1) {
                listStr = listStr + '、';
            }
        });
        return listStr;
    }

    onShipPlanBillChange = (shipPlanBillNumber, vehicle, employees, serialArch) => {
        const { entity } = this.state;

        entity.shipPlanBillNumber = shipPlanBillNumber;
        entity.vehicle = vehicle;
        entity.employees = employees;
        entity.serialArch = serialArch;
        this.setState({
            entity: { ...entity }
        });

        // this.onQueryUnShipItems(entity.shipPlanBillNumber);
        this.onGetShipPlanBillItems(entity.shipPlanBillNumber);
    }

    getFromOrgs = () => {
        const { unShipItems } = this.state;
        let fromOrgs = [];
        let fromOrgUuids = [];

      unShipItems && unShipItems.length > 0 && unShipItems.forEach(e => {
        fromOrgs.push(e.fromOrg);
        fromOrgUuids.push(e.fromOrg && e.fromOrg.uuid ? e.fromOrg.uuid : '');
            // if (!fromOrgUuids || !fromOrgUuids.includes(e.fromOrg && e.fromOrg.uuid ? e.fromOrg.uuid : '')) {
            //     fromOrgs.push(e.fromOrg);
            //     fromOrgUuids.push(e.fromOrg && e.fromOrg.uuid ? e.fromOrg.uuid : '');
            // }
        });
        return fromOrgs;
    }

    getFromOrgOptions = () => {
        const options = [];
        const fromOrgs = this.getFromOrgs();

      fromOrgs &&  fromOrgs.length> 0 && fromOrgs.forEach(e => {
            options.push(
                <Select.Option key={e && e.uuid ? e.uuid : 'a'} value={JSON.stringify(e)}>
                    {convertCodeName(e)}
                </Select.Option>
            );
        });
        return options;
    }

    getStores = (record) => {
        let stores = [];
        if (!record.fromOrg)
            return stores;
        const { unShipItems } = this.state;
        let storeUuids = [];

      unShipItems && unShipItems.length > 0 && unShipItems.forEach(e => {
        if(e && e.fromOrg && record && record.fromOrg && e.fromOrg.uuid && record.fromOrg.uuid) {
          stores.push(e.store);
          storeUuids.push(e.store && e.store.uuid ? e.store.uuid : '');
          // if ((e.fromOrg.uuid === record.fromOrg.uuid) && (!storeUuids || !storeUuids.includes(e.store && e.store.uuid ? e.store.uuid : ''))) {
          //   stores.push(e.store);
          //   storeUuids.push(e.store && e.store.uuid ? e.store.uuid : '');
          // }
         }
        });
        return stores;
    }

    getStoreOptions = (record) => {
        const options = [];
        if (!record.fromOrg)
            return options;

        const stores = this.getStores(record);

        stores.forEach(e => {
            options.push(
                <Select.Option key={e.uuid} value={JSON.stringify(e)}>
                    {convertCodeName(e)}
                </Select.Option>
            );
        });
        return options;
    }

    refreshStatisticProfile = (record) => {
        if (!record.fromOrg || !record.store)
            return;

        const { unShipItems } = this.state;
        let amount = 0;
        let weight = 0;
        let volume = 0;
        let qtyStr = 0;


      unShipItems && unShipItems.length > 0 && unShipItems.forEach(e => {
        if(e && e.fromOrg && record && record.fromOrg && e.fromOrg.uuid && record.fromOrg.uuid) {
          if (e.fromOrg.uuid === record.fromOrg.uuid && e.store.uuid === record.store.uuid) {
            record.reviewResultShip = e.reviewResultShip;
            record.dockGroupStr = e.dockGroupStr;
            if (e.containerBarcode === record.containerBarcode) {
              record.amount = e.amount;
              record.weight = e.weight;
              record.volume = e.volume;
              record.ship = e.ship;
              record.binCode = e.binCode;
              record.qtyStr = e.qtyStr;
            }
            }
          }
        });
    }

    getContainers = (record) => {
        let containerBarcode = [];
        if (!record.fromOrg || !record.store)
            return containerBarcode;

        const { unShipItems } = this.state;

      unShipItems && unShipItems.length > 0 && unShipItems.forEach(e => {
        if(e && e.fromOrg && record && record.fromOrg && e.fromOrg.uuid && record.fromOrg.uuid) {
          if (e.fromOrg.uuid === record.fromOrg.uuid && e.store.uuid === record.store.uuid) {
            containerBarcode.push(e.containerBarcode);
            }
          }
        });
        return containerBarcode;
    }

    getContainerOptions = (record) => {
        const options = [];
        let containerBarcode = [];
        if (!record.fromOrg || !record.store)
            return options;
        const containers = this.getContainers(record);

        containers.forEach(e => {
            options.push(
                <Select.Option key={e} value={e}>
                    {e}
                </Select.Option>
            );
        });
        return options;
    }

    getAttachmentFromOrgs = () => {
        let fromOrgs = [];
        let fromOrgUuids = [];

        const { shipPlanBillItems } = this.state;
        if (!shipPlanBillItems || shipPlanBillItems.length <= 0)
            return fromOrgs;

        shipPlanBillItems.forEach(billItem => {
            if (billItem.shipPlanType == 'DELIVERY' && !fromOrgUuids || !fromOrgUuids.includes(billItem.fromOrg.uuid)) {
                fromOrgUuids.push(billItem.fromOrg.uuid);
                fromOrgs.push(billItem.fromOrg);
            }
        });

        return fromOrgs;
    }

    getAttachmentFromOrgOptions = () => {
        const options = [];
        const fromOrgs = this.getAttachmentFromOrgs();

        fromOrgs.forEach(e => {
            options.push(
                <Select.Option key={e.uuid} value={JSON.stringify(e)}>
                    {convertCodeName(e)}
                </Select.Option>
            );
        });
        return options;
    }

    getAttachmentStores = (record) => {
        let stores = [];
        let storeUuids = [];
        if (!record.fromOrg)
            return stores;

        const { shipPlanBillItems } = this.state;
        if (!shipPlanBillItems || shipPlanBillItems.length <= 0)
            return stores;

        shipPlanBillItems.forEach(billItem => {
            if (billItem.shipPlanType == 'DELIVERY' && (billItem.fromOrg.uuid === record.fromOrg.uuid) && (!storeUuids || !storeUuids.includes(billItem.toOrg.uuid))) {
                stores.push(billItem.toOrg);
                storeUuids.push(billItem.toOrg.uuid);
            }
        });
        return stores;
    }

    getAttachmentStoreOptions = (record) => {
        const options = [];
        if (!record.fromOrg)
            return options;

        const stores = this.getAttachmentStores(record);

        stores.forEach(e => {
            options.push(
                <Select.Option key={e.uuid} value={JSON.stringify(e)}>
                    {convertCodeName(e)}
                </Select.Option>
            );
        });
        return options;
    }

    isReview = (record) => {
        if (!record.fromOrg || !record.fromOrg.uuid)
            return null;

        const { isReviewResultShipMap } = this.state;
        let isReview = null;
        if (isReviewResultShipMap && isReviewResultShipMap.get(record.fromOrg.uuid)) {
            isReview = true;
        }
        return isReview;
    }

    drawFormItems = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity } = this.state;

        let cols = [
            <CFormItem key='shipPlanBillNumber' label={shipBillLocale.shipPlanBill}>
                {
                    getFieldDecorator('shipPlanBillNumber', {
                        rules: [
                            { required: true, message: notNullLocale(shipBillLocale.shipPlanBill) },
                        ],
                        initialValue: entity.shipPlanBillNumber ? entity.shipPlanBillNumber : undefined,
                    })(
                        <ShipPlanBillSelect
                            disabled={entity.uuid ? true : false}
                            onChange={this.onShipPlanBillChange}
                            placeholder={shipBillLocale.shipPlanBill}
                        />
                    )
                }
            </CFormItem>,
            <CFormItem label={shipBillLocale.serialArch} key='serialArch'>
                {getFieldDecorator('serialArch', {
                    initialValue: entity.serialArch ? convertCodeName(entity.serialArch) : null
                })(<span>{entity.serialArch ? convertCodeName(entity.serialArch) : <Empty />}</span>)}
            </CFormItem>,
            <CFormItem label={shipBillLocale.vehicle} key='vehicle'>
                {getFieldDecorator('vehicle', {
                    initialValue: entity.vehicle ? convertCodeName(entity.vehicle) : null
                })(<span>{entity.vehicle ? convertCodeName(entity.vehicle) : <Empty />}</span>)}
            </CFormItem>
        ];

        let drivers = [];
        let stevedores = [];
        if (entity.employees) {
            entity.employees.forEach(function (employee) {
                if (WorkType.DRIVER.name == employee.vehicleEmployeeType)
                    drivers.push(employee.vehicleEmployee);
                else
                    stevedores.push(employee.vehicleEmployee);
            });
        }

        cols.push(
            <CFormItem label={shipBillLocale.driver} key='driver'>
                {getFieldDecorator('drivers', {
                    initialValue: drivers.length > 0 ? this.listToStr(drivers) : <Empty />
                })(<span>{drivers.length > 0 ? this.listToStr(drivers) : <Empty />}</span>)}
            </CFormItem>,
            <CFormItem label={shipBillLocale.stevedore} key='driver'>
                {getFieldDecorator('stevedores', {
                    initialValue: stevedores.length > 0 ? this.listToStr(stevedores) : <Empty />
                })(<span>{stevedores.length > 0 ? this.listToStr(stevedores) : <Empty />}</span>)}
            </CFormItem>
        );
      return [
        <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} />
      ];
    }

    /**
* 绘制总数量
*/
    drawTotalInfo = () => {
        var allQtyStr = 0;
        var allQty = 0;
        var allVolume = 0;
        var allWeight = 0;
        var allAmount = 0;
        if (this.state.entity.billItems) {
            this.state.entity.billItems.map(item => {
                if (!item.qty) {
                    item.qty = 0;
                }
                if (!item.qtyStr) {
                    item.qtyStr = 0;
                }
                if (!item.amount) {
                    item.amount = 0;
                }
                if (!item.weight) {
                    item.weight = 0;
                }
                if (!item.volume) {
                    item.volume = 0;
                }

                allQtyStr = add(allQtyStr, item.qtyStr);
                allAmount = accAdd(allAmount, item.amount);
                allWeight = accAdd(allWeight, item.weight);
                allVolume = accAdd(allVolume, item.volume);
            });
        }

        return (
            <span style={{ marginLeft: '10px' }}>
                {commonLocale.inAllQtyStrLocale + ':' + allQtyStr}  |
                {commonLocale.inAllAmountLocale + ':' + allAmount.toFixed(4)} |
                {commonLocale.inTmsAllWeightLocale + ':' + Number(allWeight / 1000).toFixed(4)} |
                {commonLocale.inAllVolumeLocale + ':' + allVolume.toFixed(4)}
            </span>
        );
    }

    containerShipRowSelection = (selectedRowKeys, selectedRows) => {
        this.setState({
            containerShipSelectedRowKeys: selectedRowKeys
        })
    }

    attachmenShipRowSelection = (selectedRowKeys, selectedRows) => {
        this.setState({
            attachmenShipSelectedRowKeys: selectedRowKeys
        })
    }

  /** 查看当前门店对应的商品明细*/
  handleAtricleDtlVisible = (record) => {
    const { entity, detailAtricleData, atricleModalVisible } = this.state;
    this.setState({
      atricleModalVisible: !this.state.atricleModalVisible
    })
    if(record && record.fromOrg && record.store) {
      this.props.dispatch({
        type: 'shipbill/queryStockItem',
        payload: {
          companyUuid: loginCompany().uuid,
          shipPlanBillNumber: entity.shipPlanBillNumber,
          fromOrg: record.fromOrg,
          toOrg: record.store
        },
        callback: response => {
          if (response && response.success && response.data) {
            detailAtricleData.list = response.data;
            this.setState({
              detailAtricleData: {...detailAtricleData}
            })
          }
        }

      });
    }
  }

  handleAtricleBatchAddVisible = () => {
    this.setState({
      atricleModalVisible: !this.state.atricleModalVisible
    })
  }

    /** 批量添加弹出框-容器*/
    handleContainerShipBatchAddVisible = () => {
        this.setState({
            containerShipBatchAddVisible: !this.state.containerShipBatchAddVisible
        })
    }

    /** 批量添加弹出框-附件*/
    handleAttachmentShipBatchAddVisible = () => {
        this.setState({
            attachmentShipBatchAddVisible: !this.state.attachmentShipBatchAddVisible
        })
    }

    /** 刷新装车员弹出框*/
    handleShiperRefreshVisible = () => {
        this.setState({
            shiperModalVisible: !this.state.shiperModalVisible
        })
    }

    /**
    * 绘制按钮-容器
    */
    drawContainerShipBatchButton = () => {
        return (
            <span>
                <a onClick={() => this.handleContainerShipBatchAddVisible()}>批量添加</a>
            </span>
        )
    }

    /**
    * 绘制按钮-附件
    */
    drawAttachmentShipBatchButton = () => {
        return (
            <span>
                <a onClick={() => this.handleAttachmentShipBatchAddVisible()}>批量添加</a>
            </span>
        )
    }


    /**
    * 绘制批量刷新装车员按钮-附件
    */
    drawAttachmentShiperBatchButton = () => {
        return (
            <span>
                <a onClick={() => this.onClickShiperRefreshModal("attachment")}>批量刷新装车员</a>
            </span>
        )
    }

    /**
    * 绘制批量刷新装车员按钮-容器
    */
    drawContainerShiperBatchButton = () => {
        return (
            <span>
                <a onClick={() => this.onClickShiperRefreshModal("container")}>批量刷新装车员</a>
            </span>
        )
    }

    onClickShiperRefreshModal = (shipType) => {
        const { containerShipSelectedRowKeys, attachmenShipSelectedRowKeys } = this.state;

        if ("container" === shipType && (!containerShipSelectedRowKeys || containerShipSelectedRowKeys.length == 0)) {
            message.warning('请先选择要刷新的明细');
            return;
        }
        if ("attachment" === shipType && (!attachmenShipSelectedRowKeys || attachmenShipSelectedRowKeys.length == 0)) {
            message.warning('请先选择要刷新的装车员');
            return;
        }

        this.handleShiperRefreshVisible();
    }

    refreshShiper = (shiper) => {
        const { entity, shipType, containerShipSelectedRowKeys, attachmenShipSelectedRowKeys } = this.state;
        if ("container" === shipType && entity && entity.billItems) {
            entity.billItems.forEach(function (data) {
                if (containerShipSelectedRowKeys.includes(data.line))
                    data.shiper = shiper;
            });
        }

        if ("attachment" === shipType && entity && entity.attachmentItems) {
            entity.attachmentItems.forEach(function (data) {
                if (attachmenShipSelectedRowKeys.includes(data.line))
                    data.shiper = shiper;
            });
        }

        this.setState({
            entity: { ...entity },
            shiperModalVisible: !this.state.shiperModalVisible
        })
    }

    tabChange = (key) => {
        this.setState({
            shipType: key
        })
    }

    /**搜索*/
    onContainerShipSearch = (data) => {

        let fromOrgCodeLike = undefined;
        let storeCodeLike = undefined;
        let containerBarcodeLike = undefined;

        const { containerPageFilter } = this.state;
        containerPageFilter.page = 0;
        if (data) {
            fromOrgCodeLike = data.fromOrgCode;
            storeCodeLike = data.toOrgCode;
            containerBarcodeLike = data.containerBarcode;
        }
        containerPageFilter.fromOrgCodeLike = fromOrgCodeLike;
        containerPageFilter.storeCodeLike = storeCodeLike;
        containerPageFilter.containerBarcodeLike = containerBarcodeLike;

        this.setState({
            containerPageFilter: containerPageFilter
        })
        this.containerRefreshTable();
    }

    containerTableChange = (pagination, filtersArg, sorter) => {
        const { containerPageFilter } = this.state;
        containerPageFilter.page = pagination.current - 1;
        containerPageFilter.pageSize = pagination.pageSize;

        this.setState({
            containerPageFilter: containerPageFilter,
        })
        this.containerRefreshTable();
    }

    containerRefreshTable = () => {
        const { entity } = this.state;

        if (!entity || !entity.shipPlanBillNumber) {
            return;
        }

        if ("-" === entity.shipPlanBillNumber) {
            this.props.dispatch({
                type: 'shipbill/queryVirtualUnShipItem',
                payload: {
                    ...this.state.containerPageFilter,
                }
            });
        } else {
            this.props.dispatch({
                type: 'shipbill/pageQueryUnShipItem',
                payload: {
                    ...this.state.containerPageFilter, shipPlanBillNumber: entity.shipPlanBillNumber
                }
            });
        }
    };


    /**获取批量增加的集合*/
    getShipContainerItemList = (value) => {
        const { entity } = this.state;
        var newList = [];
        for (let i = 0; i < value.length; i++) {
            if (entity.billItems && entity.billItems.find(function (item) {
                return item.fromOrg && item.fromOrg.uuid === value[i].fromOrg.uuid && item.store && item.store.uuid === value[i].store.uuid
                    && item.binCode === value[i].binCode && item.containerBarcode === value[i].containerBarcode
            }) === undefined) {
                let temp = { ...value[i] };
                newList.push(temp);
            }
        }
        this.state.line = entity.billItems.length + 1;
        newList.map(item => {
            item.line = this.state.line;
            this.state.line++;
        });
        entity.billItems = [...entity.billItems, ...newList];
        this.setState({
            entity: { ...entity }
        })
    }


    /**搜索*/
    onAttachmentShipSearch = (data) => {
        const { shipPlanBillItems } = this.state;

        let resultSearch = [];
        if (data) {
            resultSearch = shipPlanBillItems.filter(item => {
                let equals = true;
                if (data.fromOrgCode)
                    equals = item.fromOrg.code.includes(data.fromOrgCode);
                if (equals && data.toOrgCode)
                    equals = item.toOrg.code.includes(data.toOrgCode);
                if (equals)
                    return item;
            })
        } else {
            resultSearch = [...shipPlanBillItems]
        }
        this.setState({
            unShipAttachmentList: [...resultSearch]
        })
    }

    /**获取批量增加的集合*/
    getShipAttachmentItemList = (value) => {
        const { entity } = this.state;
        var newList = [];
        for (let i = 0; i < value.length; i++) {
            let temp = { ...value[i] };
            newList.push(temp);
        }
        this.state.line = entity.attachmentItems.length + 1;
        newList.map(item => {
            item.store = item.toOrg;
            item.line = this.state.line;
            item.qtyStr = "0";
            this.state.line++;
        });
        entity.attachmentItems = [...entity.attachmentItems, ...newList];
        this.setState({
            entity: { ...entity }
        })
    }


    onBillItemFieldChange = (value, field, index) => {
        const { entity } = this.state;

        if (field === 'fromOrg') {
            entity.billItems[index - 1].fromOrg = JSON.parse(value);

            const stores = this.getStores(entity.billItems[index - 1]);
            if (stores && stores.length > 0)
                entity.billItems[index - 1].store = stores[0];

            this.refreshStatisticProfile(entity.billItems[index - 1]);
            if (entity.billItems[index - 1].reviewResultShip === false) {
                const containers = this.getContainers(entity.billItems[index - 1]);
                entity.billItems[index - 1].containerBarcode = containers[0];
                this.refreshStatisticProfile(entity.billItems[index - 1]);
            }

        } else if (field === 'store') {
            entity.billItems[index - 1].store = JSON.parse(value);

            this.refreshStatisticProfile(entity.billItems[index - 1]);
            if (entity.billItems[index - 1].reviewResultShip === false) {
                const containers = this.getContainers(entity.billItems[index - 1]);
                entity.billItems[index - 1].containerBarcode = containers[0];
                this.refreshStatisticProfile(entity.billItems[index - 1]);
            }
        } else if (field === 'containerBarcode') {
            entity.billItems[index - 1].containerBarcode = value;
            this.refreshStatisticProfile(entity.billItems[index - 1]);
        } else if (field === 'ship') {
            entity.billItems[index - 1].ship = value;
        } else if (field === 'shiper') {
            entity.billItems[index - 1].shiper = JSON.parse(value);
        }

        this.setState({
            entity: { ...entity }
        });
    }

    onFieldChange = (value, field, index) => {
        const { entity } = this.state;

        if (field === 'fromOrg') {
            entity.attachmentItems[index - 1].fromOrg = JSON.parse(value);

            const stores = this.getAttachmentStores(entity.attachmentItems[index - 1]);
            if (stores && stores.length > 0)
                entity.attachmentItems[index - 1].store = stores[0];
            this.onQueryIsReviewResultShip(entity.attachmentItems[index - 1].fromOrg.uuid);
        } else if (field === 'store') {
            entity.attachmentItems[index - 1].store = JSON.parse(value);
        } else if (field === 'attachment') {
            entity.attachmentItems[index - 1].attachment = JSON.parse(value);
        } else if (field === 'qtyStr') {
            entity.attachmentItems[index - 1].qtyStr = value;
        } else if (field === 'shiper') {
            entity.attachmentItems[index - 1].shiper = JSON.parse(value);
        }

        this.setState({
            entity: { ...entity }
        });
    }

    drawTable = () => {
        const { entity, showValue } = this.state;
      let stevedores = [];
      let drivers = [];
      if (entity.employees) {
        entity.employees.forEach(function (employee) {
          if (WorkType.DRIVER.name == employee.vehicleEmployeeType)
            drivers.push(employee.vehicleEmployee);
          else
            stevedores.push(employee.vehicleEmployee);
        });
      }
        let columns = [
            {
                title: shipBillLocale.fromOrg,
                key: 'fromOrg',
                dataIndex: 'fromOrg',
                width: itemColWidth.binCodeEditColWidth,
                render: (text, record) => {
                    if(entity.state === State.INPROGRESS.name){
                        return record.fromOrg?<span>{convertCodeName(record.fromOrg)}</span>:<Empty/>
                    }else if ("-" === entity.shipPlanBillNumber) {
                        return (
                            <FromOrgSelect
                                value={JSON.stringify(record.fromOrg)}
                                single
                                onChange={e => this.onBillItemFieldChange(e, 'fromOrg', record.line)}
                            />
                        );
                    } else {
                        return (
                            <Select
                                value={JSON.stringify(record.fromOrg)}
                                placeholder={placeholderLocale(shipBillLocale.fromOrg)}
                                onChange={e => this.onBillItemFieldChange(e, 'fromOrg', record.line)}>
                                {
                                    this.getFromOrgOptions()
                                }
                            </Select>
                        );
                    }
                }
            },
            {
                title: shipBillLocale.store,
                key: 'store',
                dataIndex: 'store',
                width: itemColWidth.binCodeEditColWidth,
                render: (text, record) => {
                    if(entity.state === State.INPROGRESS.name){
                        return record.store?<span>{convertCodeName(record.store)}</span>:<Empty/>
                    }else if ("-" === entity.shipPlanBillNumber) {
                        return (
                            <ToOrgSelect
                                value={JSON.stringify(record.store)}
                                fromOrgUuid={record.fromOrg ? record.fromOrg.uuid : null}
                                single
                                onChange={e => this.onBillItemFieldChange(e, 'store', record.line)}
                            />
                        );
                    } else {

                        return (
                            <Select
                                value={JSON.stringify(record.store)}
                                placeholder={placeholderLocale(shipBillLocale.store)}
                                onChange={e => this.onBillItemFieldChange(e, 'store', record.line)}>
                                {
                                    this.getStoreOptions(record)
                                }
                            </Select>
                        );
                    }
                }
            },
            {
                title: commonLocale.inContainerBarcodeLocale,
                key: 'containerBarcode',
                dataIndex: 'containerBarcode',
                width: itemColWidth.binCodeEditColWidth,
                render: (text, record) => {
                    if(entity.state === State.INPROGRESS.name){
                        return record.containerBarcode?<span>{record.containerBarcode}</span>:<Empty/>
                    }else if (record.reviewResultShip || (record.uuid && !record.containerBarcode)) {
                        return (
                            <span>{<Empty />}</span>
                        );
                    } else {
                        return (
                            <Select
                                value={record.containerBarcode}
                                placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
                                onChange={e => this.onBillItemFieldChange(e, 'containerBarcode', record.line)}>
                                {
                                    this.getContainerOptions(record)
                                }
                            </Select>
                        );
                    }
                }
            },
            {
                title: commonLocale.bincodeLocale,
                key: 'binCode',
                dataIndex: 'binCode',
                width: colWidth.codeColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.binCode ? record.binCode : <Empty />}</span>
                    );
                }
            },
            {
                title: shipBillLocale.dockGroupStr,
                key: 'dockGroupStr',
                width: colWidth.codeNameColWidth,
                render: record => {
                    return (
                        <span>{record.dockGroupStr ? record.dockGroupStr : <Empty />}</span>
                    );
                }
            },
            {
                title: shipBillLocale.ship,
                key: 'ship',
                dataIndex: 'ship',
                width: itemColWidth.binCodeEditColWidth,
                render: (text, record) => {
                    if(entity.state === State.INPROGRESS.name){
                        return record.ship!=undefined?<span>{record.ship==true?'是':'否'}</span>:<Empty/>
                    }
                    let selectDisabled = false;
                    if ("-" === entity.shipPlanBillNumber || record.reviewResultShip || (record.uuid && !record.containerBarcode)
                        || ("-" === record.containerBarcode)) {
                        record.ship = false;
                        selectDisabled = true;
                    }

                    return (
                        <Select
                            value={record.ship}
                            disabled={selectDisabled}
                            placeholder={placeholderLocale(shipBillLocale.ship)}
                            onChange={e => this.onBillItemFieldChange(e, 'ship', record.line)}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    );
                }
            },
            {
                title: shipBillLocale.shiper,
                key: 'shiper',
                dataIndex: 'shiper',
                width: itemColWidth.articleColWidth,
                render: (text, record) => {
                    // record.shiper = stevedores && stevedores.length > 0 ? stevedores[0] : undefined
                    if(entity.state === State.INPROGRESS.name || showValue){
                        return record.shiper ? <span>{convertCodeName(record.shiper)}</span> : <Empty/>
                    }
                    return (
                        <UserSelect
                            value={record.shiper ? JSON.stringify(record.shiper) : undefined}
                            autoFocus single={true}
                            onChange={e => this.onBillItemFieldChange(e, 'shiper', record.line)}
                        />
                    );
                }
            },
            {
                title: commonLocale.inAmountLocale,
                key: 'amount',
                width: colWidth.enumColWidth,
                render: record => {
                    return (
                        <span>{record.amount ? record.amount : <Empty />}</span>
                    );
                }
            },
            {
                title: commonLocale.inTmsWeightLocale,
                key: 'weight',
                width: colWidth.enumColWidth,
                render: record => {
                    return (
                        <span>{record.weight !== undefined ? Number(record.weight / 1000).toFixed(4) : <Empty />}</span>
                    );
                }
            },
            {
                title: commonLocale.inVolumeLocale,
                key: 'volume',
                width: colWidth.enumColWidth,
                render: record => {
                    return (
                        <span>{ record.volume !== undefined ? record.volume : <Empty />}</span>
                    );
                }
            }
        ]

        let attachmentItemsColumns = [
            {
                title: shipBillLocale.fromOrg,
                key: 'fromOrg',
                dataIndex: 'fromOrg',
                width: itemColWidth.binCodeEditColWidth,
                render: (text, record) => {
                    if ("-" === entity.shipPlanBillNumber) {
                        return (
                            <FromOrgSelect
                                value={JSON.stringify(record.fromOrg)}
                                single
                                onChange={e => this.onFieldChange(e, 'fromOrg', record.line)}
                            />
                        );
                    } else {
                        return (
                            <Select
                                value={JSON.stringify(record.fromOrg)}
                                placeholder={placeholderLocale(shipBillLocale.fromOrg)}
                                onChange={e => this.onFieldChange(e, 'fromOrg', record.line)}>
                                {
                                    this.getAttachmentFromOrgOptions()
                                }
                            </Select>
                        );
                    }
                }
            },
            {
                title: shipBillLocale.store,
                key: 'store',
                dataIndex: 'store',
                width: itemColWidth.binCodeEditColWidth,
                render: (text, record) => {
                    if ("-" === entity.shipPlanBillNumber) {
                        return (
                            <ToOrgSelect
                                value={JSON.stringify(record.store)}
                                fromOrgUuid={record.fromOrg ? record.fromOrg.uuid : null}
                                single
                                onChange={e => this.onFieldChange(e, 'store', record.line)}
                            />
                        );
                    } else {
                        return (
                            <Select
                                value={JSON.stringify(record.store)}
                                placeholder={placeholderLocale(shipBillLocale.store)}
                                onChange={e => this.onFieldChange(e, 'store', record.line)}>
                                {
                                    this.getAttachmentStoreOptions(record)
                                }
                            </Select>
                        );
                    }
                }
            },
            {
                title: shipBillLocale.attachment,
                key: 'attachment',
                dataIndex: 'attachment',
                width: itemColWidth.binCodeEditColWidth,
                render: (text, record) => {
                    let value = null;
                    if (record.attachment) {
                        value = JSON.stringify(record.attachment);
                    }
                    return (
                        <AttachmentSelect
                            value={value?value:undefined}
                            single
                            dcUuid={record.fromOrg ? record.fromOrg.uuid : null}
                            review={this.isReview(record)}
                            onChange={e => this.onFieldChange(e, 'attachment', record.line)}
                            placeholder={placeholderLocale(shipBillLocale.attachment)}
                        />
                    );
                }
            },
            {
                title: commonLocale.caseQtyStrLocale,
                key: 'qtyStr',
                width: itemColWidth.qtyStrEditColWidth,
                render: (record) => {
                    return (
                        <InputNumber
                            precision={0}
                            min={0}
                            value={record.qtyStr ? record.qtyStr : 0}
                            onChange={
                                e => this.onFieldChange(e, 'qtyStr', record.line)
                            }
                        />
                    );
                }
            },
            {
                title: shipBillLocale.shiper,
                key: 'shiper',
                dataIndex: 'shiper',
                width: itemColWidth.articleColWidth,
                render: (text, record) => {
                  record.shiper = stevedores && stevedores.length > 0 ? stevedores[0] : undefined;
                  if(entity.state === State.INPROGRESS.name || showValue){
                    return record.shiper ? <span>{convertCodeName(record.shiper)}</span> : <Empty/>
                  }
                    return (
                        <UserSelect
                            value={record.shiper ? JSON.stringify(record.shiper) : undefined}
                            autoFocus
                            single={true}
                            onChange={e => this.onFieldChange(e, 'shiper', record.line)}
                            placeholder={placeholderLocale(shipBillLocale.shiper)}

                        />
                    );
                }
            }
        ]

        let containerShipBatchQueryResultColumns = [
            {
                title: shipBillLocale.fromOrg,
                key: 'fromOrg',
                dataIndex: 'fromOrg',
                width: itemColWidth.articleColWidth,
                render: (text, record) => <EllipsisCol colValue={convertCodeName(record.fromOrg)} />

            },
            {
                title: shipBillLocale.store,
                key: 'store',
                dataIndex: 'store',
                width: itemColWidth.articleColWidth,
                render: (text, record) => <EllipsisCol colValue={convertCodeName(record.store)} />
            },
            {
                title: shipBillLocale.dockGroupStr,
                key: 'dockGroupStr',
                width: colWidth.codeNameColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.dockGroupStr ? record.dockGroupStr : <Empty />}</span>
                    );
                }
            },
            {
                title: commonLocale.inContainerBarcodeLocale,
                key: 'containerBarcode',
                dataIndex: 'containerBarcode',
                width: itemColWidth.qpcStrColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.containerBarcode ? record.containerBarcode : <Empty />}</span>
                    );
                }
            },
            {
                title: commonLocale.bincodeLocale,
                key: 'binCode',
                width: colWidth.codeColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.binCode ? record.binCode : <Empty />}</span>
                    );
                }
            },
            {
                title: shipBillLocale.ship,
                key: 'ship',
                dataIndex: 'ship',
                width: itemColWidth.priceColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.ship ? '是' : '否'}</span>
                    );
                }
            },
            {
                title: commonLocale.inTmsWeightLocale,
                key: 'weight',
                width: colWidth.enumColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.weight ? Number(record.weight / 1000).toFixed(4) : <Empty />}</span>
                    );
                }
            },
            {
                title: commonLocale.inVolumeLocale,
                key: 'volume',
                width: colWidth.enumColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.volume ? record.volume.toFixed(4) : <Empty />}</span>
                    );
                }
            },
            {
                title: commonLocale.inAmountLocale,
                key: 'amount',
                width: colWidth.enumColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.amount ? record.amount.toFixed(4) : <Empty />}</span>
                    );
                }
            }
        ]

        let attachmentShipBatchQueryResultColumns = [
            {
                title: shipBillLocale.fromOrg,
                key: 'fromOrg',
                dataIndex: 'fromOrg',
                width: itemColWidth.articleColWidth,
                render: (text, record) => <EllipsisCol colValue={convertCodeName(record.fromOrg)} />

            },
            {
                title: shipBillLocale.store,
                key: 'toOrg',
                dataIndex: 'toOrg',
                width: itemColWidth.articleColWidth,
                render: (text, record) => <EllipsisCol colValue={convertCodeName(record.toOrg)} />
            }
        ]

        let articleDtlColumns = [
        {
          title: commonLocale.articleLocale,
          key: 'article',
          width: itemColWidth.articleColWidth,
          render: (text, record) => <EllipsisCol colValue={convertArticleDocField(record.article)} />

        },
        {
          title: commonLocale.inQpcAndMunitLocale,
          width: itemColWidth.articleColWidth + 100,
          render: (text, record) => (record.qpcStr + '/' + (record.article ? record.article.munit : '-'))
        },
          {
            title: commonLocale.inOwnerLocale,
            dataIndex: 'owner',
            width: itemColWidth.articleColWidth,
            render: (text, record) => <EllipsisCol colValue={convertCodeName(record.owner)} />
          },
          {
            title: commonLocale.inVendorLocale,
            dataIndex: 'vendor',
            width: itemColWidth.articleColWidth,
            render: (text, record) => <EllipsisCol colValue={convertCodeName(record.vendor)} />
          },
          {
            title: commonLocale.inQtyStrLocale,
            key: 'qtyStr',
            dataIndex: 'qtyStr',
            width: itemColWidth.articleColWidth
          },
          {
            title: commonLocale.inQtyLocale,
            key: 'qty',
            dataIndex: 'qty',
            width: itemColWidth.articleColWidth
          },
          {
            title: commonLocale.inProductDateLocale,
            key: 'productionDate',
            dataIndex: 'productionDate',
            width: itemColWidth.articleColWidth,
            render: (val) => {
              return moment(val).format('YYYY-MM-DD');
            }
          },
          {
            title: commonLocale.inValidDateLocale,
            key: 'validDate',
            dataIndex: 'validDate',
            width: itemColWidth.articleColWidth,
            render: (val) => {
              return moment(val).format('YYYY-MM-DD');
            }
          },
          {
            title: commonLocale.bincodeLocale,
            key: 'binCode',
            dataIndex: 'binCode',
            width: itemColWidth.articleColWidth,
            render: text => text ? text : <Empty />
          },
          {
            title: commonLocale.inContainerBarcodeLocale,
            key: 'containerBarcode',
            dataIndex: 'containerBarcode',
            width: itemColWidth.articleColWidth,
            render: text => text ? text : <Empty />
          },
          {
            title: commonLocale.inProductionBatchLocale,
            key: 'productionBatch',
            dataIndex: 'productionBatch',
            width: itemColWidth.articleColWidth,
            render: text => text ? text : <Empty />
          },
          {
            title: commonLocale.inPriceLocale,
            key: 'price',
            dataIndex: 'price',
            width: itemColWidth.articleColWidth,
            render: text => text ? text : 0
          }
      ]

        return (
            <Tabs header="明细" defaultActiveKey="container" onChange={this.tabChange}>
                <TabPane key="container" tab={shipBillLocale.storeItems}>
                    <ItemEditTable
                        columns={columns}
                        notNote={(entity.state == State.INPROGRESS.name)?true:false}
                        data={this.state.entity.billItems}
                        rowSelection={this.containerShipRowSelection}
                        drawTotalInfo={this.drawTotalInfo}
                        drawBatchButton={entity.state == State.INPROGRESS.name?null:this.drawContainerShipBatchButton}
                        drawOther={entity.state == State.INPROGRESS.name?null:this.drawContainerShiperBatchButton}
                        noAddandDelete = {(entity.state == State.INPROGRESS.name) ? true : false}
                        handleCheckModal = {this.handleAtricleDtlVisible}
                    />
                    <PanelItemBatchAdd
                        searchPanel={<ShipBillSearchFormItemBatchAdd refresh={this.onContainerShipSearch} fieldsValue={''} shipType="container" />}
                        visible={this.state.containerShipBatchAddVisible}
                        columns={containerShipBatchQueryResultColumns}
                        data={this.state.unShipContainerData}
                        handlebatchAddVisible={this.handleContainerShipBatchAddVisible}
                        getSeletedItems={this.getShipContainerItemList}
                        onChange={this.containerTableChange}
                        width={'90%'}
                    />
                    <ShiperSelectModal
                        visible={this.state.shiperModalVisible}
                        handleOk={this.refreshShiper}
                        handleCancel={this.handleShiperRefreshVisible}
                    />
                    <AtricleDtlModal
                      visible={this.state.atricleModalVisible}
                      columns={articleDtlColumns}
                      data={this.state.detailAtricleData}
                      handleAtricleDtlVisible={this.handleAtricleDtlVisible}
                      width={'90%'}
                    />
                </TabPane>
                <TabPane key="attachment" tab={shipBillLocale.attachmentItems}>
                    <ItemEditTable
                        columns={attachmentItemsColumns}
                        data={this.state.entity.attachmentItems}
                        rowSelection={this.attachmenShipRowSelection}
                        drawBatchButton={this.drawAttachmentShipBatchButton}
                        drawOther={this.drawAttachmentShiperBatchButton}
                    />
                    <PanelItemBatchAdd
                        searchPanel={<ShipBillSearchFormItemBatchAdd refresh={this.onAttachmentShipSearch} fieldsValue={''} shipType="attachment" />}
                        visible={this.state.attachmentShipBatchAddVisible}
                        columns={attachmentShipBatchQueryResultColumns}
                        data={{ list: this.state.unShipAttachmentList }}
                        handlebatchAddVisible={this.handleAttachmentShipBatchAddVisible}
                        getSeletedItems={this.getShipAttachmentItemList}
                        width={'90%'}
                    />
                    <ShiperSelectModal
                        visible={this.state.shiperModalVisible}
                        handleOk={this.refreshShiper}
                        handleCancel={this.handleShiperRefreshVisible}
                    />
                </TabPane>
            </Tabs>
        )
    }
}
