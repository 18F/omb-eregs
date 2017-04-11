import React from 'react';


export default function FourHundred({ message }) {
  const title = 'Invalid Request';
  return (
    <html lang="en-US">
      <head>
        <title>{ title }</title>
      </head>
      <body>
        <h1>{ title }</h1>
        <p>{ message }</p>
      </body>
    </html>
  );
}
FourHundred.defaultProps = {
  message: '',
};
FourHundred.propTypes = {
  message: React.PropTypes.string,
};

