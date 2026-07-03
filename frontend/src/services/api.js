const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
};

export const reservationApi = {
  getMine: () => request('/reservations/mine'),
  getAll: (date) => request(date ? `/reservations?date=${date}` : '/reservations'),
  getAvailability: (date, timeSlot, guestCount) =>
    request(
      `/reservations/availability?date=${date}&timeSlot=${encodeURIComponent(timeSlot)}&guestCount=${guestCount}`
    ),
  create: (body) => request('/reservations', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  cancel: (id) => request(`/reservations/${id}/cancel`, { method: 'PATCH' }),
};

export const tableApi = {
  getAll: () => request('/tables'),
  create: (body) => request('/tables', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/tables/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id) => request(`/tables/${id}`, { method: 'DELETE' }),
};

export const TIME_SLOTS = ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'];
