import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import BookSearchPage from './BookSearchPage';
import BookCreatePage from './BookCreatePage';
import BookViewPage from './BookViewPage';
@connect(({ book, loading }) => ({
  book,
  loading: loading.models.book,
}))
export default class Book extends PureComponent {
  render() {
    if (this.props.book.showPage === 'query') {
      return <BookSearchPage pathname={this.props.location.pathname} billNumber={this.props.book.billNumber}/>;
    } else if (this.props.book.showPage === 'create') {
      return <BookCreatePage pathname={this.props.location.pathname}  entityUuid={this.props.book.entityUuid ? this.props.book.entityUuid : null} billNumber={this.props.book.billNumber}/>
    } else if (this.props.book.showPage === 'view') {
      return <BookViewPage entityUuid={this.props.book.entityUuid ? this.props.book.entityUuid : null} pathname={this.props.location.pathname} billNumber={this.props.book.billNumber}/>
    }
  }
}
