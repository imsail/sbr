import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

// ---- Pets ----
export const getPets = (params = {}) => client.get('/pets', { params }).then(r => r.data)
export const getPet   = (id)         => client.get(`/pets/${id}`).then(r => r.data)
export const searchPets = (name, extra = {}) => client.get('/pets/search', { params: { name, ...extra } }).then(r => r.data)
export const createPet = (data)      => client.post('/pets', data).then(r => r.data)
export const updatePet = (id, data)  => client.put(`/pets/${id}`, data).then(r => r.data)
export const deletePet = (id)        => client.delete(`/pets/${id}`)

// ---- Categories ----
export const getCategories  = ()           => client.get('/categories').then(r => r.data)
export const createCategory = (data)       => client.post('/categories', data).then(r => r.data)
export const updateCategory = (id, data)   => client.put(`/categories/${id}`, data).then(r => r.data)
export const deleteCategory = (id)         => client.delete(`/categories/${id}`)
