import React from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

// Inline SVG icon components to replace Vite ?react SVG imports.
// These replicate the original SVG files as React Native components.

const ErrorSvg: React.FC<{ width?: number; color?: string }> = ({ width = 40, color = '#F44336' }) => (
  <Svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={10} />
    <Line x1={15} y1={9} x2={9} y2={15} />
    <Line x1={9} y1={9} x2={15} y2={15} />
  </Svg>
);

const WalletSvg: React.FC<{ width?: number; color?: string }> = ({ width = 40, color = '#FFD600' }) => (
  <Svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={2} y={5} width={20} height={14} rx={2} />
    <Path d="M16 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <Path d="M2 10h20" />
  </Svg>
);

const SuccessSvg: React.FC<{ width?: number; color?: string }> = ({ width = 40, color = '#7C4DFF' }) => (
  <Svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Path d="M22 4 12 14.01l-3-3" />
  </Svg>
);

const PromotionSvg: React.FC<{ width?: number; color?: string }> = ({ width = 40, color = '#00BFA5' }) => (
  <Svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1={19} y1={5} x2={5} y2={19} />
    <Circle cx={6.5} cy={6.5} r={2.5} />
    <Circle cx={17.5} cy={17.5} r={2.5} />
  </Svg>
);

const notifications = [
  {
    id: 1,
    icon: ErrorSvg,
    iconColor: '#F44336',
    iconBg: 'rgba(244,67,54,0.1)',
    title: 'Your Order Cancel',
    message: 'Order #107 has been cancelled',
    bold: ['Order #107'],
  },
  {
    id: 2,
    icon: WalletSvg,
    iconColor: '#FFD600',
    iconBg: 'rgba(255,214,0,0.1)',
    title: 'Payment',
    message: 'Thank you! Your transaction is com...',
    bold: [],
  },
  {
    id: 3,
    icon: PromotionSvg,
    iconColor: '#00BFA5',
    iconBg: 'rgba(0,191,165,0.1)',
    title: 'Promotion',
    message: 'Invite friends - Get 1 coupons',
    bold: [],
  },
  {
    id: 4,
    icon: SuccessSvg,
    iconColor: '#7C4DFF',
    iconBg: 'rgba(124,77,255,0.1)',
    title: 'Your Order Accept',
    message: 'Order #1234 has been success...',
    bold: ['Order #1234'],
  },
];

const faqData = [
  {
    id: 1,
    question: 'How do I place an order?',
    answer:
      "Choose a restaurant, add dishes to your cart, specify delivery address and payment method, then tap 'Place Order'. You'll receive a confirmation notification for your order.",
  },
  {
    id: 2,
    question: 'How long does delivery take?',
    answer:
      'Delivery usually takes 30-60 minutes depending on restaurant workload and distance. The exact delivery time is shown when placing your order.',
  },
  {
    id: 3,
    question: 'What payment methods are available?',
    answer:
      'We accept payment by bank cards, Apple Pay, Google Pay, as well as cash to the courier upon delivery.',
  },
  {
    id: 4,
    question: 'Can I cancel my order?',
    answer:
      'You can cancel your order for free within 5 minutes of placing it. After cooking begins, cancellation is only possible with restaurant consent.',
  },
  {
    id: 5,
    question: "What if my order wasn't delivered?",
    answer:
      "Contact customer support through the in-app chat or by phone. We'll contact the courier and resolve the issue. If necessary, we'll refund your money.",
  },
  {
    id: 6,
    question: 'Is there a minimum order amount?',
    answer:
      "Minimum order amount depends on the restaurant and is usually $15-25. The exact amount is shown on each restaurant's page.",
  },
  {
    id: 7,
    question: 'How can I track my order status?',
    answer:
      "After placing your order, you can track its status in the 'My Orders' section. You'll also receive push notifications for each stage of preparation and delivery.",
  },
  {
    id: 8,
    question: 'Do you deliver to my area?',
    answer:
      "Enter your address in the app - if partner restaurants operate in your area, they'll appear in the list. Our delivery zone is constantly expanding.",
  },
  {
    id: 9,
    question: 'Can I change the delivery address?',
    answer:
      'You can change the address before the restaurant confirms your order. After cooking begins, address changes are only possible within the same delivery zone.',
  },
  {
    id: 10,
    question: 'What if items are missing from my order?',
    answer:
      "Contact customer support through the app immediately. We'll deliver the missing items for free or refund their cost to your account.",
  },
];

const onboarding = [
  {
    id: 1,
    image: 'https://george-fx.github.io/mesio-data/onboarding/01.jpg',
    title: 'Welcome to Mesio',
    description:
      'Discover amazing restaurants and delicious food delivered to your door',
  },
  {
    id: 2,
    image: 'https://george-fx.github.io/mesio-data/onboarding/02.jpg',
    title: 'Quick Food Delivery',
    description:
      'Fast and reliable delivery service to bring your favorite meals in minutes',
  },
  {
    id: 3,
    image: 'https://george-fx.github.io/mesio-data/onboarding/03.jpg',
    title: 'Enjoy Your Meal',
    description:
      'Track your order in real-time and enjoy fresh, hot food delivered with care',
  },
];

export const data = {notifications, faqData, onboarding};
