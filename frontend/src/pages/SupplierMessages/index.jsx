import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };

const SupplierMessages = () => {
  const user = getUser();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => api.post('/api/supplier/messages', { firm: user.firm }).then(r => setMessages(r.data.data || []));
  useEffect(() => { load(); }, []);

  const sendMsg = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post('/api/supplier/messages/send', { FIRM: user.firm, SENDER: 'supplier', FROM: user.name, TEXT: text });
      toast.success('Mesaj gönderildi');
      setText('');
      load();
    } catch { toast.error('Gönderilemedi'); }
    finally { setSending(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
      {/* Başlık */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageCircle size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>KOM ile Mesajlaşma</h1>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{messages.length} mesaj · {user.firm}</p>
        </div>
      </div>

      {/* Mesajlar */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(m => {
          const isMe = m.SENDER === 'supplier';
          return (
            <motion.div key={m.ID} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '65%', padding: '12px 16px', borderRadius: 16,
                background: isMe ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#fff',
                color: isMe ? '#fff' : '#0f172a',
                border: isMe ? 'none' : '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                borderBottomRightRadius: isMe ? 4 : 16,
                borderBottomLeftRadius: isMe ? 16 : 4,
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, margin: '0 0 4px' }}>{m.FROM}</p>
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{m.TEXT}</p>
                <p style={{ fontSize: 10, opacity: 0.5, margin: '6px 0 0', textAlign: 'right' }}>{m.DATE}</p>
              </div>
            </motion.div>
          );
        })}
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
            Henüz mesaj yok
          </div>
        )}
      </div>

      {/* Gönder */}
      <div style={{ padding: '16px 28px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: 10 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Mesajınızı yazın..."
          onKeyDown={e => e.key === 'Enter' && sendMsg()}
          style={{ flex: 1, padding: '13px 18px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#f8fafc' }}
          onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }} />
        <button onClick={sendMsg} disabled={sending || !text.trim()}
          style={{
            padding: '13px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
            fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
            opacity: !text.trim() ? 0.5 : 1, transition: 'opacity 0.2s'
          }}>
          <Send size={14} /> Gönder
        </button>
      </div>
    </div>
  );
};

export default SupplierMessages;
