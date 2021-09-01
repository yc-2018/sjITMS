import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import moment from 'moment';
import {
  Form,
  Input,
  Upload,
  Select,
  Button,
  message,
  Row,
  Col,
  Icon,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import styles from './profile.less';
import { loginUser, loginOrg, loginKey, getMenuLayout } from '@/utils/LoginContext';
import configs from '@/utils/config';
import { orgType, getOrgCaption } from '@/utils/OrgType';
import { OSS_UPLOAD_URL } from '@/utils/constants';
import PageLoading from '@/components/PageLoading';

const FormItem = Form.Item;

const allowedImageType = ['image/jpeg', 'image/png', 'image/gif'];

@connect(({ user, loading }) => ({
  user,
  loading: loading.models.user,
}))
@Form.create()
class Profile extends Component {

  state = {
    currentUser: {},
    uploadLoading: false,
    updateLoading: false,
    autoLogin:true,
    userAvatar: '',
    userOrgs: [],
  }

  componentDidMount() {
    this.fetchUserInfo();
  }

  fetchUserInfo = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'user/get',
      payload: loginUser().uuid,
      callback: response => {
        if (response && response.success) {
          let currentUser = response.data;
          if (currentUser) {
            this.setState({
              currentUser: currentUser,
              userOrgs: currentUser.orgs
            })
            if (currentUser.avatar) {
              dispatch({
                type: 'oss/get',
                payload: currentUser.avatar,
                callback: response => {
                  if (response && response.success) {
                    this.setState({
                      userAvatar: response.data,
                    })
                  }
                }
              });
            }
          }
        }
      }
    });
  }

  beforeUpload = (file) => {
    let isImage = false;
    allowedImageType.map(type => {
      if (type === file.type) {
        isImage = true;
      }
    })
    if (!isImage) {
      message.error(formatMessage({ id: 'account.center.setting.avatar.validate.message.notImage' }));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(formatMessage({ id: 'account.center.setting.avatar.validate.message.Limit2M' }));
    }
    return isImage && isLt2M;
  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadLoading: true });
      return;
    }
    if (info.file.status === 'done') {
      this.setState({ uploadLoading: false });
      let key = info.file.response.data;
      this.props.dispatch({
        type: 'oss/get',
        payload: key,
        callback: response => {
          if (response && response.success) {
            let { currentUser } = this.state;
            currentUser.avatar = key;

            this.setState({
              currentUser: currentUser,
              userAvatar: response.data,
            });
            this.updateUser(currentUser, formatMessage({ id: 'account.center.setting.message.success.changeAvatar' }));
          }
        },
      });
    }
  }

  handleSubmit = e => {
    const { dispatch, form } = this.props;
    e.preventDefault();
    this.setState({ updateLoading: true });
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { currentUser } = this.state;
        currentUser.name = values.name;
        currentUser.phone = values.phone;
        this.updateUser(currentUser, formatMessage({ id: 'account.center.setting.message.success.changeBasicInfo' }));
      }
      this.setState({ updateLoading: false })
    });
  }

  /**
   * 更新用户信息
   */
  updateUser = (user, successMessage) => {
    const { userAvatar } = this.state;

    this.props.dispatch({
      type: 'user/onModify',
      payload: user,
      callback: response => {
        if (response && response.success) {
          message.success(successMessage);
          this.setState({
            currentUser: user
          })

          let localUser = {};
          localUser['uuid'] = user.uuid;
          localUser['code'] = user.code;
          localUser['name'] = user.name;
          localUser['phone'] = user.phone;
          localUser['resources'] = user.resources;
          if (userAvatar) {
            localUser['avatar'] = userAvatar;
          } else {
            localUser['avatar'] = configs[API_ENV]['avatar.default.url'];
          }
          localStorage.setItem('user', JSON.stringify(localUser))
          this.fetchUserInfo();
          const that = this;
          that.props.dispatch({
            type: 'setting/changeSetting',
            payload: {
              layout: getMenuLayout(),
            }
          });
        } else {
          message.error(response.message);
        }
      }
    });
  }

  renderUserOrgs = () => {
    const { userOrgs } = this.state;
    let currentOrgUuid = loginOrg() ? loginOrg().uuid : null;
    let orgs = [];
    userOrgs && userOrgs.map((item) => {
      orgs.push(
        <div key={item.orgUuid}>
          {`${getOrgCaption(item.orgType)}: [${item.orgCode}] ${item.orgName}`} &nbsp;
          {currentOrgUuid === item.orgUuid && <span className={styles.selected}>当前</span>}
        </div>
      );
    })

    return orgs;
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    const {
      currentUser,
      uploadLoading,
      updateLoading,
      userAvatar,
    } = this.state;

    const uploadProps = {
      name: "file",
      listType: "picture-card",
      action: configs[API_ENV].API_SERVER + OSS_UPLOAD_URL,
      multiple: false,
      showUploadList: false,
      headers: {
        iwmsJwt: loginKey()
      },
      withCredentials: true,
      beforeUpload: this.beforeUpload,
      onChange: this.handleChange
    }

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
      colon: false,
    };

    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 18,
          offset: 6,
        },
      },
    };

    const uploadButton = (
      <div>
        <Icon type={this.state.uploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">{formatMessage({ id: 'account.center.setting.avatar.tips.add' })}</div>
      </div>
    );

    return (
      <PageHeaderWrapper>
        <Page>
          <NavigatorPanel title={formatMessage({ id: 'account.center.setting.tittle' })} />
          {
            this.props.loading ?
              <PageLoading /> :
              <div className={styles.baseView}>
                <Form onSubmit={this.handleSubmit}>
                  <div className={styles.code}>
                    <Row>
                      <Col className={styles.codeLabel} xs={{ span: 0 }} sm={{ span: 6 }}>
                        <label>{formatMessage({ id: 'account.center.setting.form.item.code' })}</label>
                      </Col>
                      <Col xs={{ span: 24 }} sm={{ span: 18 }}>
                        <span className={styles.codeValue}>{currentUser ? currentUser.code : null}</span>
                      </Col>
                    </Row>
                  </div>
                  <div className={styles.avatar}>
                    <Row>
                      <Col className={styles.avatarLabel} xs={{ span: 0 }} sm={{ span: 6 }}>
                        <label>{formatMessage({ id: 'account.center.setting.form.item.avatar' })}</label>
                      </Col>
                      <Col xs={{ span: 24 }} sm={{ span: 18 }}>
                        <div className={styles.userAvatar}>
                          <Upload
                            {...uploadProps}
                            className={styles.avatarUploader}
                          >
                            {userAvatar ?
                              <div className={styles.avatarImgWrapper}>
                                <img className={styles.avatarImg} src={userAvatar} alt="avatar" />
                                <div className={styles.userAvatarEditorMask}>
                                  <div className={styles.userAvatarEditorMaskInner}></div>
                                  <div className={styles.maskContent}>
                                    <div className={styles.maskInnerText}>
                                      {formatMessage({ id: 'account.center.setting.avatar.tips.update' })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              : uploadButton}
                          </Upload>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <Form.Item {...formItemLayout} label={formatMessage({ id: 'account.center.setting.form.item.name' })}>
                    {getFieldDecorator('name', {
                      rules: [
                        {
                          required: true,
                          message: formatMessage({ id: 'account.center.setting.form.item.name.validate.message.notNull' }),
                        },
                        {
                          max: 30,
                          message: formatMessage({ id: 'account.center.setting.form.item.name.validate.message.limitLength' }),
                        },
                      ],
                      initialValue: currentUser ? currentUser.name : null,
                    })(<Input style={{ width: 300 }} />)}
                  </Form.Item>

                  <FormItem {...formItemLayout} label={formatMessage({ id: 'account.center.setting.form.item.phone' })}>
                    {getFieldDecorator('phone', {
                      rules: [
                        {
                          required: true,
                          message: formatMessage({ id: 'account.center.setting.form.item.phone.validate.message.notNull' }),
                        },
                        { pattern: /^1(3|4|5|7|8)\d{9}$/, message: formatMessage({ id: 'account.center.setting.form.item.phone.validate.message.integrality' }) },
                      ],
                      initialValue: currentUser ? currentUser.phone : null,
                    })(<Input style={{ width: 300 }} />)}
                  </FormItem>

                  <div className={styles.orgs}>
                    <Row>
                      <Col className={styles.orgsLabel} xs={{ span: 4 }} sm={{ span: 6 }}>
                        <label>{formatMessage({ id: 'account.center.setting.form.item.orgs' })}</label>
                      </Col>
                      <Col xs={{ span: 24 }} sm={{ span: 10 }}>
                        <div className={styles.orgsContent} style={{ width: 300 }}>
                          {this.renderUserOrgs()}
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" loading={updateLoading} htmlType="submit">
                      {formatMessage({ id: 'account.center.setting.button.updateInfo' })}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
          }
        </Page>
      </PageHeaderWrapper>
    );
  }
}

export default Profile
