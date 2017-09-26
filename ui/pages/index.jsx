import PropTypes from 'prop-types';
import React from 'react';

import { wrapWithAjaxLoader } from '../components/ajax-loading';
import ConditionalRender from '../components/conditional-render';
import FallbackView from '../components/filters/fallback-view';
import HeaderFooter from '../components/header-footer';
import TopicAutocomplete from '../components/homepage/topic-autocomplete';
import NewPolicyView from '../components/homepage/new-policy-view';
import { homepageData } from '../queries';


export function Homepage({ recentPolicies }) {
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
          <div className="landing-section gold-border">
            <h3 className="h2">About this site</h3>
            <p className="content">
              The beta OMB Policy Library includes excerpts from policies
              issued by the White House. This project is part of our ongoing
              efforts to make it easier to find and understand policy.
            </p>
            <p className="content">
              This site does not include a comprehensive list of OMB policies.
              We are adding select policies on a rolling basis and working
              with users to make the site more useful.{' '}
              <a href="mailto:ofcio@omb.eop.gov">Tell us what you think!</a>
            </p>
            <h3 className="h2">Disclaimer</h3>
            <p className="content">
              The information appearing on this website is for general
              informational purposes only, intended to supplement official
              resources, including the Office of Management and Budget’s (OMB)
              website (<a href="https://www.whitehouse.gov/omb">www.whitehouse.gov/omb</a>).
              This website does not provide legal advice to any individual or
              entity; establish, modify, or interpret any OMB policies; serve
              as a decision-making tool or a compliance check-list; or
              provide a comprehensive set of requirements applicable to
              agencies. This website should not be cited as the source of any
              policies or requirements. Consult with your agency’s legal
              counsel before taking any action based in whole or part on
              information appearing on this site or any site to which it may
              be linked. We also urge you to conduct a thorough review of all
              relevant requirements applicable to you.
            </p>
            <p className="content">
              While OMB strives to make the information on this website as
              timely and accurate as possible, OMB makes no claims, promises,
              or guarantees about the accuracy, completeness, or adequacy of
              the contents of this site, and expressly disclaims liability for
              errors and omissions in the contents of this site. No warranty
              of any kind, implied, expressed, or statutory, including but not
              limited to the warranties of non- infringement of third party
              rights, title, merchantability, fitness for a particular purpose
              or freedom from computer virus, is given with respect to the
              contents of this website or its links to other Internet
              resources.
            </p>
          </div>
        </div>
      </section>

      <hr className="stars-divider" />

      <section className="new-policies py3 mb4">
        <div className="landing-section">
          <h3>New policies</h3>
          <ol className="list-reset clearfix">
            { recentPolicies.map(p => <NewPolicyView policy={p} key={p.id} />) }
          </ol>
        </div>
      </section>
    </div>
  );
}
Homepage.propTypes = {
  recentPolicies: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
};

const HomepageWithHeaderFooter = props =>
  <HeaderFooter><Homepage {...props} /></HeaderFooter>;

export default wrapWithAjaxLoader(HomepageWithHeaderFooter, homepageData);
