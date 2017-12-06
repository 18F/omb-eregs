import PropTypes from 'prop-types';
import React from 'react';

import HeaderFooter from '../components/header-footer';
import Link from '../components/link';
import LabeledText from '../components/labeled-text';

const GITHUB_URL = 'https://github.com/18F/omb-eregs';

function Example({ children }) {
  return (
    <div style={{
      border: '1px solid lightgray',
      padding: '1rem 2.5rem',
    }}
    >
      <h4 style={{
        textTransform: 'uppercase',
        color: 'gray',
        letterSpacing: 1,
        fontSize: '1em',
      }}
      >Example</h4>
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

  // TODO: If we're in debug mode and running on the server, we should
  // check to make sure this path actually exists on the filesystem,
  // to prevent documentation rot.

  return <Link href={ghPath}><code>{fullPath}</code></Link>;
}

CssLink.propTypes = {
  path: PropTypes.string.isRequired,
};

export function Styleguide() {
  return (
    <div style={{
      padding: '1rem',
    }}
    >
      <h2>Style guide</h2>
      <p>This is a style guide.</p>
      <p>Sorry there isn&rsquo;t much here yet.</p>
      <h3>Typography</h3>
      <p>
        Most CSS for the base typography is defined in {' '}
        <CssLink path="layout/_typography.scss" />.
      </p>
      <Example>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
        <p>
          {`Paragraph body text go paragraph body text go.
            Paragraph body text go. Paragraph body text go paragraph body
            text go. Paragraph body text go. Paragraph body text go
            paragraph body text go. Paragraph body text go. Paragraph
            body text go paragraph body text go. Paragraph body text go. 
            Paragraph body text go paragraph body text go. Paragraph body
            text go.`}
        </p>
        <ul>
          <li>Here is</li>
          <li>An unordered list.</li>
        </ul>
        <ol>
          <li>Here is</li>
          <li>An ordered list.</li>
        </ol>
      </Example>
      <h3>Labeled text</h3>
      <Example>
        <LabeledText label="Label" id="l1">I am some labeled text.</LabeledText>
      </Example>
      <h3>Policy document styles</h3>
      <p>
        {`In the future, we should have examples of our policy document
          styles here. It might actually be easiest to just create a
          fake, development-only policy document that just contains a
          "kitchen sink" of anything that can possibly appear in a
          policy document.`}
      </p>
      <p>
        For now, most policy document styles can be seen on {' '}
        <Link href="/document/M-16-19">M-16-19</Link>.
      </p>
    </div>
  );
}

export default () => <HeaderFooter><Styleguide /></HeaderFooter>;
