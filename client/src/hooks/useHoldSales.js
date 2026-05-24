import { useState, useCallback } from "react";
import { getHeldSales, resumeSale } from "../api/pos";

export const useHoldSales = () => {
  const [heldSales, setHeldSales] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHeldSales = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getHeldSales();
      setHeldSales(data.data || []);
    } catch {
      setHeldSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const resume = useCallback(async (saleId, updates) => {
    const { data } = await resumeSale(saleId, updates);
    setHeldSales((prev) => prev.filter((s) => s._id !== saleId));
    return data.data;
  }, []);

  return { heldSales, loading, fetchHeldSales, resume };
};