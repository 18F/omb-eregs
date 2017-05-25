import React from 'react';

import FilterListView from './filters/list-view';
import Autocompleter from './filters/autocompleter';

export default function Homepage() {
  const filterControls = [
    React.createElement(FilterListView, {
      autocompleter: React.createElement(Autocompleter, {
        insertParam: 'topics__id__in',
        lookup: 'topics',
        pathname: '/requirements',
      }),
      key: 'topic',
    }),
  ];

  return (
    <div className="homepage">
      <section className="filter-form px4 py2 center">
        <h2>Find policies and requirements that apply to your agency.</h2>
        <div className="filter px4">
          <label>What topics are you interested in?</label>
          <div className="form-field">
            { filterControls }
          </div>
        </div>
      </section>

      <section className="about px4 py3">
        <div className="about-inner px2 mx4">
          <h3>About this site</h3>
          <p>
              The OMB Policy Library includes excerpts from memos and
              policy documents issued by the White House. This project
              is part of our ongoing efforts to make it easier to find,
              read, and understand information technology requirements.
          </p>
          <p>
              The information on this site should be considered unofficial
              and will be updated frequently as a convenience to agencies
              and the public. For official OMB guidance, please follow the
              links to the original memos and policy documents.
          </p>
        </div>
      </section>
    </div>
  );
}
