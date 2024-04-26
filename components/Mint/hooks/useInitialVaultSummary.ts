import { useBasket, useBasketPositions, useCollateralInterest } from '@/hooks/useCDP'
import { useOraclePrice } from '@/hooks/useOracle'
import { getBasketAssets, getBorrowLTV, getDebt, getLTV, getPositions, getTVL } from '@/services/cdp'
import { useMemo } from 'react'

const useInitialVaultSummary = () => {
  const { data: basket } = useBasket()
  const { data: collateralInterest } = useCollateralInterest()
  const { data: basketPositions } = useBasketPositions()
  const { data: prices } = useOraclePrice()

  return useMemo(() => {
    const calc_initialPositions = getPositions(basketPositions, prices)
    const calc_debtAmount = getDebt(basketPositions)
    const calc_basketAssets = getBasketAssets(basket!, collateralInterest!)
    const calc_initialTVL = getTVL(calc_initialPositions)
    const calc_initialBorrowLTV = getBorrowLTV(calc_initialTVL, calc_initialPositions, calc_basketAssets)
    const calc_initialLTV = getLTV(calc_initialTVL, calc_debtAmount)

    return {        
      initialBorrowLTV: calc_initialBorrowLTV,
      initialLTV: calc_initialLTV,
      debtAmount: calc_debtAmount,
      initialPositions: calc_initialPositions,
      initialTVL: calc_initialTVL,
      basketAssets: calc_basketAssets,
    }
  }, [
    basketPositions,
    basket,
    collateralInterest,
    prices,
  ])
}

export default useInitialVaultSummary
