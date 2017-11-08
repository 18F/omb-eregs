import { firstMatch, firstWithNodeType, linearize } from '../../util/document-node';

const exampleNode = {
  identifier: '1',
  node_type: 'aaa',
  children: [
    { identifier: '2', node_type: 'bbb', children: [] },
    {
      identifier: '3',
      node_type: 'aaa',
      children: [{ identifier: '4', node_type: 'bbb', children: [] }],
    },
    { identifier: '5', node_type: 'ccc', children: [] },
  ],
};

describe('linearize()', () => {
  it('is recursive', () => {
    const idents = linearize(exampleNode).map(d => d.identifier);
    expect(idents).toEqual(['1', '2', '3', '4', '5']);
  });
});

describe('firstMatch()', () => {
  it('can match the root', () => {
    const result = firstMatch(exampleNode, n => n.identifier === '1');
    expect(result.identifier).toEqual('1');
  });
  it('is recursive', () => {
    const result = firstMatch(exampleNode, n => n.identifier === '4');
    expect(result.identifier).toEqual('4');
  });
  it('grabs only the first', () => {
    const result = firstMatch(
      exampleNode, n => parseInt(n.identifier, 10) % 2 === 0);
    expect(result.identifier).toEqual('2');
  });
});

describe('firstWithNodeType()', () => {
  it('grabs only the first', () => {
    const result = firstWithNodeType(exampleNode, 'bbb');
    expect(result.identifier).toEqual('2');
  });
  it('returns null when there are no matches', () => {
    const result = firstWithNodeType(exampleNode, 'doesnt-exist');
    expect(result).toBeNull();
  });
});