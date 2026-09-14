/**
 * BestOneForYou 站点配置
 */

import { SiteConfig } from '@/types/article';

export const siteConfig: SiteConfig = {
  name: 'BestOneForYou',
  description: 'Professional sports and health platform providing expert fitness guides, nutrition advice, and practical wellness strategies',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestoneforyou.space',
  categories: [
    { id: 'fitness-training', name: 'Fitness Training', slug: 'fitness-training', icon: '🏋️', description: 'Strength and conditioning workouts for every level' },
    { id: 'running', name: 'Running', slug: 'running', icon: '🏃', description: 'Training plans and tips for runners' },
    { id: 'nutrition', name: 'Nutrition', slug: 'nutrition', icon: '🥗', description: 'Evidence-based nutrition and healthy eating' },
    { id: 'weight-management', name: 'Weight Management', slug: 'weight-management', icon: '⚖️', description: 'Sustainable strategies for fat loss and healthy weight' },
    { id: 'yoga-mobility', name: 'Yoga & Mobility', slug: 'yoga-mobility', icon: '🧘', description: 'Flexibility, mobility, and mind-body practice' },
    { id: 'gear-equipment', name: 'Gear & Equipment', slug: 'gear-equipment', icon: '�', description: 'Reviews of the best fitness gear and equipment' },
    { id: 'recovery-sleep', name: 'Recovery & Sleep', slug: 'recovery-sleep', icon: '�', description: 'Rest, recovery, and sleep optimization' },
  ],
};
