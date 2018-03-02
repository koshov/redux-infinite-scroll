import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import {topPosition, leftPosition} from './Utilities/DOMPositionUtils';

export default class ReduxInfiniteScroll extends React.Component {

  constructor(props) {
    super(props);
    this.scrollFunction = this.scrollListener.bind(this);
  }

  componentDidMount () {
    this.attachScrollListener();
  }

  componentDidUpdate () {
    this.attachScrollListener();
  }

  _findElement() {
    if (this.props.scrollableElement) return this.props.scrollableElement;
    if (this.props.elementIsScrollable) return ReactDOM.findDOMNode(this);
    return window;
  }

  attachScrollListener () {
    if (!this.props.hasMore || this.props.loadingMore) return;
    let el = this._findElement();
    el.addEventListener('scroll', this.scrollFunction, true);
    el.addEventListener('resize', this.scrollFunction, true);
    this.scrollListener();
  }

  _elScrollListener() {
    let el = this.props.scrollableElement || document.getElementById('workspace')

    if (this.props.horizontal) {
      let leftScrollPos = el.scrollLeft;
      let totalContainerWidth = el.scrollWidth;
      let containerFixedWidth = el.offsetWidth;
      let rightScrollPos = leftScrollPos + containerFixedWidth;

      return (totalContainerWidth - rightScrollPos);
    }

    let topScrollPos = el.scrollTop;
    let totalContainerHeight = el.scrollHeight;
    let containerFixedHeight = el.offsetHeight;
    let bottomScrollPos = topScrollPos + containerFixedHeight;

    return (totalContainerHeight - bottomScrollPos);
  }

  _windowScrollListener() {
    let el = ReactDOM.findDOMNode(this);

    if(this.props.horizontal) {
      let windowScrollLeft = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
      let elTotalWidth = leftPosition(el) + el.offsetWidth;
      let currentRightPosition = elTotalWidth - windowScrollLeft - window.innerWidth;

      return currentRightPosition;
    }

    let windowScrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    let elTotalHeight = topPosition(el) + el.offsetHeight;
    let currentBottomPosition = elTotalHeight - windowScrollTop - window.innerHeight;

    return currentBottomPosition;
  }

  scrollListener() {
    // This is to prevent the upcoming logic from toggling a load more before
    // any data has been passed to the component
    if (this._totalItemsSize() <= 0) return;

    let scrollableEl = this.props.elementIsScrollable || this.props.scrollableElement;
    let bottomPosition = scrollableEl ? this._elScrollListener() : this._windowScrollListener();

    if (bottomPosition < Number(this.props.threshold)) {
      this.detachScrollListener();
      this.props.loadMore();
    }
  }

  detachScrollListener () {
    let el = this._findElement();
    el.removeEventListener('scroll', this.scrollFunction, true);
    el.removeEventListener('resize', this.scrollFunction, true);
  }

  _totalItemsSize() {
    let totalSize;
    totalSize += (this.props.children.size) ? this.props.children.size : this.props.children.length;
    totalSize += (this.props.items.size) ? this.props.items.size : this.props.items.length;
    return totalSize;
  }

  componentWillUnmount () {
    this.detachScrollListener();
  }

  _assignHolderClass() {
    let additionalClass;
    additionalClass = (typeof this.props.className === 'function') ? this.props.className() : this.props.className;

    return 'redux-infinite-scroll ' + additionalClass;
  }

  render () {
    const Holder = this.props.holderType;

    return (
      <Holder className={ this._assignHolderClass() } style={{height: this.props.containerHeight}}>
        {this.props.children.concat(this.props.items)}
        {this.props.loadingMore && this.props.showLoader && this.props.loader}
      </Holder>
    )
  }
}

ReduxInfiniteScroll.propTypes = {
  elementIsScrollable: PropTypes.bool,
  scrollableElement: PropTypes.any,
  containerHeight: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  threshold: PropTypes.number,
  horizontal: PropTypes.bool,
  hasMore: PropTypes.bool,
  loadingMore: PropTypes.bool,
  loader: PropTypes.any,
  showLoader: PropTypes.bool,
  loadMore: PropTypes.func.isRequired,
  items: PropTypes.oneOfType([
    //ImmutablePropTypes.list,
    PropTypes.array
  ]),
  children: PropTypes.oneOfType([
    //ImmutablePropTypes.list,
    PropTypes.array
  ]),
  holderType: PropTypes.string,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),
  transitionName: PropTypes.string,
  transitionEnter: PropTypes.bool,
  transitionEnterTimeout: PropTypes.number,
  transitionLeave: PropTypes.bool,
  transitionLeaveTimeout: PropTypes.number,
  transitionAppear: PropTypes.bool,
  transitionAppearTimeout: PropTypes.number,
};

ReduxInfiniteScroll.defaultProps = {
  className: '',
  elementIsScrollable: true,
  scrollableElement: null,
  containerHeight: '100%',
  threshold: 100,
  horizontal: false,
  hasMore: true,
  loadingMore: false,
  loader: <div style={{textAlign: 'center'}}>Loading...</div>,
  showLoader: true,
  holderType: 'div',
  children: [],
  items: [],
  transitionName: 'redux-infinite-scroll',
  transitionEnter: true,
  transitionEnterTimeout: 2000,
  transitionLeave: true,
  transitionLeaveTimeout: 1000,
  transitionAppear: true,
  transitionAppearTimeout: 2000
};
