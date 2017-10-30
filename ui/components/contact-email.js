import PropTypes from 'prop-types';
import React from 'react';

import Link from './link';

export const email = 'PolicyLibrary@omb.eop.gov';
const mailto = `mailto:${email}`;
const mailtext = `Email ${email}`;

/* Has the same href value every time, making the global email address easy to change. */
export function ContactEmail({ text }) {
  return <Link href={mailto}>{text}</Link>;
}

ContactEmail.defaultProps = {
  text: mailtext,
};

ContactEmail.propTypes = {
  text: PropTypes.string,
};
