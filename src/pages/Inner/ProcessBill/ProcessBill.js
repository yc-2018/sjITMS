import { PureComponent } from "react";
import { connect } from "dva";
import { processLocale } from './ProcessBillLocale';

import ProcessBillCreatePage from './ProcessBillCreatePage';
import ProcessBillSearchPage from './ProcessBillSearchPage';
import ProcessBillViewPage from './ProcessBillViewPage';

@connect(({ process, loading }) => ({
  process,
  loading: loading.models.dec,
}))
export default class ProcessBill extends PureComponent {
  showQuery = () => {
    this.props.dispatch({
      type: 'process/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  render() {
    const { showPage, entityUuid } = this.props.process;

    if (showPage === 'query') {
      return <ProcessBillSearchPage pathname={this.props.location.pathname} />;
    } else if (showPage === 'view') {
      return <ProcessBillViewPage entityUuid={entityUuid} pathname={this.props.location.pathname} />
    } else if (showPage === 'create') {
      return <ProcessBillCreatePage entityUuid={entityUuid} pathname={this.props.location.pathname} />;
    }
  }
}

