import { Table, Button, message, Input, InputNumber, Icon, Popconfirm, Tabs, Modal, Form,Spin } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { element } from 'prop-types';
import {  SerialArchPerm } from './BillSortLocal';
import SmallSortObjectCreateModal from './SmallSortObjectCreateModal';
import Highlighter from 'react-highlight-words';
import OperateInfoTable from './OperateInfoTable';
import { SERVICE_CAPTION } from '@/utils/constants';
import { routerRedux } from 'dva/router';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import {BillSort} from './BillSortLocal';
import { convertCodeName } from '@/utils/utils';

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


@connect(({ billSort, loading }) => ({
    billSort,
    loading: loading.models.billSort,
}))
class DragSortingTable extends React.Component {
    state = {
        data: [],
        selectedRowKeys: [],
        selectedRows: [],
        smallSortUuid: this.props.smallSortUuid,
        searchText: '',
        smallEntity: this.props.smallEntity,
        modalLoading: false,
        objectModalVisble:false,
        selectedBigSort:this.props.selectedBigSort,
        paginationProps:{},
        pageFilter:{
            page:0,
            pageSize:20,
            sortFields:{},
            searchKeyValues:{},
            likeKeyValues:{}
        },
        suspendLoading: false
    };

    components = {
        body: {
            row: DragableBodyRow,
        },
    };

    componentWillReceiveProps(nextProps) {
        if(nextProps.selectedBigSort&&this.state.selectedBigSort.uuid != nextProps.selectedBigSort.uuid){
            
            this.setState({
                selectedBigSort:nextProps.selectedBigSort
            })
        }

        if(this.state.smallSortUuid != nextProps.smallSortUuid){
           
            this.setState({
                smallEntity: nextProps.smallEntity,
                smallSortUuid: nextProps.smallSortUuid,
                data:[],
                selectedRowKeys: [],
                selectedRows: [],
            },()=>{
                this.refreshTable()
            })
           
        }
        if (nextProps.billSort && this.state.data != nextProps.billSort.existSortObject) {
           
             this.setState({
                 data: nextProps.billSort.existSortObject,
                 paginationProps:nextProps.billSort.pagination,
                 selectedRowKeys: [],
                 selectedRows: [],
             });
         }
         
    }

    componentDidMount(){
        this.refreshTable()
    }

    moveRow = (dragIndex, hoverIndex) => {
        const { data } = this.state;
        const dragRow = data[dragIndex];

        this.props.dispatch({
            type: 'serialArch/sort',
            payload: {
                startData: dragRow,
                endData: data[hoverIndex],
                smallSortUuid: this.state.smallSortUuid
            },
        })
    };

    onShowStoreModal = () => {
        if (! this.state.smallSortUuid) {
            message.warning(BillSort.pleaseSelectSmallSort);
            return;
        }
        this.setState({
            objectModalVisble: true,
        });

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
        this.props.dispatch({
            type: 'billSort/smallObjectremove',
            payload: {
                uuids: this.state.selectedRowKeys
            },
            callback:res=>{
                if(res&&res.success){
                    message.success('删除成功');
                    this.refreshTable()
                    
                }
            }
        })
      
    }


    onRemoveForOne = (record) => {

        this.props.dispatch({
            type: 'billSort/smallObjectremove',
            payload: {
                uuids: [record.uuid],
            },
            callback:res=>{
                if(res&&res.success){
                    message.success('删除成功');
                    this.refreshTable()
                    
                }
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
                name: commonLocale.deleteLocale,
                disabled: !SerialArchPerm.DELETE_STORE,
                confirm: true,
                confirmCaption: '小类对象',
                onClick: this.onRemoveForOne.bind(this, record)
            }
        ];
        return operateProps;
    }

    //小类对象保存
    saveSmallSortObject = (type,data) => {
         this.props.dispatch({
            type: type,
            payload: data,
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                    this.setState({
                        objectModalVisble: false,
                    });
                    this.refreshTable()
                }
            },
        })
    }

    handleObjectModalVisible = ()=>{
        this.setState({
            objectModalVisble:false
        })
    }
    onTableChange = (pagination, filtersArg, sorter)=>{
        const {pageFilter} = this.state;
        if (pageFilter.page !== pagination.current - 1) {
            pageFilter.changePage = true;
            // //保存当前页面
            // if(this.onSaveAllTargetPage){
            //     this.onSaveAllTargetPage();
            // }
        }

        pageFilter.page = pagination.current - 1;
        pageFilter.pageSize = pagination.pageSize;

        // 判断是否有过滤信息
        const filters = Object.keys(filtersArg).reduce((obj, key) => {
            const newObj = { ...obj };
            newObj[key] = getValue(filtersArg[key]);
            return newObj;
        }, {});

        if (sorter.field) {
            var sortField = `${sorter.field}`;
            var sortType = sorter.order === 'descend' ? true : false;
            // 排序触发表格变化清空表格选中行，分页则不触发
            if (pageFilter.sortFields[sortField] === sortType) {
                pageFilter.changePage = true;
            } else {
                pageFilter.changePage = false;
            }
            // 如果有排序字段，则需要将原来的清空
            pageFilter.sortFields = {};
            pageFilter.sortFields[sortField] = sortType;
        }

        this.setState({
            pageFilter
        },()=>{
            this.refreshTable()
        })
    }
    //刷新表单
    refreshTable = ()=>{
        const {smallSortUuid,selectedBigSort,pageFilter} = this.state;
        pageFilter.searchKeyValues.smallSortUuid=smallSortUuid;
        pageFilter.searchKeyValues.type=selectedBigSort.type;
        this.props.dispatch({
            type:'billSort/smallObjectpage',
            payload:pageFilter
        })
        this.setState({pageFilter})
    }

    onViewDetail = (record)=>{
        const {selectedBigSort} = this.state;
        let pathname='';
        if(selectedBigSort.type==='Goods'){
          pathname='/basic/article';
        }else if (selectedBigSort.type==='Store'){
            pathname='/basic/store';
        }else{
            pathname='/tms/vehicleType';
        }
        this.props.dispatch(routerRedux.push({
            pathname,
            payload:{
                showPage:'view',
                entityUuid:record?record.smallObject.uuid:undefined,
                uuid:record?record.smallObject.uuid:undefined
            }
        }))
    }

    render() {
        const columns = [
            {
                title: '小类',
                dataIndex: 'smallSort',
                key: 'smallSort',
                width: '280px',
                // ...this.getColumnSearchProps('store'),
                render: (text, record) =>record.smallSort ? convertCodeName(record.smallSort) : ''
                    
            },
            {
                title: '小类对象',
                dataIndex: 'smallObject',
                key: 'smallObject',
                render: (text, record) => record.smallObject ?<a onClick={()=>this.onViewDetail(record)}>{convertCodeName(record.smallObject)}</a>: '',
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
            defaultPageSize: 20,
            ...this.props.pagination,
            pageSizeOptions: ['10', '20', '50', '100', '200']
        };
        const ObjectModalMethods = {
            saveSmallSortObject:this.saveSmallSortObject,
            handleCreateModalVisible:this.handleObjectModalVisible
        }
        const tableLoad = this.props.loading
        return (<div>
            <Tabs defaultActiveKey='1' tabBarExtraContent={
                loginOrg().type === 'COMPANY' &&
                <Fragment>
                    <Popconfirm title={BillSort.removeSmallTip} onConfirm={() => this.onRemove()}>
                        <Button >
                            {commonLocale.batchRemoveLocale}
                        </Button>
                    </Popconfirm>
                    &nbsp;
                <Button type='primary' icon='plus' onClick={() => this.onShowStoreModal()} >
                        {BillSort.addObject}
                    </Button>
                </Fragment>}>
                <TabPane tab={BillSort.smallSortObject} key='1'>
                    <Table
                        pagination={paginationProps}
                        rowKey={record => record.uuid}
                        columns={columns}
                        dataSource={this.state.data}
                        components={this.components}
                        onRow={(record, index) => ({
                            // index: record.orderNo - 1,
                            moveRow: this.moveRow,
                        })}
                        loading={tableLoad}
                        rowSelection={rowSelection}
                        onChange={this.refreshTable}
                    />
                </TabPane>
                <TabPane tab={commonLocale.operateInfoLocale} key='2'>
                    <OperateInfoTable
                        entity={this.state.smallEntity}
                        serviceCaption={SERVICE_CAPTION['billSort']}
                    />
                </TabPane>
            </Tabs>
            <SmallSortObjectCreateModal 
            smallSortUuid={this.state.smallSortUuid}
            createModalVisible={this.state.objectModalVisble} 
            selectedBigSort={this.state.selectedBigSort}
            {...ObjectModalMethods} />
            
        </div >);
    }
}

// const BillSortDetailTable = DragDropContext(HTML5Backend)(DragSortingTable);
const BillSortDetailTable = DragSortingTable

export default BillSortDetailTable;
