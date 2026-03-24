import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "masumani-bbs-v2";
const NAME_KEY = "masumani-bbs-name";
const UID_KEY = "masumani-bbs-uid";

function genId() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ストレージ処理の安全なラッパー (window.storageがない環境でも動くように)
const storage = {
  async get(key) {
    if (typeof window !== "undefined" && window.storage) {
      const r = await window.storage.get(key);
      return r ? r.value : null;
    }
    return localStorage.getItem(key);
  },
  async set(key, value) {
    if (typeof window !== "undefined" && window.storage) {
      await window.storage.set(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  }
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Share+Tech+Mono&display=swap');
:root {
  --bg: #0e0e0e; --bg2: #161616; --bg3: #1e1e1e;
  --border: #272727; --amber: #f5a623; --amber-dim: #b87d18;
  --amber-glow: rgba(245,166,35,0.12); --green: #4cfe8f;
  --red: #ff4f4f; --text: #d4d0c8; --text-dim: #666;
  --mono: 'Share Tech Mono', monospace; --sans: 'Noto Sans JP', sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body, #root { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; }

.wrap { max-width: 780px; margin: 0 auto; padding: 0 16px 80px; }

.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 0 16px;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: rgba(14,14,14,.97);
  backdrop-filter: blur(8px); z-index: 100;
}
.logo {
  font-family: var(--mono); font-size: 1.2rem;
  color: var(--amber); text-shadow: 0 0 14px rgba(245,166,35,.35);
  cursor: pointer; user-select: none; letter-spacing: .04em;
}
.back-btn {
  font-family: var(--mono); font-size: .75rem; color: var(--text-dim);
  background: none; border: none; cursor: pointer; letter-spacing: .05em;
  transition: color .15s;
}
.back-btn:hover { color: var(--amber); }

.discord-banner {
  display: flex; align-items: center; justify-content: center;
  gap: 16px;
  margin: 24px 0 30px;
  padding: 20px 28px;
  background: linear-gradient(135deg, #1a1333 0%, #120f1e 100%);
  border: 1px solid #5865f233;
  border-radius: 6px;
  text-decoration: none;
  transition: border-color .2s, box-shadow .2s;
}
.discord-banner:hover {
  border-color: #5865f299;
  box-shadow: 0 0 32px rgba(88,101,242,.22);
}
.discord-icon { width: 48px; height: 48px; flex-shrink: 0; }
.discord-text { line-height: 1; }
.discord-sub {
  font-family: var(--mono); font-size: .65rem;
  color: #8ea1d4; letter-spacing: .14em; text-transform: uppercase;
  margin-bottom: 7px;
}
.discord-main {
  font-size: 1.5rem; font-weight: 900; color: #fff; letter-spacing: .02em;
}
.discord-main em { color: #7289da; font-style: normal; }

.section-title {
  font-family: var(--mono); font-size: .7rem;
  color: var(--text-dim); letter-spacing: .15em; text-transform: uppercase;
  margin-bottom: 12px; padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}

.new-thread-form, .reply-form {
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: 3px; padding: 16px; margin-bottom: 30px;
}
.reply-form { margin-top: 22px; margin-bottom: 0; }
.field { margin-bottom: 10px; }
.field-label {
  font-family: var(--mono); font-size: .65rem;
  color: var(--text-dim); letter-spacing: .08em; margin-bottom: 5px;
}
.input {
  width: 100%; background: var(--bg3); border: 1px solid var(--border);
  color: var(--text); font-family: var(--sans); font-size: .9rem;
  padding: 8px 12px; border-radius: 2px; outline: none;
  transition: border-color .15s;
}
.input:focus { border-color: var(--amber-dim); }
.input::placeholder { color: var(--text-dim); }
textarea.input { resize: vertical; min-height: 72px; line-height: 1.6; }
.form-foot { display: flex; justify-content: flex-end; margin-top: 12px; }
.btn-submit {
  font-family: var(--mono); font-size: .8rem; letter-spacing: .1em;
  padding: 8px 24px; background: none;
  border: 1px solid var(--amber-dim); color: var(--amber);
  cursor: pointer; border-radius: 2px; transition: background .15s, box-shadow .15s;
}
.btn-submit:hover { background: var(--amber-glow); box-shadow: 0 0 12px rgba(245,166,35,.2); }
.btn-submit:disabled { opacity: .35; cursor: default; }

.thread-item {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 14px 6px; border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background .15s; border-radius: 2px;
  animation: fadeIn .25s ease;
}
.thread-item:hover { background: rgba(245,166,35,.04); }
@keyframes fadeIn { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:none } }

.thread-num {
  font-family: var(--mono); font-size: .65rem;
  color: var(--text-dim); min-width: 26px; padding-top: 2px;
}
.thread-body { flex: 1; min-width: 0; }
.thread-title {
  font-size: .95rem; font-weight: 700; color: var(--text);
  margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.thread-excerpt {
  font-size: .78rem; color: var(--text-dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.thread-meta {
  font-family: var(--mono); font-size: .65rem; color: var(--text-dim);
  text-align: right; flex-shrink: 0; line-height: 1.9;
}
.thread-replies { color: var(--amber); }

.empty {
  text-align: center; padding: 52px 0;
  font-family: var(--mono); font-size: .8rem; color: var(--text-dim); line-height: 2.4;
}

.post-item {
  padding: 14px 0; border-bottom: 1px solid var(--border);
  animation: fadeIn .25s ease;
}
.post-meta {
  font-family: var(--mono); font-size: .68rem;
  color: var(--text-dim); display: flex; gap: 10px;
  flex-wrap: wrap; align-items: center; margin-bottom: 7px;
}
.post-num { color: var(--amber); }
.post-name { color: var(--text); font-weight: 700; }
.post-id { padding: 1px 5px; border: 1px solid var(--border); border-radius: 2px; font-size: .6rem; }
.post-body { font-size: .9rem; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
.post-actions { display: flex; gap: 14px; margin-top: 8px; }
.act-btn {
  font-family: var(--mono); font-size: .65rem;
  background: none; border: none; color: var(--text-dim);
  cursor: pointer; transition: color .15s;
}
.act-btn:hover { color: var(--amber); }
.act-btn.liked { color: var(--red); }

.toast {
  position: fixed; bottom: 22px; right: 22px;
  background: var(--bg3); border: 1px solid var(--amber-dim);
  color: var(--amber); font-family: var(--mono); font-size: .75rem;
  padding: 9px 16px; border-radius: 2px; z-index: 999;
  animation: toastIn .2s ease; box-shadow: 0 0 16px rgba(245,166,35,.15);
}
@keyframes toastIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
`;

export default function App() {
  const [data, setData] = useState({ threads: [], likes: {} });
  const [view, setView] = useState("home");
  
  // 入力用State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  
  // ユーザー情報（名前・ID）のState
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  const [toast, setToast] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const toastRef = useRef();

  // 初期化：データ、ユーザー名、ユーザーIDの読み込み
  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(STORAGE_KEY);
        if (r) setData(JSON.parse(r));
      } catch (_) {}
      
      // 名前の復元
      const savedName = localStorage.getItem(NAME_KEY) || "";
      setUserName(savedName);

      // ユーザーIDの復元・生成（掲示板のID表示用）
      let savedUid = localStorage.getItem(UID_KEY);
      if (!savedUid) {
        savedUid = genId(); // 初回のみ生成
        localStorage.setItem(UID_KEY, savedUid);
      }
      setUserId(savedUid);

      setLoaded(true);
    })();
  }, []);

  const save = async (d) => {
    try { await storage.set(STORAGE_KEY, JSON.stringify(d)); } catch (_) {}
  };

  // 名前の変更と保存
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setUserName(newName);
    localStorage.setItem(NAME_KEY, newName);
  };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2000);
  };

  const createThread = async () => {
    if (!title.trim() || !body.trim()) return;
    const thread = {
      id: genId(), // スレッド自体のユニークID
      title: title.trim(),
      posts: [{ 
        id: genId(), // 投稿ごとのユニークID（システム用）
        userId: userId, // ユーザー識別用ID（表示用）
        num: 1, 
        name: userName.trim() || "名無しさん", 
        body: body.trim(), 
        ts: Date.now() 
      }],
      ts: Date.now()
    };
    const next = { ...data, threads: [thread, ...data.threads] };
    setData(next); await save(next);
    setTitle(""); setBody("");
    showToast("スレッドを作成しました ✓");
  };

  const addReply = async (threadId) => {
    if (!replyBody.trim()) return;
    const threads = data.threads.map(t => {
      if (t.id !== threadId) return t;
      const post = { 
        id: genId(), 
        userId: userId, // ユーザー識別用ID
        num: t.posts.length + 1, 
        name: userName.trim() || "名無しさん", 
        body: replyBody.trim(), 
        ts: Date.now() 
      };
      return { ...t, posts: [...t.posts, post], ts: Date.now() };
    });
    const next = { ...data, threads };
    setData(next); await save(next);
    setReplyBody("");
    showToast("投稿しました ✓");
  };

  const toggleLike = async (pid) => {
    const likes = { ...data.likes, [pid]: !data.likes[pid] };
    const next = { ...data, likes };
    setData(next); await save(next);
  };

  const currentThread = view !== "home" ? data.threads.find(t => t.id === view) : null;

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <header className="header">
          <div className="logo" onClick={() => setView("home")}>ますまに掲示板</div>
          {view !== "home" && (
            <button className="back-btn" onClick={() => setView("home")}>← ホームに戻る</button>
          )}
        </header>

        {/* ── HOME ── */}
        {view === "home" && (
          <>
            <a className="discord-banner" href="https://discord.gg/3qheAUjfe6" target="_blank" rel="noopener noreferrer">
              <svg className="discord-icon" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M60.1 4.98A58.55 58.55 0 0 0 45.92.7a40.1 40.1 0 0 0-1.81 3.71 54.15 54.15 0 0 0-16.22 0A40.32 40.32 0 0 0 26.08.7 58.44 58.44 0 0 0 11.9 4.99C1.71 20.46-.99 35.52.31 50.36a58.93 58.93 0 0 0 17.96 9.08 44.4 44.4 0 0 0 3.84-6.26 38.38 38.38 0 0 1-6.05-2.92c.51-.37 1-.75 1.48-1.12a42.0 42.0 0 0 0 35.92 0c.48.39.97.77 1.48 1.12a38.32 38.32 0 0 1-6.06 2.93 44.24 44.24 0 0 0 3.84 6.25 58.72 58.72 0 0 0 17.97-9.08c1.47-15.46-2.5-30.4-12.59-45.38ZM23.74 41.29c-3.5 0-6.38-3.22-6.38-7.17s2.82-7.17 6.38-7.17c3.56 0 6.45 3.21 6.38 7.17 0 3.95-2.82 7.17-6.38 7.17Zm23.52 0c-3.5 0-6.38-3.22-6.38-7.17s2.82-7.17 6.38-7.17c3.56 0 6.44 3.21 6.38 7.17 0 3.95-2.82 7.17-6.38 7.17Z" fill="#7289da"/>
              </svg>
              <div className="discord-text">
                <div className="discord-sub">Join us on Discord</div>
                <div className="discord-main"><em>ますまに鯖</em>に入る</div>
              </div>
            </a>

            <div className="section-title">スレッドを立てる</div>
            <div className="new-thread-form">
              <div className="field">
                <div className="field-label">タイトル</div>
                <input className="input" placeholder="スレッドのタイトル" value={title} onChange={e => setTitle(e.target.value)} maxLength={60} />
              </div>
              <div className="field">
                <div className="field-label">本文</div>
                <textarea className="input" placeholder="最初の投稿内容" value={body} onChange={e => setBody(e.target.value)} maxLength={1000} />
              </div>
              <div className="field">
                <div className="field-label">名前（記憶されます）</div>
                <input className="input" placeholder="名無しさん" value={userName} onChange={handleNameChange} maxLength={24} />
              </div>
              <div className="form-foot">
                <button className="btn-submit" onClick={createThread} disabled={!title.trim() || !body.trim()}>
                  スレッドを作成 &gt;&gt;
                </button>
              </div>
            </div>

            <div className="section-title">
              <span>スレッド一覧</span>
              <span>{loaded ? `${data.threads.length} スレッド` : ""}</span>
            </div>

            {!loaded ? null : data.threads.length === 0 ? (
              <div className="empty">まだスレッドがありません<br />最初のスレッドを立ててみよう</div>
            ) : (
              data.threads.map((t, i) => (
                <div key={t.id} className="thread-item" onClick={() => setView(t.id)}>
                  <div className="thread-num">{i + 1}</div>
                  <div className="thread-body">
                    <div className="thread-title">{t.title}</div>
                    <div className="thread-excerpt">{t.posts[0]?.body}</div>
                  </div>
                  <div className="thread-meta">
                    <div className="thread-replies">{t.posts.length} res</div>
                    <div>{timeAgo(t.ts)}</div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── THREAD VIEW ── */}
        {currentThread && (
          <>
            <div style={{ padding: "18px 0 10px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--text-dim)", marginBottom: "6px" }}>
                {formatDate(currentThread.ts)}
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: "4px" }}>{currentThread.title}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--text-dim)" }}>
                {currentThread.posts.length} 件の返信
              </div>
            </div>

            {currentThread.posts.map(p => (
              <div key={p.id} className="post-item">
                <div className="post-meta">
                  <span className="post-num">&gt;&gt;{p.num}</span>
                  <span className="post-name">{p.name}</span>
                  {/* post-idには、システム用のp.idではなくユーザー識別のp.userIdを表示 */}
                  <span className="post-id">ID:{p.userId}</span>
                  <span>{timeAgo(p.ts)}</span>
                </div>
                <div className="post-body">{p.body}</div>
                <div className="post-actions">
                  <button className={`act-btn${data.likes[p.id] ? " liked" : ""}`} onClick={() => toggleLike(p.id)}>
                    {data.likes[p.id] ? "♥" : "♡"} いいね
                  </button>
                  <button className="act-btn" onClick={() => setReplyBody(prev => `>>${p.num}\n` + prev)}>
                    ↩ 引用
                  </button>
                </div>
              </div>
            ))}

            <div className="reply-form">
              <div className="field">
                <div className="field-label">名前（記憶されます）</div>
                <input className="input" placeholder="名無しさん" value={userName} onChange={handleNameChange} maxLength={24} />
              </div>
              <div className="field">
                <div className="field-label">返信</div>
                <textarea className="input" placeholder="返信を書く..." value={replyBody} onChange={e => setReplyBody(e.target.value)} maxLength={1000} />
              </div>
              <div className="form-foot">
                <button className="btn-submit" onClick={() => addReply(currentThread.id)} disabled={!replyBody.trim()}>
                  書き込む &gt;&gt;
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
