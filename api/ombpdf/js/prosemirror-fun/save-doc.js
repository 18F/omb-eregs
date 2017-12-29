function convertContent(node, dbNode) {
  const children = [];
  const content = [];

  node.content.forEach(c => {
    const childConverter = CHILD_CONVERTERS[c.type];
    const contentConverter = CONTENT_CONVERTERS[c.type];

    if (childConverter) {
      children.push(childConverter(c));
    } else if (contentConverter) {
      content.push(contentConverter(c));
    } else {
      throw new Error(`No converter found for type ${c.type}`);
    }
  });

  if (children.length) {
    dbNode.children = children;
  }
  if (content.length) {
    dbNode.content = content;
  }

  return dbNode;
}

export const CONTENT_CONVERTERS = {
  text(node) {
    return {
      content_type: '__text__',
      text: node.text,
    };
  }
};

export const CHILD_CONVERTERS = {
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
