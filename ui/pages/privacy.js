import React from 'react';

import { email, ContactEmail } from '../components/contact-email';
import HeaderFooter from '../components/header-footer';
import Link from '../components/link';

export function PrivacyView() {
  return (
    <div className="ml3">
      <h2 className="h1">Privacy Policy</h2>
      <h3 className="caps">Protecting privacy and security</h3>

      <p className="max-width-3">
        Protecting the privacy and security of individuals’ personal
        information is very important to us. We do not collect any information
        that directly identifies you when you visit the OMB Policy Library
        unless you choose to provide that information by contacting us.
        However, the website may collect a limited amount of information about
        your visit for the purposes of website analytics and customization.
        Please read this notice to understand what we do with the limited
        amount of information about your visit that we may collect.
      </p>

      <h4>Information collected and stored automatically</h4>
      <p className="max-width-3">
        As with many Federal Government websites, the OMB Policy Library is
        hosted by the U.S. General Services Administration (GSA). GSA, or
        contractors working on behalf of GSA, collect limited information
        about visits to the OMB Policy Library. This information is used to
        measure the number of visitors to the various sections of our website
        and to identify performance or problem areas. Authorized individuals
        may also use this information to help us develop the site, analyze
        patterns of usage, and to make the site more useful. We do not share
        or sell visitor data for the purposes of advertising, marketing, or
        any other commercial purpose. This information is not used for
        associating search terms or patterns of site navigation with
        individual users. The information that is automatically collected and
        stored concerning your visit includes: the name of the domain from
        which you access the Internet (i.e., HHS.gov if you are connecting
        from a HHS domain, or GMU.edu if you are connecting from George Mason
        University’s domain); the date and time of your visit; the pages you
        visit on the OMB Policy Library; Internet Protocol Address; the
        Internet address of the website you came from if it linked you
        directly to the OMB Policy Library; and search terms that you enter
        into the the OMB Policy Library search tool.
      </p>

      <h4>Google Analytics</h4>
      <p className="max-width-3">
        The OMB Policy Library participates in the U.S.  Digital Analytics
        Program, (DAP) which utilizes a unified Google Analytics account for
        Federal Government agencies. This program helps Federal agencies
        understand how people find, access, and use government services
        online. The DAP is a hosted shared service provided by the General
        Services Administration’s (GSA’s) Office of Citizen Services and
        Innovative Technologies, and the protocol and information collected
        are the same for all websites participating in the DAP. As a
        participant in GSA’s DAP program, this website’s Google Analytics
        traffic data is automatically reported to GSA. Google Analytics is a
        third-party web measurement and customization technology as defined in
        OMB M-10-22. Here is how it works: Google Analytics sets one or more
        cookies on your computer so that it can recognize your computer if you
        visit the the OMB Policy Library website in the future. This cookie(s)
        does not collect personally identifiable information. This is
        considered a Tier 2 usage, as defined in the OMB guidance. Google
        Analytics does not collect personally identifiable information through
        its cookie(s).  The program does not track individuals and anonymizes
        the IP addresses of visitors.
        {' '}
        <Link href="https://www.digitalgov.gov/services/dap/common-questions-about-dap-faq/">
          Common Questions about DAP (FAQ) provides more information about how
          Google Analytics handles IP addresses
        </Link>.
        According to GSA’s Common Questions About DAP, “none of the federal
        government data tracked as part of the Data Analytics Program will be
        shared with or available to Google’s corporate advertising partners.”
        A limited number of authorized individuals will have user accounts
        that will allow them to log in to the Google Analytics dashboard and
        view or run reports regarding visits to the OMB Policy Library and the
        other web metrics available from the DAP. Visitors who choose to
        disable this web measurement tool will still have full access to the
        OMB Policy Library. While the details vary from browser to browser,
        most modern browsers can be set up to accept, reject, or request user
        intervention when a site asks to set a cookie. You can view web
        metrics information at
        {' '}<Link href="https://analytics.usa.gov/">analytics.usa.gov</Link>.
      </p>

      <h4>Information you choose to give the OMB</h4>
      <p className="max-width-3">
        Users of this website may send the OMB feedback or report an issue by
        sending an email to
        {' '}<ContactEmail text={email} />.
        If you choose to send us your personally identifiable information, we
        will only use that information to respond to your message. We only
        share the information you give us with another government agency if
        your question relates to that agency, or as otherwise required by law.
        The OMB Policy Library never collects information or creates
        individual profiles for the purposes of advertising, marketing, or any
        other commercial purpose. We do not create or store lists of email
        addresses or other information to deliver email alerts, newsletters,
        or otherwise send marketing messages or contact individuals. When you
        contact us, any personally identifiable information you provide is
        voluntary. Please do not include sensitive personally identifiable
        information or other sensitive information in the content of your
        email.
      </p>

      <h4>Children and privacy on the OMB policy library</h4>
      <p className="max-width-3">
        We believe in the importance of protecting the privacy of children
        online. The Children’s Online Privacy Protection Act (COPPA) governs
        information gathered online from or about children under the age of
        13. This site is not intended to solicit or collection information of
        any kind from children under age 13. If you believe that we have
        received information from a child under age 13, please contact us at
        {' '}<ContactEmail text={email} />.
      </p>

      <h4>Questions about the privacy policy</h4>
      <p className="max-width-3">
        If you have questions about this privacy policy or the privacy
        practices of the OMB, please submit your questions to
        {' '}<ContactEmail text={email} />.
      </p>

    </div>
  );
}

export default () => <HeaderFooter><PrivacyView /></HeaderFooter>;
