import moment from 'moment';
import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Modal, Form,Tabs,Row,Col } from 'antd';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName, convertDateToTime,formatDate } from '@/utils/utils';
import Empty from '@/pages/Component/Form/Empty';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { SuperType,SHELFLIFE_TYPE,STATE } from './SuperManagementBoardContants';
import { SuperManagementBoardLocale } from './SuperManagementBoardLocale';
import styles from './SuperManagementBoard.less';

const { TabPane } = Tabs;

const FormItem = Form.Item;

@Form.create()
export default class SuperManagementBoardViewPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isViewVisible: props.isViewVisible,
      entity: props.entity,
    }
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.isViewVisible!=this.props.isViewVisible){
      this.setState({
        isViewVisible:nextProps.isViewVisible,
        entity:nextProps.entity,
      })
    }
  }

  drawInfo = ()=>{
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    return(
      <Form className={styles.form}>
        <Row>
          <Col span={12}>
            <FormItem label={commonLocale.articleLocale} 
              {...baseFormItemLayout}
            >
              {getFieldDecorator('articleView')(
                  entity &&entity.article ? <span>{convertCodeName(entity.article)}</span>:<Empty/>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.shelf}>
              {getFieldDecorator('shelfLifeDaysView')(
                  entity&&entity.shelfLifeDays?<span>{entity.shelfLifeDays}</span>:<Empty/>
              )}
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.shelfType}>
              {getFieldDecorator('shelfLifeTypeView')(
                  entity&&entity.shelfLifeType?<span>{SHELFLIFE_TYPE[entity.shelfLifeType].caption}</span>:<Empty/>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.type}>
              {getFieldDecorator('typeView')(
                  entity&&entity.type?<span>{SuperType[entity.type].caption}</span>:<Empty/>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.startDate}>
              {getFieldDecorator('startDateView')(
                  entity&&entity.startDate?<span>{moment(entity.startDate).format('YYYY-MM-DD')}</span>:<Empty/>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.endDate}>
              {getFieldDecorator('endDateView')(
                  entity&&entity.endDate?<span>{moment(entity.endDate).format('YYYY-MM-DD')}</span>:<Empty/>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.oldControlDays}>
              {getFieldDecorator('oldControlDaysView')(
                  entity&&entity.oldControlDays?<span>{entity.oldControlDays}</span>:<Empty/>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem 
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.newControlDays}>
              {getFieldDecorator('newControlDaysView')(
                  entity&&entity.newControlDays?<span>{entity.newControlDays}</span>:<Empty/>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem 
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.operator}>
              {getFieldDecorator('newControlDaysView')(
                  entity&&entity.newControlDays?<span>{entity.lastModifyInfo.operator.fullName}</span>:<Empty/>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem 
              {...baseFormItemLayout}
              label={SuperManagementBoardLocale.operateTime}>
              {getFieldDecorator('newControlDaysView')(
                  entity&&entity.lastModifyInfo?<span>{moment(entity.lastModifyInfo.time).format('YYYY-MM-DD')}</span>:<Empty/>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem 
              {...baseFormItemLayout}
              label={commonLocale.noteLocale}>
              {getFieldDecorator('noteView')(
                  entity&&entity.note?<span>{entity.note}</span>:<Empty/>
              )}
          </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
  render() {
    const { entity } = this.state;
    return (
      <Modal
        title={'详情查看'}
        visible={this.state.isViewVisible}
        destroyOnClose={true}
        onCancel={this.props.onCancel}
        footer={[null]}
        width={800}
      >
        <Tabs defaultActiveKey="1" onChange={this.tabsChangeCallback}>
          <TabPane tab={'信息'} key="1">
            {this.drawInfo()}
          </TabPane>
          <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="2">
            <EntityLogTab entityUuid={this.state.entity.uuid} key={2} />
          </TabPane>
        </Tabs>
    </Modal>
    );

  }
}