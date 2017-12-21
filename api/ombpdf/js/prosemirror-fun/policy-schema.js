import {Schema} from "prosemirror-model";
import {schema as basicSchema} from "prosemirror-schema-basic";
import {addListNodes} from "prosemirror-schema-list";


function addSectionNodes(nodes) {
  return nodes.append({
    section: {
      content: 'block+',
      parseDOM: [{tag: 'div'}],
      toDOM() { return ["div", 0]; },
    }
  });
}

const policySchema = new Schema({
  nodes: addSectionNodes(
    addListNodes(basicSchema.spec.nodes, "paragraph block", "block")
  ),
  marks: basicSchema.spec.marks,
});

export default policySchema;
