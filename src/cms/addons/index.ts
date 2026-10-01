import { Hono } from 'hono';
import type { Bindings } from '../types';
import { registerPluginMenu, registerPluginView, registerPluginScript } from '../registry/admin-menu';
import { aggregatorRouter } from './aggregator/router';
import { aggregatorView } from './aggregator/view';
import { newsroomRouter } from './newsroom/router';
import { newsroomView } from './newsroom/view';
import { otaRouter } from './ota/router';
import { otaView } from './ota/view';
import { otaManagerScript } from './ota/view.client';

export default function registerAddons(app: Hono<{ Bindings: Bindings }>) {
  // 1. Mount API Routes
  app.route('/api/addons/aggregator', aggregatorRouter);
  app.route('/api/addons/newsroom', newsroomRouter);
  app.route('/api/addons/ota', otaRouter);

  // 2. Register Admin Menus & Views
  registerPluginMenu({
    group: 'Plugins',
    title: 'OTA Manager',
    view: 'ota',
    icon: 'fas fa-cloud-upload-alt',
    role: ['superadmin', 'admin'],
    pluginId: 'ota'
  });
  registerPluginView('ota', otaView);
  registerPluginScript(otaManagerScript);

  registerPluginMenu({
    group: 'Plugins',
    title: 'Meja Kurasi',
    view: 'newsroom',
    icon: 'fas fa-newspaper',
    role: ['superadmin', 'admin', 'editor'],
    pluginId: 'newsroom'
  });
  registerPluginView('newsroom', newsroomView);

  registerPluginMenu({
    group: 'Plugins',
    title: 'Sumber Agregator',
    view: 'aggregator',
    icon: 'fas fa-satellite-dish',
    role: ['superadmin', 'admin'],
    pluginId: 'aggregator'
  });
  registerPluginView('aggregator', aggregatorView);

  console.log('🔌 Addons (OTA, Agregator, Newsroom) registered successfully');
}
