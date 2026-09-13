import type { ThemeContext } from '../types';
import { escapeHtml } from './utils';
import { renderProfileHeader } from './profile/profile-header';
import { renderProfileTabs } from './profile/profile-tabs';
import { renderTabAuthor } from './profile/tab-author';
import { renderTabCuration } from './profile/tab-curation';
import { renderTabSaved } from './profile/tab-saved';
import { renderTabSettings } from './profile/tab-settings';
import { renderAuthorEditorModal } from './profile/editor-modal';
import { getProfileClientScript } from './profile/profile-client';

export function renderUserProfile(this: any, ctx: ThemeContext) {
  const cx = ctx as any;
  const user = cx.profileUser || {};
  const authorPosts = Array.isArray(cx.authorPosts) ? cx.authorPosts : [];
  const curationItems = Array.isArray(cx.curationItems) ? cx.curationItems : [];
  const savedPosts = Array.isArray(cx.savedPosts) ? cx.savedPosts : [];

  const username = escapeHtml(user.username || '');
  const displayName = escapeHtml(user.name || user.username || 'Pengguna');
  const role = String(user.role || 'subscriber').toLowerCase();
  const initial = (displayName.charAt(0) || 'U').toUpperCase();
  const avatarUrl = user.avatar ? escapeHtml(user.avatar) : '';

  // Deteksi kemampuan role
  const isAuthor = role === 'author' || role === 'contributor' || role === 'penulis' || role === 'editor' || role === 'admin' || role === 'superadmin';
  const isCurator = role === 'curator' || role === 'kurator' || role === 'editor' || role === 'redaksi' || role === 'admin' || role === 'superadmin';

  // Tentukan tab aktif pertama sesuai role
  const defaultTab = isAuthor ? 'author-posts' : (isCurator ? 'curation-queue' : 'saved-posts');

  const content = `
  <main class="nr-container nr-section" style="max-width: 1100px; margin: 2rem auto 4rem auto; padding: 0 1rem;">
    <!-- 1. USER PROFILE HEADER CARD -->
    ${renderProfileHeader(user, displayName, username, role, avatarUrl, initial, isAuthor, isCurator)}

    <!-- 2. TAB NAVIGATION SESUAI ROLE -->
    ${renderProfileTabs(defaultTab, isCurator, authorPosts.length, curationItems.length, savedPosts.length)}

    <!-- 3. TAB CONTENT SECTIONS -->
    ${renderTabAuthor(authorPosts, isAuthor, defaultTab)}
    ${renderTabCuration(curationItems, isCurator, defaultTab)}
    ${renderTabSaved(savedPosts, defaultTab)}
    ${renderTabSettings(user, displayName, avatarUrl, initial)}

    <!-- 4. MODAL EDITOR NASKAH PENULIS -->
    ${isAuthor ? renderAuthorEditorModal() : ''}
  </main>

  <!-- 5. CLIENT JAVASCRIPT LOGIC -->
  ${getProfileClientScript()}
  `;

  return this._layout(content, `${displayName} (@${username})`, ctx, 'profile');
}
