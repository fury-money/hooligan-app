import { HStack, Stack, Text } from '@chakra-ui/react'
import { getSummary } from '@/helpers/mint'
import { num } from '@/helpers/num'
import useQuickActionState from './hooks/useQuickActionState'
import { AssetWithBalance } from '../Mint/hooks/useCombinBalance'
import { SliderWithState } from '../Mint/SliderWithState'

export type AssetWithSliderProps = {
  label: string
  asset: AssetWithBalance
}

export const QuickActionAssetWithSlider = ({ asset, label }: AssetWithSliderProps) => {
  const { quickActionState, setQuickActionState } = useQuickActionState()

  const onChange = (value: number) => {
    let updatedAssets = quickActionState.assets.map((asset) => {
      const sliderValue = asset.symbol === label ? value : asset.sliderValue || 0
      
      const newDeposit = num(sliderValue).toNumber()
      const amount = num(newDeposit).dividedBy(asset.price).dp(asset.decimal??6).toNumber()

      return {
        ...asset,
        amount,
        sliderValue,
      }
    })

    const { summary, totalUsdValue } = getSummary(updatedAssets)

    setQuickActionState({ assets: updatedAssets, summary, totalUsdValue })
  }
  console.log("Asset in slider:", asset)
  return (
    <Stack gap="0">
      <HStack justifyContent="space-between">
        <Text variant="lable" textTransform="unset">
          {label}
        </Text>
        <HStack>
          <Text variant="value">${asset?.sliderValue?.toFixed(2)}</Text>
        </HStack>
      </HStack>
      <SliderWithState
        value={asset?.sliderValue}
        onChange={onChange}
        min={0}
        max={asset?.combinUsdValue}
      />
    </Stack>
  )
}
