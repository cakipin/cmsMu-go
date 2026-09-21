/**
 * 🚀 OTA (Over-The-Air) Service
 * Menyediakan metadata manifest versi, asset bundle distribution, dan status update untuk CMSMu client.
 */

import { cmsLogic } from '../admin/ui/blocks/cms.logic';

export const CORE_VERSION = '6.2.0';
export const CORE_BUILD_DATE = '2026-09-21';
export const MIN_COMPATIBLE_SCHEMA_VERSION = '6.0.0';

export interface OtaManifest {
    name: string;
    version: string;
    buildDate: string;
    minCompatibleSchema: string;
    channel: 'stable' | 'beta';
    capabilities: string[];
    bundledPlugins: string[];
    updateUrl: string;
    bundleUrl: string;
}

export const otaService = {
    getManifest(baseUrl: string = ''): OtaManifest {
        const cleanBase = baseUrl.replace(/\/+$/, '');
        return {
            name: 'CMSMu Core Framework',
            version: CORE_VERSION,
            buildDate: CORE_BUILD_DATE,
            minCompatibleSchema: MIN_COMPATIBLE_SCHEMA_VERSION,
            channel: 'stable',
            capabilities: [
                'headless-api',
                'puck-visual-editor',
                'auto-db-migration',
                'dynamic-plugin-toggle',
                'aggregator-newsroom-addon',
                'ota-client-runtime'
            ],
            bundledPlugins: [
                'aggregator',
                'newsroom',
                'sso-muhammadiyah',
                'emagazine'
            ],
            updateUrl: `${cleanBase}/api/ota/manifest`,
            bundleUrl: `${cleanBase}/api/ota/bundle/admin.js`
        };
    },

    getAdminBundle(): string {
        return `
/**
 * 📦 CMSMu Core Admin Runtime Bundle (OTA)
 * Version: ${CORE_VERSION}
 * Build Date: ${CORE_BUILD_DATE}
 * Generated for Over-The-Air Distribution
 */
(function() {
    window.__CMS_OTA_LOADED = true;
    window.__CMS_CORE_VERSION = "${CORE_VERSION}";
    window.__CMS_BUILD_DATE = "${CORE_BUILD_DATE}";

    try {
        ${cmsLogic}
        console.log("🚀 CMSMu Core OTA Bundle v${CORE_VERSION} loaded successfully.");
    } catch(err) {
        console.error("❌ Failed to initialize CMSMu OTA Core Bundle:", err);
    }
})();
        `.trim();
    },

    compareVersions(v1: string, v2: string): number {
        // Return 1 if v1 > v2, -1 if v1 < v2, 0 if equal
        const p1 = (v1 || '0.0.0').split('.').map(Number);
        const p2 = (v2 || '0.0.0').split('.').map(Number);
        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
            const num1 = p1[i] || 0;
            const num2 = p2[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    }
};
