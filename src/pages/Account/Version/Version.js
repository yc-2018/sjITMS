import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Form,
  Row,
  Col,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import PageLoading from '@/components/PageLoading';
import styles from './version.less';
import { versionLocale } from './VersionLocale';
const FormItem = Form.Item;

@connect(({ version, loading }) => ({
  version,
  loading: loading.models.version,
}))
@Form.create()
class Version extends Component {

  state = {
    data: {}
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'version/getOpenapiVersion',
    })
    this.props.dispatch({
      type: 'version/getRfVersion',
    })
    this.props.dispatch({
      type: 'version/getAccountVersion',
    })
    this.props.dispatch({
      type: 'version/getBasicVersion',
    })
    this.props.dispatch({
      type: 'version/getFacilityVersion',
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.version.data,
    });
  }

  render() {
    const {
      form: { getFieldDecorator }} = this.props;

    const {data} = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 15 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 9 },
      },
      colon: false,
    };

    return (
      <PageHeaderWrapper>
        <Page>
          <NavigatorPanel title={versionLocale.title} />
          {
            this.props.loading ?
              <PageLoading /> :
               <div className={styles.baseView}>
                 <Form {...formItemLayout}>
                    <FormItem  label={versionLocale.account}>
                      {getFieldDecorator('account', {
                      })(<Col style={{ width: '200%' }}>{data.account}</Col>)}
                    </FormItem>
                    <FormItem  label={versionLocale.basic}>
                      {getFieldDecorator('basic', {
                      })(<Col style={{ width: '200%' }}>{data.basic}</Col>)}
                    </FormItem>
                    <FormItem  label={versionLocale.facility}>
                      {getFieldDecorator('facility', {
                      })(<Col style={{ width: '200%' }}>{data.facility}</Col>)}
                    </FormItem>
                    <FormItem  label={versionLocale.openapi}>
                      {getFieldDecorator('openapi', {
                      })(<Col style={{ width: '200%' }}>{data.openapi}</Col>)}
                    </FormItem>
                    <FormItem  label={versionLocale.rf}>
                      {getFieldDecorator('rf', {
                      })(<Col style={{ width: '200%' }}>{data.rf}</Col>)}
                    </FormItem>
                 </Form>
              </div>
          }
        </Page>
      </PageHeaderWrapper>
    );
  }
}

export default Version;