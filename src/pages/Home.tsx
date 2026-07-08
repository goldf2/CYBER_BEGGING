import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import CyberHero from '../components/CyberHero';
import DonationPanel from '../components/DonationPanel';
import ProgressBar from '../components/ProgressBar';
import DonationRecords from '../components/DonationRecords';

interface Donation {
  id: string;
  amount: number;
  donor_name: string;
  created_at: string;
}

export default function Home() {
  const [showDonationPanel, setShowDonationPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeAmount, setQrCodeAmount] = useState(0);
  const donationPanelRef = useRef<HTMLDivElement>(null);

  const TARGET_AMOUNT = 10000;

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/payment/donations');
      const data = await response.json();
      if (data.success) {
        setDonations(data.data);
        const total = data.data.reduce((sum: number, d: Donation) => sum + d.amount, 0);
        setTotalDonated(total);
      }
    } catch (error) {
      console.error('获取捐赠记录失败:', error);
    }
  };

  const handleDonate = async (amount: number, method: 'wechat' | 'creem') => {
    setIsLoading(true);
    setShowError('');
    setShowQRCode(false);
    
    try {
      if (method === 'wechat') {
        const response = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            description: '赛博乞讨捐赠',
          }),
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const { code_url, trade_type } = data.data;
          
          if (trade_type === 'NATIVE' && code_url) {
            setQrCodeUrl(code_url);
            setQrCodeAmount(amount);
            setShowQRCode(true);
            setIsLoading(false);
            
            const checkInterval = setInterval(() => {
              fetchDonations().then(() => {
                const recentDonation = donations.find(d => d.amount === amount);
                if (recentDonation) {
                  clearInterval(checkInterval);
                  setShowQRCode(false);
                  setShowSuccess(true);
                  setTimeout(() => {
                    setShowSuccess(false);
                  }, 3000);
                }
              });
            }, 3000);
          }
        } else {
          setShowError(data.message || '支付配置未完成，请联系管理员');
          setIsLoading(false);
        }
      } else {
        const response = await fetch('/api/creem/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            description: '赛博乞讨捐赠',
          }),
        });
        
        const data = await response.json();
        
        if (data.success && data.data?.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
        } else {
          setShowError(data.message || 'Creem 支付配置未完成，请联系管理员');
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('支付请求失败:', error);
      setShowError('支付请求失败，请稍后重试');
      setIsLoading(false);
    }
  };

  const scrollToDonationPanel = () => {
    setShowDonationPanel(true);
    setTimeout(() => {
      donationPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-cyber-black">
      <CyberHero onDonateClick={scrollToDonationPanel} />

      <section className="py-16 px-4 cyber-grid-dense">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-orbitron text-white mb-4">
              <span className="text-cyber-cyan">//</span> DONATION CENTER
            </h2>
            <p className="text-gray-400 font-cyber">选择你的捐赠金额，支持赛博乞讨事业</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2" ref={donationPanelRef}>
              <DonationPanel onDonate={handleDonate} isLoading={isLoading} />
              
              {showSuccess && (
                <div className="mt-4 p-4 bg-cyber-green/10 border border-cyber-green/50 rounded-lg text-center">
                  <div className="text-cyber-green font-orbitron text-lg">DONATION SUCCESS!</div>
                  <div className="text-gray-400 text-sm mt-2">感谢你的慷慨捐赠！</div>
                </div>
              )}
              
              {showError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-center">
                  <div className="text-red-400 font-orbitron text-lg">ERROR</div>
                  <div className="text-gray-400 text-sm mt-2">{showError}</div>
                </div>
              )}
              
              {showQRCode && qrCodeUrl && (
                <div className="mt-4 p-6 bg-cyber-dark/80 backdrop-blur-sm border border-cyber-cyan/30 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse" />
                    <span className="text-cyber-cyan font-orbitron text-lg">SCAN TO PAY</span>
                  </div>
                  <div className="relative inline-block p-4 bg-white rounded-lg">
                    <QRCodeSVG value={qrCodeUrl} size={200} level="H" />
                    <div className="absolute inset-0 rounded-lg border-2 border-cyber-cyan/50" />
                  </div>
                  <div className="mt-4">
                    <span className="text-gray-400 font-cyber text-sm">Amount:</span>
                    <span className="text-cyber-green font-orbitron text-2xl ml-2">{qrCodeAmount}</span>
                    <span className="text-gray-400 font-cyber text-sm ml-1">CNY</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-2 font-cyber">使用微信扫码完成支付</p>
                  <button
                    onClick={() => setShowQRCode(false)}
                    className="mt-4 px-4 py-2 border border-gray-600 text-gray-400 font-cyber text-sm hover:border-cyber-cyan hover:text-cyber-cyan transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <ProgressBar current={totalDonated} target={TARGET_AMOUNT} />
              <DonationRecords donations={donations} />
            </div>
          </div>
        </div>
      </section>

      <footer className="relative py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <span className="text-gray-500 font-cyber text-xs">SYSTEM: ONLINE</span>
            <span className="text-gray-500 font-cyber text-xs">SECURE: 256-BIT</span>
            <span className="text-gray-500 font-cyber text-xs">PAYMENT: WECHAT</span>
          </div>
          <div className="text-gray-600 font-orbitron text-xs">
            CYBER BEGGING NETWORK © 2024
          </div>
        </div>
      </footer>
    </div>
  );
}
