import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber, Popconfirm } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale, notNullLocale, placeholderLocale, tooLongLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { havePermission } from '@/utils/authority';
import SearchPage from '@/pages/Component/Page/SearchPage';
import CFormItem from '@/pages/Component/Form/CFormItem';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import Note from '@/pages/Component/Form/Note';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { DOCKGROUP_RES } from './DockPermission';
import { dockLocale } from './DockLocale';
import DockGroupSearchForm from './DockGroupSearchForm';
import OperateCol from '@/pages/Component/Form/OperateCol';
import Empty from '@/pages/Component/Form/Empty';
const FormItem = Form.Item;
@connect(({ dock, loading }) => ({
  dock,
  loading: loading.models.dock,
}))
@Form.create()
export default class DockGroupSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      unShowRow: true,
      title: dockLocale.dockGroup,
      data: props.dock.dockGroupData,
      showModal: false,
      entityUuid: '',
      currentEntity: {},
      modalLoading: false
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    if (!this.state.pageFilter.likeKeyValues.dockGroupCodeNameLike)
      this.state.pageFilter.likeKeyValues.dockGroupCodeNameLike = '';
  }
  componentDidMount() {
    this.refreshTable();
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dock.dockGroupData,
      entity: {}
    });
  }
  componentWillUnmount() {
    if (this.props.pathname) {
      let pathname = this.props.pathname;
      let namespace = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);
      if (this.props[namespace]) {
        this.props[namespace].showPage = 'query'
      }
    }
  }
  onBack = () => {
    this.props.dispatch({
      type: 'dock/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  onCreate = (uuid, callback) => {
    if (uuid) {
      this.props.dispatch({
        type: 'dock/getDockGroup',
        payload: uuid,
        callback: callback ? callback : (response) => {
          if (response && response.success) {
            if (!response.data) {
              this.refreshTable();
              return;
            }
            this.setState({
              showModal: true,
              currentEntity: response.data
            });
          }
        }
      });
    } else {
      this.setState({
        showModal: true,
        currentEntity: {}
      });
    }
  }
  onRemove = (record, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dock/deleteDockGroup',
      payload: record,
      callback: callback ? callback : (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.removeSuccessLocale);
        }
      }
    });
  }
  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.likeKeyValues = {
        ...pageFilter.likeKeyValues,
        ...data
      },
        pageFilter.searchKeyValues = {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
        pageFilter.likeKeyValues = {
          dockGroupCodeNameLike: ''
        }
    }
    this.refreshTable();
  }
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'dock/queryDockGroup',
      payload: queryFilter,
    });
  };
  drawActionButton = () => {
    return (
      <Fragment>
        <Button disabled={!havePermission(DOCKGROUP_RES.CREATE)} icon="plus" type="primary" onClick={() => this.onCreate(null)}>
          {commonLocale.createLocale}
        </Button>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
      </Fragment>
    );
  }
  drawSearchPanel = () => {
    return <DockGroupSearchForm filterValue={this.state.pageFilter.likeKeyValues} refresh={this.onSearch} />;
  }
  fetchOperateProps = (record) => {
    let operateProps = [];
    operateProps.push(
      {
        name: commonLocale.editLocale,
        disabled: !havePermission(DOCKGROUP_RES.EDIT),
        onClick: this.onCreate.bind(this, record.uuid, false)
      }
    );
    operateProps.push(
      {
        name: commonLocale.deleteLocale,
        disabled: !havePermission(DOCKGROUP_RES.DELETE),
        confirm: true,
        confirmCaption: dockLocale.dockGroup,
        onClick: this.onRemove.bind(this, record.uuid, false)
      }
    );
    return operateProps;
  }
  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      width: colWidth.codeColWidth,
    },
    {
      title: commonLocale.noteLocale,
      dataIndex: 'note',
      width: itemColWidth.noteEditColWidth,
      render: val => val?<EllipsisCol colValue={val} />:<Empty/>
    },
    {
      key: 'operate',
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => {
        return <OperateCol menus={this.fetchOperateProps(record)} />
      }
    }
  ];
  handleCancel() {
    this.setState({
      showModal: false,
    });
    this.props.form.resetFields();
  }
  handleOk() {
    this.setState({
      modalLoading: true,
    });
    const { form } = this.props;
    const { currentEntity } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const data = {
        ...currentEntity,
        ...fieldsValue
      };
      let type = 'dock/addDockGroup';
      if (currentEntity.uuid) {
        type = 'dock/modifyDockGroup';
      }
      this.props.dispatch({
        type: type,
        payload: {
          "dcUuid": loginOrg().uuid,
          "companyUuid": loginCompany().uuid,
          ...data
        },
        callback: (response) => {
          if (response && response.success) {
            this.setState({
              showModal: false,
              modalLoading: false,
            });
            this.props.form.resetFields();
            message.success(commonLocale.saveSuccessLocale);
            this.refreshTable();
          } else {
            this.setState({
              modalLoading: false,
            });
          }
        }
      });
    });
  }
  drawOtherCom = () => {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { getFieldDecorator } = this.props.form;
    const { currentEntity } = this.state;
    return (
      <Modal
        title={currentEntity.uuid ? commonLocale.editLocale : commonLocale.createLocale}
        visible={this.state.showModal}
        confirmLoading={this.state.modalLoading}
        onOk={() => this.handleOk()}
        onCancel={() => this.handleCancel()}
        okText={commonLocale.confirmLocale}
        cancelText={commonLocale.cancelLocale}
      >
        <Form>
          <FormItem
            {...baseFormItemLayout}
            key='code'
            label={commonLocale.codeLocale}>
            {getFieldDecorator('code', {
              initialValue: currentEntity ? currentEntity.code : '',
              rules: [
                { required: true, message: notNullLocale(commonLocale.codeLocale) },
                {
                  pattern: codePattern.pattern,
                  message: codePattern.message,
                },
              ]
            })(
              <Input disabled={currentEntity.code ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />
            )}
          </FormItem>
          <FormItem
            {...baseFormItemLayout}
            key='name'
            label={commonLocale.nameLocale}>
            {getFieldDecorator('name', {
              initialValue: currentEntity ? currentEntity.name : '',
              rules: [
                { required: true, message: notNullLocale(commonLocale.nameLocale) },
                {
                  max: 30,
                  message: tooLongLocale(commonLocale.nameLocale, 30)
                },
              ]
            })(
              <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
            )}
          </FormItem>
          <FormItem
            {...baseFormItemLayout}
            key='note'
            label={commonLocale.noteLocale}>
            {getFieldDecorator('note', {
              initialValue: currentEntity ? currentEntity.note : '',
              rules: [
                {
                  max: 255,
                  message: tooLongLocale(commonLocale.noteLocale, 255)
                },
              ]
            })(
              <Input.TextArea rows={4} placeholder={placeholderLocale(commonLocale.noteLocale)} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
