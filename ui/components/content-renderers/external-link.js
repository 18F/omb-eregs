import path from 'path';

import PropTypes from 'prop-types';
import React from 'react';
import URL from 'url-parse';

import Link from '../link';
import renderContents from '../../util/render-contents';

export default function ExternalLink({ content }) {
  const classNames = ['external-link-content'];
  if (content.href !== content.text) {
    classNames.push('print-url');
  }
  let iconName = 'fa-external-link';
  const pathname = new URL(content.href).pathname;
  const extension = path.extname(pathname);
  if (extension && !['.html', '.htm'].includes(extension)) {
    iconName = 'fa-file-o';
  }
  return (
    <Link className={classNames.join(' ')} href={content.href}>
      { renderContents(content.inlines) }
      &nbsp;
      <i className={`fa ${iconName}`} aria-hidden="true" />
    </Link>
  );
}
ExternalLink.propTypes = {
  content: PropTypes.shape({
    inlines: PropTypes.arrayOf(PropTypes.shape({})), // recursive
    href: PropTypes.string.isRequired,
  }).isRequired,
};

