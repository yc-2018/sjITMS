import React from 'react';
import { Button, message,Checkbox } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { dispatcherConfigLocale } from './DispatcherConfigLocale';
import DispatcherConfigCreateModal from './DispatcherConfigCreateModal';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import DispatcherConfigSearchForm from './DispatcherConfigSearchForm';

@connect(({ dispatcherconfig, loading }) => ({
    dispatcherconfig,
    loading: loading.models.dispatcherconfig,
}))
export default class PlanConfig extends ConfigSearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: dispatcherConfigLocale.title,
            data: this.props.dispatcherconfig.data,
            entity: {},
            createModalVisible: false,
            hideLogTab: true,

        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    }

    columns = [{
        title: dispatcherConfigLocale.dispatchcenteruuid,
        dataIndex: 'dispatchcenteruuid',
        render: (text, record) => record.dispatchcenteruuid ? record.dispatchcenteruuid : ''
    }, 
    {
        title: dispatcherConfigLocale.name,
        dataIndex: 'name',
        render: (text, record) => record.name ? "["+record.code+"]"+record.name : ''
    }, 
    {
        title: dispatcherConfigLocale.volume,
        dataIndex: 'volume',
        render: (text, record) =>  <Checkbox checked={record.volume===1?true:false} onChange={()=>this.onChange(record,"volume")}/>
    }, 
    {
        title: dispatcherConfigLocale.weight,
        dataIndex: 'weight',
        render: (text, record) => <Checkbox checked={record.weight===1?true:false} onChange={()=>this.onChange(record,"weight")}/>
    }, 
    // {
    //     title: commonLocale.operateLocale,
    //     render: record => (
    //         <Fragment>
    //             <IPopconfirm onConfirm={this.handleRemove.bind(this, record.uuid, false)} operate={commonLocale.deleteLocale} object={dispatcherConfigLocale.title}>
    //                 <a>
    //                     {commonLocale.deleteLocale}
    //                 </a>
    //             </IPopconfirm>
    //         </Fragment>
    //     ),
    // }
];

    componentDidMount = () => {
        this.refreshTable();
    }
    onChange = (e,text)=>{
        if(e[text]==0){
            e[text] = 1;
        }else{
            e[text] = 0;
        }
        this.props.dispatch({
            type: 'dispatcherconfig/update',
            payload: e,
        }).then(result =>{
            this.refreshTable();

        })
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.dispatcherconfig.data
        });
    }

    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;

        let queryFilter = { ...pageFilter };
        if (filter) {
            queryFilter = { ...pageFilter, ...filter };
        }

        dispatch({
            type: 'dispatcherconfig/queryPlanConfig',
            payload: queryFilter,
        });
    };

    onSearch = (data) => {
        const { pageFilter } = this.state;
        if (data) {
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
            }
        }
        this.refreshTable();
    }

    handleCreateModalVisible = (flag, uuid) => {
        this.setState({
            entity: {},
        })

        this.setState({
            createModalVisible: !!flag,
        })
    }

    handleSave = () => {
        const { entity } = this.state;

        let params = {
            ...entity,
            companyUuid: loginCompany().uuid,
        }
        console.log("entity",entity);
        let type = 'dispatcherconfig/insert';
        this.props.dispatch({
            type: type,
            payload: params,
            callback: (response) => {
                if (response && response.success) {
                    // if (type === 'dispatcherconfig/add') {
                    //     message.success(commonLocale.saveSuccessLocale);
                    // } else if (type === 'dispatcherconfig/modify') {
                    //     message.success(commonLocale.modifySuccessLocale);
                    // }
                    this.handleCreateModalVisible(false);
                    this.refreshTable();
                }
            },
        })
    }

    handleRemove = (uuid, callback) => {
        if (uuid) {
            this.props.dispatch({
                type: 'dispatcherconfig/remove',
                payload: uuid,
                callback: callback ? callback : (response) => {
                    if (response && response.success) {
                        this.refreshTable();
                        message.success(commonLocale.removeSuccessLocale);
                    }
                }
            })
        }
    }

    onBatchRemove = () => {
        this.setState({
            batchAction: commonLocale.deleteLocale,
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        const { selectedRows, batchAction } = this.state;

        const that = this;
        selectedRows.forEach(item => {
            if (batchAction === commonLocale.deleteLocale) {
                that.handleRemove(item.uuid, that.batchCallback);
            }
        });
    }

    drawCreateModal = () => {
        const {
            entity,
            selectedRows,
            createModalVisible,
        } = this.state;

        const createModalProps = {
            entity: entity,
            modalVisible: createModalVisible,
            handleCreateModalVisible: this.handleCreateModalVisible,
            handleSave: this.handleSave,
            loading: this.props.loading,
            loginCompanyUuid:loginCompany().uuid
        }

        return <DispatcherConfigCreateModal {...createModalProps} />
    }

    drawSearchPanel = () => {
        const { pageFilter } = this.state;
        return (<DispatcherConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
    }

    drawActionButton() {
        return (
            <Fragment>
                <Button type='primary' icon="plus"
                    onClick={() => this.handleCreateModalVisible(true)}
                >
                    {commonLocale.createLocale}
                </Button>
            </Fragment>
        );
    }

    // drawToolbarPanel() {
    //     return (
    //         <Fragment>
    //             <Button
    //                 onClick={() =>
    //                     this.onBatchRemove()
    //                 }
    //             >
    //                 {commonLocale.batchRemoveLocale}
    //             </Button>
    //         </Fragment>
    //     );
    // }
}