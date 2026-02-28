import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,   // send JSESSIONID cookie on every request
})

// On 401 dispatch a logout event so AuthContext can react
client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(err)
  }
)

// ---- Auth ----
export const loginUser    = (data) => client.post('/auth/login',    data).then(r => r.data)
export const logoutUser   = ()     => client.post('/auth/logout')
export const registerUser = (data) => client.post('/auth/register', data).then(r => r.data)
export const getMe        = ()     => client.get('/auth/me').then(r => r.data)
export const getApiToken  = (data) => client.post('/auth/token', data).then(r => r.data)
export const deleteApiToken = ()   => client.delete('/auth/token')

// ---- Users (admin) ----
export const getUsers        = ()              => client.get('/users').then(r => r.data)
export const updateUserRole  = (id, role)      => client.patch(`/users/${id}/role`, { role }).then(r => r.data)
export const deleteUser      = (id)            => client.delete(`/users/${id}`)

// ---- Pets ----
export const getPets    = (params = {}) => client.get('/pets',        { params }).then(r => r.data)
export const getPet     = (id)          => client.get(`/pets/${id}`).then(r => r.data)
export const searchPets = (name, extra = {}) => client.get('/pets/search', { params: { name, ...extra } }).then(r => r.data)
export const createPet  = (data)        => client.post('/pets',        data).then(r => r.data)
export const updatePet  = (id, data)    => client.put(`/pets/${id}`,   data).then(r => r.data)
export const deletePet  = (id)          => client.delete(`/pets/${id}`)

// ---- Categories ----
export const getCategories  = ()         => client.get('/categories').then(r => r.data)
export const createCategory = (data)     => client.post('/categories',      data).then(r => r.data)
export const updateCategory = (id, data) => client.put(`/categories/${id}`, data).then(r => r.data)
export const deleteCategory = (id)       => client.delete(`/categories/${id}`)
