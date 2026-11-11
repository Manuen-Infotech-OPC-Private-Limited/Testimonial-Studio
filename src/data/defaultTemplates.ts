import { TemplateData, TemplateId } from '../types/studio';

export const TEMPLATES: Record<TemplateId, TemplateData> = {
  'template-1': {
    id: 'template-1',
    name: 'Luxury Gold',
    subtitle: 'Dual Gold Ribbons & Banquet Frame',
    description: 'Deep navy & metallic gold curved ribbons, 3D testimonial banner, gold-bordered recommendation panel with stars, and bottom photo cutout frame.',
    width: 800,
    height: 1200,
    header: {
      leftLogoUrl: '',
      leftLogoLabel: 'Upload Left Logo',
      rightLogoUrl: '',
      rightLogoLabel: 'Upload Right Logo',
      showDivider: true,
    },
    content: {
      heading: 'TESTIMONIAL',
      bodyText:
        'I, Sambasivarao K., from the Loans Category, Hari Janardhana Fin Corp, would like to take this opportunity to express my sincere appreciation to Mr. Sadiq Hussain Garu and his team at DOME CASTLE for their exceptional hospitality and outstanding service.\n\nWhether it is a birthday celebration, family gathering, private party, or any special occasion, DOME CASTLE provides a beautiful venue and a warm, welcoming atmosphere that makes every event truly memorable. Their professionalism, attention to detail, and commitment to customer satisfaction are truly commendable.',
      recommendationTitle: 'I STRONGLY RECOMMEND',
      recommendationHighlight: 'DOME CASTLE',
      recommendationSubtitle: 'to anyone looking for an excellent venue for their celebrations.',
      bestWishesText:
        'I extend my best wishes to Sadiq Garu and the entire DOME CASTLE team for continued success and many more achievements.',
    },
    author: {
      name: 'Sambasivarao K.',
      role: 'Loans Category,',
      company: 'Hari Janardhana Fin Corp.',
      date: 'November 2026',
      signatureUrl: '',
    },
    media: {
      supportingPhotoUrl: '',
    },
    styling: {
      primaryColor: '#0c2b66',
      headingColor: '#0c2b66',
      goldColor: '#D4AF37',
      accentColor: '#1e40af',
      backgroundColor: '#FAF8F4',
      headingFont: 'Playfair Display',
      bodyFont: 'Playfair Display',
      scriptFont: 'Alex Brush',
    },
  },

  'template-2': {
    id: 'template-2',
    name: 'Elegant Minimal',
    subtitle: 'Clean Prestige & Sweeping Wave',
    description: 'Gold framing border, top-left burgundy wave accent, script heading with gold bars, giant quotation marks, and sweeping curved footer.',
    width: 800,
    height: 1200,
    header: {
      leftLogoUrl: '',
      leftLogoLabel: 'Upload Logo 1',
      rightLogoUrl: '',
      rightLogoLabel: 'Upload Logo 2',
      showDivider: false,
    },
    content: {
      heading: 'Testimonial',
      bodyText:
        'Dear Sir, I am very happy with the service you provide to our clients and for being available to everyone whenever needed. Your dedication towards the project and client satisfaction is incredible. Keep rocking, and keep building the team to give more and more service to clients.',
      thankYouHeading: 'Thank you',
      thankYouSubtitle: 'for your trust and support!',
    },
    author: {
      name: 'Client Name',
      role: '',
      company: 'Company / Establishment Name',
      date: '29 October 2026',
    },
    media: {},
    styling: {
      primaryColor: '#122c60',
      headingColor: '#122c60',
      goldColor: '#cca242',
      accentColor: '#7a2e1d',
      backgroundColor: '#ffffff',
      headingFont: 'Great Vibes',
      bodyFont: 'Montserrat',
      scriptFont: 'Great Vibes',
    },
  },

  'template-3': {
    id: 'template-3',
    name: 'Corporate Classic',
    subtitle: 'Gold Quotation Box & Corner Badges',
    description: 'Geometric navy corner triangle with gold diagonal trim, bordered quotation box with quotes, gold separator rule, and bottom swoop.',
    width: 800,
    height: 1200,
    header: {
      leftLogoUrl: '',
      leftLogoLabel: 'Upload Logo 1',
      rightLogoUrl: '',
      rightLogoLabel: 'Upload Logo 2',
      showDivider: true,
    },
    content: {
      heading: 'Testimonial',
      subheading: 'FROM CLIENT TO SERVICE PROVIDER',
      bodyText:
        'Dear Sir,\n\nIt was really a wonderful experience working with your team. Their professionalism, prompt response, and attention to detail ensured everything ran seamlessly. It was a great pleasure receiving your services.',
      thankYouHeading: 'Thank you',
      thankYouSubtitle: 'for your excellent service and support!',
    },
    author: {
      name: 'Client Name',
      role: '',
      company: 'Company / Business Name',
      date: '10/29/2026',
    },
    media: {
      watermarkUrl: '',
    },
    styling: {
      primaryColor: '#0e2b5d',
      headingColor: '#0e2b5d',
      goldColor: '#cf9d38',
      accentColor: '#1e3a8a',
      backgroundColor: '#ffffff',
      headingFont: 'Great Vibes',
      bodyFont: 'Inter',
      scriptFont: 'Great Vibes',
    },
  },
};

export const SAMPLE_DESIGNS: Array<{
  id: string;
  title: string;
  templateId: TemplateId;
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: 'sample-1',
    title: 'Hari Janardhana Fin Corp',
    templateId: 'template-1',
    status: 'draft',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
  },
  {
    id: 'sample-2',
    title: 'OSPP Customer Feedback',
    templateId: 'template-2',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(), // yesterday
  },
  {
    id: 'sample-3',
    title: 'New Star Security Services',
    templateId: 'template-3',
    status: 'completed',
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-10-30T14:30:00.000Z',
  },
  {
    id: 'sample-4',
    title: 'Dome Castle Conclave',
    templateId: 'template-1',
    status: 'draft',
    createdAt: '2026-10-24T09:00:00.000Z',
    updatedAt: '2026-10-29T11:15:00.000Z',
  },
  {
    id: 'sample-5',
    title: 'Customer Appreciation',
    templateId: 'template-2',
    status: 'completed',
    createdAt: '2026-10-20T08:00:00.000Z',
    updatedAt: '2026-10-27T16:20:00.000Z',
  },
  {
    id: 'sample-6',
    title: 'Event Partner Testimonial',
    templateId: 'template-3',
    status: 'draft',
    createdAt: '2026-10-18T11:00:00.000Z',
    updatedAt: '2026-10-25T13:40:00.000Z',
  },
];
