import DocumentNode from '../../util/document-node';

const exampleNode = new DocumentNode({
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
});

describe('linearize()', () => {
  it('is recursive', () => {
    const idents = exampleNode.linearize().map(d => d.identifier);
    expect(idents).toEqual(['1', '2', '3', '4', '5']);
  });
});

describe('firstMatch()', () => {
  it('can match the root', () => {
    const result = exampleNode.firstMatch(n => n.identifier === '1');
    expect(result.identifier).toEqual('1');
  });
  it('is recursive', () => {
    const result = exampleNode.firstMatch(n => n.identifier === '4');
    expect(result.identifier).toEqual('4');
  });
  it('grabs only the first', () => {
    const result = exampleNode.firstMatch(
      n => parseInt(n.identifier, 10) % 2 === 0);
    expect(result.identifier).toEqual('2');
  });
});

describe('firstWithNodeType()', () => {
  it('grabs only the first', () => {
    const result = exampleNode.firstWithNodeType('bbb');
    expect(result.identifier).toEqual('2');
  });
  it('returns null when there are no matches', () => {
    const result = exampleNode.firstWithNodeType('doesnt-exist');
    expect(result).toBeNull();
  });
});

describe('hasAncestor()', () => {
  it('must be present', () => {
    const node = new DocumentNode({ identifier: 'aaa_1__bbb_2__ccc_3' });
    expect(node.hasAncestor('ddd')).toBe(false);
    expect(node.hasAncestor('bbb')).toBe(true);
  });
  it('must be an exact match', () => {
    const node = new DocumentNode({ identifier: 'aaa_1__bbbb_2__ccc_3' });
    expect(node.hasAncestor('bbb')).toBe(false);
    expect(node.hasAncestor('bbbb')).toBe(true);
  });
});
