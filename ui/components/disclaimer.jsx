import React from 'react';


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
        This site is currently in beta. See more &#9660;
      </div>
    </div>
  </div>
);

export default Disclaimer;
