import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message, Table, Checkbox } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import { formatMessage } from 'umi/locale';
import NotePanel from '@/pages/Component/Form/NotePanel';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import { BILLIMPORT_RES } from './BillImportPermission';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { billImportLocale } from './BillImportLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { BillType, getBillTypeCaption } from './BillType';
import Empty from '@/pages/Component/Form/Empty';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

const TabPane = Tabs.TabPane;
@connect(({ billImport, loading }) => ({
  billImport,
  loading: loading.models.billImport,
}))
export default class BillImportMouldViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      items: [],
      title: '',
      entityUuid: '',
      disabledChangeState: true
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.billImport.data.entity;
    this.setState({
      entity: entity,
      items: entity && entity.items ? entity.items : [],
      title: entity ? entity.code : '',
      entityUuid: entity ? entity.uuid : ''
    });
  }

  refresh() {
    this.props.dispatch({
      type: 'billImport/get',
      payload: this.props.billImport.entityUuid

    });
  }

  onBack = () => {
    this.props.dispatch({
      type: 'billImport/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  import = () => {
    const entity = this.state.entity;
    this.props.dispatch({
      type: 'billImport/showPage',
      payload: {
        showPage: 'home',
        owner: entity.owner,
        billType: entity.billType
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'billImport/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

  downloadFile = () => {
    let sUrl = this.state.entity.downloadUrl;
    // IOS devices do not support downloading. We have to inform user about this.
    if (/(iP)/g.test(navigator.userAgent)) {
      message.warn('Your device does not support files downloading. Please try again in desktop browser.');
      return false;
    }

    let isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    let isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
    // If in Chrome or Safari - download via virtual link click
    if (isChrome || isSafari) {
      // Creating new link node.
      var link = document.createElement('a');
      link.href = sUrl;

      if (link.download !== undefined) {
        // Set HTML5 download attribute. This will prevent file from opening if supported.
        var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
        link.download = fileName;
      }

      // Dispatching click event.
      if (document.createEvent) {
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        link.dispatchEvent(e);
        return true;
      }
    }

    window.open(sUrl, '_self');
    return true;
  }

  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        <Button type="primary" disabled={!havePermission(BILLIMPORT_RES.CREATE)} onClick={this.onEdit}>
          {commonLocale.editLocale}
        </Button>
        <Button type="primary" onClick={this.downloadFile}>
          {commonLocale.downloadTemplate}
        </Button>
        <Button onClick={this.import}>
          {billImportLocale.import}
        </Button>
      </Fragment>
    );
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawInfoTab(),
    ];

    return tabPanes;
  }

  drawInfoTab = () => {
    const { entity } = this.state;

    let basicItems = [{
      label: commonLocale.codeLocale,
      value: entity ? entity.code : ''
    }, {
      label: commonLocale.nameLocale,
      value: entity ? entity.name : ''
    }, {
      label: billImportLocale.owner,
      value: entity && entity.owner ? convertCodeName(entity.owner) : ''
    }, {
      label: billImportLocale.billType,
      value: entity && entity.billType ? getBillTypeCaption(entity.billType) : <Empty />
    }, {
      label: commonLocale.noteLocale,
      value: entity ? entity.note : undefined,
    }];

    let billItemCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
        key: 'line',
      },
      {
        title: billImportLocale.billFieldName,
        dataIndex: 'billFieldName',
        key: 'billFieldName',
      },
      {
        title: billImportLocale.notNull,
        dataIndex: 'notNull',
        key: 'notNull',
        render: (text) => {
          return text == true ? '是' : '否'
        }
      },
      {
        title: '默认值',
        dataIndex: 'defaultValue',
        render:val=>val?val:<Empty/>
      },
      {
        title: billImportLocale.fileFieldName,
        dataIndex: 'fileFieldName',
        key: 'fileFieldName',
      }
    ]

    return (
      <TabPane key="basicInfo" tab={billImportLocale.title}>
        <ViewTabPanel>
          <ViewPanel onCollapse={this.onCollapse} items={basicItems} title={commonLocale.basicInfoLocale} />
          <ViewTablePanel
            title={commonLocale.itemsLocale}
            columns={billItemCols}
            data={this.state.items}
            notNote={true}
            tableId={'billImport.view.table'}
          />
        </ViewTabPanel>
      </TabPane>
    );
  }
}
