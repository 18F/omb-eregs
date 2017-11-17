import Th from '../../../components/node-renderers/th';
import {
  itRendersFootnoteCitationsDifferently,
  itUsesTheAppropriateTag,
} from '../../test-utils/tables';

describe('<Th />', () => {
  itRendersFootnoteCitationsDifferently(Th);
  itUsesTheAppropriateTag(Th, 'th');
});

