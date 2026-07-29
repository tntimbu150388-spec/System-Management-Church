import React, { useState } from 'react';
import { Sparkles, PlusCircle, Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { EventGereja } from '../../types';
import { getCollection, addItem } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const EventModule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [events, setEvents] = useState<EventGereja[]>(() => getCollection('EVENT') || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<EventGereja>>({
    Nama: '',
    Deskripsi: '',
    Tanggal: new Date().toISOString().slice(0, 10),
    Lokasi: 'Gedung Utama Gereja',
    Kategori: 'Seminar',
    Gambar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
  });

  const refreshData = () => {
    setEvents(getCollection('EVENT') || []);
  };

  const handleRegisterEvent = (eventId: string, eventName: string) => {
    if (registeredEvents.includes(eventId)) {
      showToast('Sudah Terdaftar', 'Anda sudah terdaftar pada event ini.', 'info');
      return;
    }

    setRegisteredEvents([...registeredEvents, eventId]);
    showToast('Pendaftaran Sukses', `Anda berhasil mendaftar event ${eventName}.`, 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newE: EventGereja = {
      EventID: 'EVT-' + Date.now().toString().slice(-5),
      Nama: formData.Nama || '',
      Deskripsi: formData.Deskripsi || '',
      Tanggal: formData.Tanggal || new Date().toISOString().slice(0, 10),
      Lokasi: formData.Lokasi || 'Gereja',
      Kategori: formData.Kategori || 'Umum',
      Gambar: formData.Gambar || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
      PesertaCount: 0,
    };

    addItem('EVENT', newE, user?.UserID, user?.Nama);
    refreshData();
    setIsModalOpen(false);
    showToast('Event Diterbitkan', 'Event baru berhasil ditambahkan.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Event & Kegiatan Gereja
          </h2>
          <p className="text-xs text-slate-500">Daftar seminar, retret, perayaan, dan pembinaan</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Event Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => {
          const isReg = registeredEvents.includes(evt.EventID);
          return (
            <GlassCard key={evt.EventID} className="overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="relative">
                  <img src={evt.Gambar} alt={evt.Nama} className="w-full h-44 object-cover" />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-extrabold border border-white/20">
                    {evt.Kategori}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {evt.Nama}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                    {evt.Deskripsi}
                  </p>

                  <div className="space-y-1 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>Tanggal: {evt.Tanggal}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>Lokasi: {evt.Lokasi}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleRegisterEvent(evt.EventID, evt.Nama)}
                  disabled={isReg}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isReg
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  {isReg ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sudah Terdaftar</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Daftar Event Ini</span>
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Event Gereja" maxWidth="md">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Nama Event *</label>
            <input
              type="text"
              required
              value={formData.Nama}
              onChange={(e) => setFormData({ ...formData, Nama: e.target.value })}
              placeholder="Contoh: Seminar Pasutri & Keluarga Bahagia"
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal *</label>
              <input
                type="date"
                required
                value={formData.Tanggal}
                onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Kategori</label>
              <select
                value={formData.Kategori}
                onChange={(e) => setFormData({ ...formData, Kategori: e.target.value })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="Seminar">Seminar</option>
                <option value="Natal">Natal</option>
                <option value="Paskah">Paskah</option>
                <option value="Retret">Retret</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Lokasi Event</label>
            <input
              type="text"
              value={formData.Lokasi}
              onChange={(e) => setFormData({ ...formData, Lokasi: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Deskripsi Lengkap</label>
            <textarea
              rows={3}
              value={formData.Deskripsi}
              onChange={(e) => setFormData({ ...formData, Deskripsi: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-500">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow">
              Terbitkan Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
