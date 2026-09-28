import { beforeEach, describe, expect, it } from 'vitest';
import { findHistoryEntry } from './historySync';

describe('findHistoryEntry', () => {
  beforeEach(() => {
    localStorage.setItem('ALTIO_CV_hist', JSON.stringify([{ id: 1727512345678, name: 'CV Marketing' }]));
  });

  it('trouve un CV du cache local, id en texte ou en nombre', async () => {
    expect((await findHistoryEntry('1727512345678'))?.name).toBe('CV Marketing');
    expect((await findHistoryEntry(1727512345678))?.name).toBe('CV Marketing');
  });

  it('null quand le CV n’existe ni en cache ni dans Supabase (non configuré ici)', async () => {
    expect(await findHistoryEntry('inconnu')).toBeNull();
  });
});
