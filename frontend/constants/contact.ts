import { Mail, MapPin, Phone, Facebook, Twitter, Instagram } from 'lucide-react';
import { departments } from '@/constants/departments';

export const contactDetails = [
  { label: 'Location', value: 'Bondo Town, Siaya County, Kenya', icon: MapPin },
  { label: 'Phone Number', value: '+254 754 951 128', icon: Phone },
  { label: 'Email', value: 'info@siayacommunitydigitalhub.or.ke', icon: Mail },
];

export { departments };

export const contactEmail =
  contactDetails.find((item) => item.label === 'Email')?.value ?? 'info@siayacommunitydigitalhub.or.ke';

export const contactLocation =
  contactDetails.find((item) => item.label === 'Location')?.value ?? 'Bondo Town, Siaya County, Kenya';

export const partners = [
  'Ministry of ICT and Digital Economy',
  'Konza Technopolis',
  'ICT Authority',
  'BuuPass',
  'Kenya Films',
  'Kenya Institute of Mass Communication',
];

export const socialLinks = [
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'Twitter', href: '#', icon: Twitter },
  { label: 'Instagram', href: '#', icon: Instagram },
];
