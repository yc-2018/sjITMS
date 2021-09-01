import { Table, Button, message, Input, InputNumber, Icon, Popconfirm, Tabs, Modal, Form } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { element } from 'prop-types';
import { SerialArchLocale, SerialArchPerm } from './SerialArchLocale';
import SerialArchLineAddStore from './SerialArchLineAddStore';
import Highlighter from 'react-highlight-words';
import OperateInfoTable from './OperateInfoTable';
import { SERVICE_CAPTION } from '@/utils/constants';
import { routerRedux } from 'dva/router';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import StandardTable from '@/components/StandardTable';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';

const FormItem = Form.Item;

let dragingIndex = -1;
const TabPane = Tabs.TabPane;

class BodyRow extends React.Component {
    render() {
        const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
        const style = { ...restProps.style, cursor: 'move' };

        let className = restProps.className;
        if (isOver) {
            if (restProps.index > dragingIndex) {
                className += ' drop-over-downward';
            }
            if (restProps.index < dragingIndex) {
                className += ' drop-over-upward';
            }
        }

        return connectDragSource(
            connectDropTarget(<tr {...restProps} className={className} style={style} />),
        );
    }
}

const rowSource = {
    beginDrag(props) {
        dragingIndex = props.index;
        return {
            index: props.index,
        };
    },
};

const rowTarget = {
    drop(props, monitor) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Time to actually perform the action
        props.moveRow(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
    },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
}))(
    DragSource('row', rowSource, connect => ({
        connectDragSource: connect.dragSource(),
    }))(BodyRow),
);


@connect(({ serialArch, loading }) => ({
    serialArch,
    loading: loading.models.serialArch,
}))
export default class DragSortingTable extends React.Component {
    state = {
        data: [],
        selectedRowKeys: [],
        selectedRows: [],
        lineUuid: '',
        searchText: '',
        lineEntity: {},
        showAdjDragModal: false,
        modalLoading: false,
        adjDragIndex: 0,
        toAdjOrderNo: 1
    };

    components = {
        body: {
            row: DragableBodyRow,
        },
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.serialArch) {
            this.setState({
                data: nextProps.serialArch.existInLineStores,
                selectedRowKeys: [],
                selectedRows: [],
            });
        }
        if (nextProps.lineEntity) {
            this.setState({
                lineEntity: nextProps.lineEntity,
                lineUuid: nextProps.lineUuid
            })
        }
    }

    moveRow = (dragIndex, hoverIndex) => {
        const { data } = this.state;
        const dragRow = data[dragIndex];

        this.props.dispatch({
            type: 'serialArch/sort',
            payload: {
                startData: dragRow,
                endData: data[hoverIndex],
                lineUuid: this.state.lineUuid
            },
        })
    };

    onShowStoreModal = () => {
        if (!this.state.lineUuid) {
            message.warning(SerialArchLocale.pleaseSelectArchLineFirst);
            return;
        }
        const { dispatch } = this.props;
        const pageFilter = {};
        pageFilter.searchKeyValues = {};
        pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        pageFilter.searchKeyValues.serialArchUuid = this.state.lineEntity.serialArch.uuid;

        this.props.dispatch({
            type: 'serialArch/queryNotExistInLineStores',
            payload: { pageFilter, lineUuid: this.state.lineUuid }
        })
    };

    handleSelectRows = (keys, rows) => {
        this.setState({
            selectedRows: rows,
            selectedRowKeys: keys,
        });
    };

    onRemove = () => {
        if (!this.state.selectedRowKeys || this.state.selectedRowKeys.length == 0) {
            message.warning(SerialArchLocale.pleaseSelectToRemoveStore);
            return;
        }
        let existInLineStores = [];
        existInLineStores = this.state.data.filter(element => {
            return this.state.selectedRows.indexOf(element) < 0
        });
        this.props.dispatch({
            type: 'serialArch/removeLineStore',
            payload: {
                lineUuid: this.state.lineUuid,
                storeUuids: this.state.selectedRowKeys,
            }
        })
    }

    onRemoveForOne = (record) => {
        let storeUuids = [];
        storeUuids.push(record.uuid);
        this.props.dispatch({
            type: 'serialArch/removeLineStore',
            payload: {
                lineUuid: this.state.lineUuid,
                storeUuids: storeUuids
            }
        })
    }

    handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    onViewStore = (code) => {
        this.props.dispatch({
            type: 'store/getByCompanyUuidAndCode',
            payload: code,
            callback: (response) => {
                if (response && response.success && response.data) {
                    this.props.dispatch(routerRedux.push({
                        pathname: '/basic/store',
                        payload: {
                            showPage: 'view',
                            entityUuid: response.data.uuid
                        }
                    }));
                }
            }
        })
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={SerialArchLocale.storeCode}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm)}
                    icon="search"
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    {SerialArchLocale.search}
                </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    {SerialArchLocale.reset}
                </Button>
            </div>
        ),
        filterIcon: filtered => (
            <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => {
            return record[dataIndex].code
                .toString()
                .toLowerCase().indexOf((value.toLowerCase())) === 0
        },
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: (text, record) => (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[this.state.searchText]}
                autoEscape
                textToHighlight={record.store.code.toString()}
            />
        ),
    });

    fetchOperateProps = (record) => {
        let operateProps = [
            {
                name: SerialArchLocale.adjOrderNo,
                onClick: this.onShowAdjOrderNoModal.bind(this, record.orderNo - 1)
            },
            {
                name: commonLocale.deleteLocale,
                disabled: !SerialArchPerm.DELETE_STORE,
                confirm: true,
                confirmCaption: SerialArchLocale.store,
                onClick: this.onRemoveForOne.bind(this, record)
            }
        ];
        return operateProps;
    }

    onShowAdjOrderNoModal = (dragIndex) => {
        this.setState({
            adjDragIndex: dragIndex,
            showAdjDragModal: true
        });
    }

    handleCancelAdjOrderNo() {
        this.setState({
            showAdjDragModal: false,
            toAdjOrderNo: 1
        });
    }

    handleAdjOrderNo() {
        const { data, adjDragIndex, toAdjOrderNo } = this.state;
        const startData = data[adjDragIndex];
        const endData = data[toAdjOrderNo - 1];

        this.props.dispatch({
            type: 'serialArch/sort',
            payload: {
                startData: startData,
                endData: endData,
                lineUuid: this.state.lineUuid
            },
            callback: (response) => {
                if (response && response.success) {
                    this.setState({
                        showAdjDragModal: false,
                        modalLoading: false,
                        toAdjOrderNo: 1
                    });
                } else {
                    this.setState({
                        modalLoading: false,
                        toAdjOrderNo: 1
                    });
                }
            }
        })
    }

    orderNoChange = (value) => {
        this.setState({
            toAdjOrderNo: value
        });
    }

    drawOtherCom = () => {
        const baseFormItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 16 },
        };

        return (
            <Modal
                centered={true}
                width={350}
                title={'请输入要调整的序号'}
                visible={this.state.showAdjDragModal}
                confirmLoading={this.state.modalLoading}
                onOk={() => this.handleAdjOrderNo()}
                onCancel={() => this.handleCancelAdjOrderNo()}
                okText={commonLocale.confirmLocale}
                cancelText={commonLocale.cancelLocale}
            >
                <Form>
                    <FormItem
                        {...baseFormItemLayout}
                        key='orderNo'
                        label={SerialArchLocale.orderNo}
                    >
                        <InputNumber value={this.state.toAdjOrderNo} min={1} max={this.state.data ? this.state.data.length : 1} placeholder={placeholderLocale(SerialArchLocale.orderNo)} onChange={this.orderNoChange}
                        />
                    </FormItem>
                </Form>
            </Modal>
        );
    }

    render() {
        const columns = [
            {
                title: SerialArchLocale.orderNo,
                dataIndex: 'orderNo',
                key: 'orderNo',
                width: '100px',
            },
            {
                title: commonLocale.codeLocale,
                dataIndex: 'code',
                key: 'code',
                width: '280px',
                ...this.getColumnSearchProps('store'),
                render: (text, record) => <a onClick={this.onViewStore.bind(true, record.store ? record.store.code : undefined)}>
                    {record.store ? record.store.code : ''}</a>,
            },
            {
                title: commonLocale.nameLocale,
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => record.store ? record.store.name : '',
                width: '300px',
            }
        ];

        if (loginOrg().type === 'COMPANY') {
            columns.push(
                {
                    key: 'operate',
                    title: commonLocale.operateLocale,
                    render: record => {
                        return <OperateCol menus={this.fetchOperateProps(record)} />
                    }
                }
            );
        }

        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            selectedRows: this.state.selectedRows,
            onChange: this.handleSelectRows,
            getCheckboxProps: record => ({
                disabled: record.disabled,
            }),
        };

        const paginationProps = {
            showSizeChanger: true,
            showQuickJumper: true,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100', '200']
        };

        return (<div>
            <Tabs defaultActiveKey='1' tabBarExtraContent={
                loginOrg().type === 'COMPANY' &&
                <Fragment>
                    <Popconfirm title={SerialArchLocale.sureToRemoveSelectedStore} onConfirm={() => this.onRemove()}>
                        <Button disabled={!SerialArchPerm.DELETE_STORE}>
                            {commonLocale.batchRemoveLocale}
                        </Button>
                    </Popconfirm>
                    &nbsp;
                <Button type='primary' icon='plus' onClick={() => this.onShowStoreModal()} disabled={!SerialArchPerm.ADD_STORE}>
                        {SerialArchLocale.addStore}
                    </Button>
                </Fragment>}>
                <TabPane tab={SerialArchLocale.store} key='1'>
                    <StandardTable
                        pagination={paginationProps}
                        rowKey={record => record.uuid}
                        columns={columns}
                        dataSource={this.state.data}
                        //components={this.components}
                        onRow={(record, index) => ({
                            index: record.orderNo - 1,
                            moveRow: this.moveRow,
                        })}
                        rowSelection={rowSelection}
                        rowKey={record => record.uuid}
                    />
                </TabPane>
                <TabPane tab={commonLocale.operateInfoLocale} key='2'>
                    <EntityLogTab
                        entityUuid={this.state.lineEntity.uuid}
                        serviceCaption={SERVICE_CAPTION['serialArch']}
                    />
                </TabPane>
            </Tabs>
            <SerialArchLineAddStore />
            {this.drawOtherCom()}
        </div >);
    }
}