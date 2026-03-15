
export type TransactionStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'SETTLED' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'STRIPE' | 'ADYEN' | 'MTN' | 'ORANGE' | 'WAVE' | 'CIRCLE';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  customerName: string;
  provider: PaymentProvider;
  date: string;
  riskScore: number;
  type: 'PAYMENT' | 'PAYOUT' | 'REFUND' | 'LIQUIDITY_MINT' | 'LIQUIDITY_BURN';
  urgency?: 'NORMAL' | 'ATTENTION' | 'CRITICAL';
}

export type ViewState = 
  | 'COMMAND' | 'COMMAND_GLOBAL_OVERVIEW' | 'COMMAND_LIVE_MAP' | 'COMMAND_ALERTS' | 'COMMAND_EXECUTIVE_REPORTS'
  | 'RISK' | 'RISK_DASHBOARD' | 'RISK_TRANSACTIONS' | 'RISK_QUARANTINE' | 'RISK_RULE_ENGINE' | 'RISK_BLACKLISTS'
  | 'TREASURY' | 'TREASURY_OVERVIEW' | 'TREASURY_POOLS' | 'TREASURY_FX' | 'TREASURY_SETTLEMENT' | 'TREASURY_RECONCILIATION' | 'TREASURY_FORECAST' | 'TREASURY_PAYOUTS'
  | 'COMPLIANCE' | 'COMPLIANCE_KYC_REVIEW' | 'COMPLIANCE_MERCHANT_STATUS' | 'COMPLIANCE_PEP_SANCTIONS' | 'COMPLIANCE_AML_MONITORING' | 'COMPLIANCE_AUDIT_LOGS' | 'COMPLIANCE_REGULATORY_REPORTS'
  | 'OPS' | 'OPS_MERCHANT_DIRECTORY' | 'OPS_IMPERSONATION' | 'OPS_TICKET_HUB' | 'OPS_AETHERLINK'
  | 'SHIP' | 'SHIP_DASHBOARD' | 'SHIP_HEATMAP' | 'SHIP_PARTNERS' | 'SHIP_INCIDENTS'
  | 'ENGINEERING' | 'ENG_SERVICES_HEALTH' | 'ENG_API_ANALYTICS' | 'ENG_WEBHOOK_MONITOR' | 'ENG_DEPLOYMENTS'
  | 'SECURITY' | 'SEC_USERS_ROLES' | 'SEC_AUTH_MFA' | 'SEC_MATRIX'
  | 'AGENT_NETWORK' | 'AGENT_NETWORK_OVERVIEW'
  | 'PROTOCOL' | 'PROTOCOL_MAKER_CHECKER'
  | 'SETTINGS' | 'PROFILE' | 'CHECKLIST';

export interface FXRate {
  pair: string;
  midRate: number;
  spreadPct: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  lastUpdate: string;
}

export interface AetherLink {
  id: string;
  alias: string;
  url: string;
  merchantName: string;
  clicks: number;
  volume: number;
  currency: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
}

export interface LogisticsPartner {
  id: string;
  name: string;
  coverage: string[];
  status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
  activeDeliveries: number;
  avgDeliveryTime: string;
  apiHealth: number;
}

export interface LogisticsIncident {
  id: string;
  type: 'DELIVERY_FAILURE' | 'CUSTOMS_HOLD' | 'PACKAGE_LOST' | 'COURIER_DELAY';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  severity: 'CRITICAL' | 'NORMAL' | 'LOW';
  merchantName: string;
  trackingId: string;
  timestamp: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  version: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'MAINTENANCE';
  cpu: number;
  memory: string;
  uptime: string;
  instances: number;
}

export interface WebhookLog {
  id: string;
  merchantName: string;
  event: string;
  url: string;
  status: number;
  timestamp: string;
  attempt: number;
  duration: number;
}

export interface Deployment {
  id: string;
  service: string;
  version: string;
  environment: 'PROD' | 'STAGING';
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  timestamp: string;
  author: string;
  hash: string;
}

export interface KPI {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  alert?: boolean;
  status?: 'NORMAL' | 'ATTENTION' | 'CRITICAL';
}

export interface AMLEvent {
  id: string;
  timestamp: string;
  merchantName: string;
  riskScore: number;
  triggerReason: string;
  status: 'NEW' | 'INVESTIGATING' | 'CLEARED' | 'SUSPENDED';
}

export interface Merchant {
  id: string;
  name: string;
  industry: string;
  tier: 'VIP' | 'REGULAR';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  healthScore: number;
  gtv24h: number;
  onboardingDate: string;
  country: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  status: 'SUCCESS' | 'FAILURE';
}

export interface CortexInsight {
  id: string;
  title: string;
  content: string;
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  actionLabel?: string;
  targetView?: ViewState;
}

export interface FeedItem {
  id: string;
  type: 'TRANSACTION' | 'RISK' | 'SYSTEM' | 'KYC' | 'TOPUP' | 'AUDIT';
  message: string;
  time: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  department?: string;
}

export interface MakerCheckerTask {
  id: string;
  type: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  maker: string;
  payload: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type Role = 
  | 'SUPER_ADMIN' | 'CCO' | 'KYB_ANALYST_SENIOR' | 'KYC_CLERK' 
  | 'FRAUD_STRATEGY_LEAD' | 'FRAUD_INVESTIGATOR' | 'AML_OFFICER' 
  | 'TREASURER' | 'LIQUIDITY_MANAGER' | 'FOREX_OPERATOR' 
  | 'PAYOUT_SUPERVISOR' | 'SETTLEMENT_CLERK' | 'TAX_SPECIALIST' 
  | 'HEAD_OF_SUPPORT' | 'ONBOARDING_SPECIALIST' | 'KEY_ACCOUNT_MANAGER' 
  | 'L2_TECH_SUPPORT' | 'L1_SUPPORT_AGENT' | 'CTO' | 'SRE' 
  | 'SECURITY_ARCHITECT' | 'NOC_TECHNICIAN' | 'ACCESS_CONTROLLER' 
  | 'ADMIN' | 'DEVELOPER' | 'RISK_ANALYST' | 'SUPPORT_LEAD' | 'OPS_HEAD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'LOCKED' | 'PENDING';
  mfaEnabled: boolean;
  lastLogin: string;
}

export interface SupportTicket {
  id: string;
  priority: 'CRITICAL' | 'NORMAL' | 'LOW';
  subject: string;
  customerName: string;
  customerEmail: string;
  customerTier: 'VIP' | 'REGULAR';
  category: string;
  slaDue: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED';
  messages: any[];
  lastReply: string;
}

export interface KYCApplication {
  id: string;
  status: 'INCOMING' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED';
  type: 'BUSINESS' | 'INDIVIDUAL';
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  entityName: string;
  documentsCount: number;
  submissionDate: string;
  assignedTo?: string;
}

export interface Agent {
  id: string;
  name: string;
  locationName: string;
  status: 'ACTIVE' | 'LOW_FLOAT' | 'OFFLINE' | 'CRITICAL';
  floatBalance: number;
  currency: string;
  coordinates: { x: number; y: number };
}

export interface ArchitectureItem {
  category: string;
  items: {
    label: string;
    status: 'IMPLEMENTED' | 'PARTIAL' | 'BACKEND_REQUIRED';
    note?: string;
  }[];
}

export interface Rail {
  id: string;
  name: string;
  provider: PaymentProvider;
  status: 'UP' | 'DEGRADED' | 'DOWN' | 'MAINTENANCE';
  latency: number;
  successRate: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  category: 'SETTLEMENT' | 'FEE' | 'ADJUSTMENT';
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
}

export interface GeneratedReport {
  id: string;
  name: string;
  author: string;
  type: 'FINANCIAL' | 'COMPLIANCE' | 'OPERATIONAL';
  generatedAt: string;
  format: 'PDF' | 'CSV';
  size: string;
  status: 'READY' | 'PROCESSING' | 'FAILED';
  hash: string;
}

export interface ApiEndpoint {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  path: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyP95: number;
  errorRate: number;
  rpm: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  environment: 'PROD' | 'STAGING';
  description: string;
  rolloutPercentage: number;
  isEnabled: boolean;
}

export interface QuarantinedTransaction {
  id: string;
  transactionId: string;
  reason: string;
  quarantinedAt: string;
  amount: number;
  currency: string;
  customerName: string;
}
