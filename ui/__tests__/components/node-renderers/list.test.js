import List from '../../../components/node-renderers/list';
import {
  itIncludesTheIdentifier,
  itRendersChildNodes,
} from '../../test-utils/node-renderers';

jest.mock('../../../util/render-node');

describe('<List />', () => {
  itIncludesTheIdentifier(List);
  itRendersChildNodes(List);
});

