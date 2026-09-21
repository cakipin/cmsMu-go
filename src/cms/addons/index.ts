import { Hono } from 'hono';
import type { Bindings } from '../types';
import { registerPluginMenu } from '../registry/admin-menu';
import { aggregatorRouter } from './aggregator/router';
import { newsroomRouter } from './newsroom/router';

export default function registerAddons(app: Hono<{ Bindings: Bindings }>) {
  // 1. Mount API Routes
  app.route('/api/addons/aggregator', aggregatorRouter);
  app.route('/api/addons/newsroom', newsroomRouter);

  // 2. Register Admin Menus (Grup Plugins) dengan pluginId
  registerPluginMenu({
    group: 'Plugins',
    title: 'Meja Kurasi',
    view: 'newsroom',
    icon: 'fas fa-newspaper',
    role: ['admin', 'editor'],
    pluginId: 'newsroom'
  });

  registerPluginMenu({
    group: 'Plugins',
    title: 'Sumber Agregator',
    view: 'aggregator',
    icon: 'fas fa-satellite-dish',
    role: ['admin'],
    pluginId: 'aggregator'
  });

  console.log('🔌 Addons Agregator & Newsroom registered successfully');
}
