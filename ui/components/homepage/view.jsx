import React from 'react';

import Autocompleter from '../filters/autocompleter';
import NewPoliciesContainerResolver from './new-policies/container';

export default function Homepage() {
  return (
    <div className="homepage">
      <section className="filter-form px4 py2 center">
        <div className="col-8 mx-auto center">
          <h2>Find policies and requirements that apply to your agency.</h2>
          <div className="filter px4">
            <h4>What topics are you interested in?</h4>
            <div className="form-field">
              <Autocompleter insertParam="topics__id__in" lookup="topics" pathname="/requirements" />
            </div>
          </div>
        </div>
      </section>

      <section className="about px4 py3">
        <div className="mx3">
          <div className="about-inner px2 col-8 mx-auto">
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
        </div>
      </section>

      <section className="new-policies px4 py3 mb4">
        <div className="col-8 mx-auto">
          <h3>New policies</h3>
          <NewPoliciesContainerResolver />
        </div>
      </section>
    </div>
  );
}
