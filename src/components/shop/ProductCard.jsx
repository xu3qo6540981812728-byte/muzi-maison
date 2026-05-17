import { ChevronRight, Minus, Plus } from '../Icons'
import { Link } from 'react-router-dom'

export default function ProductCard({
  product,
  isAdminMode,
  adminOrderingFor,
  cartQty,
  onOpenDetail,
  onUpdateCart
}) {
  const isEditableAdmin = isAdminMode && !adminOrderingFor
  const listImage = product.thumbUrl || product.image
  const rememberHomeScroll = () => {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem('muzi_home_scroll_y', String(window.scrollY || 0))
  }

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm flex gap-4 border border-stone-100 relative group overflow-hidden">
      {isEditableAdmin ? (
        <div
          onClick={onOpenDetail}
          className="relative block w-24 h-24 rounded-xl shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#8B7355] transition-all"
        >
          <img src={listImage} alt={product.name} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-white/90 text-stone-800 text-[10px] font-bold px-2 py-1 rounded-full">編輯</span>
          </div>
          {product.isPromo && (
            <div className="absolute top-0 left-0 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg z-10 shadow-sm">
              指定商品活動
            </div>
          )}
          {product.isAddon && (
            <div className="absolute bottom-0 left-0 right-0 bg-purple-500/90 text-white text-[9px] font-bold text-center py-0.5 z-10 shadow-sm">
              加購商品
            </div>
          )}
        </div>
      ) : (
        <Link
          to={`/product/${product.id}`}
          onClick={rememberHomeScroll}
          className="relative block w-24 h-24 rounded-xl shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#8B7355] transition-all"
        >
          <img src={listImage} alt={product.name} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-white/90 text-stone-800 text-[10px] font-bold px-2 py-1 rounded-full">詳情</span>
          </div>
          {product.isPromo && (
            <div className="absolute top-0 left-0 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg z-10 shadow-sm">
              指定商品活動
            </div>
          )}
          {product.isAddon && (
            <div className="absolute bottom-0 left-0 right-0 bg-purple-500/90 text-white text-[9px] font-bold text-center py-0.5 z-10 shadow-sm">
              加購商品
            </div>
          )}
        </Link>
      )}

      <div className="flex-1 flex flex-col justify-between py-0.5">
        {isEditableAdmin ? (
          <div onClick={onOpenDetail} className="cursor-pointer">
            <h3 className="font-bold text-stone-800 leading-tight flex items-center justify-between">
              {product.name} <ChevronRight size={16} className="text-stone-300" />
            </h3>
            {product.desc && <p className="text-xs text-stone-500 mt-1">{product.desc}</p>}
            <span className="inline-block mt-1 px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] rounded-md">
              {product.weight}
            </span>
          </div>
        ) : (
          <Link to={`/product/${product.id}`} onClick={rememberHomeScroll} className="cursor-pointer block">
            <h3 className="font-bold text-stone-800 leading-tight flex items-center justify-between">
              {product.name} <ChevronRight size={16} className="text-stone-300" />
            </h3>
            {product.desc && <p className="text-xs text-stone-500 mt-1">{product.desc}</p>}
            <span className="inline-block mt-1 px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] rounded-md">
              {product.weight}
            </span>
          </Link>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold brand-accent">
            ${product.price}{' '}
            {product.unit && <span className="text-xs text-stone-400 font-normal">/{product.unit}</span>}
          </span>
          {(!isAdminMode || adminOrderingFor) && (
            <div className="flex items-center gap-3 bg-stone-50 rounded-full px-2 py-1 border border-stone-200">
              <button
                onClick={() => onUpdateCart(-1)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200 active:bg-stone-300"
              >
                <Minus size={14} />
              </button>
              <span className="w-4 text-center text-sm font-bold">{cartQty}</span>
              <button
                onClick={() => onUpdateCart(1)}
                className="w-6 h-6 rounded-full brand-btn-primary flex items-center justify-center shadow-sm"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

