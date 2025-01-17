import { useBasket, useUserPositions, useCollateralInterest } from '@/hooks/useCDP'
import { useOraclePrice } from '@/hooks/useOracle'
import { calculateVaultSummary } from '@/services/cdp'
import { useMemo } from 'react'
import useInitialVaultSummary from '@/components/Mint/hooks/useInitialVaultSummary'
import useQuickActionState from './useQuickActionState'

const useQuickActionVaultSummary = () => {
  const { data: basket } = useBasket()
  const { data: collateralInterest } = useCollateralInterest()
  const { data: basketPositions } = useUserPositions()
  const { data: prices } = useOraclePrice()
  const { quickActionState } = useQuickActionState()
  const { initialBorrowLTV, initialLTV, initialTVL, basketAssets, debtAmount } = useInitialVaultSummary()

  return useMemo(() => {
    
    if (!quickActionState?.selectedAsset){
      return {
        debtAmount: 0,
        cost: 0,
        tvl: 0,
        ltv: 0,
        borrowLTV: 0,
        liquidValue: 0,
        liqudationLTV: 0,
      }
    }

    return calculateVaultSummary({
      basket,
      collateralInterest,
      basketPositions,
      prices,
      newDeposit: (quickActionState?.selectedAsset?.sliderValue??0) || 0,
      summary: [quickActionState?.selectedAsset],
      mint: quickActionState?.mint,
      initialBorrowLTV,
      initialLTV,
      debtAmount,
      initialTVL,
      basketAssets,
    })
  }, [
    basketPositions,
    basket,
    collateralInterest,
    prices,
    quickActionState?.selectedAsset,
    quickActionState?.mint,
  ])
}

export default useQuickActionVaultSummary
