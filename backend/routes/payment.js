const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// @route   POST /api/payment/create-payment-intent
// @desc    Create payment intent for checkout
// @access  Private
router.post('/create-payment-intent', protect, [
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('billingAddress').notEmpty().withMessage('Billing address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { shippingAddress, billingAddress, shippingMethod = 'standard' } = req.body;

    // Get user's cart
    const cart = await Cart.findByUser(req.user.id);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Verify stock availability and calculate current prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product?.name || 'unknown'} is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          image: product.images[0]?.url || '',
          sku: product.sku
        },
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Calculate shipping cost
    const shippingCosts = {
      standard: 5.99,
      express: 12.99,
      overnight: 24.99
    };
    const shippingCost = subtotal > 100 ? 0 : shippingCosts[shippingMethod];

    // Calculate tax (example: 8.5%)
    const taxRate = 0.085;
    const tax = subtotal * taxRate;

    const total = subtotal + shippingCost + tax;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe expects cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.user.id.toString(),
        cartId: cart._id.toString(),
        itemCount: cart.totalItems.toString()
      }
    });

    // Create order with pending payment status
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress,
      paymentInfo: {
        method: 'stripe',
        paymentIntentId: paymentIntent.id,
        status: 'pending'
      },
      shipping: {
        method: shippingMethod,
        cost: shippingCost
      },
      pricing: {
        subtotal,
        shipping: shippingCost,
        tax,
        total
      }
    });

    await order.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      amount: total,
      currency: 'usd'
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/payment/confirm
// @desc    Confirm payment and complete order
// @access  Private
router.post('/confirm', protect, [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('orderId').notEmpty().withMessage('Order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { paymentIntentId, orderId } = req.body;

    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
      'paymentInfo.paymentIntentId': paymentIntentId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      order.paymentInfo.status = 'completed';
      order.paymentInfo.transactionId = paymentIntent.charges.data[0]?.id;
      order.paymentInfo.paidAt = new Date();
      order.orderStatus = 'confirmed';

      await order.save();

      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: -item.quantity,
              totalSales: item.quantity
            }
          }
        );
      }

      // Clear user's cart
      const cart = await Cart.findOne({ user: req.user.id });
      if (cart) {
        await cart.clearCart();
      }

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          total: order.pricing.total
        }
      });

    } else {
      // Payment failed
      order.paymentInfo.status = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment was not successful',
        paymentStatus: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/payment/webhook
// @desc    Stripe webhook endpoint
// @access  Public (Stripe webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update order status if not already done
      try {
        const order = await Order.findOne({
          'paymentInfo.paymentIntentId': paymentIntent.id
        });

        if (order && order.paymentInfo.status === 'pending') {
          order.paymentInfo.status = 'completed';
          order.paymentInfo.paidAt = new Date();
          order.orderStatus = 'confirmed';
          await order.save();
        }
      } catch (error) {
        console.error('Error updating order from webhook:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      try {
        const order = await Order.findOne({
          'paymentInfo.paymentIntentId': failedPayment.id
        });

        if (order) {
          order.paymentInfo.status = 'failed';
          await order.save();
        }
      } catch (error) {
        console.error('Error updating failed payment:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// @route   GET /api/payment/config
// @desc    Get Stripe publishable key
// @access  Public
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// @route   POST /api/payment/refund
// @desc    Process refund for an order
// @access  Private (Admin)
router.post('/refund', protect, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, amount, reason } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentInfo.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund order that was not successfully paid'
      });
    }

    // Create refund with Stripe
    const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.pricing.total * 100);
    
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentInfo.paymentIntentId,
      amount: refundAmount,
      reason: reason || 'requested_by_customer'
    });

    // Update order status
    order.paymentInfo.status = 'refunded';
    order.orderStatus = 'cancelled';
    order.notes.admin = `Refund processed: ${refund.id}. Reason: ${reason || 'Admin refund'}`;

    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
