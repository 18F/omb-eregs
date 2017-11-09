import PropTypes from 'prop-types';
import React from 'react';
import wrapPage from '../components/app-wrapper';
import PageCounter from '../components/page-counter';
import Pagers from '../components/pagers';
import Req from '../components/policy/req';
import { Router } from '../routes';
import { policyData } from '../util/api/queries';


export class Policy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusReq: props.url.query.reqId,
    };
  }

  setHighlight(focusReq, reqsReqId) {
    // Update the browser's URL (we'll assume we're client-side)
    const { policyId } = this.props.url.query;
    const page = this.props.url.query.page || '1';
    Router.router.changeState(
      'replaceState',
      `/policy?policyId=${policyId}&reqId=${focusReq}&page=${page}#${reqsReqId}`,
      this.urlForReq(focusReq, reqsReqId),
    );
    this.setState({ focusReq });
  }

  reqs() {
    return this.props.pagedReqs.results.map((req) => {
      const reqId = req.id;
      const reqsReqId = req.req_id;
      const props = {
        highlighted: `${reqId}` === this.state.focusReq,
        href: this.urlForReq(reqId, reqsReqId),
        key: req.id,
        onClick: (e) => {
          e.preventDefault();
          this.setHighlight(`${reqId}`, reqsReqId);
        },
        req,
      };
      return <Req {...props} />;
    });
  }

  urlForReq(reqId, reqsReqId) {
    const { policyId } = this.props.url.query;
    const page = this.props.url.query.page || '1';
    return `/policy/${policyId}/${reqId}?page=${page}#${reqsReqId}`;
  }

  render() {
    const { pagedReqs, policy } = this.props;
    const { page } = this.props.url.query;
    return (
      <div className="contained-wrapper">
        <h2>{ policy.title_with_number }</h2>
        <div>
          <div className="col col-6">
            { policy.issuance_pretty }
          </div>
          <div className="col col-6 right-align">
            <PageCounter count={pagedReqs.count} page={page} />
          </div>
        </div>
        { this.reqs() }
        <Pagers count={pagedReqs.count} route="policy" />
      </div>
    );
  }
}
Policy.propTypes = {
  pagedReqs: PropTypes.shape({
    count: PropTypes.number.isRequired,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  policy: PropTypes.shape({
    issuance_pretty: PropTypes.string.isRequired,
    title_with_number: PropTypes.string.isRequired,
  }).isRequired,
  url: PropTypes.shape({
    query: PropTypes.shape({
      page: PropTypes.string,
      policyId: PropTypes.string.isRequired,
      reqId: PropTypes.string,
    }),
  }).isRequired,
};

export default wrapPage(Policy, policyData);
