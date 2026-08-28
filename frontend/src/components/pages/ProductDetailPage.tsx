import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { CustomerApi } from '@/api/customer';
import { generateSlug, findProductBySlug } from '@/utils/slug';
import {
  getProductInventoryState,
  getSelectedSizeOption,
} from '@/utils/productInventory';
import { slugify } from '@/utils/cn';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function ProductDetailPage({
  imageUrl,
  zoomLevel = 5,
  lensSize = 290,
  previewWidth = 400,
  previewHeight = 400,
}: {
  imageUrl?: string;
  zoomLevel?: number;
  lensSize?: number;
  previewWidth?: number;
  previewHeight?: number;
} = {}) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, cart, showToast, isInWishlist, setBuyNowItem, user } = useStore();

  const { addToCart, toggleWishlist } = CustomerApi();
  const [qty, setQty] = useState(1);
  const [activeSize, setActiveSize] = useState('');

  const selectedProduct = slug ? findProductBySlug(products, slug) : undefined;
  const [activeImage, setActiveImage] = useState<string>('');
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageContainerWidth, setImageContainerWidth] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Magnifier / zoom state & refs
  const [showLens, setShowLens] = useState(false);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const pointerPos = useRef({ x: 0, y: 0 }); // target pointer position
  const animPos = useRef({ x: 0, y: 0 }); // animated (smoothed) position
  const rafRef = useRef<number | null>(null);

  // Detect touch devices to disable lens/preview on mobile
  const isTouchDevice = typeof window !== 'undefined' && (('ontouchstart' in window) || (typeof navigator !== 'undefined' && (navigator as any).maxTouchPoints > 0));
  const [isMobileWidth, setIsMobileWidth] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const onResize = () => setIsMobileWidth(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const useMobileView = isTouchDevice && isMobileWidth;

  // Cancel RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Mobile pinch-to-zoom state for admin
  const [mobileScale, setMobileScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [oneFingerZoom, setOneFingerZoom] = useState(false);
  const transformOriginRef = useRef<string>('50% 50%');
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const oneFingerStartYRef = useRef<number | null>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const mobileTranslateRef = useRef({ x: 0, y: 0 });
  const [mobileTranslate, setMobileTranslate] = useState({ x: 0, y: 0 });
  const panActiveRef = useRef<boolean>(false);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPinching) {
      if (e.touches.length < 2) {
        setIsPinching(false);
        initialPinchDistanceRef.current = null;
        initialScaleRef.current = mobileScale;
      }
    }
    if (oneFingerZoom) {
      if (e.touches.length === 0) {
        setOneFingerZoom(false);
        oneFingerStartYRef.current = null;
        initialScaleRef.current = mobileScale;
      }
    }
    if (panActiveRef.current) {
      if (e.touches.length === 0) {
        panActiveRef.current = false;
        panStartRef.current = null;
      }
    }
    // hide lens when all touches ended
    if (e.touches.length === 0) {
      setShowLens(false);
      stopRaf();
    }
  };

  const startRaf = () => {
    if (rafRef.current) return;
    const step = () => {
      const rect = imageContainerRef.current?.getBoundingClientRect();
      if (!rect) {
        rafRef.current = null;
        return;
      }
      // simple lerp for smoothing
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const tx = pointerPos.current.x;
      const ty = pointerPos.current.y;
      animPos.current.x = lerp(animPos.current.x, tx, 0.2);
      animPos.current.y = lerp(animPos.current.y, ty, 0.2);

      // update lens position
      if (lensRef.current) {
        const half = (lensSize || 150) / 2;
        lensRef.current.style.transform = `translate(${animPos.current.x - half}px, ${animPos.current.y - half}px)`;
      }

      // update preview and lens background position
      if (previewRef.current || lensRef.current) {
        const xPct = rect.width > 0 ? (animPos.current.x / rect.width) * 100 : 50;
        const yPct = rect.height > 0 ? (animPos.current.y / rect.height) * 100 : 50;
        const pos = `${xPct}% ${yPct}%`;
        if (previewRef.current) previewRef.current.style.backgroundPosition = pos;
        if (lensRef.current) lensRef.current.style.backgroundPosition = pos;
      }

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const stopRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const updatePointerFromMouse = (e: MouseEvent) => {
    updatePointerFromCoords(e.clientX, e.clientY);
  };

  const updatePointerFromCoords = (clientX: number, clientY: number) => {
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    // clamp
    x = Math.max(0, Math.min(rect.width, x));
    y = Math.max(0, Math.min(rect.height, y));
    pointerPos.current.x = x;
    pointerPos.current.y = y;
    // ensure preview background image is set and lens background configured
    const src = imageUrl || displayedImage;
    const bgSize = `${(zoomLevel || 3) * 100}% ${(zoomLevel || 3) * 100}%`;
    if (previewRef.current) {
      previewRef.current.style.backgroundImage = `url(${src})`;
      previewRef.current.style.backgroundSize = bgSize;
    }
    if (lensRef.current) {
      lensRef.current.style.backgroundImage = `url(${src})`;
      lensRef.current.style.backgroundSize = bgSize;
      lensRef.current.style.backgroundRepeat = 'no-repeat';
    }
    // ensure raf is running so lens/preview are updated
    startRaf();
  };


  const isAdmin = user.role === 'admin';
  const p = selectedProduct;
  // unified images list — include main `p.image` if not present in `p.images`
  const allImages = (() => {
    if (!p) return [] as string[];
    const arr = Array.isArray(p.images) ? [...p.images] : [];
    if (p.image && !arr.includes(p.image)) arr.unshift(p.image);
    return arr;
  })();

  const displayedImage = activeImage || p?.image || allImages[0] || '';
  const discount =
    p?.originalPrice && p?.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : 0;
  const related = p
    ? products
      .filter((r) => r.category === p.category && r._id !== p._id)
      .slice(0, 4)
    : [];
  const inventory = p
    ? getProductInventoryState(p)
    : {
      sizes: [],
      availableSizes: [],
      hasInventory: false,
      isOutOfStock: true,
    };
  const availableSizes = inventory.availableSizes;
  const outOfStock = inventory.isOutOfStock;
  const selectedSizeOption = p
    ? getSelectedSizeOption(p, activeSize)
    : undefined;
  const cartQtyForSelectedSize = p
    ? cart.filter(
      (item) => item.product._id === p._id && item.size === activeSize,
    ).reduce((total, item) => total + item.quantity, 0)
    : 0;
  const maxQtyForSelectedSize = selectedSizeOption?.units ?? 0;
  const remainingQtyForSelectedSize = selectedSizeOption
    ? Math.max(0, selectedSizeOption.units - cartQtyForSelectedSize)
    : 0;
  const liked = p ? isInWishlist(p._id) : false;

  useEffect(() => {
    if (!activeSize && availableSizes.length > 0) {
      setActiveSize(availableSizes[0].name);
    }
  }, [activeSize, availableSizes]);

  useEffect(() => {
    if (activeSize && availableSizes.length > 0) {
      const stillAvailable = availableSizes.some(
        (entry) => entry.name.toLowerCase() === activeSize.toLowerCase(),
      );
      if (!stillAvailable) {
        setActiveSize(availableSizes[0].name);
      }
    }
  }, [activeSize, availableSizes]);

  useEffect(() => {
    if (!p) {
      setActiveImage('');
      return;
    }

    setActiveImage(allImages[0] ?? '');
  }, [p?._id]);

  useEffect(() => {
    const updateImageContainerWidth = () => {
      if (imageContainerRef.current) {
        setImageContainerWidth(imageContainerRef.current.offsetWidth);
      }
    };

    updateImageContainerWidth();
    window.addEventListener('resize', updateImageContainerWidth);
    return () =>
      window.removeEventListener('resize', updateImageContainerWidth);
  }, [p?._id]);

  // reset translate when scale goes back to 1
  useEffect(() => {
    if (mobileScale <= 1) {
      mobileTranslateRef.current = { x: 0, y: 0 };
      setMobileTranslate({ x: 0, y: 0 });
      transformOriginRef.current = '50% 50%';
    }
  }, [mobileScale]);

  const getImageIndex = (img: string) =>
    allImages.findIndex((item) => item === img);

  const getWrappedIndex = (index: number) => {
    if (!allImages || allImages.length === 0) return -1;
    return ((index % allImages.length) + allImages.length) % allImages.length;
  };

  const getSwipeImageCandidate = (offset: number) => {
    if (!allImages || allImages.length === 0 || offset === 0) return null;
    const currentIndex = getImageIndex(displayedImage);
    if (currentIndex === -1) return null;
    const nextIndex = offset < 0 ? currentIndex + 1 : currentIndex - 1;
    return allImages[getWrappedIndex(nextIndex)] || null;
  };

  const getNextImageAfterSwipe = (offset: number) => {
    const threshold = 80;
    if (Math.abs(offset) < threshold) return null;
    return getSwipeImageCandidate(offset);
  };

  const swipeImageCandidate = getSwipeImageCandidate(dragOffset);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Ignore touch pointer events — touch interactions are handled by touch handlers
    if (event.pointerType === 'touch') return;
    setDragStartX(event.clientX);
    setIsDragging(true);
    setIsAnimating(false);
    setPendingImage(null);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    if (!isDragging || dragStartX === null) return;
    setDragOffset(event.clientX - dragStartX);
  };

  const finalizeDrag = () => {
    const targetImage = getNextImageAfterSwipe(dragOffset);
    const targetOffset = !imageContainerWidth
      ? 0
      : Math.abs(dragOffset) >= 80
        ? dragOffset < 0
          ? -imageContainerWidth
          : imageContainerWidth
        : 0;

    if (targetImage) {
      setPendingImage(targetImage);
    }

    setDragOffset(targetOffset);
    setIsAnimating(true);
    setIsDragging(false);
    setDragStartX(null);
  };

  const handlePointerUp = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && event.pointerType === 'touch') return;
    if (isDragging) finalizeDrag();
  };

  const handlePointerCancel = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && event.pointerType === 'touch') return;
    if (isDragging) finalizeDrag();
  };

  const handlePointerLeave = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && event.pointerType === 'touch') return;
    if (isDragging) finalizeDrag();
  };

  const handleImageTransitionEnd = () => {
    if (pendingImage) {
      setActiveImage(pendingImage);
    }
    setPendingImage(null);
    setDragOffset(0);
    setIsAnimating(false);
  };

  // Mobile-only image view (no magnifier) — use react-zoom-pan-pinch for smooth pinch/pan
  const resetTransformRef = useRef<() => void>(() => {});
  const twScaleRef = useRef<number>(1);
  const mobileImgRef = useRef<HTMLImageElement | null>(null);

  const MobileImageView = () => (
    <div
      ref={imageContainerRef}
      className="relative aspect-3/4 rounded-3xl overflow-hidden bg-maroon-50 border-2 border-gold-100 shadow-lg"
    >
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={5}
        centerOnInit={true}
        limitToBounds={true}
        wheel={{ disabled: true }}
        doubleClick={{ disabled: true }}
        pinch={{ step: 5 }}
      >
        {(tw: any) => {
          // capture reset function and current scale
          resetTransformRef.current = tw.resetTransform;
          twScaleRef.current = tw.state?.scale ?? 1;
          return (
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <img
                ref={mobileImgRef}
                src={displayedImage}
                alt={p?.name}
                className={`w-full h-full object-cover ${outOfStock ? 'opacity-75 grayscale-20' : ''}`}
              />
            </TransformComponent>
          );
        }}
      </TransformWrapper>

      {outOfStock && (
        <div className="absolute inset-0 bg-maroon-950/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
          <span className="bg-maroon-900 text-gold-200 text-sm font-bold tracking-widest px-6 py-3 rounded-full uppercase border border-gold-300 shadow-2xl">
            Out of stock
          </span>
        </div>
      )}

      {discount > 0 && (
        <div className="absolute top-4 left-4 bg-gold-500 text-white text-sm font-extrabold px-3 py-1 rounded-full shadow-md z-10">
          {discount}% OFF
        </div>
      )}
      {p?.badge && (
        <div className="absolute top-4 right-4 bg-maroon-800 text-gold-100 text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
          {p.badge}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const onPointerDown = (ev: PointerEvent) => {
      if (!useMobileView) return;
      const target = ev.target as Node | null;
      // if click/tap inside the actual image element, do nothing
      if (mobileImgRef.current && target && mobileImgRef.current.contains(target)) return;
      if (twScaleRef.current > 1 && resetTransformRef.current) {
        try {
          resetTransformRef.current();
        } catch (err) {
          // ignore
        }
      }
    };
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [useMobileView]);

  if (!p) {
    return (
      <div className="min-h-screen bg-[#fdf8f1] flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <div className="text-5xl mb-4">🪷</div>
          <p className="text-maroon-800 font-serif italic text-lg mb-4">
            {products.length === 0 ? 'Loading...' : 'No saree selected.'}
          </p>
          <Link
            to="/shop"
            className="px-6 py-3 rounded-full bg-maroon-900 text-gold-100 text-sm font-bold cursor-pointer hover:bg-maroon-800 transition-colors inline-block"
          >
            Return to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f1]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gold-100 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-maroon-700">
          <Link to="/" className="hover:text-maroon-900">
            Home
          </Link>
          <span>›</span>
          <span
            onClick={() => navigate(`/category/${slugify(p.category)}`)}
            className="hover:text-maroon-900 hover:cursor-pointer"
          >
            Catalogue
          </span>
          <span>›</span>
          <span className="text-maroon-900 font-semibold truncate">
            {p.name}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* Left: Image */}
          <div className="space-y-4">
            {useMobileView ? (
              <MobileImageView />
            ) : (
              <div
                ref={imageContainerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onPointerLeave={handlePointerLeave}
                onTouchCancel={handleTouchEnd}
                className="relative aspect-3/4 rounded-3xl overflow-hidden bg-maroon-50 border-2 border-gold-100 shadow-lg touch-none"
              >
                <div
                  className={`absolute inset-0 transition-transform ${isAnimating ? 'duration-500 ease-out' : 'duration-0'
                    }`}
                  style={{
                    transform: `translateX(${dragOffset}px) scale(${mobileScale})`,
                    transformOrigin: transformOriginRef.current,
                    transition: isPinching ? 'none' : undefined,
                  }}
                  onTransitionEnd={handleImageTransitionEnd}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={displayedImage}
                      alt={p.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${outOfStock ? 'opacity-75 grayscale-20' : ''
                        }`}
                    />
                    {swipeImageCandidate ? (
                      <img
                        src={swipeImageCandidate}
                        alt="Swipe preview"
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        style={{
                          transform: `translateX(${dragOffset < 0 ? '100%' : '-100%'})`,
                        }}
                      />
                    ) : null}
                  </div>
                </div>

                {/* Magnifier interactive overlay (mouse only) */}
                <div
                  onMouseEnter={(e) => {
                    // ignore touch
                    // e.nativeEvent is a MouseEvent here
                    setShowLens(true);
                    updatePointerFromMouse(e.nativeEvent as MouseEvent);
                    startRaf();
                  }}
                  onMouseMove={(e) => updatePointerFromMouse(e.nativeEvent as MouseEvent)}
                  onMouseLeave={() => {
                    setShowLens(false);
                    stopRaf();
                  }}
                  className="absolute inset-0 z-20"
                />

                {/* Lens */}
                <div
                  ref={lensRef}
                  style={{
                    width: `${lensSize}px`,
                    height: `${lensSize}px`,
                    borderRadius: '9999px',
                    position: 'absolute',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
                    // background image will be set dynamically to show magnified area
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '50% 50%',
                    transform: 'translate(-9999px, -9999px)',
                    transition: 'opacity 120ms linear, transform 80ms linear',
                    opacity: showLens ? 1 : 0,
                    border: '1px solid rgba(255,255,255,0.28)',
                    overflow: 'hidden',
                    zIndex: 30,
                  }}
                />

                {/* Preview */}
                {showLens && (
                  <div
                    ref={previewRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: `calc(100% + 16px)`,
                      width: `${previewWidth}px`,
                      height: `${previewHeight}px`,
                      backgroundImage: `url(${imageUrl || displayedImage})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: `${(zoomLevel || 3) * 100}% ${(zoomLevel || 3) * 100}%`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      zIndex: 40,
                    }}
                  />
                )}

                {outOfStock && (
                  <div className="absolute inset-0 bg-maroon-950/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
                    <span className="bg-maroon-900 text-gold-200 text-sm font-bold tracking-widest px-6 py-3 rounded-full uppercase border border-gold-300 shadow-2xl">
                      Out of stock
                    </span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-gold-500 text-white text-sm font-extrabold px-3 py-1 rounded-full shadow-md z-10">
                    {discount}% OFF
                  </div>
                )}
                {p.badge && (
                  <div className="absolute top-4 right-4 bg-maroon-800 text-gold-100 text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                    {p.badge}
                  </div>
                )}
              </div>
            )}

            {/* Thumbnail strip */}
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((img, i) => (
                <div
                  key={img || i}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${displayedImage === img
                    ? 'border-maroon-800'
                    : 'border-gold-100 hover:border-gold-400'
                    }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-bold text-gold-600 tracking-widest uppercase">
                {p.category}
              </span>
              <h1 className="flex font-display gap-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-maroon-900 mt-1 leading-snug">
                {p.name}
                <button
                  onClick={() => (toggleWishlist(p._id))}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all z-999 cursor-pointer ${liked
                    ? 'bg-maroon-900 text-gold-300'
                    : 'bg-white/90 backdrop-blur text-maroon-500 hover:text-maroon-900'
                    }`}
                  title="Wishlist"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={liked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={liked ? 0 : 1.8}
                    className="w-6 h-6"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    fill={i < Math.round(p.rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className={`w-4 h-4 ${i < Math.round(p.rating) ? 'text-gold-500' : 'text-gold-200'}`}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-maroon-800">
                {p.rating}
              </span>
              <span className="text-sm text-maroon-700/50">
                · Verified patron reviews
              </span>
            </div>

            {/* Price block */}
            <div className="bg-maroon-50 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div className="flex items-center flex-wrap">
                <span className="font-display text-3xl font-bold text-maroon-900">
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
                {p.originalPrice && (
                  <span className="ml-3 text-sm text-maroon-400 line-through">
                    ₹{p.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && (
                  <span className="ml-2 text-sm text-emerald-700 font-bold">
                    You save ₹
                    {(p.originalPrice! - p.price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {outOfStock ? (
                <span className="text-xs bg-maroon-100 text-maroon-800 font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                  Sold Out
                </span>
              ) : (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                  ✓ In Stock
                </span>
              )}
            </div>

            {/* Size / Length Selection */}
            <div className="mb-6 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-maroon-900 uppercase tracking-wider">
                  Size / Length:
                </span>
                {availableSizes.length > 0 ? (
                  availableSizes.map((sz) => (
                    <button
                      key={sz.name}
                      type="button"
                      onClick={() => setActiveSize(sz.name)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${activeSize === sz.name
                        ? 'border-maroon-900 bg-maroon-900 text-gold-200 shadow-sm'
                        : 'border-gold-200 bg-white text-maroon-900 hover:bg-gold-50'
                        }`}
                    >
                      {sz.name}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-maroon-700/70">
                    No size options are currently available.
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="text-sm text-maroon-800/90 leading-relaxed mb-6 space-y-2">
              <div dangerouslySetInnerHTML={{ __html: p.description || '' }} />
            </div>

            {/* Quantity */}
            {!outOfStock && (
              <div className="flex items-center gap-4 mb-5">
                <span className="text-xs font-bold text-maroon-900 uppercase tracking-wider">
                  Qty:
                </span>
                <div className="flex items-center border-2 border-gold-200 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center text-maroon-900 font-bold hover:bg-maroon-50 transition-colors cursor-pointer text-lg"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-maroon-900">
                    {qty}
                  </span>
                  <button
                    onClick={() => {
                      if (!selectedSizeOption) {
                        showToast(
                          'This size is currently out of stock.',
                          'warning',
                        );
                        return;
                      }

                      if (qty >= maxQtyForSelectedSize) {
                        showToast(
                          `Only ${maxQtyForSelectedSize} unit(s) available for this size.`,
                          'warning',
                        );
                        return;
                      }
                      setQty(qty + 1);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-maroon-900 font-bold hover:bg-maroon-50 transition-colors cursor-pointer text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="space-y-3">
              {outOfStock ? (
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full py-4 rounded-2xl bg-maroon-300 text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 cursor-not-allowed uppercase"
                  >
                    Sold Out Currently
                  </button>
                  <button
                    onClick={() =>
                      showToast(
                        `We will notify you when ${p.name} is back on looms!`,
                        'info',
                      )
                    }
                    className="w-full py-3.5 rounded-2xl border-2 border-maroon-900 text-maroon-900 hover:bg-maroon-50 font-bold text-sm tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    🔔 Notify Me When Restocked
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (isAdmin) return;
                      if (!selectedSizeOption) {
                        showToast(
                          'This size is currently out of stock.',
                          'warning',
                        );
                        return;
                      }
                      if (remainingQtyForSelectedSize <= 0) {
                        showToast(
                          'You have already reached the available quantity for this size in your bag.',
                          'warning',
                        );
                        return;
                      }
                      if (qty > remainingQtyForSelectedSize) {
                        showToast(
                          `Only ${remainingQtyForSelectedSize} unit(s) remaining for this size in your bag.`,
                          'warning',
                        );
                        return;
                      }
                      addToCart(p, qty, activeSize);
                    }}
                    className="w-full py-4 rounded-2xl bg-maroon-900 hover:bg-maroon-800 text-gold-100 font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                  >
                    🛍️ Add to Bag · {qty > 1 ? `${qty} pieces` : '1 piece'}
                  </button>
                  <button
                    onClick={() => {
                      if (isAdmin) return;
                      if (
                        !selectedSizeOption ||
                        selectedSizeOption.units <= 0
                      ) {
                        showToast(
                          'This size is currently out of stock.',
                          'warning',
                        );
                        return;
                      }
                      setBuyNowItem({
                        product: p,
                        quantity: qty,
                        size: activeSize,
                      });
                      navigate('/checkout');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-white font-bold text-sm tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    ⚡ Buy Now — ₹{(p.price * qty).toLocaleString('en-IN')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-linear-to-r from-transparent to-gold-300" />
              <h2 className="font-display text-xl font-bold text-maroon-900 px-2">
                More from {p.category}
              </h2>
              <div className="h-px flex-1 bg-linear-to-l from-transparent to-gold-300" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => {
                const d = r.originalPrice
                  ? Math.round(
                    ((r.originalPrice - r.price) / r.originalPrice) * 100,
                  )
                  : 0;
                return (
                  <Link
                    key={r._id}
                    to={`/product/${generateSlug(r._id, r.name)}`}
                    className="text-left bg-white rounded-2xl border border-gold-100 shadow-xs hover:shadow-md hover:border-gold-300 overflow-hidden group transition-all cursor-pointer flex flex-col"
                  >
                    <div className="aspect-3/4 overflow-hidden bg-maroon-50 relative w-full">
                      <img
                        src={r.image}
                        alt={r.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {d > 0 && (
                        <span className="absolute top-2 right-2 bg-gold-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          -{d}%
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <p className="font-display text-sm font-bold text-maroon-900 truncate">
                        {r.name}
                      </p>
                      <p className="font-bold text-maroon-900 text-sm mt-1">
                        ₹{r.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
