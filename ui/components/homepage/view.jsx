import React from 'react';

import ConditionalRender from '../conditional-render';
import FallbackView from '../filters/fallback-view';
import TopicAutocomplete from './topic-autocomplete';
import NewPoliciesContainerResolver from './new-policies/container';

export default function Homepage() {
  return (
    <div className="homepage">
      <section className="filter-form py2 center">
        <div className="sm-col-12 md-col-6 mx-auto center">
          <h2 className="h1">Find policies and requirements that apply to your agency.</h2>
          <div className="filter px4">
            <h3 className="h3" id="topics_label">What topics are you interested in?</h3>
            <ConditionalRender>
              <div className="form-field">
                <FallbackView
                  aria-labelledby="topics_label"
                  insertParam="topics__id__in"
                  lookup="topics"
                  pathname="/requirements"
                />
              </div>
              <form method="GET" action="/requirements">
                <div className="form-field">
                  <TopicAutocomplete aria-labelledby="topics_label" />
                </div>
                <div className="form-field">
                  <input
                    className="filter-form-submit mt2 h4 py1 px4 rounded"
                    value="Search"
                    type="submit"
                  />
                </div>
              </form>
            </ConditionalRender>
          </div>
        </div>
      </section>

      <section className="about py3">
        <div className="mx3">
          <div className="about-inner px2 sm-col-12 md-col-6 mx-auto">
            <h3 className="h2">About this site</h3>
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

      <section className="new-policies py3 mb4">
        <div className="sm-col-12 md-col-6 mx-auto">
          <h3>New policies</h3>
          <NewPoliciesContainerResolver />
        </div>
      </section>
    </div>
  );
}
