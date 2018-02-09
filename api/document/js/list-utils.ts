import { Node, ResolvedPos } from 'prosemirror-model';
import * as repeatString from 'repeat-string';
import * as romanize from 'romanize';

import schema, { factory } from './schema';
import { walkUpUntil } from './util';

const defaultBullet = '●';
const bulletFollows = {
  '●': '○',
  '○': '■',
};

export function deeperBullet(pos: ResolvedPos): string {
  const liDepth = walkUpUntil(pos, node => node.type === schema.nodes.listitem);
  if (liDepth >= 0) {
    const parListItem = pos.node(liDepth);
    return bulletFollows[parListItem.attrs.marker] || defaultBullet;
  }
  return defaultBullet;
}

function makeIntToLetter(initial: string) {
  const offset = initial.charCodeAt(0);

  return (idx: number) => {
    const count = Math.floor(idx / 26) + 1;
    const letter = String.fromCharCode(offset + idx % 26);
    return repeatString(letter, count);
  };
}

const firstToMapper = {
  'a': makeIntToLetter('a'),
  'A': makeIntToLetter('A'),
  // our input will be zero indexed
  '1': (idx: number) => `${idx + 1}`,
  'i': (idx: number) => romanize(idx + 1).toLowerCase(),
  'I': (idx: number) => romanize(idx + 1),
};
const lastMatch = new RegExp(/^.*([aA1iI])[^aA1iI]*$/, 'm');

export function createMarkerTemplate(toImitate: string) {
  const match = lastMatch.exec(toImitate);
  if (match) {
    const matchingChar = match[1];
    const prefixEnds = toImitate.lastIndexOf(matchingChar);
    return (idx: number) => (
      toImitate.substr(0, prefixEnds)
      + firstToMapper[matchingChar](idx)
      + toImitate.substr(prefixEnds + 1)
    );
  }
  return (marker: number) => toImitate;
}
