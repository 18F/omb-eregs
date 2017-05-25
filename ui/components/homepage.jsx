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
    <div>
      <section>
        <h2>About this site</h2>
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
      </section>

      <section>
        <h3>Find policies and requirements that apply to your agency.</h3>
        <h4>What topics are you interested in?</h4>
        { filterControls }
      </section>
    </div>
  );
}
