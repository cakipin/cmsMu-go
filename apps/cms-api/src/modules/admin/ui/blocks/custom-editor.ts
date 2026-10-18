/**
 * Custom Editor Barrel Module
 * Sesuai Standar SOP Rule 3: Batas Panjang Berkas (< 1000 Baris) & Clean Architecture
 * 
 * Dekomposisi modular:
 * - Template Markup  : ./editor/custom-editor/custom-editor.template.ts (~160 baris)
 * - Stylesheet CSS   : ./editor/custom-editor/custom-editor.styles.ts   (~340 baris)
 * - Client Logic     : ./editor/custom-editor/custom-editor.logic.ts    (~540 baris)
 * - HTML Sanitizer   : ./editor/custom-editor/custom-editor.cleaner.ts  (~320 baris)
 */

export { customEditorTemplate } from './editor/custom-editor/custom-editor.template';
export { customEditorLogicScript } from './editor/custom-editor/custom-editor.logic';
export { customEditorStyles } from './editor/custom-editor/custom-editor.styles';
