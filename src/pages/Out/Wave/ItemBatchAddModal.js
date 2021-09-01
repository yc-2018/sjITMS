import { connect } from 'dva';
import { PureComponent } from "react";
import moment from 'moment';
import { Modal,Form,Input,Button,Col,Row,Table,Select,Drawer,DatePicker,message } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { confirmLocale, cancelLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import SearchPanel from '@/pages/Component/Page/inner/SearchPanel';
import SearchForm from '@/pages/Component/Form/SearchForm';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { waveBillLocale } from '@/pages/Out/Wave/WaveBillLocale';
import { alcNtcLocale } from '@/pages/Out/AlcNtc/AlcNtcLocale';
import { SchedulingType, State } from '@/pages/Out/AlcNtc/AlcNtcContants';
import { WaveBillState,WaveAlcNtcItemState,LogisticMode } from '@/pages/Out/Wave/WaveBillContants';
import AlcNtcBillNumberSelect from '@/pages/Out/Wave/AlcNtcBillNumberSelect';
import StandardTable from '@/components/StandardTable';
import styles from './ItemBatchAddModal.less';
import WaveWeeksSelect from '@/pages/Component/Select/WaveWeeksSelect';
@Form.create()
@connect(({ alcNtc,deliverycycle,pretype, loading }) => ({
  alcNtc, deliverycycle, pretype,
  loading: loading.models.alcNtc,
}))
export default class ItemBatchAddModal extends PureComponent {
  state = {
    alcNtcBillList:[],
    fieldsValue:{},
    selectedRowKeys: [],
    waveList:[],
    deliveryCycleList: [],
    weeksList: []
  }

  componentWillMount(){
    const { pageFilter } = this.state
    const { dispatch } = this.props;
    dispatch({
      type: 'deliverycycle/getDeliveryCycleList',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
    });
    dispatch({
      type: 'pretype/queryTypeForSecond',
      payload: PRETYPE['deliverycycleType']
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.alcNtc && nextProps.alcNtc.bills != this.props.alcNtc.bills) {
      for (let i = 0; i < nextProps.alcNtc.bills.length;i++){
        if (!nextProps.alcNtc.bills[i].waveBillNumber){
          nextProps.alcNtc.bills[i].state = State.INITIAL.name
        }else{
          nextProps.alcNtc.bills[i].state = State.USED.name
        }
      }
      this.setState({
        alcNtcBillList: nextProps.alcNtc.bills,
      })
    }
    if(nextProps.deliverycycle){
      this.setState({
        deliveryCycleList: nextProps.deliverycycle.cycleList ? nextProps.deliverycycle.cycleList : []
      })
    }
    if (nextProps.pretype) {
      this.setState({
        waveList: nextProps.pretype.namesTwo ? nextProps.pretype.namesTwo : [],
      })
    }
  }

  /**添加 */
  handleOk=()=>{

    if(this.state.selectedRowKeys.length<=0){
			message.warning('请先选择要添加的行');
			return;
		}

    this.props.getAlcNtcBillNumberList(this.state.selectedRowKeys);

    this.setState({
      alcNtcBillList: [],
      selectedRowKeys: [],
    });
    this.props.form.resetFields();
  }
  /**
   * 条件查询
   */
  handleSearch=(e)=>{
    e.preventDefault();
    const { form,dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      const payload = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        billNumber: fieldsValue.alcNtcBillNumber,
      }
      if (this.props.waveBillNumber){
        payload.waveBillNumber = this.props.waveBillNumber
      }
      if (fieldsValue.storeCodes){
        payload.storeCodes = fieldsValue.storeCodes
      }
      if (fieldsValue.groupNames){
        payload.groupNames = fieldsValue.groupNames
      }
      if (fieldsValue.deliveryCycleCode){
        payload.deliveryCycleCode = JSON.parse(fieldsValue.deliveryCycleCode).code;
      }
      if (fieldsValue.wave) {
        payload.wave = fieldsValue.wave
      }
      if (fieldsValue.owner) {
        payload.ownerUuid = JSON.parse(fieldsValue.owner).uuid
      }

      if (fieldsValue.type) {
        payload.type = fieldsValue.type
      }

      if (fieldsValue.alcDate) {
        payload.alcDate = moment(fieldsValue.alcDate).format("YYYY-MM-DD")
      }

      if (fieldsValue.weeks) {
        payload.weeks = fieldsValue.weeks
      }

      this.props.dispatch({
        type: 'alcNtc/getWaveAlcNtcBills',
        payload: {...payload}
      });
    });
  }

  /**重置搜索条件 */
  reset = () => {
    this.setState({
      fieldsValue:{},
      selectedRowKeys: [],
    })
    this.props.form.resetFields();
  }

  /**
   * 控制弹出框展示
   */
  handlebatchAddVisible=()=>{
    this.setState({
      alcNtcBillList:[],
      selectedRowKeys: [],
    });
    this.props.form.resetFields();
    this.props.handlebatchAddVisible();
  }

  /**
   * 获取选中行
   */
  handleRowSelectChange = (keys,rows) => {
    this.setState({
      selectedRowKeys: keys,
    })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectedRowKeys,fieldsValue,alcNtcBillList,waveList,deliveryCycleList,weeksList} = this.state
     let alcNtcCols = [
      {
        title: commonLocale.billNumberLocal,
        key: 'billNumber',
        dataIndex: 'billNumber',
        width: colWidth.billNumberColWidth+50,
        render: (val,record) =>
        <span>
          <a>{val}</a>
        </span>
      },
       {
         title: alcNtcLocale.sourceBillNumber,
         key: 'sourceBillNumber',
         dataIndex: 'sourceBillNumber',
         width: colWidth.enumColWidth,
         render: text => <EllipsisCol colValue={text} />
       },
      {
        title: waveBillLocale.alcNtcType,
        key: 'type',
        dataIndex: 'type',
        width: colWidth.enumColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: '调度类型',
        key: 'schedulingType',
        dataIndex: 'schedulingType',
        width: colWidth.enumColWidth,
        render: text => <EllipsisCol colValue={SchedulingType[text].caption} />
      },
      {
        title: waveBillLocale.store,
        dataIndex: 'store',
        key: 'store',
        width: colWidth.codeNameColWidth,
        render: text => <EllipsisCol colValue={convertCodeName(text)} />
      },
      {
        title: commonLocale.ownerLocale,
        dataIndex: 'owner',
        key: 'owner',
        width: colWidth.codeNameColWidth,
        render: text => <EllipsisCol colValue={convertCodeName(text)} />
      },
      {
        title: waveBillLocale.alcDate,
        dataIndex: 'alcDate',
        key: 'alcDate',
        render: val => moment(val).format("YYYY-MM-DD"),
        width: colWidth.dateColWidth,
      },
      {
        title: commonLocale.inAllVolumeLocale,
        dataIndex: 'totalVolume',
        key: 'totalVolume',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.inAllWeightLocale,
        dataIndex: 'totalWeight',
        key: 'totalWeight',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.inAllQtyStrLocale,
        dataIndex: 'totalQtyStr',
        key: 'totalQtyStr',
        width: itemColWidth.qtyColWidth,
      },
      {
        title: commonLocale.stateLocale,
        dataIndex: 'state',
        key: 'state',
        width: colWidth.enumColWidth,
        render: (text, record) => {
          return <span>{record.state?WaveAlcNtcItemState[record.state].caption:null}</span>
        }
      },
      {
        title: "组别",
        dataIndex: 'groupName',
        key: 'groupName',
        width: colWidth.enumColWidth,
      },
       {
         title: commonLocale.noteLocale,
         dataIndex: 'note',
         key: 'note',
         width: colWidth.enumColWidth
       },
    ];

    alcNtcCols.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        }
      }
    });

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };

    const waveOptions=[];
    const deliveryCycleOptions=[];
    const waveWeeksOptions=[];
    waveOptions.push(<Select.Option key='' value=''> 全部 </Select.Option>);
    waveList.map(item=>{
      waveOptions.push(
          <Select.Option value={item} key={item}>
            {item}
          </Select.Option>
        );
    });
    weeksList.map(item=>{
      waveOptions.push(
        <Select.Option value={item} key={item}>
          {item}
        </Select.Option>
      );
    });
    deliveryCycleOptions.push(<Select.Option key='' value=''> 全部 </Select.Option>);
    if (deliveryCycleList&&deliveryCycleList.length > 0) {
      deliveryCycleList.map(item=>{
      var UCN={
        uuid:item.uuid,
        code:item.code,
        name:item.name,
      }
      deliveryCycleOptions.push(
          <Select.Option value={JSON.stringify(UCN)} key={item.uuid}>
            {convertCodeName(UCN)}
          </Select.Option>
        );
    });
    }

    return (
      <Drawer
        title="批量添加"
        placement="right"
        closable={false}
        onClose={this.handlebatchAddVisible}
        visible={this.props.visible}
        width='85%'
      >
        <div className={styles.formItems} style={{marginTop:'20px'}}>
          <Form onSubmit={this.handleSearch}>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={8} sm={24}>
                <Form.Item key="alcNtcBillNumber" label={commonLocale.billNumberLocal}>
                  {
                    getFieldDecorator('alcNtcBillNumber', {
                        initialValue: fieldsValue.alcNtcBillNumber
                      })(
                      <Input placeholder={placeholderLocale(waveBillLocale.alcBillNumber+'或'+alcNtcLocale.sourceBillNumber)}/>
                  )}
                </Form.Item>
              </Col>
              <Col md={8} sm={24}>
                <Form.Item key="type" label={waveBillLocale.alcNtcType}>
                  {
                    getFieldDecorator('type', {
                        initialValue: fieldsValue.type ? fieldsValue.type : ''
                      })(
                      <PreTypeSelect placeholder={placeholderChooseLocale(waveBillLocale.alcNtcType)}
                        preType={PRETYPE.alcNtcType} hasAll/>
                  )}
                </Form.Item>
              </Col>
              <Col md={8} sm={24}>
                <Form.Item key="owner" label={commonLocale.inOwnerLocale}>
                  {
                    getFieldDecorator('owner',
                      { initialValue: fieldsValue.owner?fieldsValue.owner:'' }
                    )(
                      <OwnerSelect hasAll/>)
                  }
                </Form.Item>
              </Col>

              <Col md={8} sm={24}>
                <Form.Item key="deliveryCycleCode" label={waveBillLocale.deliverycycle}>
                  {
                    getFieldDecorator('deliveryCycleCode',
                    { initialValue: fieldsValue.deliveryCycleCode?fieldsValue.deliveryCycleCode:'' }
                    )(
                      <Select  initialValue='' placeholder={placeholderChooseLocale(waveBillLocale.deliverycycle)}>
                        {deliveryCycleOptions}
                      </Select>
                    )
                  }
                </Form.Item>
              </Col>

              <Col md={8} sm={24}>
                <Form.Item key="weeks" label={waveBillLocale.waveWeeks}>
                  {
                    getFieldDecorator('weeks',
                      { initialValue: fieldsValue.weeks ? fieldsValue.weeks : [] }
                    )(
                      <WaveWeeksSelect mode='multiple' style={{width:'100%'}} placeholder={placeholderChooseLocale(waveBillLocale.waveWeeks)}/>
                    )
                  }
                </Form.Item>
              </Col>

              <Col md={8} sm={24}>
                <Form.Item key="wave" label={waveBillLocale.waveNumber}>
                  {
                    getFieldDecorator('wave',
                      { initialValue: fieldsValue.wave?fieldsValue.wave:'' }
                    )(
                      <Select initialValue='' style={{width:'100%'}} placeholder={placeholderChooseLocale(waveBillLocale.waveNumber)}>
                        {waveOptions}
                      </Select>
                    )
                  }
                </Form.Item>
              </Col>

              <Col md={8} sm={24}>
                <Form.Item key="storeCodes" label={waveBillLocale.store}>
                  {
                    getFieldDecorator('storeCodes',
                    { initialValue: fieldsValue.storeCodes?fieldsValue.storeCodes:'' }
                    )(
                      <Input placeholder={placeholderLocale('包含的门店')}/>)
                  }
                </Form.Item>
              </Col>

              <Col md={8} sm={24}>
                <Form.Item key="alcDate" label={waveBillLocale.alcDate}>
                  {
                    getFieldDecorator('alcDate',
                    { initialValue: fieldsValue.alcDate?fieldsValue.alcDate:'' }
                    )(
                      <DatePicker style={{width:'100%'}} placeholder={placeholderLocale(waveBillLocale.alcDate)} />)
                  }
                </Form.Item>
              </Col>

              <Col md={8} sm={24}>
                <Form.Item key="groupNames" label="组别">
                  {
                    getFieldDecorator('groupNames',
                    { initialValue: fieldsValue.storeCodes?fieldsValue.storeCodes:'' }
                    )(
                      <Input placeholder={placeholderLocale('包含的组别')}/>)
                  }
                </Form.Item>
              </Col>

              <Col md={24} sm={24}>
                <div style={{float:"right"}}>
                  <Button type="primary" htmlType="submit" loading = {this.props.loading}>
                    查询
                  </Button>
                  <Button style={{ marginLeft: 12, background: '#516173', color: '#FFFFFF' }} onClick={this.reset}>
                    重置
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
        <div>
          <StandardTable
            noPagination={true}
            selectedRows={selectedRowKeys}
            rowKey={record => record.uuid}
            data={{list:alcNtcBillList}}
            columns={alcNtcCols}
            onSelectRow={this.handleRowSelectChange}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 10,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '0.5px 16px',
            background: '#fff',
            textAlign: 'right',
            paddingTop:'10px'
          }}
        >
          <Button onClick={this.handlebatchAddVisible} style={{ marginRight: 8 }}>
            {commonLocale.cancelLocale}
          </Button>
          <Button onClick={this.handleOk} type="primary">
            添加
          </Button>
        </div>
      </Drawer>
    );
  }
}
