
import React, { useState } from 'react';
import { News } from '@/lib/types';
import { createNews, updateNews, deleteNews } from '@/lib/api';
import ConfirmationModal from '../ui/ConfirmationModal';

interface NewsManagerProps {
    news: News[];
    onNewsUpdate: () => void;
}
export default function NewsManager({ news, onNewsUpdate }: NewsManagerProps) {
    const [editingNews, setEditingNews] = useState<Partial<News>>({});
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [error, setError] = useState('');

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editingNews.id) {
                await updateNews(editingNews.id, editingNews);
            } else {
                await createNews(editingNews);
            }
            setIsFormOpen(false);
            setEditingNews({});
            onNewsUpdate();
        } catch (err) {
            setError('Failed to save news');
            console.error(err);
        }
    };

    const handleDelete = (id: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Supprimer cet article',
            message: 'Êtes-vous sûr de vouloir supprimer cette news ? Cette action est irréversible.',
            onConfirm: async () => {
                try {
                    await deleteNews(id);
                    onNewsUpdate();
                } catch (err) {
                    setError('Failed to delete news');
                    console.error(err);
                }
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                isDestructive={true}
            />

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50">News ({news.length})</h3>
                <button
                    onClick={() => { setEditingNews({}); setIsFormOpen(true); }}
                    className="text-[9px] uppercase tracking-wider text-[#0C9962] hover:text-white transition-colors"
                >
                    + Ajouter News
                </button>
            </div>

            {error && <p className="text-red-400 text-sm bg-red-400/10 p-2 rounded">{error}</p>}

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold font-oswald text-white mb-6">
                            {editingNews.id ? 'Modifier News' : 'Nouvelle News'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Titre</label>
                                <input
                                    type="text"
                                    value={editingNews.title || ''}
                                    onChange={e => setEditingNews({ ...editingNews, title: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#0C9962]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Résumé</label>
                                <textarea
                                    value={editingNews.summary || ''}
                                    onChange={e => setEditingNews({ ...editingNews, summary: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#0C9962]"
                                    rows={5}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={editingNews.image || ''}
                                    onChange={e => setEditingNews({ ...editingNews, image: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#0C9962]"
                                    required
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 rounded-lg text-white/60 hover:text-white text-xs font-bold uppercase"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#0C9962] hover:bg-[#0a8656] text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map(item => (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col group">
                        <div className="h-32 relative overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                    onClick={() => { setEditingNews(item); setIsFormOpen(true); }}
                                    className="bg-black/60 hover:bg-[#0C9962] text-white p-1.5 rounded-lg backdrop-blur-sm transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-black/60 hover:bg-red-500 text-white p-1.5 rounded-lg backdrop-blur-sm transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="mb-2">
                                <span className="text-[10px] text-[#0C9962] font-bold uppercase" suppressHydrationWarning>
                                    {new Date(item.date).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                            <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2">{item.summary}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
