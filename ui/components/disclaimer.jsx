import React from 'react';

var styles = {
	paddingBottom:'1em'
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
        <a href="javascript:void(0)">{/*This site is currently in beta.*/} See less {/*&#9660;*/}&#9650;</a>
      </div>
    </div>
    <div className="flex items-center justify-center usa-disclaimer" style={styles}>
      <div className="hidden">
        <span className="t-bold">This site is currently in beta</span>&nbsp;{/*| More information can be given.*/}
        <div className="toggle" aria-hidden="false">
          <span className="t-block">Questions or comments? Email&nbsp;<a href="mailto:ofcio@omb.eop.gov">ofcio@omb.eop.gov</a>.</span>
        </div>
        {/*<div className="toggle-text" aria-expanded="true">
          <button className="less" aria-hidden="false" tabIndex={0}>Show less <i className="icon-small--arrow-up-border" /></button>
          <button className="more" aria-hidden="true" tabIndex={0}>Show more <i className="icon-small--arrow-down-border" /></button>
        </div>*/}
      </div>
    </div>
  </div>
);

export default Disclaimer;
