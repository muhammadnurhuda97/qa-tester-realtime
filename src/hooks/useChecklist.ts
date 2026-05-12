/// <reference types="vite/client" />
import { useState, useMemo, useEffect, useRef } from 'react';
import { ChecklistGroup, TestStatus } from '../types';

const TESTER_KEY = 'aksara-qa-tester';
const UID_KEY = 'aksara-qa-uid';

const API = {
  GET: '/api/checklist',
  IMPORT: '/api/checklist',
  UPDATE: '/api/checklist/update',
  STREAM: '/api/checklist/stream'
};

import { setCookie, getCookie, eraseCookie } from '../lib/cookies';

console.log('QA API Config:', API);

export function useChecklist() {
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [testerName, setTesterName] = useState<string | null>(() => {
    return getCookie(TESTER_KEY);
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  // Ensure unique ID for audit and initial data fetch
  useEffect(() => {
    if (!getCookie(UID_KEY)) {
      const uid = 'uid-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
      setCookie(UID_KEY, uid);
    }

    // Initial fetch to ensure data is present immediately
    fetch(API.GET)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setGroups(data);
        }
      })
      .catch(err => console.error('Initial fetch error:', err));
  }, []);

  // ── SSE: subscribe real-time update dari server ────────────────────────────
  useEffect(() => {
    const connectSSE = () => {
      // Tutup koneksi lama jika ada
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(API.STREAM);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Hanya update jika data array valid
          if (Array.isArray(data)) {
            setGroups(data);
          }
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };

      es.onerror = () => {
        // Koneksi putus → reconnect otomatis setelah 3 detik
        es.close();
        eventSourceRef.current = null;
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      eventSourceRef.current?.close();
    };
  }, []);
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (testerName) {
      setCookie(TESTER_KEY, testerName);
    } else {
      eraseCookie(TESTER_KEY);
    }
  }, [testerName]);

  const importJson = async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      console.log('[Import] Data parsed successfully:', data);
      
      const normalize = (val: any): ChecklistGroup => ({
        id: Math.random().toString(36).substr(2, 9),
        module: val.module || 'Default Module',
        items: (val.items || []).map((item: string) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: item,
          status: TestStatus.NOT_TESTED
        }))
      });

      const newGroups = Array.isArray(data) ? data.map(normalize) : [normalize(data)];
      console.log('[Import] Sending to server:', newGroups);

      // POST ke server → server akan broadcast via SSE ke semua client
      const response = await fetch(API.IMPORT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroups)
      });

      const result = await response.json();
      console.log('[Import] Server response:', result);

      if (response.ok) {
        // Audit: mark that this user configured the session
        setCookie('aksara-qa-last-configurator', testerName || 'unknown');
        // Update local state immediately for the configurator
        setGroups(newGroups);
      }
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  };

  const updateStatus = async (groupId: string, itemId: string, status: TestStatus) => {
    // Optimistic UI update (langsung tampil, sebelum server konfirmasi)
    setGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: group.items.map(item =>
          item.id === itemId
            ? {
                ...item,
                status,
                testedBy: status !== TestStatus.NOT_TESTED ? (testerName || 'Unknown') : undefined
              }
            : item
        )
      };
    }));

    // Kirim ke server → server broadcast ke semua client lain via SSE
    try {
      await fetch(API.UPDATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          itemId,
          status,
          testedBy: testerName || 'Unknown'
        })
      });
    } catch (error) {
      console.error('Failed to update status on server:', error);
    }
  };

  const submitCycle = async () => {
    const uid = getCookie(UID_KEY);
    
    console.log('Submitting Cycle (Audit Trail):', {
      tester: testerName,
      cookie_id: uid,
      timestamp: new Date().toISOString(),
      stats: stats,
      results: groups
    });

    alert(`Cycle submitted successfully!\nTester: ${testerName}\nID Recorded (Cookie): ${uid}`);
  };

  const stats = useMemo(() => {
    const total = groups.reduce((acc, g) => acc + g.items.length, 0);
    const passed = groups.reduce((acc, g) => acc + g.items.filter(i => i.status === TestStatus.PASS).length, 0);
    const failed = groups.reduce((acc, g) => acc + g.items.filter(i => i.status === TestStatus.FAIL).length, 0);
    const progress = total > 0 ? ((passed + failed) / total) * 100 : 0;

    return { total, passed, failed, progress };
  }, [groups]);

  return { groups, importJson, updateStatus, stats, testerName, setTesterName, submitCycle };
}
