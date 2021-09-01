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
import { VehicleState, VehicleLocale, VehiclePerm } from '@/pages/Tms/Vehicle/VehicleLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import VehicleSearchForm from '@/pages/Tms/Vehicle/VehicleSearchForm';
import { orgType } from '@/utils/OrgType';
import { routerRedux } from 'dva/router';
const FormItem = Form.Item;

@connect(({ vehicle, loading }) => ({
    vehicle,
    loading: loading.models.vehicle,
}))
@Form.create()
export default class VehicleSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: VehicleLocale.title,
            data: props.vehicle.data,
            selectedRow:{},
            tableHeight : 320,
            pageFilter:{
              page: 0,
              pageSize: 20,
              sortFields: {},
              searchKeyValues: {},
              likeKeyValues: {}
            }
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    }

    componentDidMount() {
      this.props.onRef(this);
      this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
      this.setState({
        data: nextProps.vehicle.data,
        entity: {}
      });
    }
    changeSelectedRows = (rows)=>{
      this.setState({
        selectedRow:rows[0],
      })
    }

    getSelectRow=()=>{
      return this.state.selectedRow
    }


    onSearch = (data) => {
      const { pageFilter } = this.state;
      if (data) {
        pageFilter.likeKeyValues = {
          ...pageFilter.likeKeyValues,
          codeOrPlate: data.codeOrPlate
        },
        pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          state: data.state,
          companyUuid: loginCompany().uuid,
          carrierUuid: data.carrierUuid ? JSON.parse(data.carrierUuid).uuid : '',
          vehicleTypeUuid: data.vehicleTypeUuid ? JSON.parse(data.vehicleTypeUuid).uuid : '',
        }
      } else {
        pageFilter.searchKeyValues = {
          companyUuid: loginCompany().uuid,
        },
        pageFilter.likeKeyValues = {
        }
      }
      this.refreshTable();
    }

    refreshTable = (filter) => {
      const { dispatch } = this.props;
      const { pageFilter } = this.state;

      const currentOrgType = loginOrg().type;
      const carrierUuid = (orgType.carrier.name === currentOrgType) ? loginOrg().uuid : pageFilter.searchKeyValues.carrierUuid;

      pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          carrierUuid: carrierUuid
      }

      let queryFilter = { ...pageFilter };
      if (filter) {
          queryFilter = {
              ...pageFilter,
              ...filter
          };
      }

      dispatch({
          type: 'vehicle/query',
          payload: queryFilter,
      });
    };

    drawSearchPanel = () => {
      return <VehicleSearchForm filterEqualsValue={this.state.pageFilter.searchKeyValues}
        filterLikeValue={this.state.pageFilter.likeKeyValues}
        refresh={this.onSearch} toggleCallback={this.toggleCallback}
      />;
    }


    columns = [
      {
        title: commonLocale.codeLocale,
        dataIndex: 'code',
        sorter: true,
      },
      {
        title: VehicleLocale.plateNo,
        dataIndex: 'plateNumber',
      },
      {
        title: VehicleLocale.vehicleType,
        dataIndex: 'vehicleType',
        render: (text, record) =>  convertCodeName(record.vehicleType)

      },
      {
        title: VehicleLocale.carrier,
        dataIndex: 'carrier',
        render: (text, record) => <a onClick={this.onViewCarrier.bind(true, record.carrier ? record.carrier.uuid : undefined)}>
          {convertCodeName(record.carrier)}</a>
      },
      {
        title: commonLocale.stateLocale,
        dataIndex: 'state',
        render: (text, record) => {
          return  <span>{VehicleState[record.state].caption}</span>
        }
      }
    ];

}
