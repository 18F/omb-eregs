export function convertContent(node, dbNode, context) {
  const children = [];
  const content = [];

  for (let i = 0; i < node.content.length; i++) {
    const c = node.content[i];
    const childConverter = CHILD_CONVERTERS[c.type];
    const contentConverter = CONTENT_CONVERTERS[c.type];

    if (childConverter) {
      let result = childConverter(c, node.content.slice(i + 1), context);
      if (!Array.isArray(result)) {
        result = [result, 0];
      }
      const [child, skipCount] = result;
      i += skipCount;
      children.push(child);
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

function convertWhile(array, dbNode, predicate) {
  let count = 0;
  for (let i = 0; i < array.length; i++) {
    if (!predicate(array[i])) break;
    convertContent({content: [array[i]]}, dbNode);
    count++;
  }
  return count;
}

function convertList(node) {
  return convertContent(node, {
    node_type: 'list',
  }, {
    list: node,
    counter: 0,
  });
}

export function ordinalToLetter(i) {
  const LOWERCASE_A_CODEPOINT = 97;

  return String.fromCodePoint(LOWERCASE_A_CODEPOINT + i - 1);
}

function textNode(text) {
  return {
    content_type: '__text__',
    text,
  };
}

const PARAGRAPH_CHILDREN = [
  'footnote',
];

export const MARK_CONVERTERS = {
  external_link(node, mark) {
    return {
      content_type: 'external_link',
      text: node.text,
      href: mark.attrs.href,
      inlines: [textNode(node.text)],
    };
  },
  footnote_citation(node, mark) {
    return {
      content_type: 'footnote_citation',
      text: node.text,
      inlines: [textNode(node.text)],
    };
  },
};

export const CONTENT_CONVERTERS = {
  text(node) {
    if (node.marks && node.marks.length > 0) {
      if (node.marks.length > 1) {
        throw new Error('nodes w/ multiple marks are currently unsupported');
      }
      const mark = node.marks[0];
      const converter = MARK_CONVERTERS[mark.type];

      if (!converter) {
        throw new Error(`No converter found for mark type ${mark.type}`);
      }
      return converter(node, mark);
    }
    return textNode(node.text);
  },
  unimplemented_content(node) {
    return JSON.parse(node.attrs.data);
  },
};

export const CHILD_CONVERTERS = {
  footnote(node) {
    return convertContent(node, {
      node_type: 'footnote',
      marker: node.attrs.marker,
    });
  },
  list_item(node, rest, context) {
    let marker;
    let emblem = context.counter.toString();

    context.counter++;

    if (context.list.type === 'bullet_list') {
      marker = '●';
    } else {
      const className = context.list.attrs.className;
      if (className === 'list-type-numbered') {
        marker = `${context.counter}.`;
      } else if (className === 'list-type-lettered') {
        emblem = ordinalToLetter(context.counter);
        marker = `${emblem}.`;
      } else {
        throw new Error(`unknown list className: ${className}`);
      }
    }

    return convertContent(node, {
      node_type: 'listitem',
      type_emblem: emblem,
      marker,
    });
  },
  bullet_list(node) {
    return convertList(node);
  },
  ordered_list(node) {
    return convertList(node);
  },
  paragraph(node, rest) {
    const para = convertContent(node, {
      node_type: 'para',
    });
    const skipCount = convertWhile(rest, para, c => {
      return PARAGRAPH_CHILDREN.includes(c.type)
    });
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
  unimplemented_child(node) {
    return JSON.parse(node.attrs.data);
  },
};

function proseMirrorDocToDbDoc(doc) {
  return convertContent(doc, {
    node_type: 'policy',
    meta: {
      policy: {
        omb_policy_id: doc.attrs.ombPolicyId,
      },
    },
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
