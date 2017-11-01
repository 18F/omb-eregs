/* Overrides Next.js's root document class to tweak the markup */
import Document, { Head, Main, NextScript } from 'next/document';
import React from 'react';

export default class LangDocument extends Document {
  render() {
    return (
      <html lang="en-US">
        <Head />
        <body className="document-container">
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
