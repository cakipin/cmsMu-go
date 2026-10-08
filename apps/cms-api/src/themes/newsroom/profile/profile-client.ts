export function getProfileClientScript(): string {
  return `
  <script>
    function switchProfileTab(tabId, btn) {
      document.querySelectorAll('.nr-profile-tab-content').forEach(function(el) {
        el.style.display = 'none';
      });
      document.querySelectorAll('.nr-profile-tab').forEach(function(b) {
        b.style.color = 'var(--text-secondary)';
        b.style.borderBottomColor = 'transparent';
        b.classList.remove('active');
      });

      var target = document.getElementById('tab-' + tabId);
      if (target) target.style.display = 'block';

      if (btn) {
        btn.style.color = 'var(--accent-primary)';
        btn.style.borderBottomColor = 'var(--accent-primary)';
        btn.classList.add('active');
      }
    }

    // Live update preview URL profil saat input username diubah
    var usernameInput = document.getElementById('prof-username');
    if (usernameInput) {
      usernameInput.addEventListener('input', function() {
        var val = this.value.trim().replace(/^@/, '');
        var previewEl = document.getElementById('preview-profile-url');
        if (previewEl) previewEl.textContent = '/@' + (val || 'username');
      });
    }

    function getProfileCookieToken() {
      var match = document.cookie.match(/(?:^|;\s*)labmu_token=([^;]+)/);
      if (match) return decodeURIComponent(match[1]);
      try {
        var local = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token');
        if (local) {
          setProfileCookieToken(local);
          return local;
        }
      } catch(e) {}
      return '';
    }

    function setProfileCookieToken(token) {
      if (!token) {
        document.cookie = 'labmu_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
      } else {
        document.cookie = 'labmu_token=' + encodeURIComponent(token) + '; Path=/; Max-Age=2592000; SameSite=Lax';
      }
      try {
        localStorage.removeItem('labmu_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('labmu_user');
      } catch(e) {}
    }

    async function handleAvatarFileSelect(input) {
      var file = input.files && input.files[0];
      if (!file) return;

      var alertEl = document.getElementById('profile-alert');
      var statusEl = document.getElementById('avatar-upload-status');
      var previewImg = document.getElementById('avatar-preview-img');
      var previewFallback = document.getElementById('avatar-preview-fallback');
      var token = getProfileCookieToken();

      // Validasi Ukuran: Maksimal 1MB
      var MAX_BYTES = 1024 * 1024;
      if (file.size > MAX_BYTES) {
        alertEl.style.display = 'block';
        alertEl.style.background = '#fee2e2';
        alertEl.style.color = '#991b1b';
        alertEl.style.border = '1px solid #fecaca';
        alertEl.textContent = 'Ukuran berkas melebihi batas maksimal 1MB! (Ukuran berkas Anda: ' + (file.size / (1024 * 1024)).toFixed(2) + ' MB)';
        input.value = '';
        return;
      }

      if (previewImg) {
        previewImg.src = URL.createObjectURL(file);
        previewImg.style.display = 'block';
        if (previewFallback) previewFallback.style.display = 'none';
      }

      if (statusEl) statusEl.textContent = 'Mengunggah avatar...';
      var formData = new FormData();
      formData.append('avatar', file);

      try {
        var res = await fetch('/api/public/profile/upload-avatar', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token
          },
          body: formData
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengunggah foto avatar');

        document.getElementById('prof-avatar').value = data.url;
        if (data.token) {
          setProfileCookieToken(data.token);
        }

        if (statusEl) {
          statusEl.textContent = '✓ Foto avatar berhasil diunggah!';
          statusEl.style.color = '#059669';
        }
        alertEl.style.display = 'block';
        alertEl.style.background = '#d1fae5';
        alertEl.style.color = '#065f46';
        alertEl.style.border = '1px solid #a7f3d0';
        alertEl.textContent = 'Foto avatar berhasil diunggah dan disimpan!';
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = 'Gagal upload: ' + err.message;
          statusEl.style.color = '#dc2626';
        }
        alertEl.style.display = 'block';
        alertEl.style.background = '#fee2e2';
        alertEl.style.color = '#991b1b';
        alertEl.style.border = '1px solid #fecaca';
        alertEl.textContent = err.message;
      }
    }

    async function handleUpdateProfile(e) {
      e.preventDefault();
      var alertEl = document.getElementById('profile-alert');
      var btn = document.getElementById('btn-save-profile');
      var token = getProfileCookieToken();
      if (!token) {
        alert('Sesi login telah berakhir. Silakan masuk kembali.');
        return;
      }

      var name = document.getElementById('prof-name').value;
      var username = document.getElementById('prof-username').value;
      var email = document.getElementById('prof-email').value;
      var avatar = document.getElementById('prof-avatar').value;

      btn.disabled = true;
      btn.textContent = 'Menyimpan...';

      try {
        var res = await fetch('/api/public/profile/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ name: name, username: username, email: email, avatar: avatar })
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan profil');

        if (data.token) {
          setProfileCookieToken(data.token);
        }

        alertEl.style.display = 'block';
        alertEl.style.background = '#d1fae5';
        alertEl.style.color = '#065f46';
        alertEl.style.border = '1px solid #a7f3d0';
        alertEl.textContent = 'Profil berhasil diperbarui!';

        setTimeout(function() {
          if (data.usernameChanged && data.newUsername) {
            window.location.href = '/@' + encodeURIComponent(data.newUsername);
          } else {
            window.location.reload();
          }
        }, 1000);
      } catch (err) {
        alertEl.style.display = 'block';
        alertEl.style.background = '#fee2e2';
        alertEl.style.color = '#991b1b';
        alertEl.style.border = '1px solid #fecaca';
        alertEl.textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Simpan Perubahan';
      }
    }

    async function handleChangePassword(e) {
      e.preventDefault();
      var alertEl = document.getElementById('profile-alert');
      var btn = document.getElementById('btn-save-pass');
      var token = getProfileCookieToken();
      if (!token) {
        alert('Sesi login telah berakhir. Silakan masuk kembali.');
        return;
      }

      var oldPassword = document.getElementById('prof-old-pass').value;
      var newPassword = document.getElementById('prof-new-pass').value;

      btn.disabled = true;
      btn.textContent = 'Memproses...';

      try {
        var res = await fetch('/api/public/profile/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword })
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengganti password');

        alertEl.style.display = 'block';
        alertEl.style.background = '#d1fae5';
        alertEl.style.color = '#065f46';
        alertEl.style.border = '1px solid #a7f3d0';
        alertEl.textContent = 'Password berhasil diganti!';
        document.getElementById('public-password-form').reset();
      } catch (err) {
        alertEl.style.display = 'block';
        alertEl.style.background = '#fee2e2';
        alertEl.style.color = '#991b1b';
        alertEl.style.border = '1px solid #fecaca';
        alertEl.textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Perbarui Password';
      }
    }

    // ==========================================
    // AUTHOR EDITOR WORKSPACE LOGIC
    // ==========================================
    function openAuthorEditor(post) {
      var modal = document.getElementById('author-editor-modal');
      var alertEl = document.getElementById('author-editor-alert');
      if (!modal) return;

      if (alertEl) alertEl.style.display = 'none';

      var idEl = document.getElementById('author-post-id');
      var titleEl = document.getElementById('author-post-title');
      var catEl = document.getElementById('author-post-category');
      var tagsEl = document.getElementById('author-post-tags');
      var imgEl = document.getElementById('author-post-image');
      var excerptEl = document.getElementById('author-post-excerpt');
      var bodyEl = document.getElementById('author-post-body');
      var modalTitle = document.getElementById('author-editor-title');

      if (post && post.id) {
        if (idEl) idEl.value = post.id;
        if (titleEl) titleEl.value = post.title || '';
        if (catEl) catEl.value = post.category || 'Berita Daerah';
        if (tagsEl) tagsEl.value = post.tags || '';
        if (imgEl) imgEl.value = post.featured_image || post.featuredImage || '';
        if (excerptEl) excerptEl.value = post.excerpt || '';
        if (bodyEl) bodyEl.value = post.body || '';
        if (modalTitle) modalTitle.textContent = 'Sunting Naskah Berita';
        updateAuthorImagePreview(imgEl ? imgEl.value : '');
      } else {
        if (idEl) idEl.value = '';
        if (titleEl) titleEl.value = '';
        if (catEl) catEl.value = 'Berita Daerah';
        if (tagsEl) tagsEl.value = '';
        if (imgEl) imgEl.value = '';
        if (excerptEl) excerptEl.value = '';
        if (bodyEl) bodyEl.value = '';
        if (modalTitle) modalTitle.textContent = 'Tulis Naskah Berita Baru';
        updateAuthorImagePreview('');
      }

      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      if (titleEl) setTimeout(function() { titleEl.focus(); }, 100);
    }

    function closeAuthorEditor() {
      var modal = document.getElementById('author-editor-modal');
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    function updateAuthorImagePreview(url) {
      var wrap = document.getElementById('author-image-preview-wrap');
      var img = document.getElementById('author-image-preview');
      if (!wrap || !img) return;
      if (url && url.trim()) {
        img.src = url.trim();
        wrap.style.display = 'block';
      } else {
        wrap.style.display = 'none';
      }
    }

    function clearAuthorImage() {
      var imgEl = document.getElementById('author-post-image');
      var fileEl = document.getElementById('author-post-image-file');
      if (imgEl) imgEl.value = '';
      if (fileEl) fileEl.value = '';
      updateAuthorImagePreview('');
    }

    async function handleAuthorImageUpload(input) {
      var file = input.files && input.files[0];
      if (!file) return;

      var alertEl = document.getElementById('author-editor-alert');
      var imgInput = document.getElementById('author-post-image');
      var token = getProfileCookieToken();

      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.style.background = '#e0f2fe';
        alertEl.style.color = '#0369a1';
        alertEl.style.border = '1px solid #bae6fd';
        alertEl.textContent = 'Mengunggah gambar sampul ke Cloudflare R2...';
      }

      var formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      try {
        var res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData
        });
        var data = await res.json();
        if (data.url) {
          if (imgInput) imgInput.value = data.url;
          updateAuthorImagePreview(data.url);
          if (alertEl) {
            alertEl.style.display = 'block';
            alertEl.style.background = '#d1fae5';
            alertEl.style.color = '#065f46';
            alertEl.style.border = '1px solid #a7f3d0';
            alertEl.textContent = 'Gambar sampul berhasil diunggah!';
            setTimeout(function() { alertEl.style.display = 'none'; }, 3000);
          }
        } else {
          throw new Error(data.error || 'Gagal mengunggah berkas');
        }
      } catch(e) {
        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.style.background = '#fee2e2';
          alertEl.style.color = '#991b1b';
          alertEl.style.border = '1px solid #fecaca';
          alertEl.textContent = 'Error unggah gambar: ' + e.message;
        }
      }
    }

    async function handleInlineImageUpload(input) {
      var file = input.files && input.files[0];
      if (!file) return;

      var alertEl = document.getElementById('author-editor-alert');
      var textarea = document.getElementById('author-post-body');
      var token = getProfileCookieToken();

      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.style.background = '#e0f2fe';
        alertEl.style.color = '#0369a1';
        alertEl.style.border = '1px solid #bae6fd';
        alertEl.textContent = 'Mengunggah dan mengonversi foto naskah ke WebP di Cloudflare R2...';
      }

      var formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('source', 'newsroom');

      try {
        var res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData
        });
        var data = await res.json();
        if (!data.url) {
          throw new Error(data.error || 'Gagal mengunggah gambar');
        }

        var caption = prompt('Masukkan keterangan foto (caption):', '') || '';
        var safeCaption = caption.replace(/"/g, '&quot;');
        var figureHtml = '\\n<figure class="article-figure my-4 text-center">\\n' +
          '  <img src="' + data.url + '" alt="' + (safeCaption || 'Foto Artikel') + '" class="rounded-xl mx-auto max-w-full" loading="lazy">\\n' +
          (caption ? '  <figcaption class="text-xs text-slate-500 mt-1.5 italic">' + caption + '</figcaption>\\n' : '') +
          '</figure>\\n';

        if (textarea) {
          var start = textarea.selectionStart || textarea.value.length;
          var end = textarea.selectionEnd || textarea.value.length;
          textarea.setRangeText(figureHtml, start, end, 'end');
          textarea.focus();
        }

        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.style.background = '#d1fae5';
          alertEl.style.color = '#065f46';
          alertEl.style.border = '1px solid #a7f3d0';
          alertEl.textContent = 'Foto naskah berhasil disisipkan!';
          setTimeout(function() { alertEl.style.display = 'none'; }, 3000);
        }
      } catch (err) {
        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.style.background = '#fee2e2';
          alertEl.style.color = '#991b1b';
          alertEl.style.border = '1px solid #fecaca';
          alertEl.textContent = 'Gagal upload foto naskah: ' + err.message;
        }
      } finally {
        input.value = '';
      }
    }

    function insertFormatting(type) {
      var textarea = document.getElementById('author-post-body');
      if (!textarea) return;

      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var sel = textarea.value.substring(start, end);
      var rep = '';

      if (type === 'h2') rep = '<h2>' + (sel || 'Sub-Judul Berita') + '</h2>';
      else if (type === 'h3') rep = '<h3>' + (sel || 'Bagian Pembahasan') + '</h3>';
      else if (type === 'b') rep = '<b>' + (sel || 'Teks Tebal') + '</b>';
      else if (type === 'i') rep = '<i>' + (sel || 'Teks Miring') + '</i>';
      else if (type === 'quote') rep = '<blockquote>' + (sel || 'Kutipan pernyataan narasumber...') + '</blockquote>';
      else if (type === 'ul') rep = '<ul>\\n  <li>' + (sel || 'Poin 1') + '</li>\\n  <li>Poin 2</li>\\n</ul>';
      else if (type === 'link') {
        var url = prompt('Masukkan URL tautan:', 'https://');
        if (url) rep = '<a href="' + url + '" target="_blank">' + (sel || 'Teks Tautan') + '</a>';
        else return;
      } else if (type === 'p') rep = '\\n<p>' + (sel || 'Paragraf baru...') + '</p>\\n';

      textarea.setRangeText(rep, start, end, 'select');
      textarea.focus();
    }

    function makeAuthorSlug(title) {
      return (title || '').toLowerCase()
        .replace(/[^a-z0-9\\s-]/g, '')
        .trim()
        .replace(/\\s+/g, '-')
        .substring(0, 80) + '-' + Math.floor(1000 + Math.random() * 9000);
    }

    async function submitAuthorArticle(targetStatus) {
      var alertEl = document.getElementById('author-editor-alert');
      var btnDraft = document.getElementById('btn-save-draft');
      var btnSubmit = document.getElementById('btn-submit-curation');
      var token = getProfileCookieToken();

      if (!token) {
        alert('Sesi masuk telah berakhir. Silakan login kembali.');
        window.location.href = '/admin/login';
        return;
      }

      var id = (document.getElementById('author-post-id').value || '').trim();
      var title = (document.getElementById('author-post-title').value || '').trim();
      var category = document.getElementById('author-post-category').value;
      var tags = (document.getElementById('author-post-tags').value || '').trim();
      var featuredImage = (document.getElementById('author-post-image').value || '').trim();
      var excerpt = (document.getElementById('author-post-excerpt').value || '').trim();
      var body = (document.getElementById('author-post-body').value || '').trim();

      if (!title) {
        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.style.background = '#fee2e2';
          alertEl.style.color = '#991b1b';
          alertEl.style.border = '1px solid #fecaca';
          alertEl.textContent = 'Judul berita wajib diisi!';
        }
        document.getElementById('author-post-title').focus();
        return;
      }

      if (!body) {
        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.style.background = '#fee2e2';
          alertEl.style.color = '#991b1b';
          alertEl.style.border = '1px solid #fecaca';
          alertEl.textContent = 'Isi naskah berita wajib diisi!';
        }
        document.getElementById('author-post-body').focus();
        return;
      }

      var userPayload = null;
      try {
        var base64 = token.includes('.') ? token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/') : token;
        userPayload = JSON.parse(atob(base64));
      } catch(e) {}

      var authorName = userPayload ? (userPayload.n || userPayload.name || userPayload.username || 'Penulis') : 'Penulis';
      var authorId = userPayload ? userPayload.id : null;

      var payload = {
        title: title,
        slug: makeAuthorSlug(title),
        category: category,
        tags: tags,
        featured_image: featuredImage,
        excerpt: excerpt,
        body: body,
        status: targetStatus,
        author: authorName,
        author_id: authorId,
        type: 'post'
      };

      if (btnDraft) btnDraft.disabled = true;
      if (btnSubmit) btnSubmit.disabled = true;
      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.style.background = '#e0f2fe';
        alertEl.style.color = '#0369a1';
        alertEl.style.border = '1px solid #bae6fd';
        alertEl.textContent = 'Menyimpan naskah ke sistem...';
      }

      try {
        var url = id ? ('/api/posts/' + id) : '/api/posts';
        var method = id ? 'PUT' : 'POST';

        var res = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(payload)
        });

        var data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan naskah');

        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.style.background = '#d1fae5';
          alertEl.style.color = '#065f46';
          alertEl.style.border = '1px solid #a7f3d0';
          alertEl.textContent = targetStatus === 'curated'
            ? 'Alhamdulillah! Naskah berhasil dikirim ke Meja Redaksi untuk ditinjau.'
            : 'Naskah berhasil disimpan sebagai draf!';
        }

        setTimeout(function() {
          closeAuthorEditor();
          window.location.reload();
        }, 1200);

      } catch(err) {
        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.style.background = '#fee2e2';
          alertEl.style.color = '#991b1b';
          alertEl.style.border = '1px solid #fecaca';
          alertEl.textContent = 'Error: ' + err.message;
        }
      } finally {
        if (btnDraft) btnDraft.disabled = false;
        if (btnSubmit) btnSubmit.disabled = false;
      }
    }
  </script>
  `;
}
