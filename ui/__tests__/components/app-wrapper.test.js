import { shallow } from 'enzyme';
import React from 'react';
import wrapPage from '../../components/app-wrapper';


describe('wrapPage()', () => {
  const ExamplePage = () => <div>Content</div>;

  describe('getInitialProps()', () => {
    it('passes fetched data', async () => {
      const dataFn = jest.fn(async () => ({ some: 'data' }));
      const Wrapped = wrapPage(ExamplePage, dataFn);
      const results = await Wrapped.getInitialProps({ a: 'context' });

      expect(results).toEqual({ some: 'data' });
      expect(dataFn).toHaveBeenCalledWith({ a: 'context' });
    });
    it('handles errors', async () => {
      const err = new Error('oy');
      const dataFn = jest.fn(async () => { throw err; });
      const Wrapped = wrapPage(ExamplePage, dataFn);
      const results = await Wrapped.getInitialProps();

      expect(results).toEqual({ err });
    });
    it('allows fetched data to trigger a 404', async () => {
      const dataFn = jest.fn(async () => ({ statusCode: 404 }));
      const Wrapped = wrapPage(ExamplePage, dataFn);
      const results = await Wrapped.getInitialProps();

      expect(results).toEqual({ statusCode: 404 });
    });
  });
  describe('render()', () => {
    const Wrapped = wrapPage(ExamplePage, jest.fn());
    it('renders content if no error', () => {
      const result = shallow(<Wrapped arg1="some value" />);

      expect(result.name()).toBe('HeaderFooter');
      expect(result.find('ExamplePage')).toHaveLength(1);
      expect(result.find('ExamplePage').first().prop('arg1')).toBe('some value');
    });
    it('renders an error, with no explicit status code', () => {
      const err = new Error('oh noes');
      const result = shallow(<Wrapped err={err} />);

      expect(result.name()).toBe('ErrorView');
      expect(result.find('ErrorView')).toHaveLength(1);
      expect(result.find('ErrorView').first().props()).toEqual({
        err,
        statusCode: null,
      });
    });
    it('renders an error, with an explicit status code', () => {
      const result = shallow(<Wrapped statusCode={404} />);

      expect(result.name()).toBe('ErrorView');
      expect(result.find('ErrorView')).toHaveLength(1);
      expect(result.find('ErrorView').first().props()).toEqual({
        err: null,
        statusCode: 404,
      });
    });
  });
});
