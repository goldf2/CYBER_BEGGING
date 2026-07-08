import { Router, type Request, type Response } from 'express';
import * as crypto from 'crypto';
import { getCreem, type CreemWebhookEvent } from '../lib/creem.js';
import { createDonationRecord } from '../services/donationService.js';

const router = Router();

const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET!;

function getProductId(amount: number): string {
  const map: Record<number, string> = {
    1: process.env.CREEM_PRODUCT_1USD || '',
    2: process.env.CREEM_PRODUCT_2USD || '',
    5: process.env.CREEM_PRODUCT_5USD || '',
    10: process.env.CREEM_PRODUCT_10USD || '',
  };
  return map[amount] || '';
}

router.post('/create-checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: '无效的金额' });
      return;
    }

    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      res.status(500).json({ success: false, message: 'Creem 支付配置未完成，请联系管理员' });
      return;
    }

    const productId = getProductId(amount);
    if (!productId) {
      res.status(400).json({ success: false, message: `不支持的金额: ${amount} USD，请选择 1/2/5/10 USD` });
      return;
    }

    const origin = req.headers.origin || 'http://localhost:5173';

    const checkout = await getCreem().checkouts.create({
      productId,
      customer: {
        email: `donor_${Date.now()}@example.com`,
      },
      successUrl: `${origin}/?donation=success`,
      metadata: {
        amount: amount,
        description: description || '赛博乞讨捐赠',
        payment_type: 'donation',
      },
    });

    res.json({
      success: true,
      data: {
        checkoutUrl: checkout.checkoutUrl,
      },
    });
  } catch (error) {
    console.error('Creem checkout error:', error);
    res.status(500).json({ success: false, message: 'Creem 支付请求失败，请稍后重试' });
  }
});

router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = req.body;
    const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody?.toString() || '';
    const signature = req.headers['creem-signature'] || '';

    const expectedSignature = crypto
      .createHmac('sha256', CREEM_WEBHOOK_SECRET)
      .update(bodyStr)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      res.status(401).json({ success: false, message: 'Invalid signature' });
      return;
    }

    const event = JSON.parse(bodyStr) as CreemWebhookEvent;
    console.log('Received Creem webhook event:', event.eventType, event.object?.id);

    switch (event.eventType) {
      case 'checkout.completed':
        await handleCheckoutCompleted(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.eventType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing Creem webhook:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

async function handleCheckoutCompleted(event: CreemWebhookEvent) {
  const checkout = event.object;
  console.log('Processing completed checkout:', checkout);

  try {
    const order = checkout.order;
    const amount = order.amount;

    await createDonationRecord({
      amount: Math.round(amount * 100),
      donor_name: checkout.customer?.email || '匿名用户',
      transaction_id: order.id,
    });
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error;
  }
}

export default router;
