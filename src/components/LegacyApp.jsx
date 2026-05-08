import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import firebase, { auth, db, storage } from '../config/firebase'
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Info,
  Store,
  MessageCircle,
  SettingsIcon,
  Camera,
  ImageIcon,
  Lock,
  LogOut,
  ImagePlus,
  Trash2,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Truck,
  UserIcon,
  ClipboardList,
  Printer,
  SearchIcon,
  DownloadIcon,
  UsersIcon,
  EditIcon,
  LinkIcon,
  CreditCard,
  Copy,
  CheckCircle,
  Share2,
  Menu,
  Megaphone,
  Gift,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  TrendingUp
} from './Icons'
import ProductCard from './shop/ProductCard'
import CartDrawer from './shop/CartDrawer'
import MemberProfileModal from './member/MemberProfileModal'
import AdminDashboardModal from './admin/AdminDashboardModal'
import AdminOrdersModal from './admin/AdminOrdersModal'

if (typeof window !== 'undefined') {
  window.jspdf = { jsPDF }
  window.html2canvas = html2canvas
}

const STATUS_MAP = {
      'pending': { label: '未處理', color: 'bg-rose-100 text-rose-700' },
      'confirming': { label: '訂單確認中', color: 'bg-amber-100 text-amber-700' },
      'confirmed': { label: '已匯款，確認訂單', color: 'bg-blue-100 text-blue-700' },
      'shipping': { label: '出貨中', color: 'bg-violet-100 text-violet-700' },
      'shipped': { label: '已出貨', color: 'bg-purple-100 text-purple-700' },
      'completed': { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
      'cancel_requested': { label: '買方申請取消', color: 'bg-orange-100 text-orange-700' },
      'cancelled': { label: '已取消', color: 'bg-stone-200 text-stone-600' }
    };

    const defaultProducts = [];
    const defaultStoreConfig = { 
  shippingFee: 100, 
  freeShippingThreshold: 2000, 
  promoQty: 3, 
  promoPrice: 550, 
  wholesaleThreshold: 12, 
  freeAddonReminderMsg: '恭喜！您選購的主商品享有「0元加購」優惠！\n別忘了至下方加購專區挑選喔！',
  giftThreshold: 30, // 預設滿 30 件送
  giftProductId: '' // 預設送的商品品號（空字串代表不送或尚未設定）
};

    function App({ routeMode = 'home', routeProductId = '', standaloneAdminPage = false }) {
      // 🌟 全局載入狀態，防止畫面閃現
      const [isAppLoading, setIsAppLoading] = useState(true);
      const [adminOrderingFor, setAdminOrderingFor] = useState(null);

      const [currentUser, setCurrentUser] = useState(null);
      const [userProfile, setUserProfile] = useState(null);
      const [isAdminMode, setIsAdminMode] = useState(false);
      const [sidebarOpen, setSidebarOpen] = useState(false);

      const [showLoginModal, setShowLoginModal] = useState(false);
      const [loginMode, setLoginMode] = useState('customer');
      const [isRegistering, setIsRegistering] = useState(false);
      const [showCheckoutEntryChoice, setShowCheckoutEntryChoice] = useState(false);
      
      const [showMemberProfile, setShowMemberProfile] = useState(false);
      const [showAdminOrders, setShowAdminOrders] = useState(false);
      const [showAdminCustomers, setShowAdminCustomers] = useState(false);
      const [showAdminDashboard, setShowAdminDashboard] = useState(false);
      const [showAdminLogs, setShowAdminLogs] = useState(false);
      const [imageMigrationRunning, setImageMigrationRunning] = useState(false);
      const [imageMigrationStatus, setImageMigrationStatus] = useState('');
      const [showDeletedCustomers, setShowDeletedCustomers] = useState(false); 
      const [showAboutModal, setShowAboutModal] = useState(false);
      const [isEditingAbout, setIsEditingAbout] = useState(false);
      const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
      const [showAnnounceConfig, setShowAnnounceConfig] = useState(false);

      const [emailInput, setEmailInput] = useState('');
      const [passwordInput, setPasswordInput] = useState('');
      const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', email: '', lineId: '', gender: '女' });
      
      const [orderNote, setOrderNote] = useState('');
      const [checkoutBankCode, setCheckoutBankCode] = useState('');
      

      const [bankCodeInputs, setBankCodeInputs] = useState({});
      const [trackingInputs, setTrackingInputs] = useState({});
      const [adminNoteInputs, setAdminNoteInputs] = useState({});
      const [adminDiscountInputs, setAdminDiscountInputs] = useState({});

      const [orderSearchId, setOrderSearchId] = useState('');
      const [orderStatusFilter, setOrderStatusFilter] = useState('all');
      const [orderStartDate, setOrderStartDate] = useState('');
      const [orderEndDate, setOrderEndDate] = useState('');

      const [customerSearchName, setCustomerSearchName] = useState('');
      const [selectedCustomer, setSelectedCustomer] = useState(null);
      const [isEditingAdminCustomer, setIsEditingAdminCustomer] = useState(false);
      
      
      const [isEditingProfile, setIsEditingProfile] = useState(false);
      const [copiedOrderId, setCopiedOrderId] = useState(null);

      const [isMergeMode, setIsMergeMode] = useState(false);
      const [mergeSelection, setMergeSelection] = useState([]);

      const [logo, setLogo] = useState('./logo.png');
      const [storeSlogan, setStoreSlogan] = useState('堅果、牛軋糖、核桃糕嚴選烘焙');
      const [products, setProducts] = useState(defaultProducts);
      const [storeConfig, setStoreConfig] = useState(defaultStoreConfig);
      const [cart, setCart] = useState({});
      const [lastPlacedOrderForReorder, setLastPlacedOrderForReorder] = useState(null);
      const [checkoutSuccessInfo, setCheckoutSuccessInfo] = useState(null);
      const [isCartOpen, setIsCartOpen] = useState(false);
      const [activeCategory, setActiveCategory] = useState('全部');
      const [deliveryMethod, setDeliveryMethod] = useState('delivery');
      const [contactData, setContactData] = useState({ address: '', phone: '', lineLink: '', email: '', bankAccount: '', businessHours: '' });

      const defaultAboutData = { title: '關於木子家 MUZI MAISON', content: '嚴選優質商品，提供最便利的線上訂購體驗。\n\n歡迎選購！', image: '' };
      const [aboutData, setAboutData] = useState(defaultAboutData);
      const [tempAboutData, setTempAboutData] = useState(defaultAboutData);

      const [announcements, setAnnouncements] = useState([]);
      const [viewingAnnounce, setViewingAnnounce] = useState(null);
      const [isEditingAnnounce, setIsEditingAnnounce] = useState(false);
      const [tempAnnounce, setTempAnnounce] = useState({});
      const [isNewCustomer, setIsNewCustomer] = useState(false);

      const [categoriesList, setCategoriesList] = useState([{ name: '精選商品', isHidden: false }, { name: '糖果軟糕系列(300g)', isHidden: false }]);
      const [showCategoryManager, setShowCategoryManager] = useState(false);
      const [newCatName, setNewCatName] = useState('');

      const [allOrders, setAllOrders] = useState([]);
const [oldOrders, setOldOrders] = useState([]); // 🌟 新增：裝舊訂單的倉庫箱
const [lastOrderDoc, setLastOrderDoc] = useState(null); // 🌟 新增：用來記錄目前抓到哪裡的書籤
const [cloudSearchResult, setCloudSearchResult] = useState(null); 
      const [activeSearchId, setActiveSearchId] = useState('');
const [allUsers, setAllUsers] = useState([]); 
const [orderLimit, setOrderLimit] = useState(50); 
const [userLimit, setUserLimit] = useState(50); 
const [adminLogs, setAdminLogs] = useState([]);
      const [monthlyStats, setMonthlyStats] = useState({ monthlyRevenue: 0, orderCount: 0 });

      const [editingProduct, setEditingProduct] = useState(null); 
      const [mainDisplayImg, setMainDisplayImg] = useState(''); 
      const [showContactModal, setShowContactModal] = useState(false);
      const [showConfigModal, setShowConfigModal] = useState(false);
      const [tempConfig, setTempConfig] = useState(defaultStoreConfig);
      const [showProductTable, setShowProductTable] = useState(false);
      const [showCatalogModal, setShowCatalogModal] = useState(false); // 控制產品型錄彈窗
const [catalogUrl, setCatalogUrl] = useState(''); // 存放 PDF 的網址
const [tableProducts, setTableProducts] = useState([]);
const [publicTopSellers, setPublicTopSellers] = useState({ items: [], label: '本月' });
      const navigate = useNavigate()
      const isAdminRouteMode = routeMode.startsWith('admin-')
      const rememberHomeScroll = () => {
        if (typeof window === 'undefined') return
        window.sessionStorage.setItem('muzi_home_scroll_y', String(window.scrollY || 0))
      }
      const requireAdminAccess = () => {
        if (!currentUser || !isAdminMode) {
          alert('此功能僅限管理員使用')
          navigate('/')
          return false
        }
        return true
      }
      const writeAdminLog = async (action, detail = {}) => {
        if (!db || !currentUser || !isAdminMode) return
        try {
          await db.collection('settings').doc('adminLogs').collection('items').add({
            action,
            detail,
            adminUid: currentUser.uid,
            adminEmail: currentUser.email || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          })
        } catch (error) {
          console.error('寫入管理操作紀錄失敗', error)
        }
      }
      const normalizeLogValue = (value) => {
        if (value === undefined || value === null || value === '') return '（空）'
        if (typeof value === 'boolean') return value ? '是' : '否'
        return String(value)
      }
      const buildFieldChanges = (beforeObj, afterObj, fields) => {
        const changes = []
        fields.forEach(({ key, label }) => {
          const beforeVal = beforeObj?.[key]
          const afterVal = afterObj?.[key]
          if (beforeVal !== afterVal) {
            changes.push({
              field: key,
              label,
              before: normalizeLogValue(beforeVal),
              after: normalizeLogValue(afterVal)
            })
          }
        })
        return changes
      }
      const findOrderById = (orderId) => {
        return [...allOrders, ...oldOrders, ...(cloudSearchResult ? [cloudSearchResult] : [])].find((o) => o.id === orderId) || null
      }
      const formatAdminLog = (log) => {
        const d = log?.detail || {}
        const actionMap = {
          order_status_updated: '更新訂單狀態',
          tracking_number_saved: '儲存物流單號',
          order_note_saved: '儲存訂單備註',
          order_discount_saved: '修改訂單折扣',
          order_deleted: '刪除訂單',
          product_saved: '儲存商品',
          product_deleted: '刪除商品',
          products_csv_imported: '匯入商品 CSV',
          system_config_updated: '更新系統設定',
          top_sellers_published: '發布熱銷排行',
          contact_info_updated: '更新聯絡資訊',
          about_info_updated: '更新關於我們',
          admin_customer_saved: '更新客戶資料',
          admin_customer_deleted: '停用客戶',
          admin_customer_restored: '恢復客戶',
          category_added: '新增分類',
          category_deleted: '刪除分類',
          category_renamed: '分類更名',
          category_reordered: '調整分類順序',
          category_visibility_toggled: '切換分類顯示狀態',
          catalog_uploaded: '上傳型錄',
          products_csv_exported: '匯出商品 CSV',
          admin_order_session_started: '開始代客建單',
          admin_order_session_ended: '結束代客建單',
          confirmed_orders_printed: '列印出貨明細',
          announcement_saved: '儲存公告',
          announcement_deleted: '刪除公告',
          announcement_reordered: '調整公告順序',
          catalog_deleted: '移除型錄'
        }

        let summary = ''
        if (log.action === 'order_status_updated') {
          summary = `訂單 ${d.orderId || '-'}：${STATUS_MAP[d.fromStatus]?.label || d.fromStatus || '-'} -> ${STATUS_MAP[d.toStatus]?.label || d.toStatus || '-'}`
        } else if (log.action === 'tracking_number_saved') {
          summary = `訂單 ${d.orderId || '-'}：物流單號更新為 ${d.trackingNumber || '(空)'}`
        } else if (log.action === 'order_note_saved') {
          summary = `訂單 ${d.orderId || '-'}：備註已更新（${d.noteLength || 0} 字）`
        } else if (log.action === 'order_discount_saved') {
          summary = `訂單 ${d.orderId || '-'}：折扣 ${d.adminDiscount || 0} 元，總額 ${d.finalPrice || 0} 元`
        } else if (log.action === 'order_deleted') {
          summary = `訂單 ${d.orderId || '-'} 已刪除`
        } else if (log.action === 'product_saved') {
          summary = `商品 ${d.productId || '-'}（${d.productName || '未命名'}）已儲存`
        } else if (log.action === 'product_deleted') {
          summary = `商品 ${d.productId || '-'}（${d.productName || '未命名'}）已刪除`
        } else if (log.action === 'products_csv_imported') {
          summary = `CSV 匯入 ${d.importCount || 0} 筆，新增分類 ${d.newCategoriesAdded || 0} 個`
        } else if (log.action === 'system_config_updated') {
          summary = `更新設定欄位：${Array.isArray(d.keys) ? d.keys.join('、') : '-'}`
        } else if (log.action === 'top_sellers_published') {
          summary = `發布熱銷排行 ${d.itemCount || 0} 筆（榜首：${d.topItemId || '-'}）`
        } else if (log.action === 'contact_info_updated') {
          summary = `聯絡資訊已更新（電話:${d.hasPhone ? '有' : '無'}、地址:${d.hasAddress ? '有' : '無'}、LINE:${d.hasLineLink ? '有' : '無'}）`
        } else if (log.action === 'about_info_updated') {
          summary = `關於我們已更新（標題：${d.title || '未提供'}）`
        } else if (log.action === 'admin_customer_saved') {
          summary = `客戶 ${d.customerId || '-'}（${d.customerName || '未命名'}）資料已${d.isNew ? '新增' : '更新'}`
        } else if (log.action === 'admin_customer_deleted') {
          summary = `客戶 ${d.customerId || '-'}（${d.customerName || '未命名'}）已停用`
        } else if (log.action === 'admin_customer_restored') {
          summary = `客戶 ${d.customerId || '-'}（${d.customerName || '未命名'}）已恢復`
        } else if (log.action === 'category_added') {
          summary = `新增分類：${d.categoryName || '未命名'}`
        } else if (log.action === 'category_deleted') {
          summary = `刪除分類：${d.categoryName || '未命名'}`
        } else if (log.action === 'category_renamed') {
          summary = `分類由「${d.from || '-'}」改為「${d.to || '-'}」，同步 ${d.affectedProducts || 0} 筆商品`
        } else if (log.action === 'category_reordered') {
          summary = `分類「${d.categoryName || '-'}」排序由 ${d.fromIndex ?? '-'} -> ${d.toIndex ?? '-'}`
        } else if (log.action === 'category_visibility_toggled') {
          summary = `分類「${d.categoryName || '-'}」已${d.isHidden ? '隱藏' : '顯示'}`
        } else if (log.action === 'catalog_uploaded') {
          summary = `上傳型錄：${d.fileName || '未命名檔案'}`
        } else if (log.action === 'products_csv_exported') {
          summary = `匯出商品 CSV ${d.exportCount || 0} 筆`
        } else if (log.action === 'admin_order_session_started') {
          summary = `開始代客建單：${d.customerName || '-'}（${d.customerId || '-'}）`
        } else if (log.action === 'admin_order_session_ended') {
          summary = `結束代客建單：${d.customerName || '-'}（${d.customerId || '-'}）`
        } else if (log.action === 'confirmed_orders_printed') {
          summary = `列印已確認訂單出貨明細 ${d.orderCount || 0} 筆，並將 ${d.markedShipping ?? d.orderCount ?? 0} 筆標為「出貨中」(shipping)`
        } else if (log.action === 'announcement_saved') {
          summary = `公告已儲存（${d.id === 'new' ? '新增' : '編輯'}：${d.title || '未命名'}）`
        } else if (log.action === 'announcement_deleted') {
          summary = `公告 ${d.id || '-'} 已刪除`
        } else if (log.action === 'announcement_reordered') {
          summary = `公告順序已調整（原索引 ${d.fromIndex ?? '-'}，方向 ${d.direction === -1 ? '上移' : '下移'}）`
        } else if (log.action === 'catalog_deleted') {
          summary = '產品型錄已移除'
        } else {
          summary = '已執行管理操作'
        }

        return {
          title: actionMap[log.action] || log.action || '管理操作',
          summary,
          changes: Array.isArray(d.changes) ? d.changes : []
        }
      }
      const productFromRoute = useMemo(() => {
        if (routeMode !== 'product' || !routeProductId) return null
        return products.find((p) => p.id === routeProductId) || null
      }, [routeMode, routeProductId, products])

      useEffect(() => {
        if (routeMode !== 'product' || !productFromRoute) return
        setEditingProduct((prev) => {
          if (prev && prev.id === productFromRoute.id) return prev
          return {
            intro: '',
            ingredients: '',
            notices: '',
            extraImages: [],
            isPromo: false,
            isAddon: false,
            providesFreeAddon: false,
            isNew: false,
            isFreeShipping: true,
            unit: productFromRoute.unit || '',
            cost: 0,
            ...productFromRoute
          }
        })
        setMainDisplayImg(productFromRoute.image || '')
      }, [routeMode, productFromRoute])

      useEffect(() => {
        try {
          const savedCart = localStorage.getItem('muzi_cart_v1')
          if (savedCart) setCart(JSON.parse(savedCart))
        } catch (error) {
          console.error('讀取購物車快取失敗', error)
        }
      }, [])

      useEffect(() => {
        try {
          localStorage.setItem('muzi_cart_v1', JSON.stringify(cart))
        } catch (error) {
          console.error('儲存購物車快取失敗', error)
        }
      }, [cart])

      useEffect(() => {
        const handleBeforeUnload = (e) => {
          if (Object.keys(cart || {}).length <= 0) return
          e.preventDefault()
          e.returnValue = ''
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
      }, [cart])

      useEffect(() => {
        // 每次路由切換先清空路由型頁面狀態，避免殘留互相覆蓋
        setIsCartOpen(false)
        setEditingProduct(null)
        setMainDisplayImg('')
        setShowMemberProfile(false)
        setShowAdminDashboard(false)
        setShowAdminLogs(false)
        setShowAdminOrders(false)
        setShowAdminCustomers(false)
        setShowProductTable(false)
        setSelectedCustomer(null)
        setIsEditingAdminCustomer(false)
        setIsMergeMode(false)
        setMergeSelection([])
        setIsNewCustomer(false)
        setShowDeletedCustomers(false)

        if (routeMode === 'member') {
          setShowMemberProfile(true)
          setIsEditingProfile(false)
        } else if (routeMode === 'cart') {
          setIsCartOpen(true)
        } else if (routeMode === 'admin-dashboard') {
          if (isAdminMode) setShowAdminDashboard(true)
        } else if (routeMode === 'admin-orders') {
          if (isAdminMode) setShowAdminOrders(true)
        } else if (routeMode === 'admin-customers') {
          if (isAdminMode) setShowAdminCustomers(true)
        } else if (routeMode === 'admin-products') {
          if (isAdminMode) {
            setTableProducts(JSON.parse(JSON.stringify(products)))
            setShowProductTable(true)
          }
        }
      }, [routeMode, products, isAdminMode])

      useLayoutEffect(() => {
        if (routeMode !== 'home') return
        const saved = window.sessionStorage.getItem('muzi_home_scroll_y')
        if (saved === null) return
        const top = Number(saved)
        window.sessionStorage.removeItem('muzi_home_scroll_y')
        window.scrollTo(0, Number.isFinite(top) ? top : 0)
      }, [routeMode])
      // ======== 【防護機制區塊】禁用右鍵與 F12 ========
      useEffect(() => {
        const handleContextMenu = (e) => {
          e.preventDefault();
        };
        const handleKeyDown = (e) => {
          // F12
          if (e.key === 'F12') e.preventDefault();
          // Ctrl+Shift+I (開發者工具) / Ctrl+Shift+J / Ctrl+U (檢視原始碼)
          if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'i' || e.key === 'j')) e.preventDefault();
          if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) e.preventDefault();
        };

        // 綁定事件
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
          // 解除綁定
          document.removeEventListener('contextmenu', handleContextMenu);
          document.removeEventListener('keydown', handleKeyDown);
        };
      }, []);

      // ======== 【修復 Bug 3】手機版實體返回鍵防護機制 ========
useEffect(() => {
  // 1. 定義當下「是否至少有一個重要彈窗」是開啟的
  const isAnyModalOpen = 
    isCartOpen || 
    editingProduct !== null || 
    showMemberProfile || 
    showLoginModal || 
    sidebarOpen ||
    showAdminOrders ||
    showAdminCustomers ||
    showAdminLogs ||
    showProductTable ||
    showCatalogModal;
  // 2. 如果有彈窗開啟，就在瀏覽器塞入一個「假歷史紀錄」
  // 這樣客人在按返回鍵時，只會「消耗」掉這個假紀錄，而不會跳出網站
  if (isAnyModalOpen) {
    window.history.pushState({ modalOpen: true }, "");
  }

  // 3. 監聽實體返回鍵 (popstate) 事件
  const handleBackButton = (e) => {
    // 如果返回鍵被按下時，有任何彈窗是開啟的，就將它們全部關閉
    if (isAnyModalOpen) {
      if (isCartOpen) setIsCartOpen(false);
      if (editingProduct) setEditingProduct(null);
      if (showMemberProfile) setShowMemberProfile(false);
      if (showLoginModal) setShowLoginModal(false);
      if (sidebarOpen) setSidebarOpen(false);
      
      // 管理員相關彈窗
      if (showAdminOrders) setShowAdminOrders(false);
      if (showAdminCustomers) { setShowAdminCustomers(false); setSelectedCustomer(null); }
      if (showAdminLogs) setShowAdminLogs(false);
      if (showProductTable) setShowProductTable(false);
      if (showCatalogModal) setShowCatalogModal(false);
      if (showConfigModal) setShowConfigModal(false);
      if (showCategoryManager) setShowCategoryManager(false);
      if (showContactModal) setShowContactModal(false);
      if (showAboutModal) setShowAboutModal(false);
      if (showAnnouncementModal) setShowAnnouncementModal(false);
      if (showAnnounceConfig) setShowAnnounceConfig(false);
      if (showAdminDashboard) setShowAdminDashboard(false);
    }
  };

  // 綁定監聽器
  window.addEventListener("popstate", handleBackButton);

  // 清除監聽器
  return () => {
    window.removeEventListener("popstate", handleBackButton);
  };
}, [
  // 必須將所有會觸發攔截的 state 放進 dependency array，讓 useEffect 能抓到最新狀態
  isCartOpen, editingProduct, showMemberProfile, showLoginModal, sidebarOpen,
  showAdminOrders, showAdminCustomers, showAdminLogs, showProductTable, showConfigModal,
  showCategoryManager, showContactModal, showAboutModal, showAnnouncementModal, showAnnounceConfig, showCatalogModal, showAdminDashboard
]);
// =======================================================

      useEffect(() => {
        if (!db || !auth) return;

        const unsubscribeAuth = auth.onAuthStateChanged(async user => {
          if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              if (userData.role === 'deleted') {
                alert("此帳號已被管理員停用或刪除！");
                auth.signOut();
                return;
              }
              if (userData.role === 'customer') {
                setIsAdminMode(false);
              } else {
                setIsAdminMode(true);
              }
              setUserProfile(userData);
            } else {
              setIsAdminMode(false);
              setUserProfile(null);
            }
            setCurrentUser(user);
          } else {
            setCurrentUser(null);
            setUserProfile(null);
            setIsAdminMode(false);
            setAdminOrderingFor(null);
          }
        });

        const unsubscribeLogo = db.collection('settings').doc('store').onSnapshot(doc => {
          if (doc.exists) {
            if (doc.data().logo) setLogo(doc.data().logo);
            if (doc.data().slogan !== undefined) setStoreSlogan(doc.data().slogan);
          }
        });

        const unsubscribeContact = db.collection('settings').doc('contact').onSnapshot(doc => {
          if (doc.exists) setContactData({ address: '', phone: '', lineLink: '', email: '', bankAccount: '', businessHours: '', ...doc.data() });
        });

        const unsubscribeConfig = db.collection('settings').doc('config').onSnapshot(doc => {
          if (doc.exists) setStoreConfig({ ...defaultStoreConfig, ...doc.data() });
        });

        const unsubscribeAbout = db.collection('settings').doc('about').onSnapshot(doc => {
          if (doc.exists) setAboutData({ ...defaultAboutData, ...doc.data() });
        });

        const unsubscribeCatalog = db.collection('settings').doc('catalog').onSnapshot(doc => {
          if (doc.exists && doc.data().url) {
            setCatalogUrl(doc.data().url);
          } else {
            setCatalogUrl('');
          }
        });

        const unsubscribeAnnounce = db.collection('settings').doc('announcements').onSnapshot(doc => {
          const handleAnnouncementsUpdate = (data) => {
            setAnnouncements(data);
            const unread = data.filter(a => a.isActive && a.showOnLoad && !isAnnounceExpired(a) && !sessionStorage.getItem(`seenAnnounce_${a.id}`));
            if (unread.length > 0) {
               setViewingAnnounce(unread[0]);
               setShowAnnouncementModal(true);
               sessionStorage.setItem(`seenAnnounce_${unread[0].id}`, 'true');
            }
          };

          if (doc.exists && Array.isArray(doc.data().list)) {
            handleAnnouncementsUpdate(doc.data().list);
          } else {
            db.collection('settings').doc('announcement').get().then(oldDoc => {
              if (oldDoc.exists && oldDoc.data().title) {
                handleAnnouncementsUpdate([{ ...oldDoc.data(), id: 'legacy-1' }]);
              } else {
                setAnnouncements([]);
              }
            }).catch(() => setAnnouncements([]));
          }
        });

        const unsubscribeCats = db.collection('settings').doc('categories').onSnapshot(doc => {
           if(doc.exists && doc.data().list) {
             const list = doc.data().list.map(c => typeof c === 'string' ? { name: c, isHidden: false } : c);
             setCategoriesList(list);
           }
        });

        const unsubscribeProducts = db.collection('products').onSnapshot(snapshot => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map(doc => doc.data());
            items.sort((a, b) => a.id.localeCompare(b.id));
            setProducts(items);
          }
          setIsAppLoading(false);
        });

        const unsubscribeTopSellers = db.collection('settings').doc('topSellers').onSnapshot(doc => {
          if (doc.exists) {
            setPublicTopSellers(doc.data());
          }
        });

        return () => {
          unsubscribeAuth(); unsubscribeLogo(); unsubscribeContact(); 
          unsubscribeConfig(); unsubscribeAbout(); unsubscribeProducts(); 
          unsubscribeAnnounce(); unsubscribeCats(); unsubscribeCatalog();unsubscribeTopSellers();
        };
      }, []);

      useEffect(() => {
        if (!db) return;

        let unsubscribeOrders = () => {};
        let unsubscribeUsers = () => {};
        let unsubscribeProfile = () => {};
        let unsubscribeAdminLogs = () => {};

        if (isAdminMode) {
          unsubscribeOrders = db.collection('orders').orderBy('createdAt', 'desc').limit(50).onSnapshot(snapshot => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllOrders(orders); // 放進魔法箱
            
            
           const newTrackingInputs = {};
            const newDiscountInputs = {};
            orders.forEach(o => { 
              if(o.trackingNumber) newTrackingInputs[o.id] = o.trackingNumber; 
              newDiscountInputs[o.id] = o.adminDiscount || 0;
            });
            setTrackingInputs(prev => ({...newTrackingInputs, ...prev}));
            setAdminDiscountInputs(prev => ({...newDiscountInputs, ...prev}));
          });

          unsubscribeUsers = db.collection('users').where('role', 'in', ['customer', 'deleted']).limit(userLimit).onSnapshot(snapshot => {
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllUsers(users);
          });
          unsubscribeAdminLogs = db.collection('settings').doc('adminLogs').collection('items').orderBy('createdAt', 'desc').limit(100).onSnapshot(snapshot => {
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAdminLogs(logs);
          });
        }
        else if (currentUser) {
          unsubscribeProfile = db.collection('users').doc(currentUser.uid).onSnapshot(doc => {
            if (doc.exists) {
               const data = doc.data();
               setUserProfile(data);
               setCustomerInfo({
                  name: data.name || '', phone: data.phone || '',
                  address: data.address || '', email: data.email || currentUser.email || '',
                  lineId: data.lineId || '', gender: data.gender || '女'
               });
            }
          });

          unsubscribeOrders = db.collection('orders')
            .where('userId', '==', currentUser.uid) 
            .onSnapshot(snapshot => {
              const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              orders.sort((a, b) => {
                 const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
                 const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
                 return timeB - timeA;
              });
              
              setAllOrders(orders);
              const newTrackingInputs = {};
              const newDiscountInputs = {};
              orders.forEach(o => { 
                if(o.trackingNumber) newTrackingInputs[o.id] = o.trackingNumber; 
                newDiscountInputs[o.id] = o.adminDiscount || 0;
              });
              setTrackingInputs(prev => ({...newTrackingInputs, ...prev}));
              setAdminDiscountInputs(prev => ({...newDiscountInputs, ...prev}));
            }, error => {
               console.error("讀取訂單失敗", error);
            });
          setAdminLogs([]);
        } else {
          setAdminLogs([]);
        }

        return () => {
          unsubscribeOrders();
          unsubscribeUsers();
          unsubscribeProfile();
          unsubscribeAdminLogs();
        };
      }, [currentUser, isAdminMode, orderLimit, userLimit, isAdminRouteMode]);

      useEffect(() => {
        if (!isAdminRouteMode || isAppLoading) return
        if (!currentUser || !isAdminMode) {
          navigate('/')
        }
      }, [isAdminRouteMode, isAppLoading, currentUser, isAdminMode, navigate])

      useEffect(() => {
        if (selectedCustomer) {
          const updatedUser = allUsers.find(u => u.id === selectedCustomer.id);
          if (updatedUser && !isEditingAdminCustomer) {
            setSelectedCustomer(updatedUser);
            
          }
        }
      }, [allUsers, isEditingAdminCustomer]);
// =========================================================
      // === 新增：即時監聽每個月的營收小白板 ===
useEffect(() => {
  // 只有管理員需要看這個資料
  if (!db || !isAdminMode) return; 

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript 的月份是 0-11，所以要 +1
  const statsId = `stats_${now.getFullYear()}_${currentMonth}`;

  // 盯著資料庫裡面的這個月小白板
  const unsubscribeStats = db.collection('settings').doc(statsId).onSnapshot(doc => {
    if (doc.exists) {
      setMonthlyStats(doc.data()); // 把雲端算好的數字存進我們剛剛準備的小盒子裡
    } else {
      setMonthlyStats({ monthlyRevenue: 0, orderCount: 0 }); // 如果這個月還沒開市，就先放 0
    }
  });

  return () => unsubscribeStats();
}, [isAdminMode]);

      const mergedCategories = useMemo(() => {
        const map = new Map();
        categoriesList.forEach(c => map.set(c.name, c));
        products.forEach(p => {
          if (!map.has(p.category)) map.set(p.category, { name: p.category, isHidden: false });
        });
        return Array.from(map.values());
      }, [categoriesList, products]);

      const visibleCategoryNames = mergedCategories.filter(c => !c.isHidden).map(c => c.name);
      const adminCategoryNames = mergedCategories.map(c => c.name);

      const displayedTabs = ['全部', ...(isAdminMode && !adminOrderingFor ? adminCategoryNames : visibleCategoryNames)];
      
      const visibleCatNameSet = new Set(visibleCategoryNames);
      const displayedProducts = products.filter(p => {
        const isCatVisible = visibleCatNameSet.has(p.category);
        if (!isAdminMode || adminOrderingFor) {
           if (!isCatVisible) return false;
        }
        if (activeCategory === '全部') return true;
        return p.category === activeCategory;
      });

      const displayedCategories = activeCategory === '全部' ? (isAdminMode && !adminOrderingFor ? adminCategoryNames : visibleCategoryNames) : [activeCategory];

      const candyProducts = products.filter(p => p.category.includes('糖果') || p.category.includes('軟糕'));
      const addonProducts = displayedProducts.filter(p => p.isAddon);

      const updateCart = (id, delta) => {
        setCart(prev => {
          const product = products.find(p => p.id === id);
          const currentQty = prev[id] || 0;
          const newQty = currentQty + delta;

          if (newQty <= 0) { const newCart = { ...prev }; delete newCart[id]; return newCart; }

          // === 新增：限制加購品數量不能超過非加購品(主商品) ===
          if (delta > 0 && product && product.isAddon) {
             let mainQty = 0;
             let addonQty = 0;
             Object.entries(prev).forEach(([cartId, qty]) => {
                const p = products.find(item => item.id === cartId);
                if (p) {
                   if (p.isAddon && cartId !== id) addonQty += qty; // 計算其他加購品
                   if (!p.isAddon) mainQty += qty; // 計算所有主商品
                }
             });
             if ((addonQty + newQty) > mainQty) {
                alert("加購品的總數不能大於主商品的總數喔！");
                return prev;
             }
          }

          // === 新增：減少主商品時，檢查是否會導致加購品超標 ===
          if (delta < 0 && product && !product.isAddon) {
             let newMainQty = 0;
             let addonQty = 0;
             Object.entries({ ...prev, [id]: newQty }).forEach(([cartId, qty]) => {
                const p = products.find(item => item.id === cartId);
                if (p) {
                   if (p.isAddon) addonQty += qty;
                   if (!p.isAddon) newMainQty += qty;
                }
             });
             if (addonQty > newMainQty) {
                alert("無法減少此商品！因為加購品數量會超過主商品數量，請先移除加購品。");
                return prev;
             }
          }
          // ===============================================

          return { ...prev, [id]: newQty };
        });
      };

      const calculateTotals = (itemsList, deliveryWay) => {
        let totalQty = 0; let nonPromoPrice = 0; let promoItemsExpanded = [];
        let totalCost = 0;
        let freeShippingQty = 0;
        let mainProductQty = 0; // 計算非加購品(主商品)的總數量
  let giftCount = 0;      // 應該送幾個贈品
  let appliedGiftId = ''; // 記錄送的贈品品號

        let freeAddonQuota = 0;
        itemsList.forEach(item => {
          if (!item.isAddon && item.providesFreeAddon) {
            freeAddonQuota += item.qty;
          }
        });

        let itemsBaseTotal = 0; // 新增：分開計算小計

        itemsList.forEach(item => {
          totalQty += item.qty;
          totalCost += (Number(item.cost) || 0) * item.qty;
          if (item.isFreeShipping !== false) { freeShippingQty += item.qty; }

          if (item.isAddon) {
            let freeCount = Math.min(item.qty, freeAddonQuota);
            let paidCount = item.qty - freeCount;
            freeAddonQuota -= freeCount;

            item.freeQty = freeCount;
            item.paidQty = paidCount;
            item.subtotal = paidCount * item.price; // 加購品：只算要付費的數量

            nonPromoPrice += item.subtotal;
            itemsBaseTotal += item.subtotal; // 加購品直接變0元，不計入活動折抵
          } else {
            item.subtotal = item.price * item.qty;
            itemsBaseTotal += item.subtotal;
mainProductQty += item.qty;
            if (item.isPromo) {
              for(let i = 0; i < item.qty; i++) promoItemsExpanded.push(item.price);
            } else {
              nonPromoPrice += item.subtotal;
            }
          }
        });

        promoItemsExpanded.sort((a,b) => b - a);
        const promoSets = Math.floor(promoItemsExpanded.length / storeConfig.promoQty);
        const promoTotal = promoSets * storeConfig.promoPrice;
        let remainderTotal = 0;
        for(let i = promoSets * storeConfig.promoQty; i < promoItemsExpanded.length; i++) remainderTotal += promoItemsExpanded[i];

        const currentTotal = nonPromoPrice + promoTotal + remainderTotal;
        const discountAmount = itemsBaseTotal - currentTotal; // 現在這裡只剩下「任選優惠」的折抵了

        if (storeConfig.giftThreshold > 0 && storeConfig.giftProductId) {
    // 只有主商品數量超過門檻才送
    giftCount = Math.floor(mainProductQty / storeConfig.giftThreshold);
    if (giftCount > 0) {
      appliedGiftId = storeConfig.giftProductId;
    }
  }

        let shippingFee = 0;
        if (deliveryWay === 'delivery' && currentTotal < storeConfig.freeShippingThreshold) shippingFee = storeConfig.shippingFee;
        const finalPrice = currentTotal + shippingFee;

        return { totalQty, freeShippingQty, currentTotal, finalPrice, shippingFee, discountAmount, itemsBaseTotal, totalCost, giftCount, appliedGiftId };
      };

      const cartData = useMemo(() => {
  let items = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => p.id === id);
    return product ? { ...product, qty } : null;
  }).filter(Boolean);

  const totals = calculateTotals(items, deliveryMethod);

  // === 處理贈品：將贈品加到 items 陣列最後面 ===
  if (totals.giftCount > 0 && totals.appliedGiftId) {
    const giftProduct = products.find(p => p.id === totals.appliedGiftId);
    if (giftProduct) {
      // 複製一份商品資料，標記為贈品，金額設為 0
      items.push({
        ...giftProduct,
        isGift: true, // 標記這是系統送的贈品
        qty: totals.giftCount,
        subtotal: 0,
        price: 0 // 顯示單價為 0
      });
    }
  }
        return { items, ...totals };
}, [cart, products, storeConfig, deliveryMethod]);


      
      const handleLogout = async () => {
        if (auth) {
          await auth.signOut();
          alert("已成功登出！");
          setSidebarOpen(false);
        }
      };
      const closeLoginModal = () => {
        setShowLoginModal(false)
        setEmailInput('')
        setPasswordInput('')
        setIsRegistering(false)
        if (routeMode === 'cart') {
          setIsCartOpen(true)
        }
      }
      const openCheckoutEntryChoice = () => {
        setLoginMode('customer')
        setShowCheckoutEntryChoice(true)
      }
      const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
      const isValidPhone = (phone) => /^09\d{8}$/.test(String(phone || '').replace(/\D/g, ''))

      const handleAuthSubmit = async () => {
        if (!auth) return alert("請先設定 Firebase 金鑰！");
        try {
          if (isRegistering) {
            if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !emailInput || !passwordInput) {
              return alert("請完整填寫姓名、性別、手機、地址、Email 與密碼（皆為必填）！")
            }
            if (!isValidPhone(customerInfo.phone)) return alert("手機格式不正確，請輸入 09 開頭共 10 碼")
            if (!isValidEmail(emailInput)) return alert("Email 格式不正確，請重新輸入")
            const cred = await auth.createUserWithEmailAndPassword(emailInput, passwordInput);
            await db.collection('users').doc(cred.user.uid).set({ ...customerInfo, email: emailInput, role: 'customer' });
            alert("註冊成功！歡迎加入木子家MUZI MAISON！");
          } else {
            await auth.signInWithEmailAndPassword(emailInput, passwordInput);
            alert("登入成功！");
          }
          closeLoginModal();
        } catch (error) {
          alert(isRegistering ? "註冊失敗：" + error.message : "登入失敗，請檢查帳號密碼！");
        }
      };

      const handleReorderOrder = (order) => {
        if (!order) return
        if (!window.confirm(`確定要重購這筆訂單嗎？\n單號：${order.id}\n（將覆蓋目前購物車）`)) return
        const nextCart = {}
        ;(order.items || []).forEach((item) => {
          if (!item?.id) return
          if (item.isGift) return
          const qty = Number(item.qty) || 0
          if (qty > 0) nextCart[item.id] = qty
        })
        setCart(nextCart)
        setShowMemberProfile(false)
        if (routeMode === 'cart') {
          setIsCartOpen(true)
        } else {
          navigate('/cart')
        }
      }
      const handleReorderLatest = () => {
        const latestOrder = myOrders?.[0] || lastPlacedOrderForReorder
        if (!latestOrder) {
          alert('尚未取得最新訂單資料，請稍候 1-2 秒再試一次')
          return
        }
        handleReorderOrder(latestOrder)
      }

      const handleShareWebsite = async () => {
        const shareData = { title: '木子家MUZI MAISON｜職人手作，純粹養生', text: '推薦給您！嚴選優質堅果、牛軋糖、核桃糕...手作，提供最便利的線上訂購體驗。快來逛逛吧！', url:'https://muzi-maison.netlify.app/?=' };
        if (navigator.share) { try { await navigator.share(shareData); } catch (err) {} } else {
          const fallbackCopy = () => {
            const ta = document.createElement("textarea"); ta.value = shareData.url; ta.style.position = "fixed"; ta.style.left = "-999999px";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); alert("已複製網站連結！"); } catch(e) { alert("請手動複製瀏覽器上方的網址！"); } ta.remove();
          };
          if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(shareData.url).then(() => alert("已複製網站連結！")).catch(() => fallbackCopy()); } else { fallbackCopy(); }
        }
      };

      const handleUpdateMyProfile = async () => {
        if (!customerInfo.name || !customerInfo.phone) return alert("姓名與電話不能為空！");
        if (db && currentUser) {
          try {
            await db.collection('users').doc(currentUser.uid).update(customerInfo);
            alert("個人資料更新成功！"); setIsEditingProfile(false);
          } catch (e) { alert("更新失敗：" + e.message); }
        }
      };

      const handleUpdateCustomerByAdmin = async () => {
        if (!requireAdminAccess()) return;
        if (!selectedCustomer.name || !selectedCustomer.phone) return alert("姓名與電話不能為空！");
        if (db) {
          try {
            if (isNewCustomer) {
               const newId = `CUST${Date.now()}`;
               await db.collection('users').doc(newId).set({
                 name: selectedCustomer.name, phone: selectedCustomer.phone, address: selectedCustomer.address, lineId: selectedCustomer.lineId, gender: selectedCustomer.gender, role: 'customer', email: '', createdAt: firebase.firestore.FieldValue.serverTimestamp()
               });
               await writeAdminLog('admin_customer_saved', {
                 isNew: true,
                 customerId: newId,
                 customerName: selectedCustomer.name,
                 changes: buildFieldChanges({}, selectedCustomer, [
                  { key: 'name', label: '姓名' },
                  { key: 'phone', label: '電話' },
                  { key: 'address', label: '地址' },
                  { key: 'lineId', label: 'LINE ID' },
                  { key: 'gender', label: '性別' }
                 ])
               })
               alert("客戶新增成功！");
            } else {
               const beforeCustomer = allUsers.find(u => u.id === selectedCustomer.id) || {}
               await db.collection('users').doc(selectedCustomer.id).update({
                 name: selectedCustomer.name, phone: selectedCustomer.phone, address: selectedCustomer.address, lineId: selectedCustomer.lineId, gender: selectedCustomer.gender
               });
               await writeAdminLog('admin_customer_saved', {
                 isNew: false,
                 customerId: selectedCustomer.id,
                 customerName: selectedCustomer.name,
                 changes: buildFieldChanges(beforeCustomer, selectedCustomer, [
                  { key: 'name', label: '姓名' },
                  { key: 'phone', label: '電話' },
                  { key: 'address', label: '地址' },
                  { key: 'lineId', label: 'LINE ID' },
                  { key: 'gender', label: '性別' }
                 ])
               })
               alert("客戶資料已更新！");
            }
            setIsEditingAdminCustomer(false);
            setIsNewCustomer(false);
          } catch (e) { alert("儲存失敗：" + e.message); }
        }
      };

      const handleAddCustomerBtn = () => {
        setSelectedCustomer({ id: '', name: '', phone: '', lineId: '', address: '', gender: '女' });
        
        setIsEditingAdminCustomer(true);
        setIsNewCustomer(true);
      };

      const handleDeleteCustomer = async () => {
        if (!requireAdminAccess()) return;
        if(!window.confirm('確定徹底刪除此客戶資料嗎？(該帳號將被停用且無法再次登入)')) return;
        if (db) {
          await db.collection('users').doc(selectedCustomer.id).update({ role: 'deleted' });
          await writeAdminLog('admin_customer_deleted', { customerId: selectedCustomer.id, customerName: selectedCustomer.name || '' })
          alert("客戶帳號已刪除並停用！");
          setSelectedCustomer(null);
          setIsEditingAdminCustomer(false);
        }
      };

      const handleRestoreCustomer = async () => {
        if (!requireAdminAccess()) return;
        if(!window.confirm('確定要恢復此客戶的登入與購物權限嗎？')) return;
        if (db) {
          await db.collection('users').doc(selectedCustomer.id).update({ role: 'customer' });
          await writeAdminLog('admin_customer_restored', { customerId: selectedCustomer.id, customerName: selectedCustomer.name || '' })
          alert("帳號已恢復成功！客戶可以正常登入了。");
          setSelectedCustomer(null);
        }
      };

      const startAdminOrder = (customer) => {
         writeAdminLog('admin_order_session_started', { customerId: customer.id || '', customerName: customer.name || '' })
         setAdminOrderingFor(customer);
         setCustomerInfo({
            name: customer.name || '', phone: customer.phone || '', address: customer.address || '',
            email: customer.email || '', lineId: customer.lineId || '', gender: customer.gender || '女'
         });
         setCart({});
         setShowAdminCustomers(false);
         setSelectedCustomer(null);
         setSidebarOpen(false);
         // 獨立後台網址（/admin/*）下主賣場被隱藏，必須回到首頁才有商品列表與購物車
         navigate('/');
         alert(`已進入「代客建單」模式！\n目前正在幫客戶 [${customer.name}] 選購商品。\n選購完畢後請至購物車結帳送出。`);
      };
      const endAdminOrderSession = () => {
        if (adminOrderingFor) {
          writeAdminLog('admin_order_session_ended', { customerId: adminOrderingFor.id || '', customerName: adminOrderingFor.name || '' })
        }
        setAdminOrderingFor(null)
        setCart({})
      }

      const handleCheckout = async () => {
        if (cartData.totalQty === 0) return;
        if (!currentUser && !adminOrderingFor) return alert("請先登入或註冊會員！");
        if (!customerInfo.name || !customerInfo.phone) return alert("請填寫訂購人姓名與電話！");
        if (!customerInfo.address) return alert("請務必填寫聯絡/收件地址！");
        if (checkoutBankCode && checkoutBankCode.length > 0 && checkoutBankCode.length < 5) return alert("若要直接回報匯款，請輸入完整的後五碼！");
      

        let finalUserId = adminOrderingFor ? adminOrderingFor.id : (currentUser ? currentUser.uid : 'guest');
        const orderId = `MZ${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;
        const initialStatus = (checkoutBankCode && checkoutBankCode.length === 5) ? 'confirming' : 'pending';
        const orderDraftItems = cartData.items
          .filter((item) => !item.isGift)
          .map((item) => ({ ...item }))

        if (db) {
          const batch = db.batch();
          const orderRef = db.collection('orders').doc(orderId);
          batch.set(orderRef, {
            orderId, userId: finalUserId, customerInfo, items: cartData.items,
            totals: { itemsBaseTotal: cartData.itemsBaseTotal, discountAmount: cartData.discountAmount, shippingFee: cartData.shippingFee, finalPrice: cartData.finalPrice, totalCost: cartData.totalCost },
            deliveryMethod, status: initialStatus, bankAccountLast5: checkoutBankCode || '', trackingNumber: '', orderNote, adminDiscount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdByAdmin: !!adminOrderingFor 
          });

         

          await batch.commit();
          setLastPlacedOrderForReorder({ id: orderId, items: orderDraftItems })
        }
try {
          // 1. 將下面的網址替換成你剛剛拿到的 GAS 網頁應用程式網址
          const gasUrl = "https://script.google.com/macros/s/AKfycbzip7O2CRT_pOa2b42iT3QpFNMcmUk--dyoCaMBnq9o4-9kvIpxiBIT9BeQEbmqfBCw/exec"; 
          
          // 2. 打包要傳送的訂單資訊
       const notifyData = {
            orderId: orderId,
            totalAmount: cartData.finalPrice,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            // ⬇️ 這次新增的詳細情報 ⬇️
            deliveryMethod: deliveryMethod === 'delivery' ? '宅配' : '自取',
            address: customerInfo.address,
            // 把購物車明細轉換成簡單的陣列
            items: cartData.items.map(item => ({
              name: item.name,
              qty: item.qty,
              unit: item.unit || '件',
              price: item.price
            }))
          };

          // 3. 發送請求給 GAS (使用 text/plain 繞過瀏覽器嚴格的安全阻擋)
          fetch(gasUrl, {
            method: "POST",
            body: JSON.stringify(notifyData),
            headers: { "Content-Type": "text/plain;charset=utf-8" } 
          }).catch(err => console.log("LINE通知背景發送失敗", err)); // 若失敗只在後台顯示，不打擾客戶

        } catch (e) {
          console.log("LINE通知模組執行錯誤", e);
        }
        setCart({}); setIsCartOpen(false); setOrderNote(''); setCheckoutBankCode(''); 

        if (adminOrderingFor) {
           alert(`成功為客戶 ${adminOrderingFor.name} 建立訂單！`);
           setAdminOrderingFor(null);
           setShowAdminOrders(true);
        } else {
           alert("訂單已成功送出！請於您的訂單列表複製明細並加 LINE 通知我們喔！");
           setCheckoutSuccessInfo({
             orderId,
             customerName: customerInfo.name,
             customerPhone: customerInfo.phone,
             address: customerInfo.address,
             deliveryMethod,
             totalPrice: cartData.finalPrice,
             bankCode: checkoutBankCode || '',
             lineLink: contactData.lineLink || ''
           })
           setShowMemberProfile(true);
        }
      };

      const handleCopyCheckoutTemplate = () => {
        if (!checkoutSuccessInfo) return
        const template = [
          '【木子家 MUZI MAISON 訂單回報】',
          `訂單編號：${checkoutSuccessInfo.orderId}`,
          `訂購人：${checkoutSuccessInfo.customerName}`,
          `聯絡電話：${checkoutSuccessInfo.customerPhone}`,
          `取貨方式：${checkoutSuccessInfo.deliveryMethod === 'delivery' ? '宅配' : '自取'}`,
          `地址：${checkoutSuccessInfo.address}`,
          `總金額：$${checkoutSuccessInfo.totalPrice}`,
          `匯款後五碼：${checkoutSuccessInfo.bankCode || '（尚未填寫）'}`
        ].join('\n')
        const copyFallback = (t) => {
          const ta = document.createElement('textarea')
          ta.value = t
          ta.style.position = 'fixed'
          ta.style.left = '-999999px'
          document.body.appendChild(ta)
          ta.select()
          try { document.execCommand('copy') } catch (e) {}
          ta.remove()
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(template).catch(() => copyFallback(template))
        } else {
          copyFallback(template)
        }
        alert('已複製「訂單編號 + 後五碼」回報模板')
      }

      const handleCopyOrder = (order) => {
        const currentBankCode = bankCodeInputs[order.id] || order.bankAccountLast5;
        if (!currentBankCode || currentBankCode.length < 5) { alert("⚠️ 請先在下方填寫完整的「匯款後五碼」才可複製明細喔！"); return; }
        let text = `*【木子家 MUZI MAISON 新訂單】*\n\n訂單編號：${order.id}\n訂購人：${order.customerInfo.name}\n聯絡電話：${order.customerInfo.phone}\n取貨方式：${order.deliveryMethod === 'delivery' ? '宅配' : '自取'}\n地址：${order.customerInfo.address}\n----------------------\n`;
        order.items.forEach(item => text += `▪️ ${item.name} ${item.weight ? `(${item.weight})` : ''} x ${item.qty} ${item.unit || ''}\n`);
        text += `----------------------\n`;
        if (order.adminDiscount > 0) text += `*手動折扣*：-$${order.adminDiscount}\n`;
        
        text += `*總計金額：$${order.totals.finalPrice}*\n`;
        if (order.bankAccountLast5) { text += `*匯款後五碼*：${order.bankAccountLast5}\n`; }
        if (order.orderNote) { text += `*備註事項*：${order.orderNote}\n`; }
        text += `\n(⚠️ 已於網站送出訂單，請您確認喔！)\n`;

        const copyFallback = (t) => {
          const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.left = "-999999px";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); setCopiedOrderId(order.id); setTimeout(() => setCopiedOrderId(null), 2000); } catch(e) {} ta.remove();
        };
        if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(() => { setCopiedOrderId(order.id); setTimeout(() => setCopiedOrderId(null), 2000); }).catch(() => copyFallback(text)); } else { copyFallback(text); }
      };

      const submitBankCode = async (orderId) => {
        const code = bankCodeInputs[orderId];
        if (!code || code.length < 5) return alert("請輸入完整的後五碼！");
        if (db) { await db.collection('orders').doc(orderId).update({ bankAccountLast5: code, status: 'confirming' }); alert("已送出匯款後五碼，請稍候管理員確認！"); }
      };

      const requestCancelOrder = async (orderOrId) => {
        const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id
        const orderStatus =
          typeof orderOrId === 'string'
            ? (myOrders.find((o) => o.id === orderOrId)?.status || '')
            : (orderOrId?.status || '')
        if (orderStatus && orderStatus !== 'pending') {
          alert('訂單進入「確認中」或之後狀態後，無法再申請取消')
          return
        }
        if (!window.confirm("確定要申請取消此訂單嗎？（需等待管理員同意）")) return;
        if (db) { await db.collection('orders').doc(orderId).update({ status: 'cancel_requested' }); alert("已送出取消申請！"); }
      };

      const updateOrderStatus = async (order, newStatus) => { 
         if (!requireAdminAccess()) return;
         if (!db) return;
         const batch = db.batch();
         const orderRef = db.collection('orders').doc(order.id);

         // 1. 更新訂單本身的狀態
         batch.update(orderRef, { status: newStatus });

         // ==========================================
         // 🌟 終極防呆版：小白板記帳功能 (支援自動退帳與防重複計算)
         // ==========================================
         // 定義哪些狀態算是「有效業績」
         const paidStatuses = ['confirmed', 'shipping', 'shipped', 'completed'];
         
         const isOldPaid = paidStatuses.includes(order.status); // 改變前的狀態有算錢嗎？
         const isNewPaid = paidStatuses.includes(newStatus);    // 改變後的狀態有算錢嗎？

         // 只有在「跨越」算錢界線時（加錢或退錢），才需要去動小白板
         if (isOldPaid !== isNewPaid) {
            
            // 找出這筆訂單是「哪一個月」成立的，去改那個月的小白板 (避免跨月退單算錯月)
            const orderDate = order.createdAt ? order.createdAt.toDate() : new Date();
            const statsId = `stats_${orderDate.getFullYear()}_${orderDate.getMonth() + 1}`;
            const statsRef = db.collection('settings').doc(statsId);

            // 判斷是要加(+)還是減(-)
            // 如果新狀態有算錢就是 +1，如果新狀態沒算錢(退單)就是 -1
            const multiplier = isNewPaid ? 1 : -1;

            // 準備要異動的數字
          // 🌟 修正重點：準備要異動的數字，並「預先建立一個真正的 itemSales 物件」
            let updatePayload = {
               monthlyRevenue: firebase.firestore.FieldValue.increment(order.totals.finalPrice * multiplier),
               orderCount: firebase.firestore.FieldValue.increment(1 * multiplier),
               itemSales: {} // <--- 這裡非常重要！預先準備資料夾
            };

            // 把訂單裡的主商品銷量也加上去或扣除
            order.items.forEach(item => {
               if (!item.isAddon && !item.isGift) {
                  // 🌟 修正重點：改用標準的物件寫法，不用小數點字串
                  updatePayload.itemSales[item.id] = {
                     qty: firebase.firestore.FieldValue.increment(item.qty * multiplier)
                  };
               }
            });

            // 將資料寫入小白板
            batch.set(statsRef, updatePayload, { merge: true });
         }
         // ==========================================

         await batch.commit();
         await writeAdminLog('order_status_updated', {
           orderId: order.id,
           fromStatus: order.status,
           toStatus: newStatus,
           changes: [
             {
               field: 'status',
               label: '訂單狀態',
               before: STATUS_MAP[order.status]?.label || order.status || '（空）',
               after: STATUS_MAP[newStatus]?.label || newStatus || '（空）'
             }
           ]
         })

         // 🌟 修正2：消除視覺假死！手動更新沒有即時連線的「舊訂單」與「搜尋結果」的畫面狀態
         setOldOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
         if (cloudSearchResult && cloudSearchResult.id === order.id) {
            setCloudSearchResult(prev => ({ ...prev, status: newStatus }));
         }
      };
      
      const saveTrackingNumber = async (orderId) => {
        if (!requireAdminAccess()) return;
        const orderBefore = findOrderById(orderId)
        const tracking = String(trackingInputs[orderId] ?? '').trim()
        if (orderBefore?.status === 'shipping' && !tracking) {
          return alert('請輸入物流單號後再儲存，儲存後訂單將更新為「已出貨」。')
        }
        if (!db) return
        const payload = { trackingNumber: tracking }
        if (orderBefore?.status === 'shipping') {
          payload.status = 'shipped'
        }
        await db.collection('orders').doc(orderId).update(payload)
        alert(orderBefore?.status === 'shipping' ? '物流單號已儲存，訂單已標示為「已出貨」。' : '物流單號已儲存！')
        const logChanges = [
          {
            field: 'trackingNumber',
            label: '物流單號',
            before: normalizeLogValue(orderBefore?.trackingNumber),
            after: normalizeLogValue(tracking)
          }
        ]
        if (orderBefore?.status === 'shipping') {
          logChanges.push({
            field: 'status',
            label: '訂單狀態',
            before: STATUS_MAP.shipping?.label || '出貨中',
            after: STATUS_MAP.shipped?.label || '已出貨'
          })
        }
        await writeAdminLog('tracking_number_saved', {
          orderId,
          trackingNumber: tracking,
          changes: logChanges
        })
        setOldOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...payload } : o))
        )
      };
      
      const saveOrderNote = async (orderId) => {
        if (!requireAdminAccess()) return;
        const orderBefore = findOrderById(orderId)
        if (db) { 
          const newNote = adminNoteInputs[orderId] !== undefined ? adminNoteInputs[orderId] : '';
          await db.collection('orders').doc(orderId).update({ orderNote: newNote }); 
          alert("訂單備註已儲存！"); 
          await writeAdminLog('order_note_saved', {
            orderId,
            noteLength: newNote.length,
            changes: [
              {
                field: 'orderNote',
                label: '訂單備註',
                before: normalizeLogValue(orderBefore?.orderNote),
                after: normalizeLogValue(newNote)
              }
            ]
          })
          // 🌟 修正：消除舊訂單的視覺假死
          setOldOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderNote: newNote } : o));
        }
      };

      const saveAdminDiscount = async (order) => {
         if (!requireAdminAccess()) return;
         const discount = Number(adminDiscountInputs[order.id]) || 0;
         const diff = discount - (order.adminDiscount || 0);
         const newFinalPrice = order.totals.finalPrice - diff;
         if (db) { 
            await db.collection('orders').doc(order.id).update({ adminDiscount: discount, 'totals.finalPrice': newFinalPrice }); 
            alert("訂單金額已修改！"); 
            await writeAdminLog('order_discount_saved', {
              orderId: order.id,
              adminDiscount: discount,
              finalPrice: newFinalPrice,
              changes: [
                { field: 'adminDiscount', label: '管理折扣', before: normalizeLogValue(order.adminDiscount || 0), after: normalizeLogValue(discount) },
                { field: 'finalPrice', label: '最終金額', before: normalizeLogValue(order.totals?.finalPrice), after: normalizeLogValue(newFinalPrice) }
              ]
            })
            // 🌟 修正：消除舊訂單的視覺假死
            setOldOrders(prev => prev.map(o => o.id === order.id ? { ...o, adminDiscount: discount, totals: { ...o.totals, finalPrice: newFinalPrice } } : o));
         }
      };

      const deleteOrder = async (orderId) => {
        if (!requireAdminAccess()) return;
        // 🌟 修正1：擴大搜尋範圍，確保不管在新單、舊單還是搜尋結果中，都能找到這張單
        const currentOrders = [...allOrders, ...oldOrders, ...(cloudSearchResult ? [cloudSearchResult] : [])];
        const orderToDelete = currentOrders.find(o => o.id === orderId);
        
        if (!orderToDelete) return alert("找不到此訂單資料");

        // 🌟 修正2：防呆機制！如果訂單有算過錢，阻擋直接刪除！
        const paidStatuses = ['confirmed', 'shipping', 'shipped', 'completed'];
        if (paidStatuses.includes(orderToDelete.status)) {
          return alert("⚠️ 財務防呆警告：\n無法直接刪除「已確認/出貨中/已出貨/已完成」的訂單！\n請先將狀態改為「已取消」(讓系統自動扣除營業額) 後，再進行刪除。");
        }
       
        if (!window.confirm("確定要徹底刪除此訂單嗎？（刪除後無法復原）")) return;
        if (db) await db.collection('orders').doc(orderId).delete();
        await writeAdminLog('order_deleted', { orderId });

        // 🌟 修正3：如果剛好是在「雲端搜尋」模式下刪除的，順便清空畫面
        if (cloudSearchResult && cloudSearchResult.id === orderId) {
           setCloudSearchResult(null);
           setActiveSearchId('');
           setOrderSearchId('');
        }
      };
      const loadMoreOldOrders = async () => {
        if (!db) return;
        
        // 🌟 升級版：動態尋找畫面上的「最後一筆訂單」，用它的時間當作完美書籤！
        const currentList = [...allOrders, ...oldOrders];
        if (currentList.length === 0) return;
        
        const lastOrder = currentList[currentList.length - 1]; // 抓出畫面最後一筆
        
        try {
          const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .startAfter(lastOrder.createdAt) // 🌟 直接使用訂單的建立時間作為游標，精準無縫接軌！
            .limit(50)
            .get(); 

          if (snapshot.empty) {
            alert("已經沒有更早的訂單囉！");
            return;
          }

          const fetchedOldOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setOldOrders(prev => [...prev, ...fetchedOldOrders]);
          
        } catch (error) {
          alert("讀取舊訂單失敗：" + error.message);
        }
      };
// 🌟 新增：雲端精準搜尋單號 (單次讀取，最省效能)
      const handleCloudSearch = () => {
        setActiveSearchId(orderSearchId.trim().toUpperCase());
      };

      // 🌟 新增：專屬的雲端搜尋雷達 (即時監聽單一訂單)
      useEffect(() => {
        // 如果沒有鎖定單號，就清空結果並休息
        if (!db || !activeSearchId) {
          setCloudSearchResult(null);
          return;
        }

        // 開啟這張單的專屬即時連線 (用 onSnapshot 替換掉原本的 get)
        const unsubscribe = db.collection('orders').doc(activeSearchId).onSnapshot(doc => {
          if (doc.exists) {
            setCloudSearchResult({ id: doc.id, ...doc.data() });
          } else {
            alert("雲端資料庫中找不到這筆訂單喔！請確認單號是否正確。");
            setCloudSearchResult(null);
            setActiveSearchId(''); // 找不到就解除鎖定
          }
        }, error => {
          alert("搜尋即時連線失敗：" + error.message);
        });

        // 🌟 超級重要：當離開搜尋、或改搜別張單時，自動切斷舊的連線，避免記憶體外洩！
        return () => unsubscribe();
      }, [activeSearchId]);
      const handleToggleMergeOrder = (orderId) => { setMergeSelection(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]); };

      const handleConfirmMerge = async () => {
        if (mergeSelection.length < 2) return alert("請至少選擇兩筆訂單合併");
        if (!window.confirm("確定要合併這幾筆訂單嗎？系統會將舊訂單刪除，並重新計算總數、運費及折扣，產生一筆新的訂單。")) return;

        const currentOrders = [...allOrders, ...oldOrders, ...(cloudSearchResult ? [cloudSearchResult] : [])];
const ordersToMerge = currentOrders.filter(o => mergeSelection.includes(o.id));
        const combinedItemsMap = {};
        
        let totalAdminDiscount = 0;
        ordersToMerge.forEach(order => {
          
          totalAdminDiscount += (order.adminDiscount || 0);
          order.items.forEach(item => {
            if (combinedItemsMap[item.id]) { combinedItemsMap[item.id].qty += item.qty; } else { combinedItemsMap[item.id] = { ...item }; }
          });
        });
        const newItems = Object.values(combinedItemsMap);
        const combinedNotes = ordersToMerge.map(o => o.orderNote).filter(Boolean).join('\n---\n');

        const baseOrder = ordersToMerge[0]; 
        const newTotals = calculateTotals(newItems, baseOrder.deliveryMethod);
        newTotals.finalPrice -= totalAdminDiscount;
        const newOrderId = `MZ${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;

        try {
          const batch = db.batch();
          const newOrderRef = db.collection('orders').doc(newOrderId);
          batch.set(newOrderRef, {
            orderId: newOrderId, userId: selectedCustomer.id, customerInfo: selectedCustomer, items: newItems,
            totals: { itemsBaseTotal: newTotals.itemsBaseTotal, discountAmount: newTotals.discountAmount, shippingFee: newTotals.shippingFee, finalPrice: newTotals.finalPrice, totalCost: newTotals.totalCost },
            deliveryMethod: baseOrder.deliveryMethod, status: 'pending', bankAccountLast5: '', trackingNumber: '', orderNote: combinedNotes, adminDiscount: totalAdminDiscount,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(), isMerged: true, mergeNote: `系統備註：由舊單號 ${mergeSelection.join(', ')} 合併產生。`
          });
          mergeSelection.forEach(id => { batch.delete(db.collection('orders').doc(id)); });
          await batch.commit();
          alert(`✅ 合併成功！已產生新訂單：${newOrderId}`); setIsMergeMode(false); setMergeSelection([]);
        } catch (error) { alert("合併失敗：" + error.message); }
      };

      const filteredAdminOrders = useMemo(() => {
        // 🌟 如果有雲端精準搜尋的結果，畫面直接「只顯示」這一筆！
        if (cloudSearchResult) {
          return [cloudSearchResult];
        }

        // 🌟 否則，就顯示原本的魔法箱+倉庫箱
        const combinedOrders = [...allOrders, ...oldOrders];
        
        return combinedOrders.filter(order => {
          const matchId = orderSearchId ? order.id.toLowerCase().includes(orderSearchId.toLowerCase()) : true;
          const matchStatus = orderStatusFilter !== 'all' ? order.status === orderStatusFilter : true;
          let matchDate = true;
          if (orderStartDate || orderEndDate) {
            const orderDateObj = order.createdAt ? order.createdAt.toDate() : new Date();
            const compareDate = new Date(orderDateObj.getFullYear(), orderDateObj.getMonth(), orderDateObj.getDate());
            if (orderStartDate) { if (compareDate < new Date(orderStartDate)) matchDate = false; }
            if (orderEndDate) { if (compareDate > new Date(orderEndDate)) matchDate = false; }
          }
          return matchId && matchStatus && matchDate;
        });
      }, [allOrders, oldOrders, cloudSearchResult, orderSearchId, orderStatusFilter, orderStartDate, orderEndDate]); // 🌟 記得這裡多加了 cloudSearchResult

     const downloadOrdersCSV = async () => {
        // 1. 防呆機制：強制要求選擇日期，避免一次下載幾萬筆當機
        if (!orderStartDate || !orderEndDate) {
          return alert("⚠️ 為了保護系統效能，下載明細前請先在上方設定「開始日期」與「結束日期」喔！");
        }

        if (!db) return alert("資料庫尚未連線");

        try {
          alert("正在為您從雲端打包資料，請稍候...");
          
          // 轉換日期格式給 Firebase 看 (包含一整天的時間)
        const start = new Date(`${orderStartDate}T00:00:00`);
          const end = new Date(`${orderEndDate}T23:59:59`);

          // 2. 直接發送單次請求 (.get) 去拿這段時間的所有訂單
          const snapshot = await db.collection('orders')
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(start))
            .where('createdAt', '<=', firebase.firestore.Timestamp.fromDate(end))
            .orderBy('createdAt', 'desc')
            .get();

          if (snapshot.empty) {
            return alert("這段時間內沒有任何訂單可以下載喔！");
          }

          // 3. 開始組合 CSV 內容
          let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
          csvContent += "訂單編號,建立時間,狀態,訂購人,性別,電話,Line ID,取貨方式,地址,商品明細,運費,手動折扣,總金額,總成本,匯款後五碼,出貨單號,買家備註,系統備註\n";

          snapshot.docs.forEach(doc => {
            const o = { id: doc.id, ...doc.data() };
            const date = o.createdAt ? o.createdAt.toDate().toLocaleString() : '';
            const status = STATUS_MAP[o.status]?.label || o.status;
            const itemsStr = o.items.map(i => `${i.name} ${i.weight ? `(${i.weight})` : ''} ($${i.price}) x ${i.qty} ${i.unit || ''}`).join(' ; ');
            
            const row = [
              o.id, date, status, o.customerInfo.name, o.customerInfo.gender || '', o.customerInfo.phone, o.customerInfo.lineId || '',
              o.deliveryMethod === 'delivery' ? '宅配' : '自取', o.customerInfo.address || '',
              itemsStr, o.totals.shippingFee, o.adminDiscount || 0, o.totals.finalPrice, o.totals.totalCost || 0, o.bankAccountLast5 || '', o.trackingNumber || '', o.orderNote || '', o.mergeNote || ''
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
            
            csvContent += row + "\n";
          });

          // 4. 觸發下載，並把檔名加上日期，方便管理
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a"); 
          link.setAttribute("href", encodedUri); 
          link.setAttribute("download", `木子家訂單_${orderStartDate}_至_${orderEndDate}.csv`);
          document.body.appendChild(link); 
          link.click(); 
          document.body.removeChild(link);

        } catch (error) {
          alert("下載失敗：" + error.message);
        }
      };

      // 🌟 終極進化版：前端直出 PDF，完美解決各別訂單獨立頁數的問題！
      // 🌟 終極進化版：陣列分裝法直出 PDF，完美解決文字被裁切，且每筆訂單獨立頁數！
      const handlePrintConfirmedOrders = async () => {
        if (!requireAdminAccess()) return;
        const confirmedOrders = allOrders.filter(o => o.status === 'confirmed');
        if (confirmedOrders.length === 0) return alert("目前沒有「已匯款，確認訂單」狀態的訂單可以列印！");

        alert("⏳ 系統正在為您進行「防裁切排版」並生成高畫質 PDF...\n(若訂單量較多，可能需要數十秒鐘，請勿關閉網頁)");

        // 建立一個隱形的畫布區
        const printContainer = document.createElement('div');
        printContainer.style.position = 'absolute';
        printContainer.style.left = '-9999px';
        printContainer.style.top = '0';
        document.body.appendChild(printContainer);

        try {
          if (!window.jspdf || !window.html2canvas) {
             return alert("PDF 引擎尚未載入完成，請稍後再試一次！");
          }

          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('p', 'mm', 'a4');
          let isVeryFirstPage = true;

          for (const o of confirmedOrders) {
            // --- 1. 計算分頁邏輯 (把很長的商品陣列，切成一塊一塊) ---
            let itemsCopy = [...o.items];
            let chunks = [];
            
            // 第一頁可以放的商品數量 (扣掉表頭與收件資訊)
            const MAX_FIRST_PAGE = 8;
            // 之後每一頁可以放的商品數量
            const MAX_OTHER_PAGE = 10;

            if (itemsCopy.length <= MAX_FIRST_PAGE) {
               chunks.push(itemsCopy);
            } else {
               chunks.push(itemsCopy.splice(0, MAX_FIRST_PAGE));
               while(itemsCopy.length > 0) {
                  chunks.push(itemsCopy.splice(0, MAX_OTHER_PAGE));
               }
            }

            // 檢查最後一頁有沒有足夠的空間放「訂單備註與總計金額」
            // 預估總計區塊大約需要 6 筆商品的高度
            const lastChunk = chunks[chunks.length - 1];
            const maxForLastChunk = chunks.length === 1 ? MAX_FIRST_PAGE : MAX_OTHER_PAGE;
            if (lastChunk.length > (maxForLastChunk - 3)) {
               // 如果最後一頁太滿，就塞一頁空白的專門放總計，避免爆版
               chunks.push([]); 
            }

            const totalPages = chunks.length;

            // --- 2. 逐頁畫出完美的 A4 畫布 ---
            for (let i = 0; i < chunks.length; i++) {
                const chunkItems = chunks[i];
                const isFirstPageOfOrder = (i === 0);
                const isLastPageOfOrder = (i === chunks.length - 1);

                // 設定標準 A4 尺寸的 HTML 容器 (794px * 1123px，完美對應 A4 比例)
                let pageHtml = `
                  <div style="width: 794px; height: 1123px; padding: 40px; box-sizing: border-box; background: #fff; position: relative; font-family: 'Microsoft JhengHei', sans-serif; color: #000;">
                `;

                if (isFirstPageOfOrder) {
                    pageHtml += `
                      <h1 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">木子家MUZI MAISON - 出貨明細單</h1>
                      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em; border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 15px;">
                        <span>訂單編號：${o.id}</span>
                        <span>${o.deliveryMethod === 'delivery' ? '🚚 宅配' : '🏪 自取'}</span>
                      </div>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 1.1em;">
                        <div><strong>收件人：</strong>${o.customerInfo.name}</div>
                        <div><strong>電話：</strong>${o.customerInfo.phone}</div>
                        <div style="grid-column: span 2;"><strong>地址：</strong>${o.customerInfo.address || '無'}</div>
                        <div style="grid-column: span 2;"><strong>Line ID：</strong>${o.customerInfo.lineId || '無'}</div>
                      </div>
                    `;
                } else {
                    pageHtml += `
                      <div style="font-weight: bold; font-size: 1.2em; border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 15px; color: #555;">
                        訂單編號：${o.id} (續)
                      </div>
                    `;
                }

                if (chunkItems.length > 0) {
                    pageHtml += `
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 1em;">
                        <thead>
                          <tr>
                            <th style="border: 1px solid #333; padding: 10px; background: #f0f0f0;">品號</th>
                            <th style="border: 1px solid #333; padding: 10px; background: #f0f0f0;">分類</th>
                            <th style="border: 1px solid #333; padding: 10px; background: #f0f0f0;">商品名稱</th>
                            <th style="border: 1px solid #333; padding: 10px; background: #f0f0f0;">單價</th>
                            <th style="border: 1px solid #333; padding: 10px; background: #f0f0f0;">數量</th>
                            <th style="border: 1px solid #333; padding: 10px; background: #f0f0f0;">小計</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${chunkItems.map(item => `
                            <tr>
                              <td style="border: 1px solid #333; padding: 10px;">${item.id || ''}</td>
                              <td style="border: 1px solid #333; padding: 10px;">${item.category || ''}</td>
                              <td style="border: 1px solid #333; padding: 10px;">${item.name} ${item.weight ? `(${item.weight})` : ''}</td>
                              <td style="border: 1px solid #333; padding: 10px;">$${item.isAddon && item.freeQty > 0 && item.paidQty > 0 ? `${item.freeQty}件$0, ${item.paidQty}件$${item.price}` : (item.subtotal === 0 ? '0' : item.price)}</td>
                              <td style="border: 1px solid #333; padding: 10px;">${item.qty} ${item.unit || ''}</td>
                              <td style="border: 1px solid #333; padding: 10px;">$${item.subtotal !== undefined ? item.subtotal : (item.price * item.qty)}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    `;
                }

                if (isLastPageOfOrder) {
                    pageHtml += `
                      ${o.orderNote ? `<div style="margin-top: 15px; padding: 10px; border: 1px solid #333; background: #fafafa;"><strong>買家/訂單備註：</strong><br/>${o.orderNote.replace(/\n/g, '<br/>')}</div>` : ''}
                      ${o.mergeNote ? `<div style="margin-top: 15px; padding: 10px; border: 1px solid #333; background: #fafafa;"><strong>系統備註：</strong><br/>${o.mergeNote}</div>` : ''}
                      <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #333; text-align: right; font-size: 1.2em;">
                        <div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px;"><span>商品小計：</span><span>$${o.totals.itemsBaseTotal}</span></div>
                        ${o.totals.discountAmount > 0 ? `<div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px; color: #e11d48;"><span>活動折抵：</span><span>-$${o.totals.discountAmount}</span></div>` : ''}
                        ${o.adminDiscount > 0 ? `<div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px; color: #e11d48;"><span>手動折扣：</span><span>-$${o.adminDiscount}</span></div>` : ''}
                        <div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px;"><span>運費：</span><span style="${o.totals.shippingFee === 0 ? 'color: #10b981; font-weight: bold;' : ''}">${o.totals.shippingFee === 0 ? '免運費 ($0)' : `$${o.totals.shippingFee}`}</span></div>
                        <div style="font-weight: bold; font-size: 1.4em; margin-top: 10px;"><span>總計金額：</span><span>$${o.totals.finalPrice}</span></div>
                      </div>
                    `;
                }

                // 🌟 獨立的自製頁尾，精準標示單筆訂單的頁數
                pageHtml += `
                  <div style="position: absolute; bottom: 40px; right: 40px; font-weight: bold; font-size: 16px; color: #555; border-top: 2px solid #333; padding-top: 10px; width: calc(100% - 80px); text-align: right;">
                    📦 訂單編號: ${o.id} &nbsp;&nbsp;|&nbsp;&nbsp; 第 ${i + 1} 頁 / 共 ${totalPages} 頁
                  </div>
                </div>`;

                printContainer.innerHTML = pageHtml;
                // 等待渲染完成
                await new Promise(resolve => setTimeout(resolve, 50)); 

                // 拍照：因為我們已經把容器設定成完美的 A4 比例，所以出來的照片完全不需要再用數學切割！
                const canvas = await html2canvas(printContainer.firstElementChild, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/jpeg', 0.9);

                if (!isVeryFirstPage) {
                   pdf.addPage();
                }
                isVeryFirstPage = false;
                
                // 將照片完整貼滿整張 A4 PDF
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            }
          }

          // === 新增：撿貨清單（品項總表） ===
          const pickMap = new Map()
          confirmedOrders.forEach((o) => {
            ;(o.items || []).forEach((item) => {
              const key = `${item.id || ''}__${item.name || ''}__${item.weight || ''}__${item.unit || ''}__${item.isGift ? 'gift' : ''}`
              const prev = pickMap.get(key) || { ...item, qty: 0 }
              prev.qty += Number(item.qty) || 0
              pickMap.set(key, prev)
            })
          })
          const pickItems = Array.from(pickMap.values()).sort((a, b) => (a.id || '').localeCompare(b.id || ''))
          const pickRoot = document.createElement('div')
          pickRoot.style.width = '794px'
          pickRoot.style.height = '1123px'
          pickRoot.style.padding = '40px'
          pickRoot.style.boxSizing = 'border-box'
          pickRoot.style.background = '#fff'
          pickRoot.style.fontFamily = "'Microsoft JhengHei', sans-serif"
          const title = document.createElement('h1')
          title.textContent = '木子家MUZI MAISON - 撿貨清單（品項總表）'
          title.style.textAlign = 'center'
          title.style.borderBottom = '2px solid #000'
          title.style.paddingBottom = '10px'
          title.style.marginBottom = '16px'
          pickRoot.appendChild(title)
          const subtitle = document.createElement('div')
          subtitle.textContent = `已確認訂單數：${confirmedOrders.length}（產生時間：${new Date().toLocaleString()}）`
          subtitle.style.fontWeight = 'bold'
          subtitle.style.marginBottom = '12px'
          pickRoot.appendChild(subtitle)
          const table = document.createElement('table')
          table.style.width = '100%'
          table.style.borderCollapse = 'collapse'
          table.style.fontSize = '14px'
          const thead = document.createElement('thead')
          const headRow = document.createElement('tr')
          ;['品號', '商品名稱', '重量', '單位', '數量'].forEach((h) => {
            const th = document.createElement('th')
            th.textContent = h
            th.style.border = '1px solid #333'
            th.style.padding = '8px'
            th.style.background = '#f0f0f0'
            headRow.appendChild(th)
          })
          thead.appendChild(headRow)
          table.appendChild(thead)
          const tbody = document.createElement('tbody')
          pickItems.forEach((it) => {
            const tr = document.createElement('tr')
            const cells = [
              it.id || '',
              `${it.name || ''}${it.isGift ? '（贈品）' : ''}`,
              it.weight || '',
              it.unit || '',
              String(it.qty || 0)
            ]
            cells.forEach((val) => {
              const td = document.createElement('td')
              td.textContent = val
              td.style.border = '1px solid #333'
              td.style.padding = '8px'
              tr.appendChild(td)
            })
            tbody.appendChild(tr)
          })
          table.appendChild(tbody)
          pickRoot.appendChild(table)
          printContainer.innerHTML = ''
          printContainer.appendChild(pickRoot)
          await new Promise((resolve) => setTimeout(resolve, 50))
          const pickCanvas = await html2canvas(pickRoot, { scale: 2, useCORS: true })
          const pickImg = pickCanvas.toDataURL('image/jpeg', 0.9)
          pdf.addPage()
          pdf.addImage(pickImg, 'JPEG', 0, 0, 210, 297)

          document.body.removeChild(printContainer);
          pdf.save(`木子家出貨明細單_${new Date().toISOString().split('T')[0]}.pdf`);

          if (db && confirmedOrders.length > 0) {
            const BATCH_LIMIT = 400
            for (let i = 0; i < confirmedOrders.length; i += BATCH_LIMIT) {
              const slice = confirmedOrders.slice(i, i + BATCH_LIMIT)
              const batch = db.batch()
              slice.forEach((o) => {
                batch.update(db.collection('orders').doc(o.id), { status: 'shipping' })
              })
              await batch.commit()
            }
          }

          await writeAdminLog('confirmed_orders_printed', {
            orderCount: confirmedOrders.length,
            markedShipping: confirmedOrders.length
          })
          alert(`PDF 已下載。\n已將本次 ${confirmedOrders.length} 筆訂單更新為「出貨中」（請於訂單管理填寫物流單號後即為「已出貨」）。下次列印不會再重複包含這些訂單。`)
          
        } catch (error) {
          if(printContainer.parentNode) document.body.removeChild(printContainer);
          alert("PDF 產生失敗：" + error.message);
        }
      };

      const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
           if (showDeletedCustomers && user.role !== 'deleted') return false;
           if (!showDeletedCustomers && user.role === 'deleted') return false;
           const matchName = customerSearchName ? user.name?.toLowerCase().includes(customerSearchName.toLowerCase()) : true;
           const matchPhone = customerSearchName ? user.phone?.includes(customerSearchName) : true;
           return customerSearchName ? (matchName || matchPhone) : true;
        });
      }, [allUsers, customerSearchName, showDeletedCustomers]);

      const handleImageUpload = (file, callback, preserveTransparency = false) => {
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = preserveTransparency ? 512 : 800; 
          let width = img.width; let height = img.height;
          if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d'); 
          if (!preserveTransparency) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); } else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
          ctx.drawImage(img, 0, 0, width, height);
          
          // --- 以下為修改的核心區塊 ---
          // 將 Canvas 轉換為 Blob 檔案格式
          const mimeType = preserveTransparency ? 'image/png' : 'image/jpeg';
          canvas.toBlob(async (blob) => {
            if (!blob) return alert("圖片處理失敗！");
            if (!storage) return alert("Firebase Storage 尚未連接！");

            try {
              // 產生一個獨一無二的隨機檔名 (利用時間戳記)
              const fileName = `images/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${preserveTransparency ? 'png' : 'jpg'}`;
              
              // 指向 Firebase Storage 的存放位置
const storageRef = storage.ref().child(fileName);

// 1. 準備快取標籤（設定為 1 年，也就是 31536000 秒）
const metadata = {
  cacheControl: 'public, max-age=31536000'
};

// 2. 執行上傳，並把 metadata 標籤一起掛上去
const uploadTask = await storageRef.put(blob, metadata);
              
              // 上傳成功後，取得公開下載網址
              const downloadURL = await uploadTask.ref.getDownloadURL();
              
              // 把網址回傳給系統，取代掉原本的 Base64
              callback(downloadURL);
              
            } catch (error) {
              console.error("上傳失敗", error);
              alert("圖片上傳失敗：" + error.message);
            }
          }, mimeType, 0.7); // 0.7 是壓縮畫質
          // --- 修改核心區塊結束 ---

        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };

      const createAndUploadThumbFromUrl = async (imageUrl, folder = 'thumbs') => {
        if (!imageUrl) return ''
        if (!storage) throw new Error('Firebase Storage 尚未連接')

        const sourceResp = await fetch(imageUrl)
        if (!sourceResp.ok) throw new Error('無法下載原圖')
        const sourceBlob = await sourceResp.blob()
        let width = 0
        let height = 0
        let drawSource = null
        if (typeof createImageBitmap === 'function') {
          const bitmap = await createImageBitmap(sourceBlob)
          width = bitmap.width
          height = bitmap.height
          drawSource = bitmap
        } else {
          const img = await new Promise((resolve, reject) => {
            const objectUrl = URL.createObjectURL(sourceBlob)
            const image = new Image()
            image.onload = () => {
              URL.revokeObjectURL(objectUrl)
              resolve(image)
            }
            image.onerror = () => {
              URL.revokeObjectURL(objectUrl)
              reject(new Error('圖片解碼失敗'))
            }
            image.src = objectUrl
          })
          width = img.width
          height = img.height
          drawSource = img
        }

        const MAX_WIDTH = 480
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(drawSource, 0, 0, width, height)

        const thumbBlob = await new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.78)
        })
        if (!thumbBlob) throw new Error('縮圖轉換失敗')

        const thumbPath = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`
        const thumbRef = storage.ref().child(thumbPath)
        const uploadTask = await thumbRef.put(thumbBlob, {
          cacheControl: 'public, max-age=31536000, immutable',
          contentType: 'image/webp'
        })
        return uploadTask.ref.getDownloadURL()
      }

      const handleMigrateExistingProductThumbs = async () => {
        if (!requireAdminAccess()) return
        if (imageMigrationRunning) return

        const targets = (products || []).filter((p) => p?.id && p?.image && !p?.thumbUrl)
        if (targets.length === 0) {
          alert('目前沒有需要補齊縮圖的商品')
          return
        }
        if (!window.confirm(`將為 ${targets.length} 項舊商品補齊縮圖，是否開始？`)) return

        setImageMigrationRunning(true)
        let success = 0
        let failed = 0
        try {
          for (let i = 0; i < targets.length; i += 1) {
            const item = targets[i]
            setImageMigrationStatus(`處理中 ${i + 1}/${targets.length}：${item.name || item.id}`)
            try {
              const thumbUrl = await createAndUploadThumbFromUrl(item.image, 'products/thumbs')
              if (db) {
                await db.collection('products').doc(item.id).set({ thumbUrl }, { merge: true })
              }
              success += 1
            } catch (error) {
              console.error('縮圖補齊失敗', item.id, error)
              failed += 1
            }
          }
          await writeAdminLog('product_thumb_migration', { total: targets.length, success, failed })
          setImageMigrationStatus(`完成：成功 ${success}，失敗 ${failed}`)
          alert(`縮圖補齊完成：成功 ${success}，失敗 ${failed}`)
        } finally {
          setImageMigrationRunning(false)
        }
      }

      // --- 以下為新增：處理 PDF 檔案上傳的功能 ---
      const handleFileUpload = async (file) => {
        if (!requireAdminAccess()) return;
        if (!file) return;
        if (file.type !== 'application/pdf') {
          return alert("請上傳 PDF 格式的檔案！");
        }
        if (!storage) return alert("Firebase Storage 尚未連接！");

        try {
          // 給檔案一個帶有時間戳記的名稱，放進 catalogs 資料夾
          const fileName = `catalogs/catalog_${Date.now()}.pdf`;
          const storageRef = storage.ref().child(fileName);
          
          alert("型錄開始上傳，請稍候...");
          // 執行上傳
          const uploadTask = await storageRef.put(file);
          
          // 取得公開下載網址
          const downloadURL = await uploadTask.ref.getDownloadURL();
          
          // 把網址存入資料庫中
          if (db) {
            await db.collection('settings').doc('catalog').set({ url: downloadURL }, { merge: true });
          }
          await writeAdminLog('catalog_uploaded', { fileName: file.name || '', fileSize: file.size || 0 })
          alert("產品型錄上傳成功！");
        } catch (error) {
          console.error("上傳失敗", error);
          alert("上傳失敗：" + error.message);
        }
      };

      // --- 以下為新增：刪除型錄的功能 ---
      const handleDeleteCatalog = async () => {
        if (!requireAdminAccess()) return;
        if (!window.confirm("確定要刪除目前的產品型錄嗎？客戶將無法再下載。")) return;
        if (db) {
          await db.collection('settings').doc('catalog').set({ url: '' }, { merge: true });
          await writeAdminLog('catalog_deleted', {})
          alert("已移除產品型錄！");
        }
      };
      // ------------------------------------------
      
      const onLogoChange = (e) => {
        if (!requireAdminAccess()) return;
        handleImageUpload(e.target.files[0], (img) => db ? db.collection('settings').doc('store').set({ logo: img }, { merge: true }) : setLogo(img), true);
      };
      const openProductDetail = (product) => { setEditingProduct({ intro: '', ingredients: '', notices: '', extraImages: [], isPromo: false, isAddon: false, providesFreeAddon: false, isNew: false, isFreeShipping: true, unit: product.unit || '', cost: 0, ...product }); setMainDisplayImg(product.image || ''); };
      const handleAddProduct = () => { setEditingProduct({ id: '', name: '', desc: '', weight: '', price: 0, cost: 0, category: adminCategoryNames[0] || '精選商品', image: '', intro: '', ingredients: '', notices: '', extraImages: [], isPromo: false, isAddon: false, providesFreeAddon: false, isNew: true, isFreeShipping: true, unit: '' }); setMainDisplayImg(''); };
      
      const saveProductDetail = async () => {
        if (!requireAdminAccess()) return;
        if (editingProduct.isNew && !editingProduct.id.trim()) return alert("請輸入「商品品號」！");
        const prodData = { ...editingProduct, id: editingProduct.id.trim(), price: Number(editingProduct.price) || 0, cost: Number(editingProduct.cost) || 0 };
        delete prodData.isNew;
        const beforeProduct = products.find(p => p.id === prodData.id) || {}
        try {
          if (prodData.image && !prodData.thumbUrl) {
            prodData.thumbUrl = await createAndUploadThumbFromUrl(prodData.image, 'products/thumbs')
          }
          if (db) {
            await db.collection('products').doc(prodData.id).set(prodData)
          }
          alert("商品儲存成功！")
        } catch (error) {
          alert("儲存失敗！可能是圖片檔案過大超過限制。")
          return
        }
        await writeAdminLog('product_saved', {
          productId: prodData.id,
          productName: prodData.name || '',
          changes: buildFieldChanges(beforeProduct, prodData, [
            { key: 'name', label: '商品名稱' },
            { key: 'price', label: '售價' },
            { key: 'cost', label: '成本' },
            { key: 'category', label: '分類' },
            { key: 'unit', label: '單位' },
            { key: 'weight', label: '重量' },
            { key: 'isPromo', label: '促銷商品' },
            { key: 'isAddon', label: '加購商品' },
            { key: 'providesFreeAddon', label: '提供免費加購額度' },
            { key: 'isFreeShipping', label: '計入免運件數' }
          ])
        })
        setEditingProduct(null); 
      };
      
      const handleDeleteProduct = async () => {
        if (!requireAdminAccess()) return;
        if (!window.confirm(`確定刪除「${editingProduct.name}」嗎？無法復原喔！`)) return;
        try {
          if (db) await db.collection('products').doc(editingProduct.id).delete();
          await writeAdminLog('product_deleted', { productId: editingProduct.id, productName: editingProduct.name || '' })
          setEditingProduct(null);
          alert("刪除成功！");
        } catch (error) {
          alert(`刪除失敗！\n錯誤代碼：${error.code}\n錯誤訊息：${error.message}`);
        }
      };

      const saveCategoriesToDB = async (newList) => {
         if (!requireAdminAccess()) return;
         setCategoriesList(newList);
         if (db) await db.collection('settings').doc('categories').set({ list: newList });
      };

      const handleAddCategory = () => {
         if (newCatName && !categoriesList.find(c => c.name === newCatName)) {
           writeAdminLog('category_added', { categoryName: newCatName })
            saveCategoriesToDB([...categoriesList, { name: newCatName, isHidden: false }]);
            setNewCatName('');
         }
      };

      const handleDeleteCategory = (index) => {
         if(!window.confirm('確定刪除此分類？此動作不會刪除商品，但分類將從列表中移除。')) return;
         writeAdminLog('category_deleted', { categoryName: categoriesList[index]?.name || '', index })
         const newList = [...categoriesList];
         newList.splice(index, 1);
         saveCategoriesToDB(newList);
      };

      // --- 編輯分類名稱並連動更新商品 ---
      const handleEditCategoryName = async (index, oldName) => {
        if (!requireAdminAccess()) return;
        // 跳出對話框讓使用者輸入新名稱
        const newName = window.prompt("請輸入新的分類名稱：", oldName);
        
        // 防呆機制：沒輸入、按取消、或是名稱沒改
        if (!newName || newName.trim() === "" || newName.trim() === oldName) return;
        
        const finalNewName = newName.trim();

        // 檢查是否跟現有分類撞名
        if (categoriesList.find(c => c.name === finalNewName)) {
          return alert("此分類名稱已存在！");
        }

        if (!window.confirm(`確定要將「${oldName}」改為「${finalNewName}」嗎？\n\n⚠️ 系統將會自動尋找並更新所有屬於此分類的商品。`)) return;

        try {
          // 1. 更新左側/上方的分類總表清單
          const newList = [...categoriesList];
          newList[index].name = finalNewName;
          setCategoriesList(newList);
          if (db) {
            await db.collection('settings').doc('categories').set({ list: newList });
          }

          // 2. 批次更新商品資料庫裡所有掛著舊分類的商品
          if (db) {
            // 找出所有符合舊分類名稱的商品
            const snapshot = await db.collection('products').where('category', '==', oldName).get();
            
            if (!snapshot.empty) {
              const batch = db.batch();
              snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { category: finalNewName });
              });
              await batch.commit(); // 一口氣送出更新
            }
            await writeAdminLog('category_renamed', {
              from: oldName,
              to: finalNewName,
              affectedProducts: snapshot.empty ? 0 : snapshot.size
            })
          }
          alert(`修改成功！已將分類名稱更新為「${finalNewName}」\n並同步更新了相關商品。`);
        } catch (error) {
          alert(`修改失敗！\n錯誤代碼：${error.code}\n錯誤訊息：${error.message}`);
        }
      };
      // ------------------------------------------

      const moveCategory = (index, direction) => {
         if (direction === -1 && index === 0) return;
         if (direction === 1 && index === categoriesList.length - 1) return;
         const newList = [...categoriesList];
         const temp = newList[index];
         newList[index] = newList[index + direction];
         newList[index + direction] = temp;
         writeAdminLog('category_reordered', { fromIndex: index, toIndex: index + direction, categoryName: temp?.name || '' })
         saveCategoriesToDB(newList);
      };

      const toggleCategoryVisibility = (index) => {
         const newList = [...categoriesList];
         newList[index].isHidden = !newList[index].isHidden;
         writeAdminLog('category_visibility_toggled', { categoryName: newList[index].name, isHidden: newList[index].isHidden })
         saveCategoriesToDB(newList);
      };

      const handleTableFieldChange = (index, field, value) => {
        const newTable = [...tableProducts];
        newTable[index][field] = value;
        setTableProducts(newTable);
      };

      const saveTableItem = async (index) => {
        if (!requireAdminAccess()) return;
        const item = tableProducts[index];
        if (!item.id || !item.id.trim()) return alert("請輸入「商品品號」！");
        if (!window.confirm(`確定要儲存「${item.name || item.id}」的修改嗎？`)) return;

        const prodData = { ...item, id: item.id.trim(), price: Number(item.price) || 0, cost: Number(item.cost) || 0 };
        delete prodData.isNew;
        const beforeProduct = products.find(p => p.id === prodData.id) || {}

        if (db) {
          try {
            await db.collection('products').doc(prodData.id).set(prodData, { merge: true });
            await writeAdminLog('product_saved', {
              productId: prodData.id,
              productName: prodData.name || '',
              changes: buildFieldChanges(beforeProduct, prodData, [
                { key: 'name', label: '商品名稱' },
                { key: 'price', label: '售價' },
                { key: 'cost', label: '成本' },
                { key: 'category', label: '分類' },
                { key: 'unit', label: '單位' },
                { key: 'weight', label: '重量' }
              ])
            })
            alert("商品儲存成功！");
          } catch (error) {
            alert("儲存失敗：" + error.message);
          }
        }
      };
      // --- 批次全部儲存功能 ---
      const saveAllTableItems = async () => {
        if (!requireAdminAccess()) return;
        // 1. 先檢查有沒有新增的商品忘記填寫品號
        const invalidItem = tableProducts.find(item => !item.id || !item.id.trim());
        if (invalidItem) return alert("有商品未填寫「品號」，請檢查後再儲存！");

        if (!window.confirm("確定要儲存表格中所有的變更嗎？")) return;

        if (db) {
          try {
            const batch = db.batch(); // 開啟批次處理
            
            // 2. 把表格中所有的商品都寫入 Batch
            tableProducts.forEach(item => {
              const prodData = { ...item, id: item.id.trim(), price: Number(item.price) || 0, cost: Number(item.cost) || 0 };
              delete prodData.isNew;
              
              const docRef = db.collection('products').doc(prodData.id);
              batch.set(docRef, prodData, { merge: true }); // 使用 merge 覆蓋更新
            });

            // 3. 一次性送出
            await batch.commit();
            
            // 4. 更新畫面狀態，把「新增中 (isNew)」的標籤清掉
            const updatedTable = tableProducts.map(item => {
              const newItem = {...item};
              delete newItem.isNew;
              return newItem;
            });
            setTableProducts(updatedTable);

            alert("✅ 全部商品已成功儲存！");
          } catch (error) {
            alert("批次儲存失敗：" + error.message);
          }
        }
      };

      const deleteTableItem = async (index) => {
        if (!requireAdminAccess()) return;
        const item = tableProducts[index];
        if (!window.confirm(`確定要刪除「${item.name || item.id}」嗎？\n⚠️ 警告：刪除後無法復原喔！`)) return;

        try {
          if (db && !item.isNew) {
            await db.collection('products').doc(item.id).delete();
            await writeAdminLog('product_deleted', { productId: item.id || '', productName: item.name || '' })
          }
          const newTable = [...tableProducts];
          newTable.splice(index, 1);
          setTableProducts(newTable);
          alert("刪除成功！");
        } catch (error) {
          alert(`刪除失敗！\n錯誤代碼：${error.code}\n錯誤訊息：${error.message}`);
          console.error("刪除商品錯誤:", error);
        }
      };

      const addNewTableRow = () => {
        setTableProducts([{ id: '', name: '', desc: '', weight: '', price: 0, cost: 0, category: adminCategoryNames[0] || '精選商品', image: '', intro: '', ingredients: '', notices: '', extraImages: [], isPromo: false, isAddon: false, providesFreeAddon: false, isNew: true, isFreeShipping: true, unit: '' }, ...tableProducts]);
      };
      // --- 批次匯入 CSV 功能 (方案 A：覆蓋更新 + 自動註冊分類) ---
      const handleCSVImport = async (e) => {
        if (!requireAdminAccess()) return;
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          const text = event.target.result;
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          if (lines.length < 2) return alert('檔案內容格式錯誤或沒有資料！');

          if (!window.confirm(`即將匯入 ${lines.length - 1} 筆資料。\n\n⚠️ 如果品號已存在，將會「覆蓋」現有表格資料。\n確定要執行嗎？`)) {
             e.target.value = ''; 
             return;
          }

          const batch = db.batch();
          let importCount = 0;
          const importedCategoryNames = new Set(); // 用來收集 Excel 裡出現的所有分類

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length < 12) continue; 

            const id = cols[0].trim();
            if (!id) continue;

            const categoryName = cols[2].trim();
            if (categoryName) importedCategoryNames.add(categoryName); // 把分類名稱存起來

            const prodData = {
              id: id,
              name: cols[1].trim(),
              category: categoryName,
              desc: cols[3].trim(),
              unit: cols[4].trim(),
              price: Number(cols[5]) || 0,
              cost: Number(cols[6]) || 0,
              weight: cols[7].trim(),
              isFreeShipping: cols[8].trim() === '是',
              isPromo: cols[9].trim() === '是',
              isAddon: cols[10].trim() === '是',
              providesFreeAddon: cols[11] ? cols[11].trim() === '是' : false,
            };

            const docRef = db.collection('products').doc(id);
            batch.set(docRef, prodData, { merge: true });
            importCount++;
          }

          // 檢查 Excel 裡的分類，有沒有哪些是「分類總表」裡面還沒有的？
          const existingCatNames = categoriesList.map(c => c.name);
          const newCatsToAdd = Array.from(importedCategoryNames).filter(c => !existingCatNames.includes(c));

          try {
            await batch.commit(); // 儲存所有商品
            
            // 如果有發現新分類，自動把它們加進分類總表資料庫
            if (newCatsToAdd.length > 0 && db) {
               const updatedCats = [...categoriesList, ...newCatsToAdd.map(name => ({ name, isHidden: false }))];
               await db.collection('settings').doc('categories').set({ list: updatedCats });
            }

            alert(`✅ 成功匯入/更新了 ${importCount} 筆商品資料！\n系統已同步更新商品與分類列表。`);
            await writeAdminLog('products_csv_imported', { importCount, newCategoriesAdded: newCatsToAdd.length })
            setShowProductTable(false); 
          } catch (error) {
            alert(`匯入失敗！\n錯誤代碼：${error.code}\n錯誤訊息：${error.message}`);
          }
        };
        reader.readAsText(file, 'UTF-8');
        e.target.value = ''; 
      };

      // --- 批次匯出 CSV 功能 ---
      const handleCSVExport = () => {
        if (tableProducts.length === 0) return alert("目前沒有商品可以匯出！");
        writeAdminLog('products_csv_exported', { exportCount: tableProducts.length })
        
        // 1. 準備 CSV 的標題列 (BOM \uFEFF 是為了解決 Excel 中文亂碼)
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "品號,商品名稱,分類,簡介,單位,售價,成本,重量,計入免運,優惠活動,加購商品,送加購額度\n";

        // 2. 依序把表格內的商品轉成 CSV 格式
        tableProducts.forEach(item => {
          const row = [
            item.id || '',
            item.name || '',
            item.category || '',
            item.desc || '',
            item.unit || '',
            item.price || 0,
            item.cost || 0,
            item.weight || '',
            item.isFreeShipping !== false ? '是' : '否',
            item.isPromo ? '是' : '否',
            item.isAddon ? '是' : '否',
            item.providesFreeAddon ? '是' : '否'
          ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','); // 處理內文可能有逗號的問題
          
          csvContent += row + "\n";
        });

        // 3. 觸發下載
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `商品總覽_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      // ------------------------------------------

     const saveSystemConfig = async () => {
  if (!requireAdminAccess()) return;
  const configToSave = { 
    shippingFee: Number(tempConfig.shippingFee)||0, 
    freeShippingThreshold: Number(tempConfig.freeShippingThreshold)||0, 
    promoQty: Number(tempConfig.promoQty)||1, 
    promoPrice: Number(tempConfig.promoPrice)||0, 
    wholesaleThreshold: Number(tempConfig.wholesaleThreshold)||0, 
    freeAddonReminderMsg: tempConfig.freeAddonReminderMsg || '',
    giftThreshold: Number(tempConfig.giftThreshold)||0, // 加入滿幾件送
    giftProductId: tempConfig.giftProductId || '' // 加入贈品品號
  };
  const configLabels = {
    shippingFee: '運費',
    freeShippingThreshold: '免運門檻',
    promoQty: '促銷組數門檻',
    promoPrice: '促銷組合價',
    wholesaleThreshold: '批發門檻',
    freeAddonReminderMsg: '加購提醒文字',
    giftThreshold: '滿額贈門檻',
    giftProductId: '贈品品號'
  }
  const configChanges = Object.keys(configToSave)
    .filter((key) => storeConfig?.[key] !== configToSave[key])
    .map((key) => ({
      field: key,
      label: configLabels[key] || key,
      before: normalizeLogValue(storeConfig?.[key]),
      after: normalizeLogValue(configToSave[key])
    }))
  if (db) await db.collection('settings').doc('config').set(configToSave, { merge: true });
  await writeAdminLog('system_config_updated', { keys: Object.keys(configToSave), changes: configChanges })
  setStoreConfig(configToSave); setShowConfigModal(false);
};

      const saveContactInfo = async () => {
        if (!requireAdminAccess()) return;
        if (db) await db.collection('settings').doc('contact').set(contactData, { merge: true });
        await writeAdminLog('contact_info_updated', {
          hasPhone: !!contactData.phone,
          hasAddress: !!contactData.address,
          hasLineLink: !!contactData.lineLink
        })
        setShowContactModal(false);
      };

      const saveAboutInfo = async () => {
        if (!requireAdminAccess()) return;
        if (db) { try { await db.collection('settings').doc('about').set(tempAboutData, { merge: true }); alert('「關於我們」已成功儲存！'); } catch (error) { alert('儲存失敗！可能是圖片過大。'); return; } }
        await writeAdminLog('about_info_updated', {
          title: tempAboutData?.title || '',
          changes: buildFieldChanges(aboutData || {}, tempAboutData || {}, [
            { key: 'title', label: '標題' },
            { key: 'content', label: '內容' },
            { key: 'image', label: '圖片連結' }
          ])
        })
        setIsEditingAbout(false);
      };

      const saveAnnouncement = async () => {
         if (!requireAdminAccess()) return;
         let newList = [...announcements];
         if (tempAnnounce.id) {
            newList = newList.map(a => a.id === tempAnnounce.id ? tempAnnounce : a);
         } else {
            newList.push({ ...tempAnnounce, id: Date.now().toString() });
         }
         if (db) { await db.collection('settings').doc('announcements').set({ list: newList }); alert("公告已儲存！"); setIsEditingAnnounce(false); }
         await writeAdminLog('announcement_saved', {
           id: tempAnnounce.id || 'new',
           title: tempAnnounce.title || '',
           changes: buildFieldChanges(
             announcements.find(a => a.id === tempAnnounce.id) || {},
             tempAnnounce,
             [
               { key: 'title', label: '公告標題' },
               { key: 'content', label: '公告內容' },
               { key: 'isActive', label: '是否啟用' },
               { key: 'showOnLoad', label: '是否進站彈出' },
               { key: 'isPermanent', label: '是否永久顯示' },
               { key: 'expireDate', label: '到期日' }
             ]
           )
         })
      };

      const deleteAnnouncement = async (id) => {
         if (!requireAdminAccess()) return;
         if(!window.confirm('確定刪除此公告？')) return;
         const newList = announcements.filter(a => a.id !== id);
         if (db) await db.collection('settings').doc('announcements').set({ list: newList });
         await writeAdminLog('announcement_deleted', { id })
      };

      const moveAnnounce = async (index, direction) => {
         if (!requireAdminAccess()) return;
         if (direction === -1 && index === 0) return;
         if (direction === 1 && index === announcements.length - 1) return;
         const newList = [...announcements];
         const temp = newList[index];
         newList[index] = newList[index + direction];
         newList[index + direction] = temp;
         setAnnouncements(newList); 
         if (db) await db.collection('settings').doc('announcements').set({ list: newList });
         await writeAdminLog('announcement_reordered', { fromIndex: index, direction })
      };

      const myOrders = currentUser ? allOrders.filter(o => o.userId === currentUser.uid) : [];
      const isAnnounceExpired = (ann) => !ann.isPermanent && ann.expireDate && new Date() > new Date(ann.expireDate);

      if (isAppLoading) {
        return (
          <div className="min-h-screen bg-[#Fdfbf7] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-stone-500 font-bold tracking-widest text-sm animate-pulse">系統載入中...</p>
          </div>
        );
      }

      if (routeMode === 'product') {
        if (!productFromRoute) {
          return (
            <div className="min-h-screen bg-[#Fdfbf7] flex flex-col items-center justify-center p-6 text-center">
              <h1 className="text-2xl font-black text-stone-800 mb-2">找不到此商品</h1>
              <p className="text-stone-500 mb-6">品號：{routeProductId || '未提供'}</p>
              <Link to="/" className="bg-stone-800 text-white px-5 py-2.5 rounded-xl font-bold">回到首頁</Link>
            </div>
          )
        }

        const routeProduct = editingProduct && editingProduct.id === productFromRoute.id
          ? editingProduct
          : productFromRoute
        const galleryImages = [routeProduct.image, ...(routeProduct.extraImages || [])].filter(Boolean)
        const currentImage = mainDisplayImg || routeProduct.image

        return (
          <div className="min-h-screen bg-[#Fdfbf7] p-2 md:p-6">
            <div className="max-w-5xl mx-auto bg-[#Fdfbf7] w-full rounded-3xl h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-100">
              <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-sm">
                <Link to="/" className="text-sm font-bold text-stone-600 hover:text-stone-900">← 返回首頁</Link>
                <h2 className="font-bold text-stone-800 flex-1 text-center truncate px-3">{routeProduct.name}</h2>
                <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded">品號：{routeProduct.id}</span>
              </div>

              <div className="flex-1 overflow-y-auto md:flex md:flex-row">
                <div className="md:w-1/2 md:border-r border-stone-200 flex flex-col">
                  <div className="w-full h-64 md:h-80 bg-stone-200 flex-shrink-0 relative">
                    {currentImage ? (
                      <img src={currentImage} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                        <ImageIcon size={48} opacity={0.5} />
                      </div>
                    )}
                  </div>
                  {galleryImages.length > 0 && (
                    <div className="flex gap-2 p-4 overflow-x-auto [&::-webkit-scrollbar]:hidden bg-white shadow-sm relative z-0">
                      {galleryImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          onClick={() => setMainDisplayImg(img)}
                          className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${
                            currentImage === img ? 'border-amber-500' : 'border-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:w-1/2 p-5 space-y-5">
                  <div>
                    {routeProduct.isPromo && <span className="inline-block bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 mr-2 border border-rose-200">享任選優惠活動</span>}
                    {routeProduct.isAddon && <span className="inline-block bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 border border-purple-200">可做為加購商品</span>}
                    <div className="text-3xl font-bold text-amber-600 mb-1">
                      ${routeProduct.price}{' '}
                      {routeProduct.unit && <span className="text-sm font-normal text-stone-500">/{routeProduct.unit}</span>}
                    </div>
                    <h1 className="text-2xl font-bold text-stone-800">{routeProduct.name}</h1>
                    {routeProduct.desc && <p className="text-sm text-stone-500 mt-1">{routeProduct.desc}</p>}
                  </div>
                  <hr className="border-stone-200" />

                  {routeProduct.intro && (
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-stone-700 flex items-center gap-1"><span className="w-1 h-4 bg-amber-500 rounded-full"></span>產品介紹</h3>
                      <p className="text-sm text-stone-600 whitespace-pre-wrap">{routeProduct.intro}</p>
                    </div>
                  )}
                  {routeProduct.ingredients && (
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-stone-700 flex items-center gap-1"><span className="w-1 h-4 bg-emerald-500 rounded-full"></span>產品成分</h3>
                      <p className="text-sm text-stone-600 whitespace-pre-wrap">{routeProduct.ingredients}</p>
                    </div>
                  )}
                  {routeProduct.weight && (
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-stone-700 flex items-center gap-1"><span className="w-1 h-4 bg-blue-500 rounded-full"></span>產品重量</h3>
                      <p className="text-sm text-stone-600">{routeProduct.weight}</p>
                    </div>
                  )}
                  {routeProduct.notices && (
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-stone-700 flex items-center gap-1"><span className="w-1 h-4 bg-rose-500 rounded-full"></span>注意事項</h3>
                      <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-sm whitespace-pre-wrap">{routeProduct.notices}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white border-t border-stone-200">
                <div className="flex gap-4">
                  <div className="flex items-center gap-4 bg-stone-50 rounded-xl px-4 py-3 border border-stone-200 flex-1 justify-center">
                    <button onClick={() => updateCart(routeProduct.id, -1)} className="p-1 text-stone-500"><Minus size={18} /></button>
                    <span className="w-6 text-center text-lg font-bold">{cart[routeProduct.id] || 0}</span>
                    <button onClick={() => updateCart(routeProduct.id, 1)} className="p-1 text-amber-600"><Plus size={18} /></button>
                  </div>
                  <Link to="/cart" className="flex-[1.5] bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg text-center active:scale-95 transition-transform">前往購物車</Link>
                </div>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto bg-[#Fdfbf7] min-h-screen relative font-sans text-stone-800 shadow-xl overflow-hidden flex flex-col">
          
          {!standaloneAdminPage && (
          <>
          {/* Sidebar */}
          <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}>
            <div className={`absolute left-0 top-0 bottom-0 w-64 bg-[#Fdfbf7] shadow-xl transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
               <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white">
                  <h2 className="font-bold text-stone-800 tracking-wider">木子家Muzi Maison選單</h2>
                  <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={24} /></button>
               </div>
               <div className="flex-1 overflow-y-auto py-4">
                  <ul className="space-y-1">
                     <li><button onClick={() => { setSidebarOpen(false); setShowAboutModal(true); }} className="w-full text-left px-6 py-3 hover:bg-amber-50 font-medium text-stone-700 flex items-center gap-3"><Info size={18}/>關於我們</button></li>
                    <li><button onClick={() => { setSidebarOpen(false); setShowCatalogModal(true); }} className="w-full text-left px-6 py-3 hover:bg-blue-50 font-medium text-stone-700 flex items-center gap-3"><DownloadIcon size={18}/>產品型錄</button></li>
                     <li><button onClick={() => { setSidebarOpen(false); setShowContactModal(true); }} className="w-full text-left px-6 py-3 hover:bg-amber-50 font-medium text-stone-700 flex items-center gap-3"><Phone size={18}/>聯絡我們</button></li>
                     <li><button onClick={() => { setSidebarOpen(false); handleShareWebsite(); }} className="w-full text-left px-6 py-3 hover:bg-emerald-50 font-medium text-stone-700 flex items-center gap-3"><Share2 size={18}/>分享商店</button></li>
                     
                     <li className="my-2 border-t border-stone-200"></li>
                     
                     {currentUser && !isAdminMode && (
                        <li><Link to="/member" onClick={() => setSidebarOpen(false)} className="w-full text-left px-6 py-3 hover:bg-stone-100 font-bold text-stone-800 flex items-center gap-3"><UserIcon size={18}/>會員中心</Link></li>
                     )}
                     
                     {isAdminMode && (
                        <>
                           <li className="px-6 py-2 text-xs font-bold text-stone-400 uppercase tracking-widest mt-2">管理員專區</li>
                          <li><Link to="/admin/dashboard" onClick={() => setSidebarOpen(false)} className="w-full text-left px-6 py-3 hover:bg-indigo-50 font-medium text-indigo-700 flex items-center gap-3"><TrendingUp size={18}/>營運儀表板</Link></li> 
                          <li><Link to="/admin/customers" onClick={() => setSidebarOpen(false)} className="w-full text-left px-6 py-3 hover:bg-blue-50 font-medium text-blue-700 flex items-center gap-3"><UsersIcon size={18}/>客戶管理</Link></li>
                           <li><Link to="/admin/orders" onClick={() => setSidebarOpen(false)} className="w-full text-left px-6 py-3 hover:bg-amber-50 font-medium text-amber-700 flex items-center gap-3"><ClipboardList size={18}/>訂單管理</Link></li>
                          <li><Link to="/admin/products" onClick={() => setSidebarOpen(false)} className="w-full text-left px-6 py-3 hover:bg-emerald-50 font-medium text-emerald-700 flex items-center gap-3"><ClipboardList size={18}/>商品總覽編輯(表單)</Link></li>
                           <li><button onClick={() => { setSidebarOpen(false); setTempConfig(storeConfig); setShowConfigModal(true); }} className="w-full text-left px-6 py-3 hover:bg-rose-50 font-medium text-rose-700 flex items-center gap-3"><SettingsIcon size={18}/>系統設定</button></li>
                           <li><button onClick={() => { setSidebarOpen(false); setTempAnnounce({}); setIsEditingAnnounce(false); setShowAnnounceConfig(true); }} className="w-full text-left px-6 py-3 hover:bg-purple-50 font-medium text-purple-700 flex items-center gap-3"><Megaphone size={18}/>公告設定</button></li>
                        </>
                     )}
                  </ul>
               </div>
               <div className="p-4 border-t border-stone-200 bg-stone-50">
                  <button onClick={() => { if (currentUser) { handleLogout(); } else { setSidebarOpen(false); setLoginMode('customer'); setShowLoginModal(true); } }} className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${currentUser ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-stone-800 text-white shadow-md'}`}>
                     {currentUser ? <LogOut size={16} /> : <UserIcon size={16} />} {currentUser ? '登出' : '會員登入'}
                  </button>
               </div>
            </div>
          </div>

          {/* 代建單橫幅 */}
          {adminOrderingFor && (
            <div className="bg-amber-600 text-white px-4 py-2.5 flex justify-between items-center text-sm font-bold z-30 relative shadow-md">
              <span className="flex items-center gap-2"><ShoppingCart size={16}/> 正在為 {adminOrderingFor.name} 代建單...</span>
              <button onClick={endAdminOrderSession} className="bg-amber-700 px-3 py-1 rounded-md hover:bg-amber-800 transition-colors">取消代建</button>
            </div>
          )}

          {/* Header */}
          <div className="sticky top-0 z-20 bg-white shadow-sm">
            <header className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 relative">
                <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"><Menu size={24} /></button>
                <label className={`relative block h-28 min-w-[6rem] max-w-[300px] flex items-center justify-center ${isAdminMode && !adminOrderingFor ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 p-1 rounded-lg border border-dashed border-stone-300' : ''}`}>
                  {logo ? <img src={logo} alt="Logo" loading="eager" decoding="async" fetchPriority="high" className="max-w-full max-h-full object-contain" /> : <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"><Store size={20} className="text-amber-700" /></div>}
                  {isAdminMode && !adminOrderingFor && <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg"><Camera size={18} className="text-white" /></div>}
                  {isAdminMode && !adminOrderingFor && <input type="file" accept="image/*" className="hidden" onChange={onLogoChange} />}
                </label>
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <h1 className="text-xl font-bold tracking-wider text-stone-700">木子家</h1>
                    {isAdminMode && !adminOrderingFor ? (
                      <input type="text" value={storeSlogan} onChange={e => { if (!requireAdminAccess()) return; setStoreSlogan(e.target.value); if(db) db.collection('settings').doc('store').set({slogan: e.target.value}, {merge:true}); }} className="text-xs text-stone-500 bg-stone-100 border border-stone-200 rounded px-1 py-0.5 outline-none focus:border-amber-400 w-48" placeholder="輸入品牌標語..." />
                    ) : (
                      <span className="text-xs text-stone-500 font-medium">{storeSlogan}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 font-semibold tracking-widest uppercase mt-0.5">Muzi Maison</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentUser && !isAdminMode && (
                  <Link to="/member" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-stone-800 text-white hover:bg-stone-700 transition-colors shadow-sm">
                    <UserIcon size={14} /> 我的帳號
                  </Link>
                )}
                {!currentUser && !adminOrderingFor && (
                  <button onClick={() => { setLoginMode('customer'); setShowLoginModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm bg-stone-100 text-stone-500 hover:bg-stone-200">
                     <UserIcon size={14} /> 會員登入
                  </button>
                )}
              </div>
            </header>

            {/* 公告列 */}
            {announcements.filter(a => a.isActive && !isAnnounceExpired(a)).map(ann => (
               <div key={ann.id} onClick={() => { setViewingAnnounce(ann); setShowAnnouncementModal(true); }} className="mx-4 mt-2 mb-1 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm animate-pulse-slow">
                  <Megaphone size={18} className="shrink-0"/> <span className="truncate">{ann.title}</span>
               </div>
            ))}

            <div className="px-4 py-3 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {displayedTabs.map(category => {
                const catObj = mergedCategories.find(c => c.name === category);
                const isHidden = catObj?.isHidden;
                return (
                  <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center ${activeCategory === category ? 'bg-stone-800 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                    {category} {isHidden && <EyeOff size={14} className="inline ml-1 mb-0.5 opacity-60" />}
                  </button>
                );
              })}
            </div>
          </div>

          <main className="flex-1 overflow-y-auto pb-24 px-4">
           {/* --- 首頁客戶端熱銷排行榜 (公用看板版) --- */}
            {(!isAdminMode || adminOrderingFor) && publicTopSellers.items && publicTopSellers.items.length >= 3 && activeCategory === '全部' && (
              <div className="mt-6 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div>
                <h2 className="text-lg font-black mb-6 text-stone-800 flex items-center gap-2 justify-center">
                  <TrendingUp size={20} className="text-amber-500"/> {publicTopSellers.label}人氣熱銷 Top 5
                </h2>

                {/* 頒獎台設計 (Top 3) */}
                <div className="flex justify-center items-end gap-4 md:gap-10 mb-8 mt-10">
                  {/* 第二名 */}
                  <div onClick={() => { rememberHomeScroll(); navigate(`/product/${publicTopSellers.items[1].id}`) }} className="flex flex-col items-center w-1/3 max-w-[130px] md:max-w-[160px] z-0 cursor-pointer group">
                     <div className="relative w-20 h-20 md:w-28 md:h-28 mb-3">
                        <img src={publicTopSellers.items[1].thumbUrl || publicTopSellers.items[1].image} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover rounded-full border-4 border-slate-200 shadow-md transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white text-[11px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">2</div>
                     </div>
                     <span className="text-xs md:text-sm font-bold text-stone-700 w-full text-center px-1 group-hover:text-amber-600 transition-colors leading-snug break-words">{publicTopSellers.items[1].name}</span>
                     <div className="w-full bg-gradient-to-b from-slate-100 to-white h-20 md:h-24 rounded-t-2xl mt-3 flex items-start justify-center pt-3 border-t-4 border-slate-300 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] group-hover:bg-slate-50 transition-colors">
                        <span className="text-slate-500 font-black text-sm md:text-base">{publicTopSellers.items[1].percentage}%</span>
                     </div>
                  </div>

                  {/* 第一名 */}
                  <div onClick={() => { rememberHomeScroll(); navigate(`/product/${publicTopSellers.items[0].id}`) }} className="flex flex-col items-center w-1/3 max-w-[150px] md:max-w-[180px] z-10 cursor-pointer group">
                     <div className="relative w-24 h-24 md:w-32 md:h-32 mb-3">
                        <img src={publicTopSellers.items[0].thumbUrl || publicTopSellers.items[0].image} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover rounded-full border-4 border-amber-400 shadow-xl transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-sm font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm">1</div>
                     </div>
                     <span className="text-sm md:text-base font-black text-stone-800 w-full text-center px-1 group-hover:text-amber-600 transition-colors leading-snug break-words">{publicTopSellers.items[0].name}</span>
                     <div className="w-full bg-gradient-to-b from-amber-50 to-white h-28 md:h-36 rounded-t-2xl mt-3 flex items-start justify-center pt-3 border-t-4 border-amber-400 shadow-[0_-4px_15px_rgba(251,191,36,0.2)] group-hover:bg-amber-100/50 transition-colors">
                        <span className="text-amber-600 font-black text-xl md:text-2xl">{publicTopSellers.items[0].percentage}%</span>
                     </div>
                  </div>

                  {/* 第三名 */}
                  <div onClick={() => { rememberHomeScroll(); navigate(`/product/${publicTopSellers.items[2].id}`) }} className="flex flex-col items-center w-1/3 max-w-[130px] md:max-w-[160px] z-0 cursor-pointer group">
                     <div className="relative w-20 h-20 md:w-28 md:h-28 mb-3">
                        <img src={publicTopSellers.items[2].thumbUrl || publicTopSellers.items[2].image} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover rounded-full border-4 border-orange-200 shadow-md transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute -bottom-1 -right-1 bg-orange-400 text-white text-[11px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">3</div>
                     </div>
                     <span className="text-xs md:text-sm font-bold text-stone-700 w-full text-center px-1 group-hover:text-amber-600 transition-colors leading-snug break-words">{publicTopSellers.items[2].name}</span>
                     <div className="w-full bg-gradient-to-b from-orange-50 to-white h-16 md:h-20 rounded-t-2xl mt-3 flex items-start justify-center pt-3 border-t-4 border-orange-300 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] group-hover:bg-orange-50 transition-colors">
                        <span className="text-orange-600 font-black text-sm md:text-base">{publicTopSellers.items[2].percentage}%</span>
                     </div>
                  </div>
                </div>

                {/* 第四名與第五名 (列表) */}
                {publicTopSellers.items.length > 3 && (
                  <div className="space-y-2 pt-4 border-t border-stone-100">
                     {publicTopSellers.items.slice(3, 5).map((item, index) => (
                       <div key={item.id || `${item.name}-${index}`} onClick={() => { rememberHomeScroll(); navigate(`/product/${item.id}`) }} className="flex items-center gap-3 bg-stone-50/50 p-2 rounded-xl border border-stone-100 hover:bg-amber-50 cursor-pointer transition-all duration-300 group">
                           <span className="text-stone-300 font-black w-4 text-center group-hover:text-amber-400 transition-colors">{index + 4}</span>
                           <img src={item.thumbUrl || item.image} loading="eager" decoding="async" fetchPriority="high" className="w-10 h-10 object-cover rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105" />
                           <span className="flex-1 text-sm font-bold text-stone-700 truncate group-hover:text-amber-700 transition-colors">{item.name}</span>
                           <span className="text-xs font-black bg-white px-2 py-1 rounded shadow-sm text-stone-500 border border-stone-100 group-hover:border-amber-200 group-hover:text-amber-600 transition-colors">{item.percentage}%</span>
                        </div>
                     ))}
                  </div>
                )}
              </div>
            )}
            {isAdminMode && !adminOrderingFor && (
              <button onClick={handleAddProduct} className="w-full mt-4 bg-white border-2 border-dashed border-stone-300 rounded-2xl p-4 text-stone-500 font-bold flex flex-col items-center justify-center gap-2 hover:border-amber-500 hover:text-amber-600 transition-colors">
                <div className="bg-stone-100 p-2 rounded-full"><Plus size={24} /></div> 新增商品
              </button>
            )}

            {displayedCategories.map(category => (
              <div key={category} className="mt-6">
                <h2 className="text-lg font-bold mb-3 text-stone-700 flex items-center gap-2 border-b border-stone-200 pb-1">
                  {category} 
                  {mergedCategories.find(c => c.name === category)?.isHidden && <span className="text-xs font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded ml-2">隱藏分類</span>}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {displayedProducts.filter(p => p.category === category).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAdminMode={isAdminMode}
                      adminOrderingFor={adminOrderingFor}
                      cartQty={cart[product.id] || 0}
                      onOpenDetail={() => openProductDetail(product)}
                      onUpdateCart={(delta) => updateCart(product.id, delta)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </main>

          {/* 商品編輯/詳情 */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/60 backdrop-blur-sm">
              <div className="bg-[#Fdfbf7] w-full max-w-md md:max-w-4xl h-[90vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10 border-b border-stone-100 shadow-sm">
                  <h2 className="font-bold text-stone-800 flex-1 truncate pr-4">{isAdminMode && !adminOrderingFor ? (editingProduct.isNew ? '新增商品' : '編輯商品') : editingProduct.name}</h2>
                  <button onClick={() => setEditingProduct(null)} className="w-8 h-8 flex items-center justify-center bg-stone-100 rounded-full text-stone-500"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto pt-16 pb-24 md:flex md:flex-row">
                  <div className="md:w-1/2 md:border-r border-stone-200 flex flex-col">
                    <div className="w-full h-64 md:h-80 bg-stone-200 flex-shrink-0 relative">
                      {mainDisplayImg ? <img src={mainDisplayImg} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100"><ImageIcon size={48} opacity={0.5}/></div>}
                    </div>
                    <div className="flex gap-2 p-4 overflow-x-auto [&::-webkit-scrollbar]:hidden bg-white shadow-sm relative z-0">
                      
                      {/* ======== 第一張圖片 ======== */}
                      <div className="relative shrink-0 group">
                        {editingProduct.image ? (
                           <>
                             <img src={editingProduct.image} loading="eager" decoding="async" fetchPriority="high" onClick={() => setMainDisplayImg(editingProduct.image)} className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${mainDisplayImg === editingProduct.image ? 'border-amber-500' : 'border-stone-200'}`} />
                             {isAdminMode && !adminOrderingFor && (
                                <button onClick={() => { setEditingProduct({...editingProduct, image: ''}); if(mainDisplayImg === editingProduct.image) setMainDisplayImg(''); }} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md z-10"><X size={12} /></button>
                             )}
                           </>
                        ) : (
                           <div className="w-16 h-16 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-stone-400 cursor-pointer hover:border-amber-500 relative">
                               <Camera size={20} />
                               {isAdminMode && !adminOrderingFor && <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e.target.files[0], (img) => { setEditingProduct({...editingProduct, image: img}); setMainDisplayImg(img); })} />}
                           </div>
                        )}
                      </div>

                      {/* ======== 額外圖片 ======== */}
                      {(editingProduct.extraImages || []).map((img, idx) => (
                        <div key={idx} className="relative shrink-0 group">
                         <img src={img} loading="eager" decoding="async" fetchPriority="high" onClick={() => setMainDisplayImg(img)} className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${mainDisplayImg === img ? 'border-amber-500' : 'border-stone-200'}`} />
                          {isAdminMode && !adminOrderingFor && <button onClick={() => { const newExtra = [...editingProduct.extraImages]; newExtra.splice(idx, 1); setEditingProduct({...editingProduct, extraImages: newExtra}); if(mainDisplayImg === img) setMainDisplayImg(editingProduct.image); }} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md z-10"><X size={12} /></button>}
                        </div>
                      ))}

                      {/* ======== 新增額外圖片按鈕 ======== */}
                      {isAdminMode && !adminOrderingFor && (editingProduct.extraImages || []).length < 4 && (
                        <label className="w-16 h-16 shrink-0 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-stone-400 cursor-pointer hover:border-amber-500"><ImagePlus size={20} /><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], (img) => setEditingProduct({...editingProduct, extraImages: [...(editingProduct.extraImages||[]), img]}))} /></label>
                      )}
                    </div>
                  </div>
                  <div className="md:w-1/2 p-5 space-y-5">
                    {isAdminMode && !adminOrderingFor ? (
                      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                        <h3 className="font-bold text-stone-800 border-b border-stone-200 pb-2 flex justify-between items-center">
                          基礎設定 
                          <div className="flex gap-2">
                             <label className="flex items-center gap-1.5 text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-md cursor-pointer"><input type="checkbox" checked={editingProduct.isPromo} onChange={e => setEditingProduct({...editingProduct, isPromo: e.target.checked})} className="accent-rose-500 w-3 h-3" />參與優惠</label>
                             <label className="flex items-center gap-1.5 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md cursor-pointer"><input type="checkbox" checked={editingProduct.isAddon} onChange={e => setEditingProduct({...editingProduct, isAddon: e.target.checked})} className="accent-purple-500 w-3 h-3" />設為加購</label>
                            <label className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md cursor-pointer">
  <input type="checkbox" 
         checked={editingProduct.providesFreeAddon || false} 
         onChange={e => setEditingProduct({...editingProduct, providesFreeAddon: e.target.checked})} 
         className="accent-blue-500 w-3 h-3" />
  買此商品送0元加購額度
</label>
                          </div>
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs mb-2">
                            <label className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md cursor-pointer border border-emerald-100"><input type="checkbox" checked={editingProduct.isFreeShipping !== false} onChange={e => setEditingProduct({...editingProduct, isFreeShipping: e.target.checked})} className="accent-emerald-500 w-3 h-3" />計入免運件數</label>
                            
                        </div>
                        <div className="flex gap-3"><input type="text" value={editingProduct.id} onChange={e => setEditingProduct({...editingProduct, id: e.target.value.toUpperCase()})} disabled={!editingProduct.isNew} placeholder="品號 (如D01)" className="w-1/3 bg-white border border-stone-300 rounded p-2 text-sm outline-none focus:border-amber-500 disabled:bg-stone-100" /><input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="商品名稱" className="w-2/3 bg-white border border-stone-300 rounded p-2 text-sm outline-none focus:border-amber-500" /></div>
                        <div className="flex gap-3">
                           <div className="flex-[1.5] flex gap-1">
                              <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="flex-1 w-full bg-white border border-stone-300 rounded p-2 text-sm outline-none focus:border-amber-500">
                                 {adminCategoryNames.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <button onClick={() => setShowCategoryManager(true)} className="bg-stone-200 text-stone-600 px-3 rounded hover:bg-stone-300 text-xs font-bold shrink-0 whitespace-nowrap">管理分類</button>
                           </div>
                           <div className="flex-[0.5]"><input type="text" value={editingProduct.unit || ''} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})} placeholder="單位(罐/袋)" className="w-full bg-white border border-stone-300 rounded p-2 text-sm outline-none focus:border-amber-500 text-center" /></div>
                           <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} placeholder="售價" className="flex-1 w-full bg-white border border-stone-300 rounded p-2 text-sm outline-none text-amber-600 font-bold focus:border-amber-500" />
                           <input type="number" value={editingProduct.cost || ''} onChange={e => setEditingProduct({...editingProduct, cost: e.target.value})} placeholder="成本" className="flex-1 w-full bg-stone-200 border border-stone-300 rounded p-2 text-sm outline-none text-purple-600 font-bold focus:border-purple-500" title="僅管理員可見之成本" />
                        </div>
                        <input type="text" value={editingProduct.desc} onChange={e => setEditingProduct({...editingProduct, desc: e.target.value})} placeholder="簡介 (顯示於列表)" className="w-full bg-white border border-stone-300 rounded p-2 text-sm outline-none focus:border-amber-500" />
                      </div>
                    ) : (
                      <div>
                        {editingProduct.isPromo && <span className="inline-block bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 mr-2 border border-rose-200">享任選優惠活動</span>}
                        {editingProduct.isAddon && <span className="inline-block bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 border border-purple-200">可做為加購商品</span>}
                        <div className="text-3xl font-bold text-amber-600 mb-1">${editingProduct.price} {editingProduct.unit && <span className="text-sm font-normal text-stone-500">/{editingProduct.unit}</span>}</div>
                        <h1 className="text-2xl font-bold text-stone-800">{editingProduct.name}</h1>
                        <p className="text-sm text-stone-500 mt-1">{editingProduct.desc}</p>
                      </div>
                    )}
                    <hr className="border-stone-200" />
                    {(isAdminMode || editingProduct.intro) && <div className="space-y-1.5"><h3 className="font-bold text-stone-700 flex items-center gap-1"><span className="w-1 h-4 bg-amber-500 rounded-full"></span>產品介紹</h3>{isAdminMode && !adminOrderingFor ? <textarea rows="3" value={editingProduct.intro} onChange={e => setEditingProduct({...editingProduct, intro: e.target.value})} className="w-full bg-white border border-stone-300 rounded p-2 text-sm outline-none focus:border-amber-500"></textarea> : <p className="text-sm text-stone-600 whitespace-pre-wrap">{editingProduct.intro}</p>}</div>}
                    {(isAdminMode || editingProduct.ingredients) && <div className="space-y-1.5"><h3 className="font-bold text-stone-700 flex items-center gap-1"><span className="w-1 h-4 bg-emerald-500 rounded-full"></span>產品成分</h3>{isAdminMode && !adminOrderingFor ? <textarea rows="2" value={editingProduct.ingredients} onChange={e => setEditingProduct({...editingProduct, ingredients: e.target.value})} className="w-full bg-white border border-stone-300 rounded p-2 text-sm outline-none focus:border-amber-500"></textarea> : <p className="text-sm text-stone-600 whitespace-pre-wrap">{editingProduct.ingredients}</p>}</div>}
                    {(isAdminMode || editingProduct.weight) && <div className="space-y-1.5"><h3 className="font-bold text-stone-700 flex items-center gap-1"><span className="w-1 h-4 bg-blue-500 rounded-full"></span>產品重量</h3>{isAdminMode && !adminOrderingFor ? <input type="text" value={editingProduct.weight} onChange={e => setEditingProduct({...editingProduct, weight: e.target.value})} className="w-full bg-white border border-stone-300 rounded p-2 text-sm outline-none focus:border-amber-500" /> : <p className="text-sm text-stone-600">{editingProduct.weight}</p>}</div>}
                    {(isAdminMode || editingProduct.notices) && <div className="space-y-1.5"><h3 className="font-bold text-stone-700 flex items-center gap-1"><span className="w-1 h-4 bg-rose-500 rounded-full"></span>注意事項</h3>{isAdminMode && !adminOrderingFor ? <textarea rows="50" value={editingProduct.notices} onChange={e => setEditingProduct({...editingProduct, notices: e.target.value})} className="w-full bg-white border border-stone-300 rounded p-2 text-sm outline-none focus:border-amber-500"></textarea> : <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-sm whitespace-pre-wrap">{editingProduct.notices}</div>}</div>}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200">
                  {isAdminMode && !adminOrderingFor ? (
                    <div className="flex gap-3">
                      {!editingProduct.isNew && <button onClick={handleDeleteProduct} className="bg-red-100 text-red-600 px-4 rounded-xl hover:bg-red-200 transition-colors"><Trash2 size={20} /></button>}
                      <button onClick={saveProductDetail} className="flex-1 bg-stone-800 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform">儲存商品</button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex items-center gap-4 bg-stone-50 rounded-xl px-4 py-3 border border-stone-200 flex-1 justify-center"><button onClick={() => updateCart(editingProduct.id, -1)} className="p-1 text-stone-500"><Minus size={18} /></button><span className="w-6 text-center text-lg font-bold">{cart[editingProduct.id] || 0}</span><button onClick={() => updateCart(editingProduct.id, 1)} className="p-1 text-amber-600"><Plus size={18} /></button></div>
                      <button onClick={() => setEditingProduct(null)} className="flex-[1.5] bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform">確認返回</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 購物車懸浮按鈕 */}
          {cartData.totalQty > 0 && (!isAdminMode || adminOrderingFor) && !editingProduct && (
            <div className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-10">
              <Link to="/cart" className="w-full bg-stone-800 text-white rounded-2xl p-4 flex items-center justify-between shadow-xl pointer-events-auto active:scale-95 transition-transform">
                <div className="flex items-center gap-3"><div className="relative"><ShoppingCart size={24} /><span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartData.totalQty}</span></div><span className="font-medium">查看購物車</span></div>
                <div className="text-lg font-bold">${cartData.currentTotal}</div>
              </Link>
            </div>
          )}
          </>
          )}

          {/* 購物車/結帳 */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => {
              setIsCartOpen(false)
              navigate('/')
            }}
            cartData={cartData}
            cart={cart}
            addonProducts={addonProducts}
            products={products}
            topSellers={publicTopSellers}
            updateCart={updateCart}
            storeConfig={storeConfig}
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            currentUser={currentUser}
            adminOrderingFor={adminOrderingFor}
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            orderNote={orderNote}
            setOrderNote={setOrderNote}
            contactData={contactData}
            checkoutBankCode={checkoutBankCode}
            setCheckoutBankCode={setCheckoutBankCode}
            onRequireLogin={() => {
              setIsCartOpen(false)
              openCheckoutEntryChoice()
            }}
            handleCheckout={handleCheckout}
          />

          {/* 會員專區 */}
          {showMemberProfile && currentUser && !isAdminMode && false && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
              <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-4xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
                <button onClick={() => setShowMemberProfile(false)} className="absolute top-4 right-4 text-stone-400"><X size={20} /></button>
                <h2 className="text-xl md:text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-200 pb-2"><UserIcon size={24} className="text-amber-600"/> 會員中心</h2>
                
                <div className="flex-1 overflow-y-auto space-y-6 md:flex md:space-y-0 md:gap-6">
                  <div className="md:w-1/3 space-y-4">
                    

                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
                        <h3 className="font-bold text-stone-700">我的資料</h3>
                        {!isEditingProfile ? (
                          <button onClick={() => setIsEditingProfile(true)} className="text-xs flex items-center gap-1 text-amber-600 font-bold hover:text-amber-700"><EditIcon size={14}/> 修改</button>
                        ) : (
                          <button onClick={() => { setIsEditingProfile(false); setCustomerInfo({ name: userProfile?.name||'', phone: userProfile?.phone||'', address: userProfile?.address||'', email: userProfile?.email||'', lineId: userProfile?.lineId||'', gender: userProfile?.gender||'女' }); }} className="text-xs text-stone-400 font-bold hover:text-stone-600">取消</button>
                        )}
                      </div>

                      {isEditingProfile ? (
                        <div className="space-y-3 text-sm">
                          <input type="text" placeholder="姓名" value={customerInfo.name} onChange={e=>setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500" />
                          <div className="flex gap-4">
                             <label className="flex items-center gap-1"><input type="radio" name="gender" value="男" checked={customerInfo.gender==='男'} onChange={e=>setCustomerInfo({...customerInfo, gender:e.target.value})} className="accent-amber-500"/>男</label>
                             <label className="flex items-center gap-1"><input type="radio" name="gender" value="女" checked={customerInfo.gender==='女'} onChange={e=>setCustomerInfo({...customerInfo, gender:e.target.value})} className="accent-amber-500"/>女</label>
                          </div>
                          <input type="tel" placeholder="聯絡電話" value={customerInfo.phone} onChange={e=>setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500" />
                          <input type="text" placeholder="Line ID" value={customerInfo.lineId} onChange={e=>setCustomerInfo({...customerInfo, lineId: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500" />
                          <textarea placeholder="預設地址" value={customerInfo.address} onChange={e=>setCustomerInfo({...customerInfo, address: e.target.value})} rows="2" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500"></textarea>
                          <button onClick={handleUpdateMyProfile} className="w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg shadow-sm hover:bg-amber-600 transition-colors">儲存修改</button>
                        </div>
                      ) : (
                        <div className="text-sm text-stone-600 space-y-3">
                          <p className="flex justify-between"><span className="text-stone-400">姓名</span> <span className="font-bold">{customerInfo.name} ({customerInfo.gender})</span></p>
                          <p className="flex justify-between"><span className="text-stone-400">電話</span> <span>{customerInfo.phone}</span></p>
                          <p className="flex justify-between"><span className="text-stone-400">Line</span> <span>{customerInfo.lineId || '-'}</span></p>
                          <p><span className="text-stone-400 block mb-1">預設地址</span> <span className="block bg-stone-50 p-2 rounded">{customerInfo.address || '未設定'}</span></p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    <h3 className="font-bold text-stone-700 mb-3 border-b border-stone-200 pb-2">我的訂單紀錄</h3>
                    {myOrders.length === 0 ? (
                      <p className="text-center text-stone-400 text-sm py-10 bg-white rounded-2xl border border-stone-200 border-dashed">尚無訂單紀錄</p>
                    ) : (
                      <div className="space-y-4">
                        {myOrders.map(order => {
                          const statusInfo = STATUS_MAP[order.status] || STATUS_MAP['pending'];
                          const isCancellable = order.status === 'pending';
                          return (
                            <div key={order.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm text-sm relative">
                              {['pending', 'confirming'].includes(order.status) && <div className="absolute top-0 left-0 w-full h-1 bg-[#06C755] rounded-t-2xl"></div>}
                              <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3 mt-1">
                                <div>
                                  <span className="font-black text-stone-800 text-lg block tracking-wide">{order.id}</span>
                                  <span className="text-[10px] text-stone-400">{order.createdAt?.toDate().toLocaleString()}</span>
                                  {order.isMerged && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded mt-1 inline-block">合併訂單</span>}
                                  {order.createdByAdmin && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded mt-1 inline-block ml-1">管理員代建</span>}
                                </div>
                                <div className="text-right">
                                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                                  {order.status === 'shipped' && <div className="mt-2 text-xs font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded">物流單號: {order.trackingNumber}</div>}
                                </div>
                              </div>
                              <div className="text-stone-600 text-xs space-y-1.5 mb-4 bg-stone-50 p-3 rounded-lg">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex justify-between items-center">
                                    <span>{item.name} {item.weight && <span className="text-[10px] text-stone-500 font-normal ml-1">({item.weight})</span>} {item.isAddon && <span className="text-[10px] bg-purple-100 text-purple-600 px-1 rounded">加購</span>} {item.isGift && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1 rounded font-bold">滿件贈品</span>} <span className="text-stone-400 text-[10px]">(${item.isAddon && item.freeQty > 0 && item.paidQty > 0 ? `${item.freeQty}件$0, ${item.paidQty}件$${item.price}` : (item.subtotal === 0 ? '0' : item.price)})</span></span>
                                    <span className="font-bold">x{item.qty} {item.unit || ''}</span>
                                  </div>
                                ))}
                                {order.orderNote && <div className="mt-2 pt-2 border-t border-stone-200 text-amber-700"><strong>備註：</strong>{order.orderNote}</div>}
                              </div>

                              {['pending', 'confirming'].includes(order.status) && (
                                <div className="mb-4 p-4 bg-[#06C755]/10 border border-[#06C755]/30 rounded-xl flex flex-col items-center text-center space-y-3">
                                  <p className="text-xs font-bold text-[#06C755] flex items-center gap-1"><MessageCircle size={16}/> 訂單已送出，請點擊下方加 LINE 通知我們才算完成訂單唷！</p>
                                  <div className="flex w-full gap-2">
                                    <button onClick={() => handleCopyOrder(order)} className="flex-1 flex items-center justify-center gap-1 bg-stone-800 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm hover:bg-stone-700 transition-colors active:scale-95">{copiedOrderId === order.id ? <CheckCircle size={14} className="text-emerald-400"/> : <Copy size={14}/>}{copiedOrderId === order.id ? '已複製！' : '1. 複製明細'}</button>
                                    {contactData.lineLink ? <a href={contactData.lineLink} target="_blank" rel="noreferrer" className="flex-[1.5] bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-lg py-2.5 flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"><MessageCircle size={16} /> 2. 前往 LINE 傳送</a> : <button disabled className="flex-[1.5] bg-stone-300 text-white text-xs font-bold rounded-lg py-2.5 flex items-center justify-center gap-1 shadow-sm cursor-not-allowed">LINE 尚未設定</button>}
                                  </div>
                                </div>
                              )}

                              {order.status === 'pending' && (
                                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                                  <div><p className="text-xs font-bold text-rose-800 mb-1 flex items-center gap-1"><CreditCard size={14}/> 匯款帳號資訊：</p><p className="text-xs text-rose-700 whitespace-pre-wrap font-medium bg-white/60 p-2 rounded border border-rose-100">{contactData.bankAccount || '店家尚未設定匯款帳號，請加 LINE 詢問'}</p></div>
                                  <div><p className="text-xs font-bold text-rose-700 mb-2">⚠️ 請匯款後加 LINE 通知，並輸入帳戶後五碼：</p><div className="flex gap-2"><input type="text" maxLength="5" placeholder="輸入後五碼" value={bankCodeInputs[order.id] || ''} onChange={e => setBankCodeInputs({...bankCodeInputs, [order.id]: e.target.value})} className="flex-1 min-w-0 bg-white border border-rose-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400 font-bold tracking-widest text-center" /><button onClick={() => submitBankCode(order.id)} className="shrink-0 whitespace-nowrap bg-rose-500 text-white font-bold px-4 rounded-lg shadow-sm active:scale-95 transition-transform">送出</button></div></div>
                                </div>
                              )}
                              {order.status === 'confirming' && <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700 text-center">已送出後五碼 ({order.bankAccountLast5})，等待對帳確認中...</div>}
                              {order.status === 'confirmed' && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 text-center">💡 為保持良好賞味，商品皆為接單製作，接單後5~7天出貨，感謝您的耐心等候！</div>}

                              <div className="flex justify-between items-end mt-4 pt-3 border-t border-stone-100">
                                {isCancellable ? <button onClick={() => requestCancelOrder(order)} className="text-xs text-stone-400 hover:text-rose-500 font-bold transition-colors underline mb-1">申請取消訂單</button> : <div></div>}
                                <div className="text-right text-xs text-stone-500 space-y-1">
                                  <div>商品小計：${order.totals.itemsBaseTotal}</div>
                                  {order.totals.discountAmount > 0 && <div className="text-rose-500">活動折抵：-${order.totals.discountAmount}</div>}
                                  {order.adminDiscount > 0 && <div className="text-amber-500">特別折扣：-${order.adminDiscount}</div>}
                                  <div>運費：${order.totals.shippingFee}</div>
                                  <div className="font-black text-stone-800 text-xl pt-1">總計：${order.totals.finalPrice}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

{/* 營運儀表板 (Dashboard) */}
          {showMemberProfile && currentUser && !isAdminMode && (
            <MemberProfileModal
              onClose={() => {
                setShowMemberProfile(false)
                navigate('/')
              }}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              userProfile={userProfile}
              customerInfo={customerInfo}
              setCustomerInfo={setCustomerInfo}
              handleUpdateMyProfile={handleUpdateMyProfile}
              myOrders={myOrders}
              products={products}
              statusMap={STATUS_MAP}
              contactData={contactData}
              copiedOrderId={copiedOrderId}
              handleCopyOrder={handleCopyOrder}
              bankCodeInputs={bankCodeInputs}
              setBankCodeInputs={setBankCodeInputs}
              submitBankCode={submitBankCode}
              requestCancelOrder={requestCancelOrder}
              onQuickReorder={(productId) => navigate(`/product/${productId}`)}
              onReorderLastOrder={handleReorderLatest}
              cart={cart}
              onAdjustQuickReorder={(productId, delta) => updateCart(productId, delta)}
              onGoToCartFromQuickReorder={() => {
                setShowMemberProfile(false)
                if (routeMode === 'cart') {
                  setIsCartOpen(true)
                } else {
                  navigate('/cart')
                }
              }}
            />
          )}

          {checkoutSuccessInfo && (
            <div className="fixed inset-0 z-[70] flex justify-center items-center bg-black/50 backdrop-blur-sm px-4">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 border border-stone-200">
                <h3 className="text-lg font-black text-stone-800 mb-2">訂單送出成功</h3>
                <p className="text-sm text-stone-600 mb-4">
                  建議先複製回報模板，再前往 LINE 貼上，對帳會更快。
                </p>
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-700 mb-4">
                  訂單編號：<span className="font-bold">{checkoutSuccessInfo.orderId}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCopyCheckoutTemplate} className="flex-1 bg-stone-800 text-white py-2.5 rounded-lg font-bold">
                    複製回報模板
                  </button>
                  {checkoutSuccessInfo.lineLink ? (
                    <a href={checkoutSuccessInfo.lineLink} target="_blank" rel="noreferrer" className="flex-1 bg-[#06C755] text-white py-2.5 rounded-lg font-bold text-center">
                      前往 LINE
                    </a>
                  ) : (
                    <button className="flex-1 bg-stone-300 text-white py-2.5 rounded-lg font-bold" disabled>
                      LINE 未設定
                    </button>
                  )}
                </div>
                <button onClick={() => setCheckoutSuccessInfo(null)} className="w-full mt-3 text-stone-500 text-sm">
                  我知道了
                </button>
              </div>
            </div>
          )}

          {showAdminDashboard && isAdminMode && (
            <AdminDashboardModal
              onClose={() => {
                setShowAdminDashboard(false)
                navigate('/')
              }}
              onGoToOrders={() => {
                navigate('/admin/orders')
              }}
              onOpenLogs={() => {
                setShowAdminLogs(true)
              }}
              onStartImageMigration={handleMigrateExistingProductThumbs}
              imageMigrationRunning={imageMigrationRunning}
              imageMigrationStatus={imageMigrationStatus}
              allOrders={allOrders}
              allUsers={allUsers}
              products={products}
              monthlyStats={monthlyStats}
              db={db}
              statusMap={STATUS_MAP}
            />
          )}

          {showAdminLogs && isAdminMode && (
            <div className="fixed inset-0 z-[65] flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
              <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-4xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
                <button onClick={() => setShowAdminLogs(false)} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full">
                  <X size={24} />
                </button>
                <h2 className="text-xl md:text-2xl font-bold text-stone-800 mb-5 flex items-center gap-2 border-b border-stone-200 pb-3">
                  管理員操作紀錄
                </h2>
                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                  {adminLogs.length === 0 ? (
                    <div className="text-sm text-stone-400 text-center py-10">目前尚無操作紀錄</div>
                  ) : (
                    adminLogs.map((log) => {
                      const readable = formatAdminLog(log)
                      return (
                      <div key={log.id} className="bg-white border border-stone-200 rounded-xl p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold text-stone-700 text-sm">{readable.title}</p>
                          <p className="text-xs text-stone-400 shrink-0">
                            {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : '-'}
                          </p>
                        </div>
                        <p className="text-sm text-stone-700 mt-1">{readable.summary}</p>
                        <p className="text-xs text-stone-500 mt-2">管理員：{log.adminEmail || log.adminUid || '-'}</p>
                        {readable.changes?.length > 0 && (
                          <div className="mt-2 bg-stone-50 border border-stone-100 rounded-lg p-2 space-y-1">
                            {readable.changes.map((c, idx) => (
                              <div key={`${log.id}-${idx}`} className="text-xs text-stone-600">
                                <span className="font-bold text-stone-700">{c.label || c.field}</span>
                                <span className="mx-1 text-stone-400">：</span>
                                <span className="text-rose-600">{c.before}</span>
                                <span className="mx-1 text-stone-400">→</span>
                                <span className="text-emerald-700">{c.after}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )})
                  )}
                </div>
              </div>
            </div>
          )}

          {showAdminDashboard && isAdminMode && false && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
              <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-5xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
                <button onClick={() => setShowAdminDashboard(false)} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full"><X size={24} /></button>
                <h2 className="text-xl md:text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b border-stone-200 pb-3">
                  <TrendingUp size={24} className="text-indigo-600"/> 營運數據儀表板
                </h2>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                  {(() => {
                    // --- 數據核心計算邏輯開始 ---
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();

                    let monthlyRevenue = 0;
                    let monthlyCost = 0;
                    let statusCounts = { pending: 0, confirming: 0, confirmed: 0, shipping: 0, shipped: 0, completed: 0, cancelled: 0 };
                    let itemSales = {};
                    let newUsersThisMonth = 0;

                    // 計算訂單數據
                    allOrders.forEach(order => {
                      const orderDate = order.createdAt ? order.createdAt.toDate() : new Date();
                      const isThisMonth = orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                      
                      // 訂單狀態統計 (不限月份)
                      if (statusCounts[order.status] !== undefined) statusCounts[order.status]++;

                      // 營收與商品統計 (僅限本月，且只計算已確認、已出貨、已完成的真實入帳訂單)
if (isThisMonth && ['confirmed', 'shipping', 'shipped', 'completed'].includes(order.status)) {
                        monthlyRevenue += order.totals.finalPrice || 0;
                        monthlyCost += order.totals.totalCost || 0;
                      
                      }
                    });

                    // 計算會員成長數據
                    allUsers.forEach(user => {
                      if (user.createdAt) {
                        const uDate = user.createdAt.toDate();
                        if (uDate.getMonth() === currentMonth && uDate.getFullYear() === currentYear) newUsersThisMonth++;
                      }
                    });
// 🌟 新增：讓排行榜直接讀取小白板上算好的商品銷量
                    if (monthlyStats && monthlyStats.itemSales) {
                       // 以商品 id 為唯一鍵，避免同名商品互相覆蓋
                       Object.entries(monthlyStats.itemSales).forEach(([itemId, data]) => {
                          const prod = products.find(p => p.id === itemId);
                          itemSales[itemId] = {
                            qty: data.qty || 0,
                            name: prod?.name || itemId,
                            image: prod?.image || ''
                          };
                       });
                    }
                    // 排序熱銷商品 (取前 5 名)
                    const topItems = Object.entries(itemSales).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);
                    const totalOrdersCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);
                    // --- 數據核心計算邏輯結束 ---

                    return (
                      <>
                        {/* 頂部：四大核心數據卡片 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-center">
                            <span className="text-xs font-bold text-indigo-500 mb-1">本月總營收</span>
                            <span className="text-2xl md:text-3xl font-black text-stone-800">${(monthlyStats.monthlyRevenue || 0).toLocaleString()}</span>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center">
                            <span className="text-xs font-bold text-emerald-500 mb-1">本月預估毛利</span>
                            <span className="text-2xl md:text-3xl font-black text-stone-800">${(monthlyRevenue - monthlyCost).toLocaleString()}</span>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center">
                            <span className="text-xs font-bold text-blue-500 mb-1">本月新增會員</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl md:text-3xl font-black text-stone-800">{newUsersThisMonth}</span>
                              <span className="text-xs text-stone-400 font-bold">/ 總數 {allUsers.length}</span>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-center">
                            <span className="text-xs font-bold text-amber-500 mb-1">未處理/確認中訂單</span>
                            <span className="text-2xl md:text-3xl font-black text-stone-800 text-amber-600">{statusCounts.pending + statusCounts.confirming}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          {/* 左側：熱銷商品排行榜 (本月) */}
                          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
                              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                                🏆 本月熱銷排行榜 <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded">排除已取消</span>
                              </h3>
                              <button onClick={() => {
                                if (!requireAdminAccess()) return;
                                // 1. 先算出「所有主商品的總銷售數量」當作正確的分母
                                const totalItemsSold = Object.values(itemSales).reduce((sum, item) => sum + item.qty, 0);

                                // 2. 提取排行榜資料，並存入 Firebase
                                const exportData = topItems.map(([itemId, data]) => {
                                  // 3. 修正數學邏輯：(單一商品銷量 / 總銷量) * 100
                                  const percentage = totalItemsSold > 0 ? Math.round((data.qty / totalItemsSold) * 100) : 0; 
                                  return { name: data.name || itemId, image: data.image || '', percentage: percentage, id: itemId };
                                });
                                
                                if (db) {
                                  db.collection('settings').doc('topSellers').set({ items: exportData, label: '本月' });
                                  writeAdminLog('top_sellers_published', {
                                    itemCount: exportData.length,
                                    topItemId: exportData[0]?.id || ''
                                  });
                                  alert('✅ 已成功將最新排行榜發佈至首頁！');
                                }
                              }} className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-1 active:scale-95">
                                <ArrowUp size={14}/> 發佈至首頁
                              </button>
                            </div>
                            {topItems.length === 0 ? <p className="text-sm text-stone-400 text-center py-6">本月尚無銷售數據</p> : (
                              <div className="space-y-4">
                                {topItems.map(([itemId, data], idx) => {
                                  const maxQty = topItems[0][1].qty;
                                  const percentage = Math.round((data.qty / maxQty) * 100);
                                  return (
                                    <div key={itemId} className="space-y-1.5">
                                      <div className="flex justify-between text-sm">
                                        <span className="font-bold text-stone-700 truncate pr-2"><span className="text-stone-400 mr-1">#{idx + 1}</span> {data.name || itemId}</span>
                                        <span className="font-bold text-indigo-600 shrink-0">{data.qty} 件</span>
                                      </div>
                                      {/* 簡單的 Tailwind 進度條 */}
                                      <div className="w-full bg-stone-100 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* 右側：訂單狀態分佈圖 (全局) */}
                          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
                              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                                📊 系統總訂單狀態分佈 <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded">全部時間</span>
                              </h3>
                              {/* 加入跳轉至訂單管理的按鈕 */}
                              <button onClick={() => {
                                setShowAdminDashboard(false); // 第一步：關閉目前的儀表板
                                setShowAdminOrders(true);     // 第二步：瞬間打開訂單管理視窗
                              }} className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors flex items-center gap-1 active:scale-95">
                                前往管理 ➔
                              </button>
                            </div>
                            {totalOrdersCount === 0 ? <p className="text-sm text-stone-400 text-center py-6">尚無訂單數據</p> : (
                              <div className="space-y-3">
                                {[
                                  { key: 'pending', label: '未處理', color: 'bg-rose-500' },
                                  { key: 'confirming', label: '確認中 (已傳後五碼)', color: 'bg-amber-500' },
                                  { key: 'confirmed', label: '已確認 (待出貨)', color: 'bg-blue-500' },
                                  { key: 'shipping', label: '出貨中', color: 'bg-violet-500' },
                                  { key: 'shipped', label: '已出貨', color: 'bg-purple-500' },
                                  { key: 'completed', label: '已完成', color: 'bg-emerald-500' }
                                ].map(status => {
                                  const count = statusCounts[status.key] || 0;
                                  const percentage = Math.round((count / totalOrdersCount) * 100);
                                  return (
                                    <div key={status.key} className="flex items-center gap-3">
                                      <span className="text-xs font-bold text-stone-600 w-28 shrink-0">{status.label}</span>
                                      <div className="flex-1 bg-stone-100 rounded-full h-4 overflow-hidden flex relative">
                                        <div className={`${status.color} h-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                        {count > 0 && <span className="absolute inset-y-0 left-2 text-[9px] text-white font-bold flex items-center">{percentage}%</span>}
                                      </div>
                                      <span className="text-sm font-bold text-stone-700 w-8 text-right shrink-0">{count}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
          
          {/* 管理員訂單 */}
          {showAdminOrders && isAdminMode && (
            <AdminOrdersModal
              onClose={() => {
                setShowAdminOrders(false)
                navigate('/')
              }}
              handlePrintConfirmedOrders={handlePrintConfirmedOrders}
              orderSearchId={orderSearchId}
              setOrderSearchId={setOrderSearchId}
              handleCloudSearch={handleCloudSearch}
              setCloudSearchResult={setCloudSearchResult}
              setActiveSearchId={setActiveSearchId}
              orderStatusFilter={orderStatusFilter}
              setOrderStatusFilter={setOrderStatusFilter}
              orderStartDate={orderStartDate}
              setOrderStartDate={setOrderStartDate}
              orderEndDate={orderEndDate}
              setOrderEndDate={setOrderEndDate}
              downloadOrdersCSV={downloadOrdersCSV}
              filteredAdminOrders={filteredAdminOrders}
              statusMap={STATUS_MAP}
              updateOrderStatus={updateOrderStatus}
              deleteOrder={deleteOrder}
              trackingInputs={trackingInputs}
              setTrackingInputs={setTrackingInputs}
              saveTrackingNumber={saveTrackingNumber}
              adminDiscountInputs={adminDiscountInputs}
              setAdminDiscountInputs={setAdminDiscountInputs}
              saveAdminDiscount={saveAdminDiscount}
              adminNoteInputs={adminNoteInputs}
              setAdminNoteInputs={setAdminNoteInputs}
              saveOrderNote={saveOrderNote}
              loadMoreOldOrders={loadMoreOldOrders}
            />
          )}

          {showAdminOrders && isAdminMode && false && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
              <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-6xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
                <button onClick={() => setShowAdminOrders(false)} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full"><X size={24} /></button>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-stone-200 pb-3 gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-stone-800 flex items-center gap-2"><ClipboardList size={24} className="text-amber-600"/> 訂單管理中心</h2>
                  <button onClick={handlePrintConfirmedOrders} className="flex items-center justify-center gap-2 bg-stone-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-stone-700 transition-colors active:scale-95">
                    <Printer size={18} /> 列印出貨單
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 flex-1 min-w-[200px]">
  <SearchIcon size={16} className="text-stone-400" />
  <input 
    type="text" 
    placeholder="輸入單號後按 Enter 雲端搜尋..." 
    value={orderSearchId} 
    onChange={e => { 
      setOrderSearchId(e.target.value); 
      if(e.target.value === '') {
        setCloudSearchResult(null); 
        setActiveSearchId(''); // 🌟 新增：字被清空時，解除單號鎖定，切斷即時連線
      }
    }} 
    onKeyDown={e => e.key === 'Enter' && handleCloudSearch()} 
    className="w-full text-sm outline-none font-bold tracking-wider" 
  />
  <button onClick={handleCloudSearch} className="bg-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-stone-700 transition-colors shadow-sm shrink-0 active:scale-95">搜尋</button>
</div>
                  <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} className="bg-white px-3 py-2 rounded-lg border border-stone-200 text-sm font-bold text-stone-600 outline-none flex-1 min-w-[120px] cursor-pointer"><option value="all">所有狀態</option>{Object.entries(STATUS_MAP).map(([key, info]) => <option key={key} value={key}>{info.label}</option>)}</select>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 flex-1 min-w-[250px]"><input type="date" value={orderStartDate} onChange={e => setOrderStartDate(e.target.value)} className="text-sm outline-none text-stone-600 cursor-pointer" /><span className="text-stone-400">-</span><input type="date" value={orderEndDate} onChange={e => setOrderEndDate(e.target.value)} className="text-sm outline-none text-stone-600 cursor-pointer" /></div>
                  <button onClick={downloadOrdersCSV} className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors shadow-sm active:scale-95 min-w-[120px]"><DownloadIcon size={16} /> 下載明細</button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {filteredAdminOrders.length === 0 ? <p className="text-center text-stone-400 mt-10">找不到符合條件的訂單</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAdminOrders.map(order => {
                        const isCancelReq = order.status === 'cancel_requested';
                        return (
                          <div key={order.id} className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col transition-colors ${isCancelReq ? 'border-orange-400 ring-2 ring-orange-100' : 'border-stone-200'}`}>
                            <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3 relative">
                              <div>
                                <span className="font-black text-stone-800 text-lg block tracking-wide">{order.id}</span>
                                <span className="text-[10px] text-stone-400">{order.createdAt?.toDate().toLocaleString()}</span>
                                {order.isMerged && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded mt-1 inline-block">合併訂單</span>}
                                {order.createdByAdmin && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded mt-1 inline-block ml-1">代建單</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <select value={order.status || 'pending'} onChange={(e) => updateOrderStatus(order, e.target.value)} className={`text-xs font-bold outline-none rounded p-1.5 cursor-pointer shadow-sm border border-stone-200 ${STATUS_MAP[order.status]?.color || 'bg-stone-100 text-stone-700'}`}>
                                  {Object.entries(STATUS_MAP).map(([key, info]) => <option key={key} value={key}>{info.label}</option>)}
                                </select>
                                <button onClick={() => deleteOrder(order.id)} className="text-stone-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                              </div>
                            </div>
                            
                            {order.status === 'confirming' && <div className="mb-3 bg-amber-50 text-amber-700 text-xs font-bold p-2 rounded-lg text-center border border-amber-200">💰 客填後五碼：<span className="text-base tracking-widest">{order.bankAccountLast5}</span></div>}
                            {isCancelReq && <div className="mb-3 bg-orange-50 text-orange-700 text-xs font-bold p-2 rounded-lg text-center border border-orange-200 animate-pulse">⚠️ 買家已送出取消申請，請審核！</div>}
                            {(order.status === 'shipping' || order.status === 'shipped') && (
                              <div className="mb-3 flex gap-2">
                                <input
                                  type="text"
                                  placeholder={order.status === 'shipping' ? '輸入物流單號（儲存後為已出貨）' : '輸入物流單號'}
                                  value={trackingInputs[order.id] ?? order.trackingNumber ?? ''}
                                  onChange={(e) =>
                                    setTrackingInputs({
                                      ...trackingInputs,
                                      [order.id]: e.target.value
                                    })
                                  }
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-purple-400 font-bold"
                                />
                                <button
                                  onClick={() => saveTrackingNumber(order.id)}
                                  className="bg-purple-100 text-purple-700 text-xs font-bold px-3 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                  儲存
                                </button>
                              </div>
                            )}
                            
                            <div className="text-sm text-stone-600 space-y-1 mb-3 bg-stone-50 p-3 rounded-lg">
                              <p><span className="font-bold text-stone-500">姓名：</span>{order.customerInfo.name} ({order.customerInfo.gender})</p>
                              <p><span className="font-bold text-stone-500">電話：</span>{order.customerInfo.phone}</p>
                              <p><span className="font-bold text-stone-500">Line：</span>{order.customerInfo.lineId || '-'}</p>
                              <p className="truncate" title={order.customerInfo.address}><span className="font-bold text-stone-500">地址：</span>{order.customerInfo.address}</p>
                            </div>

                            <div className="flex-1 text-xs text-stone-600 space-y-1 mb-3">
                              <p className="font-bold text-stone-500 mb-1 border-b border-stone-200 pb-1">購買明細：</p>
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center mb-1">
                               <span>{item.name} {item.weight && <span className="text-[10px] text-stone-500 font-normal ml-1">({item.weight})</span>} {item.isAddon && <span className="text-[10px] bg-purple-100 text-purple-600 px-1 rounded">加購</span>} {item.isGift && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1 rounded font-bold">滿件贈品</span>} <span className="text-stone-400 text-[10px]">(${item.isAddon && item.freeQty > 0 && item.paidQty > 0 ? `${item.freeQty}件$0, ${item.paidQty}件$${item.price}` : (item.subtotal === 0 ? '0' : item.price)})</span></span>
                                  <span className="font-bold">x{item.qty} {item.unit || ''}</span>
                                </div>
                              ))}
                            </div>

                            <div className="mb-3 border-t border-stone-100 pt-3 flex gap-2 items-center">
                               <p className="font-bold text-stone-500 text-xs shrink-0">手動折扣：</p>
                               <input type="number" value={adminDiscountInputs[order.id] !== undefined ? adminDiscountInputs[order.id] : (order.adminDiscount || 0)} onChange={e => setAdminDiscountInputs({...adminDiscountInputs, [order.id]: e.target.value})} className="flex-1 bg-white border border-stone-200 rounded p-1 text-xs outline-none focus:border-amber-400 font-bold text-red-500" />
                               <button onClick={() => saveAdminDiscount(order)} className="bg-stone-200 text-stone-600 text-xs font-bold px-2 py-1 rounded hover:bg-stone-300 transition-colors">儲存</button>
                            </div>

                            <div className="mb-3 border-t border-stone-100 pt-3">
                              <p className="font-bold text-stone-500 mb-1 text-xs flex justify-between">訂單備註： <span className="text-[9px] font-normal text-stone-400">可查看與編輯</span></p>
                              <div className="flex gap-2">
                                <textarea placeholder="買家未填寫或輸入您的備註" value={adminNoteInputs[order.id] !== undefined ? adminNoteInputs[order.id] : (order.orderNote || '')} onChange={e => setAdminNoteInputs({...adminNoteInputs, [order.id]: e.target.value})} className="flex-1 bg-amber-50/50 border border-amber-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-amber-400 min-h-[40px] text-amber-900"/>
                                <button onClick={() => saveOrderNote(order.id)} className="bg-amber-100 text-amber-700 text-xs font-bold px-3 rounded-lg hover:bg-amber-200 transition-colors shrink-0">儲存<br/>備註</button>
                              </div>
                            </div>
                            
                            <div className="mt-auto border-t border-stone-100 pt-3">
                              <div className="bg-stone-50 p-2 rounded-lg text-right text-xs text-stone-500 mb-2 space-y-1">
                                 <div className="flex justify-between"><span>商品小計</span><span>${order.totals.itemsBaseTotal}</span></div>
                                 {order.totals.discountAmount > 0 && <div className="flex justify-between text-rose-500"><span>活動折抵</span><span>-${order.totals.discountAmount}</span></div>}
                                 <div className="flex justify-between"><span>運費</span><span>${order.totals.shippingFee}</span></div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-stone-500 font-bold">總金額</span>
                                <span className="font-black text-amber-600 text-xl">${order.totals.finalPrice}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* 🌟 更改：移除舊的條件，直接換成呼叫 loadMoreOldOrders */}
                      <div className="col-span-full flex justify-center mt-6 mb-8">
                        <button onClick={loadMoreOldOrders} className="bg-stone-200 text-stone-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-stone-300 transition-colors shadow-sm active:scale-95">
                          載入更早的訂單...
                        </button>
                      </div>
                      
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 管理員客戶管理 */}
          {showAdminCustomers && isAdminMode && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 md:px-10 py-6">
              <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-6xl h-full flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
                <button onClick={() => {setShowAdminCustomers(false); setSelectedCustomer(null); setIsEditingAdminCustomer(false); setIsMergeMode(false); setMergeSelection([]); setIsNewCustomer(false); setShowDeletedCustomers(false); navigate('/');}} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full"><X size={24} /></button>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-stone-200 pb-3 gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-stone-800 flex items-center gap-2"><UsersIcon size={24} className="text-blue-600"/> 客戶管理中心</h2>
                  {!selectedCustomer && (
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 flex-1 min-w-[200px]">
                        <SearchIcon size={16} className="text-stone-400" />
                        <input type="text" placeholder="搜尋客戶姓名或電話..." value={customerSearchName} onChange={e => setCustomerSearchName(e.target.value)} className="w-full text-sm outline-none font-bold" />
                      </div>
                      <button onClick={() => setShowDeletedCustomers(!showDeletedCustomers)} className={`text-sm font-bold px-3 py-2 rounded-lg shadow-sm transition-colors border ${showDeletedCustomers ? 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'}`}>
                        {showDeletedCustomers ? '返回正常名單' : '查看停用名單'}
                      </button>
                      {!showDeletedCustomers && <button onClick={handleAddCustomerBtn} className="bg-blue-600 text-white text-sm font-bold px-3 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap"><Plus size={16}/> 新增客戶</button>}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {!selectedCustomer ? (
                    filteredUsers.length === 0 ? <p className="text-center text-stone-400 mt-10">找不到客戶資料</p> : (
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredUsers.map(user => (
                          <div key={user.id} onClick={() => setSelectedCustomer({...user})} className={`bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden ${user.role === 'deleted' ? 'border-rose-200 opacity-80' : 'border-stone-200 hover:border-blue-400'}`}>
                          
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 mt-2 ${user.role === 'deleted' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}><UserIcon size={32} /></div>
                            <h3 className="font-black text-stone-800 text-lg">{user.name} <span className="text-sm font-normal text-stone-500">({user.gender||'-'})</span></h3>
                            {user.role === 'deleted' && <div className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1">已停用</div>}
                            <p className="text-sm text-stone-500 font-bold mt-1">{user.phone}</p>
                            <span className="mt-3 text-[10px] bg-stone-100 text-stone-500 px-3 py-1 rounded-full font-bold">點擊查看詳細資料與訂單</span>
                          </div>
                        ))}

                        {filteredUsers.length >= userLimit && (
                          <div className="col-span-full flex justify-center mt-6 mb-8">
                            <button onClick={() => setUserLimit(prev => prev + 50)} className="bg-stone-200 text-stone-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-stone-300 transition-colors">
                              載入更多客戶...
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col md:flex-row gap-6 h-full">
                      <div className="md:w-1/3">
                        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm sticky top-0 relative">
                          <button onClick={() => {setSelectedCustomer(null); setIsEditingAdminCustomer(false); setIsMergeMode(false); setMergeSelection([]);}} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 font-bold text-xs flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-md"><ChevronRight size={14} className="rotate-180"/> 返回</button>
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 mt-4 mx-auto ${selectedCustomer.role === 'deleted' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}><UserIcon size={40} /></div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-black text-stone-800 text-2xl">{selectedCustomer.name}</h3>
                            {selectedCustomer.role !== 'deleted' && (
                              !isEditingAdminCustomer ? (
          
                               <button onClick={() => { setIsEditingAdminCustomer(true); }} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-blue-100"><EditIcon size={14}/> 編輯</button>
                              ) : (
                                <button onClick={() => { setIsEditingAdminCustomer(false); setSelectedCustomer(allUsers.find(u => u.id === selectedCustomer.id)); }} className="text-xs font-bold text-stone-400 hover:text-stone-600">取消</button>
                              )
                            )}
                          </div>

                          {selectedCustomer.role !== 'deleted' && !isEditingAdminCustomer && (
                            <button onClick={() => startAdminOrder(selectedCustomer)} className="w-full mt-3 mb-2 bg-amber-500 text-white font-bold py-2.5 rounded-md shadow-sm hover:bg-amber-600 transition-colors flex justify-center items-center gap-2">
                               <ShoppingCart size={18}/> 幫客戶代建單
                            </button>
                          )}
                          
                          {isEditingAdminCustomer ? (
                            <div className="space-y-3 text-sm bg-stone-50 p-4 rounded-xl border border-stone-200 mt-4">
                              <input type="text" placeholder="姓名" value={selectedCustomer.name} onChange={e=>setSelectedCustomer({...selectedCustomer, name: e.target.value})} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                              <div className="flex gap-4">
                                 <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="男" checked={selectedCustomer.gender==='男'} onChange={e=>setSelectedCustomer({...selectedCustomer, gender:e.target.value})}/>男</label>
                                 <label className="flex items-center gap-1"><input type="radio" name="adminGender" value="女" checked={selectedCustomer.gender==='女'} onChange={e=>setSelectedCustomer({...selectedCustomer, gender:e.target.value})}/>女</label>
                              </div>
                              <input type="tel" placeholder="聯絡電話" value={selectedCustomer.phone} onChange={e=>setSelectedCustomer({...selectedCustomer, phone: e.target.value})} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                              <input type="text" placeholder="Line ID" value={selectedCustomer.lineId} onChange={e=>setSelectedCustomer({...selectedCustomer, lineId: e.target.value})} className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400" />
                              <textarea placeholder="聯絡地址" value={selectedCustomer.address} onChange={e=>setSelectedCustomer({...selectedCustomer, address: e.target.value})} rows="2" className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400"></textarea>
                              
                              <div className="flex gap-2">
                                {!isNewCustomer && <button onClick={handleDeleteCustomer} className="bg-red-100 text-red-600 font-bold px-3 py-2 rounded-md hover:bg-red-200 transition-colors" title="刪除客戶"><Trash2 size={18}/></button>}
                                <button onClick={handleUpdateCustomerByAdmin} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors">儲存修改</button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 text-sm text-stone-600 bg-stone-50 p-4 rounded-xl mt-4">
                              <div><span className="text-xs font-bold text-stone-400 block mb-1">性別</span><span className="font-bold">{selectedCustomer.gender || '-'}</span></div>
                              <div><span className="text-xs font-bold text-stone-400 block mb-1">聯絡電話</span><span className="font-bold">{selectedCustomer.phone}</span></div>
                              <div><span className="text-xs font-bold text-stone-400 block mb-1">Line ID</span><span className="font-bold text-[#06C755]">{selectedCustomer.lineId || '未提供'}</span></div>
                              <div><span className="text-xs font-bold text-stone-400 block mb-1">預設地址</span><span className="font-bold">{selectedCustomer.address || '未提供'}</span></div>
                             
                              
                              {selectedCustomer.role === 'deleted' && (
                                <div className="mt-4 pt-4 border-t border-stone-200">
                                   <p className="text-xs text-rose-600 font-bold mb-3 text-center bg-rose-50 py-2 rounded-lg">⚠️ 此帳號目前為停用狀態</p>
                                   <button onClick={handleRestoreCustomer} className="w-full bg-emerald-500 text-white font-bold py-2 rounded-md shadow-sm hover:bg-emerald-600 transition-colors flex justify-center items-center gap-1">
                                     恢復帳號權限
                                   </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:w-2/3">
                        <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-2">
                          <h3 className="font-bold text-stone-800">歷史訂單</h3>
                          <div className="flex gap-2">
                            {isMergeMode && mergeSelection.length > 0 && <button onClick={handleConfirmMerge} className="bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-md hover:bg-purple-700 transition-colors flex items-center gap-1"><LinkIcon size={14}/> 確認合併 ({mergeSelection.length})</button>}
                            {selectedCustomer.role !== 'deleted' && (
                              <button onClick={() => { setIsMergeMode(!isMergeMode); setMergeSelection([]); }} className={`text-xs font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${isMergeMode ? 'bg-stone-200 text-stone-600' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}><LinkIcon size={14}/> {isMergeMode ? '取消合併模式' : '合併未處理訂單'}</button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 pb-10">
                          {/* 🌟 修正3：把原本的 allOrders 換成 [...allOrders, ...oldOrders]，新單舊單一起找！ */}
                          {[...allOrders, ...oldOrders].filter(o => o.userId === selectedCustomer.id).length === 0 ? <p className="text-center text-stone-400 py-10 bg-white rounded-2xl border border-stone-200 border-dashed">尚無訂單紀錄</p> : (
                            [...allOrders, ...oldOrders].filter(o => o.userId === selectedCustomer.id).map(order => {
                              const canMerge = isMergeMode && (order.status === 'pending' || order.status === 'confirming');
                              const isSelectedForMerge = mergeSelection.includes(order.id);
                              return (
                                <div key={order.id} onClick={() => { if(canMerge) handleToggleMergeOrder(order.id); }} className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-all ${canMerge ? 'cursor-pointer hover:border-purple-300' : 'border-stone-200'} ${isSelectedForMerge ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50' : ''}`}>
                                  <div className="flex items-start gap-3">
                                    {isMergeMode && <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelectedForMerge ? 'bg-purple-600 border-purple-600 text-white' : (canMerge ? 'border-stone-300 bg-white' : 'border-stone-200 bg-stone-100 opacity-50')}`}>{isSelectedForMerge && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}</div>}
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-blue-600 hover:text-blue-800 text-lg tracking-wide cursor-pointer underline" onClick={(e) => { e.stopPropagation(); setShowAdminCustomers(false); setOrderSearchId(order.id); setOrderStatusFilter('all'); setShowAdminOrders(true); navigate('/admin/orders'); }}>{order.id}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${STATUS_MAP[order.status]?.color || 'bg-stone-100'}`}>{STATUS_MAP[order.status]?.label}</span>
                                        {order.createdByAdmin && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded inline-block ml-1">代建</span>}
                                      </div>
                                      <p className="text-xs text-stone-400 mt-1">{order.createdAt?.toDate().toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="font-black text-amber-600 text-xl mt-1">${order.totals.finalPrice}</div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Excel 表單式：商品總覽編輯 */}
          {showProductTable && isAdminMode && (
            <div className="fixed inset-0 z-[45] flex justify-center items-center bg-black/60 backdrop-blur-sm px-2 md:px-6 py-4">
              <div className="bg-[#Fdfbf7] p-4 md:p-6 rounded-3xl shadow-2xl w-full h-full max-h-[95vh] flex flex-col relative border border-stone-100 overflow-hidden animate-in zoom-in-95 duration-200">
                <button onClick={() => { setShowProductTable(false); navigate('/'); }} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-200 p-1.5 rounded-full z-10 bg-stone-100"><X size={20} /></button>
                
                <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-3">
                  <h2 className="text-xl md:text-2xl font-bold text-stone-800 flex items-center gap-2"><ClipboardList size={24} className="text-emerald-600"/> 商品總覽編輯 (表單模式)</h2>
                 <div className="flex gap-3 mr-4 md:mr-10">
  <label className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 flex items-center gap-1 cursor-pointer transition-colors">
    <ArrowUp size={16}/> 批次匯入CSV
    <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
  </label>
  
  {/* 👇👇 這是新增的匯出按鈕 👇👇 */}
  <button onClick={handleCSVExport} className="bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-amber-600 flex items-center gap-1 transition-colors">
    <DownloadIcon size={16}/> 匯出CSV
  </button>
  {/* 👆👆 這是新增的匯出按鈕 👆👆 */}

  <button onClick={addNewTableRow} className="bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 flex items-center gap-1 transition-colors">
    <Plus size={16}/> 新增一行
  </button>
                   <button onClick={saveAllTableItems} className="bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-amber-700 flex items-center gap-1 transition-colors">
    <CheckCircle size={16}/> 儲存全部變更
  </button>
</div>
                </div>

                <div className="flex-1 overflow-auto border border-stone-200 rounded-xl bg-white shadow-inner">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="bg-stone-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm text-center w-32">操作</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm w-24">品號</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm w-48">商品名稱 (點擊改圖文)</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm w-32">分類</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm w-48">簡介</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm w-20">單位</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm w-20">單價</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm w-20">成本</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm w-24">重量</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm text-center w-16">免運</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm text-center w-16">優惠</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm text-center w-16">加購</th>
                        <th className="p-2 border-b border-stone-200 text-stone-600 font-bold text-sm text-center w-20">送加購額度</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableProducts.map((item, index) => (
                        <tr key={index} className="hover:bg-amber-50/30 transition-colors group">
                          <td className="p-2 border-b border-stone-200 text-center ">
                            <button onClick={() => deleteTableItem(index)} className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded hover:bg-red-200">刪除</button>
                          </td>
                          <td className="p-2 border-b border-stone-200">
                            <input type="text" value={item.id} onChange={e => handleTableFieldChange(index, 'id', e.target.value.toUpperCase())} disabled={!item.isNew} className="w-full bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white rounded px-1 py-0.5 text-sm outline-none disabled:text-stone-400" placeholder="品號" />
                          </td>
                          <td className="p-2 border-b border-stone-200">
                            <div className="flex items-center gap-1">
                              <input type="text" value={item.name} onChange={e => handleTableFieldChange(index, 'name', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white rounded px-1 py-0.5 text-sm font-bold text-stone-800 outline-none" placeholder="商品名稱" />
                              <button onClick={() => openProductDetail(item)} className="shrink-0 text-amber-600 hover:text-amber-800 p-1" title="編輯圖文/成分/介紹"><EditIcon size={14}/></button>
                            </div>
                          </td>
                          <td className="p-2 border-b border-stone-200">
                            <select value={item.category} onChange={e => handleTableFieldChange(index, 'category', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white rounded px-1 py-0.5 text-sm outline-none cursor-pointer">
                              {adminCategoryNames.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="p-2 border-b border-stone-200">
                            <input type="text" value={item.desc || ''} onChange={e => handleTableFieldChange(index, 'desc', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white rounded px-1 py-0.5 text-sm outline-none" placeholder="簡介" />
                          </td>
                          <td className="p-2 border-b border-stone-200">
                            <input type="text" value={item.unit || ''} onChange={e => handleTableFieldChange(index, 'unit', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white rounded px-1 py-0.5 text-sm outline-none" placeholder="單位" />
                          </td>
                          <td className="p-2 border-b border-stone-200">
                            <input type="number" value={item.price} onChange={e => handleTableFieldChange(index, 'price', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white rounded px-1 py-0.5 text-sm outline-none font-bold text-amber-600" />
                          </td>
                          <td className="p-2 border-b border-stone-200">
                            <input type="number" value={item.cost || ''} onChange={e => handleTableFieldChange(index, 'cost', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white rounded px-1 py-0.5 text-sm outline-none text-purple-600" />
                          </td>
                          <td className="p-2 border-b border-stone-200">
                            <input type="text" value={item.weight || ''} onChange={e => handleTableFieldChange(index, 'weight', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-white rounded px-1 py-0.5 text-sm outline-none" placeholder="重量" />
                          </td>
                          <td className="p-2 border-b border-stone-200 text-center"><input type="checkbox" checked={item.isFreeShipping !== false} onChange={e => handleTableFieldChange(index, 'isFreeShipping', e.target.checked)} className="w-4 h-4 accent-emerald-500 cursor-pointer" /></td>
                          <td className="p-2 border-b border-stone-200 text-center"><input type="checkbox" checked={item.isPromo} onChange={e => handleTableFieldChange(index, 'isPromo', e.target.checked)} className="w-4 h-4 accent-rose-500 cursor-pointer" /></td>
                          <td className="p-2 border-b border-stone-200 text-center"><input type="checkbox" checked={item.isAddon} onChange={e => handleTableFieldChange(index, 'isAddon', e.target.checked)} className="w-4 h-4 accent-purple-500 cursor-pointer" /></td>
                          <td className="p-2 border-b border-stone-200 text-center">
  <input type="checkbox" checked={item.providesFreeAddon || false} onChange={e => handleTableFieldChange(index, 'providesFreeAddon', e.target.checked)} className="w-4 h-4 accent-blue-500 cursor-pointer" />
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs font-bold text-stone-500 bg-stone-100 p-2 rounded-lg inline-block self-start">
                  💡 提示：在表格中修改完資料後，記得點擊左側的「儲存」才會更新到系統喔！
                </div>
              </div>
            </div>
          )}

          {/* 登入註冊 */}
          {showCheckoutEntryChoice && (
            <div className="fixed inset-0 z-[55] flex justify-center items-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 relative border border-stone-100">
                <button
                  onClick={() => {
                    setShowCheckoutEntryChoice(false)
                    if (routeMode === 'cart') setIsCartOpen(true)
                  }}
                  className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full"
                >
                  <X size={20} />
                </button>
                <h3 className="text-lg font-black text-stone-800 mb-2 text-center">結帳方式</h3>
                <p className="text-sm text-stone-500 text-center mb-5">
                  請選擇登入方式，我們會帶你進入下一步。
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowCheckoutEntryChoice(false)
                      setLoginMode('customer')
                      setIsRegistering(false)
                      setShowLoginModal(true)
                    }}
                    className="w-full bg-stone-800 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform"
                  >
                    已是會員：登入結帳
                  </button>
                  <button
                    onClick={() => {
                      setShowCheckoutEntryChoice(false)
                      setLoginMode('customer')
                      setIsRegistering(true)
                      setShowLoginModal(true)
                    }}
                    className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform"
                  >
                    非會員：快速結帳
                  </button>
                </div>
              </div>
            </div>
          )}

          {showLoginModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 relative">
                <button onClick={closeLoginModal} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full"><X size={20} /></button>
                <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2 justify-center">
                  {loginMode === 'admin' ? <Lock size={24} className="text-rose-600" /> : <UserIcon size={24} className="text-amber-600" />}
                  {loginMode === 'admin' ? '管理員登入' : (isRegistering ? '非會員快速結帳' : '會員登入')}
                </h3>
                
                {isRegistering && loginMode === 'customer' && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="text" placeholder="真實姓名 (必填)" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="col-span-2 w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm"/>
                    <div className="col-span-2 flex gap-4 px-2 py-1">
                       <span className="text-sm text-stone-500 font-bold">性別：</span>
                       <label className="flex items-center gap-1 text-sm"><input type="radio" name="regGender" value="男" checked={customerInfo.gender==='男'} onChange={e=>setCustomerInfo({...customerInfo, gender:e.target.value})} className="accent-amber-500"/>男</label>
                       <label className="flex items-center gap-1 text-sm"><input type="radio" name="regGender" value="女" checked={customerInfo.gender==='女'} onChange={e=>setCustomerInfo({...customerInfo, gender:e.target.value})} className="accent-amber-500"/>女</label>
                    </div>
                    <div className="col-span-1">
                      <input type="tel" placeholder="手機號碼 (必填)" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm"/>
                      {!!customerInfo.phone && !isValidPhone(customerInfo.phone) && <p className="text-[10px] text-rose-600 font-bold mt-1 px-1">手機格式：請輸入 09 開頭 10 碼</p>}
                    </div>
                    <input type="text" placeholder="Line ID (選填)" value={customerInfo.lineId} onChange={e => setCustomerInfo({...customerInfo, lineId: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm"/>
                    <input type="text" placeholder="聯絡地址 (必填)" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="col-span-2 w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm"/>
                  </div>
                )}

                <div className="mb-3">
                  <input type="email" placeholder="Email 信箱 (必填)" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm"/>
                  {isRegistering && !!emailInput && !isValidEmail(emailInput) && <p className="text-[10px] text-rose-600 font-bold mt-1 px-1">Email 格式不正確</p>}
                </div>
                <input type="password" placeholder="密碼 (必填)" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mb-5 outline-none focus:border-amber-500 text-sm"/>
                
                <div className="flex flex-col gap-3">
                  <button onClick={handleAuthSubmit} className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform">{isRegistering ? '快速結帳' : '登入'}</button>
                  <button onClick={closeLoginModal} className="w-full bg-stone-100 text-stone-600 font-bold py-3 rounded-xl active:scale-95 transition-transform">取消</button>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500">
                  {loginMode === 'customer' ? (
                    <>
                      <button onClick={() => setIsRegistering(!isRegistering)} className="hover:text-amber-600 font-bold">{isRegistering ? '已有帳號？返回登入' : '非會員快速結帳'}</button>
                      <button onClick={() => setLoginMode('admin')} className="hover:text-rose-600">管理員通道</button>
                    </>
                  ) : (
                    <button onClick={() => setLoginMode('customer')} className="hover:text-amber-600 w-full text-center">返回會員登入</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 系統設定彈窗 */}
          {showConfigModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 relative border border-stone-100">
                <button onClick={() => setShowConfigModal(false)} className="absolute top-4 right-4 text-stone-400"><X size={20} /></button>
                <h2 className="text-lg font-bold text-stone-800 mb-5 flex items-center gap-2 border-b border-stone-100 pb-3"><SettingsIcon size={20} className="text-amber-600"/> 系統規則設定</h2>
                <div className="space-y-4">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <p className="text-sm font-bold text-stone-700 mb-2 flex items-center gap-1"><Truck size={16}/> 運費與免運</p>
                    <div className="flex items-center justify-between mb-2"><span className="text-xs text-stone-500">基本運費 ($)</span><input type="number" value={tempConfig.shippingFee} onChange={e => setTempConfig({...tempConfig, shippingFee: e.target.value})} className="w-20 bg-white border border-stone-300 rounded p-1 text-sm outline-none text-right font-bold focus:border-amber-500" /></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-stone-500">免運門檻 (滿X元)</span><input type="number" value={tempConfig.freeShippingThreshold} onChange={e => setTempConfig({...tempConfig, freeShippingThreshold: e.target.value})} className="w-20 bg-white border border-stone-300 rounded p-1 text-sm outline-none text-right font-bold focus:border-amber-500" /></div>
                  </div>
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                    <p className="text-sm font-bold text-rose-700 mb-2 flex items-center gap-1"><Info size={16}/> 任選優惠活動</p>
                  <div className="flex items-center gap-2"><span className="text-xs text-stone-600">任選</span><input type="number" value={tempConfig.promoQty} onChange={e => setTempConfig({...tempConfig, promoQty: e.target.value})} className="w-16 bg-white border border-rose-200 rounded p-1 text-sm text-center font-bold text-rose-600" /><span className="text-xs text-stone-600">件，優惠總價 $</span><input type="number" value={tempConfig.promoPrice} onChange={e => setTempConfig({...tempConfig, promoPrice: e.target.value})} className="w-20 bg-white border border-rose-200 rounded p-1 text-sm text-center font-bold text-rose-600" /></div>
                </div>

                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <p className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-1"><Gift size={16}/> 滿件贈品活動</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-600">滿幾件送：</span>
                    <input type="number" value={tempConfig.giftThreshold || 30} onChange={e => setTempConfig({...tempConfig, giftThreshold: e.target.value})} className="w-20 bg-white border border-emerald-200 rounded p-1 text-sm text-center font-bold text-emerald-600 outline-none focus:border-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-600">贈品品號：</span>
                    <input type="text" value={tempConfig.giftProductId || ''} onChange={e => setTempConfig({...tempConfig, giftProductId: e.target.value.toUpperCase()})} placeholder="例如 D01" className="w-24 bg-white border border-emerald-200 rounded p-1 text-sm text-center font-bold text-emerald-600 outline-none focus:border-emerald-500" />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">※ 若不設定贈品，品號請留空。</p>
                </div>

                {/* 👇👇 這是新增的 0元加購提醒文字設定 👇👇 */}
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-1"><Info size={16}/> 0元加購提醒窗框文字</p>
                  <textarea value={tempConfig.freeAddonReminderMsg || ''} onChange={e => setTempConfig({...tempConfig, freeAddonReminderMsg: e.target.value})} className="w-full bg-white border border-blue-200 rounded p-2 text-sm outline-none focus:border-blue-500" rows="3" placeholder="請輸入提醒顧客挑選0元加購品的文字..."></textarea>
                </div>
                {/* 👆👆 =================================== 👆👆 */}

              </div>
              <button onClick={saveSystemConfig} className="mt-5 w-full bg-stone-800 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform">儲存設定</button>
              </div>
            </div>
          )}

          {/* 公告設定彈窗 (管理員) */}
          {showAnnounceConfig && isAdminMode && (
             <div className="fixed inset-0 z-[60] flex justify-center items-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 relative border border-stone-100 max-h-[90vh] overflow-y-auto flex flex-col">
                <button onClick={() => {setShowAnnounceConfig(false); setIsEditingAnnounce(false);}} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full"><X size={20} /></button>
                <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="flex items-center gap-2"><Megaphone size={20} className="text-purple-600"/> 系統公告設定</span>
                  {!isEditingAnnounce && <button onClick={() => {setTempAnnounce({ title: '', content: '', image: '', isActive: false, showOnLoad: false, isPermanent: true, expireDate: '' }); setIsEditingAnnounce(true);}} className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-purple-200 flex items-center gap-1"><Plus size={14}/>新增公告</button>}
                </h2>
                
                <div className="flex-1 overflow-y-auto min-h-[50vh]">
                  {!isEditingAnnounce ? (
                    <div className="space-y-3">
                      {announcements.length === 0 ? <p className="text-center text-stone-400 py-10">目前沒有任何公告</p> : (
                        announcements.map((ann, index) => (
                          <div key={ann.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex gap-3 relative">
                             <div className="flex flex-col gap-1 items-center justify-center border-r border-stone-200 pr-3 shrink-0">
                               <button onClick={() => moveAnnounce(index, -1)} disabled={index === 0} className={`p-1 rounded transition-colors ${index === 0 ? 'text-stone-300' : 'text-stone-500 hover:bg-stone-200 hover:text-stone-700'}`} title="往上移"><ArrowUp size={16}/></button>
                               <button onClick={() => moveAnnounce(index, 1)} disabled={index === announcements.length - 1} className={`p-1 rounded transition-colors ${index === announcements.length - 1 ? 'text-stone-300' : 'text-stone-500 hover:bg-stone-200 hover:text-stone-700'}`} title="往下移"><ArrowDown size={16}/></button>
                             </div>
                             
                             <div className="flex-1 flex flex-col relative pr-16">
                               <div className="flex justify-between items-start mb-1">
                                 <h3 className="font-bold text-stone-800">{ann.title}</h3>
                                 <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${ann.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>{ann.isActive ? '啟用中' : '未啟用'}</span>
                               </div>
                               <p className="text-xs text-stone-500 truncate mb-1">{ann.content}</p>
                               <div className="text-[10px] text-stone-400 mt-auto">
                                 {ann.isPermanent ? '永久顯示' : (ann.expireDate ? `顯示至 ${ann.expireDate}` : '未設定期限')} | {ann.showOnLoad ? '進站主動彈出' : '僅顯示標題列'}
                               </div>
                             </div>
                             
                             <div className="absolute top-3 right-3 flex gap-1">
                               <button onClick={() => {setTempAnnounce(ann); setIsEditingAnnounce(true);}} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md bg-white border border-blue-100 shadow-sm"><EditIcon size={16}/></button>
                               <button onClick={() => deleteAnnouncement(ann.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md bg-white border border-red-100 shadow-sm"><Trash2 size={16}/></button>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <label className="flex items-center gap-2 bg-purple-50 p-3 rounded-xl border border-purple-200 cursor-pointer">
                          <input type="checkbox" checked={tempAnnounce.isActive} onChange={e=>setTempAnnounce({...tempAnnounce, isActive: e.target.checked})} className="accent-purple-600 w-5 h-5"/>
                          <span className="font-bold text-purple-800">啟用此公告</span>
                       </label>

                       <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-500">公告標題</label>
                          <input type="text" value={tempAnnounce.title||''} onChange={e=>setTempAnnounce({...tempAnnounce, title: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="例如：春節連假出貨公告" />
                       </div>

                       <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-500">公告內容</label>
                          <textarea value={tempAnnounce.content||''} onChange={e=>setTempAnnounce({...tempAnnounce, content: e.target.value})} rows="4" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"></textarea>
                       </div>

                       <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-500">公告圖片 (選填)</label>
                          <div className="relative">
                             <div className="h-32 bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center relative overflow-hidden group">
                                {tempAnnounce.image ? <img src={tempAnnounce.image} className="w-full h-full object-contain" /> : <div className="text-stone-400 flex flex-col items-center"><ImagePlus size={24}/></div>}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"><Camera size={24} className="text-white"/><input type="file" accept="image/*" className="hidden" onChange={(e)=>handleImageUpload(e.target.files[0], img=>setTempAnnounce({...tempAnnounce, image:img}))} /></label>
                             </div>
                             {tempAnnounce.image && (
                                <button onClick={() => setTempAnnounce({...tempAnnounce, image: ''})} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-lg hover:bg-rose-600 z-10 hover:scale-110 transition-transform">
                                   <X size={14}/>
                                </button>
                             )}
                          </div>
                       </div>

                       <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-3">
                          <label className="flex items-center gap-2 text-sm font-bold text-stone-700 cursor-pointer">
                             <input type="checkbox" checked={tempAnnounce.showOnLoad} onChange={e=>setTempAnnounce({...tempAnnounce, showOnLoad: e.target.checked})} className="accent-purple-600 w-4 h-4"/> 首頁載入時主動跳出大視窗 (每個用戶只跳一次)
                          </label>
                          <div className="border-t border-stone-200 pt-3">
                             <label className="flex items-center gap-2 text-sm font-bold text-stone-700 cursor-pointer mb-2">
                                <input type="checkbox" checked={tempAnnounce.isPermanent} onChange={e=>setTempAnnounce({...tempAnnounce, isPermanent: e.target.checked})} className="accent-purple-600 w-4 h-4"/> 永久顯示 (不設定期限)
                             </label>
                             {!tempAnnounce.isPermanent && (
                                <div className="flex items-center gap-2 text-sm">
                                   <span className="text-stone-500 font-bold">下架日期：</span>
                                   <input type="date" value={tempAnnounce.expireDate||''} onChange={e=>setTempAnnounce({...tempAnnounce, expireDate: e.target.value})} className="bg-white border border-stone-300 rounded px-2 py-1 outline-none focus:border-purple-400" />
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                {isEditingAnnounce && (
                  <div className="mt-4 pt-4 border-t border-stone-100 flex gap-2">
                    <button onClick={() => setIsEditingAnnounce(false)} className="flex-1 bg-stone-100 text-stone-600 font-bold py-2.5 rounded-xl hover:bg-stone-200 transition-colors">取消</button>
                    <button onClick={saveAnnouncement} className="flex-[2] bg-purple-600 text-white font-bold py-2.5 rounded-xl shadow-md active:scale-95 transition-transform">儲存公告</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 前台大公告視窗 */}
          {showAnnouncementModal && viewingAnnounce && (
             <div className="fixed inset-0 z-[60] flex justify-center items-center bg-black/60 backdrop-blur-sm px-4">
              <div className="bg-white p-1 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 relative border border-stone-100 overflow-hidden flex flex-col max-h-[85vh]">
                <button onClick={() => setShowAnnouncementModal(false)} className="absolute top-3 right-3 text-stone-400 hover:bg-stone-100 p-1.5 rounded-full z-10 bg-white/80 backdrop-blur"><X size={20} /></button>
                <div className="flex-1 overflow-y-auto p-5">
                   <h2 className="text-xl font-black text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-3"><Megaphone size={24} className="text-amber-500"/> {viewingAnnounce.title}</h2>
                   {viewingAnnounce.image && (
                      <div className="w-full bg-stone-50 rounded-xl overflow-hidden mb-4 border border-stone-100">
                         <img src={viewingAnnounce.image} className="w-full object-contain" />
                      </div>
                   )}
                   <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{viewingAnnounce.content}</div>
                </div>
                <div className="p-4 bg-stone-50 border-t border-stone-100">
                   <button onClick={() => setShowAnnouncementModal(false)} className="w-full bg-stone-800 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform">我知道了</button>
                </div>
              </div>
            </div>
          )}

          {/* 商品分類管理彈窗 (管理員) */}
          {showCategoryManager && isAdminMode && (
             <div className="fixed inset-0 z-[70] flex justify-center items-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 relative border border-stone-100">
                 <button onClick={() => setShowCategoryManager(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800"><X size={20} /></button>
                 <h2 className="text-lg font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">管理商品分類</h2>
                 <div className="flex gap-2 mb-4">
                    <input type="text" value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="新增分類名稱..." className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500" />
                    <button onClick={handleAddCategory} className="bg-stone-800 text-white px-4 rounded-lg font-bold text-sm hover:bg-stone-700 shadow-sm">新增</button>
                 </div>
                 <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {categoriesList.map((cat, index) => (
                       <div key={cat.name} className="flex justify-between items-center bg-stone-50 px-3 py-2 rounded-lg border border-stone-200">
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleCategoryVisibility(index)} className={`hover:bg-stone-200 p-1 rounded-md transition-colors ${cat.isHidden ? 'text-stone-400' : 'text-blue-600'}`} title={cat.isHidden ? "點擊公開此分類" : "點擊隱藏此分類"}>
                              {cat.isHidden ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                            <span className={`font-bold text-sm ${cat.isHidden ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                             <button onClick={() => handleEditCategoryName(index, cat.name)} className="p-1 text-blue-400 hover:text-blue-600 mr-1" title="編輯分類名稱"><EditIcon size={16}/></button>
                             <button onClick={() => moveCategory(index, -1)} disabled={index === 0} className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"><ArrowUp size={16}/></button>
                             <button onClick={() => moveCategory(index, 1)} disabled={index === categoriesList.length - 1} className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"><ArrowDown size={16}/></button>
                             <button onClick={()=>handleDeleteCategory(index)} className="p-1 text-red-400 hover:text-red-600 ml-1"><Trash2 size={16}/></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
          {/* 聯絡我們 */}
          {showContactModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 relative border border-stone-100">
                <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full transition-colors"><X size={20} /></button>
                <div className="flex flex-col items-center mb-6">
                  <div className="h-48 mb-2 flex items-center justify-center relative group cursor-pointer">
  {contactData.image ? (
    <img src={contactData.image} alt="Contact" className="max-h-full max-w-[300px] object-contain" />
  ) : (
    <Store size={50} className="text-amber-700" />
  )}
  {isAdminMode && !adminOrderingFor && (
    <>
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
        <Camera size={24} className="text-white" />
      </div>
      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e.target.files[0], (img) => setContactData({...contactData, image: img}))} />
    </>
  )}
</div>
                  <h2 className="text-xl font-bold text-stone-800">聯絡我們</h2>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="flex items-start gap-3"><div className="bg-stone-100 p-2 rounded-full text-stone-500 shrink-0"><Clock size={18} /></div><div className="flex-1"><p className="text-xs font-bold text-stone-400 mb-1">營業時間</p>{isAdminMode && !adminOrderingFor ? <textarea value={contactData.businessHours} onChange={e => setContactData({...contactData, businessHours: e.target.value})} placeholder="例如：週一至週五 10:00~18:00" rows="2" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"></textarea> : <p className="text-sm text-stone-700 font-medium whitespace-pre-wrap">{contactData.businessHours || '尚未設定'}</p>}</div></div>
                  <div className="flex items-start gap-3"><div className="bg-stone-100 p-2 rounded-full text-stone-500 shrink-0"><MapPin size={18} /></div><div className="flex-1"><p className="text-xs font-bold text-stone-400 mb-1">地點</p>{isAdminMode && !adminOrderingFor ? <input type="text" value={contactData.address} onChange={e => setContactData({...contactData, address: e.target.value})} placeholder="門市地址" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500" /> : <p className="text-sm text-stone-700 font-medium">{contactData.address || '尚未設定'}</p>}</div></div>
                  <div className="flex items-start gap-3"><div className="bg-stone-100 p-2 rounded-full text-stone-500 shrink-0"><Phone size={18} /></div><div className="flex-1"><p className="text-xs font-bold text-stone-400 mb-1">電話</p>{isAdminMode && !adminOrderingFor ? <input type="tel" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} placeholder="聯絡電話" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500" /> : (contactData.phone ? <a href={`tel:${contactData.phone}`} className="text-sm font-bold text-amber-600 hover:underline">{contactData.phone}</a> : <p className="text-sm text-stone-700 font-medium">尚未設定</p>)}</div></div>
                  <div className="flex items-start gap-3"><div className="bg-[#06C755]/10 p-2 rounded-full text-[#06C755] shrink-0"><MessageCircle size={18} /></div><div className="flex-1"><p className="text-xs font-bold text-stone-400 mb-1">LINE 連結</p>{isAdminMode && !adminOrderingFor ? <input type="url" value={contactData.lineLink} onChange={e => setContactData({...contactData, lineLink: e.target.value})} placeholder="https://line.me/..." className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500" /> : (contactData.lineLink ? <a href={contactData.lineLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#06C755] hover:underline">點我加 LINE 聯繫</a> : <p className="text-sm text-stone-700 font-medium">尚未設定</p>)}</div></div>
                  <div className="flex items-start gap-3"><div className="bg-stone-100 p-2 rounded-full text-stone-500 shrink-0"><Mail size={18} /></div><div className="flex-1"><p className="text-xs font-bold text-stone-400 mb-1">Email</p>{isAdminMode && !adminOrderingFor ? <input type="email" value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})} placeholder="Email" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500" /> : (contactData.email ? <a href={`mailto:${contactData.email}`} className="text-sm font-bold text-amber-600 hover:underline break-all">{contactData.email}</a> : <p className="text-sm text-stone-700 font-medium">尚未設定</p>)}</div></div>
                  <div className="flex items-start gap-3"><div className="bg-stone-100 p-2 rounded-full text-stone-500 shrink-0"><CreditCard size={18} /></div><div className="flex-1"><p className="text-xs font-bold text-stone-400 mb-1">匯款帳號</p>{isAdminMode && !adminOrderingFor ? <textarea value={contactData.bankAccount || ''} onChange={e => setContactData({...contactData, bankAccount: e.target.value})} placeholder="例如：某某銀行 (808) 1234-5678-9000" rows="2" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"></textarea> : <p className="text-sm text-stone-700 font-medium whitespace-pre-wrap">{contactData.bankAccount || '尚未設定'}</p>}</div></div>
                </div>
                {isAdminMode && !adminOrderingFor && <button onClick={saveContactInfo} className="mt-6 w-full bg-amber-500 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform">儲存聯絡資訊</button>}
              </div>
            </div>
          )}

          {/* 關於我們 */}
          {showAboutModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4">
               <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-md md:max-w-lg h-auto max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 relative border border-stone-100">
                  <button onClick={() => {setShowAboutModal(false); setIsEditingAbout(false);}} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full transition-colors z-10"><X size={20} /></button>
                  <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
                    <span className="flex items-center gap-2"><Info size={20} className="text-blue-600"/> 關於我們</span>
                    {isAdminMode && !adminOrderingFor && !isEditingAbout && <button onClick={() => {setTempAboutData(aboutData); setIsEditingAbout(true);}} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-bold flex items-center gap-1 hover:bg-blue-100"><EditIcon size={14}/> 編輯</button>}
                  </h2>
                  <div className="flex-1 overflow-y-auto pr-2 pb-4">
                    {isEditingAbout ? (
                      <div className="space-y-4">
                        <div className="relative w-full h-48 bg-stone-100 rounded-xl overflow-hidden border-2 border-dashed border-stone-300 flex items-center justify-center group cursor-pointer">
                          {tempAboutData.image ? <img src={tempAboutData.image} className="w-full h-full object-contain group-hover:opacity-50 transition-opacity" /> : <div className="flex flex-col items-center text-stone-400"><ImagePlus size={32} className="mb-2"/><span className="text-sm font-bold">點擊上傳圖片</span></div>}
                          <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 cursor-pointer transition-opacity"><Camera size={32} className="text-white" /><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], (img) => setTempAboutData({...tempAboutData, image: img}))} /></label>
                        </div>
                        <div className="space-y-2"><label className="text-xs font-bold text-stone-500">標題</label><input type="text" value={tempAboutData.title} onChange={e => setTempAboutData({...tempAboutData, title: e.target.value})} className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 font-bold" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-stone-500">內容介紹</label><textarea value={tempAboutData.content} onChange={e => setTempAboutData({...tempAboutData, content: e.target.value})} rows="6" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"></textarea></div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {aboutData.image && <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden shadow-sm bg-stone-50 flex items-center justify-center"><img src={aboutData.image} className="w-full h-full object-contain" /></div>}
                        <div><h3 className="text-xl font-black text-stone-800 mb-3">{aboutData.title}</h3><p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{aboutData.content}</p></div>
                      </div>
                    )}
                  </div>
                  {isEditingAbout && (
                    <div className="mt-4 pt-4 border-t border-stone-100 flex gap-3"><button onClick={() => setIsEditingAbout(false)} className="flex-1 bg-stone-100 text-stone-600 font-bold py-2.5 rounded-xl transition-colors hover:bg-stone-200">取消</button><button onClick={saveAboutInfo} className="flex-[2] bg-blue-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-colors">儲存修改</button></div>
                  )}
               </div>
            </div>
          )}
{/* 產品型錄視窗 */}
          {showCatalogModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-[#Fdfbf7] p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 relative border border-stone-100">
                <button onClick={() => setShowCatalogModal(false)} className="absolute top-4 right-4 text-stone-400 hover:bg-stone-100 p-1 rounded-full transition-colors"><X size={20} /></button>
                
                <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b border-stone-100 pb-3">
                  <DownloadIcon size={24} className="text-blue-600"/> 產品型錄下載
                </h2>

                <div className="space-y-4">
                  {/* === 管理員專屬介面 === */}
                  {isAdminMode && !adminOrderingFor ? (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                      <p className="text-sm font-bold text-blue-800">管理員設定區</p>
                      
                      {catalogUrl ? (
                        <div className="space-y-2">
                          <p className="text-xs text-stone-600">目前已有上傳的型錄：</p>
                          <a href={catalogUrl} target="_blank" rel="noreferrer" className="block text-center text-sm bg-white border border-stone-200 text-stone-700 py-2 rounded-lg font-bold hover:bg-stone-50">預覽目前型錄</a>
                          <button onClick={handleDeleteCatalog} className="w-full text-sm bg-red-100 text-red-600 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors">移除型錄</button>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-600">目前尚未上傳任何型錄檔案</p>
                      )}

                      <label className="block w-full text-center bg-blue-600 text-white font-bold py-2.5 rounded-xl shadow-sm hover:bg-blue-700 transition-colors cursor-pointer mt-2">
                        <span className="flex items-center justify-center gap-2"><Plus size={16} /> {catalogUrl ? '上傳新檔直接覆蓋' : '上傳 PDF 型錄'}</span>
                        {/* 這裡限制只能選擇 pdf 檔案 */}
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
                      </label>
                    </div>
                  ) : (
                    /* === 一般客戶看到的介面 === */
                    <div className="flex flex-col items-center justify-center py-4">
                      {catalogUrl ? (
                        <>
                          <p className="text-sm text-stone-600 mb-6 text-center leading-relaxed">我們準備了詳細的產品型錄，歡迎點擊下方按鈕下載或預覽！</p>
                          {/* target="_blank" 讓它開新分頁預覽，手機版通常會直接下載或開啟 */}
                          <a href={catalogUrl} target="_blank" rel="noreferrer" className="w-full bg-stone-800 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform">
                            <DownloadIcon size={20} /> 點擊取得 PDF 型錄
                          </a>
                        </>
                      ) : (
                        <div className="text-center space-y-3 text-stone-500 py-6">
                          <ClipboardList size={48} className="mx-auto opacity-30" />
                          <p className="text-sm font-bold">目前尚未提供產品型錄下載</p>
                          <p className="text-xs">敬請期待，您可以先在網頁上方選購商品喔！</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

export default App
