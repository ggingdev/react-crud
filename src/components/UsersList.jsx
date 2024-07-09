import { useState, useEffect } from 'react';

const apiPath = import.meta.env.VITE_API_PATH || '/api/users';

async function fetchUsers() {
  const res = await fetch(apiPath);
  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }
  return res.json();
}

async function createUser(user) {
  const res = await fetch(apiPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    throw new Error('Failed to create user');
  }
  return res.json();
}

async function updateUser(id, user) {
  const res = await fetch(`${apiPath}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    throw new Error('Failed to update user');
  }
  return res.json();
}

async function deleteUser(id) {
  const res = await fetch(`${apiPath}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete user');
  }
  return res.json();
}

export default function Users() {
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [localData, setLocalData] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await fetchUsers();
        setLocalData(users);
      } catch (error) {
        setError(error.message || 'Error fetching users');
      }
    }
    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      setShowModal(true);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const createdUser = await createUser(newUser);
      setLocalData((prevData) => [...prevData, createdUser]);
      setNewUser({ name: '', email: '' });
    } catch (error) {
      setError(error.message || 'Error creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (id) => {
    if (!editingUser.name || !editingUser.email) {
      setShowModal(true);
      return;
    }
    if (savingId === id) return;
    setSavingId(id);
    try {
      const updatedUser = await updateUser(id, editingUser);
      setLocalData((prevData) =>
        prevData.map((user) => (user.id === id ? updatedUser : user))
      );
      setEditingUser(null);
    } catch (error) {
      setError(error.message || 'Error updating user');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (deletingId === id) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      setLocalData((prevData) => prevData.filter((user) => user.id !== id));
    } catch (error) {
      setError(error.message || 'Error deleting user');
    } finally {
      setDeletingId(null);
    }
  };

  if (error)
    return (
      <div className='text-red-500 text-center mt-10'>
        Failed to load: {error}
      </div>
    );

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold text-center my-4'>
        Next.js Fetching Example
      </h1>
      <div className='mb-4 flex justify-start items-center space-x-2'>
        <input
          type='text'
          placeholder='이름'
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className='border p-2 mr-2 rounded'
        />
        <input
          type='email'
          placeholder='이메일'
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className='border p-2 mr-2 rounded'
        />
        <button
          onClick={handleCreateUser}
          className='bg-blue-500 text-white p-2 rounded'
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : '등록'}
        </button>
      </div>
      <ul className='space-y-4'>
        {localData.map((user) => (
          <li
            key={user.id}
            className='p-4 border rounded shadow-sm hover:shadow-md'
          >
            {editingUser && editingUser.id === user.id ? (
              <div className='flex flex-col sm:flex-row items-center justify-start space-x-2'>
                <input
                  type='text'
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className='border p-2 mr-2 rounded'
                />
                <input
                  type='email'
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className='border p-2 mr-2 rounded'
                />
                <div className='mt-2 sm:mt-0'>
                  <button
                    onClick={() => handleUpdateUser(user.id)}
                    className='bg-green-500 text-white p-2 rounded mr-2'
                    disabled={savingId === user.id}
                  >
                    {savingId === user.id ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className='bg-gray-500 text-white p-2 rounded'
                    disabled={savingId === user.id}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-lg font-semibold'>{user.name}</div>
                  <div className='text-gray-600'>{user.email}</div>
                </div>
                <div>
                  <button
                    onClick={() => setEditingUser(user)}
                    className='bg-yellow-500 text-white p-2 rounded mr-2'
                    disabled={isSubmitting || deletingId === user.id}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className='bg-red-500 text-white p-2 rounded'
                    disabled={deletingId === user.id}
                  >
                    {deletingId === user.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {showModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white p-6 rounded shadow-lg'>
            <h2 className='text-2xl mb-4'>값을 입력하세요</h2>
            <button
              onClick={() => setShowModal(false)}
              className='bg-blue-500 text-white p-2 rounded'
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
