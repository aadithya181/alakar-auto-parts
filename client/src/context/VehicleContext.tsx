import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface ActiveVehicleData {
  type?: string;
  brandId?: string;
  brandName?: string;
  modelId?: string;
  modelName?: string;
  variantId?: string;
  variantName?: string;
  year?: number;
  fuelType?: string;
  engineCapacity?: string;
}

interface VehicleContextType {
  activeVehicle: ActiveVehicleData | null;
  setActiveVehicle: (vehicleData: ActiveVehicleData | null) => void;
  clearActiveVehicle: () => void;
  garageVehicles: any[];
  saveToGarage: (variantId: string, year: number, nickname?: string, isDefault?: boolean) => Promise<void>;
  loadingGarage: boolean;
}

const VehicleContext = createContext<VehicleContextType | null>(null);

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [activeVehicle, setActiveVehicleState] = useState<ActiveVehicleData | null>(() => {
    try {
      const saved = localStorage.getItem('torq_active_vehicle');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [garageVehicles, setGarageVehicles] = useState<any[]>([]);
  const [loadingGarage, setLoadingGarage] = useState<boolean>(false);

  // Sync garage vehicles when logged in
  useEffect(() => {
    if ((user as any)?.savedVehicles) {
      setGarageVehicles((user as any).savedVehicles);
      if (!activeVehicle && (user as any).savedVehicles.length > 0) {
        const defaultVeh = (user as any).savedVehicles.find((v: any) => v.is_default) || (user as any).savedVehicles[0];
        setActiveVehicle({
          type: defaultVeh.vehicle_type_id,
          brandId: defaultVeh.brand_id,
          brandName: defaultVeh.brand_name,
          modelId: defaultVeh.model_id,
          modelName: defaultVeh.model_name,
          variantId: defaultVeh.vehicle_variant_id,
          variantName: defaultVeh.variant_name,
          year: defaultVeh.year,
          fuelType: defaultVeh.fuel_type,
          engineCapacity: defaultVeh.engine_capacity,
        });
      }
    }
  }, [user]);

  const setActiveVehicle = (vehicleData: ActiveVehicleData | null) => {
    if (vehicleData) {
      localStorage.setItem('torq_active_vehicle', JSON.stringify(vehicleData));
      setActiveVehicleState(vehicleData);
    } else {
      localStorage.removeItem('torq_active_vehicle');
      setActiveVehicleState(null);
    }
  };

  const clearActiveVehicle = () => {
    localStorage.removeItem('torq_active_vehicle');
    setActiveVehicleState(null);
  };

  const saveToGarage = async (variantId: string, year: number, nickname = '', isDefault = false) => {
    if (!token) return;
    try {
      setLoadingGarage(true);
      await api.post('/auth/vehicles', {
        vehicle_variant_id: variantId,
        year,
        nickname,
        is_default: isDefault,
      });
      const res: any = await api.get('/auth/profile');
      if (res.success && res.user?.savedVehicles) {
        setGarageVehicles(res.user.savedVehicles);
      }
    } catch (err) {
      console.error('Error saving to garage:', err);
    } finally {
      setLoadingGarage(false);
    }
  };

  return (
    <VehicleContext.Provider
      value={{
        activeVehicle,
        setActiveVehicle,
        clearActiveVehicle,
        garageVehicles,
        saveToGarage,
        loadingGarage,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};
