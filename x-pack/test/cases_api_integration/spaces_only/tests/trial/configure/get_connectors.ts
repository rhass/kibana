/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../../../../../common/ftr_provider_context';

import { ObjectRemover as ActionsRemover } from '../../../../../alerting_api_integration/common/lib';
import {
  getServiceNowConnector,
  getServiceNowOAuthConnector,
  getJiraConnector,
  getResilientConnector,
  createConnector,
  getServiceNowSIRConnector,
  getAuthWithSuperUser,
  getCaseConnectors,
  getActionsSpace,
  getEmailConnector,
} from '../../../../common/lib/utils';

// eslint-disable-next-line import/no-default-export
export default ({ getService }: FtrProviderContext): void => {
  const supertest = getService('supertest');
  const actionsRemover = new ActionsRemover(supertest);
  const authSpace1 = getAuthWithSuperUser();
  const space = getActionsSpace(authSpace1.space);

  describe('get_connectors', () => {
    afterEach(async () => {
      await actionsRemover.removeAll();
    });

    it('should return the correct connectors in space1', async () => {
      const snConnector = await createConnector({
        supertest,
        req: getServiceNowConnector(),
        auth: authSpace1,
      });
      const snOAuthConnector = await createConnector({
        supertest,
        req: getServiceNowOAuthConnector(),
        auth: authSpace1,
      });
      const emailConnector = await createConnector({
        supertest,
        req: getEmailConnector(),
        auth: authSpace1,
      });

      const jiraConnector = await createConnector({
        supertest,
        req: getJiraConnector(),
        auth: authSpace1,
      });

      const resilientConnector = await createConnector({
        supertest,
        req: getResilientConnector(),
        auth: authSpace1,
      });

      const sir = await createConnector({
        supertest,
        req: getServiceNowSIRConnector(),
        auth: authSpace1,
      });

      actionsRemover.add(space, sir.id, 'action', 'actions');
      actionsRemover.add(space, snConnector.id, 'action', 'actions');
      actionsRemover.add(space, snOAuthConnector.id, 'action', 'actions');
      actionsRemover.add(space, emailConnector.id, 'action', 'actions');
      actionsRemover.add(space, jiraConnector.id, 'action', 'actions');
      actionsRemover.add(space, resilientConnector.id, 'action', 'actions');

      const connectors = await getCaseConnectors({ supertest, auth: authSpace1 });
      const sortedConnectors = connectors.sort((a, b) => a.name.localeCompare(b.name));

      expect(sortedConnectors).to.eql([
        {
          id: jiraConnector.id,
          actionTypeId: '.jira',
          name: 'Jira Connector',
          config: {
            apiUrl: 'http://some.non.existent.com',
            projectKey: 'pkey',
          },
          isPreconfigured: false,
          isDeprecated: false,
          isMissingSecrets: false,
          referencedByCount: 0,
        },
        /**
         * Preconfigured connectors are being registered here:
         * x-pack/test/cases_api_integration/common/config.ts
         */
        {
          actionTypeId: '.servicenow',
          id: 'preconfigured-servicenow',
          isPreconfigured: true,
          isDeprecated: false,
          name: 'preconfigured-servicenow',
          referencedByCount: 0,
        },
        {
          id: resilientConnector.id,
          actionTypeId: '.resilient',
          name: 'Resilient Connector',
          config: {
            apiUrl: 'http://some.non.existent.com',
            orgId: 'pkey',
          },
          isPreconfigured: false,
          isDeprecated: false,
          isMissingSecrets: false,
          referencedByCount: 0,
        },
        {
          id: snConnector.id,
          actionTypeId: '.servicenow',
          name: 'ServiceNow Connector',
          config: {
            apiUrl: 'http://some.non.existent.com',
            usesTableApi: false,
            isOAuth: false,
            clientId: null,
            jwtKeyId: null,
            userIdentifierValue: null,
          },
          isPreconfigured: false,
          isDeprecated: false,
          isMissingSecrets: false,
          referencedByCount: 0,
        },
        {
          id: snOAuthConnector.id,
          actionTypeId: '.servicenow',
          name: 'ServiceNow OAuth Connector',
          config: {
            apiUrl: 'http://some.non.existent.com',
            usesTableApi: false,
            isOAuth: true,
            clientId: 'abc',
            userIdentifierValue: 'elastic',
            jwtKeyId: 'def',
          },
          isPreconfigured: false,
          isDeprecated: false,
          isMissingSecrets: false,
          referencedByCount: 0,
        },
        {
          id: sir.id,
          actionTypeId: '.servicenow-sir',
          name: 'ServiceNow SIR Connector',
          config: {
            apiUrl: 'http://some.non.existent.com',
            usesTableApi: false,
            isOAuth: false,
            clientId: null,
            jwtKeyId: null,
            userIdentifierValue: null,
          },
          isPreconfigured: false,
          isDeprecated: false,
          isMissingSecrets: false,
          referencedByCount: 0,
        },
      ]);
    });

    it('should not return any connectors when looking in the wrong space', async () => {
      const snConnector = await createConnector({
        supertest,
        req: getServiceNowConnector(),
        auth: authSpace1,
      });

      const snOAuthConnector = await createConnector({
        supertest,
        req: getServiceNowOAuthConnector(),
        auth: authSpace1,
      });

      const emailConnector = await createConnector({
        supertest,
        req: getEmailConnector(),
        auth: authSpace1,
      });

      const jiraConnector = await createConnector({
        supertest,
        req: getJiraConnector(),
        auth: authSpace1,
      });

      const resilientConnector = await createConnector({
        supertest,
        req: getResilientConnector(),
        auth: authSpace1,
      });

      const sir = await createConnector({
        supertest,
        req: getServiceNowSIRConnector(),
        auth: authSpace1,
      });

      actionsRemover.add(space, sir.id, 'action', 'actions');
      actionsRemover.add(space, snConnector.id, 'action', 'actions');
      actionsRemover.add(space, snOAuthConnector.id, 'action', 'actions');
      actionsRemover.add(space, emailConnector.id, 'action', 'actions');
      actionsRemover.add(space, jiraConnector.id, 'action', 'actions');
      actionsRemover.add(space, resilientConnector.id, 'action', 'actions');

      const connectors = await getCaseConnectors({
        supertest,
        auth: getAuthWithSuperUser('space2'),
      });

      expect(connectors).to.eql([
        /**
         * Preconfigured connectors are being registered here:
         * x-pack/test/cases_api_integration/common/config.ts
         */
        {
          actionTypeId: '.servicenow',
          id: 'preconfigured-servicenow',
          isPreconfigured: true,
          isDeprecated: false,
          name: 'preconfigured-servicenow',
          referencedByCount: 0,
        },
      ]);
    });
  });
};
