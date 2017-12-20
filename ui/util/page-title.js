import Head from 'next/head';
import React from 'react';

export default function pageTitle(prefix) {
  let title = 'OMB Policy Library (Beta)';
  if (prefix) {
    title = `${prefix} | ${title}`;
  }
  return <Head><title key="title">{ title }</title></Head>;
}
