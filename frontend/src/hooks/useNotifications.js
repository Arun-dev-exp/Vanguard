'use client';

import { useState, useCallback, useRef } from 'react';

let notifId = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const timeoutsRef = useRef({});

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = ++notifId;
    const notification = { id, message, type, createdAt: Date.now() };

    setNotifications((prev) => [...prev, notification]);

    timeoutsRef.current[id] = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      delete timeoutsRef.current[id];
    }, duration);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  }, []);

  return { notifications, addNotification, removeNotification };
}
