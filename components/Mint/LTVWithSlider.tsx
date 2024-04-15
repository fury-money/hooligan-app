import { num } from '@/helpers/num'
import { HStack, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { SliderWithState } from './SliderWithState'
import useMintState from './hooks/useMintState'
import useVaultSummary from './hooks/useVaultSummary'
import { useBalanceByAsset } from '@/hooks/useBalance'
import { useAssetBySymbol } from '@/hooks/useAssets'

export type LTVWithSliderProps = {
  label: string
  value?: number
}

export const LTVWithSlider = ({ label, value = 0 }: LTVWithSliderProps) => {
  const { setMintState } = useMintState()
  const { maxLTV = 0, debtAmount } = useVaultSummary()
  const CDT = useAssetBySymbol('CDT')
  const walletCDT = useBalanceByAsset(CDT)

  const max = useMemo(() => {
    if (isNaN(maxLTV)) return 0

    return num(maxLTV).dp(0).toNumber()
  }, [maxLTV])

  const onChange = (value: number) => {
    const newValue = num(value).dp(2).toNumber()
    const diff = num(debtAmount).minus(newValue).abs().toNumber()
    let mint = num(newValue).isGreaterThan(debtAmount) ? diff : 0
    var repay = num(newValue).isLessThan(debtAmount) ? diff : 0
    const ltvSlider = num(newValue).times(100).dividedBy(maxLTV).dp(2).toNumber()

    if (repay > parseFloat(walletCDT)) {
      repay = parseFloat(walletCDT)
    }

    setMintState({ mint, repay, ltvSlider, newDebtAmount: newValue })
  }

  return (
    <Stack gap="0" px="3">
      <HStack justifyContent="space-between">
        <Text variant="lable" textTransform="unset">
          {label} (${max})
        </Text>
        <HStack>
          <Text variant="value">${value}</Text>
        </HStack>
      </HStack>
      <SliderWithState value={value} onChange={onChange} min={0} max={max} />
    </Stack>
  )
}
