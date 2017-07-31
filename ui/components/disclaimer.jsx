import React from 'react';

const styles = {
  paddingBottom: '1em',
};

const Disclaimer = () => (
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
      <div>
        <span className="todo">See less &#9650;</span>
      </div>
    </div>
    <div className="flex items-center justify-center usa-disclaimer" style={styles}>
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
  </div>
);

export default Disclaimer;
