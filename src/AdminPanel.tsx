import { useState, useEffect } from 'react';
import './admin-styles.css';
import type { VinylRecord } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const GENRE_LABELS: Record<string, string> = {
  jazz: 'ДЖАЗ', rock: 'РОК', electronic: 'ЭЛЕКТРОНИКА',
  classical: 'КЛАССИКА', hiphop: 'ХИП-ХОП', soul: 'СОУ',
};

const EMPTY_FORM: Partial<VinylRecord> = {
  title: '', artist: '', price: 0, inStock: true,
  image: '', description: '', rating: 5,
  genre: 'rock', year: new Date().getFullYear(),
  label: '', tracklist: '',
};

export default function AdminPanel() {
  const [records, setRecords] = useState<VinylRecord[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<VinylRecord>>({});
  const [jsonView, setJsonView] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/vinyl`);
      if (!res.ok) throw new Error('Ошибка сети');
      setRecords(await res.json());
    } catch {
      alert('Не удалось загрузить данные. Проверьте, запущен ли бэкенд!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleAdd = () => { setIsAdding(true); setFormData({ ...EMPTY_FORM }); };
  const handleEdit = (r: VinylRecord) => { setEditingId(r.id); setFormData(r); };
  const handleCancel = () => { setEditingId(null); setIsAdding(false); setFormData({}); };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить пластинку?')) return;
    try {
      const res = await fetch(`${API_URL}/vinyl/${id}`, { method: 'DELETE' });
      if (!res.ok) { alert('Ошибка при удалении'); return; }
      await fetchRecords();
    } catch { alert('Сервер недоступен'); }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.artist || !formData.label) {
      alert('Заполните обязательные поля: название, артист, лейбл'); return;
    }
    try {
      const res = isAdding
        ? await fetch(`${API_URL}/vinyl/item`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })
        : await fetch(`${API_URL}/vinyl/${editingId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
      if (!res.ok) { alert('Ошибка сервера'); return; }
      await fetchRecords(); handleCancel();
    } catch { alert('Сервер недоступен'); }
  };

  const set = (field: keyof VinylRecord, value: string | number | boolean) =>
    setFormData(p => ({ ...p, [field]: value }));

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'vinyl_database.json'; a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) { alert('Неверный формат'); return; }
        const res = await fetch(`${API_URL}/vinyl`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) { fetchRecords(); alert('Данные импортированы!'); }
      } catch { alert('Ошибка чтения файла'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = async () => {
    if (!confirm('Сбросить БД к начальным данным?')) return;
    try {
      const res = await fetch(`${API_URL}/vinyl/reset`, { method: 'POST' });
      if (res.ok) { fetchRecords(); alert('БД сброшена!'); }
    } catch { alert('Ошибка сброса'); }
  };

  const avgRating = records.length
    ? (records.reduce((s, r) => s + r.rating, 0) / records.length).toFixed(1) : '—';

  return (
    <div className="adm-root">
      <header className="adm-header">
        <div className="adm-header-left">
          <span className="adm-logo-small">VINYL HAUS</span>
          <h1 className="adm-title">ADMIN PANEL</h1>
        </div>
        <a href="/" className="adm-back">← STORE</a>
      </header>

      <div className="adm-actions">
        <button className="adm-btn adm-btn-primary" onClick={handleAdd}>+ ADD RECORD</button>
        <button className="adm-btn adm-btn-outline" onClick={handleExport}>↓ EXPORT JSON</button>
        <label className="adm-btn adm-btn-outline">
          ↑ IMPORT JSON
          <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </label>
        <button className="adm-btn adm-btn-outline" onClick={() => setJsonView(v => !v)}>
          {jsonView ? '≡ TABLE' : '{ } JSON'}
        </button>
        <button className="adm-btn adm-btn-danger" onClick={handleReset}>⟳ RESET DB</button>
      </div>

      <div className="adm-stats">
        <div className="adm-stat"><span className="adm-stat-num">{records.length}</span><span className="adm-stat-lbl">TOTAL</span></div>
        <div className="adm-stat"><span className="adm-stat-num">{records.filter(r => r.inStock).length}</span><span className="adm-stat-lbl">IN STOCK</span></div>
        <div className="adm-stat"><span className="adm-stat-num">{records.filter(r => !r.inStock).length}</span><span className="adm-stat-lbl">SOLD OUT</span></div>
        <div className="adm-stat"><span className="adm-stat-num">{avgRating}</span><span className="adm-stat-lbl">AVG RATING</span></div>
        <div className="adm-stat"><span className="adm-stat-num">{records.length ? Math.round(records.reduce((s, r) => s + r.price, 0) / records.length) : 0}₽</span><span className="adm-stat-lbl">AVG PRICE</span></div>
      </div>

      {(isAdding || editingId !== null) && (
        <div className="adm-form">
          <h2 className="adm-form-title">{isAdding ? 'NEW RECORD' : 'EDIT RECORD'}</h2>
          <div className="adm-form-grid">
            <div className="adm-field">
              <label>TITLE *</label>
              <input value={formData.title || ''} onChange={e => set('title', e.target.value)} placeholder="Album title" />
            </div>
            <div className="adm-field">
              <label>ARTIST *</label>
              <input value={formData.artist || ''} onChange={e => set('artist', e.target.value)} placeholder="Artist name" />
            </div>
            <div className="adm-field">
              <label>LABEL *</label>
              <input value={formData.label || ''} onChange={e => set('label', e.target.value)} placeholder="Record label" />
            </div>
            <div className="adm-field">
              <label>YEAR</label>
              <input type="number" value={formData.year || 2024} onChange={e => set('year', Number(e.target.value))} min="1900" max="2030" />
            </div>
            <div className="adm-field">
              <label>PRICE (₽)</label>
              <input type="number" value={formData.price || 0} onChange={e => set('price', Number(e.target.value))} />
            </div>
            <div className="adm-field">
              <label>RATING (1-5)</label>
              <input type="number" value={formData.rating || 5} onChange={e => set('rating', Number(e.target.value))} min="1" max="5" step="0.1" />
            </div>
            <div className="adm-field">
              <label>GENRE</label>
              <select value={formData.genre || 'rock'} onChange={e => set('genre', e.target.value)}>
                {Object.entries(GENRE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="adm-field adm-field-check">
              <label className="adm-check-label">
                <input type="checkbox" checked={formData.inStock ?? true} onChange={e => set('inStock', e.target.checked)} />
                <span>IN STOCK</span>
              </label>
            </div>
            <div className="adm-field adm-field-full">
              <label>IMAGE URL</label>
              <input value={formData.image || ''} onChange={e => set('image', e.target.value)} placeholder="https://..." />
            </div>
            <div className="adm-field adm-field-full">
              <label>TRACKLIST</label>
              <input value={formData.tracklist || ''} onChange={e => set('tracklist', e.target.value)} placeholder="A1. Track — A2. Track — B1. Track..." />
            </div>
            <div className="adm-field adm-field-full">
              <label>DESCRIPTION</label>
              <textarea value={formData.description || ''} onChange={e => set('description', e.target.value)} rows={3} />
            </div>
          </div>
          <div className="adm-form-actions">
            <button className="adm-btn adm-btn-primary" onClick={handleSave}>✓ SAVE</button>
            <button className="adm-btn adm-btn-outline" onClick={handleCancel}>✕ CANCEL</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="adm-loading">LOADING...</div>
      ) : jsonView ? (
        <div className="adm-json">
          <pre>{JSON.stringify(records, null, 2)}</pre>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th><th>IMG</th><th>TITLE / ARTIST</th><th>GENRE</th>
                <th>YEAR</th><th>PRICE</th><th>RATING</th><th>STOCK</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td className="adm-td-muted">{r.id}</td>
                  <td><img src={r.image} alt={r.title} className="adm-thumb" /></td>
                  <td>
                    <strong>{r.title}</strong>
                    <br /><span className="adm-td-muted">{r.artist}</span>
                  </td>
                  <td><span className={`adm-genre adm-genre-${r.genre}`}>{GENRE_LABELS[r.genre]}</span></td>
                  <td className="adm-td-muted">{r.year}</td>
                  <td>{r.price.toLocaleString('ru')} ₽</td>
                  <td>{'▪'.repeat(Math.floor(r.rating))} {r.rating}</td>
                  <td><span className={`adm-stock ${r.inStock ? 'in' : 'out'}`}>{r.inStock ? '✓ IN' : '✗ OUT'}</span></td>
                  <td>
                    <div className="adm-actions-cell">
                      <button className="adm-icon-btn adm-edit" onClick={() => handleEdit(r)}>✏</button>
                      <button className="adm-icon-btn adm-del" onClick={() => handleDelete(r.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}