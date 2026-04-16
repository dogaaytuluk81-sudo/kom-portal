import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Btn } from '../../components/PageShell.jsx';

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
    <DarkHero icon={MessageCircle} label="Mesajlar" title="KOM ile Mesajlaşma" subtitle={`${messages.length} mesaj · ${user.firm}`} accentColor="#3b82f6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        {/* Mesajlar */}
        <div style={{ padding: 24, maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(m => {
            const isMe = m.SENDER === 'supplier';
            return (
              <div key={m.ID} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%', padding: '12px 16px', borderRadius: 14,
                  background: isMe ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#f1f5f9',
                  color: isMe ? '#fff' : '#0f172a',
                  borderBottomRightRadius: isMe ? 4 : 14,
                  borderBottomLeftRadius: isMe ? 14 : 4,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, margin: '0 0 4px' }}>{m.FROM}</p>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{m.TEXT}</p>
                  <p style={{ fontSize: 10, opacity: 0.5, margin: '6px 0 0', textAlign: 'right' }}>{m.DATE}</p>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Henüz mesaj yok</div>
          )}
        </div>

        {/* Gönder */}
        <div style={{ padding: 16, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Mesajınızı yazın..."
            onKeyDown={e => e.key === 'Enter' && sendMsg()}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#3b82f6'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          <button onClick={sendMsg} disabled={sending || !text.trim()}
            style={{
              padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
              fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
              opacity: !text.trim() ? 0.5 : 1
            }}>
            <Send size={14} /> Gönder
          </button>
        </div>
      </motion.div>
    </DarkHero>
  );
};

export default SupplierMessages;
