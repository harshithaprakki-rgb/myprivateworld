import React, { createContext, useContext, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion } from 'motion/react';

interface HaloTabsContextType {
  value: string;
  onValueChange: (val: string) => void;
  variant: 'underline' | 'pill' | 'vintage';
  registerTrigger: (val: string, element: HTMLButtonElement | null) => void;
  activeElement: HTMLButtonElement | null;
  listRef: React.RefObject<HTMLDivElement | null>;
}

const HaloTabsContext = createContext<HaloTabsContextType | null>(null);

export interface HaloTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'underline' | 'pill' | 'vintage';
  children: React.ReactNode;
}

export const HaloTabs: React.FC<HaloTabsProps> = ({
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  variant = 'underline',
  className = '',
  children,
  ...props
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const triggerElements = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [activeElement, setActiveElement] = useState<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleValueChange = (val: string) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
    const el = triggerElements.current.get(val);
    if (el) {
      setActiveElement(el);
    }
  };

  const registerTrigger = (val: string, element: HTMLButtonElement | null) => {
    if (element) {
      triggerElements.current.set(val, element);
      if (val === activeValue) {
        setActiveElement(element);
      }
    } else {
      triggerElements.current.delete(val);
    }
  };

  useEffect(() => {
    const el = triggerElements.current.get(activeValue);
    if (el) {
      setActiveElement(el);
    }
  }, [activeValue]);

  return (
    <HaloTabsContext.Provider
      value={{
        value: activeValue,
        onValueChange: handleValueChange,
        variant,
        registerTrigger,
        activeElement,
        listRef,
      }}
    >
      <div className={`relative ${className}`} {...props}>
        {children}
      </div>
    </HaloTabsContext.Provider>
  );
};

export interface HaloTabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'underline' | 'pill' | 'vintage';
  children: React.ReactNode;
}

export const HaloTabsList: React.FC<HaloTabsListProps> = ({
  variant,
  className = '',
  children,
  ...props
}) => {
  const context = useContext(HaloTabsContext);
  const listVariant = variant || context?.variant || 'underline';

  return (
    <div
      ref={context?.listRef as any}
      role="tablist"
      className={`relative inline-flex items-center gap-1 p-1 ${
        listVariant === 'pill'
          ? 'bg-[#EADCC8]/50 rounded-full border border-[#8B6F5E]/20'
          : listVariant === 'vintage'
          ? 'bg-[#FAF6F0]/80 rounded-xl border border-[#EADCC8] shadow-xs'
          : 'border-b border-[#EADCC8]'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface HaloTabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export const HaloTabsTrigger: React.FC<HaloTabsTriggerProps> = ({
  value,
  className = '',
  children,
  onClick,
  ...props
}) => {
  const context = useContext(HaloTabsContext);
  if (!context) {
    throw new Error('HaloTabsTrigger must be used within a HaloTabs');
  }

  const isActive = context.value === value;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    context.registerTrigger(value, buttonRef.current);
    return () => {
      context.registerTrigger(value, null);
    };
  }, [value]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.onValueChange(value);
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={buttonRef}
      role="tab"
      aria-selected={isActive}
      onClick={handleClick}
      type="button"
      className={`relative z-10 px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 select-none whitespace-nowrap shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-[#8B6F5E] ${
        isActive
          ? 'text-[#49372E] font-semibold'
          : 'text-[#8B6F5E] hover:text-[#49372E]'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export interface HaloTabsIndicatorProps {
  variant?: 'underline' | 'pill' | 'vintage';
  className?: string;
}

export const HaloTabsIndicator: React.FC<HaloTabsIndicatorProps> = ({
  variant,
  className = '',
}) => {
  const context = useContext(HaloTabsContext);
  const [bounds, setBounds] = useState<{ left: number; width: number; top: number; height: number }>({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
  });

  const currentVariant = variant || context?.variant || 'underline';

  const updateBounds = () => {
    if (context?.activeElement && context.listRef.current) {
      const listRect = context.listRef.current.getBoundingClientRect();
      const activeRect = context.activeElement.getBoundingClientRect();

      setBounds({
        left: activeRect.left - listRect.left,
        width: activeRect.width,
        top: activeRect.top - listRect.top,
        height: activeRect.height,
      });
    }
  };

  useLayoutEffect(() => {
    updateBounds();
  }, [context?.activeElement, context?.value]);

  useEffect(() => {
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [context?.activeElement]);

  if (!context || bounds.width === 0) return null;

  return (
    <motion.div
      initial={false}
      animate={{
        left: bounds.left,
        width: bounds.width,
        top: currentVariant === 'underline' ? undefined : bounds.top,
        height: currentVariant === 'underline' ? 2 : bounds.height,
      }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 34,
      }}
      className={`absolute pointer-events-none z-0 ${
        currentVariant === 'underline'
          ? 'bottom-0 bg-[#49372E] rounded-full'
          : currentVariant === 'pill'
          ? 'bg-[#FAF6F0] rounded-full shadow-xs border border-[#8B6F5E]/20'
          : 'bg-white/90 rounded-lg shadow-xs border border-[#EADCC8]'
      } ${className}`}
    />
  );
};

export interface HaloTabsContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  value: string;
  children: React.ReactNode;
}

export const HaloTabsContent: React.FC<HaloTabsContentProps> = ({
  value,
  className = '',
  children,
  ...props
}) => {
  const context = useContext(HaloTabsContext);
  if (!context) return null;

  if (context.value !== value) {
    return null;
  }

  return (
    <motion.div
      role="tabpanel"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`outline-none ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
