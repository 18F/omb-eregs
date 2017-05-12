import { forwardedIPAuth } from '../auth';


describe('forwardedIPAuth', () => {
  function testStrategy(config, ip) {
    const strategy = forwardedIPAuth(config);
    strategy.success = jest.fn();
    strategy.fail = jest.fn();

    strategy.authenticate({ get: jest.fn(() => ip) });
    return strategy;
  }

  it('defaults to closed', () => {
    const strategy = testStrategy([], '1.1.1.1');
    expect(strategy.success).not.toHaveBeenCalled();
    expect(strategy.fail).toHaveBeenCalled();
  });

  it('can be configured with individual ips', () => {
    let strategy = testStrategy(['1.1.1.1', '2.2.2.2'], '2.2.2.2');
    expect(strategy.success).toHaveBeenCalled();
    expect(strategy.fail).not.toHaveBeenCalled();

    strategy = testStrategy(['1.1.1.1', '2.2.2.2'], '1.1.1.2');
    expect(strategy.success).not.toHaveBeenCalled();
    expect(strategy.fail).toHaveBeenCalled();
  });

  it('can be configured with ranges', () => {
    let strategy = testStrategy(['1.1.1.0/24', '2.2.2.2'], '2.2.2.1');
    expect(strategy.success).not.toHaveBeenCalled();
    expect(strategy.fail).toHaveBeenCalled();

    strategy = testStrategy(['1.1.1.0/24', '2.2.2.2'], '1.1.1.8');
    expect(strategy.success).toHaveBeenCalled();
    expect(strategy.fail).not.toHaveBeenCalled();
  });
});
