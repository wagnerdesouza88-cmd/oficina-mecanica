/* global React */
// =====================================================
// AutoGest — Icons (lucide-style, 1.5px, 16px default)
// =====================================================

const Icon = ({ d, size = 16, fill = "none", strokeWidth = 1.6, viewBox = "0 0 24 24", children, ...rest }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill}
       stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  Dashboard: (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>,
  Users:    (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>,
  Car:      (p) => <Icon {...p}><path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 12h14"/></Icon>,
  Wrench:   (p) => <Icon {...p}><path d="M14.7 6.3a4.5 4.5 0 0 0 6 6l-9.5 9.5a2.1 2.1 0 0 1-3-3l9.5-9.5a4.5 4.5 0 0 0-3-3z"/></Icon>,
  Clipboard:(p) => <Icon {...p}><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 15h4"/></Icon>,
  Dollar:   (p) => <Icon {...p}><path d="M12 2v20M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/></Icon>,
  Box:      (p) => <Icon {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/></Icon>,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
  Bell:     (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Icon>,
  Search:   (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Icon>,
  Plus:     (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Filter:   (p) => <Icon {...p}><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/></Icon>,
  Edit:     (p) => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></Icon>,
  Trash:    (p) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></Icon>,
  Print:    (p) => <Icon {...p}><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></Icon>,
  More:     (p) => <Icon {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Icon>,
  ChevronDown:(p)=> <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  ChevronRight:(p)=><Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  ChevronLeft:(p)=> <Icon {...p}><path d="m15 6-6 6 6 6"/></Icon>,
  Check:    (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>,
  X:        (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  Sun:      (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></Icon>,
  Moon:     (p) => <Icon {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></Icon>,
  TrendUp:  (p) => <Icon {...p}><path d="m22 7-9 9-4-4-7 7"/><path d="M16 7h6v6"/></Icon>,
  TrendDown:(p) => <Icon {...p}><path d="m22 17-9-9-4 4-7-7"/><path d="M16 17h6v-6"/></Icon>,
  Phone:    (p) => <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></Icon>,
  Mail:     (p) => <Icon {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Icon>,
  Clock:    (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Icon>,
  Truck:    (p) => <Icon {...p}><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></Icon>,
  Package:  (p) => <Icon {...p}><path d="M16.5 9.4 7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></Icon>,
  AlertTriangle:(p)=><Icon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></Icon>,
  CheckCircle:(p)=><Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/></Icon>,
  Zap:      (p) => <Icon {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></Icon>,
  Building: (p) => <Icon {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01M10 22v-4h4v4"/></Icon>,
  CreditCard:(p)=> <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></Icon>,
  Receipt:  (p) => <Icon {...p}><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2V2l-3 2-3-2-3 2-3-2-3 2z"/><path d="M8 7h8M8 11h8M8 15h5"/></Icon>,
  Tool:     (p) => <Icon {...p}><path d="M14.7 6.3a4.5 4.5 0 0 0 6 6l-9.5 9.5a2.1 2.1 0 0 1-3-3l9.5-9.5a4.5 4.5 0 0 0-3-3z"/></Icon>,
  Sliders:  (p) => <Icon {...p}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></Icon>,
  ShieldUser:(p)=> <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="10" r="2.2"/><path d="M9 16c.6-1.5 1.8-2.2 3-2.2s2.4.7 3 2.2"/></Icon>,
  ArrowDownRight:(p)=><Icon {...p}><path d="M7 7l10 10"/><path d="M17 7v10H7"/></Icon>,
  ArrowUpRight:(p)=> <Icon {...p}><path d="M7 17 17 7"/><path d="M7 7h10v10"/></Icon>,
  Speedometer:(p)=>(
    <Icon {...p} viewBox="0 0 24 24">
      <path d="M3 16a9 9 0 1 1 18 0"/>
      <path d="m13 11-3 5"/>
      <circle cx="12" cy="16" r="1.2" fill="currentColor"/>
    </Icon>
  ),
  Logo: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size||22} height={p?.size||22} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16a9 9 0 0 1 18 0"/>
      <path d="m13 10.5-3 5.5"/>
      <circle cx="12" cy="16" r="1.4" fill="currentColor"/>
    </svg>
  ),
};

window.Icons = Icons;
