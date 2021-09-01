import { PureComponent } from "react";
import { Input, InputNumber, Popconfirm, Divider, message } from 'antd';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import EditTable from './EditTable';
import { itemColWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { match1MN, matchMN } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { orgType } from '@/utils/OrgType';
import { MAX_CM_VALUE, MAX_G_VALUE } from '@/utils/constants';
import Empty from "@/pages/Component/Form/Empty";

export default class UserTab extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      data: this.handleData(this.props),
      page: 0,
      pageSize: 10
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data.length>0) {
      this.setState({
        data: this.handleData(nextProps)
      });
    } else {
      this.setState({
        data: []
      });
    }
  }

  componentDidMount() {

  }

  handleData = (props) => {
    const { data } = props;

    if (Array.isArray(data)) {
      data.map(item => {
        item['key'] = item.uuid;
      });
      return data;
    } else {
      return [];
    }
  }

  getPageData = () => {
    const { page, pageSize } = this.state;
    const data = this.props.data;
    let pageData = [];
    let end = (page + 1) * pageSize;
    if (data.length < end) {
      end = data.length;
    }
    for (let i = page * pageSize; i < end; i++) {
      pageData.push(data[i]);
    }
    const pagination = {
      total: data.length,
      pageSize: pageSize,
      current: page + 1,
      showTotal: total => `共 ${total} 条`,
    }

    return {
      list: pageData,
      pagination: pagination
    };
  }

  onSave = (data) => {
    const { dispatch, user } = this.props;

    return new Promise((resolve, reject) => {
      if (!data.user) {
        resolve({
          success: false,
          message: '员工不能为空。'
        })
        return;
      }

      dispatch({
        type: 'team/modifyClassGroupUser',
        payload: data,
        callback: response => {
          if (response && response.success) {
            resolve({
              success: true,
              message: commonLocale.saveSuccessLocale
            })
            this.props.refresh();
          } else {
            resolve({
              success: false
            })
            return;
          }
        }
      })
    })
  }

  addNew = () => {
    let newData = {
      uuid: '',
      classGroupUuid: this.props.entityUuid,
    };
    const { data } = this.state;
    data.push(newData);
    this.setState({
      data: data
    });
    return newData;
  }

  onRemove = (record) => {
    const { dispatch } = this.props;

    return new Promise(function (resolve, reject) {
      if (!record.uuid || record.uuid.indexOf('NEW_TEMP_ID') > -1) {
        resolve({
          success: true
        })
        return;
      }

      dispatch({
        type: 'team/deleteClassGroupUser',
        payload: record.uuid,
        callback: response => {
          if (response && response.success) {
            resolve({
              success: true,
              message: commonLocale.removeSuccessLocale
            })
            return;
          } else {
            resolve({
              success: false
            })
            return;
          }
        }
      });
    });
  }

  onFieldChange = (fieldName, e, target) => {
    if (fieldName === 'userCode') {
      target.user = JSON.parse(e);
    }
  }

  render() {
    const columns = [{
      title: commonLocale.codeLocale,
      width: itemColWidth.articleColWidth,
      componentName: 'TeamUserSelect',
      placeholder: '选择用户',
      dataIndex: 'userCode',
      key: 'uuid',
      render: loginOrg().type !== orgType.dispatchCenter.name ? (text, record) => {
        return record.user? record.user.code : '';
      } : ''
    }, {
      title: commonLocale.nameLocale,
      width: itemColWidth.articleColWidth,
      render: (text, record) => {
        return record.user? record.user.name : '';
      }
    },];

    const editTableProps = {
      columns: columns,
      onSave: this.onSave,
      value: this.state.data,
      addNew: this.addNew,
      onRemove: this.onRemove,
      onFieldChange: this.onFieldChange,
      noAddAndDelete: loginOrg().type !== orgType.dispatchCenter.name,
      editEnable: loginOrg().type === orgType.dispatchCenter.name,
    };
    return <EditTable {...editTableProps} />
  }
}
