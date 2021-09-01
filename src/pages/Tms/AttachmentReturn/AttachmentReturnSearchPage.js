import SearchPage from '@/pages/Component/Page/SearchPage';
import { loginCompany, loginOrg, getActiveKey } from '@/utils/LoginContext';
import AttachmentReturnSearchForm from './AttachmentReturnSearchForm';
import { Switch, Button, Divider, message, Modal } from 'antd';
import { Fragment } from 'react';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import { attachmentReturnLocale } from './AttachmentReturnLocale';
// import { CARRIER_RES } from './AttachmentReturnPermission';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { convertCodeName } from '@/utils/utils';
import Empty from '@/pages/Component/Form/Empty';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import { orgType } from '@/utils/OrgType';
import EditTable from './EditTable';
import AttachmentReturnCreatePage from './AttachmentReturnCreatePage';

@connect(({ attachmentReturn, loading }) => ({
  attachmentReturn,
  loading: loading.models.attachmentReturn,
}))
export default class AttachmentReturnSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: attachmentReturnLocale.title,
      data: props.attachmentReturn.data?props.attachmentReturn.data:{},
      unShowRow:true,
      isCreateVisible:false,
      isEdit:false,
      record:undefined,
      key:'attachmentReturn.search.table',
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;

  }

  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.attachmentReturn.data!=this.props.attachmentReturn.data){
      this.setState({
        data: nextProps.attachmentReturn.data
      });
    }
  }
  drawActionButton = () => {
    return (
      <Fragment>
        <Button icon="plus" type="primary"
          // disabled={!havePermission(CARRIER_RES.CREATE)}
                onClick={this.onCreate.bind(this, null)}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  drawSearchPanel = () => {
    return <AttachmentReturnSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
  }


  renderOperateCol = (record) => {
    const options = [];
    options.push(
      {
        name: '归还',
        onClick: this.onCreate.bind(this, record),
      },
    )

    return <OperateCol menus={options} />
  }

  columns = [
    {
      title: attachmentReturnLocale.shipBillNumber,
      dataIndex: 'shipBillNumber',
      sorter: true,
      width:200,
    },
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'store',
      sorter: true,
      width:200,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: attachmentReturnLocale.attachment,
      dataIndex: 'attachment',
      sorter: true,
      width:200,
      render:val=>val?convertCodeName(val):<Empty/>

    },
    {
      title: attachmentReturnLocale.qtyStr,
      dataIndex: 'qtyStr',
      sorter: true,
      width:200,
    },
    {
      title: commonLocale.operateLocale,
      width:200,
      render:record=>this.renderOperateCol(record)
    },
  ];

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    this.setState({
      isCreateVisible:false,
      isEdit:false,
    })
    let queryFilter = { ...pageFilter };
    if (filter) {
      let attachmentUuid = '';
      let storeUuid = '';
      if(filter.attachment){
        attachmentUuid = JSON.parse(filter.attachment).uuid
      }
      if(filter.store){
        storeUuid = JSON.parse(filter.store).uuid
      }
      queryFilter = {
        ...pageFilter,
        ...filter,
        attachmentUuid:attachmentUuid,
        storeUuid:storeUuid,
      };
    }

    dispatch({
      type: 'attachmentReturn/query',
      payload: queryFilter
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    let storeUuid = undefined;
    if (data) {
      if (data.store) {
        storeUuid = JSON.parse(data.store).uuid;
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        storeUuid:storeUuid
      }
    }else{
      pageFilter.searchKeyValues = {
      }
    }

    this.refreshTable();
  }


  /**
   * 跳转到详情页面
   */
  onView = (uuid) => {
    this.props.dispatch({
      type: 'attachmentReturn/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  /**
   * 跳转到编辑或新增页面
   */
  onCreate = (record) => {
    this.setState({
      isCreateVisible:true,
    })
    if(record){
      this.setState({
        record:record,
        isEdit:true
      })
    }
  }

  drawOtherCom(){
    return <AttachmentReturnCreatePage
      isCreateVisible = {this.state.isCreateVisible}
      isEdit = {this.state.isEdit}
      reccord={this.state.record}
      refreshTable={this.refreshTable}
    />;
  }
}
