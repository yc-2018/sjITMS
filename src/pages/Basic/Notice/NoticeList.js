import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Tag, List, Button ,Menu,Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import { PRETYPE } from '@/utils/constants';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';
import { RESOURCE_IWMS_NOTICE_CREATE, RESOURCE_IWMS_NOTICE_VIEW } from '@/utils/constants';
import fileSvg from '@/assets/common/ic_file.svg';
import SiderPage from '@/pages/Component/Page/SiderPage'
import SearchPanel from '@/components/MyComponent/SearchPanel';
import ArticleListContent from '@/components/ArticleListContent';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';

import { noticeLocale } from './NoticeLocale';
import styles from './Notice.less';
import NoticeCreate from './NoticeCreate';
import NoticeItem from './NoticeItem';
import { NoticeSearchForm } from './NoticeSearchForm';

@connect(({ notice, pretype, loading }) => ({
  notice,
  pretype,
  loading: loading.models.notice,
}))
export default class NoticeList extends SiderPage {
  constructor(props) {
    super(props);
    this.state = {
      title: noticeLocale.titleNew,
      itemExpand: false,
      siderWidth: '49.3%',
      contentStyle:{
        marginLeft:'20px'
      },
      filter: {
        page: 0,
        pageSize: 5,
        searchKeyValues: {
          publisherUuid: loginUser().uuid,
          publishOrgUuid: loginOrg().uuid
        }
      },

      data:{},
      currentNoticeUuid:undefined,
      headCurrent:undefined,// 从Head部分跳转至通知界面时，则设置成true
    };
  }

  componentDidMount() {
   
    this.queryNoticeList();
    this.fetchNoticeTypesByCompanyUuid();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.notice.data.list&&nextProps.notice.data!=this.props.notice.data){
      if(this.state.headCurrent == true){
      this.setState({
        data:nextProps.notice.data,
        currentNoticeUuid:this.state.currentNoticeUuid
      });
      }else{
      this.setState({
        data:nextProps.notice.data,
        currentNoticeUuid:nextProps.notice.data.list[0]?nextProps.notice.data.list[0].uuid:''
      });
      }
    }
    if(nextProps.notice.currentNoticeUuid){
      this.setState({
        currentNoticeUuid:nextProps.notice.currentNoticeUuid,
        headCurrent:true
      },()=>{
        this.queryNoticeList()
      });
    }
  }

  /**
   * 查询通知列表
   */
  queryNoticeList =() =>{
    const { page, pageSize, searchKeyValues } = this.state.filter;
    this.props.dispatch({
      type: 'notice/query',
      payload: {
        page, pageSize, searchKeyValues
      }
    });
  }

  /**
   * 读取通知
   */
  readNotice = (uuid) => {
    this.props.dispatch({
      type: 'notice/readNotice',
      payload: {
        userUuid: loginUser().uuid,
        noticeUuid: uuid
      },
    });
  }

  /**
   * 查询通知类型
   */
  fetchNoticeTypesByCompanyUuid = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'pretype/queryType',
      payload: PRETYPE['notice']
    });
  };

  // 显示下发通知界面
  onCreate = () => {
    this.props.dispatch({
      type: 'notice/onShowPage',
      payload: {
        showPage: 'create'
      }
    });
  }

  // 显示通知类型界面
  onShowPreType = () => {
    this.props.dispatch({
      type: 'notice/onShowPage',
      payload: {
        showPage: 'noticeType'
      }
    });
  };

  // 返回通知列表
  back = () => {
    const { page, pageSize, searchKeyValues } = this.state.filter;
    let that = this;
    this.props.dispatch({
      type: 'notice/query',
      payload: {
        page, pageSize, searchKeyValues
      }
    });
  };

  /**
   * 条件查询
   */
  handleSearch = (key, value) => {
    const { filter } = this.state;
    filter.page = 0;

    if (key === 'publisher') {
      if (value === 'my_publish') {
        filter.searchKeyValues[`${value}`] = true;
        filter.searchKeyValues['my_receive'] = null;
      } else if (value === 'my_receive') {
        filter.searchKeyValues[`${value}`] = true;
        filter.searchKeyValues['my_publish'] = null;
      } else {
        filter.searchKeyValues['my_receive'] = null;
        filter.searchKeyValues['my_publish'] = null;
      }
    } else if (key === 'timeRange') {
      if (value.length != 0) {
        filter.searchKeyValues['startValidDate'] = value[0].format('YYYY-MM-DD HH:mm:ss');
        filter.searchKeyValues['endValidDate'] = value[1].format('YYYY-MM-DD HH:mm:ss')
      } else {
        filter.searchKeyValues['startValidDate'] = null;
        filter.searchKeyValues['endValidDate'] = null;
      }
    } else {
      filter.searchKeyValues[`${key}`] = value;
    }

    this.setState({
      filter: filter
    });

    this.props.dispatch({
      type: 'notice/query',
      payload: filter
    });
  }

  onBackFromPreType = () => {
    this.setState({
      showPreTypePage: false,
    });
    const { filter } = this.state;
    this.props.dispatch({
      type: 'notice/query',
      payload: filter,
    });
    this.fetchNoticeTypesByCompanyUuid();
  };

  // 显示详情中的‘展开’按钮
  onItemExpand = (flag) => {
    this.setState({
      itemExpand: !!flag
    })
  }
  // 显示一条通知的详情
  onViewNotice = (noticeItem) => {
    this.onItemExpand(false);
    this.setState({
      currentNoticeUuid:noticeItem.uuid,
      headCurrent:true
    },()=>{
      this.queryNoticeList()
    });
  }

  /**
   * 表格变化时调用
   */
  pageChange = (page) => {
    let { filter } = this.state;
    filter.page = page - 1;
    this.props.dispatch({
      type: 'notice/query',
      payload: filter
    });
  }
  // 渲染搜索框
  renderForm(props) {
    return <NoticeSearchForm {...props} />;
  }

  drawActionButton = () => {
    const menu = (
      <Menu>
        <Menu.Item>
          <a onClick={() => this.onCreate()}>{noticeLocale.new}</a>
          <a onClick={() => this.onShowPreType()}>{noticeLocale.typeManage}</a>
        </Menu.Item>
      </Menu>
    );
    return <Fragment>

      <Button onClick={() => this.onShowPreType()}>{noticeLocale.typeManage}</Button>
      <Button icon="plus" type="primary" onClick={() => this.onCreate()}>{commonLocale.createLocale}</Button>

    </Fragment>
  }

  /**
   * 绘制布局左侧内容
   */
  drawSider = () => {
    const { data:{list,pagination},currentNoticeUuid } =this.state;

    const NoticeSearchProps = {
      handleSearch: this.handleSearch,
      typeNames: this.props.pretype.names
    };

    const pageProps = {
      hideOnSinglePage: true,
      onChange: this.pageChange,
      ...pagination
    }
    return <div style={{ width: '98%', marginTop: '25px' }}>
        <SearchPanel>{this.renderForm(NoticeSearchProps)}</SearchPanel>
        <Spin spinning={this.props.loading} indicator={LoadingIcon('default')}>
          <List
            size="large"
            pagination={pageProps}
            id='list'
            itemLayout="vertical"
            dataSource={list}
            renderItem={item => (
              <List.Item
                key={item.index}
                style={{ height: 100 }}
                name='noticeListItem'
                className={ item && item.uuid && currentNoticeUuid
                  ? (item.uuid === currentNoticeUuid ? styles.bd : null) : null}
                onClick={() => this.onViewNotice(item)}
              >
                <List.Item.Meta
                  title={
                    <div>
                      <Tag color="#3B77E3">{item.type}</Tag>
                      <a
                        className={styles.listItemMetaTitle}>
                        {item.title}
                      </a>&nbsp;&nbsp;
                      {item.attachments ? (<img style={{ marginRight: 0 }} src={fileSvg} />) : null}
                      <span className={styles.listItemRededCount}>{noticeLocale.itemReadedCount}:&nbsp;{item.readedCount}/{item.receiverCount}</span>
                    </div>
                  }
                />
                <ArticleListContent data={item} />
              </List.Item>
            )}
          />
        </Spin>
    </div>
  }

  drawContent = () => {
    const { currentNoticeUuid } = this.state;
      return (
        currentNoticeUuid?<NoticeItem
                            currentNoticeUuid={currentNoticeUuid}
                            onItemExpand={this.onItemExpand}
                            itemExpand={this.state.itemExpand}
                          />:null
      )
  }
}
