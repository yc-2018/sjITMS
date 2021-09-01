import SiderPage from '@/pages/Component/Page/SiderPage';
import { Alert, Badge, Calendar, Col, Row, Table, Tabs } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { convertCodeName } from '@/utils/utils';
import { add, compare, division } from '@/utils/QpcStrUtil';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import moment from 'moment';
import styles from './BookBoard.less';
import { bookLocale } from './BookLocale';
import { commonLocale } from '@/utils/CommonLocale';
import { Button } from 'antd/lib/radio';

@connect(({ dock, bookConfig, receiveConfig, book, loading }) => ({
  dock,
  bookConfig,
  receiveConfig,
  book,
  loading: loading.models.dock,
}))
export default class BookBoard extends SiderPage {
  constructor(props) {
    super(props);

    this.state = {
      title: '预约日期：' + moment(new Date()).format('YYYY-MM-DD'),
      siderWidth: 900,
      data: [],
      totalArticleCount: 0,
      totalQtyStr: '0',
      currentDate: moment(),
      currentDockGroupUuid: null,
      bookInfoToShow: {},
      bookedDataAndNum: {},
      books: [],
      contentStyle: {
        marginTop: 0,
      },
      siderStyle : {
        overflow: 'visible'
      }
    };
  }

  onSelectDate = (e) => {
    this.setState({
      title: '预约日期：' + e.format('YYYY-MM-DD'),
      currentDate: e,
    });
    //this.getByBookDate(e);
  };

  componentDidMount() {
    const that = this;
    this.props.dispatch({
      type: 'bookConfig/getByCompanyUuidAndDcUuid',
    });

    this.props.dispatch({
      type: 'dock/getDockGroupByCompanyUuid',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      },
      callback: response => {
        if (response && response.success && response.data && response.data.length > 0) {
          that.refreshDockGroupConfig(response.data[0].uuid);
          that.getByBookDate(moment());
        }
      },
    });
  }

  onTabChange = (activeKey) => {
    this.setState({
      currentDockGroupUuid: activeKey,
    });
    this.refreshDockGroupConfig(activeKey);
  };

  refreshDockGroupConfig(dockGroup) {
    const { currentDockGroupUuid } = this.state;
    dockGroup = dockGroup ? dockGroup : currentDockGroupUuid;

    this.props.dispatch({
      type: 'receiveConfig/getByDockGroupUuid',
      payload: dockGroup,
    });
  }

  getByBookDate(date) {
    const { currentDate, currentDockGroupUuid } = this.state;
    date = date ? date : currentDate;
    this.props.dispatch({
      type: 'book/query',
      payload: {
        page: 0,
        pageSize: 1000,
        searchKeyValues: {
          beginBookDate: date.format('YYYY-MM-DD'),
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          state: 'AUDITED',
        },
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    const { currentDockGroupUuid } = this.state;

    if (!currentDockGroupUuid && nextProps.dock.dockGroupList && nextProps.dock.dockGroupList.length > 0) {
      this.setState({
        currentDockGroupUuid: nextProps.dock.dockGroupList[0].uuid,
      });
    }

    const bookedDataAndNum = nextProps.book.data.list.reduce((all, obj) => {
      if (moment(obj.bookDate).format('YYYY-MM-DD') in all) {
        all[moment(obj.bookDate).format('YYYY-MM-DD')]++;
      } else {
        all[moment(obj.bookDate).format('YYYY-MM-DD')] = 1;
      }
      return all;
    }, {});

    this.setState({
      books: nextProps.book.data.list,
      bookedDataAndNum: bookedDataAndNum,
    });
  }

  addBooks = (data, book) => {
    const that = this;
    data.forEach(function(e) {
      let rows = that.rows(null, book.startTime, book.endTime, data);
      let avgQtyStr = division(book.qtyStr, rows);
      if (e.times === book.startTime) {
        e.books.push(book);
        e.qtyStr = add(e.qtyStr, avgQtyStr);
        e.articleCount = e.articleCount + book.articleCount;
      }

      if (e.times > book.startTime && e.times < book.endTime) {
        e.books.push({});
        e.qtyStr = add(e.qtyStr, avgQtyStr);
        e.articleCount = e.articleCount + book.articleCount;
      }
    });
  };

  buildRowData = () => {
    const entity = this.props.bookConfig.data;
    let startTime = entity.startTime;
    let endTime = entity.endTime;
    let timeRange = entity.timeRange;

    const data = [];
    data.push({
      times: startTime,
      books: [],
      qtyStr: '0',
      articleCount: 0,
    });
    if (startTime) {
      let middleTime = this.addTimeRange(startTime, endTime, timeRange);
      while (middleTime !== endTime) {
        data.push({
          times: middleTime,
          books: [],
          qtyStr: '0',
          articleCount: 0,
        });
        middleTime = this.addTimeRange(middleTime, endTime, timeRange);
      }
      data[data.length - 1].endTime = endTime;
    }
    return data;
  };

  addTimeRange = (startTime, endTime, timeRange) => {
    let startTimes = startTime.split(':');
    let hour = parseInt(startTimes[0]);
    let minute = parseInt(startTimes[1]);
    let addHour = Math.floor(timeRange / 60);
    let addMinute = timeRange % 60;
    let newHour = hour + addHour;
    let newMinute = minute + addMinute;
    let endTimes = endTime.split(':');
    let endHour = parseInt(endTimes[0]);
    let endMinute = parseInt(endTimes[1]);
    if (newHour > endHour || (newHour === endHour && newMinute > endMinute))
      return endTime;
    if (newMinute >= 60) {
      newHour = newHour + Math.floor(newMinute / 60);
      newMinute = newMinute % 60;
    }
    let middleTime = (newHour < 10 ? '0' : '') + newHour + ':' + (newMinute < 10 ? '0' + newMinute : newMinute);
    return middleTime;
  };

  drawTotalInfo = (totalQtyStr, totalArticleCount, data) => {
    let bookConfig = this.props.receiveConfig.data;
    if (!bookConfig || !bookConfig.uuid) {
      bookConfig = {
        maxReceiveQtyStr: 0,
        maxReceiveArticleCount: 0,
        exceedRatio: 0,
      };
    }
    let canBookQtyStr = data.length * bookConfig.maxReceiveQtyStr +
      data.length * bookConfig.maxReceiveQtyStr * bookConfig.exceedRatio;
    return (
      <div style={{ margin: '0px 0px 5px 0px' }}>
        <Row type="flex">
          <Col span={11}>
            {
              compare(totalQtyStr, canBookQtyStr) <= 0 || canBookQtyStr === 0 ?
                <Alert className={styles.bookAlert}
                       message={`商品件数：${totalQtyStr}/${canBookQtyStr}（单个时间段${bookConfig.maxReceiveQtyStr}）`}
                       type="info"/>
                :
                <Alert className={styles.bookAlert}
                       message={`商品件数：      ${totalQtyStr}/${canBookQtyStr}（单个时间段${bookConfig.maxReceiveQtyStr}）`}
                       type="error"/>
            }
          </Col>
          &nbsp;
          <Col span={12}>
            <Alert className={styles.bookAlert}
                   message={`商品品项数：      ${totalArticleCount}/${bookConfig.maxReceiveArticleCount}`} type="info"/>
          </Col>
        </Row>
      </div>
    );
  };

  drawTabPanel = () => {
    const { dockGroupList } = this.props.dock;
    const tabPanels = [];
    const that = this;
    const { currentDockGroupUuid, books, currentDate } = this.state;
    dockGroupList && dockGroupList.forEach(function(e) {
      const data = that.buildRowData();
      var dataSource = [];
      //   books.filter(function(book) {
      //   return book.dockGroup.uuid === e.uuid && moment(book.bookDate).format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD');
      // });
      Array.isArray(books) && books.forEach(function(item) {
        if(item.dockGroup.uuid === e.uuid && moment(item.bookDate).format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD')) {
          dataSource.push(item)
        }
      });
      let tabs = convertCodeName(e);
      if (dataSource.length >= 1) {
        tabs = <span>{convertCodeName(e)}<Badge count={dataSource.length} overflowCount={dataSource.length}/></span>;
      }

      let totalQtyStr = '0';
      let totalArticleCount = 0;

      Array.isArray(dataSource) && dataSource.forEach(function(e) {
        that.addBooks(data, e);
        totalQtyStr = add(totalQtyStr, e.qtyStr);
        totalArticleCount = totalArticleCount + e.articleCount;
      });

      tabPanels.push(
        <Tabs.TabPane key={e.uuid} tab={tabs}>
          {that.drawTotalInfo(totalQtyStr, totalArticleCount, data)}
          <Table className={styles.bookTable}
                 rowKey={record => record.times}
                 scroll={{ y: 600 }}
                 pagination={false}
                 rowClassName={styles.bookBoardRow}
                 showHeader={false}
                 columns={that.drawColumns(data)}
                 dataSource={data}/>
        </Tabs.TabPane>,
      );
    });
    return tabPanels;
  };

  showDetil = (book) => {
    this.setState({
      bookInfoToShow: book,
    });
  };
  drawColumns = (data) => {
    const bookConfig = {
      qtyStr: 10,
      rate: 0.5,
    };

    let maxColumns = 5;
    data.forEach(function(e) {
      if (e.books.length > maxColumns) {
        maxColumns = e.books.length;
      }
    });
    let columns = [{
      key: 'times',
      width: '100px',
      render: record => {
        return (
          <span>
                        <font color="#000000">{record.times}</font>
                        <br/><br/>
            {
              compare(record.qtyStr, bookConfig.qtyStr * (1 + bookConfig.rate)) >= 0 ?
                <font color="red">{record.qtyStr}件</font>
                :
                <font color="#CCCCCC">{record.qtyStr}件</font>
            }
            <br/>
                        <font color="#CCCCCC">{record.articleCount}品项</font>
                        <br/><br/>
            {record.endTime && <font color="#000000">{record.endTime}</font>}
                    </span>
        );
      },
    }];
    for (let i = 0; i < maxColumns; i++) {
      columns.push({
        key: 'book' + i,
        width: '200px',
        render: (row, index) => {
          if (row.books && row.books.length > 0) {
            let book = row.books[i];
            if (book) {
              let height = 100 * this.rows(data, book.startTime, book.endTime);
              let rows = this.rows(data, book.startTime, book.endTime);
              return {
                children:
                  <div onClick={() => this.showDetil(book)} className={styles.bookDiv}
                       style={{ height: `${height}px`, width: '195px' }}>
                    {book.billNumber}
                    <br/>
                    {convertCodeName(book.vendor)}
                  </div>,
                props: {
                  rowSpan: rows,
                },
              };
            }

          }
        },
      });
    }
    return columns;
  };

  rows = (data, startTime, endTime, records) => {
    records = records ? records : data;
    let rows = 0;
    records.forEach(function(e) {
      if (e.times >= startTime && e.times < endTime) {
        rows = rows + 1;
      }
    });
    return rows;
  };

  drawSider = () => {
    return (
      <Tabs onChange={this.onTabChange}>
        {this.drawTabPanel()}
      </Tabs>
    );
  };

  dateCellRender = (e) => {
    const entity = this.props.bookConfig.data;
    const endDate = moment().add(entity.preDays, 'days');
    if (e.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
      let num = this.state.bookedDataAndNum && this.state.bookedDataAndNum[e.format('YYYY-MM-DD')];
      if (num) {
        return <Badge count={num} overflowCount={num}/>;
      }
    } else if (!e.isBefore(moment()) && (entity.preDays === 0 || e.isBefore(endDate))) {
      let num = this.state.bookedDataAndNum && this.state.bookedDataAndNum[e.format('YYYY-MM-DD')];
      if (num) {
        return <Badge count={num} overflowCount={num}/>;
      }
    }
  };

  drawContent = () => {
    const entity = this.props.bookConfig.data;
    if (entity.preDays === 0) {
      entity.preDays = 90;
    }
    let flag = 'none';
    if (this.state.bookInfoToShow.uuid) {
      flag = 'block';
    }
    let validRange = [moment(), moment().add(entity.preDays, 'days')];
    return (
      <div className={styles.rightDiv}>
        <div className={styles.calendarDiv}>
          <Calendar validRange={validRange} fullscreen={false} onSelect={this.onSelectDate}
                    dateCellRender={this.dateCellRender}/>
        </div>
        <div className={styles.detailDiv} style={{ display: flag }}>
          <p className={styles.marginP}>
            <span className={styles.leftSpan}>{bookLocale.title}{commonLocale.billNumberLocal}:</span>
            <span>{this.state.bookInfoToShow.billNumber}</span>
          </p>
          <p>
            <span className={styles.leftSpan}>{commonLocale.inVendorLocale}</span>
            <span>{convertCodeName(this.state.bookInfoToShow.vendor)}</span>
          </p>
          <p>
            <span className={styles.leftSpan}>{commonLocale.inOwnerLocale}</span>
            <span>{convertCodeName(this.state.bookInfoToShow.owner)}</span>
          </p>
          <p>
            <span className={styles.leftSpan}>{bookLocale.booker}</span>
            <span>{convertCodeName(this.state.bookInfoToShow.booker)}</span>
          </p>
          <p>
            <span className={styles.leftSpan}>{bookLocale.bookTimeRange}</span>
            <span>{moment(this.state.bookInfoToShow.bookDate).format('YYYY-MM-DD')
            + ' ' + this.state.bookInfoToShow.startTime + '~' + this.state.bookInfoToShow.endTime}</span>
          </p>
          <p>
            <span className={styles.leftSpan}>{commonLocale.inAllQtyStrLocale}</span>
            <span>{this.state.bookInfoToShow.qtyStr}</span>
          </p>
          <p>
            <span className={styles.leftSpan}>{bookLocale.allArticles}</span>
            <span>{this.state.bookInfoToShow.articleCount}</span>
          </p>
          <p>
            <span className={styles.leftSpan}>{bookLocale.allOrders}</span>
            <span>{this.state.bookInfoToShow.orderCount}</span>
          </p>

          <div className={styles.buttonDiv}><Button onClick={() => this.onView()}>查看详情</Button></div>
        </div>
      </div>
    );
  };
  onView = () => {
    this.props.dispatch(routerRedux.push({
      pathname: 'book',
      payload: {
        showPage: 'view',
        entityUuid: this.state.bookInfoToShow.uuid,
      },
    }));
  };
}
