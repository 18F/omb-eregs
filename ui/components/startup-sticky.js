import Sticky from 'react-stickynode';

/* react-stickynode has an annoying bug
 * https://github.com/yahoo/react-stickynode/issues/61 around not loading
 * correctly if linking to the middle of a page. This hacks around that by
 * sending a mock scroll event (resizing won't get us into the "fixed" state)
 * on mount to the DOM.
 */
export default class StartupSticky extends Sticky {
  componentDidMount() {
    super.componentDidMount();
    const scrollEvent = {
      scroll: {
        delta: 1, // down
        top: window.scrollY,
      },
    };
    // react-sticky's initialization isn't actually complete until the state
    // change *after* componentDidMount. Therefore, we add a callback to fire
    // after that state change...
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({}, () => this.handleScroll(null, scrollEvent));
    /* eslint-enable react/no-did-mount-set-state */
  }
}
