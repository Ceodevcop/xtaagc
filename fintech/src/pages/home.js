import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneIcon, 
  BoltIcon, 
  TrophyIcon, 
  WalletIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export default function Home() {
  const features = [
    {
      icon: PhoneIcon,
      title: 'Airtime & Data',
      description: 'Instant recharge for MTN, Glo, Airtel, 9mobile with best rates',
      commission: 'Up to 7.71% commission'
    },
    {
      icon: BoltIcon,
      title: 'Bill Payments',
      description: 'Pay electricity bills across all DISCOs',
      commission: '0.86% - 1.29% commission'
    },
    {
      icon: TrophyIcon,
      title: 'Betting Funding',
      description: 'Fund your betting accounts instantly',
      commission: 'Bet9ja, BetKing, 1xBet & more'
    },
    {
      icon: WalletIcon,
      title: 'Virtual Accounts',
      description: 'Get NUBAN accounts for seamless collections',
      features: 'Dynamic & static accounts'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Agent Network',
      description: 'Earn commissions as a 9PSB agent',
      earnings: '₦50 - ₦120 per account'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Compliant',
      description: 'CBN licensed, NDPR compliant',
      security: '256-bit encryption'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-blue-600">TAAGC Fintech</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Your trusted partner for airtime, data, bill payments, and banking services. 
          Powered by 9PSB - Nigeria's first Payment Service Bank.
        </p>
        <div className="space-x-4">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">
            Login
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white rounded-2xl shadow-sm">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-3">{feature.description}</p>
              <p className="text-sm font-medium text-green-600">
                {feature.commission || feature.earnings || feature.features || feature.security}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Commission Rates */}
      <section className="py-16 bg-blue-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-8">Commission Rates</h2>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4">Airtime</td>
                  <td>MTN/Airtel</td>
                  <td className="text-green-600 font-medium">3.00%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Airtime</td>
                  <td>Glo</td>
                  <td className="text-green-600 font-medium">4.29%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Airtime</td>
                  <td>9mobile</td>
                  <td className="text-green-600 font-medium">7.71%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Electricity</td>
                  <td>Most DISCOs</td>
                  <td className="text-green-600 font-medium">1.29%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Betting</td>
                  <td>Bet9ja</td>
                  <td className="text-green-600 font-medium">0.34% (₦850 cap)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Betting</td>
                  <td>BetKing</td>
                  <td className="text-green-600 font-medium">0.86% (₦860 cap)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start earning?</h2>
          <p className="text-xl mb-8 opacity-90">Join TAAGC Fintech today and enjoy the best commission rates</p>
          <Link 
            to="/register" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
