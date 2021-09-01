import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginOrg, loginUser } from '@/utils/LoginContext';
import { Avatar, Menu, Dropdown, Tag, Row, Form, Input, Button, message, List,Spin } from 'antd';
import homeUserSvg from '@/assets/common/ic_homeuser.svg';
import timeSvg from '@/assets/common/ic_time.svg';
import downSvg from '@/assets/common/ic_down.svg';
import openSvg from '@/assets/common/ic_open.svg';
import moreSvg from '@/assets/common/ic_more.svg';
import replySvg from '@/assets/common/ic_reply.svg';
import fileSvg from '@/assets/common/ic_file.svg';
import styles from './Notice.less';
import { commonLocale, placeholderLocale, tooLongLocale } from '@/utils/CommonLocale';
import { noticeLocale } from './NoticeLocale';
import NoticeDetailContent from './NoticeDetailContent';
import TextArea from 'antd/lib/input/TextArea';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import configs from '@/utils/config';
import { isBlank } from '@/utils/utils';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';


const FormItem = Form.Item;
const ButtonGroup = Button.Group;

@connect(({ notice, loading }) => ({
  notice,
  loading: loading.models.notice,
}))
class NoticeItem extends PureComponent {
  state = {
    currentNotice:{}
  };

  componentDidMount() {
    this.getNotice(this.props.currentNoticeUuid).then(res=>{
      this.props.dispatch({
        type: 'unRead/getUnReadedNotice'
      });
      this.props.dispatch({
        type: 'unRead/getUnReadedReplition'
      });
    });
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.notice.currentNotice&&nextProps.notice.currentNotice!=this.props.currentNotice){
      this.setState({
        currentNotice:nextProps.notice.currentNotice
      })
    }
    if(nextProps.currentNoticeUuid!=this.props.currentNoticeUuid){
      this.getNotice(nextProps.currentNoticeUuid).then(res=>{
        this.props.dispatch({
          type: 'unRead/getUnReadedNotice'
        });
        this.props.dispatch({
          type: 'unRead/getUnReadedReplition'
        });
      })
    }
  }

  /**
   * 查询具体通知对应详情
   */
  getNotice = (uuid)=>{
    const { dispatch } = this.props;

    return new Promise(function(resolve,reject){
      dispatch({
        type: 'notice/getNotice',
        payload: {
          uuid: uuid,
          userUuid: loginUser().uuid,
          orgUuid: loginOrg().uuid
        },
        callback:response=>{
          if(response.success){
            resolve({ success: response.success });
          }
        }
      });
    });
  }

  /**
   * 取消回复
   *  */
  cancleReply = (index) => {
    document.getElementById(index).style.display = 'none';
  }

  /**
   * 回复评论
   */
  reply = (item, index) => {
    document.getElementById(index).style.display = 'block';
  }

  /**
   * 提交回复
   */
  comment = e => {
    e.preventDefault();
    let { currentNotice } = this.props.notice;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let comments = values.replitionContent;
        if (comments == null || comments === '' || comments.length >= 255) {
          message.error(noticeLocale.itemTextValide);
          return;
        }
        this.props.dispatch({
          type: 'notice/saveReplition',
          payload: {
            noticeUuid: currentNotice.uuid,
            content: values.replitionContent,
            replyer: {
              uuid: loginUser().uuid,
              code: loginUser().code,
              name: loginUser().name
            },
            replyOrg: {
              uuid: loginOrg().uuid,
              code: loginOrg().code,
              name: loginOrg().name
            },
            replyToEr: currentNotice.publisher
          }
        });
      }
    });
    this.props.form.resetFields();
    var aa = document.getElementsByClassName("replyContainer");//获取到的是一个类数组
    for (var i = 0; i < aa.length; i++) {
      aa[i].style.display = "none";
    }
  };


  /**
   * 提交回复评论
   */
  confirmReply = (item,e) => {

    e.preventDefault();
    this.props.form.validateFields((err, values) => {

      if (!err) {
        let comments = values.comment;
        if (comments == null || comments === '' || comments.length >= 255) {
          message.error(noticeLocale.itemTextValide);
          return;
        }

        this.props.dispatch({
          type: 'notice/saveReplition',
          payload: {
            noticeUuid: values.noticeUuid,
            content: values.comment,
            replyer: {
              uuid: loginUser().uuid,
              code: loginUser().code,
              name: loginUser().name
            },
            replyOrg: {
              uuid: loginOrg().uuid,
              code: loginOrg().code,
              name: loginOrg().name
            },
            replyToEr: {
              uuid: item.replyer.uuid,
              code: item.replyer.code,
              name: item.replyer.name
            }
          }
        });
        this.props.form.resetFields();
        var aa = document.getElementsByClassName("replyContainer");//获取到的是一个类数组
        for (var i = 0; i < aa.length; i++) {
          aa[i].style.display = "none";
        }
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { currentNotice } = this.state;

    // 未阅读
    let unReadItems = [];
    let unReadCount = 0;
    if (currentNotice && currentNotice.unReadedUser) {
      unReadItems.push(<Menu.Item key='un'>{noticeLocale.itemUnReaded}</Menu.Item>);
      for (var key in currentNotice.unReadedUser) {
        unReadCount++;
        unReadItems.push(
          <Menu.Item key={key}>
            <Avatar size='small' src={!isBlank(currentNotice.unReadedUser[key])?currentNotice.unReadedUser[key]:configs[API_ENV]['avatar.default.url']} />&nbsp;
            <EllipsisCol colValue={key} />
          </Menu.Item>
        );
      }
    }

    // 已阅读
    let hasReadItems = [];
    let hasReadCount = 0;
    if (currentNotice && currentNotice.hasReadedUser) {
      hasReadItems.push(<Menu.Divider key='1' />);
      hasReadItems.push(<Menu.Item key='has'>{noticeLocale.itemHasReaded}</Menu.Item>);
      for (var key in currentNotice.hasReadedUser) {
        hasReadCount++;
        hasReadItems.push(
          <Menu.Item key={key}>
            <Avatar size='small' src={!isBlank(currentNotice.hasReadedUser[key])?currentNotice.hasReadedUser[key]:configs[API_ENV]['avatar.default.url']} />&nbsp;
            <EllipsisCol colValue={key} />
          </Menu.Item>
        );
      }
    }
    // 已读未读菜单
    const readMenu = (
      <Menu style={{ width: '220px',height:'500px',overflowX:'hidden',overflowY:'auto',marginRight:'-20px' }}>
        {unReadItems}
        {hasReadItems}
      </Menu>
    );
    let fileItems = [];
    if (currentNotice.attachments) {
      for (let key in currentNotice.attachments) {
        fileItems.push(<Menu.Item key={currentNotice.attachments[key]}><a href={currentNotice.attachments[key]}>{`${key}`}</a></Menu.Item>)
      }
    } else {
      fileItems.push(<Menu.Item key={'0'}>{noticeLocale.itemNoAttachment}</Menu.Item>);
    }
    const downlandMenu = (
      <Menu style={{ width: '140px' }}>
        {fileItems}
      </Menu>
    );

    // 显示回复他人的评论
    const showReplyPage = (item, index) => {
      return (
        <div style={{ display: 'none' }} id={parseInt(index)} className='replyContainer'>
          <Form onSubmit={this.confirmReply.bind(this,item)} style={{ marginTop: 4 }} key={index}>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('noticeUuid', {
                initialValue: item.noticeUuid,
              })}
            </FormItem>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('replyerUuid', {
                initialValue: item ? item.replyer.uuid : null,
              })}
            </FormItem>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('replyerCode', {
                initialValue: item ? item.replyer.code : null,
              })}
            </FormItem>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('replyerName', {
                initialValue: item ? item.replyer.name : null,
              })}
            </FormItem>
            <div>
              <FormItem style={{ float: 'left', width: '165px' }}>
                {
                  getFieldDecorator('comment', { initialValue: '' })(
                    <Input placeholder={placeholderLocale(noticeLocale.itemReply)}
                      size='small' style={{ width: '165px' }} />
                  )
                }
              </FormItem>
              <FormItem style={{ float: 'right', width: '100px' }}>
                <Button type="primary" size='small' htmlType="submit">
                  {noticeLocale.itemReply}
                </Button>
                <Button onClick={() => this.cancleReply(index)} size='small'>
                  {commonLocale.cancelLocale}
                </Button>
              </FormItem>
            </div>
          </Form>
        </div>
      );
    }
    
    // 页面
    return (<Spin spinning={this.props.loading} indicator={LoadingIcon('default')}>
      <div id='test' style={{ marginTop: '-10px' }}>
        <div id='itemCard' style={{ 'marginBottom': '20px' }}>
          <div>
            <Tag color="#3B77E3">{currentNotice.type}</Tag>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{currentNotice.title}</span>
          </div>
          <div className={styles.publish}>
            <div style={{ marginTop: '10px', marginBottom: '10px' }}>
              <span>
                <img src={homeUserSvg} style={{position: 'relative', top: '-2px', marginRight: '5px'}} />
                <span>{currentNotice.publisher?currentNotice.publisher.name:''}</span>
              </span>
              <span style={{ marginLeft: '20px' }}>
                <img src={timeSvg} style={{position: 'relative', top: '-2px', marginRight: '5px'}} />
                <span>{currentNotice.publishTime}</span>
              </span>
              <span style={{ float: 'right' }}>
                <Dropdown overlay={readMenu} trigger={['click']}>
                  <div>
                    <a style={{ color: '#7F8FA4' }}>{noticeLocale.itemReadedCount}:</a>
                    {currentNotice.hasReadedUser ? hasReadCount : 0}
                    /
                    {(currentNotice.unReadedUser ? unReadCount : 0) + (currentNotice.hasReadedUser ? hasReadCount : 0)}
                    <img src={downSvg} style={{marginBottom:'5px'}}/>
                  </div>
                </Dropdown>
              </span>
            </div>
          </div>
          <NoticeDetailContent content={currentNotice.content} />
          {currentNotice.attachments ? (
            <Dropdown overlay={downlandMenu} >
              <ButtonGroup className={styles.downland}>
                <Button style={{ width: '114px' }} >
                  <img src={fileSvg} style={{ marginLeft: '-20px' }} />&nbsp;
                  {noticeLocale.itemDownload}
                </Button>
                <Button style={{ width: '18px' }}>
                  <img style={{ transform: 'rotate(90deg)', marginLeft: '-5px' }} src={moreSvg} />
                </Button>
              </ButtonGroup>
            </Dropdown>
          ) : null}
        </div>
        <div style={{ 'borderBottom': '1px solid #e8e8e8' }}></div>
        <div id='replyCard' style={{ marginTop: '20px' }}>
          {currentNotice.canReply ? (
            <Form onSubmit={this.comment}>
              <Row>
                <FormItem>
                  {
                    getFieldDecorator('replitionContent', {
                      rules: [ {
                        max: 255, message: tooLongLocale(commonLocale.noteLocale,255),
                      }],
                      initialValue: '',
                    })(
                      <TextArea style={{ height: '95px'}} placeholder={placeholderLocale(noticeLocale.itemReply)} />
                    )
                  }
                </FormItem>
              </Row>
              <Row style={{ textAlign: 'right'}}>
                <Button type="primary" htmlType="submit">
                  {noticeLocale.itemReply}
                </Button>
              </Row>
            </Form>
          ) : null}
          <div style={{ color: '#7F8FA4', fontSize: '14px', marginTop: '20px' }}>{formatMessage({ id: 'common.pagination.tag.total' })}{currentNotice.replitions ? currentNotice.replitions.length : 0} {formatMessage({ id: 'common.pagination.tag.records' })} {noticeLocale.itemReply}</div>
          {currentNotice.replitions ? (
            <div style={{ height: '230px', overflow: 'auto' }}>
              <List
                itemLayout="horizontal"
                dataSource={currentNotice ? currentNotice.replitions : null}
                renderItem={(item, index) => (
                  <List.Item key={item.index}>
                    <div style={{ clear: 'both', width: '100%' }}>
                      <List.Item.Meta
                        avatar={<Avatar src={!isBlank(item.avatar)?item.avatar:configs[API_ENV]['avatar.default.url']} />}
                        title={item.replyer.name + ':'}
                        description={
                          <div>
                            {item.content}
                            {showReplyPage(item, index)}
                          </div>
                        }
                      />
                      <div style={{ width: '50%' }}></div>
                    </div>
                    <div style={{ clear: 'both', float: 'right' }}>
                      <div style={{ textAlign: 'right',width:'300px'}}>{item.replyTime}</div>
                      <div style={{ float: 'right', color: '#3B77E3' }}>
                        <img src={replySvg} />&nbsp;
                        <a onClick={() => this.reply(item, index)}>{noticeLocale.itemReply}</a>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ) : null
          }
        </div>
      </div></Spin>
    );
  }
}

export default Form.create()(NoticeItem);
