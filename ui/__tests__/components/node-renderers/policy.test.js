import Policy from '../../../components/node-renderers/policy';
import {
  itIncludesTheIdentifier,
  itRendersChildNodes,
} from '../../test-utils/node-renderers';

jest.mock('../../../util/render-node');

describe('<Policy />', () => {
  itIncludesTheIdentifier(Policy);
  itRendersChildNodes(Policy);
});
