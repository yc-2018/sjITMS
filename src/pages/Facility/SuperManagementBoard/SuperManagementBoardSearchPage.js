import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, message, Modal,Select } from 'antd';
import { havePermission } from '@/utils/authority';
import { colWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import OperateCol from '@/pages/Component/Form/OperateCol';
import SearchPage from '@/pages/Component/Page/SearchPage';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { RESOURCE_IWMS_BASIC_ARTICLE_VIEW } from '@/pages/Basic/Article/Permission';

import { SuperType,SHELFLIFE_TYPE,STATE } from './SuperManagementBoardContants';
import { SuperManagementBoardLocale } from './SuperManagementBoardLocale';
import SuperManagementBoardSearchForm from './SuperManagementBoardSearchForm';
import SuperManagementBoardViewPage from './SuperManagementBoardViewPage';
import SuperManagementBoardCreatePage from './SuperManagementBoardCreatePage';
import { SUPERMANAGEMENTBOARD_RES } from './SuperManagementBoardPermission';

const superTypeOptions = [];
Object.keys(SuperType).forEach(function (key) {
    superTypeOptions.push(<Select.Option key={key} value={SuperType[key].name}>{SuperType[key].caption}</Select.Option>);
});


@connect(({ supermanagement,article, loading }) => ({
    supermanagement,article,
    loading: loading.models.supermanagement,
}))
export default class SuperManagementSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: SuperManagementBoardLocale.title,
            data: props.supermanagement.data,
            isCreateVisible:false,
            isViewVisible:false,
            suspendLoading:false,
            selectedRows: [],
            entity:{},
            key: 'supermanagement.search.table'
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.searchKeyValues.type = '';
    }

    componentDidMount() {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.supermanagement.data!=this.props.supermanagement.data){
            this.setState({
                data: nextProps.supermanagement.data
            });
        }
    }
    /**
     * 控制添加框展示
     */
    onShowAddModel = ()=>{
        this.setState({
            isCreateVisible:!this.state.isCreateVisible
        });
    }
    /**
     * 控制查看框展示
     */
    onShowViewModel = (record)=>{
        this.setState({
            isViewVisible:!this.state.isViewVisible,
        });
        if(record.uuid){
            this.setState({
                entity:{...record}
            });
        }else{
            this.setState({
                entity:{}
            })
        }
    }

    /**
     * 条件查询
     */
    onSearch = (data) => {
        const { pageFilter } = this.state;
        pageFilter.page = 0;

        if (data) {
            if (data.date && data.date[0] && data.date[1]) {
                data.startDate = moment(data.date[0]).format('YYYY-MM-DD');
                data.endDate = moment(data.date[1]).format('YYYY-MM-DD');
                delete data.date;
            } else if (pageFilter.searchKeyValues.startDate && pageFilter.searchKeyValues.endDate) {
                delete pageFilter.searchKeyValues.startDate;
                delete pageFilter.searchKeyValues.endDate;
            }

            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data,
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid
            }
        }
        this.refreshTable();
    }
    /**
     * 批量失效
     */
    onBatchInValid = ()=>{
        this.setState({
            batchAction: SuperManagementBoardLocale.invalid,
            content: undefined
        })
        this.handleBatchProcessConfirmModalVisible(true);
    }
    // 批量操作
  onBatchProcess = () => {
    this.setState({
      suspendLoading:true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth=(i)=>{
      if(i<selectedRows.length){
        if (batchAction === SuperManagementBoardLocale.invalid) {
          if (selectedRows[i].state === STATE.VALID.name) {
            that.inValid(selectedRows[i], true).then(res=>{
              bacth(i+1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i+1);
          }
        }
      }else{
        this.setState({
          suspendLoading:false
        })
      }
    }
    bacth(0);
  }
    /**
     * 单一失效
     */
    inValid = (record, batch) => {
        const that = this;
        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: 'supermanagement/inValid',
                payload: {
                    uuid: record.uuid,
                    version: record.version
                },
                callback: response => {
                    if (batch) {
                        that.batchCallback(response, record);
                        resolve({ success: response.success });
                        return;
                    }
                    if (response && response.success) {

                        that.refreshTable();
                        message.success(commonLocale.inValidSuccessLocale)
                    }
                }
            })
        })
    }

    /**
     * 刷新表格
     */
    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;

        let queryFilter = { ...pageFilter };
        if (filter) {
            queryFilter = { ...pageFilter, ...filter };
        }

        dispatch({
            type: 'supermanagement/query',
            payload: queryFilter,
        });
    };


    /**
     * 绘制操作方法
     */
    fetchOperateProps = (record) => {
        if (STATE[record.state].name == 'VALID') {
            return [{
                name: commonLocale.viewLocale,
                onClick: this.onShowViewModel.bind(this, record)
            }, {
                name: SuperManagementBoardLocale.invalid,
                onClick: this.inValid.bind(this, record,false),
                confirm: true,
                confirmCaption: SuperManagementBoardLocale.billTitle,
                disabled: !havePermission(SUPERMANAGEMENTBOARD_RES.INVALID),
            }];
        }else{
            return [
                {
                    name: commonLocale.viewLocale,
                    onClick: this.onShowViewModel.bind(this, record)
                }
            ];
        }
    }
    columns = [
        {
            title: commonLocale.articleLocale,
            dataIndex: 'article',
            width: colWidth.codeNameColWidth,
            sorter: true,
            render: val => <a onClick={this.onViewArticle.bind(this, val?val.uuid:undefined) }
            disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_VIEW)}><EllipsisCol colValue={convertCodeName(val)} /></a>

        },
        {
            title: SuperManagementBoardLocale.shelf,
            dataIndex: 'shelfLifeDays',
            sorter: true,
            width: colWidth.codeColWidth,
        },
        {
            title: SuperManagementBoardLocale.shelfType,
            dataIndex: 'shelfLifeType',
            sorter: true,
            width: colWidth.codeColWidth,
            render: (val, record) => record.shelfLifeType ? SHELFLIFE_TYPE[record.shelfLifeType].caption : <Empty />

        },
        {
            title: SuperManagementBoardLocale.type,
            dataIndex: 'type',
            sorter: true,
            width: colWidth.enumColWidth,
            render: (val, record) => record.type ? SuperType[record.type].caption : <Empty />
        },
        {
            title: SuperManagementBoardLocale.startDate,
            key: 'startDate',
            sorter: true,
            dataIndex: 'startDate',
            width: colWidth.dateColWidth,
            render: val => val ? moment(val).format('YYYY-MM-DD') : <Empty />
        },
        {
            title: SuperManagementBoardLocale.endDate,
            key: 'endDate',
            dataIndex: 'endDate',
            sorter: true,
            width: colWidth.dateColWidth,
            render: val => val ? moment(val).format('YYYY-MM-DD') : <Empty />
        },
        {
            title: SuperManagementBoardLocale.oldControlDays,
            key: 'oldControlDays',
            dataIndex: 'oldControlDays',
            sorter: true,
            width: colWidth.dateColWidth,
            render: val => val ?  val : <Empty />
        },
        {
            title: SuperManagementBoardLocale.newControlDays,
            key: 'newControlDays',
            sorter: true,
            dataIndex: 'newControlDays',
            width: colWidth.dateColWidth,
        },
        {
            title: commonLocale.stateLocale,
            key: 'state',
            dataIndex: 'state',
            sorter: true,
            width: colWidth.enumColWidth,
            render: val => <BadgeUtil value={val} />
        },
        {
            title: commonLocale.operateLocale,
            width: colWidth.operateColWidth,
            render: record => (
                <OperateCol menus={this.fetchOperateProps(record)} />
            ),
        },
    ];

    drawActionButton = ()=>{
        return <Fragment>
            <Button onClick={this.onShowAddModel}
                disabled={!havePermission(SUPERMANAGEMENTBOARD_RES.CREATE)}
                type='primary'
            >
                {SuperManagementBoardLocale.add}
            </Button>
        </Fragment>
    }
    drawSearchPanel = () => {
        return <SuperManagementBoardSearchForm filterValue={this.state.pageFilter.searchKeyValues}
            refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
    }
    /**
  * 绘制批量工具栏
  */
  drawToolbarPanel() {
    return [
      <Button key={1} onClick={() => this.onBatchInValid()}
        disabled={!havePermission(SUPERMANAGEMENTBOARD_RES.INVALID)}
    >
        {SuperManagementBoardLocale.batchInvalid}
      </Button>,
    ];
  }
    drawOtherCom = ()=>{

        const { entity } = this.state;

        return (
            <div>
                <SuperManagementBoardCreatePage
                    isCreateVisible={this.state.isCreateVisible}
                    entity = {entity}
                    refreshTable = {this.refreshTable}
                />
                <SuperManagementBoardViewPage
                    isViewVisible = {this.state.isViewVisible}
                    entity = {entity}
                    onCancel = {this.onShowViewModel}
                />
            </div>

        );
    }


}
