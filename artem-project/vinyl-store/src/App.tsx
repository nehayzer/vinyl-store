import { useState, useEffect, useCallback } from 'react';
import './styles.css';
import type { VinylRecord } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const GENRE_LABELS: Record<string, string> = {
  jazz: 'ДЖАЗ',
  rock: 'РОК',
  electronic: 'ЭЛЕКТРОНИКА',
  classical: 'КЛАССИКА',
  hiphop: 'ХИП-ХОП',
  soul: 'СОУ',
};

export default function App() {
  const [records, setRecords] = useState<VinylRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterGenre, setFilterGenre] = useState('');
  const [selected, setSelected] = useState<VinylRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/vinyl`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: VinylRecord[] = await res.json();
      setRecords(data);
    } catch {
      setError('Сервер недоступен. Запустите бэкенд командой npm run server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return (
      (r.title.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q)) &&
      (filterInStock ? r.inStock : true) &&
      (filterGenre ? r.genre === filterGenre : true)
    );
  });

  return (
    <div className="vh-root">
      <div className="vh-noise" />

      <header className="vh-header">
        <div className="vh-header-inner">
          <div className="vh-logo-block">
            <span className="vh-logo-small">ОСН. 1974</span>
            <h1 className="vh-logo">VINYL HAUS</h1>
            <span className="vh-logo-sub">МАГАЗИН ПЛАСТИНОК</span>
          </div>
          <div className="vh-header-meta">
            <span className="vh-counter">{records.filter(r => r.inStock).length} В НАЛИЧИИ</span>
          </div>
        </div>
        <div className="vh-ticker">
          <div className="vh-ticker-inner">
            {['ДЖАЗ', 'РОК', 'СОУ', 'ЭЛЕКТРОНИКА', 'ХИП-ХОП', 'КЛАССИКА', 'БЕСПЛАТНАЯ ДОСТАВКА ОТ 5000₽', 'НОВИНКИ КАЖДУЮ ПЯТНИЦУ'].map((t, i) => (
              <span key={i} className="vh-tick">{t} &nbsp;✦&nbsp; </span>
            ))}
            {['ДЖАЗ', 'РОК', 'СОУ', 'ЭЛЕКТРОНИКА', 'ХИП-ХОП', 'КЛАССИКА', 'БЕСПЛАТНАЯ ДОСТАВКА ОТ 5000₽', 'НОВИНКИ КАЖДУЮ ПЯТНИЦУ'].map((t, i) => (
              <span key={`b${i}`} className="vh-tick">{t} &nbsp;✦&nbsp; </span>
            ))}
          </div>
        </div>
      </header>

      <section className="vh-filters">
        <div className="vh-filters-inner">
          <div className="vh-search-wrap">
            <span className="vh-search-icon">⌕</span>
            <input
              className="vh-search"
              placeholder="ПОИСК ПО АРТИСТУ ИЛИ НАЗВАНИЮ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="vh-filter-row">
            <label className="vh-toggle">
              <input type="checkbox" checked={filterInStock} onChange={e => setFilterInStock(e.target.checked)} />
              <span className="vh-toggle-label">ТОЛЬКО В НАЛИЧИИ</span>
            </label>
            <div className="vh-genre-pills">
              <button className={`vh-pill ${filterGenre === '' ? 'active' : ''}`} onClick={() => setFilterGenre('')}>ВСЕ</button>
              {Object.entries(GENRE_LABELS).map(([key, label]) => (
                <button key={key} className={`vh-pill ${filterGenre === key ? 'active' : ''}`} onClick={() => setFilterGenre(key)}>{label}</button>
              ))}
            </div>
            <button className="vh-refresh" onClick={fetchRecords} title="Обновить">↺</button>
          </div>
        </div>
      </section>

      <main className="vh-main">
        {loading ? (
          <div className="vh-state">
            <div className="vh-spinner" />
            <p>ЗАГРУЗКА КАТАЛОГА...</p>
          </div>
        ) : error ? (
          <div className="vh-state vh-error">
            <p className="vh-error-icon">⚠</p>
            <p>{error}</p>
            <button className="vh-retry" onClick={fetchRecords}>ПОВТОРИТЬ</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="vh-state">
            <p className="vh-empty-icon">◎</p>
            <p>ПЛАСТИНКИ НЕ НАЙДЕНЫ</p>
          </div>
        ) : (
          <>
            <div className="vh-results-bar">
              <span>{filtered.length} ПЛАСТИНОК</span>
            </div>
            <div className="vh-grid">
              {filtered.map((record, i) => (
                <article
                  key={record.id}
                  className={`vh-card ${!record.inStock ? 'sold-out' : ''}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => setSelected(record)}
                >
                  <div className="vh-card-img-wrap">
                    <img src={record.image} alt={record.title} className="vh-card-img" loading="lazy" />
                    <div className="vh-card-overlay">
                      <span className="vh-view-btn">СМОТРЕТЬ</span>
                    </div>
                    {!record.inStock && <div className="vh-sold-badge">НЕТ В НАЛИЧИИ</div>}
                    <div className="vh-genre-badge">{GENRE_LABELS[record.genre]}</div>
                  </div>
                  <div className="vh-card-body">
                    <div className="vh-card-year">{record.year}</div>
                    <h2 className="vh-card-title">{record.title}</h2>
                    <p className="vh-card-artist">{record.artist}</p>
                    <div className="vh-card-footer">
                      <div className="vh-card-rating">
                        {'▪'.repeat(Math.floor(record.rating))}{'▫'.repeat(5 - Math.floor(record.rating))}
                        <span>{record.rating}</span>
                      </div>
                      <span className="vh-card-price">{record.price.toLocaleString('ru')} ₽</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      {selected && (
        <div className="vh-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="vh-modal">
            <button className="vh-modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="vh-modal-left">
              <div className="vh-modal-img-wrap">
                <img src={selected.image} alt={selected.title} className="vh-modal-img" />
                <div className="vh-modal-vinyl-ring" />
              </div>
              <div className="vh-modal-meta">
                <div className="vh-meta-row"><span>ЛЕЙБЛ</span><span>{selected.label}</span></div>
                <div className="vh-meta-row"><span>ГОД</span><span>{selected.year}</span></div>
                <div className="vh-meta-row"><span>ЖАНР</span><span>{GENRE_LABELS[selected.genre]}</span></div>
                <div className="vh-meta-row"><span>РЕЙТИНГ</span><span>{'▪'.repeat(Math.floor(selected.rating))} {selected.rating}</span></div>
              </div>
            </div>
            <div className="vh-modal-right">
              <span className="vh-modal-genre-tag">{GENRE_LABELS[selected.genre]}</span>
              <h2 className="vh-modal-title">{selected.title}</h2>
              <p className="vh-modal-artist">{selected.artist}</p>
              <p className="vh-modal-desc">{selected.description}</p>
              {selected.tracklist && (
                <div className="vh-tracklist">
                  <p className="vh-tracklist-label">ТРЕКЛИСТ</p>
                  <p className="vh-tracklist-text">{selected.tracklist}</p>
                </div>
              )}
              <div className="vh-modal-buy">
                <span className="vh-modal-price">{selected.price.toLocaleString('ru')} ₽</span>
                {selected.inStock
                  ? <button className="vh-btn-buy">В КОРЗИНУ</button>
                  : <button className="vh-btn-sold" disabled>НЕТ В НАЛИЧИИ</button>
                }
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="vh-footer">
        <a href="/admin" className="vh-admin-hidden">VINYL HAUS © {new Date().getFullYear()}</a>
        <span>МОСКВА, РОССИЯ</span>
      </footer>
    </div>
  );
}