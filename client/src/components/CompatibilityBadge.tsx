import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Wrench } from 'lucide-react';
import { useVehicle } from '../context/VehicleContext';
import api from '../services/api';
import { Product } from '../types';

interface CompatibilityBadgeProps {
  product: Product | any;
  className?: string;
  detailed?: boolean;
}

export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({
  product,
  className = '',
  detailed = false,
}) => {
  const { activeVehicle } = useVehicle();
  const [fitStatus, setFitStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!activeVehicle || !product?.id) {
      setFitStatus(null);
      return;
    }

    const checkFit = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/products/check-compatibility', {
          params: {
            product_id: product.id,
            vehicle_variant_id: activeVehicle.variantId,
            year: activeVehicle.year,
          },
        });
        if (res.success) {
          setFitStatus(res);
        }
      } catch (err: any) {
        console.warn('Fitment check error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    checkFit();
  }, [activeVehicle, product?.id]);

  if (!activeVehicle) {
    return detailed ? (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm ${className}`}>
        <Wrench className="w-3.5 h-3.5 text-amber-600" />
        <span>Select your vehicle to verify 100% fitment</span>
      </div>
    ) : null;
  }

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-500 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping" />
        <span>Checking fitment...</span>
      </div>
    );
  }

  if (fitStatus?.isCompatible) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 shadow-sm ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="truncate">
          Guaranteed Fit: {activeVehicle.brandName} {activeVehicle.modelName} ({activeVehicle.year})
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-800 ${className}`}>
      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span className="truncate">
        May not fit {activeVehicle.modelName} ({activeVehicle.year})
      </span>
    </div>
  );
};
