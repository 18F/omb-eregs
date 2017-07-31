import React from 'react';

import ConditionalRender from './conditional-render';

const explanation = (
  <div className="flex items-center justify-center usa-disclaimer usa-disclaimer-text">
    <div className="hidden">
      <span className="t-bold">This site is currently in beta</span>
      <div className="toggle" aria-hidden="false">
        <span className="t-block">
          Questions or comments?
          Email&nbsp;<a href="mailto:ofcio@omb.eop.gov">ofcio@omb.eop.gov</a>.
        </span>
      </div>
    </div>
  </div>
);

export default class Disclaimer extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { open: false };
  }

  activateLink() {
    const onClick = () => this.setState({ open: !this.state.open });
    const text = this.state.open ? 'See less \u25B2' : 'See more \u25BC';
    return (
      <ConditionalRender>
        <noscript />
        <div>
          <button onClick={onClick} className="usa-disclaimer">{ text }</button>
        </div>
      </ConditionalRender>
    );
  }

  render() {
    return (
      <div className="overflow-auto">
        <div className="flex items-center justify-between usa-disclaimer">
          <div>
            <img
              className="pr1"
              alt="US flag"
              width="20"
              height="13"
              src="/static/img/usa-flag.png"
            />
            An official website of the United States government
          </div>
          { this.activateLink() }
        </div>
        <noscript>{ explanation }</noscript>
        { this.state.open ? explanation : null }
      </div>
    );
  }
}
