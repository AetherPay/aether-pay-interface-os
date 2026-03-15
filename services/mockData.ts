
import { 
  Transaction, KPI, FeedItem, User, MakerCheckerTask, 
  CortexInsight, KYCApplication, SupportTicket, LedgerEntry, GeneratedReport,
  ApiEndpoint, FeatureFlag, Rail, Agent, WebhookLog, QuarantinedTransaction,
  AMLEvent, Merchant, AuditLog, Role, FXRate, AetherLink, LogisticsPartner, 
  LogisticsIncident, Service, Deployment
} from '../types';

export const generateTransactions = (count: number): Transaction[] => {
  const providers: Transaction['provider'][] = ['STRIPE', 'ADYEN', 'MTN', 'ORANGE', 'WAVE', 'CIRCLE'];
  const currencies = ['XOF', 'USD', 'EUR', 'NGN'];
  return Array.from({ length: count }).map((_, i) => {
    const risk = Math.floor(Math.random() * 100);
    return {
      id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: Math.floor(Math.random() * 10000000),
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      status: risk > 90 ? 'FAILED' : 'SETTLED',
      customerName: ['Uber Africa', 'Jumia', 'Netflix', 'Boutique Alpha', 'Global Ventures'][Math.floor(Math.random() * 5)],
      provider: providers[Math.floor(Math.random() * providers.length)],
      date: new Date().toISOString(),
      riskScore: risk,
      type: risk > 80 ? 'PAYOUT' : 'PAYMENT',
      urgency: risk > 85 ? 'CRITICAL' : risk > 60 ? 'ATTENTION' : 'NORMAL'
    };
  });
};

export const mockForecastData = Array.from({ length: 14 }).map((_, i) => ({
  day: `Oct ${15 + i}`,
  inflow: 2500000 + Math.random() * 1500000,
  outflow: 1800000 + Math.random() * 1200000,
  balance: 5000000 + (Math.random() * 1000000)
}));

export const mockSettlementQueue = [
  { id: 'SET-9901', merchant: 'Uber Africa', amount: 4500000, currency: 'XOF', bank: 'Ecobank SN', dueDate: 'Today' },
  { id: 'SET-9902', merchant: 'Netflix Senegal', amount: 1250000, currency: 'XOF', bank: 'SGBS', dueDate: 'Today' },
  { id: 'SET-9903', merchant: 'Jumia CI', amount: 8900000, currency: 'XOF', bank: 'BOA CI', dueDate: 'Tomorrow' },
  { id: 'SET-9904', merchant: 'Boutique Alpha', amount: 2500, currency: 'EUR', bank: 'BNP Paribas', dueDate: 'Today' },
];

export const mockReconciliationPairs = [
  { id: 'REC-001', bankRef: 'MTN-PAY-8821', ledgerRef: 'TX-4421', amount: 1500000, status: 'MATCHED' },
  { id: 'REC-002', bankRef: 'ORANGE-9921', ledgerRef: 'TX-4422', amount: 250000, status: 'MISMATCH', diff: -150 },
  { id: 'REC-003', bankRef: 'WAVE-COLL-01', ledgerRef: 'TX-4423', amount: 45000, status: 'PENDING' },
];

export const mockTreasuryStats = [
  { label: 'Total Available', value: '45.2M XOF', sub: 'Across 14 pools' },
  { label: 'Pending Settlement', value: '14.8M XOF', sub: '4 batches queued' },
  { label: 'Reserve Ratio', value: '112%', sub: 'Target: 105%' },
];

export const mockLiquidityPools = [
    { provider: 'MTN', amount: 45000000, capacity: 100000000, currency: 'XOF', status: 'OK' },
    { provider: 'ORANGE', amount: 12000000, capacity: 50000000, currency: 'XOF', status: 'LOW' },
    { provider: 'WAVE', amount: 28000000, capacity: 60000000, currency: 'XOF', status: 'OK' },
    { provider: 'CIRCLE', amount: 150000, capacity: 500000, currency: 'USDC', status: 'OK' },
];

export const mockFxRates: FXRate[] = [
  { pair: 'USD/XOF', midRate: 605.42, spreadPct: 2.5, trend: 'UP', lastUpdate: '2m ago' },
  { pair: 'EUR/XOF', midRate: 655.95, spreadPct: 1.2, trend: 'STABLE', lastUpdate: 'Just now' },
  { pair: 'USD/NGN', midRate: 1582.10, spreadPct: 4.8, trend: 'DOWN', lastUpdate: '5m ago' },
  { pair: 'GBP/XOF', midRate: 785.12, spreadPct: 3.0, trend: 'UP', lastUpdate: '12m ago' },
  { pair: 'USDC/XOF', midRate: 604.80, spreadPct: 0.5, trend: 'STABLE', lastUpdate: '1m ago' },
];

export const chartData = Array.from({ length: 24 }).map((_, i) => ({ name: `${i}:00`, volume: 1000 + Math.random() * 5000 }));
export const warRoomKPIs = [
    { id: 'vol', label: 'Global Velocity', value: '1.42B XOF', change: '+12.5%', trend: 'up' as const, status: 'NORMAL' as const },
    { id: 'success', label: 'Success Rate', value: '99.4%', change: '+0.2%', trend: 'up' as const, status: 'NORMAL' as const },
    { id: 'rev', label: 'Net Revenue', value: '42.8M XOF', change: '+5.1%', trend: 'up' as const, status: 'NORMAL' as const },
    { id: 'active', label: 'Active Nodes', value: '142', change: '0%', trend: 'neutral' as const, status: 'NORMAL' as const },
];

export const mockAMLEvents: AMLEvent[] = [
  { id: 'AML-201', timestamp: '2024-10-20 09:15', merchantName: 'Global Ventures', riskScore: 88, triggerReason: 'Unusual Payout Frequency', status: 'NEW' },
  { id: 'AML-202', timestamp: '2024-10-19 14:45', merchantName: 'Uber Africa Proxy', riskScore: 72, triggerReason: 'Cross-Border Volume Spike', status: 'INVESTIGATING' },
  { id: 'AML-203', timestamp: '2024-10-18 11:20', merchantName: 'Netflix SN', riskScore: 45, triggerReason: 'Dormant Account Activity', status: 'CLEARED' },
  { id: 'AML-204', timestamp: '2024-10-17 16:30', merchantName: 'Unknown Node 12', riskScore: 95, triggerReason: 'Potential Layering Detected', status: 'SUSPENDED' },
];

export const mockMerchants: Merchant[] = [
  { id: 'M-1001', name: 'Jumia Group', industry: 'E-commerce', tier: 'VIP', status: 'ACTIVE', healthScore: 98, gtv24h: 12500000, onboardingDate: '2022-01-15', country: 'Nigeria' },
  { id: 'M-1002', name: 'Uber Africa', industry: 'Ride Hailing', tier: 'VIP', status: 'ACTIVE', healthScore: 94, gtv24h: 8900000, onboardingDate: '2022-03-20', country: 'Senegal' },
  { id: 'M-1003', name: 'Netflix West', industry: 'Digital Services', tier: 'VIP', status: 'ACTIVE', healthScore: 92, gtv24h: 4200000, onboardingDate: '2023-05-12', country: 'Senegal' },
  { id: 'M-1004', name: 'Boutique Alpha', industry: 'Retail', tier: 'REGULAR', status: 'PENDING', healthScore: 65, gtv24h: 0, onboardingDate: '2024-10-01', country: 'Ivory Coast' },
  { id: 'M-1005', name: 'Global Ventures', industry: 'Investments', tier: 'REGULAR', status: 'SUSPENDED', healthScore: 32, gtv24h: 1200000, onboardingDate: '2023-11-30', country: 'Ghana' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'AUD-991', timestamp: '2024-10-20 16:45:12', actor: 'Jean Dupont', action: 'ROLE_MODIFICATION', target: 'Sarah Koné', ip: '102.14.22.1', status: 'SUCCESS' },
  { id: 'AUD-992', timestamp: '2024-10-20 15:30:05', actor: 'Sarah Koné', action: 'AML_CASE_RESOLUTION', target: 'AML-203', ip: '41.22.10.5', status: 'SUCCESS' },
  { id: 'AUD-993', timestamp: '2024-10-20 14:12:45', actor: 'Awa Diop', action: 'LIQUIDITY_MINT', target: 'XOF Pool', ip: '197.15.44.2', status: 'SUCCESS' },
  { id: 'AUD-994', timestamp: '2024-10-20 13:05:12', actor: 'Marc Lawson', action: 'FAILED_LOGIN_ATTEMPT', target: 'm.lawson@aetherpay.io', ip: '88.14.22.9', status: 'FAILURE' },
  { id: 'AUD-995', timestamp: '2024-10-20 12:55:30', actor: 'Jean Dupont', action: 'IP_BLACKLIST_UPDATE', target: '185.22.11.0/24', ip: '102.14.22.1', status: 'SUCCESS' },
  { id: 'AUD-996', timestamp: '2024-10-20 11:40:00', actor: 'Sarah Koné', action: 'MERCHANT_STATUS_CHANGE', target: 'M-1005', ip: '41.22.10.5', status: 'SUCCESS' },
];

export const mockComplianceReports: GeneratedReport[] = [
  { id: 'REP-BCEAO-01', name: 'Q3 Financial Integrity Report', author: 'Sarah Koné', type: 'COMPLIANCE', generatedAt: '2024-10-15', format: 'PDF', size: '4.2 MB', status: 'READY', hash: 'sha256:8f2a...' },
  { id: 'REP-AML-99', name: 'October Suspicious Activity Summary', author: 'SYSTEM', type: 'COMPLIANCE', generatedAt: '2024-10-19', format: 'CSV', size: '1.8 MB', status: 'READY', hash: 'sha256:b3e4...' },
  { id: 'REP-TAX-24', name: 'Merchant VAT Deductions (Senegal)', author: 'Treasury Node', type: 'FINANCIAL', generatedAt: '2024-10-18', format: 'PDF', size: '2.5 MB', status: 'READY', hash: 'sha256:d1c2...' },
];

export const mockTickets: SupportTicket[] = [
  { id: 'TIC-1021', priority: 'CRITICAL', subject: 'Payout Delayed - Jumia CI', customerName: 'Jumia Group', customerEmail: 'finance@jumia.ci', customerTier: 'VIP', category: 'FINANCIAL', slaDue: '2h remaining', status: 'OPEN', messages: [], lastReply: 'System' },
  { id: 'TIC-1022', priority: 'NORMAL', subject: 'API Key Regeneration Issue', customerName: 'Uber Africa', customerEmail: 'tech@uber.africa', customerTier: 'VIP', category: 'TECHNICAL', slaDue: '14h remaining', status: 'PENDING', messages: [], lastReply: 'Agent' },
  { id: 'TIC-1023', priority: 'LOW', subject: 'Update Billing Information', customerName: 'Boutique Alpha', customerEmail: 'hello@alpha.shop', customerTier: 'REGULAR', category: 'ADMIN', slaDue: '2 days remaining', status: 'OPEN', messages: [], lastReply: 'Customer' },
  { id: 'TIC-1024', priority: 'CRITICAL', subject: 'Chargeback Dispute - TX-9921', customerName: 'Netflix West', customerEmail: 'support@netflix.com', customerTier: 'VIP', category: 'RISK', slaDue: 'Expired', status: 'OPEN', messages: [], lastReply: 'System' },
];

export const mockAetherLinks: AetherLink[] = [
  { id: 'LNK-001', alias: 'Black Friday Sale', url: 'https://pay.aether.io/l/blackfriday24', merchantName: 'Jumia Group', clicks: 12500, volume: 45000000, currency: 'XOF', status: 'ACTIVE', createdAt: '2024-10-10' },
  { id: 'LNK-002', alias: 'Subscription Renewal', url: 'https://pay.aether.io/l/netflix-renew', merchantName: 'Netflix West', clicks: 890, volume: 1250000, currency: 'XOF', status: 'ACTIVE', createdAt: '2024-10-15' },
  { id: 'LNK-003', alias: 'Flash Promo - Alpha', url: 'https://pay.aether.io/l/alpha-flash', merchantName: 'Boutique Alpha', clicks: 45, volume: 0, currency: 'XOF', status: 'EXPIRED', createdAt: '2024-09-01' },
  { id: 'LNK-004', alias: 'Global Bridge Payout', url: 'https://pay.aether.io/l/bridge-tx-99', merchantName: 'Global Ventures', clicks: 12, volume: 2500, currency: 'USD', status: 'REVOKED', createdAt: '2024-10-18' },
];

export const mockLogisticsPartners: LogisticsPartner[] = [
  { id: 'LP-DHL', name: 'DHL Express', coverage: ['Senegal', 'Ivory Coast', 'Nigeria', 'Ghana'], status: 'CONNECTED', activeDeliveries: 425, avgDeliveryTime: '2.4 days', apiHealth: 99.8 },
  { id: 'LP-FEDEX', name: 'FedEx Africa', coverage: ['Global'], status: 'CONNECTED', activeDeliveries: 120, avgDeliveryTime: '3.1 days', apiHealth: 98.5 },
  { id: 'LP-BOLLORE', name: 'Bolloré Logistics', coverage: ['West Africa Cluster'], status: 'DEGRADED', activeDeliveries: 850, avgDeliveryTime: '5.2 days', apiHealth: 74.2 },
  { id: 'LP-LOCALSN', name: 'Paps Senegal', coverage: ['Senegal'], status: 'CONNECTED', activeDeliveries: 210, avgDeliveryTime: '0.8 days', apiHealth: 99.9 },
];

export const mockLogisticsIncidents: LogisticsIncident[] = [
  { id: 'INC-SHIP-01', type: 'CUSTOMS_HOLD', status: 'OPEN', severity: 'CRITICAL', merchantName: 'Jumia Group', trackingId: 'AWB-882199', timestamp: '2024-10-20 08:30', description: 'Batch #441 held at Port of Dakar for documentation mismatch.' },
  { id: 'INC-SHIP-02', type: 'DELIVERY_FAILURE', status: 'INVESTIGATING', severity: 'NORMAL', merchantName: 'Boutique Alpha', trackingId: 'AWB-100292', timestamp: '2024-10-19 14:20', description: 'Recipient unavailable in Abidjan (Zone 4). Re-attempt scheduled.' },
  { id: 'INC-SHIP-03', type: 'PACKAGE_LOST', status: 'OPEN', severity: 'CRITICAL', merchantName: 'Netflix West', trackingId: 'AWB-991200', timestamp: '2024-10-18 11:00', description: 'Device kit reported missing during Bolloré last-mile handover.' },
];

export const mockServices: Service[] = [
  { id: 'svc-core', name: 'AetherCore API', version: 'v2.4.12', status: 'HEALTHY', cpu: 14, memory: '1.2GB / 4GB', uptime: '42 days', instances: 8 },
  { id: 'svc-auth', name: 'Sentinel Auth', version: 'v1.0.4', status: 'HEALTHY', cpu: 8, memory: '512MB / 2GB', uptime: '12 days', instances: 4 },
  { id: 'svc-bridge', name: 'FX Bridge', version: 'v3.2.0', status: 'DEGRADED', cpu: 78, memory: '3.8GB / 4GB', uptime: '4 hours', instances: 2 },
  { id: 'svc-ledger', name: 'WORM Ledger', version: 'v0.9.8', status: 'HEALTHY', cpu: 12, memory: '2GB / 8GB', uptime: '156 days', instances: 12 },
];

export const mockWebhookLogs: WebhookLog[] = [
  { id: 'WH-001', merchantName: 'Jumia Group', event: 'payment.captured', url: 'https://api.jumia.ci/webhooks', status: 200, timestamp: '2m ago', attempt: 1, duration: 142 },
  { id: 'WH-002', merchantName: 'Netflix West', event: 'subscription.failed', url: 'https://hooks.netflix.com/aether', status: 502, timestamp: '5m ago', attempt: 3, duration: 2500 },
  { id: 'WH-003', merchantName: 'Uber Africa', event: 'payout.initiated', url: 'https://uber.africa/ops/hooks', status: 201, timestamp: '12m ago', attempt: 1, duration: 88 },
  { id: 'WH-004', merchantName: 'Boutique Alpha', event: 'payment.captured', url: 'https://alpha.shop/webhooks', status: 404, timestamp: '15m ago', attempt: 5, duration: 120 },
];

export const mockDeployments: Deployment[] = [
  { id: 'DEP-9921', service: 'AetherCore API', version: 'v2.4.12', environment: 'PROD', status: 'SUCCESS', timestamp: '2h ago', author: 'Jean Dupont', hash: '8f2a1b9' },
  { id: 'DEP-9920', service: 'FX Bridge', version: 'v3.2.0', environment: 'PROD', status: 'SUCCESS', timestamp: '5h ago', author: 'Sarah Koné', hash: 'c1d2e3f' },
  { id: 'DEP-9919', service: 'Sentinel Auth', version: 'v1.1.0-rc1', environment: 'STAGING', status: 'IN_PROGRESS', timestamp: 'Just now', author: 'Marc Lawson', hash: 'a1b2c3d' },
  { id: 'DEP-9918', service: 'WORM Ledger', version: 'v0.9.8', environment: 'PROD', status: 'SUCCESS', timestamp: 'Yesterday', author: 'System', hash: 'e5f6g7h' },
];

export const mockUsers: User[] = [
  { id: 'U-001', name: 'Sarah Koné', email: 's.kone@aetherpay.io', role: 'SUPER_ADMIN', status: 'ACTIVE', mfaEnabled: true, lastLogin: '10m ago' },
  { id: 'U-002', name: 'Marc Lawson', email: 'm.lawson@aetherpay.io', role: 'CCO', status: 'ACTIVE', mfaEnabled: true, lastLogin: '2h ago' },
  { id: 'U-003', name: 'Jean Dupont', email: 'j.dupont@aetherpay.io', role: 'CTO', status: 'ACTIVE', mfaEnabled: true, lastLogin: 'Yesterday' },
  { id: 'U-004', name: 'Awa Diop', email: 'a.diop@aetherpay.io', role: 'RISK_ANALYST', status: 'ACTIVE', mfaEnabled: false, lastLogin: '3 days ago' },
  { id: 'U-005', name: 'Kevin Mensah', email: 'k.mensah@aetherpay.io', role: 'L1_SUPPORT_AGENT', status: 'LOCKED', mfaEnabled: true, lastLogin: 'N/A' },
];

export const mockPermissionsMatrix = [
  { 
    category: 'Core Systems',
    permissions: [
      { id: 'SYS_SETTINGS', label: 'System Configuration', roles: ['SUPER_ADMIN', 'CTO'] },
      { id: 'USER_MGMT', label: 'User Provisioning', roles: ['SUPER_ADMIN', 'CTO'] },
      { id: 'API_KEYS', label: 'API Key Management', roles: ['SUPER_ADMIN', 'CTO', 'DEVELOPER'] },
    ]
  },
  {
    category: 'Finance & Treasury',
    permissions: [
      { id: 'TREASURY_MINT', label: 'Liquidity Mint/Burn', roles: ['SUPER_ADMIN', 'TREASURER', 'LIQUIDITY_MANAGER'] },
      { id: 'SETTLEMENT_AUTH', label: 'Authorize Payouts', roles: ['SUPER_ADMIN', 'CCO', 'PAYOUT_SUPERVISOR'] },
      { id: 'LEDGER_READ', label: 'View General Ledger', roles: ['SUPER_ADMIN', 'CCO', 'TREASURER', 'FINANCE_CLERK', 'ADMIN'] },
    ]
  },
  {
    category: 'Risk & Compliance',
    permissions: [
      { id: 'RISK_RULES', label: 'Modify Risk Rules', roles: ['SUPER_ADMIN', 'CCO', 'FRAUD_STRATEGY_LEAD'] },
      { id: 'QUARANTINE_REL', label: 'Release Quarantined TX', roles: ['SUPER_ADMIN', 'CCO', 'FRAUD_INVESTIGATOR', 'RISK_ANALYST'] },
      { id: 'KYC_APPROVE', label: 'Approve Merchant KYB', roles: ['SUPER_ADMIN', 'CCO', 'KYB_ANALYST_SENIOR'] },
    ]
  }
];

export const mockAetherLinksLegacy = [];
export const mockActiveSessions = [];
export const mockSecurityKPIs = [];
export const mockFeatureFlags = [];
export const mockApiEndpoints = [];
export const liveFeedData = [];
export const architectureChecklist = [];
export const mockMakerCheckerTasks = [];
export const mockAgents = [];
export const mockRailStatus = [];
export const mockKYCApps = [];
export const cortexInsights = [];
export const mockIncidents = [];
export const mockGeneratedReports = [];
export const mockScheduledReports = [];
export const treasuryNetFlow = [];
export const mockLedger = [];
export const mockRiskRules = [];
export const mockQuarantinedTransactions = [];
export const mockThreatLogs = [];
export const mockBCEAORatios = [];
export const mockSystemSettings = { general: { platformName: '', supportEmail: '', defaultCurrency: '', environment: '', maintenanceMode: false }, security: { mfaEnforced: false, sessionTimeoutMinutes: 0, passwordRotationDays: 0, whitelistedIPs: [] }, integrations: [] };
