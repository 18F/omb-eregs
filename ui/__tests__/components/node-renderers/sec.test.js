import { Section } from '../../../components/node-renderers/sec';
import {
  itIncludesTheIdentifier,
  itRendersChildNodes,
} from '../../test-utils/node-renderers';

jest.mock('../../../util/render-node');

describe('<Section />', () => {
  itIncludesTheIdentifier(Section);
  itRendersChildNodes(Section);
});
