import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { STORAGE_KEY, loadWorkspace, newConversation, requestChat, requestJson, validateFile } from './data.mjs';

const prompts = [
  { icon: 'box', color: 'blue', title: 'Tra cứu vận đơn', description: 'Theo dõi hành trình, nắm bắt trạng thái', text: 'Đơn hàng TRK0001617 hiện đang ở đâu?' },
  { icon: 'file', color: 'violet', title: 'Hỏi đáp tài liệu', description: 'Biến kiến thức thành câu trả lời', text: 'Quy trình đóng gói hàng dễ vỡ yêu cầu những vật tư gì?' },
  { icon: 'shield', color: 'green', title: 'Chính sách & quy trình', description: 'Hiểu đúng quy định, xử lý nhanh hơn', text: 'Hàng hóa bị vỡ khi không mua bảo hiểm thì được bồi thường như thế nào?' },
  { icon: 'sparkles', color: 'amber', title: 'Phân tích thông minh', description: 'Kết nối dữ liệu với góc nhìn mới', text: 'Đơn TRK0001617 bị trễ giao, theo chính sách tôi có được bồi thường cước không?' },
];
const navigation = [{ id: 'chat', icon: 'chat', label: 'Trợ lý AI' }, { id: 'documents', icon: 'folder', label: 'Tài liệu' }, { id: 'saved', icon: 'bookmark', label: 'Đã lưu' }];

function readLocal(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function AssistantText({ text }) {
  // ponytail: plain text + bold/code only; add a Markdown parser when tables are required.
  return <div className="answer-text">{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => part.startsWith('**')
    ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith('`')
      ? <code key={i}>{part.slice(1, -1)}</code> : part)}</div>;
}

export default function App() {
  const [conversations, setConversations] = useState(() => {
    const restored = loadWorkspace(readLocal(STORAGE_KEY));
    return restored.length ? restored : [newConversation()];
  });
  const [activeId, setActiveId] = useState(() => conversations[0].id);
  const [view, setView] = useState('chat');
  const [drafts, setDrafts] = useState({});
  const [mode, setMode] = useState('fast');
  const [theme, setTheme] = useState(() => readLocal('one61.theme') === 'dark' ? 'dark' : 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('');
  const [health, setHealth] = useState(null);
  const [toast, setToast] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [modal, setModal] = useState('');
  const [search, setSearch] = useState('');
  const [now, setNow] = useState(new Date());
  const fileInput = useRef(null);
  const textarea = useRef(null);
  const bottom = useRef(null);
  const dialog = useRef(null);
  const controller = useRef(null);
  const active = conversations.find(c => c.id === activeId) || conversations[0];
  const draft = drafts[active.id] || '';
  const busy = Boolean(pendingId) || uploading;
  const saved = conversations.flatMap(c => c.messages.filter(m => m.saved).map(m => ({ ...m, conversation: c })));

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [conversations]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('one61.theme', theme); } catch { /* Theme still works without storage. */ }
  }, [theme]);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const data = await requestJson('/health', { signal: AbortSignal.timeout(5000) });
        if (alive) setHealth(data.status === 'healthy' ? data : false);
      } catch { if (alive) setHealth(false); }
    };
    check();
    const interval = setInterval(check, 30000);
    const clock = setInterval(() => setNow(new Date()), 60000);
    return () => { alive = false; clearInterval(interval); clearInterval(clock); };
  }, []);

  useEffect(() => {
    const keyboard = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setSearch(''); setModal('search'); setMinimized(false);
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);

  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [active.messages.length, pendingId, view]);
  useEffect(() => {
    if (textarea.current) {
      textarea.current.style.height = 'auto';
      textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 140)}px`;
    }
  }, [draft, view, activeId]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  function updateConversation(id, transform) {
    setConversations(current => current.map(c => c.id === id ? transform(c) : c));
  }

  function openView(nextView) {
    setView(nextView); setMinimized(false); setSidebarOpen(false);
  }

  function startConversation() {
    const empty = conversations.find(c => !c.messages.length && !c.documents.length && !drafts[c.id]);
    const next = empty || newConversation();
    if (!empty) setConversations(current => [next, ...current]);
    setActiveId(next.id); openView('chat');
    setTimeout(() => textarea.current?.focus(), 0);
  }

  function selectConversation(id) {
    setActiveId(id); openView('chat'); setModal('');
  }

  function fillPrompt(text) {
    setDrafts(current => ({ ...current, [active.id]: text })); openView('chat');
    setTimeout(() => textarea.current?.focus(), 0);
  }

  async function send(event) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    const sessionId = active.id;
    const history = active.messages;
    const userMessage = { id: crypto.randomUUID(), role: 'user', text };
    updateConversation(sessionId, c => ({ ...c, title: c.messages.length ? c.title : text.slice(0, 42), messages: [...c.messages, userMessage] }));
    setDrafts(current => ({ ...current, [sessionId]: '' })); setPendingId(sessionId);
    const abort = new AbortController(); controller.current = abort;
    try {
      const result = await requestChat(sessionId, text, mode, history, AbortSignal.any([abort.signal, AbortSignal.timeout(180000)]));
      updateConversation(sessionId, c => ({ ...c, messages: [...c.messages, {
        id: crypto.randomUUID(), role: 'assistant', text: result.response.message,
        citations: Array.isArray(result.citations) ? result.citations : [], verification: result.verification,
        metadata: result.metadata, suggestions: Array.isArray(result.response.suggestions) ? result.response.suggestions.filter(s => typeof s === 'string') : [],
      }] }));
    } catch (error) {
      const message = error.name === 'AbortError' ? 'Đã dừng trả lời. Bạn có thể gửi lại câu hỏi.'
        : error.name === 'TimeoutError' ? 'Phản hồi mất quá nhiều thời gian. Hãy thử lại.' : error.message;
      updateConversation(sessionId, c => ({ ...c, messages: [...c.messages, { id: crypto.randomUUID(), role: 'assistant', text: message, error: true, retry: text }] }));
    } finally { setPendingId(null); controller.current = null; }
  }

  async function uploadFiles(files) {
    if (busy || !files.length) return;
    const sessionId = active.id;
    setUploading(true);
    for (const file of files) {
      const invalid = validateFile(file);
      if (invalid) { setToast(`${file.name}: ${invalid}`); continue; }
      setUploadLabel(`Đang xử lý ${file.name}…`);
      try {
        const body = new FormData(); body.append('file', file); body.append('conversation_id', sessionId);
        const result = await requestJson('/api/test/upload', { method: 'POST', body, signal: AbortSignal.timeout(180000) });
        if (typeof result.filename !== 'string' || typeof result.document_id !== 'string') throw new Error('Thông tin tài liệu từ máy chủ không hợp lệ.');
        updateConversation(sessionId, c => ({ ...c, documents: [...c.documents, { ...result, size: file.size, uploadedAt: new Date().toISOString() }] }));
        setToast(`Đã thêm ${result.filename}. Tài liệu sẵn sàng để hỏi đáp.`);
      } catch (error) {
        setToast(`${file.name}: ${error.name === 'TimeoutError' ? 'Hết thời gian tải lên. Hãy thử lại.' : error.message}`);
      }
    }
    setUploading(false); setUploadLabel('');
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setToast('Đã sao chép câu trả lời.'); }
    catch { setToast('Không thể sao chép. Hãy chọn nội dung và sao chép thủ công.'); }
  }

  function exportWorkspace() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(conversations, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'one61-conversations.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setToast('Đã xuất lịch sử trò chuyện.');
  }

  function renderMessage(message, conversationId = active.id) {
    return <article key={message.id} className={`message ${message.role} ${message.error ? 'message-error' : ''}`}>
      {message.role === 'assistant' && <div className="assistant-avatar"><Icon name="layers" size={18} /></div>}
      <div className="message-body">
        {message.role === 'assistant' && <div className="message-author">One61 <span>Trợ lý AI</span></div>}
        <AssistantText text={message.text} />
        {message.verification && <div className={`verification ${message.verification.is_verified ? 'verified' : ''}`}>
          <Icon name="shield" size={14} /> {message.verification.is_verified ? 'Đã đối chiếu nguồn' : 'Cần kiểm tra thêm'}
          {Number.isFinite(message.verification.confidence_score) && <span>· {Math.round(message.verification.confidence_score * 100)}% tin cậy</span>}
        </div>}
        {message.verification?.disclaimer && <p className="disclaimer">{message.verification.disclaimer}</p>}
        {message.citations?.length > 0 && <details className="sources"><summary><Icon name="file" size={14} /> {message.citations.length} nguồn tham khảo</summary>
          {message.citations.map((citation, index) => <div key={index}><strong>{citation.source_name || citation.source_id || `Nguồn ${index + 1}`}</strong><p>{citation.chunk_text}</p></div>)}
        </details>}
        {message.role === 'assistant' && !message.error && <div className="message-actions">
          <button title="Sao chép" aria-label="Sao chép câu trả lời" onClick={() => copy(message.text)}><Icon name="copy" size={15} /></button>
          <button className={message.saved ? 'is-saved' : ''} title={message.saved ? 'Bỏ lưu' : 'Lưu câu trả lời'} aria-label={message.saved ? 'Bỏ lưu câu trả lời' : 'Lưu câu trả lời'} aria-pressed={Boolean(message.saved)} onClick={() => updateConversation(conversationId, c => ({ ...c, messages: c.messages.map(m => m.id === message.id ? { ...m, saved: !m.saved } : m) }))}><Icon name="bookmark" size={15} /></button>
          {Number.isFinite(message.metadata?.processing_time_ms) && <span>{(message.metadata.processing_time_ms / 1000).toFixed(1)} giây</span>}
        </div>}
        {message.error && <button className="retry-button" onClick={() => fillPrompt(message.retry)} disabled={busy}>Thử lại <Icon name="arrow" size={14} /></button>}
        {view === 'chat' && message.suggestions?.length > 0 && <div className="follow-ups">{message.suggestions.slice(0, 3).map((suggestion, index) => <button key={index} onClick={() => fillPrompt(suggestion)}>{suggestion}<Icon name="arrow" size={14} /></button>)}</div>}
      </div>
    </article>;
  }

  return <div className={`desktop ${maximized ? 'desktop-maximized' : ''}`}>
    <div className="wallpaper"><div className="wallpaper-ridge ridge-one" /><div className="wallpaper-ridge ridge-two" /><div className="wallpaper-ridge ridge-three" /></div>
    <header className="menu-bar">
      <div className="menu-left"><Icon name="layers" size={18} /><strong>One61</strong><span>Không gian làm việc</span></div>
      <div className="menu-right"><span className="menu-focus"><Icon name="moon" size={13} /> Tập trung</span><Icon name="wifi" size={17} /><Icon name="battery" size={22} /><button aria-label="Cài đặt nhanh" title="Cài đặt" onClick={() => setModal('settings')}><Icon name="sliders" size={17} /></button><time dateTime={now.toISOString()}>{new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(now)}</time></div>
    </header>

    {minimized && <button className="restore-window" onClick={() => setMinimized(false)}><span className="app-logo"><Icon name="layers" size={28} /></span>Mở One61<Icon name="arrow" size={18} /></button>}
    <section className={`app-window ${minimized ? 'window-minimized' : ''} ${sidebarHidden ? 'sidebar-hidden' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`} aria-label="One61 Workspace" inert={minimized ? true : undefined}>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Đóng thanh bên" onClick={() => setSidebarOpen(false)} />}
      <aside className="sidebar">
        <div className="traffic-lights">
          <button className="traffic red" title="Ẩn cửa sổ" aria-label="Ẩn cửa sổ" onClick={() => setMinimized(true)}><Icon name="close" size={9} /></button>
          <button className="traffic yellow" title="Thu nhỏ cửa sổ" aria-label="Thu nhỏ cửa sổ" onClick={() => setMinimized(true)}><span>−</span></button>
          <button className="traffic green" title="Phóng to cửa sổ" aria-label="Phóng to cửa sổ" aria-pressed={maximized} onClick={() => setMaximized(!maximized)}><Icon name="plus" size={9} /></button>
        </div>
        <div className="brand"><span className="app-logo"><Icon name="layers" size={23} /></span><span className="wordmark">one61<span className="brand-tag">AI</span></span></div>
        <button className="new-chat" onClick={startConversation}><Icon name="plus" size={17} /> Cuộc trò chuyện mới</button>
        <button className="sidebar-search" onClick={() => { setSearch(''); setModal('search'); }}><Icon name="search" size={16} /><span>Tìm kiếm</span><kbd>⌘ K</kbd></button>
        <p className="section-label">KHÔNG GIAN LÀM VIỆC</p>
        <nav className="navigation" aria-label="Điều hướng chính">{navigation.map(item => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => openView(item.id)} aria-current={view === item.id ? 'page' : undefined}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.id === 'chat' && <span className="nav-ai">AI</span>}{item.id === 'documents' && active.documents.length > 0 && <span className="nav-count">{active.documents.length}</span>}{item.id === 'saved' && saved.length > 0 && <span className="nav-count">{saved.length}</span>}</button>)}</nav>
        <div className="recent"><p className="section-label">GẦN ĐÂY <Icon name="clock" size={12} /></p>
          {conversations.filter(c => c.messages.length || c.documents.length).length ? conversations.filter(c => c.messages.length || c.documents.length).map(c => <button key={c.id} className={c.id === active.id && view === 'chat' ? 'selected' : ''} onClick={() => selectConversation(c.id)} title={c.title}><Icon name="chat" size={14} /><span>{c.title}</span></button>) : <p className="recent-empty">Những cuộc trò chuyện của bạn<br />sẽ xuất hiện ở đây.</p>}
        </div>
        <div className="sidebar-bottom"><div className="workspace-note"><span className="note-icon"><Icon name="sparkles" size={18} /></span><div><strong>Ít tìm kiếm. Nhiều câu trả lời.</strong><p>Tri thức của bạn, luôn trong tầm tay.</p></div></div>
          <button className="profile" onClick={() => setModal('settings')}><span className="profile-avatar">B</span><span><strong>Không gian cá nhân</strong><small><i className={`status-dot ${health ? 'online' : ''}`} />{health === null ? 'Đang kết nối…' : health ? 'Đã kết nối máy chủ' : 'Chưa kết nối máy chủ'}</small></span><Icon name="settings" size={17} /></button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="window-toolbar"><div className="toolbar-left"><button className="icon-button sidebar-toggle" aria-label="Ẩn hoặc hiện thanh bên" onClick={() => { if (window.matchMedia('(max-width: 760px)').matches) setSidebarOpen(!sidebarOpen); else setSidebarHidden(!sidebarHidden); }}><Icon name="sidebar" size={19} /></button><span className="toolbar-divider" /><span className="toolbar-workspace">Không gian cá nhân</span><Icon name="chevron" size={12} /><strong>{navigation.find(n => n.id === view)?.label}</strong></div><div className="toolbar-right"><span className="private-label"><Icon name="shield" size={13} /> Lịch sử trên máy</span><button className="icon-button" title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'} aria-label={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} /></button><button className="icon-button" title="Trợ giúp" aria-label="Trợ giúp" onClick={() => setModal('help')}><Icon name="help" size={18} /></button></div></header>
        {storageError && <div role="alert" className="storage-warning">Không thể lưu lịch sử trên máy. Xuất lịch sử trong Cài đặt trước khi đóng trang.</div>}

        {view === 'chat' && <>
          <div className={`chat-content ${!active.messages.length ? 'is-welcome' : ''}`}>
            {!active.messages.length ? <div className="welcome">
              <div className="welcome-emblem"><span className="emblem-orbit orbit-one" /><span className="emblem-orbit orbit-two" /><span className="app-logo"><Icon name="layers" size={35} /></span><span className="emblem-spark"><Icon name="sparkles" size={15} /></span></div>
              <div className="welcome-eyebrow">TRỢ LÝ THÔNG MINH CỦA BẠN</div>
              <h1>Hiểu dữ liệu.<br /><span>Đơn giản mọi việc.</span></h1>
              <p className="welcome-description">Từ vận đơn đến kiến thức vận hành.<br className="mobile-break" /> Cứ hỏi, One61 sẽ giúp bạn kết nối.</p>
              <div className="suggestion-grid">{prompts.map(prompt => <button key={prompt.title} className="suggestion-card" onClick={() => fillPrompt(prompt.text)}><span className={`suggestion-icon ${prompt.color}`}><Icon name={prompt.icon} size={21} /></span><span className="suggestion-copy"><strong>{prompt.title}</strong><small>{prompt.description}</small></span><Icon name="arrow" size={15} className="suggestion-arrow" /></button>)}</div>
              <p className="welcome-hint"><Icon name="paperclip" size={13} /> Có tài liệu riêng? Đính kèm để bắt đầu hỏi đáp.</p>
            </div> : <div className="message-list" role="log" aria-label="Cuộc trò chuyện" aria-live="polite">{active.messages.map(m => renderMessage(m))}{pendingId === active.id && <div className="message assistant"><div className="assistant-avatar"><Icon name="layers" size={18} /></div><div className="thinking"><span /><span /><span /><small>Đang tìm câu trả lời{mode === 'reasoning' ? ' · Phân tích sâu' : ''}…</small></div></div>}<div ref={bottom} /></div>}
          </div>
          <div className="composer-area">
            {active.documents.length > 0 && <button className="attached-docs" onClick={() => openView('documents')}><Icon name="file" size={14} />{active.documents.length} tài liệu trong cuộc trò chuyện<Icon name="chevron" size={12} /></button>}
            {uploading && <div className="upload-progress" role="status"><span className="spinner" />{uploadLabel}</div>}
            <form className="composer" onSubmit={send}>
              <textarea ref={textarea} value={draft} onChange={e => setDrafts(current => ({ ...current, [active.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} placeholder="Hỏi bất cứ điều gì về dữ liệu của bạn…" aria-label="Câu hỏi cho One61" maxLength={12000} rows={1} />
              <div className="composer-controls"><div><button type="button" className="icon-button attach-button" title="Đính kèm tài liệu" aria-label="Đính kèm tài liệu" disabled={busy} onClick={() => fileInput.current?.click()}><Icon name="plus" size={20} /></button><span className="composer-divider" /><label className="mode-select"><Icon name="sparkles" size={14} /><select aria-label="Chế độ trả lời" value={mode} onChange={e => setMode(e.target.value)} disabled={busy}><option value="fast">Trả lời nhanh</option><option value="reasoning">Phân tích sâu</option></select></label></div><div><span className="enter-hint">↵ để gửi</span>{pendingId ? <button type="button" className="send-button" aria-label="Dừng trả lời" title="Dừng trả lời" onClick={() => controller.current?.abort()}><Icon name="stop" size={18} /></button> : <button type="submit" className="send-button" aria-label="Gửi câu hỏi" title="Gửi câu hỏi" disabled={!draft.trim() || uploading}><Icon name="up" size={20} /></button>}</div></div>
            </form>
            <div className="composer-footer"><span><i className="tiny-spark">✦</i> Được hỗ trợ bởi One61 AI</span><span>AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.</span></div>
          </div>
        </>}

        {view === 'documents' && <div className="page-content"><div className="page-heading"><div><span className="page-eyebrow">KHO KIẾN THỨC</span><h1>Tài liệu của bạn<span className="heading-count">{active.documents.length}</span></h1><p>Kiến thức riêng cho cuộc trò chuyện đang chọn.</p></div><button className="primary-button" disabled={busy} onClick={() => fileInput.current?.click()}><Icon name="plus" size={17} />Thêm tài liệu</button></div><div className="conversation-context"><Icon name="chat" size={16} /><span>{active.title}</span></div>
          <button className={`upload-zone ${uploading ? 'uploading' : ''}`} disabled={busy} onClick={() => fileInput.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); uploadFiles(Array.from(e.dataTransfer.files)); }}><span className="upload-zone-icon">{uploading ? <span className="spinner" /> : <Icon name="upload" size={27} />}</span><strong>{uploading ? uploadLabel : 'Thả tài liệu vào đây'}</strong><span>hoặc nhấn để chọn từ máy tính</span><small>PDF, DOCX, TXT, MD, CSV, JSON · Tối đa 25 MB / tệp</small></button>
          <div className="documents-list">{active.documents.length ? active.documents.map((document, index) => <div className="document-row" key={document.document_id || index}><span className={`document-icon ${/\.pdf$/i.test(document.filename) ? 'pdf' : ''}`}><Icon name="file" size={23} /></span><div><strong>{document.filename}</strong><small>{document.size ? `${(document.size / 1024).toFixed(0)} KB · ` : ''}{document.chunks_created} đoạn kiến thức</small></div><span className="document-ready"><Icon name="check" size={13} />Sẵn sàng</span><button className="icon-button" title="Hỏi về tài liệu" aria-label={`Hỏi về ${document.filename}`} onClick={() => fillPrompt(`Tóm tắt những nội dung chính trong tài liệu ${document.filename}.`)}><Icon name="chat" size={18} /></button></div>) : <div className="empty-note"><Icon name="folder" size={20} /><p>Tài liệu đầu tiên, khởi đầu cho nhiều câu trả lời.</p></div>}</div></div>}

        {view === 'saved' && <div className="page-content saved-page"><div className="page-heading"><div><span className="page-eyebrow">GIỮ LẠI ĐIỀU HỮU ÍCH</span><h1>Câu trả lời đã lưu<span className="heading-count">{saved.length}</span></h1><p>Một góc nhỏ cho những thông tin bạn muốn quay lại.</p></div></div>{saved.length ? saved.map(m => <div className="saved-card" key={m.id}><button className="saved-origin" onClick={() => selectConversation(m.conversation.id)}><Icon name="chat" size={14} />{m.conversation.title}<Icon name="arrow" size={14} /></button>{renderMessage(m, m.conversation.id)}</div>) : <div className="empty-state"><span className="empty-state-icon"><Icon name="bookmark" size={31} /></span><h2>Câu trả lời hay, giữ lại đây.</h2><p>Nhấn biểu tượng lưu dưới câu trả lời của One61.<br />Mọi thứ bạn cần sẽ luôn dễ tìm.</p><button className="secondary-button" onClick={() => openView('chat')}>Bắt đầu trò chuyện<Icon name="arrow" size={15} /></button></div>}</div>}
      </main>
    </section>

    <nav className="dock" aria-label="Ứng dụng"><button className={`dock-app dock-chat ${view === 'chat' && !minimized ? 'dock-active' : ''}`} aria-label="Mở trợ lý One61" data-tooltip="One61 AI" onClick={() => openView('chat')}><Icon name="layers" size={31} /></button><button className={`dock-app dock-folder ${view === 'documents' && !minimized ? 'dock-active' : ''}`} aria-label="Mở tài liệu" data-tooltip="Tài liệu" onClick={() => openView('documents')}><Icon name="folder" size={32} /></button><button className={`dock-app dock-saved ${view === 'saved' && !minimized ? 'dock-active' : ''}`} aria-label="Mở câu trả lời đã lưu" data-tooltip="Đã lưu" onClick={() => openView('saved')}><Icon name="bookmark" size={28} /></button><span className="dock-divider" /><button className="dock-app dock-settings" aria-label="Mở cài đặt" data-tooltip="Cài đặt" onClick={() => setModal('settings')}><Icon name="settings" size={32} /></button><button className="dock-app dock-help" aria-label="Mở trợ giúp" data-tooltip="Trợ giúp" onClick={() => setModal('help')}><Icon name="help" size={32} /></button></nav>
    <div className="desktop-caption">Một không gian. Mọi câu trả lời.</div>
    <input ref={fileInput} className="visually-hidden" type="file" accept=".pdf,.docx,.txt,.md,.csv,.json" multiple tabIndex={-1} aria-label="Chọn tài liệu" onChange={e => { uploadFiles(Array.from(e.target.files)); e.target.value = ''; }} />
    {toast && <div className="toast" role="status"><Icon name="chat" size={17} /><span>{toast}</span><button aria-label="Đóng thông báo" onClick={() => setToast('')}><Icon name="close" size={15} /></button></div>}

    <dialog ref={dialog} className={`modal ${modal === 'search' ? 'search-modal' : ''}`} onCancel={() => setModal('')} onClose={() => setModal('')} onClick={e => { if (e.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) setModal(''); } }} aria-labelledby="modal-title">
      <div className="modal-heading"><h2 id="modal-title">{modal === 'search' ? 'Tìm cuộc trò chuyện' : modal === 'settings' ? 'Cài đặt không gian' : 'Chào mừng đến One61'}</h2><button className="icon-button" aria-label="Đóng hộp thoại" onClick={() => setModal('')}><Icon name="close" size={18} /></button></div>
      {modal === 'search' && <><div className="search-field"><Icon name="search" size={19} /><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm trong tiêu đề, nội dung…" aria-label="Tìm kiếm cuộc trò chuyện" /></div><div className="search-results">{conversations.filter(c => (c.messages.length || c.documents.length) && `${c.title} ${c.messages.map(m => m.text).join(' ')}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))).map(c => <button key={c.id} onClick={() => selectConversation(c.id)}><Icon name="chat" size={18} /><span><strong>{c.title}</strong><small>{c.messages.length} tin nhắn · {c.documents.length} tài liệu</small></span><Icon name="chevron" size={15} /></button>)}{!conversations.some(c => (c.messages.length || c.documents.length) && `${c.title} ${c.messages.map(m => m.text).join(' ')}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))) && <p>Chưa có cuộc trò chuyện phù hợp.</p>}</div><div className="modal-footer">Tìm kiếm trong lịch sử trên trình duyệt này.<kbd>esc</kbd></div></>}
      {modal === 'settings' && <div className="settings-content"><div className="setting-row"><div><strong>Giao diện</strong><p>Chọn sắc thái cho không gian của bạn.</p></div><div className="theme-switch"><button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}><Icon name="sun" size={16} />Sáng</button><button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}><Icon name="moon" size={16} />Tối</button></div></div><div className="setting-row"><div><strong>Lịch sử trò chuyện</strong><p>Lưu trên trình duyệt này. Xuất để giữ bản sao.</p></div><button className="secondary-button" onClick={exportWorkspace}><Icon name="download" size={16} />Xuất JSON</button></div><div className="connection-info"><i className={`status-dot ${health ? 'online' : ''}`} /><div><strong>{health ? 'Máy chủ đã kết nối' : 'Máy chủ chưa kết nối'}</strong><p>{health ? (health.rag_initialized ? 'Kho kiến thức sẵn sàng.' : 'Máy chủ hoạt động. Kho kiến thức chưa khởi tạo.') : 'Khởi động dịch vụ FastAPI tại cổng 8000 để chat và tải tài liệu.'}</p></div></div><p className="settings-footnote">One61 Workspace · React · Lấy cảm hứng từ macOS</p></div>}
      {modal === 'help' && <div className="help-content"><p>Không gian gọn gàng để làm việc cùng dữ liệu của bạn.</p><div><span className="suggestion-icon blue"><Icon name="chat" /></span><section><strong>Hỏi theo cách của bạn</strong><p>Tra cứu vận đơn, hỏi chính sách hoặc phân tích dữ liệu. Chọn “Phân tích sâu” cho câu hỏi cần đối chiếu kỹ.</p></section></div><div><span className="suggestion-icon violet"><Icon name="file" /></span><section><strong>Thêm kiến thức riêng</strong><p>Đính kèm tài liệu bằng nút +. Tài liệu chỉ dùng trong cuộc trò chuyện hiện tại.</p></section></div><div><span className="suggestion-icon green"><Icon name="bookmark" /></span><section><strong>Giữ những câu trả lời hữu ích</strong><p>Lưu câu trả lời để xem lại. Dùng ⌘ K hoặc Ctrl K để tìm cuộc trò chuyện.</p></section></div><button className="primary-button" onClick={() => { setModal(''); openView('chat'); }}>Bắt đầu khám phá<Icon name="arrow" size={16} /></button></div>}
    </dialog>
  </div>;
}
