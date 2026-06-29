import { CustomerApi } from '@/api/customer';
import { useStore } from '@/context/StoreContext';
import { RazorpayPaymentProps } from '@/types';

export const RazorpayApi = () => {
  const { createRazorpayOrder, verifyRazorpayPayment, clearCart } =
    CustomerApi();
  const {
    buyNowItem,
    cartTotal,
    couponDiscountPercentage,
    setCouponCode,
    setCouponDiscountPercentage,
  } = useStore();

  const orderSubtotal = buyNowItem
    ? buyNowItem.product.price * buyNowItem.quantity
    : cartTotal;
  const discountAmount = Math.round(
    orderSubtotal * (couponDiscountPercentage / 100),
  );
  const orderTotal = orderSubtotal - discountAmount;

  const ensureRazorpayScript = () =>
    new Promise<void>((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const existingScript = document.getElementById(
        'razorpay-checkout-script',
      );
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), {
          once: true,
        });
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Unable to load Razorpay.')),
          { once: true },
        );
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Razorpay.'));
      document.body.appendChild(script);
    });

  const handleRazorpayPayment = async ({
    setIsProcessingPayment,
    setPaymentFeedback,
    name,
    email,
    phone,
    address,
    setPayment,
    setOrderId,
    setOtpSent,
    setOtp,
    setOtpVerified,
    orderData,
  }: RazorpayPaymentProps) => {
    const restorePageScroll = () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    setIsProcessingPayment(true);
    setPaymentFeedback({
      type: 'loading',
      message: 'Preparing Razorpay checkout…',
    });

    try {
      const razorpayResponse = await createRazorpayOrder({
        amount: orderTotal,
        orderData: {
          name,
          email,
          phone,
          address,
          paymentMethod: 'Razorpay',
          total: orderTotal,
        },
      });

      if (!razorpayResponse?.success || !razorpayResponse.data?.orderId) {
        throw new Error(
          razorpayResponse?.message || 'Unable to start Razorpay.',
        );
      }

      await ensureRazorpayScript();

      const options = {
        key: razorpayResponse.data.keyId,
        amount: razorpayResponse.data.amount,
        currency: razorpayResponse.data.currency || 'INR',
        name: 'Hamsini Silks',
        description: 'Order payment',
        order_id: razorpayResponse.data.orderId,
        prefill: {
          name,
          email,
          contact: phone,
        },
        modal: {
          ondismiss: () => {
            restorePageScroll();
            setPaymentFeedback({
              type: 'error',
              message: 'Payment was cancelled. Please try again.',
            });
            setPayment('');
            setIsProcessingPayment(false);
          },
        },
        theme: {
          color: '#7b1f1f',
        },
        handler: async (response: any) => {
          try {
            const verifyResult = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderTotal,
              orderData,
            });

            if (verifyResult?.success) {
              const savedOrder = verifyResult.data;
              setOrderId(savedOrder._id);
              await clearCart();
              setCouponCode('');
              setCouponDiscountPercentage(0);
              setOtpSent(false);
              setOtp('');
              setOtpVerified(false);

              setPaymentFeedback({
                type: 'success',
                message: 'Payment successful. Your order is confirmed.',
              });
            } else {
              setPaymentFeedback({
                type: 'error',
                message:
                  verifyResult?.message || 'Payment verification failed.',
              });
            }
          } catch (handlerError) {
            console.error('Razorpay handler failed', handlerError);
            setPaymentFeedback({
              type: 'error',
              message:
                handlerError instanceof Error
                  ? handlerError.message
                  : 'Payment verification failed.',
            });
          } finally {
            restorePageScroll();
            setIsProcessingPayment(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout could not be loaded.');
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      restorePageScroll();
      console.error('Razorpay payment failed', error);
      setPaymentFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Razorpay payment could not be completed.',
      });
      setIsProcessingPayment(false);
    }
  };

  return { handleRazorpayPayment };
};
