import { PureComponent } from "react";
import { connect } from 'dva';
import AttachmentReturnSearchPage from './AttachmentReturnSearchPage';
import AttachmentReturnCreatePage from './AttachmentReturnCreatePage';
@connect(({ attachmentReturn, loading }) => ({
  attachmentReturn,
  loading: loading.models.attachmentReturn,
}))
export default class AttachmentReturn extends PureComponent {
 
  render() {
    const { showPage, entityUuid, importTemplateUrl } = this.props.attachmentReturn;
    if (showPage === 'query') {
      return <AttachmentReturnSearchPage pathname={this.props.location.pathname}/>;
    }
  //   else{
  //     return <AttachmentReturnCreatePage pathname={this.props.location.pathname}/>;
  //   }
  }
}
