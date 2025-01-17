import { num } from '@/helpers/num'
import useMintState from './useMintState'
import useVaultSummary from './useVaultSummary'

const getDebtAmount = (summary) => {
  const { debtAmount, newDebtAmount } = summary

  if (num(newDebtAmount).isGreaterThan(0)) {
    return newDebtAmount
  }

  return debtAmount
}

export const useCurrentPosition = () => {
  const summary = useVaultSummary()
  const { mintState } = useMintState()

  const isValueChanged = !num(mintState.totalUsdValue).isZero()

  return [
    {
      label: 'YOUR COLLATERAL VALUE',
      value: `$${summary?.tvl?.toFixed(2)}`,
      textColor: isValueChanged ? 'primary.200' : 'white',
    },
    {
      label: 'LIQUIDATION VALUE',
      value: `$${summary.liquidValue?.toFixed(2)}`,
    },
    {
      label: 'DEBT',
      value: `${getDebtAmount(summary)} CDT`,
      textColor: isValueChanged ? 'primary.200' : 'white',
    },
    {
      label: 'COST',
      value: `${summary.cost?.toFixed(4)}% / year`,
    },
    {
      label: 'BORROWABLE LTV',
      value: `${summary?.borrowLTV.toFixed(0)}%`,
      textColor: summary?.newDebtAmount ? 'primary.200' : 'white',
    },
    {
      label: 'LTV',
      value: `${summary.ltv.toFixed(0)}%`,
      textColor: isValueChanged ? 'primary.200' : 'white',
    },
    {
      label: 'LIQUIDATION LTV',
      value: `${summary.liqudationLTV?.toFixed(0)}%`,
      textColor: isValueChanged ? 'primary.200' : 'white',
    },
  ]
}
