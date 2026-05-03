import { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import HeaderActions from '../../components/common/HeaderActions';
import { getAdminSongs } from '../../api/appApi';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

function AdminSongsPage() {
  const { searchTerm: search } = useOutletContext();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'plays', direction: 'desc' });

  useEffect(() => {
    setLoading(true);
    getAdminSongs(page, 50)
      .then((data) => {
        setSongs(data || []);
      })
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [page]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = useMemo(() => {
    let items = [...songs];
    
    // Filter
    if (search) {
      items = items.filter((song) =>
        [song.title, song.artist, song.album].some((value) => 
          (value || '').toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Sort
    items.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return items;
  }, [songs, search, sortConfig]);

  const totalPlays = songs.reduce((sum, song) => sum + (song.plays || 0), 0);
  const totalLikes = songs.reduce((sum, song) => sum + (song.likes || 0), 0);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3 ml-1" /> : <ChevronDown className="inline h-3 w-3 ml-1" />;
  };

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between rounded-[34px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-8 shadow-[var(--shadow-card)]">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Songs Monitoring</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Track engagement metrics and library growth in real-time across catalog and uploads.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Tracked Assets', value: songs.length },
          { label: 'Cumulative Plays', value: totalPlays.toLocaleString() + ' Plays', highlight: true },
          { label: 'Community Likes', value: totalLikes.toLocaleString() + ' Likes', highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`group relative overflow-hidden rounded-[28px] border-2 border-blue-400/10 p-6 transition-all duration-300 hover:scale-[1.02] ${highlight ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_10px_30px_rgba(37,99,235,0.2)]' : 'bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)]'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-100/70' : 'text-[var(--text-secondary)]'}`}>{label}</p>
            <p className={`mt-2 text-2xl font-black ${highlight ? 'text-white' : 'text-[var(--text-primary)]'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-[30px] border-[1px] border-[var(--border-strong)] bg-[var(--surface-elevated)] shadow-2xl">
        <div className="border-b border-[var(--border-strong)] bg-[var(--surface)] px-8 py-5 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
            {filteredAndSorted.length} Indexed Entit{filteredAndSorted.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-strong)] bg-[var(--surface-alt)]">
                {[
                  { key: 'title', label: 'Song Asset' },
                  { key: 'artist', label: 'Artist & Album' },
                  { key: 'plays', label: 'Engagement' },
                  { key: 'duration', label: 'Duration' },
                  { key: 'id', label: 'Type' },
                  { key: 'status', label: 'Status' }
                ].map((col) => (
                  <th 
                    key={col.key} 
                    onClick={() => requestSort(col.key)}
                    className="cursor-pointer px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-blue-500 transition"
                  >
                    {col.label} <SortIcon column={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-strong)]">
              {filteredAndSorted.map((song, idx) => (
                <tr key={song.id} className="group hover:bg-blue-500/5 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{song.title || 'Unknown Title'}</p>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-tighter text-blue-500/60 opacity-0 group-hover:opacity-100 transition-opacity">ID: {song.id}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{song.artist || 'Unknown Artist'}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{song.album || 'Single'}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-500 w-fit">
                        {song.plays || 0} Plays
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-pink-500 w-fit">
                        {song.likes || 0} Likes
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-mono font-bold text-[var(--text-secondary)]">
                    {song.duration && song.duration.includes(':') ? song.duration : '3:45'}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${song.id.length > 20 ? 'bg-purple-500/10 text-purple-500' : 'bg-green-500/10 text-green-500'}`}>
                      {song.id.length > 20 ? 'Catalog' : 'Uploaded'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-green-500">Live</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-[var(--surface-alt)] flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-[var(--text-secondary)]" />
                      </div>
                      <p className="text-sm font-bold text-[var(--text-secondary)]">No songs found in the monitoring index.</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">Try adjusting your search or engagement filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-full bg-[var(--surface-alt)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-[var(--text-secondary)]">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={songs.length < 50}
          className="rounded-full bg-[var(--surface-alt)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}

export default AdminSongsPage;
