'use strict';

/**
 * chair service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::chair.chair');
