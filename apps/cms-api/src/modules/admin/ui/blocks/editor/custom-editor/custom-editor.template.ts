import { customEditorStyles } from './custom-editor.styles';

export const customEditorTemplate = `
<div x-data="customEditorLogic()" 
     x-init="initEditor(form.body)" 
     class="custom-editor-wrapper" 
     style="display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 100%;">
    
    <!-- Top Bar: Media Button (Left) & Mode Tabs Visual / HTML (Right) -->
    <div class="editor-top-bar">
        <div>
            <button type="button" @click="openMediaManager()" class="editor-media-btn" title="Tambah Media">
                <i class="fas fa-photo-video" style="color: #2563eb;"></i> <span>Add Media</span>
            </button>
        </div>

        <div class="editor-tab-group">
            <button type="button" @click="setMode('visual')" 
                    class="editor-tab-btn" 
                    :class="{ 'active': editorMode === 'visual' }">
                <i class="fas fa-eye"></i> <span>Visual</span>
            </button>
            <button type="button" @click="setMode('html')" 
                    class="editor-tab-btn" 
                    :class="{ 'active': editorMode === 'html' }">
                <i class="fas fa-code"></i> <span>Text / HTML</span>
            </button>
        </div>
    </div>

    <!-- Main Editor Box -->
    <div class="custom-editor-container" x-ref="editorContainer">
        <!-- WP Classic Style Toolbar (Shown in Visual Mode Only) -->
        <div x-show="editorMode === 'visual'" x-ref="toolbar" class="editor-toolbar">
            
            <!-- Format Select (Native HTML Select - Anti Overflow Clipping, 100% Mobile Touch Safe) -->
            <div class="editor-select-wrapper">
                <select class="editor-format-select"
                        :value="currentBlockFormat"
                        @focus="saveSelection()"
                        @mousedown="saveSelection()"
                        @change="setBlockFormat($event.target.value)"
                        title="Pilih Format Blok Teks">
                    <option value="p">Paragraph</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="blockquote">Quote</option>
                </select>
                <i class="fas fa-chevron-down editor-select-icon"></i>
            </div>
            
            <span class="toolbar-divider"></span>

            <div class="editor-btn-group">
                <button type="button" @mousedown.prevent @click="execCmd('bold')" class="editor-btn" :class="{'active': activeFormats.bold}" title="Tebal (Bold)"><i class="fas fa-bold"></i></button>
                <button type="button" @mousedown.prevent @click="execCmd('italic')" class="editor-btn" :class="{'active': activeFormats.italic}" title="Miring (Italic)"><i class="fas fa-italic"></i></button>
                <button type="button" @mousedown.prevent @click="execCmd('underline')" class="editor-btn" :class="{'active': activeFormats.underline}" title="Garis Bawah (Underline)"><i class="fas fa-underline"></i></button>
                <button type="button" @mousedown.prevent @click="execCmd('strikeThrough')" class="editor-btn" :class="{'active': activeFormats.strikeThrough}" title="Coret (Strikethrough)"><i class="fas fa-strikethrough"></i></button>
            </div>
            
            <span class="toolbar-divider"></span>
            
            <div class="editor-btn-group">
                <button type="button" @mousedown.prevent @click="execCmd('insertUnorderedList')" class="editor-btn" :class="{'active': activeFormats.ul}" title="Daftar Poin (Bulleted List)"><i class="fas fa-list-ul"></i></button>
                <button type="button" @mousedown.prevent @click="execCmd('insertOrderedList')" class="editor-btn" :class="{'active': activeFormats.ol}" title="Daftar Angka (Numbered List)"><i class="fas fa-list-ol"></i></button>
            </div>
            
            <span class="toolbar-divider"></span>
            
            <!-- Alignment Buttons (Direct Block Style) -->
            <div class="editor-btn-group">
                <button type="button" @mousedown.prevent @click="setAlignment('left')" class="editor-btn" :class="{'active': activeFormats.alignLeft}" title="Rata Kiri"><i class="fas fa-align-left"></i></button>
                <button type="button" @mousedown.prevent @click="setAlignment('center')" class="editor-btn" :class="{'active': activeFormats.alignCenter}" title="Rata Tengah"><i class="fas fa-align-center"></i></button>
                <button type="button" @mousedown.prevent @click="setAlignment('right')" class="editor-btn" :class="{'active': activeFormats.alignRight}" title="Rata Kanan"><i class="fas fa-align-right"></i></button>
                <button type="button" @mousedown.prevent @click="setAlignment('justify')" class="editor-btn" :class="{'active': activeFormats.alignJustify}" title="Rata Kiri-Kanan (Justify)"><i class="fas fa-align-justify"></i></button>
            </div>

            <span class="toolbar-divider"></span>
            
            <!-- Link Dropdown Wrapper -->
            <div style="position:relative; display:inline-flex; align-items:center; flex-shrink:0;">
                <button type="button" @mousedown.prevent @click="promptLink()" class="editor-btn" :class="{'active': linkModalOpen}" title="Tambah Link"><i class="fas fa-link"></i></button>
                
                <!-- Dropdown Popover muncul di bawah tombol (Desktop) / Modal Center Viewport (Mobile) -->
                <div x-show="linkModalOpen" x-cloak
                     @touchstart.stop
                     @click.stop
                     @click.outside="closeLinkModal()"
                     @keydown.escape.window="closeLinkModal()"
                     class="editor-link-popover">
                    <div style="font-size:12px; font-weight:600; color:#1d2327; margin-bottom:8px;">Masukkan URL Link</div>
                    <input x-model="linkUrl" @keydown.enter.prevent="confirmLinkModal()" type="url" placeholder="https://example.com"
                           style="width:100%; padding:7px 9px; border:1px solid #8c8f94; border-radius:3px; font-size:13px; box-sizing:border-box; outline:none;"
                           onfocus="this.style.borderColor='#2271b1'" onblur="this.style.borderColor='#8c8f94'">
                    <div style="display:flex; gap:6px; margin-top:8px;">
                        <button type="button" @click="closeLinkModal()" style="flex:1; padding:6px; background:#f0f0f1; border:1px solid #c3c4c7; border-radius:3px; cursor:pointer; font-size:12px;">Batal</button>
                        <button type="button" @click="confirmLinkModal()" style="flex:2; padding:6px; background:#2271b1; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:12px; font-weight:600;">Tambah Link</button>
                    </div>
                </div>
            </div>
            <button type="button" @mousedown.prevent @click="execCmd('unlink')" class="editor-btn" title="Hapus Link"><i class="fas fa-unlink"></i></button>
            <span class="toolbar-divider"></span>
            <button type="button" @mousedown.prevent @click="cleanEditor()" class="editor-btn" title="Bersihkan Format Sampah (Clean HTML)"><i class="fas fa-broom" style="color: #0d9488;"></i></button>
            <span class="toolbar-divider"></span>
            <button type="button" 
                    @mousedown.prevent 
                    @click="tidyWithAi()" 
                    class="editor-btn editor-btn-ai" 
                    :disabled="isAiTidying" 
                    title="✨ AI Rapikan Paragraf & Struktur SEO (Pecah paragraf panjang, buat sub-heading H2)">
                <i class="fas fa-wand-magic-sparkles" :class="isAiTidying ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'"></i>
                <span class="ai-text" x-text="isAiTidying ? 'Merapikan...' : 'Rapikan'">Rapikan</span>
            </button>
        </div>

        <!-- The ContentEditable Editor (Visual Mode) -->
        <div x-show="editorMode === 'visual'"
             x-ref="editor" 
             contenteditable="true" 
             class="modern-editor-content"
             style="min-height: 380px; padding: 20px; outline: none; font-size: 16px; line-height: 1.6; color: #2c3338; background: #fff; overflow-y: auto; max-height: 700px;"
             @mouseup="checkSelection" 
             @touchend="checkSelection"
             @keyup="checkSelection(); updateContent()"
             @input="updateContent()"
             @blur="updateContent()"
             @keydown.enter="handleEnter($event)"
             @paste="handlePaste($event)">
        </div>

        <!-- The Raw HTML Source Editor (HTML Mode) -->
        <div x-show="editorMode === 'html'" style="display: none; background: #f8fafc; border-top: 1px solid #c3c4c7;">
            <textarea x-ref="htmlSource"
                      x-model="form.body"
                      @input="onHtmlInput()"
                      placeholder="Ketik atau tempel kode HTML di sini..."
                      style="width: 100%; min-height: 400px; padding: 16px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; line-height: 1.6; color: #0f172a; background: #f8fafc; border: none; outline: none; resize: vertical; box-sizing: border-box;"></textarea>
        </div>

        <!-- Editor Status Footer Bar: Word & Character Count + Format Indicator -->
        <div class="editor-status-bar">
            <div style="display:flex; align-items:center; gap:12px;">
                <span class="editor-status-badge">
                    <i class="fas fa-pen-nib" style="font-size:10px;"></i>
                    <span x-text="currentWordCount + ' kata'">0 kata</span>
                </span>
                <span class="editor-status-muted" x-text="currentCharCount + ' karakter'">0 karakter</span>
            </div>
            <div class="editor-status-badge" style="background:#f1f5f9; color:#475569;">
                <span x-text="'Format: ' + (formatLabels[currentBlockFormat] || 'Paragraph')">Format: Paragraph</span>
            </div>
        </div>

        ${customEditorStyles}
    </div>
</div>
`;
