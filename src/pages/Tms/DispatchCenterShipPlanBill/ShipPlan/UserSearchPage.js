import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber, Switch, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { VehicleState, VehicleLocale, VehiclePerm } from '@/pages/Tms/Vehicle/VehicleLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import VehicleSearchForm from '@/pages/Tms/Vehicle/VehicleSearchForm';
import { orgType } from '@/utils/OrgType';
import { routerRedux } from 'dva/router';
import UserSearchForm from './UserSearchForm';
import SearchPage from './SearchPage';
import { WorkType } from '@/pages/Account/User/WorkTypeConstants';
const FormItem = Form.Item;

@connect(({ workType, loading }) => ({
    workType,
    loading: loading.models.workType,
}))
@Form.create()
export default class UserSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: '员工',
            data: props.workType.dataForAdd,
            selectedRows:[],
            type:'checkbox',
            scroll:{
              y:400
            },
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
    }

    componentDidMount() {
      this.props.onRef(this);
      this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
      this.setState({
        data: nextProps.workType.dataForAdd,
      });
    }
    changeSelectedRows = (rows)=>{
      this.setState({
        selectedRows:rows,
      })
    }

    getSelectRow=()=>{
      return this.state.selectedRows
    }

    resetSelectRows = ()=>{
      this.setState({
        selectedRows:[],
      })
    }


    onSearch = (data) => {
      const { pageFilter } = this.state;
      pageFilter.page = 0;
      if (data) {
        pageFilter.searchKeyValues = {
          codeName:data.codeName,
          companyUuid: loginCompany().uuid,
          dispatchCenterUuid:loginOrg().uuid

        }
      } else {
        pageFilter.searchKeyValues = {
          companyUuid: loginCompany().uuid,
          dispatchCenterUuid:loginOrg().uuid
        }
      }
      this.refreshTable();
    }

    refreshTable = (filter) => {
      const { dispatch } = this.props;
      const { pageFilter } = this.state;


      pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
      }

      let queryFilter = { ...pageFilter };
      if (filter) {
          queryFilter = {
              ...pageFilter,
              ...filter
          };
      }

      dispatch({
          type: 'workType/queryForAdd',
          payload: queryFilter,
      });
    };

    drawSearchPanel = () => {
      return <UserSearchForm filterValue={this.state.pageFilter.searchKeyValues}
        refresh={this.onSearch} />;
    }


    columns = [
      {
        title: commonLocale.codeLocale,
        dataIndex: 'userCode',
      },
      {
        title: commonLocale.nameLocale,
        dataIndex: 'userName',
      },
      {
        title: '职能',
        dataIndex: 'userPro',
        render:val=>WorkType[val].caption
      },
    ];

}
