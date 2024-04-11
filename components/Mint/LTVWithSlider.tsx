import { num } from '@/helpers/num'
import { HStack, Stack, Text } from '@chakra-ui/react'
import { SliderWithState } from './SliderWithState'
import useMintState from './hooks/useMintState'
import useVaultSummary from './hooks/useVaultSummary'
import { useEffect } from 'react'

export type LTVWithSliderProps = {
  label: string
  value?: number
}

export const LTVWithSlider = ({ label, value = 0 }: LTVWithSliderProps) => {
  const { setMintState } = useMintState()
  const { borrowLTV, maxLTV, debtAmount } = useVaultSummary()
  const max = num(maxLTV).dp(0).toNumber()

  const onChange = (value: number) => {
    const newValue = num(value).dp(2).toNumber()
    const diff = num(debtAmount).minus(newValue).abs().toNumber()
    let mint = num(newValue).isGreaterThan(debtAmount) ? diff : 0
    const repay = num(newValue).isLessThan(debtAmount) ? diff : 0
    const ltvSlider = num(newValue).times(100).dividedBy(maxLTV).dp(2).toNumber()
    // const newDebtAmount = newValue

    // if (mint > max) {
    //   mint = max
    // }

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
