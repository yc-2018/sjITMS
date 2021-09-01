import React, { PureComponent, Fragment } from 'react';
import {
  Table,
  Icon,
  Popconfirm,
  Button,
} from 'antd';
import { connect } from 'dva';
import styles from './Bin.less';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import { formatMessage, getLocale } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import moment from 'moment';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import ViewTable from './ViewTable';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { stockState } from '@/utils/StockState';
import { routerRedux } from 'dva/router';

@connect(({ stock, loading }) => ({
  stock,
  loading: loading.models.stock,
}))
export default class BinStockTable extends PureComponent {
  componentDidMount() {
    const { dispatch, bincode } = this.props;

    dispatch({
      type: 'stock/query',
      payload: {
        dcUuid: loginOrg().uuid,
        companyUuid: loginCompany().uuid,
        binCode: bincode,
      }
    });
  }

  onArticleView = (article) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/article',
      payload: {
        showPage: 'view',
        entityUuid: article.articleUuid
      }
    }));
  }

  onContainerView = (barcode) => {
    if(barcode && barcode !== '-') {
      this.props.dispatch(routerRedux.push({
        pathname: '/facility/container',
        payload: {
          showPage: 'view',
          entityUuid: barcode
        }
      }));
    }

  }
  render() {
    const {
      loading,
      upperUuid
    } = this.props;

    const columns = [{
      title: commonLocale.articleLocale,
      dataIndex: 'article',
      key: 'article',
      width: colWidth.codeNameColWidth,
      render: (text, record) => <a onClick={this.onArticleView.bind(this, text)}><EllipsisCol colValue={convertArticleDocField(text)} /></a>
    }, {
      title: formatMessage({ id: 'bin.table.qpcStr' }),
      dataIndex: 'qpcStr',
      key: 'qpcStr',
      width: itemColWidth.qpcStrColWidth,
      render: (text, record) => (record.qpcStr + '/' + record.article.munit)
    }, {
      title: formatMessage({ id: 'bin.table.supplier' }),
      dataIndex: 'vendor',
      key: 'vendor',
      width: colWidth.codeNameColWidth,
      render: (text, record) => (<EllipsisCol colValue={convertCodeName(record.vendor)} />)
    }, {
      title: formatMessage({ id: 'bin.table.container' }),
      dataIndex: 'containerBarcode',
      key: 'containerBarcode',
      width: colWidth.codeColWidth,
      render: (text, record) => (<a onClick={this.onContainerView.bind(this, text)}>{record.containerBarcode}</a>)
    }, {
      title: formatMessage({ id: 'bin.table.productionDate' }),
      dataIndex: 'productionDate',
      key: 'productionDate',
      width: colWidth.dateColWidth,
      render: (text) => moment(text).format("YYYY-MM-DD")
    }, {
      title: formatMessage({ id: 'bin.table.validDate' }),
      dataIndex: 'validDate',
      key: 'validDate',
      width: colWidth.dateColWidth,
      render: (text) => moment(text).format("YYYY-MM-DD")
    }, {
      title: formatMessage({ id: 'bin.table.stockBatch' }),
      dataIndex: 'stockBatch',
      key: 'stockBatch',
      width: colWidth.sourceBillNumberColWidth,
      render: text => <EllipsisCol colValue={text} />
    }, {
      title: formatMessage({ id: 'bin.table.qty' }),
      dataIndex: 'qty',
      key: 'qty',
      width: itemColWidth.qtyColWidth,
    }, {
      title: formatMessage({ id: 'bin.table.price' }),
      dataIndex: 'price',
      key: 'price',
      width: itemColWidth.priceColWidth
    }, {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      key: 'state',
      width: colWidth.enumColWidth,
      render: (text, record) => stockState[record.state].caption
    }];

    return (
      <div className={styles.standardTable}>
        <div className={styles.standardTable}>
          <ViewTable
            columns={columns}
            data={this.props.stock.stocks ? this.props.stock.stocks : []}
          />
        </div>
      </div>
    );
  }
}
