import Td from '../../../components/node-renderers/td';
import {
  itRendersFootnoteCitationsDifferently,
  itUsesTheAppropriateTag,
} from '../../test-utils/tables';

describe('<Td />', () => {
  itRendersFootnoteCitationsDifferently(Td);
  itUsesTheAppropriateTag(Td, 'td');
});
