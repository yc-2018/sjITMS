import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber, Switch, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from './SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { ShipPlanDispatchLocale, ShipPlanType, ShipPlanDispatchPerm, ShipPlanPickState } from './ShipPlanDispatchLocale';
import ShipPlanDispatchSearchForm from './ShipPlanDispatchSearchForm';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { add, accAdd, accMul } from '@/utils/QpcStrUtil';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import { routerRedux } from 'dva/router';
/**
 * 组件装载时不加载数据，由用户操作触发。避免panel界面加载时过多的查询操作
 */
export default class ShipPlanDispatchSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: ShipPlanDispatchLocale.shipPlanTaskPanel,
            data: {
                list: [],
                pagination: {}
            },
            loading: true,
            pageFilter: {
                companyUuid: loginCompany().uuid,
                serialArchUuid: '',
                serialArchLineUuid: '',
                fromOrgUuids: [],
                toOrgUuids: [],
            },
            currentSerialArchUcn: undefined,
            key: 'shipPlanDispatch.search.table'};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.deliveryData) {
            nextProps.deliveryData.list.forEach(element => {
                element.uuid = element.fromOrg.uuid + element.toOrg.uuid
                this.refreshSerialArchLine(element);
            });
            this.setState({
                data: nextProps.deliveryData,
                entity: {},
                loading: nextProps.loading,
                pageFilter: nextProps.pageFilter
            });
        }
    }

    refreshSerialArchLine = (entity) => {
        if (!entity || !entity.serialArchLineStr || entity.serialArchLineUcn)
            return;

        var serialArchLineList = entity.serialArchLineStr.split(",");
        var newSerialArchLineStr = '';
        serialArchLineList.forEach(function (item, index) {
            var serialArchLine = item.split(";");
            var serialArchLineUcn = {
                "uuid": serialArchLine[0],
                "code": serialArchLine[1],
                "name": serialArchLine[2]
            }

            entity.serialArchLineUcn = serialArchLineUcn;
            newSerialArchLineStr = newSerialArchLineStr + '[' + serialArchLineUcn.code + ']' + serialArchLineUcn.name;
            if (index < serialArchLineList.length - 1)
                newSerialArchLineStr = newSerialArchLineStr + ",";
        });
        entity.serialArchLineStr = newSerialArchLineStr;
    }

    refreshTable = (filter) => {
        const { pageFilter } = this.state;

        let queryFilter = { ...pageFilter };
        if (filter) {
            queryFilter = { ...pageFilter, ...filter };
        }
        let toOrgUuids = [];
        let fromOrgUuids = [];
        if (queryFilter) {
            if (Array.isArray(queryFilter.fromOrgUuids)) {
                queryFilter.fromOrgUuids.forEach(fromOrg => {
                    fromOrgUuids.push(JSON.parse(fromOrg).uuid);
                });
            }
            queryFilter.fromOrgUuids = fromOrgUuids;
            if (Array.isArray(queryFilter.toOrgUuids)) {
                queryFilter.toOrgUuids.forEach(toOrg => {
                    toOrgUuids.push(JSON.parse(toOrg).uuid);
                });
            }
            queryFilter.toOrgUuids = toOrgUuids;
        }

        if (!filter || !filter.changePage) {
            this.setState({
                selectedRows: []
            });
        }

        queryFilter.companyUuid = loginCompany().uuid;
        this.props.queryDelivery(queryFilter);
        this.setState({
            pageFilter: { ...queryFilter }
        })
    };

    onGenerateShipPlanBill = (entity) => {
        const { selectedRows, currentSerialArchUcn } = this.state;
        if (!currentSerialArchUcn) {
            message.warning("排车单中门店所属线路体系必须相同，请先根据线路体系筛选！");
            return;
        }

        if (!selectedRows || selectedRows.length == 0) {
            message.warning("请选择配送任务");
            return;
        }

        selectedRows.forEach(function (row) {
            row.serialArchUcn = currentSerialArchUcn;
        });
        this.props.onGenerateShipPlanBill(selectedRows);
    }

    onGenerateShipBill = (entity) => {
        const { selectedRows } = this.state;
        if (!selectedRows || selectedRows.length == 0) {
            message.warning("请选择配送任务");
            return;
        }
        this.props.onGenerateShipBill(selectedRows);
    }

    onViewDC = (dcUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/basic/dc',
            payload: {
                showPage: 'view',
                entityUuid: dcUuid
            }
        }));
    }

    onViewStore = (storeUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/basic/store',
            payload: {
                showPage: 'view',
                entityUuid: storeUuid
            }
        }));
    }


    onSearch = (data) => {
        const { pageFilter } = this.state;
        const queryFilter = { ...pageFilter };
        let toOrgUuids = [];
        let fromOrgUuids = [];
        let serialArchUcn = undefined;

        if (queryFilter) {
            if (Array.isArray(queryFilter.fromOrgUuids)) {
                queryFilter.fromOrgUuids.forEach(fromOrg => {
                    fromOrgUuids.push(JSON.parse(fromOrg).uuid);
                });
            }
            queryFilter.fromOrgUuids = fromOrgUuids;
            if (Array.isArray(queryFilter.toOrgUuids)) {
                queryFilter.toOrgUuids.forEach(toOrg => {
                    toOrgUuids.push(JSON.parse(toOrg).uuid);
                });
            }
            queryFilter.toOrgUuids = toOrgUuids;
        }
        if (data) {
            if (Array.isArray(data.fromOrgUuids)) {
                data.fromOrgUuids.forEach(fromOrg => {
                    fromOrgUuids.push(JSON.parse(fromOrg).uuid);
                });
            }
            if (Array.isArray(data.toOrgUuids)) {
                data.toOrgUuids.forEach(toOrg => {
                    toOrgUuids.push(JSON.parse(toOrg).uuid);
                });
            }
            queryFilter.toOrgUuids = toOrgUuids;
            queryFilter.fromOrgUuids = fromOrgUuids;
            queryFilter.serialArchLineUuid = data && data.serialArchLineUuid ? JSON.parse(data.serialArchLineUuid).uuid : '';
            queryFilter.logisticMode = data && data.logisticMode ? data.logisticMode : '';

            serialArchUcn = data && data.serialArchUuid ? JSON.parse(data.serialArchUuid) : undefined;
            queryFilter.serialArchUuid = serialArchUcn ? serialArchUcn.uuid : '';
        }
        queryFilter.companyUuid = loginCompany().uuid;
        this.props.queryDelivery(queryFilter);
        this.setState({
            pageFilter: { ...queryFilter, ...data },
            currentSerialArchUcn: serialArchUcn
        })
    }

    drawActionButton = () => {
        return (
            <Fragment>
                <Button type="primary" onClick={() => this.onGenerateShipPlanBill()} disabled={!ShipPlanDispatchPerm.CREATE_SHIP_PLAN_BILL}>
                    {ShipPlanDispatchLocale.generateShipPlanBill}
                </Button>
                <Button type="primary" onClick={() => this.onGenerateShipBill()} disabled={!ShipPlanDispatchPerm.CREATE_SHIP_BILL}>
                    {ShipPlanDispatchLocale.generateShipBill}
                </Button>
            </Fragment>
        );
    }

    drawSearchPanel = () => {
        const { pageFilter } = this.state;
        return <ShipPlanDispatchSearchForm pageFilter={pageFilter}
            refresh={this.onSearch} />;
    }


    onViewTaskItems = (record) => {
        this.props.dispatch({
            type: 'shipPlanDispatch/showPage',
            payload: {
                showPage: 'deliveryTaskView',
                deliveryTaskEntity: record
            }
        });
    }

    /**
* 绘制总数量
*/
    drawToolbar = () => {
        const { selectedRows } = this.state;

        var allVolume = 0;
        var allWeight = 0;
        var allAmount = 0;
        if (selectedRows) {
            selectedRows.map(row => {
                var item = row.staticProfile;
                if (!item.qty) {
                    item.qty = 0;
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

                allAmount = accAdd(allAmount, item.amount);
                allWeight = accAdd(allWeight, item.weight);
                allVolume = accAdd(allVolume, item.volume);
            });
        }

        // return (
        //     <span style={{ marginLeft: '10px' }}>
        //         {commonLocale.inAllAmountLocale + ':' + allAmount.toFixed(4)} |
        // {commonLocale.inTmsAllWeightLocale + ':' + Number(allWeight / 1000).toFixed(4)} |
        // {commonLocale.inAllVolumeLocale + ':' + allVolume.toFixed(4)}
        //     </span>
        // );

        return (<ToolbarPanel>
            <div style={{ float: "left", marginLeft: '10px', marginTop: '20px' }}>
                {commonLocale.inAllAmountLocale + ':' + allAmount.toFixed(4)} |
        {commonLocale.inTmsAllWeightLocale + ':' + Number(allWeight / 1000).toFixed(4)} |
        {commonLocale.inAllVolumeLocale + ':' + allVolume.toFixed(4)}
            </div>

            &nbsp;
        </ToolbarPanel>);
    }

    columns = [
        {
            title: ShipPlanDispatchLocale.sourceOrg,
            dataIndex: 'fromOrg',
            width: colWidth.codeNameColWidth,
            render: (text, record) => loginOrg().type === 'DC' ? <EllipsisCol colValue={convertCodeName(record.fromOrg)} />
                : <a onClick={this.onViewDC.bind(true, record.fromOrg ? record.fromOrg.uuid : undefined)}>
                    {<EllipsisCol colValue={convertCodeName(record.fromOrg)} />}</a>
        }, {
            title: ShipPlanDispatchLocale.targetOrg,
            dataIndex: 'toOrg',
            width: colWidth.codeNameColWidth,
            render: (text, record) => <a onClick={this.onViewStore.bind(true, record.toOrg ? record.toOrg.uuid : undefined)}>
                {<EllipsisCol colValue={convertCodeName(record.toOrg)} />}</a>
        },
        {
            title: ShipPlanDispatchLocale.taskType,
            dataIndex: 'type',
            width: itemColWidth.priceColWidth,
            render: (text, record) => ShipPlanType[text] ? ShipPlanType[text].caption : text
        },
        {
            title: ShipPlanDispatchLocale.serialArch,
            dataIndex: 'serialArchStr',
            width: colWidth.codeNameColWidth,
            render: (text, record) => <EllipsisCol colValue={text} />
        },
        {
            title: ShipPlanDispatchLocale.serialArchLine,
            dataIndex: 'serialArchLineStr',
            width: colWidth.codeNameColWidth,
            render: (text, record) => <EllipsisCol colValue={text} />
        },
        {
            title: ShipPlanDispatchLocale.dockGroup,
            dataIndex: 'dockerGroupStr',
            width: colWidth.codeNameColWidth,
            render: (text, record) => <EllipsisCol colValue={text} />
        },
        {
            title: ShipPlanDispatchLocale.businessInfo,
            dataIndex: 'logisticType',
            width: itemColWidth.priceColWidth,
            render: (text, record) => <EllipsisCol colValue={text} />
        },
        {
            title: ShipPlanDispatchLocale.pickRate,
            dataIndex: 'pickState',
            width: colWidth.codeNameColWidth,
            render: (text, record) => {
                return <EllipsisCol colValue={(record.pickState ? ShipPlanPickState[record.pickState].caption : '') + '[' + record.progressRate + ']'} />
            }
        },
        {
            title: ShipPlanDispatchLocale.amount,
            dataIndex: 'staticProfile.amount',
            width: itemColWidth.priceColWidth,
            render: (text, record) => <EllipsisCol colValue={text} />
        },
        {
            title: ShipPlanDispatchLocale.weight,
            dataIndex: 'staticProfile.weight',
            width: itemColWidth.priceColWidth,
            render: (text, record) => <EllipsisCol colValue={(Number(text) / 1000).toFixed(4)} />
        },
        {
            title: ShipPlanDispatchLocale.volume,
            dataIndex: 'staticProfile.volume',
            width: itemColWidth.priceColWidth,
            render: (text, record) => <EllipsisCol colValue={text} />
        },
        {
            title: commonLocale.stateLocale,
            dataIndex: 'shipState',
            width: itemColWidth.priceColWidth
        },
        {
            title: commonLocale.operateLocale,
            width: itemColWidth.operateColWidth,
            render: record => (
                <Fragment>
                    <a onClick={() => this.onViewTaskItems(record)}>
                        {"查看任务"}
                    </a>
                </Fragment>
            ),
        },

    ];
}