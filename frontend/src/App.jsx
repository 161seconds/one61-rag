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
const iconButton = 'inline-flex size-[30px] shrink-0 items-center justify-center rounded-md p-[5px] text-[#8993a5] hover:bg-[#f0f2f7] hover:text-[#263044] dark:hover:bg-[#303747] dark:hover:text-[#dce2ef] disabled:cursor-not-allowed disabled:opacity-45';
const primaryButton = 'inline-flex shrink-0 items-center justify-center gap-[7px] rounded-[7px] bg-[#5371d9] px-[13px] py-2.5 text-[10px] text-white shadow-sm hover:bg-[#4661bd] dark:bg-[#7f9bea] dark:text-[#17233f] disabled:cursor-not-allowed disabled:opacity-45';
const secondaryButton = 'inline-flex shrink-0 items-center justify-center gap-[7px] rounded-[7px] border border-[#e9ecf1] bg-white px-[13px] py-2.5 text-[10px] text-[#69758a] hover:bg-[#f0f2f7] dark:border-[#353c4b] dark:bg-[#2b313f] dark:text-[#a0aac0] dark:hover:bg-[#303747]';
const logo = 'relative inline-flex shrink-0 items-center justify-center bg-[linear-gradient(145deg,#7e9af6,#4967d1_70%,#3d5dc1)] text-white shadow-[inset_0_1px_1px_#ffffff60,0_3px_6px_#4560b328]';
const spinner = 'inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-[#afbfdd50] border-t-[#7e97ca] motion-reduce:animate-none';
const suggestionColors = {
  blue: 'bg-[#ecf1fc] text-[#6c89ce] dark:bg-[#38496966] dark:text-[#95b1ed]',
  violet: 'bg-[#f0edfa] text-[#9783c4] dark:bg-[#50436966] dark:text-[#b7a4db]',
  green: 'bg-[#eaf4ef] text-[#72a18a] dark:bg-[#3f605466] dark:text-[#9cc6b2]',
  amber: 'bg-[#fbf3e6] text-[#c9a261] dark:bg-[#68573966] dark:text-[#cfb37d]',
};

function readLocal(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function AssistantText({ text }) {
  // ponytail: plain text + bold/code only; add a Markdown parser when tables are required.
  return <div className="whitespace-pre-wrap [overflow-wrap:anywhere]">{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => part.startsWith('**')
    ? <strong className="font-[650]" key={i}>{part.slice(2, -2)}</strong> : part.startsWith('`')
      ? <code className="rounded bg-[#f0f2f7] px-[5px] py-0.5 font-mono text-[11px] dark:bg-[#303747]" key={i}>{part.slice(1, -1)}</code> : part)}</div>;
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
        e.preventDefault(); setSearch(''); setModal('search');
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);

  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'end' }); }, [active.messages.length, pendingId, view]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  function updateConversation(id, transform) {
    setConversations(current => current.map(c => c.id === id ? transform(c) : c));
  }

  function openView(nextView) {
    setView(nextView); setSidebarOpen(false);
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
    return <article key={message.id} className={`mb-[25px] flex items-start gap-3 text-xs leading-[1.9] max-[761px]:gap-2 max-[761px]:text-[11px] ${message.role === 'user' ? 'mt-1 mb-7 justify-end' : ''}`}>
      {message.role === 'assistant' && <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(140deg,#8ea9f5,#5474ca)] text-white max-[761px]:size-[26px] max-[761px]:rounded-[7px]"><Icon name="layers" size={18} /></div>}
      <div className={message.role === 'user' ? 'min-w-0 max-w-[85%] flex-[0_1_auto] rounded-[13px_13px_3px_13px] border border-[#e2e7f2] bg-[#eef2fb] px-[17px] py-3 dark:border-[#435371] dark:bg-[#354261] max-[761px]:max-w-[92%]' : 'min-w-0 flex-1'}>
        {message.role === 'assistant' && <div className="mb-[9px] pt-0.5 text-[11px] font-[650]">One61 <span className="ml-1.5 text-[8px] font-normal text-[#758097] dark:text-[#838fa7]">Trợ lý AI</span></div>}
        <div className={message.error ? 'rounded-md bg-[#b275640a] px-3 py-2.5 text-[#b27564]' : ''}><AssistantText text={message.text} /></div>
        {message.verification && <div className={`mt-[13px] flex flex-wrap items-center gap-[5px] text-[9px] ${message.verification.is_verified ? 'text-[#659b87]' : 'text-[#b99255]'}`}>
          <Icon name="shield" size={14} /> {message.verification.is_verified ? 'Đã đối chiếu nguồn' : 'Cần kiểm tra thêm'}
          {Number.isFinite(message.verification.confidence_score) && <span className="text-[#758097] dark:text-[#838fa7]">· {Math.round(message.verification.confidence_score * 100)}% tin cậy</span>}
        </div>}
        {message.verification?.disclaimer && <p className="mt-2 rounded-[5px] bg-[#a9844d0a] px-2.5 py-2 text-[10px] text-[#a4814d]">{message.verification.disclaimer}</p>}
        {message.citations?.length > 0 && <details className="mt-3 rounded-md bg-[#f0f2f7] px-3 py-2 text-[10px] text-[#69758a] dark:bg-[#303747] dark:text-[#a0aac0]"><summary className="cursor-pointer"><Icon name="file" size={14} className="mr-1" /> {message.citations.length} nguồn tham khảo</summary>
          {message.citations.map((citation, index) => <div key={index} className="mt-2.5 border-t border-[#e9ecf1] pt-2.5 [overflow-wrap:anywhere] dark:border-[#353c4b]"><strong>{citation.source_name || citation.source_id || `Nguồn ${index + 1}`}</strong><p className="whitespace-pre-wrap text-[10px]">{citation.chunk_text}</p></div>)}
        </details>}
        {message.role === 'assistant' && !message.error && <div className="mt-2.5 flex items-center gap-[3px]">
          <button className="flex items-center rounded-[5px] p-[5px] text-[#758097] hover:bg-[#f0f2f7] dark:text-[#838fa7] dark:hover:bg-[#303747]" title="Sao chép" aria-label="Sao chép câu trả lời" onClick={() => copy(message.text)}><Icon name="copy" size={15} /></button>
          <button className={`flex items-center rounded-[5px] p-[5px] ${message.saved ? 'bg-[#e1e7f6] text-[#5371d9] dark:bg-[#3b4967] dark:text-[#7f9bea]' : 'text-[#758097] hover:bg-[#f0f2f7] dark:text-[#838fa7] dark:hover:bg-[#303747]'}`} title={message.saved ? 'Bỏ lưu' : 'Lưu câu trả lời'} aria-label={message.saved ? 'Bỏ lưu câu trả lời' : 'Lưu câu trả lời'} aria-pressed={Boolean(message.saved)} onClick={() => updateConversation(conversationId, c => ({ ...c, messages: c.messages.map(m => m.id === message.id ? { ...m, saved: !m.saved } : m) }))}><Icon name="bookmark" size={15} /></button>
          {Number.isFinite(message.metadata?.processing_time_ms) && <span className="ml-2 text-[8px] text-[#758097] dark:text-[#838fa7]">{(message.metadata.processing_time_ms / 1000).toFixed(1)} giây</span>}
        </div>}
        {message.error && <button className="mt-2 inline-flex items-center gap-[5px] text-[10px] text-[#5371d9] disabled:cursor-not-allowed disabled:opacity-45 dark:text-[#7f9bea]" onClick={() => fillPrompt(message.retry)} disabled={busy}>Thử lại <Icon name="arrow" size={14} /></button>}
        {view === 'chat' && message.suggestions?.length > 0 && <div className="mt-3.5 flex flex-wrap gap-1.5">{message.suggestions.slice(0, 3).map((suggestion, index) => <button key={index} className="flex items-center gap-2 rounded-[7px] border border-[#e9ecf1] px-[9px] py-1.5 text-left text-[9px] text-[#69758a] hover:bg-[#f0f2f7] dark:border-[#353c4b] dark:text-[#a0aac0] dark:hover:bg-[#303747]" onClick={() => fillPrompt(suggestion)}>{suggestion}<Icon name="arrow" size={14} /></button>)}</div>}
      </div>
    </article>;
  }

  return <div className="relative h-dvh overflow-hidden font-['Be_Vietnam_Pro',sans-serif] text-[#263044] antialiased selection:bg-[#c8d7ff] selection:text-[#253253] dark:text-[#dce2ef] [&_button]:cursor-pointer [&_button]:transition [&_button]:duration-200 [&_:is(button,input,select,summary):focus-visible]:outline-2 [&_:is(button,input,select,summary):focus-visible]:outline-offset-4 [&_:is(button,input,select,summary):focus-visible]:outline-[#7f9bea] motion-reduce:[&_*]:animate-none motion-reduce:[&_*]:transition-none">
    <section aria-label="One61 Workspace" className="flex h-full flex-col overflow-hidden bg-[#eff2f9] dark:bg-[#252d3d]">
      <header className="relative z-[2] flex h-[31px] shrink-0 items-center justify-between border-b border-[#e9ecf1] bg-[#ffffff2d] px-[25px] text-[11px] text-[#354153] backdrop-blur-xl dark:border-[#353c4b] dark:bg-[#16223366] dark:text-[#cad7e9] max-[761px]:h-[30px] max-[761px]:px-3.5">
        <div className="flex items-center gap-[21px] max-[761px]:gap-2.5"><Icon name="layers" size={18} className="-mr-1" /><strong className="text-xs font-bold">One61</strong><span className="max-[761px]:hidden">Không gian làm việc</span></div>
        <div className="flex items-center gap-[15px] text-[10px] font-medium max-[761px]:text-[9px]"><span className="flex items-center gap-1.5 max-[761px]:hidden"><Icon name="moon" size={13} /> Tập trung</span><Icon name="wifi" size={17} className="max-[761px]:hidden" /><Icon name="battery" size={22} className="max-[761px]:hidden" /><button className="flex p-0.5 max-[761px]:hidden" aria-label="Cài đặt nhanh" title="Cài đặt" onClick={() => setModal('settings')}><Icon name="sliders" size={17} /></button><time className="min-w-[135px] text-right max-[761px]:min-w-0" dateTime={now.toISOString()}>{new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(now)}</time></div>
      </header>
      <div className="relative flex min-h-0 flex-1">
        {sidebarOpen && <button className="absolute inset-0 z-[6] hidden bg-[#26354d25] max-[761px]:block" aria-label="Đóng thanh bên" onClick={() => setSidebarOpen(false)} />}
        <aside aria-label="Thanh bên" className={`w-[238px] shrink-0 flex-col border-r border-[#ced5e766] px-[17px] dark:border-[#353c4b] tablet:w-[213px] tablet:px-[13px] ${sidebarHidden ? 'hidden' : 'flex'} ${sidebarOpen ? 'max-[761px]:absolute max-[761px]:inset-y-0 max-[761px]:left-0 max-[761px]:z-[7] max-[761px]:flex max-[761px]:bg-[#eff2f9de] max-[761px]:shadow-[15px_0_40px_#22355620] max-[761px]:backdrop-blur-[30px] dark:max-[761px]:bg-[#252d3ded]' : 'max-[761px]:hidden'}`}>
          <div aria-hidden="true" className="flex h-[52px] shrink-0 items-center gap-2 px-[5px]">
            <span className="size-3 rounded-full bg-[#ff6059]" />
            <span className="size-3 rounded-full bg-[#ffbd2e]" />
            <span className="size-3 rounded-full bg-[#29c840]" />
          </div>
          <div className="flex items-center gap-2.5 px-1.5 pt-[7px] pb-[26px] compact:pb-[18px]"><span className={`${logo} size-[38px] rounded-[11px]`}><Icon name="layers" size={23} /></span><span className="flex items-center gap-[9px] text-[27px] font-[750] tracking-[-1.4px]">one61<span className="rounded-[5px] border border-[#aab9e4] px-[5px] text-[9px] leading-[17px] font-semibold tracking-[.2px] text-[#6078bd] dark:text-[#b1c6ff]">AI</span></span></div>
          <button className="flex w-full shrink-0 items-center justify-center gap-[9px] rounded-lg border border-[#c7d1e66b] bg-[#ffffff8f] px-1.5 py-[11px] text-[11px] font-[550] shadow-[0_2px_4px_#3a4a6d05] hover:bg-white hover:shadow-[0_3px_8px_#3a4a6d0b] dark:border-[#45506b] dark:bg-[#3a4357] dark:hover:bg-[#444f67] tablet:text-[10px]" onClick={startConversation}><Icon name="plus" size={17} /> Cuộc trò chuyện mới</button>
          <button className="flex w-full shrink-0 items-center gap-[9px] px-2.5 pt-[17px] pb-[15px] text-[11px] text-[#737e92] dark:text-[#a0aac0]" onClick={() => { setSearch(''); setModal('search'); }}><Icon name="search" size={16} /><span>Tìm kiếm</span><kbd className="ml-auto rounded border border-[#c7cfdf88] px-[5px] py-px font-sans text-[10px] font-normal text-[#758097] dark:text-[#a0aac0]">⌘ K</kbd></button>
          <p className="flex shrink-0 items-center justify-between px-[9px] pt-[18px] pb-[9px] text-[8px] font-semibold tracking-[1.05px] text-[#69758a] dark:text-[#a0aac0]">KHÔNG GIAN LÀM VIỆC</p>
          <nav className="flex shrink-0 flex-col gap-1" aria-label="Điều hướng chính">{navigation.map(item => <button key={item.id} className={`flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-[11px] text-[11px] ${view === item.id ? 'bg-[#e1e7f6] font-semibold text-[#4b65ab] dark:bg-[#3b4967] dark:text-[#b1c6ff]' : 'text-[#606a7d] hover:bg-[#d9dfec80] dark:text-[#9ba8c2] dark:hover:bg-[#45506b60]'}`} onClick={() => openView(item.id)} aria-current={view === item.id ? 'page' : undefined}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.id === 'chat' && <span className="ml-auto rounded border border-[#b8c6e6] px-1 text-[8px] leading-3.5 text-[#5f79bd] dark:text-[#b1c6ff]">AI</span>}{item.id === 'documents' && active.documents.length > 0 && <span className="ml-auto text-[10px] text-[#8a96aa]">{active.documents.length}</span>}{item.id === 'saved' && saved.length > 0 && <span className="ml-auto text-[10px] text-[#8a96aa]">{saved.length}</span>}</button>)}</nav>
          <div className="mt-[7px] min-h-[54px] flex-1 overflow-y-auto"><p className="mb-1 flex items-center justify-between px-[9px] pt-[19px] pb-[9px] text-[8px] font-semibold tracking-[1.05px] text-[#69758a] dark:text-[#a0aac0]">GẦN ĐÂY <Icon name="clock" size={12} /></p>
            {conversations.filter(c => c.messages.length || c.documents.length).length ? conversations.filter(c => c.messages.length || c.documents.length).map(c => <button key={c.id} className={`flex w-full items-center gap-[9px] rounded-md p-2.5 text-left text-[10px] ${c.id === active.id && view === 'chat' ? 'bg-[#e0e5f180] text-[#4e6599] dark:bg-[#45506b45] dark:text-[#adc0ea]' : 'text-[#7a8597] hover:bg-[#d9dfec80] dark:text-[#a0aac0] dark:hover:bg-[#45506b60]'}`} onClick={() => selectConversation(c.id)} title={c.title}><Icon name="chat" size={14} /><span className="truncate">{c.title}</span></button>) : <p className="px-2.5 py-1 text-[10px] leading-[1.9] text-[#69758a] dark:text-[#a0aac0]">Những cuộc trò chuyện của bạn<br />sẽ xuất hiện ở đây.</p>}
          </div>
          <div className="shrink-0 pt-4"><div className="mb-4 flex items-start gap-2 rounded-lg border border-[#ffffff85] bg-[linear-gradient(130deg,#ffffff7a,#e8edf77a)] px-[9px] py-3 compact:mb-3 dark:border-[#45506b66] dark:bg-[#3d496533] dark:bg-none tablet:gap-[5px] tablet:px-[7px] tablet:py-[11px]"><span className="pt-0.5 text-[#6a86d2]"><Icon name="sparkles" size={18} /></span><div><strong className="text-[9px] font-[550] tablet:text-[8px]">Ít tìm kiếm. Nhiều câu trả lời.</strong><p className="mt-1.5 text-[8px] leading-normal text-[#8b95a8] tablet:text-[7px]">Tri thức của bạn, luôn trong tầm tay.</p></div></div>
            <button className="-ml-[17px] flex w-[calc(100%+34px)] items-center gap-[9px] border-t border-[#d9deea] p-[17px] text-left dark:border-[#353c4b] tablet:-ml-[13px] tablet:w-[calc(100%+26px)] tablet:px-[13px] tablet:py-[15px]" onClick={() => setModal('settings')}><span className="inline-flex size-[31px] shrink-0 items-center justify-center rounded-full border-2 border-[#ffffff66] bg-[linear-gradient(120deg,#ced9ec,#b7c6e1)] text-xs font-semibold text-[#5e7298] dark:border-[#6d7e9d44] dark:bg-[#465574] dark:bg-none dark:text-[#b8c9e8]">B</span><span className="flex-1"><strong className="block text-[10px] font-[550]">Không gian cá nhân</strong><small className="mt-[5px] flex items-center gap-1 text-[8px] text-[#8b94a6]"><i className={`inline-block size-[5px] shrink-0 rounded-full ${health ? 'bg-[#68a88f]' : 'bg-[#bd945d]'}`} />{health === null ? 'Đang kết nối…' : health ? 'Đã kết nối máy chủ' : 'Chưa kết nối máy chủ'}</small></span><Icon name="settings" size={17} className="text-[#8994a8]" /></button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-[#fcfcfd] dark:bg-[#202530]">
          <header className="flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-[#e9ecf1] px-6 dark:border-[#353c4b] max-[761px]:h-[50px] max-[761px]:px-3"><div className="flex items-center gap-[15px] overflow-hidden text-[10px] max-[761px]:gap-2.5"><button className={iconButton} aria-label="Ẩn hoặc hiện thanh bên" onClick={() => { if (window.matchMedia('(width < 761px)').matches) setSidebarOpen(!sidebarOpen); else setSidebarHidden(!sidebarHidden); }}><Icon name="sidebar" size={19} /></button><span className="h-3.5 w-px bg-[#e9ecf1] dark:bg-[#353c4b] max-[761px]:hidden" /><span className="whitespace-nowrap text-[#8c95a5] max-[761px]:hidden">Không gian cá nhân</span><Icon name="chevron" size={12} className="text-[#b2b9c5] max-[761px]:hidden" /><strong className="shrink-0 font-[550]">{navigation.find(n => n.id === view)?.label}</strong></div><div className="flex shrink-0 items-center gap-3 text-[10px] max-[761px]:gap-[5px]"><span className="mr-[5px] flex items-center gap-[5px] text-[9px] text-[#929baa] tablet:hidden max-[761px]:hidden"><Icon name="shield" size={13} /> Lịch sử trên máy</span><button className={iconButton} title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'} aria-label={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} /></button><button className={iconButton} title="Trợ giúp" aria-label="Trợ giúp" onClick={() => setModal('help')}><Icon name="help" size={18} /></button></div></header>
          {storageError && <div role="alert" className="bg-[#fff4e7] px-5 py-[9px] text-[10px] text-[#9b743f]">Không thể lưu lịch sử trên máy. Xuất lịch sử trong Cài đặt trước khi đóng trang.</div>}
          {view === 'chat' && <>
            <div className={`min-h-0 flex-1 overflow-y-auto px-[38px] tablet:px-[26px] max-[761px]:px-5 ${!active.messages.length ? 'flex flex-col pt-6 pb-2.5 compact:pt-[13px] compact:pb-0 max-[761px]:pt-[21px] short-phone:pt-3.5' : 'pt-8 pb-3 max-[761px]:pt-[21px] max-[761px]:pb-2.5'}`}>
              {!active.messages.length ? <div className="m-auto w-full max-w-[682px] pt-3 pb-2 text-center compact:py-0.5 max-[761px]:max-w-[480px] max-[761px]:pt-0.5 max-[761px]:pb-0">
                <div className="relative mx-auto mb-2.5 flex h-[70px] w-[90px] items-center justify-center compact:mb-3 compact:h-[62px] compact:w-16 max-[761px]:mb-3.5 max-[761px]:size-[66px] short-phone:hidden">
                  <span className="absolute size-[86px] rotate-[12deg] rounded-[28px] border border-[#9bb1e126] bg-[#d9e4ff1f] compact:size-16 compact:rounded-[20px] max-[761px]:size-[67px] max-[761px]:rounded-[20px]" /><span className="absolute size-[104px] -rotate-[14deg] rounded-[28px] border border-[#bac9e51a] compact:size-[78px] compact:rounded-[20px] max-[761px]:size-20 max-[761px]:rounded-[20px]" />
                  <span className={`${logo} size-[66px] -rotate-[8deg] rounded-[19px] shadow-[inset_0_2px_2px_#ffffff80,0_8px_20px_#5574d028,0_2px_4px_#3358b920] compact:size-[49px] compact:rounded-[14px] max-[761px]:size-[51px] max-[761px]:rounded-[14px]`}><Icon name="layers" size={35} className="rotate-[8deg] compact:size-[29px] max-[761px]:size-[29px]" /></span><span className="absolute right-1 bottom-1 flex size-6 rotate-[6deg] items-center justify-center rounded-lg bg-[#fcfcfd] text-[#778ed0] shadow-[0_2px_5px_#44588913] compact:-right-0.5 compact:bottom-0 compact:size-5 compact:rounded-md dark:bg-[#202530] max-[761px]:-right-px max-[761px]:bottom-0 max-[761px]:size-5"><Icon name="sparkles" size={15} /></span>
                </div>
                <div className="mt-2 mb-3 text-[8px] font-[550] tracking-[1.8px] text-[#74809a] compact:hidden max-[761px]:hidden">TRỢ LÝ THÔNG MINH CỦA BẠN</div>
                <h1 className="text-[clamp(30px,3.05vw,43px)] leading-[1.32] font-semibold tracking-[-1.5px] text-[#30394c] compact:text-[34px] compact:leading-[1.27] dark:text-[#dce4f5] max-[761px]:text-[29px] max-[761px]:leading-[1.33] max-[761px]:tracking-[-1px] short-phone:text-[25px]">Hiểu dữ liệu.<br /><span className="bg-[linear-gradient(100deg,#526cc0,#718ccb_60%,#91a6ce)] bg-clip-text text-transparent dark:bg-[linear-gradient(100deg,#9db5ff,#869cce)]">Đơn giản mọi việc.</span></h1>
                <p className="mt-[15px] text-[11px] leading-[1.9] text-[#69758a] compact:mt-[11px] compact:text-[10px] dark:text-[#a0aac0] max-[761px]:mt-3 max-[761px]:text-[10px]">Từ vận đơn đến kiến thức vận hành.<br className="hidden max-[761px]:block" /> Cứ hỏi, One61 sẽ giúp bạn kết nối.</p>
                <div className="mt-[25px] grid grid-cols-2 gap-[11px] text-left compact:mt-[22px] compact:gap-[9px] max-[761px]:mt-[25px] max-[761px]:gap-[9px] short-phone:mt-[18px]">{prompts.map(prompt => <button key={prompt.title} className="relative flex min-h-[76px] items-center gap-[13px] rounded-[10px] border border-[#e5e9f1] bg-[linear-gradient(125deg,#fff,#fcfcfd)] px-[15px] py-3.5 text-left shadow-[0_2px_4px_#354b6d02] hover:-translate-y-0.5 hover:border-[#c6d2ed] hover:shadow-[0_5px_15px_#4666a10b] compact:min-h-16 compact:px-3.5 compact:py-[11px] dark:border-[#353c4b] dark:bg-[linear-gradient(125deg,#2b313f,#202530)] tablet:gap-[9px] tablet:p-[11px] max-[761px]:min-h-[95px] max-[761px]:flex-col max-[761px]:items-start max-[761px]:gap-[9px] max-[761px]:p-3 short-phone:min-h-20 short-phone:gap-[7px] short-phone:p-2.5" onClick={() => fillPrompt(prompt.text)}><span className={`inline-flex size-[37px] shrink-0 items-center justify-center rounded-[9px] compact:size-8 compact:rounded-lg max-[761px]:size-[29px] max-[761px]:rounded-[7px] ${suggestionColors[prompt.color]}`}><Icon name={prompt.icon} size={21} className="compact:size-[19px] max-[761px]:size-[18px]" /></span><span className="flex min-w-0 flex-col gap-[7px] compact:gap-[5px] max-[761px]:gap-[5px]"><strong className="text-[11px] font-[550] whitespace-nowrap tablet:text-[10px] max-[761px]:text-[9px]">{prompt.title}</strong><small className="text-[9px] leading-normal text-[#69758a] dark:text-[#a0aac0] tablet:text-[8px] max-[761px]:text-[8px] max-[761px]:leading-[1.7] short-phone:hidden">{prompt.description}</small></span><Icon name="arrow" size={15} className="ml-auto text-[#a2aec5] tablet:w-3 max-[761px]:absolute max-[761px]:top-[18px] max-[761px]:right-2.5 max-[761px]:w-3" /></button>)}</div>
                <p className="mt-[18px] flex items-center justify-center gap-1.5 text-[9px] text-[#69758a] compact:mt-4 compact:text-[8px] dark:text-[#a0aac0] max-[761px]:mt-4 max-[761px]:gap-1 max-[761px]:text-[8px] short-phone:mt-[13px]"><Icon name="paperclip" size={13} /> Có tài liệu riêng? Đính kèm để bắt đầu hỏi đáp.</p>
              </div> : <div className="mx-auto max-w-[720px]" role="log" aria-label="Cuộc trò chuyện" aria-live="polite">{active.messages.map(m => renderMessage(m))}{pendingId === active.id && <div className="mb-[25px] flex items-start gap-3 max-[761px]:gap-2"><div className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(140deg,#8ea9f5,#5474ca)] text-white"><Icon name="layers" size={18} /></div><div className="flex h-[30px] items-center gap-1"><span className="size-1 animate-bounce rounded-full bg-[#9baaca]" /><span className="size-1 animate-bounce rounded-full bg-[#9baaca] [animation-delay:.15s]" /><span className="size-1 animate-bounce rounded-full bg-[#9baaca] [animation-delay:.3s]" /><small className="ml-[7px] text-[9px] text-[#69758a] dark:text-[#a0aac0]">Đang tìm câu trả lời{mode === 'reasoning' ? ' · Phân tích sâu' : ''}…</small></div></div>}<div ref={bottom} /></div>}
            </div>
            <div className="w-full max-w-[822px] self-center px-[38px] pt-2.5 pb-[17px] compact:pt-3 compact:pb-3.5 tablet:px-[26px] max-[761px]:px-[17px] max-[761px]:pt-2.5 max-[761px]:pb-[13px]">
              {active.documents.length > 0 && <button className="mb-[9px] flex items-center gap-1.5 rounded-md bg-[#f0f2f7] px-[9px] py-1.5 text-[9px] text-[#6a7ca5] dark:bg-[#303747] dark:text-[#a0aac0]" onClick={() => openView('documents')}><Icon name="file" size={14} />{active.documents.length} tài liệu trong cuộc trò chuyện<Icon name="chevron" size={12} /></button>}
              {uploading && <div className="mb-[9px] flex items-center gap-2 text-[10px] text-[#69758a] dark:text-[#a0aac0]" role="status"><span className={spinner} />{uploadLabel}</div>}
              <form className="rounded-xl border border-[#dee4ee] bg-white px-4 pt-3.5 pb-[11px] shadow-[0_3px_10px_#2d426e05] transition focus-within:border-[#a7b9e6] focus-within:shadow-[0_0_0_3px_#6c8ae50a,0_3px_12px_#2d426e06] dark:border-[#353c4b] dark:bg-[#272e3b] max-[761px]:rounded-[10px] max-[761px]:px-3 max-[761px]:pt-3 max-[761px]:pb-[9px]" onSubmit={send}>
                <textarea className="block max-h-[140px] min-h-9 w-full field-sizing-content resize-none border-0 bg-transparent px-px pt-0.5 pb-[9px] text-[11px] leading-[1.8] placeholder:text-[#758097] focus-visible:outline-none dark:placeholder:text-[#838fa7] max-[761px]:min-h-[39px] max-[761px]:text-xs" ref={textarea} value={draft} onChange={e => setDrafts(current => ({ ...current, [active.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} placeholder="Hỏi bất cứ điều gì về dữ liệu của bạn…" aria-label="Câu hỏi cho One61" maxLength={12000} rows={1} />
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><button type="button" className={`${iconButton} -ml-1`} title="Đính kèm tài liệu" aria-label="Đính kèm tài liệu" disabled={busy} onClick={() => fileInput.current?.click()}><Icon name="plus" size={20} /></button><span className="mx-0.5 h-[13px] w-px bg-[#e9ecf1] dark:bg-[#353c4b]" /><label className="flex items-center gap-1.5 rounded-md bg-[#f6f7fa] px-2 py-1.5 text-[#8491a8] dark:bg-[#303747]"><Icon name="sparkles" size={14} /><select className="max-w-32 cursor-pointer border-0 bg-transparent pr-0.5 text-[9px] text-[#76839a] dark:text-[#b0beda] [&>option]:bg-white [&>option]:text-[#263044] dark:[&>option]:bg-[#2b313f] dark:[&>option]:text-[#dce2ef]" aria-label="Chế độ trả lời" value={mode} onChange={e => setMode(e.target.value)} disabled={busy}><option value="fast">Trả lời nhanh</option><option value="reasoning">Phân tích sâu</option></select></label></div><div className="flex items-center gap-2"><span className="mr-[5px] text-[8px] text-[#a1aaba] max-[761px]:hidden">↵ để gửi</span>{pendingId ? <button type="button" className="flex size-[31px] items-center justify-center rounded-lg bg-[linear-gradient(145deg,#6c8cdb,#4d6cc2)] text-white shadow-sm hover:-translate-y-px" aria-label="Dừng trả lời" title="Dừng trả lời" onClick={() => controller.current?.abort()}><Icon name="stop" size={18} /></button> : <button type="submit" className="flex size-[31px] items-center justify-center rounded-lg bg-[linear-gradient(145deg,#6c8cdb,#4d6cc2)] text-white shadow-[0_2px_4px_#4764ad21] enabled:hover:-translate-y-px enabled:hover:shadow-[0_3px_8px_#4764ad35] disabled:cursor-not-allowed disabled:bg-[#a5b7db] disabled:bg-none disabled:shadow-none dark:disabled:bg-[#4c5c7d] dark:disabled:text-[#a6b7d9]" aria-label="Gửi câu hỏi" title="Gửi câu hỏi" disabled={!draft.trim() || uploading}><Icon name="up" size={20} /></button>}</div></div>
              </form>
              <div className="mx-0.5 mt-[11px] flex justify-between gap-2 text-[7px] text-[#a1aaba] max-[761px]:justify-center max-[761px]:leading-normal"><span className="whitespace-nowrap max-[761px]:hidden"><i className="mr-1 text-[10px] text-[#899ac1] not-italic">✦</i> Được hỗ trợ bởi One61 AI</span><span>AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.</span></div>
            </div>
          </>}

          {view === 'documents' && <div className="flex-1 overflow-y-auto px-[45px] py-[41px] tablet:p-[30px] max-[761px]:px-5 max-[761px]:py-[25px]"><div className="mb-[26px] flex items-center justify-between gap-5 max-[761px]:flex-wrap max-[761px]:items-start max-[761px]:gap-3"><div><span className="text-[8px] tracking-[1.4px] text-[#91a0b9]">KHO KIẾN THỨC</span><h1 className="mt-3 text-[27px] font-[550] tracking-[-.8px] max-[761px]:text-[23px]">Tài liệu của bạn<span className="ml-2.5 rounded-md border border-[#e9ecf1] bg-[#f0f2f7] px-[7px] py-0.5 align-middle text-[11px] text-[#758097] dark:border-[#353c4b] dark:bg-[#303747] dark:text-[#838fa7]">{active.documents.length}</span></h1><p className="mt-3 text-[10px] leading-[1.8] text-[#69758a] dark:text-[#a0aac0]">Kiến thức riêng cho cuộc trò chuyện đang chọn.</p></div><button className={primaryButton} disabled={busy} onClick={() => fileInput.current?.click()}><Icon name="plus" size={17} />Thêm tài liệu</button></div><div className="mb-[18px] flex items-center gap-[7px] border-b border-[#e9ecf1] pb-4 text-[10px] text-[#69758a] dark:border-[#353c4b] dark:text-[#a0aac0]"><Icon name="chat" size={16} /><span className="truncate">{active.title}</span></div>
            <button className="flex w-full flex-col items-center rounded-[11px] border border-dashed border-[#cbd5e8] bg-[#718ed904] px-[15px] py-[33px] text-[#69758a] hover:border-[#98b0e0] hover:bg-[#718ed90a] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#46577b] dark:text-[#a0aac0] max-[761px]:px-3 max-[761px]:py-[25px]" disabled={busy} onClick={() => fileInput.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); uploadFiles(Array.from(e.dataTransfer.files)); }}><span className="mb-[17px] flex size-[53px] items-center justify-center rounded-[14px] border border-[#e0e7f5] bg-[#eef2fb] text-[#8ba0cd] dark:border-[#435371] dark:bg-[#354362]">{uploading ? <span className={spinner} /> : <Icon name="upload" size={27} />}</span><strong className="text-xs font-[550] text-[#263044] [overflow-wrap:anywhere] dark:text-[#dce2ef]">{uploading ? uploadLabel : 'Thả tài liệu vào đây'}</strong><span className="mt-2 text-[10px]">hoặc nhấn để chọn từ máy tính</span><small className="mt-5 text-[8px] text-[#758097] dark:text-[#838fa7] max-[761px]:text-[7px]">PDF, DOCX, TXT, MD, CSV, JSON · Tối đa 25 MB / tệp</small></button>
            <div className="mt-6">{active.documents.length ? active.documents.map((document, index) => <div className="flex items-center gap-[13px] border-b border-[#e9ecf1] py-[15px] dark:border-[#353c4b] max-[761px]:gap-[9px]" key={document.document_id || index}><span className={`flex h-[43px] w-[39px] shrink-0 items-center justify-center rounded-[7px] ${/\.pdf$/i.test(document.filename) ? 'bg-[#fbefed] text-[#cd9b92] dark:bg-[#613f3b]' : 'bg-[#edf1fb] text-[#839bcc] dark:bg-[#354261]'}`}><Icon name="file" size={23} /></span><div className="min-w-0 flex-1"><strong className="text-[11px] font-medium [overflow-wrap:anywhere]">{document.filename}</strong><small className="mt-[5px] block text-[8px] text-[#758097] dark:text-[#838fa7]">{document.size ? `${(document.size / 1024).toFixed(0)} KB · ` : ''}{document.chunks_created} đoạn kiến thức</small></div><span className="flex items-center gap-1 text-[8px] text-[#80a78f] max-[761px]:gap-0 max-[761px]:text-[0px]"><Icon name="check" size={13} />Sẵn sàng</span><button className={iconButton} title="Hỏi về tài liệu" aria-label={`Hỏi về ${document.filename}`} onClick={() => fillPrompt(`Tóm tắt những nội dung chính trong tài liệu ${document.filename}.`)}><Icon name="chat" size={18} /></button></div>) : <div className="flex items-center justify-center gap-2 px-[5px] py-5 text-center text-[10px] text-[#758097] dark:text-[#838fa7]"><Icon name="folder" size={20} /><p>Tài liệu đầu tiên, khởi đầu cho nhiều câu trả lời.</p></div>}</div></div>}

          {view === 'saved' && <div className="flex-1 overflow-y-auto px-[45px] py-[41px] tablet:p-[30px] max-[761px]:px-5 max-[761px]:py-[25px]"><div className="mb-[26px]"><span className="text-[8px] tracking-[1.4px] text-[#91a0b9]">GIỮ LẠI ĐIỀU HỮU ÍCH</span><h1 className="mt-3 text-[27px] font-[550] tracking-[-.8px] max-[761px]:text-[23px]">Câu trả lời đã lưu<span className="ml-2.5 rounded-md border border-[#e9ecf1] bg-[#f0f2f7] px-[7px] py-0.5 align-middle text-[11px] text-[#758097] dark:border-[#353c4b] dark:bg-[#303747] dark:text-[#838fa7]">{saved.length}</span></h1><p className="mt-3 text-[10px] leading-[1.8] text-[#69758a] dark:text-[#a0aac0]">Một góc nhỏ cho những thông tin bạn muốn quay lại.</p></div>{saved.length ? saved.map(m => <div className="mt-[15px] rounded-[10px] border border-[#e9ecf1] bg-white p-5 dark:border-[#353c4b] dark:bg-[#2b313f] max-[761px]:p-[15px] [&>article]:mb-0" key={m.id}><button className="mb-[15px] flex items-center gap-2 text-[9px] text-[#758097] dark:text-[#838fa7] max-[761px]:text-[8px]" onClick={() => selectConversation(m.conversation.id)}><Icon name="chat" size={14} />{m.conversation.title}<Icon name="arrow" size={14} className="ml-auto" /></button>{renderMessage(m, m.conversation.id)}</div>) : <div className="px-2.5 py-[60px] text-center max-[761px]:px-0 max-[761px]:py-[45px]"><span className="mx-auto mb-[25px] flex size-[72px] items-center justify-center rounded-[20px] bg-[#edf1fa] text-[#8da2c8] dark:bg-[#354362]"><Icon name="bookmark" size={31} /></span><h2 className="text-xl font-[550] tracking-[-.5px] max-[761px]:text-lg">Câu trả lời hay, giữ lại đây.</h2><p className="mt-[15px] mb-[25px] text-[11px] leading-loose text-[#69758a] dark:text-[#a0aac0]">Nhấn biểu tượng lưu dưới câu trả lời của One61.<br />Mọi thứ bạn cần sẽ luôn dễ tìm.</p><button className={secondaryButton} onClick={() => openView('chat')}>Bắt đầu trò chuyện<Icon name="arrow" size={15} /></button></div>}</div>}
        </main>
      </div>
    </section>

    <input ref={fileInput} className="sr-only" type="file" accept=".pdf,.docx,.txt,.md,.csv,.json" multiple tabIndex={-1} aria-label="Chọn tài liệu" onChange={e => { uploadFiles(Array.from(e.target.files)); e.target.value = ''; }} />
    {toast && <div className="fixed bottom-4 left-1/2 z-20 flex min-w-[260px] max-w-[calc(100vw-40px)] -translate-x-1/2 items-center gap-[9px] rounded-[9px] border border-[#e9ecf1] bg-white px-[15px] py-3 text-[10px] shadow-[0_8px_30px_#28385320] dark:border-[#353c4b] dark:bg-[#2b313f]" role="status"><Icon name="chat" size={17} className="text-[#5371d9] dark:text-[#7f9bea]" /><span className="[overflow-wrap:anywhere]">{toast}</span><button className="ml-auto flex p-[3px] text-[#758097] dark:text-[#838fa7]" aria-label="Đóng thông báo" onClick={() => setToast('')}><Icon name="close" size={15} /></button></div>}

    <dialog ref={dialog} className="fixed inset-0 m-auto max-h-[calc(100svh-32px)] w-[520px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-[14px] border border-[#ffffff70] bg-[#fcfcfd] p-0 text-inherit shadow-[0_25px_100px_#1b2b5140] backdrop:bg-[#25345538] backdrop:backdrop-blur-md dark:border-[#52658480] dark:bg-[#202530]" onCancel={() => setModal('')} onClose={() => setModal('')} onClick={e => { if (e.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) setModal(''); } }} aria-labelledby="modal-title">
      <div className="flex items-center justify-between border-b border-[#e9ecf1] px-6 pt-5 pb-[15px] dark:border-[#353c4b] max-[761px]:px-5 max-[761px]:py-4"><h2 id="modal-title" className="text-sm font-[550]">{modal === 'search' ? 'Tìm cuộc trò chuyện' : modal === 'settings' ? 'Cài đặt không gian' : 'Chào mừng đến One61'}</h2><button className={iconButton} aria-label="Đóng hộp thoại" onClick={() => setModal('')}><Icon name="close" size={18} /></button></div>
      {modal === 'search' && <><div className="mx-[22px] my-[18px] flex items-center gap-2.5 rounded-lg border border-[#e9ecf1] bg-white p-3 text-[#758097] focus-within:border-[#b8c8ed] dark:border-[#353c4b] dark:bg-[#2b313f] dark:text-[#838fa7]"><Icon name="search" size={19} /><input className="w-full border-0 bg-transparent text-[11px] text-[#263044] placeholder:text-[#758097] focus-visible:outline-none dark:text-[#dce2ef] dark:placeholder:text-[#838fa7]" autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm trong tiêu đề, nội dung…" aria-label="Tìm kiếm cuộc trò chuyện" /></div><div className="max-h-[300px] overflow-y-auto px-[13px] pb-[15px]">{conversations.filter(c => (c.messages.length || c.documents.length) && `${c.title} ${c.messages.map(m => m.text).join(' ')}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))).map(c => <button className="flex w-full items-center gap-[13px] rounded-[7px] px-[11px] py-3 text-left text-[#69758a] hover:bg-[#f0f2f7] dark:text-[#a0aac0] dark:hover:bg-[#303747]" key={c.id} onClick={() => selectConversation(c.id)}><Icon name="chat" size={18} /><span className="min-w-0 flex-1"><strong className="block text-[11px] font-medium text-[#263044] [overflow-wrap:anywhere] dark:text-[#dce2ef]">{c.title}</strong><small className="mt-1.5 block text-[8px] text-[#758097] dark:text-[#838fa7]">{c.messages.length} tin nhắn · {c.documents.length} tài liệu</small></span><Icon name="chevron" size={15} /></button>)}{!conversations.some(c => (c.messages.length || c.documents.length) && `${c.title} ${c.messages.map(m => m.text).join(' ')}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))) && <p className="p-5 text-center text-[11px] text-[#758097] dark:text-[#838fa7]">Chưa có cuộc trò chuyện phù hợp.</p>}</div><div className="flex items-center justify-between border-t border-[#e9ecf1] px-6 py-3 text-[8px] text-[#758097] dark:border-[#353c4b] dark:text-[#838fa7]">Tìm kiếm trong lịch sử trên trình duyệt này.<kbd className="rounded border border-[#c7cfdf88] px-[5px] py-px font-sans text-[10px] font-normal">esc</kbd></div></>}
      {modal === 'settings' && <div className="px-6 pt-[7px] pb-5 max-[761px]:px-5 max-[761px]:pt-[5px]"><div className="flex items-center justify-between gap-3.5 border-b border-[#e9ecf1] py-[19px] dark:border-[#353c4b] max-[761px]:flex-wrap"><div><strong className="text-[11px] font-medium">Giao diện</strong><p className="mt-[7px] text-[9px] leading-[1.9] text-[#69758a] dark:text-[#a0aac0]">Chọn sắc thái cho không gian của bạn.</p></div><div className="flex shrink-0 gap-[3px] rounded-[7px] border border-[#e9ecf1] bg-[#f0f2f7] p-[3px] dark:border-[#353c4b] dark:bg-[#303747]">{['light', 'dark'].map(value => <button key={value} className="flex items-center gap-[5px] rounded-[5px] px-2.5 py-[7px] text-[9px] text-[#69758a] aria-pressed:bg-white aria-pressed:text-[#5371d9] aria-pressed:shadow-[0_2px_4px_#29385c0c] dark:text-[#a0aac0] dark:aria-pressed:bg-[#2b313f] dark:aria-pressed:text-[#7f9bea]" aria-pressed={theme === value} onClick={() => setTheme(value)}><Icon name={value === 'light' ? 'sun' : 'moon'} size={16} />{value === 'light' ? 'Sáng' : 'Tối'}</button>)}</div></div><div className="flex items-center justify-between gap-3.5 border-b border-[#e9ecf1] py-[19px] dark:border-[#353c4b] max-[761px]:flex-wrap"><div><strong className="text-[11px] font-medium">Lịch sử trò chuyện</strong><p className="mt-[7px] text-[9px] leading-[1.9] text-[#69758a] dark:text-[#a0aac0]">Lưu trên trình duyệt này. Xuất để giữ bản sao.</p></div><button className={secondaryButton} onClick={exportWorkspace}><Icon name="download" size={16} />Xuất JSON</button></div><div className="flex items-start gap-[9px] py-[19px]"><i className={`mt-[5px] size-1.5 shrink-0 rounded-full ${health ? 'bg-[#68a88f]' : 'bg-[#bd945d]'}`} /><div><strong className="text-[10px] font-medium">{health ? 'Máy chủ đã kết nối' : 'Máy chủ chưa kết nối'}</strong><p className="mt-[7px] text-[9px] leading-[1.9] text-[#69758a] dark:text-[#a0aac0]">{health ? (health.rag_initialized ? 'Kho kiến thức sẵn sàng.' : 'Máy chủ hoạt động. Kho kiến thức chưa khởi tạo.') : 'Khởi động dịch vụ FastAPI tại cổng 8000 để chat và tải tài liệu.'}</p></div></div><p className="mt-[3px] text-center text-[8px] text-[#758097] dark:text-[#838fa7]">One61 Workspace · React · Lấy cảm hứng từ macOS</p></div>}
      {modal === 'help' && <div className="px-[26px] pt-[21px] pb-[26px]"><p className="mb-[25px] text-[11px] leading-[1.9] text-[#69758a] dark:text-[#a0aac0]">Không gian gọn gàng để làm việc cùng dữ liệu của bạn.</p>{[
        { icon: 'chat', color: 'blue', title: 'Hỏi theo cách của bạn', text: 'Tra cứu vận đơn, hỏi chính sách hoặc phân tích dữ liệu. Chọn “Phân tích sâu” cho câu hỏi cần đối chiếu kỹ.' },
        { icon: 'file', color: 'violet', title: 'Thêm kiến thức riêng', text: 'Đính kèm tài liệu bằng nút +. Tài liệu chỉ dùng trong cuộc trò chuyện hiện tại.' },
        { icon: 'bookmark', color: 'green', title: 'Giữ những câu trả lời hữu ích', text: 'Lưu câu trả lời để xem lại. Dùng ⌘ K hoặc Ctrl K để tìm cuộc trò chuyện.' },
      ].map(item => <div key={item.icon} className="mb-[22px] flex gap-3.5"><span className={`inline-flex size-[37px] shrink-0 items-center justify-center rounded-[9px] ${suggestionColors[item.color]}`}><Icon name={item.icon} /></span><section><strong className="text-[11px] font-[550]">{item.title}</strong><p className="mt-[5px] text-[10px] leading-[1.9] text-[#69758a] dark:text-[#a0aac0]">{item.text}</p></section></div>)}<button className={`${primaryButton} mt-[3px] w-full`} onClick={() => { setModal(''); openView('chat'); }}>Bắt đầu khám phá<Icon name="arrow" size={16} /></button></div>}
    </dialog>
  </div>;
}
