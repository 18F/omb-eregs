export function convertContent(node, dbNode) {
  const children = [];
  const content = [];

  for (let i = 0; i < node.content.length; i++) {
    const c = node.content[i];
    const childConverter = CHILD_CONVERTERS[c.type];
    const contentConverter = CONTENT_CONVERTERS[c.type];

    if (childConverter) {
      const result = childConverter(c, node.content.slice(i + 1));
      if (Array.isArray(result)) {
        const [child, skipCount] = result;
        i += skipCount;
        children.push(child);
      } else {
        children.push(result);
      }
    } else if (contentConverter) {
      content.push(contentConverter(c));
    } else {
      throw new Error(`No converter found for type ${c.type}`);
    }
  }

  if (children.length) {
    dbNode.children = (dbNode.children || []).concat(children);
  }
  if (content.length) {
    dbNode.content = (dbNode.content || []).concat(content);
  }

  return dbNode;
}

const PARAGRAPH_CHILDREN = [
  'footnote',
];

export const CONTENT_CONVERTERS = {
  text(node) {
    return {
      content_type: '__text__',
      text: node.text,
    };
  }
};

export const CHILD_CONVERTERS = {
  footnote(node) {
    return convertContent(node, {
      node_type: 'footnote',
      marker: node.attrs.marker,
    });
  },
  paragraph(node, rest) {
    const para = convertContent(node, {
      node_type: 'para',
    });
    let skipCount = 0;
    for (let i = 0; i < rest.length; i++) {
      const c = rest[i];
      if (!PARAGRAPH_CHILDREN.includes(c.type)) break;
      convertContent({content: [c]}, para);
      skipCount++;
    }
    return [para, skipCount];
  },
  heading(node) {
    return convertContent(node, {
      node_type: 'heading',
    });
  },
  section(node) {
    const section = convertContent(node, {
      node_type: 'sec',
    });
    const firstChild = node.content[0];
    if (firstChild && firstChild.type === 'heading') {
      section.title = firstChild.content[0].text;
    }
    return section;
  },
};

function proseMirrorDocToDbDoc(doc) {
  return convertContent(doc, {
    node_type: 'policy',
  });
}

export default function saveDocument(state, dispatch, view) {
  if (!dispatch) {
    return true;
  }

  const doc = proseMirrorDocToDbDoc(state.doc.toJSON());
  const data = new FormData();

  data.append('doc', JSON.stringify(doc));

  return window.fetch(window.location.pathname, {
    method: 'POST',
    body: data,
  }).then(res => res.json())
    .then(res => console.log(res));
}
