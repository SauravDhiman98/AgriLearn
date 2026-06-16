import { useState } from 'react'
import { useQuery } from 'react-query'
import { useDispatch } from 'react-redux'
import { marketplaceApi } from '../../api/services'
import { addToCart } from '../../store/slices/cartSlice'
import { Search, ShoppingCart, Star } from 'lucide-react'
import { toast } from 'react-toastify'

const CATEGORIES = [
  'SEEDS', 'FERTILIZERS', 'PESTICIDES', 'TOOLS',
  'IRRIGATION', 'ORGANIC_INPUTS', 'MACHINERY', 'BOOKS',
]

export default function MarketplacePage() {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery(
    ['products', search, category, page],
    () => marketplaceApi.listProducts({ keyword: search, category, page, size: 20 }),
    { select: res => res.data }
  )

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    }))
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🛒 Agri Marketplace</h1>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search seeds, fertilizers, tools..." className="input-field pl-10" />
        </div>
        <select className="input-field w-auto" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.content?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.content.map((product: any) => (
            <div key={product.id} className="card hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-50 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🌱</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 mt-1 mb-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-500">{product.rating?.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                  <span className="text-xs text-gray-400">/{product.unit || 'piece'}</span>
                </div>
                <button onClick={() => handleAddToCart(product)}
                  className="btn-primary w-full text-xs py-1.5 mt-2 flex items-center justify-center gap-1">
                  <ShoppingCart className="w-3 h-3" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">🛒</div>
          <p>No products found</p>
        </div>
      )}
    </div>
  )
}
