const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateMenuConfig() {
  try {
    console.log('Updating menu configuration...');
    
    const newConfig = {
      header: {
        logo: {
          text: 'LinkPick',
          imageUrl: null
        },
        menus: [
          { id: 'menu-1', label: '캠페인', href: '/campaigns', order: 1, visible: true },
          { id: 'menu-2', label: '인플루언서', href: '/influencers', order: 2, visible: true },
          { id: 'menu-3', label: '커뮤니티', href: '/community', order: 3, visible: true },
        ],
        ctaButton: {
          text: '시작하기',
          href: '/register',
          visible: true
        }
      },
      footer: {
        columns: [
          {
            id: 'column-1',
            title: '서비스',
            order: 1,
            links: [
              { id: 'link-1', label: '인플루언서 찾기', href: '/influencers', order: 1, visible: true },
              { id: 'link-2', label: '캠페인 만들기', href: '/campaigns/create', order: 2, visible: true },
            ]
          },
          {
            id: 'column-2',
            title: '회사',
            order: 2,
            links: [
              { id: 'link-3', label: '회사 소개', href: '/about', order: 1, visible: true },
              { id: 'link-4', label: '문의하기', href: '/contact', order: 2, visible: true },
            ]
          },
          {
            id: 'column-3',
            title: '법적 정보',
            order: 3,
            links: [
              { id: 'link-5', label: '이용약관', href: '/terms', order: 1, visible: true },
              { id: 'link-6', label: '개인정보처리방침', href: '/privacy', order: 2, visible: true },
            ]
          }
        ],
        social: [
          { platform: 'twitter', url: 'https://twitter.com/linkpick', visible: true },
          { platform: 'facebook', url: 'https://facebook.com/linkpick', visible: true },
          { platform: 'instagram', url: 'https://instagram.com/linkpick', visible: true }
        ],
        copyright: '© 2024 LinkPick. All rights reserved.'
      }
    };

    // Update the configuration
    await prisma.siteConfig.upsert({
      where: { key: 'ui-config' },
      update: { value: JSON.stringify(newConfig) },
      create: { 
        key: 'ui-config', 
        value: JSON.stringify(newConfig)
      }
    });

    console.log('✅ Menu configuration updated successfully!');
    console.log('Menus:', newConfig.header.menus.map(m => m.label).join(', '));
  } catch (error) {
    console.error('❌ Error updating menu configuration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateMenuConfig();