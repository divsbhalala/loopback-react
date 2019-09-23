import React from 'react';
import { shallow } from 'enzyme';
import NpiUsers from './NpiUsers';

describe('<NpiUsers />', () => {
  test('renders', () => {
    const wrapper = shallow(<NpiUsers />);
    expect(wrapper).toMatchSnapshot();
  });
});
