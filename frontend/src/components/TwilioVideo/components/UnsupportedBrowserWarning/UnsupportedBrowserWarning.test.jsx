import React from 'react';
import UnsupportedBrowserWarning from './UnsupportedBrowserWarning';
import Video from 'twilio-video';
import { shallow } from 'enzyme';

describe('the UnsupportedBrowserWarning component', () => {
  it('should render correctly when isSupported is false', () => {
    Video.isSupported = false;
    const wrapper = shallow(
      <UnsupportedBrowserWarning>
        <span>Is supported</span>
      </UnsupportedBrowserWarning>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render children when isSupported is true', () => {
    Video.isSupported = true;
    const wrapper = shallow(
      <UnsupportedBrowserWarning>
        <span>Is supported</span>
      </UnsupportedBrowserWarning>,
    );
    expect(wrapper.text()).toBe('Is supported');
  });
});
