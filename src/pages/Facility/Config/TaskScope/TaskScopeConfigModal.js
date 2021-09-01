import React, { PureComponent } from 'react';
import { Form, Input,Table,Button,Modal } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { taskScopeConfigLocale } from './TaskScopeConfigLocale';
import StandardTable from '@/components/StandardTable';
import { TaskType } from './TaskScopeConfigContants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { deliveredConfirmLocale } from '../../../Tms/DeliveredConfirm/DeliveredConfirmLocale';
import { OrderType } from '../../../Tms/DeliveredConfirm/DeliveredConfirmContants';

@Form.create()
class TaskScopeConfigModal extends PureComponent {
  // static propTypes = {
  //     handleSave: PropTypes.func,
  //     createModalVisible: PropTypes.bool,
  //     confirmLoading: PropTypes.bool,
  //     entity:PropTypes.object,
  //     tableLoading:PropTypes.object,
  //     onCancle:PropTypes.func,
  //     columns:PropTypes.array
  //   }

  constructor(props) {
    super(props);
    this.state = {
      entity:this.props.entity,
    }

  }

  existsOrAdd = () => {
    const { entity } = this.state;
    let newOrderNo = entity.taskConfigs.length;
    let willAddConfigs = [];

    if (length === Object.keys(TaskType).length) {
      return willAddConfigs;
    }

    Object.keys(TaskType).forEach(function (key) {
      let index = entity.taskConfigs.findIndex(function (value) {
        return value.taskType === key;
      })
      if (index < 0) {
        newOrderNo++;
        willAddConfigs.push(
          {
            taskType: key,
            orderNo: newOrderNo
          }
        );
      }
    });
    return willAddConfigs;
  }

  okHandle = () => {
    const { form, stockOrder, handleSave,onCancle,selectedSchme,} = this.props;
    let {dataSource,entity}=this.state;
    // console.log(dataSource,'entity');
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...entity,
        ...fieldsValue
      };
      handleSave(data);
      onCancle();
    });
  };

  handleCancel = () => {
    const { form, onCancle } = this.props;
    onCancle();
    form.resetFields();
  };
  onChange = (e, orderNo, field) => {

    const { entity } = this.state;
    if (field === 'binRange') {
      const { value } = e.target;
      let config = entity.taskConfigs.find(item => item.orderNo === orderNo);
      config.binRange = value;
    }
    this.setState({
      entity: { ...entity }
    })
  }
  columns = [
    {
      title: taskScopeConfigLocale.orderNo,
      dataIndex: 'orderNo',
      key: 'orderNo',
      align: 'center',
      width: itemColWidth.lineColWidth + 20
    },
    {
      title: taskScopeConfigLocale.taskType,
      dataIndex: 'taskType',
      key: 'taskType',
      width: colWidth.enumColWidth,
      render: (val) => {
        return TaskType[val].caption
      }
    },
    {
      title: taskScopeConfigLocale.binRange,
      dataIndex: 'binRange',
      key: 'binRange',
      width: colWidth.sourceBillNumberColWidth,
      render: (val, record) => {
        return <Input style={{width:'80%'}} onChange={(e) => this.onChange(e, record.orderNo, 'binRange')} value={val} />
      }
    }
  ];
  render(){
    const {
      form,
      createModalVisible,
      confirmLoading,
      tableLoading,
      columns
    } = this.props;
    let {entity}=this.state;

    let title = '新建高叉员';
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { getFieldDecorator } = this.props.form;
    let  dataSource = entity.taskConfigs;
    // dataSource.forEach(item =>{
    //   item.binRange = ''
    // });
    return (
      <Modal
        title={title}
        visible={createModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form {...formItemLayout}>
            {entity && <Form.Item label={taskScopeConfigLocale.tasker}>
              {getFieldDecorator('tasker', {
                initialValue: entity.tasker ? JSON.stringify(entity.tasker) : undefined,
                rules: [{ required: true, message: notNullLocale(taskScopeConfigLocale.tasker) }],
              })(
                <UserSelect single placeholder={placeholderLocale(taskScopeConfigLocale.taskerCodeAndName)} autoFocus/>
              )}
            </Form.Item>}
          </Form>
          {/* <div style={{borderRadius:4,border:'1px solid #EAECF1'}}> */}
          <StandardTable unShowRow loading={tableLoading} rowKey={record => record.orderNo} dataSource={dataSource} columns={this.columns} noPagination comId={'config.create.table'} />
          {/* </div> */}
        </div>
      </Modal>
    );
  }
}
export default TaskScopeConfigModal;
