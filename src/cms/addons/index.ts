import { Hono } from 'hono';
import type { Bindings } from '../types';
import { registerPluginMenu } from '../registry/admin-menu';
import { newsroomRouter } from './newsroom/router';

export default function registerAddons(app: Hono<{ Bindings: Bindings }>) {
  // 1. Mount API Routes
  // Note: Aggregator plugin is currently disabled as requested
  // app.route('/api/addons/aggregator', aggregatorRouter);
  app.route('/api/addons/newsroom', newsroomRouter);

  // 2. Register Admin Menus (Grup Plugins)
  registerPluginMenu({
    group: 'Plugins',
    title: 'Meja Kurasi',
    view: 'newsroom',
    icon: 'fas fa-newspaper',
    role: ['admin', 'editor'],
  });

  // Note: Menu 'Sumber Agregator' disabled
  /*
  registerPluginMenu({
    group: 'Plugins',
    title: 'Sumber Agregator',
    view: 'aggregator',
    icon: 'fas fa-satellite-dish',
    role: ['admin'],
  });
  */

  console.log('🔌 Addons Newsroom registered (Aggregator disabled)');
}
