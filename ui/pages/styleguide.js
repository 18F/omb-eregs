import PropTypes from 'prop-types';
import React from 'react';

import wrapPage from '../components/app-wrapper';
import Link from '../components/link';
import LabeledText from '../components/labeled-text';

const GITHUB_URL = 'https://github.com/18F/omb-eregs';

function Example({ children }) {
  return (
    <div className="styleguide-example">
      <h4>Example</h4>
      {children}
    </div>
  );
}

Example.propTypes = {
  children: PropTypes.node.isRequired,
};

function CssLink({ path }) {
  const fullPath = `ui/css/${path}`;
  const ghPath = `${GITHUB_URL}/blob/master/${fullPath}`;

  return (
    <Link href={ghPath}>
      <code>{fullPath}</code>
    </Link>
  );
}

CssLink.propTypes = {
  path: PropTypes.string.isRequired,
};

function styleguideHeader() {
  return (
    <div>
      <h2>Style guide</h2>
      <p>This is a style guide.</p>
      <p>Sorry there isn&rsquo;t much here yet.</p>
    </div>
  );
}

function styleguideTypographyHeading() {
  return (
    <div>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
    </div>
  );
}

function styleguideTypographyParagraph() {
  return (
    <div>
      <p>
        {`Paragraph body text go paragraph body text go.
          Paragraph body text go. Paragraph body text go paragraph body
          text go. Paragraph body text go. Paragraph body text go
          paragraph body text go. Paragraph body text go. Paragraph
          body text go paragraph body text go. Paragraph body text go.
          Paragraph body text go paragraph body text go. Paragraph body
          text go.`}
      </p>
    </div>
  );
}

function styleguideTypographyLists() {
  return (
    <div>
      <ul>
        <li>Here is</li>
        <li>An unordered list.</li>
      </ul>
      <ol>
        <li>Here is</li>
        <li>An ordered list.</li>
      </ol>
    </div>
  );
}

function styleguideTypography() {
  return (
    <div>
      <h3>Typography</h3>
      <p>
        Most CSS for the base typography is defined in {' '}
        <CssLink path="layout/_typography.scss" />.
      </p>
      <Example>
        { styleguideTypographyHeading() }
        { styleguideTypographyParagraph() }
        { styleguideTypographyLists() }
      </Example>
    </div>
  );
}

function styleguideLabeledText() {
  return (
    <div>
      <h3 className="example-title">Labeled text</h3>
      <Example>
        <LabeledText label="Label" id="l1">I am some labeled text.</LabeledText>
      </Example>
    </div>
  );
}

function styleguidePolicyDocument() {
  return (
    <div>
      <h3 className="example-title">Policy document styles</h3>
      <p>
        {`In the future, we should have examples of our policy document
          styles here. It might actually be easiest to just create a
          fake, development-only policy document that just contains a
          "kitchen sink" of anything that can possibly appear in a
          policy document.`}
      </p>
      <p>
        For now, most policy document styles can be seen on {' '}
        <Link route="document" params={{ policyId: 'M-16-19' }}>M-16-19</Link>.
      </p>
    </div>
  );
}

export function Styleguide() {
  return (
    <div className="styleguide-container">
      { styleguideHeader() }
      { styleguideTypography() }
      { styleguideLabeledText() }
      { styleguidePolicyDocument() }
    </div>
  );
}

export default wrapPage(Styleguide, () => Promise.resolve());
