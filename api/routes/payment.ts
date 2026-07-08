import { Router, type Request, type Response } from 'express';
import * as crypto from 'crypto';
import { createNativeOrder, decryptResource, queryOrder } from '../lib/wxpay.js';
import { createDonationRecord, getDonations } from '../services/donationService.js';

const router = Router();

interface CreatePaymentRequest {
  amount: number;
  description: string;
}

router.post('/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { amount, description }: CreatePaymentRequest = body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: '无效的金额' });
      return;
    }

    const privateKey = process.env.WXPAY_PRIVATE_KEY;
    const serialNo = process.env.WXPAY_SERIAL_NO;
    const appId = process.env.WXPAY_APP_ID;
    const mchId = process.env.WXPAY_MCH_ID;

    if (!privateKey || !appId || !mchId) {
      res.status(500).json({ 
        success: false, 
        message: '微信支付配置未完成，请联系管理员' 
      });
      return;
    }

    const outTradeNo = `CYBER${Date.now()}${crypto.randomBytes(4).toString('hex')}`;
    const amountFen = Math.round(amount * 100);

    try {
      const { code_url } = await createNativeOrder({
        outTradeNo,
        description: description || '赛博乞讨捐赠',
        amountFen,
        attach: 'cyber_begging',
      });

      res.json({
        success: true,
        data: {
          appid: appId,
          code_url,
          trade_type: 'NATIVE',
          out_trade_no: outTradeNo,
        },
      });
    } catch (error) {
      console.error('微信支付请求失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '微信支付请求失败，请稍后重试' 
      });
    }
  } catch (error) {
    console.error('创建支付订单失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

router.post('/notify', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = req.body;
    const bodyStr = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    const event = JSON.parse(bodyStr);

    console.log('Received WeChat Pay webhook:', event);
    
    if (event.event_type !== 'TRANSACTION.SUCCESS') {
      res.json({ code: 'SUCCESS', message: 'ignored' });
      return;
    }

    const tx = decryptResource(event.resource) as {
      out_trade_no: string;
      trade_state: string;
      amount: { total: number };
    };

    if (tx.trade_state !== 'SUCCESS') {
      res.json({ code: 'SUCCESS', message: 'not success' });
      return;
    }

    await createDonationRecord({
      amount: tx.amount.total,
      donor_name: '匿名用户',
      transaction_id: tx.out_trade_no,
    });

    res.json({ code: 'SUCCESS', message: '成功' });
  } catch (error) {
    console.error('WxPay webhook error:', error);
    res.json({ code: 'SUCCESS', message: 'error logged' });
  }
});

router.get('/donations', async (req: Request, res: Response): Promise<void> => {
  try {
    const donations = await getDonations();
    res.json({ success: true, data: donations });
  } catch (error) {
    console.error('获取捐赠记录失败:', error);
    res.status(500).json({ success: false, message: '获取捐赠记录失败' });
  }
});

router.get('/query-order/:outTradeNo', async (req: Request, res: Response): Promise<void> => {
  try {
    const { outTradeNo } = req.params;
    const result = await queryOrder(outTradeNo);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('查询订单失败:', error);
    res.status(500).json({ success: false, message: '查询订单失败' });
  }
});

export default router;
