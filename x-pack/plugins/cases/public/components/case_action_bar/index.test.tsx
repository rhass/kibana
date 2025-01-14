/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { mount } from 'enzyme';
import { render } from '@testing-library/react';

import { basicCase, caseUserActions, getAlertUserAction } from '../../containers/mock';
import { CaseActionBar, CaseActionBarProps } from '.';
import { TestProviders } from '../../common/mock';
import { useGetCaseUserActions } from '../../containers/use_get_case_user_actions';
import { useRefreshCaseViewPage } from '../case_view/use_on_refresh_case_view_page';

jest.mock('../../containers/use_get_case_user_actions');
jest.mock('../case_view/use_on_refresh_case_view_page');

const useGetCaseUserActionsMock = useGetCaseUserActions as jest.Mock;
const defaultUseGetCaseUserActions = {
  data: {
    caseUserActions: [...caseUserActions, getAlertUserAction()],
    caseServices: {},
    hasDataToPush: false,
    participants: [basicCase.createdBy],
  },
  isLoading: false,
  isError: false,
};

describe('CaseActionBar', () => {
  const onUpdateField = jest.fn();
  const defaultProps = {
    allCasesNavigation: {
      href: 'all-cases-href',
      onClick: () => {},
    },
    caseData: basicCase,
    disableAlerting: false,
    isLoading: false,
    onUpdateField,
    currentExternalIncident: null,
    userCanCrud: true,
    metricsFeatures: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useGetCaseUserActionsMock.mockReturnValue(defaultUseGetCaseUserActions);
  });

  it('renders', () => {
    const wrapper = mount(
      <TestProviders>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );

    expect(wrapper.find(`[data-test-subj="case-view-status"]`).exists()).toBeTruthy();
    expect(wrapper.find(`[data-test-subj="case-action-bar-status-date"]`).exists()).toBeTruthy();
    expect(wrapper.find(`[data-test-subj="case-view-status-dropdown"]`).exists()).toBeTruthy();
    expect(wrapper.find(`[data-test-subj="sync-alerts-switch"]`).exists()).toBeTruthy();
    expect(wrapper.find(`[data-test-subj="case-refresh"]`).exists()).toBeTruthy();
    expect(wrapper.find(`[data-test-subj="case-view-actions"]`).exists()).toBeTruthy();
    // no loading bar
    expect(wrapper.find(`[data-test-subj="case-view-action-bar-spinner"]`).exists()).toBeFalsy();
  });

  it('shows a loading bar when user actions are loaded', async () => {
    useGetCaseUserActionsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    const wrapper = mount(
      <TestProviders>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );
    expect(wrapper.find(`[data-test-subj="case-view-action-bar-spinner"]`).exists()).toBeTruthy();
  });

  it('should show correct status', () => {
    const wrapper = mount(
      <TestProviders>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );

    expect(wrapper.find(`[data-test-subj="case-view-status-dropdown"]`).first().text()).toBe(
      'Open'
    );
  });

  it('should show the correct date', () => {
    const wrapper = mount(
      <TestProviders>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );

    expect(wrapper.find(`[data-test-subj="case-action-bar-status-date"]`).prop('value')).toBe(
      basicCase.createdAt
    );
  });

  it('invalidates the queryClient cache onRefresh', () => {
    const wrapper = mount(
      <TestProviders>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );

    wrapper.find(`[data-test-subj="case-refresh"]`).first().simulate('click');

    expect(useRefreshCaseViewPage()).toHaveBeenCalled();
  });

  it('should call onUpdateField when changing status', () => {
    const wrapper = mount(
      <TestProviders>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );

    wrapper.find(`[data-test-subj="case-view-status-dropdown"] button`).simulate('click');
    wrapper
      .find(`[data-test-subj="case-view-status-dropdown-in-progress"] button`)
      .simulate('click');

    expect(onUpdateField).toHaveBeenCalledWith({ key: 'status', value: 'in-progress' });
  });

  it('should call onUpdateField when changing syncAlerts setting', () => {
    const wrapper = mount(
      <TestProviders>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );

    wrapper.find('button[data-test-subj="sync-alerts-switch"]').first().simulate('click');

    expect(onUpdateField).toHaveBeenCalledWith({
      key: 'settings',
      value: {
        syncAlerts: false,
      },
    });
  });

  it('should not show the sync alerts toggle when alerting is disabled', () => {
    const { queryByText } = render(
      <TestProviders features={{ alerts: { sync: false, enabled: true }, metrics: [] }}>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );

    expect(queryByText('Sync alerts')).not.toBeInTheDocument();
  });

  it('should show the sync alerts toggle when alerting is enabled', () => {
    const { queryByText } = render(
      <TestProviders>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );

    expect(queryByText('Sync alerts')).toBeInTheDocument();
  });

  it('should not show the Case open text when the lifespan feature is enabled', () => {
    const props: CaseActionBarProps = { ...defaultProps };
    const { queryByText } = render(
      <TestProviders features={{ metrics: ['lifespan'] }}>
        <CaseActionBar {...props} />
      </TestProviders>
    );

    expect(queryByText('Case opened')).not.toBeInTheDocument();
  });

  it('should show the Case open text when the lifespan feature is disabled', () => {
    const { getByText } = render(
      <TestProviders>
        <CaseActionBar {...defaultProps} />
      </TestProviders>
    );

    expect(getByText('Case opened')).toBeInTheDocument();
  });
});
