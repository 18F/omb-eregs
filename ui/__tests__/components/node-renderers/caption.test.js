import Caption from '../../../components/node-renderers/caption';
import {
  itRendersFootnoteCitationsDifferently,
  itUsesTheAppropriateTag,
} from '../../test-utils/tables';

describe('<Caption />', () => {
  itRendersFootnoteCitationsDifferently(Caption);
  itUsesTheAppropriateTag(Caption, 'caption');
});

