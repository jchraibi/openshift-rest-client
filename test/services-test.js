'use strict';

const test = require('tape');
const nock = require('nock');

const openshiftRestClient = require('../');
const openshiftConfigLoader = require('openshift-config-loader');
const privates = require('../lib/private-map');

test('find - services', (t) => {
  const settings = {
    configLocation: `${__dirname}/test-config`
  };

  openshiftConfigLoader(settings).then((config) => {
    openshiftRestClient(config).then((client) => {
      t.equal(typeof client.services.find, 'function', 'There is a find method on the services object');

      const clientConfig = privates.get(client).config;
      const servicesName = 'nodejs-rest-http';

      nock(clientConfig.cluster)
        .matchHeader('authorization', `Bearer ${clientConfig.user.token}`) // taken from the config
        .get(`/api/v1/namespaces/${clientConfig.context.namespace}/services/${servicesName}`)
        .reply(200, {kind: 'Service'});

      const findResult = client.services.find(servicesName).then((service) => {
        t.equal(service.kind, 'Service', 'returns an object with Service');
        t.end();
      });

      t.equal(findResult instanceof Promise, true, 'should return a Promise');
    });
  });
});

test('create - services', (t) => {
  const settings = {
    configLocation: `${__dirname}/test-config`
  };

  openshiftConfigLoader(settings).then((config) => {
    openshiftRestClient(config).then((client) => {
      t.equal(typeof client.services.create, 'function', 'There is a create method on the services object');

      const clientConfig = privates.get(client).config;
      const service = {
        kind: 'Service'
      };

      nock(clientConfig.cluster)
        .matchHeader('authorization', `Bearer ${clientConfig.user.token}`) // taken from the config
        .post(`/api/v1/namespaces/${clientConfig.context.namespace}/services`)
        .reply(200, {kind: 'Service'});

      const createResult = client.services.create(service).then((service) => {
        t.equal(service.kind, 'Service', 'returns an object with Service');
        t.end();
      });

      t.equal(createResult instanceof Promise, true, 'should return a Promise');
    });
  });
});

test('remove - services - basic remove', (t) => {
  const settings = {
    configLocation: `${__dirname}/test-config`
  };

  openshiftConfigLoader(settings).then((config) => {
    openshiftRestClient(config).then((client) => {
      t.equal(typeof client.services.remove, 'function', 'There is a remove method on the services object');

      const clientConfig = privates.get(client).config;
      const serviceName = 'cool-service-name';

      nock(clientConfig.cluster)
        .matchHeader('authorization', `Bearer ${clientConfig.user.token}`) // taken from the config
        .delete(`/api/v1/namespaces/${clientConfig.context.namespace}/services/${serviceName}`)
        .reply(200, {kind: 'Status'});

      const removeResult = client.services.remove(serviceName).then((status) => {
        t.equal(status.kind, 'Status', 'returns an object with Status');
        t.end();
      });

      t.equal(removeResult instanceof Promise, true, 'should return a Promise');
    });
  });
});

test('remove - services - remove - no rep name', (t) => {
  const settings = {
    configLocation: `${__dirname}/test-config`
  };

  openshiftConfigLoader(settings).then((config) => {
    openshiftRestClient(config).then((client) => {
      client.services.remove().catch((err) => {
        t.equal(err.message, 'Service Name is required', 'error message should return');
        t.end();
      });
    });
  });
});
