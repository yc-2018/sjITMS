import { connect } from 'dva';
import { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, Tabs, message, Table } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { containerLocale, containerStockLocale } from './ContainerLocale';
import { getStateCaption } from '@/utils/ContainerState';
import { toQtyStr } from '@/utils/QpcStrUtil';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName, convertArticleDocField, composeQpcStrAndMunit, convertDate } from '@/utils/utils';
import { getUseTypeCaption } from '@/utils/ContainerUseType';
import { BinUsage, getUsageCaption } from '@/utils/BinUsage';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { routerRedux } from 'dva/router';

const TabPane = Tabs.TabPane;

@connect(({ container, loading }) => ({
    container,
    loading: loading.models.container,
}))
export default class ContainerViewPage extends ViewPage {

    constructor(props) {
        super(props);

        this.state = {
            entity: {},
            title: '',
            entityUuid: '',
            entityState: '',
            barcode: props.barcode
        }
    }

    componentDidMount() {
        this.refresh(this.state.barcode);
    }

    componentWillReceiveProps(nextProps) {
        const container = nextProps.container.entity;
        if (container) {
          this.setState({
            entity: container,
            title: '[' + container.barcode + ']',
            entityUuid: container.uuid,
            stateCaption: getStateCaption(container.state),
          });
        }

        const nextEntityCode = nextProps.container.entityUuid;
        let prvBarcode = '';
        if(this.props.container && this.props.container.entity && this.props.container.entity.barcode) {
          prvBarcode = this.props.container.entity.barcode
        }

        if(nextEntityCode && prvBarcode && nextEntityCode !== prvBarcode){
          this.setState({
            barCode :nextEntityCode
          })
          this.refresh(nextEntityCode)
        }

    }

    refresh(nextEntityCode) {
      if(!nextEntityCode){
        nextEntityCode = this.state.entity.barcode
      }
      if(!nextEntityCode) {
        this.props.dispatch({
          type: 'container/get',
          payload: {
            barcode: this.props.container.entityUuid
          }
        });
      } else{
        this.props.dispatch({
          type: 'container/get',
          payload: {
            barcode: nextEntityCode
          },
          callback: (response) => {
            if (!response || !response.data) {
              message.error("容器不存在")
              this.onBack()
            } else {
              this.tabsChangeCallback("containerart");
            }
          }
        });
      }
    }

    getContainer = (barcode) => {
        this.props.dispatch({
            type: 'container/get',
            payload: {
                barcode: barcode
            }
        });
    }

    onViewContainerType = (containerTypeUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/facility/containerType',
            payload: {
                showPage: 'view',
                entityUuid: containerTypeUuid
            }
        }))
    }

    onBack = () => {
        this.props.dispatch({
            type: 'container/showPage',
            payload: {
                showPage: 'query',
              fromView: true
            }
        });
    }

    drawActionButtion = () => {
        return (
            <Fragment>
                <Button onClick={this.onBack}>
                    {commonLocale.backLocale}
                </Button>
              <PrintButton
                reportParams={[{ billNumber: this.state.entity ? `${this.state.entity.barcode}` : null }]}
                moduleId={'CONTAINER'} />
            </Fragment>
        );
    }

    tabsChangeCallback = (activeKey) => {
        if (activeKey != "containerart")
            return;

        const { entity } = this.state;
        if (!entity.barcode)
            return;
        this.props.dispatch({
            type: 'container/getContainerArts',
            payload: {
                barcode: entity.barcode
            }
        });
    }

    refreshColumns = (columns) => {
        columns.forEach(e => {
            if (e.width) {
                e.onCell = () => {
                    return {
                        style: {
                            maxWidth: e.width,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            cursor: 'pointer'
                        }
                    }
                }
            }
        });
    }

    drawTabPanes = () => {
        let tabPanes = [
            this.drawInfoTab(),
            this.drawStockTab()
        ];

        return tabPanes;
    }

    drawInfoTab = () => {
        const { entity } = this.state;

        let basicItems = [{
            label: containerLocale.barcodeLocale,
            value: entity ? entity.barcode : ''
        }, {
            label: containerLocale.containerType,
            value: <a onClick={this.onViewContainerType.bind(true, entity && entity.type ? entity.type.uuid : undefined)}
                disabled={!entity.type}>{entity && entity.type ? convertCodeName(entity.type) : ''}</a>
        }, {
            label: containerLocale.userLocale,
            value: entity && entity.use && entity.useType ? getUseTypeCaption(entity.useType) + ' ' + convertCodeName(entity.use) : ''
        }, {
            label: containerLocale.parentBarcodeLocale,
            value: entity ? entity.parentContainer : ''
        }, {
            label: containerLocale.positionLocale,
            value: entity && entity.positionBinUsage && entity.position ? '[' + entity.position + ']' + getUsageCaption(entity.positionBinUsage) : ''
        }, {
            label: containerLocale.toPosition,
            value: entity && entity.toPosition && entity.toPositionBinUsage ? '[' + entity.toPosition + ']' + getUsageCaption(entity.toPositionBinUsage) : ''
        }];

        return (
            <TabPane key="basicInfo" tab={containerLocale.title}>
                <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />

                <ViewPanel children={this.buildChildContainerPanel()} items={[]} title={containerLocale.childBarcodes} />
            </TabPane>
        );
    }

    buildChildContainerPanel() {
        const { entity } = this.state;
        if (!entity)
            return;

        const list = entity ? entity.childContainer : {};

        let childColumns = [
            {
                title: containerLocale.barcodeLocale,
                dataIndex: 'barcode',
                key: "barcode",
                width: colWidth.codeColWidth,
                render: (text, record) => <a onClick={this.getContainer.bind(true, text)}>{text}</a>
            },
            {
                title: containerLocale.containerType,
                key: "containerType",
                width: colWidth.codeNameColWidth,
                render: (text, record) => <a onClick={this.onViewContainerType.bind(true, record.type ? record.type.uuid : undefined)}
                    disabled={!record.type}>{<EllipsisCol colValue={convertCodeName(record.type)} />}</a>
            },
            {
                title: commonLocale.stateLocale,
                key: "state",
                width: colWidth.enumColWidth,
                render: record => getStateCaption(record.state)
            },
        ];

        return (
            <Table dataSource={list} columns={childColumns} />
        );
    }

    drawStockTab() {
        const { containerarts } = this.props.container;
        const list = containerarts ? containerarts : [];

        let containerartColumns = [
            {
                title: commonLocale.articleLocale,
                key: 'article',
                width: itemColWidth.articleColWidth,
                render: (record) => <a onClick={() => this.onViewArticle(record.article.articleUuid)} ><EllipsisCol colValue={convertArticleDocField(record.article)} /> </a>
            },
            {
                title: containerStockLocale.qpcStrAndMunit,
                key: 'qpcStrAndMunit',
                width: itemColWidth.qpcStrColWidth + 20,
                render: record => composeQpcStrAndMunit(record)
            },
            {
                title: commonLocale.vendorLocale,
                key: 'vendor',
                width: colWidth.codeNameColWidth,
                render: record => <EllipsisCol colValue={convertCodeName(record.vendor)} />
            },
            {
                title: commonLocale.productionDateLocale,
                key: 'productionDate',
                width: colWidth.dateColWidth,
                render: record => convertDate(record.productionDate)
            },
            {
                title: commonLocale.validDateLocale,
                key: 'validDate',
                width: colWidth.dateColWidth,
                render: record => convertDate(record.validDate)
            },
            {
                title: commonLocale.productionBatchLocale,
                dataIndex: 'productionBatch',
                width: itemColWidth.numberEditColWidth,
            },
            {
                title: commonLocale.stockBatchLocale,
                key: 'stockBatch',
                width: itemColWidth.numberEditColWidth,
                render: record => <EllipsisCol colValue={record.stockBatch} />
            },
            {
                title: commonLocale.caseQtyStrLocale,
                key: 'qtyStr',
                width: itemColWidth.qtyStrColWidth,
                render: record => toQtyStr(record.qty, record.qpcStr)
            },
            {
                title: commonLocale.qtyLocale,
                dataIndex: 'qty',
                width: itemColWidth.numberEditColWidth,
            },
            {
                title: commonLocale.ownerLocale,
                key: 'owner',
                width: colWidth.codeNameColWidth,
                render: record => <EllipsisCol colValue={convertCodeName(record.owner)} />
            }
        ];

        this.refreshColumns(containerartColumns);
        return (
            <TabPane key="containerart" tab={containerLocale.stockTitle}>
                <Table dataSource={list} columns={containerartColumns} scroll={{ x: 1800 }} />
            </TabPane>
        );
    }


}
