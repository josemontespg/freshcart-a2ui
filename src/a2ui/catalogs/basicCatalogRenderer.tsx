import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BellOff,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FastForward,
  Flame,
  Folder,
  Heart,
  HeartOff,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Info,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Paperclip,
  Pause,
  Phone,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Rewind,
  Search,
  Send,
  Settings,
  Share2,
  ShoppingCart,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  Star,
  StarHalf,
  Tag,
  Trash2,
  Truck,
  Unlock,
  Upload,
  User,
  UserCircle,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type {
  A2UIAction,
  A2UIComponentBase,
} from '../../types/a2ui-v1';
import {
  type DataEvaluationContext,
  evaluateDynamicValue,
  getValueAtPointer,
  resolveDynamicBoolean,
  resolveDynamicNumber,
  resolveDynamicString,
  resolveDynamicStringList,
  resolveWritablePointerPath,
} from '../DataModelBinder';
import type { ComponentValidationState } from '../ValidationEngine';

export interface ResolvedA2UIAccessibility {
  /** Resolved `accessibility.label` (DynamicString) */
  label?: string;
  /** Resolved `accessibility.description` (DynamicString) */
  description?: string;
  /** DOM ID of the screen-reader description element when `description` is present */
  describedById?: string;
  /** Resolved `accessibility.live` ('off' | 'polite' | 'assertive') */
  live?: 'off' | 'polite' | 'assertive';
  /** Resolved `accessibility.hidden` (DynamicBoolean) */
  hidden?: boolean;
}

export interface A2UIRenderNodeContext {
  surfaceId: string;
  component: A2UIComponentBase;
  componentsById: Record<string, A2UIComponentBase>;
  evalContext: DataEvaluationContext;
  validationState: ComponentValidationState;
  accessibility: ResolvedA2UIAccessibility;
  renderChildNode: (
    componentId: string,
    overrideContext?: DataEvaluationContext,
    keySuffix?: string | number
  ) => React.ReactNode;
  renderChildList: (
    childrenProp: unknown,
    scopeContext: DataEvaluationContext
  ) => React.ReactNode;
  dispatchAction: (
    sourceComponentId: string,
    action: A2UIAction | undefined,
    scopeContext: DataEvaluationContext
  ) => void;
  updateDataModelPath: (pointerPath: string, value: unknown) => void;
}

/**
 * Renders validation feedback messages (`error`, `warning`, `info`) evaluated
 * from a component's `checks` array.
 */
export const ValidationFeedbackList: React.FC<{
  validationState: ComponentValidationState;
  compact?: boolean;
}> = ({ validationState, compact = false }) => {
  if (validationState.failedItems.length === 0) {
    return null;
  }

  return (
    <div className={compact ? 'mt-1.5 space-y-1' : 'mt-2 space-y-1.5'}>
      {validationState.failedItems.map((item, idx) => {
        const isError = item.severity === 'error';
        const isWarning = item.severity === 'warning';
        const colorClasses = isError
          ? 'text-rose-700 bg-rose-50/90 border-rose-200/80'
          : isWarning
            ? 'text-amber-800 bg-amber-50/90 border-amber-200/80'
            : 'text-sky-800 bg-sky-50/90 border-sky-200/80';

        const IconComponent = isError
          ? AlertCircle
          : isWarning
            ? AlertTriangle
            : Info;

        return (
          <div
            key={`${item.code ?? 'chk'}-${idx}`}
            role={isError ? 'alert' : 'status'}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium ${colorClasses}`}
          >
            <IconComponent className="h-3.5 w-3.5 shrink-0" />
            <span>{item.message}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Lightweight inline Markdown parser for `Text` component:
 * supports `**bold**`, `*italic*`, `` `code` ``, and safe `[label](https://...)` links.
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokenRegex =
    /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-stone-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <span
          key={index}
          className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[0.9em] font-medium text-emerald-800"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    const linkMatch = part.match(
      /^\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)]+)\)$/
    );
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-[#0AAD0A] underline decoration-emerald-400 underline-offset-2 hover:text-[#089408]"
        >
          {linkMatch[1]}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Maps Basic Catalog icon names + grocery icon aliases to Lucide icons.
 */
export function renderA2UIIconByName(
  iconName: string,
  className: string = 'h-4 w-4'
): React.ReactNode {
  const normalized = iconName.trim();
  switch (normalized) {
    case 'accountCircle':
      return <UserCircle className={className} />;
    case 'add':
    case 'plus':
      return <Plus className={className} />;
    case 'arrowBack':
      return <ArrowLeft className={className} />;
    case 'arrowForward':
      return <ArrowRight className={className} />;
    case 'attachFile':
      return <Paperclip className={className} />;
    case 'calendarToday':
    case 'event':
    case 'calendar':
      return <Calendar className={className} />;
    case 'call':
    case 'phone':
      return <Phone className={className} />;
    case 'camera':
    case 'photo':
      return <Camera className={className} />;
    case 'check':
    case 'checkCircle':
      return <Check className={className} />;
    case 'close':
      return <X className={className} />;
    case 'delete':
    case 'trash':
      return <Trash2 className={className} />;
    case 'download':
      return <Download className={className} />;
    case 'edit':
      return <Edit3 className={className} />;
    case 'error':
      return <AlertCircle className={className} />;
    case 'fastForward':
      return <FastForward className={className} />;
    case 'favorite':
      return <Heart className={`${className} fill-current`} />;
    case 'favoriteOff':
      return <HeartOff className={className} />;
    case 'folder':
      return <Folder className={className} />;
    case 'help':
      return <HelpCircle className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'info':
      return <Info className={className} />;
    case 'locationOn':
    case 'location':
      return <MapPin className={className} />;
    case 'lock':
      return <Lock className={className} />;
    case 'lockOpen':
      return <Unlock className={className} />;
    case 'mail':
      return <Mail className={className} />;
    case 'menu':
      return <Menu className={className} />;
    case 'moreVert':
      return <MoreVertical className={className} />;
    case 'moreHoriz':
      return <MoreHorizontal className={className} />;
    case 'notificationsOff':
      return <BellOff className={className} />;
    case 'notifications':
      return <Bell className={className} />;
    case 'pause':
      return <Pause className={className} />;
    case 'payment':
      return <CreditCard className={className} />;
    case 'person':
      return <User className={className} />;
    case 'print':
      return <Printer className={className} />;
    case 'refresh':
      return <RefreshCw className={className} />;
    case 'rewind':
      return <Rewind className={className} />;
    case 'search':
      return <Search className={className} />;
    case 'send':
      return <Send className={className} />;
    case 'settings':
      return <Settings className={className} />;
    case 'share':
      return <Share2 className={className} />;
    case 'shoppingCart':
    case 'cart':
      return <ShoppingCart className={className} />;
    case 'skipNext':
      return <SkipForward className={className} />;
    case 'skipPrevious':
      return <SkipBack className={className} />;
    case 'star':
      return <Star className={`${className} fill-current`} />;
    case 'starHalf':
      return <StarHalf className={className} />;
    case 'starOff':
      return <Star className={className} />;
    case 'stop':
      return <Square className={className} />;
    case 'upload':
      return <Upload className={className} />;
    case 'visibility':
      return <Eye className={className} />;
    case 'visibilityOff':
      return <EyeOff className={className} />;
    case 'volumeDown':
      return <Volume1 className={className} />;
    case 'volumeMute':
    case 'volumeOff':
      return <VolumeX className={className} />;
    case 'volumeUp':
      return <Volume2 className={className} />;
    case 'warning':
      return <AlertTriangle className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'leaf':
      return <Leaf className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'tag':
      return <Tag className={className} />;
    case 'truck':
      return <Truck className={className} />;
    case 'clock':
      return <Clock className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

/**
 * 1. Text Component (`Text`)
 */
const A2UITextComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, accessibility } = ctx;
  const rawText = resolveDynamicString(
    component.text ?? component.label ?? '',
    evalContext,
    ''
  );
  const variant = String(
    component.variant ?? component.usageHint ?? 'body'
  ).trim();

  const headingMatch = rawText.match(/^(#{1,4})\s+([\s\S]*)$/);
  const headingLevel = headingMatch ? headingMatch[1].length : 0;
  const cleanText = headingMatch ? headingMatch[2] : rawText;

  const ariaProps: React.HTMLAttributes<HTMLElement> = {
    'aria-label': accessibility.label || undefined,
    'aria-describedby': accessibility.describedById || undefined,
    ...(accessibility.live && accessibility.live !== 'off'
      ? {
          'aria-live': accessibility.live,
          'aria-atomic': true,
          role: accessibility.live === 'assertive' ? 'alert' : 'status',
        }
      : {}),
  };

  if (headingLevel === 1 || variant === 'h1') {
    return (
      <h2
        {...ariaProps}
        className="text-lg font-bold tracking-tight text-stone-900"
      >
        {renderInlineMarkdown(cleanText)}
      </h2>
    );
  }
  if (headingLevel === 2 || variant === 'h2') {
    return (
      <h3
        {...ariaProps}
        className="text-base font-bold tracking-tight text-stone-900"
      >
        {renderInlineMarkdown(cleanText)}
      </h3>
    );
  }
  if (headingLevel === 3 || variant === 'h3') {
    return (
      <h4 {...ariaProps} className="text-sm font-semibold text-stone-800">
        {renderInlineMarkdown(cleanText)}
      </h4>
    );
  }
  if (headingLevel === 4 || variant === 'h4' || variant === 'h5') {
    return (
      <h5
        {...ariaProps}
        className="text-xs font-semibold uppercase tracking-wider text-stone-500"
      >
        {renderInlineMarkdown(cleanText)}
      </h5>
    );
  }
  if (variant === 'caption') {
    return (
      <p {...ariaProps} className="text-xs leading-relaxed text-stone-500">
        {renderInlineMarkdown(cleanText)}
      </p>
    );
  }

  const lines = cleanText.split('\n');
  const isBulletList =
    lines.length > 1 &&
    lines.every(
      (l) =>
        l.trim().startsWith('- ') ||
        l.trim().startsWith('* ') ||
        l.trim() === ''
    );

  if (isBulletList) {
    return (
      <ul
        {...ariaProps}
        className="list-disc space-y-1 pl-4 text-sm text-stone-700"
      >
        {lines
          .filter((l) => l.trim().length > 0)
          .map((line, i) => (
            <li key={i}>
              {renderInlineMarkdown(line.trim().replace(/^[-*]\s+/, ''))}
            </li>
          ))}
      </ul>
    );
  }

  return (
    <p
      {...ariaProps}
      className="text-sm leading-relaxed text-stone-700 whitespace-pre-line"
    >
      {renderInlineMarkdown(cleanText)}
    </p>
  );
};

/**
 * 2. Image Component (`Image`)
 */
const A2UIImageComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, accessibility } = ctx;
  const [hasError, setHasError] = useState(false);

  const url = resolveDynamicString(
    component.url ?? component.src,
    evalContext,
    ''
  );
  const alt =
    accessibility.label ||
    resolveDynamicString(
      component.alt ?? component.accessibility?.label ?? 'Product image',
      evalContext,
      'Product image'
    );
  const fit = String(component.fit ?? 'cover');
  const variant = String(component.variant ?? 'mediumFeature');

  const fitClass =
    fit === 'contain'
      ? 'object-contain'
      : fit === 'fill'
        ? 'object-fill'
        : fit === 'none'
          ? 'object-none'
          : fit === 'scaleDown'
            ? 'object-scale-down'
            : 'object-cover';

  const variantClasses: Record<string, string> = {
    icon: 'h-9 w-9 rounded-xl',
    avatar: 'h-11 w-11 rounded-full',
    smallFeature: 'h-20 w-20 rounded-2xl',
    mediumFeature: 'h-36 w-full rounded-2xl',
    largeFeature: 'h-48 w-full rounded-2xl',
    header: 'h-32 w-full rounded-2xl',
  };

  const sizeClass = variantClasses[variant] ?? variantClasses.mediumFeature;

  if (!url || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        aria-describedby={accessibility.describedById}
        className={`flex items-center justify-center bg-stone-100 text-stone-400 border border-stone-200/70 ${sizeClass}`}
      >
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      aria-describedby={accessibility.describedById}
      onError={() => setHasError(true)}
      className={`bg-stone-100 border border-stone-200/60 ${fitClass} ${sizeClass}`}
      loading="lazy"
    />
  );
};

/**
 * 3. Icon Component (`Icon`)
 */
const A2UIIconComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, accessibility } = ctx;
  const rawName = evaluateDynamicValue(
    component.name ?? component.icon,
    evalContext
  );

  if (
    typeof rawName === 'object' &&
    rawName !== null &&
    'path' in rawName &&
    typeof (rawName as Record<string, unknown>).path === 'string'
  ) {
    return (
      <span
        role={accessibility.label ? 'img' : undefined}
        aria-label={accessibility.label || undefined}
        aria-hidden={accessibility.label ? undefined : true}
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#0AAD0A]/10 text-[#0AAD0A]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d={(rawName as { path: string }).path} />
        </svg>
      </span>
    );
  }

  const iconName = typeof rawName === 'string' ? rawName : 'sparkles';
  return (
    <span
      role={accessibility.label ? 'img' : undefined}
      aria-label={accessibility.label || undefined}
      aria-hidden={accessibility.label ? undefined : true}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0AAD0A]/10 text-[#0AAD0A]"
    >
      {renderA2UIIconByName(iconName, 'h-4 w-4')}
    </span>
  );
};

/**
 * 4. Video Component (`Video`)
 */
const A2UIVideoComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, accessibility } = ctx;
  const url = resolveDynamicString(component.url, evalContext, '');
  const poster = resolveDynamicString(component.poster, evalContext, '');

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-950 shadow-xs">
      {url ? (
        <video
          src={url}
          poster={poster || undefined}
          aria-label={accessibility.label || 'Video player'}
          aria-describedby={accessibility.describedById}
          controls
          preload="metadata"
          className="max-h-56 w-full object-cover"
        />
      ) : (
        <div className="flex h-36 items-center justify-center gap-2 text-xs text-stone-400">
          <Play className="h-4 w-4" />
          <span>Video preview unavailable</span>
        </div>
      )}
    </div>
  );
};

/**
 * 5. AudioPlayer Component (`AudioPlayer`)
 */
const A2UIAudioPlayerComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, accessibility } = ctx;
  const url = resolveDynamicString(component.url, evalContext, '');
  const description = resolveDynamicString(
    component.description ?? component.label,
    evalContext,
    'Audio guide'
  );

  return (
    <div
      role="region"
      aria-label={accessibility.label || description}
      aria-describedby={accessibility.describedById}
      className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-stone-700">
        <Volume2 className="h-4 w-4 text-[#0AAD0A]" aria-hidden="true" />
        <span>{description}</span>
      </div>
      {url ? (
        <audio
          src={url}
          aria-label={accessibility.label || description}
          aria-describedby={accessibility.describedById}
          controls
          preload="metadata"
          className="h-8 w-full"
        />
      ) : (
        <span className="text-xs text-stone-400">No audio clip available</span>
      )}
    </div>
  );
};

/**
 * 6. Row Component (`Row`)
 */
const A2UIRowComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, renderChildList } = ctx;
  const justify = String(
    component.justify ?? component.justifyContent ?? 'start'
  );
  const align = String(component.align ?? component.alignItems ?? 'center');
  const wrap = Boolean(component.wrap ?? true);

  const justifyMap: Record<string, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    spaceBetween: 'justify-between',
    'space-between': 'justify-between',
    spaceAround: 'justify-around',
    spaceEvenly: 'justify-evenly',
    stretch: 'justify-stretch',
  };

  const alignMap: Record<string, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  return (
    <div
      className={`flex flex-row ${wrap ? 'flex-wrap' : 'flex-nowrap'} gap-2.5 ${
        justifyMap[justify] ?? 'justify-start'
      } ${alignMap[align] ?? 'items-center'}`}
    >
      {renderChildList(component.children, evalContext)}
    </div>
  );
};

/**
 * 7. Column Component (`Column`)
 */
const A2UIColumnComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, renderChildList } = ctx;
  const justify = String(
    component.justify ?? component.justifyContent ?? 'start'
  );
  const align = String(component.align ?? component.alignItems ?? 'stretch');

  const justifyMap: Record<string, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    spaceBetween: 'justify-between',
    spaceAround: 'justify-around',
    spaceEvenly: 'justify-evenly',
    stretch: 'justify-stretch',
  };

  const alignMap: Record<string, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div
      className={`flex flex-col gap-3 ${
        justifyMap[justify] ?? 'justify-start'
      } ${alignMap[align] ?? 'items-stretch'}`}
    >
      {renderChildList(component.children, evalContext)}
    </div>
  );
};

/**
 * 8. List Component (`List`)
 */
const A2UIListComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, renderChildList } = ctx;
  const direction = String(component.direction ?? 'vertical');
  const align = String(component.align ?? 'stretch');

  const alignMap: Record<string, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  if (direction === 'horizontal') {
    return (
      <div
        role="list"
        className={`flex flex-row gap-3 overflow-x-auto pb-1.5 ${
          alignMap[align] ?? 'items-stretch'
        }`}
      >
        {renderChildList(component.children, evalContext)}
      </div>
    );
  }

  return (
    <div
      role="list"
      className={`flex flex-col gap-2.5 ${alignMap[align] ?? 'items-stretch'}`}
    >
      {renderChildList(component.children, evalContext)}
    </div>
  );
};

/**
 * 9. Card Component (`Card`)
 */
const A2UICardComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const {
    component,
    evalContext,
    accessibility,
    renderChildNode,
    renderChildList,
  } = ctx;
  const title = resolveDynamicString(component.title, evalContext, '');
  const subtitle = resolveDynamicString(component.subtitle, evalContext, '');
  const badge = resolveDynamicString(component.badge, evalContext, '');
  const variant = String(component.variant ?? 'default');

  const variantClasses =
    variant === 'highlighted' || variant === 'emerald'
      ? 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-white shadow-xs'
      : variant === 'alert' || variant === 'warning'
        ? 'border-amber-300 bg-amber-50/90 shadow-xs'
        : variant === 'subtle'
          ? 'border-stone-200/70 bg-stone-50/70'
          : 'border-stone-200/80 bg-white shadow-xs';

  const cardAriaLabel = accessibility.label || title || undefined;
  const isLive = accessibility.live && accessibility.live !== 'off';

  return (
    <div
      role={
        isLive
          ? accessibility.live === 'assertive'
            ? 'alert'
            : 'status'
          : cardAriaLabel
            ? 'region'
            : undefined
      }
      aria-label={cardAriaLabel}
      aria-describedby={accessibility.describedById}
      aria-live={isLive ? accessibility.live : undefined}
      aria-atomic={isLive ? true : undefined}
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${variantClasses}`}
    >
      {(title || subtitle || badge) && (
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-stone-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>
            )}
          </div>
          {badge && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              {badge}
            </span>
          )}
        </div>
      )}
      {typeof component.child === 'string'
        ? renderChildNode(component.child, evalContext)
        : component.children !== undefined
          ? renderChildList(component.children, evalContext)
          : null}
    </div>
  );
};

/**
 * 10. Tabs Component (`Tabs`)
 */
const A2UITabsComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { surfaceId, component, evalContext, accessibility, renderChildNode } =
    ctx;
  const rawTabs = Array.isArray(component.tabs)
    ? component.tabs
    : Array.isArray(component.tabItems)
      ? component.tabItems
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const safeIndex =
    activeIndex >= 0 && activeIndex < rawTabs.length ? activeIndex : 0;

  if (rawTabs.length === 0) {
    return null;
  }

  const currentTab = rawTabs[safeIndex] as Record<string, unknown> | undefined;
  const activeChildId =
    typeof currentTab?.child === 'string' ? currentTab.child : '';
  const baseId = `a2ui-tabs-${surfaceId}-${component.id}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '-'
  );

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (rawTabs.length <= 1) return;
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIdx = (idx + 1) % rawTabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + rawTabs.length) % rawTabs.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = rawTabs.length - 1;
    }
    if (nextIdx !== null) {
      e.preventDefault();
      setActiveIndex(nextIdx);
      tabButtonRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div
        role="tablist"
        aria-label={accessibility.label || 'Content sections'}
        aria-describedby={accessibility.describedById}
        className="flex flex-wrap gap-1 rounded-2xl bg-stone-100/90 p-1"
      >
        {rawTabs.map((tabItem, idx) => {
          const itemObj = tabItem as Record<string, unknown>;
          const tabTitle = resolveDynamicString(
            itemObj.title ?? itemObj.label,
            evalContext,
            `Option ${idx + 1}`
          );
          const isSelected = idx === safeIndex;
          const tabId = `${baseId}-tab-${idx}`;
          const panelId = `${baseId}-panel-${idx}`;
          return (
            <button
              key={`${tabTitle}-${idx}`}
              ref={(el) => {
                tabButtonRefs.current[idx] = el;
              }}
              id={tabId}
              type="button"
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              aria-selected={isSelected}
              aria-controls={panelId}
              onClick={() => setActiveIndex(idx)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/35 ${
                isSelected
                  ? 'bg-white text-[#0AAD0A] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tabTitle}
            </button>
          );
        })}
      </div>
      <div
        id={`${baseId}-panel-${safeIndex}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${safeIndex}`}
        className="min-w-0"
      >
        {activeChildId ? renderChildNode(activeChildId, evalContext) : null}
      </div>
    </div>
  );
};

/**
 * 11. Modal Component (`Modal`)
 */
const A2UIModalComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, accessibility, renderChildNode } = ctx;
  const [isOpen, setIsOpen] = useState(false);

  const triggerId = String(
    component.trigger ?? component.entryPointChild ?? ''
  ).trim();
  const contentId = String(
    component.content ?? component.contentChild ?? ''
  ).trim();
  const modalTitle =
    accessibility.label ||
    resolveDynamicString(
      component.title ?? component.accessibility?.label,
      evalContext,
      'Details'
    );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="inline-block">
      <div
        onClick={() => setIsOpen(true)}
        className="inline-block cursor-pointer"
      >
        {triggerId ? (
          renderChildNode(triggerId, evalContext)
        ) : (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            View {modalTitle}
          </button>
        )}
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
          aria-describedby={accessibility.describedById}
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {modalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              {contentId ? renderChildNode(contentId, evalContext) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 12. Divider Component (`Divider`)
 */
const A2UIDividerComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const axis = String(ctx.component.axis ?? 'horizontal');
  if (axis === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className="mx-1.5 h-auto w-px self-stretch bg-stone-200/80"
      />
    );
  }
  return <hr className="my-2 border-0 border-t border-stone-200/70" />;
};

/**
 * 13. Button Component (`Button`)
 */
const A2UIButtonComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const {
    component,
    componentsById,
    evalContext,
    validationState,
    accessibility,
    renderChildNode,
    dispatchAction,
  } = ctx;

  const variant = String(component.variant ?? 'default');
  const explicitDisabled = resolveDynamicBoolean(
    component.disabled,
    evalContext,
    false
  );
  const isDisabled = explicitDisabled || !validationState.isValid;

  const labelText = resolveDynamicString(
    component.label ?? component.text,
    evalContext,
    ''
  );
  const iconName = resolveDynamicString(component.icon, evalContext, '');
  const childId = typeof component.child === 'string' ? component.child : '';

  // Semantic label inference per A2UI v1.0 spec ("Infer Default Semantics"):
  // Explicit accessibility.label overrides inferred child Text / label.
  const childComp = childId ? componentsById[childId] : undefined;
  const inferredChildText = childComp
    ? resolveDynamicString(
        childComp.text ?? childComp.label ?? '',
        evalContext,
        ''
      )
    : '';
  const effectiveAriaLabel =
    accessibility.label || labelText || inferredChildText || undefined;

  const variantClasses: Record<string, string> = {
    primary:
      'bg-[#0AAD0A] text-white hover:bg-[#089408] active:bg-[#077d07] shadow-xs border border-[#0AAD0A]',
    default:
      'bg-white text-stone-800 hover:bg-stone-50 active:bg-stone-100 border border-stone-200/90 shadow-2xs',
    secondary:
      'bg-emerald-50/90 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/80',
    borderless:
      'bg-transparent text-[#0AAD0A] hover:bg-emerald-50/60 border border-transparent',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 border border-rose-600 shadow-xs',
  };

  const baseStyle = variantClasses[variant] ?? variantClasses.default;

  const handleClick = () => {
    if (isDisabled) return;
    dispatchAction(
      component.id,
      component.action as A2UIAction | undefined,
      evalContext
    );
  };

  return (
    <div className="inline-flex flex-col">
      <button
        type="button"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={effectiveAriaLabel}
        aria-describedby={accessibility.describedById}
        title={
          !validationState.isValid
            ? validationState.firstErrorMessage
            : accessibility.description || undefined
        }
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/25 ${baseStyle} ${
          isDisabled
            ? 'cursor-not-allowed opacity-50 saturate-50'
            : 'cursor-pointer'
        }`}
      >
        {iconName ? renderA2UIIconByName(iconName, 'h-3.5 w-3.5') : null}
        {childId ? (
          <span className="[&_p]:!text-inherit [&_p]:!font-semibold [&_p]:!text-xs">
            {renderChildNode(childId, evalContext)}
          </span>
        ) : (
          <span>{labelText || 'Continue'}</span>
        )}
      </button>
      <ValidationFeedbackList validationState={validationState} compact />
    </div>
  );
};

/**
 * 14. TextField Component (`TextField`)
 */
const A2UITextFieldComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const {
    surfaceId,
    component,
    evalContext,
    validationState,
    accessibility,
    updateDataModelPath,
    dispatchAction,
  } = ctx;

  const label = resolveDynamicString(component.label, evalContext, '');
  const placeholder = resolveDynamicString(
    component.placeholder ?? component.hint,
    evalContext,
    ''
  );
  const helperText =
    accessibility.description ||
    resolveDynamicString(
      component.helperText ?? component.accessibility?.description,
      evalContext,
      ''
    );
  const variant = String(
    component.variant ?? component.textFieldType ?? 'shortText'
  );
  const currentValue = resolveDynamicString(component.value, evalContext, '');
  const writablePath = resolveWritablePointerPath(component.value, evalContext);

  const inputId = `a2ui-tf-${surfaceId}-${component.id}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '-'
  );
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const effectiveDescribedBy =
    [accessibility.describedById, helperId].filter(Boolean).join(' ') ||
    undefined;
  const effectiveAriaLabel =
    accessibility.label || label || placeholder || 'Text input';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const rawNewVal = e.target.value;
    if (!writablePath) return;
    if (variant === 'number') {
      const parsed = rawNewVal.trim() === '' ? '' : Number(rawNewVal);
      updateDataModelPath(
        writablePath,
        typeof parsed === 'number' && Number.isFinite(parsed)
          ? parsed
          : rawNewVal
      );
    } else {
      updateDataModelPath(writablePath, rawNewVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && component.action && validationState.isValid) {
      e.preventDefault();
      dispatchAction(
        component.id,
        component.action as A2UIAction,
        evalContext
      );
    }
  };

  const borderClass = validationState.hasErrors
    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
    : validationState.hasWarnings
      ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/20'
      : 'border-stone-200 focus:border-[#0AAD0A] focus:ring-[#0AAD0A]/20 bg-white';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-stone-700">
          {label}
        </label>
      )}
      {variant === 'longText' ? (
        <textarea
          id={inputId}
          rows={3}
          value={currentValue}
          placeholder={placeholder}
          aria-label={effectiveAriaLabel}
          aria-describedby={effectiveDescribedBy}
          aria-invalid={validationState.hasErrors}
          onChange={handleChange}
          className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${borderClass}`}
        />
      ) : (
        <input
          id={inputId}
          type={
            variant === 'obscured'
              ? 'password'
              : variant === 'number'
                ? 'number'
                : variant === 'date'
                  ? 'date'
                  : 'text'
          }
          value={currentValue}
          placeholder={placeholder}
          aria-label={effectiveAriaLabel}
          aria-describedby={effectiveDescribedBy}
          aria-invalid={validationState.hasErrors}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${borderClass}`}
        />
      )}
      {helperText && validationState.failedItems.length === 0 && (
        <span id={helperId} className="text-[11px] text-stone-500">
          {helperText}
        </span>
      )}
      <ValidationFeedbackList validationState={validationState} />
    </div>
  );
};

/**
 * 15. CheckBox Component (`CheckBox`)
 */
const A2UICheckBoxComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const {
    surfaceId,
    component,
    evalContext,
    validationState,
    accessibility,
    updateDataModelPath,
    dispatchAction,
  } = ctx;

  const label = resolveDynamicString(component.label, evalContext, '');
  const description =
    resolveDynamicString(
      component.description ?? component.subtitle,
      evalContext,
      ''
    ) ||
    accessibility.description ||
    '';
  const checked = resolveDynamicBoolean(component.value, evalContext, false);
  const writablePath = resolveWritablePointerPath(component.value, evalContext);
  const checkboxId = `a2ui-cb-${surfaceId}-${component.id}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '-'
  );
  const descId = description ? `${checkboxId}-desc` : undefined;

  const handleToggle = () => {
    const nextVal = !checked;
    if (writablePath) {
      updateDataModelPath(writablePath, nextVal);
    }
    if (component.action) {
      dispatchAction(
        component.id,
        component.action as A2UIAction,
        evalContext
      );
    }
  };

  return (
    <div className="flex flex-col">
      <label
        htmlFor={checkboxId}
        className="group flex cursor-pointer items-start gap-2.5 rounded-2xl border border-stone-200/80 bg-white px-3.5 py-2.5 transition-all hover:border-emerald-300 hover:bg-emerald-50/20"
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          aria-label={accessibility.label || label || undefined}
          aria-describedby={descId || accessibility.describedById}
          onChange={handleToggle}
          className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-[#0AAD0A] focus:ring-[#0AAD0A]"
        />
        <div className="flex flex-col">
          <span
            className={`text-xs font-medium ${
              checked ? 'text-stone-900 font-semibold' : 'text-stone-700'
            }`}
          >
            {label}
          </span>
          {description && (
            <span id={descId} className="text-[11px] text-stone-500">
              {description}
            </span>
          )}
        </div>
      </label>
      <ValidationFeedbackList validationState={validationState} />
    </div>
  );
};

/**
 * 16. ChoicePicker Component (`ChoicePicker`)
 */
const A2UIChoicePickerComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const {
    component,
    evalContext,
    validationState,
    accessibility,
    updateDataModelPath,
    dispatchAction,
  } = ctx;
  const [filterQuery, setFilterQuery] = useState('');

  const label = resolveDynamicString(component.label, evalContext, '');
  const variant = String(component.variant ?? 'mutuallyExclusive');
  const isMulti = variant === 'multipleSelection' || variant === 'multi';
  const displayStyle = String(component.displayStyle ?? 'chips');
  const filterable = Boolean(component.filterable ?? false);

  const selectedValues = resolveDynamicStringList(component.value, evalContext);
  const writablePath = resolveWritablePointerPath(component.value, evalContext);

  const rawOptions = Array.isArray(component.options) ? component.options : [];
  const resolvedOptions = useMemo(() => {
    return rawOptions.map((opt) => {
      const o = opt as Record<string, unknown>;
      const optValue = String(o.value ?? o.id ?? '');
      const optLabel = resolveDynamicString(
        o.label ?? o.title ?? optValue,
        evalContext,
        optValue
      );
      const optDesc = resolveDynamicString(o.description, evalContext, '');
      return { value: optValue, label: optLabel, description: optDesc };
    });
  }, [rawOptions, evalContext]);

  const filteredOptions = useMemo(() => {
    if (!filterQuery.trim()) return resolvedOptions;
    const q = filterQuery.toLowerCase();
    return resolvedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [resolvedOptions, filterQuery]);

  const handleSelectOption = (optionValue: string) => {
    if (!writablePath) return;

    const rawExisting = getValueAtPointer(
      evalContext.rootDataModel,
      writablePath
    );

    if (isMulti) {
      const nextList = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      updateDataModelPath(writablePath, nextList);
    } else {
      if (typeof rawExisting === 'string') {
        updateDataModelPath(writablePath, optionValue);
      } else {
        updateDataModelPath(writablePath, [optionValue]);
      }
    }

    if (component.action) {
      dispatchAction(
        component.id,
        component.action as A2UIAction,
        evalContext
      );
    }
  };

  return (
    <div
      role={isMulti ? 'group' : 'radiogroup'}
      aria-label={accessibility.label || label || 'Selection options'}
      aria-describedby={accessibility.describedById}
      className="flex flex-col gap-2"
    >
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-700">{label}</span>
          {isMulti && (
            <span className="text-[11px] text-stone-500">
              {selectedValues.length} selected
            </span>
          )}
        </div>
      )}

      {filterable && resolvedOptions.length > 4 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            value={filterQuery}
            aria-label={`Filter ${label || 'options'}`}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter options..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-3 text-xs text-stone-700 focus:border-[#0AAD0A] focus:bg-white focus:outline-none"
          />
        </div>
      )}

      {displayStyle === 'checkbox' ? (
        <div className="space-y-1.5">
          {filteredOptions.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role={isMulti ? 'checkbox' : 'radio'}
                aria-checked={isSelected}
                onClick={() => handleSelectOption(opt.value)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left text-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/30 ${
                  isSelected
                    ? 'border-[#0AAD0A] bg-emerald-50/60 font-semibold text-stone-900'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                }`}
              >
                <div>
                  <div>{opt.label}</div>
                  {opt.description && (
                    <div className="text-[11px] font-normal text-stone-500">
                      {opt.description}
                    </div>
                  )}
                </div>
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    isSelected
                      ? 'border-[#0AAD0A] bg-[#0AAD0A] text-white'
                      : 'border-stone-300'
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5" />}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {filteredOptions.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role={isMulti ? 'checkbox' : 'radio'}
                aria-checked={isSelected}
                onClick={() => handleSelectOption(opt.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/30 ${
                  isSelected
                    ? 'border-[#0AAD0A] bg-[#0AAD0A] text-white shadow-2xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <ValidationFeedbackList validationState={validationState} />
    </div>
  );
};

/**
 * 17. Slider Component (`Slider`)
 */
const A2UISliderComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const {
    surfaceId,
    component,
    evalContext,
    validationState,
    accessibility,
    updateDataModelPath,
  } = ctx;

  const label = resolveDynamicString(component.label, evalContext, '');
  const min = resolveDynamicNumber(component.min, evalContext, 0);
  const max = resolveDynamicNumber(component.max, evalContext, 100);
  const step = resolveDynamicNumber(component.step, evalContext, 1);
  const unit = resolveDynamicString(
    component.unit ?? component.prefix,
    evalContext,
    ''
  );
  const suffix = resolveDynamicString(component.suffix, evalContext, '');

  const currentValue = resolveDynamicNumber(component.value, evalContext, min);
  const writablePath = resolveWritablePointerPath(component.value, evalContext);

  const sliderId = `a2ui-slider-${surfaceId}-${component.id}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '-'
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextNum = Number(e.target.value);
    if (writablePath && Number.isFinite(nextNum)) {
      updateDataModelPath(writablePath, nextNum);
    }
  };

  const displayVal =
    unit === '$'
      ? `$${currentValue}`
      : `${unit}${currentValue}${suffix ? ` ${suffix}` : ''}`;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-stone-200/80 bg-stone-50/70 p-3.5">
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label
            htmlFor={sliderId}
            className="text-xs font-semibold text-stone-700"
          >
            {label}
          </label>
        )}
        <span className="rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
          {displayVal}
        </span>
      </div>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        aria-label={accessibility.label || label || 'Slider'}
        aria-describedby={accessibility.describedById}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue}
        aria-valuetext={
          accessibility.label || `${label ? `${label}: ` : ''}${displayVal}`
        }
        onChange={handleSliderChange}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-[#0AAD0A] focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/35"
      />
      <div className="flex justify-between text-[11px] font-medium text-stone-400">
        <span>
          {unit === '$' ? `$${min}` : `${min}${suffix ? ` ${suffix}` : ''}`}
        </span>
        <span>
          {unit === '$' ? `$${max}` : `${max}${suffix ? ` ${suffix}` : ''}`}
        </span>
      </div>
      <ValidationFeedbackList validationState={validationState} />
    </div>
  );
};

/**
 * 18. DateTimeInput Component (`DateTimeInput`)
 */
const A2UIDateTimeInputComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const {
    surfaceId,
    component,
    evalContext,
    validationState,
    accessibility,
    updateDataModelPath,
  } = ctx;

  const label = resolveDynamicString(component.label, evalContext, '');
  const enableDate = resolveDynamicBoolean(
    component.enableDate,
    evalContext,
    true
  );
  const enableTime = resolveDynamicBoolean(
    component.enableTime,
    evalContext,
    false
  );
  const min = resolveDynamicString(component.min, evalContext, '');
  const max = resolveDynamicString(component.max, evalContext, '');
  const currentValue = resolveDynamicString(component.value, evalContext, '');
  const writablePath = resolveWritablePointerPath(component.value, evalContext);

  const dtId = `a2ui-dt-${surfaceId}-${component.id}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '-'
  );

  const inputType =
    enableDate && enableTime
      ? 'datetime-local'
      : enableTime
        ? 'time'
        : 'date';

  const formattedInputValue = useMemo(() => {
    if (!currentValue) return '';
    if (inputType === 'date' && currentValue.includes('T')) {
      return currentValue.slice(0, 10);
    }
    if (inputType === 'datetime-local' && currentValue.endsWith('Z')) {
      return currentValue.slice(0, 16);
    }
    return currentValue;
  }, [currentValue, inputType]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={dtId} className="text-xs font-semibold text-stone-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={dtId}
          type={inputType}
          min={min || undefined}
          max={max || undefined}
          value={formattedInputValue}
          aria-label={accessibility.label || label || 'Date and time'}
          aria-describedby={accessibility.describedById}
          onChange={(e) => {
            if (writablePath) {
              updateDataModelPath(writablePath, e.target.value);
            }
          }}
          className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:border-[#0AAD0A] focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/20"
        />
      </div>
      <ValidationFeedbackList validationState={validationState} />
    </div>
  );
};

/**
 * Dispatches any of the 18 Basic Catalog components.
 */
export function renderBasicCatalogComponent(
  ctx: A2UIRenderNodeContext
): React.ReactNode | null {
  switch (ctx.component.component) {
    case 'Text':
      return <A2UITextComponent ctx={ctx} />;
    case 'Image':
      return <A2UIImageComponent ctx={ctx} />;
    case 'Icon':
      return <A2UIIconComponent ctx={ctx} />;
    case 'Video':
      return <A2UIVideoComponent ctx={ctx} />;
    case 'AudioPlayer':
      return <A2UIAudioPlayerComponent ctx={ctx} />;
    case 'Row':
      return <A2UIRowComponent ctx={ctx} />;
    case 'Column':
      return <A2UIColumnComponent ctx={ctx} />;
    case 'List':
      return <A2UIListComponent ctx={ctx} />;
    case 'Card':
      return <A2UICardComponent ctx={ctx} />;
    case 'Tabs':
      return <A2UITabsComponent ctx={ctx} />;
    case 'Modal':
      return <A2UIModalComponent ctx={ctx} />;
    case 'Divider':
      return <A2UIDividerComponent ctx={ctx} />;
    case 'Button':
      return <A2UIButtonComponent ctx={ctx} />;
    case 'TextField':
      return <A2UITextFieldComponent ctx={ctx} />;
    case 'CheckBox':
      return <A2UICheckBoxComponent ctx={ctx} />;
    case 'ChoicePicker':
      return <A2UIChoicePickerComponent ctx={ctx} />;
    case 'Slider':
      return <A2UISliderComponent ctx={ctx} />;
    case 'DateTimeInput':
      return <A2UIDateTimeInputComponent ctx={ctx} />;
    default:
      return null;
  }
}
