import Paragraph from '../../../components/node-renderers/para';
import {
  itIncludesNodeText,
  itIncludesTheIdentifier,
  itRendersChildNodes,
} from '../../test-utils/node-renderers';

jest.mock('../../../util/render-node');

describe('<Paragraph />', () => {
  itIncludesTheIdentifier(Paragraph);
  itIncludesNodeText(Paragraph);
  itRendersChildNodes(Paragraph);
});
