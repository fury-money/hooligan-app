import { shiftDigits } from '@/helpers/math'
import {
  Box,
  Button,
  Card,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
} from '@chakra-ui/react'
import { TxButton } from '@/components/TxButton'
import { Deposit } from '@/contracts/codegen/stability_pool/StabilityPool.types'
import { isGreaterThanZero, num } from '@/helpers/num'
import { useAssetBySymbol } from '@/hooks/useAssets'
import useCountdown from '@/hooks/useCountdown'
import { ChangeEvent, useState } from 'react'
import useStabilityAssetPool from './hooks/useStabilityAssetPool'
import useWithdrawStabilityPool from './hooks/useWithdrawStabilityPool'
import useBidState from './hooks/useBidState'

const UnstakeButton = ({ amount }: { amount: string }) => {
  const withdraw = useWithdrawStabilityPool(amount)
  return (
    <TxButton
      w="150px"
      px="10"
      isDisabled={!isGreaterThanZero(amount)}
      isLoading={withdraw.isPending}
      onClick={() => withdraw.mutate()}
    >
      Unstake
    </TxButton>
  )
}

const WithdrawButton = ({ amount }: { amount: string }) => {
  const withdraw = useWithdrawStabilityPool(amount)
  return (
    <TxButton
      w="150px"
      px="10"
      isDisabled={!isGreaterThanZero(amount)}
      isLoading={withdraw.isPending}
      onClick={() => withdraw.mutate()}
    >
      Withdraw
    </TxButton>
  )
}

const CountDown = ({ timeString, amount }: { timeString: string; amount: string }) => {
  return (
    <HStack
      alignItems="center"
      gap="0"
      bg="blackAlpha.500"
      py="2"
      px="4"
      w="full"
      borderRadius="md"
    >
      <Text fontSize="sm">
        Unstaking {amount} CDT in {timeString}
      </Text>
    </HStack>
  )
}

const Action = ({ deposit, amount }: { deposit: Deposit; amount: string }) => {
  if (!deposit.unstake_time) {
    return <UnstakeButton amount={amount} />
  }

  return <WithdrawButton amount={amount} />
}

const DepositAsset = ({ deposit, index }: { deposit: Deposit; index: number }) => {
  const amount = shiftDigits(deposit.amount, -6).toString()
  const { isEnded, timeString } = useCountdown(deposit.unstake_time)
  const cdt = useAssetBySymbol('CDT')
  const [inputAmount, setInputAmount] = useState('')

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value
    if (num(newAmount).isGreaterThan(amount)) setInputAmount(amount)
    else setInputAmount(e.target.value)
  }

  const onMax = () => {
    setInputAmount(amount)
  }

  if (!isEnded && deposit.unstake_time) {
    return (
      <HStack alignItems="flex-start" gap="5">
        <Box bg="blackAlpha.500" borderRadius="md" px="4" py="1" h="full">
          <Text>{index}</Text>
        </Box>
        <CountDown timeString={timeString} amount={amount} />
      </HStack>
    )
  }

  return (
    <HStack alignItems="flex-start" gap="5">
      <Box bg="blackAlpha.500" borderRadius="md" px="4" py="1" h="full">
        <Text>{index}</Text>
      </Box>
      <Stack alignItems="flex-end" gap="0">
        <InputGroup alignItems="center">
          <InputLeftElement pointerEvents="none">
            <Image src={cdt?.logo} boxSize="5" />
          </InputLeftElement>
          <Input placeholder="0.0" value={inputAmount} onChange={handleInputChange} />
        </InputGroup>
        <HStack justifyContent="space-between" w="full">
          <Text fontSize="sm" color="gray.200" ml="2">
            Available: {amount} CDT
          </Text>
          <Button size="xs" variant="link" mr="2" onClick={onMax}>
            MAX
          </Button>
        </HStack>
      </Stack>
      <Action deposit={deposit} amount={shiftDigits(inputAmount, 6).toString()} />
    </HStack>
  )
}

type Props = {
  setActiveTabIndex: React.Dispatch<React.SetStateAction<number>>
}

const StabilityPool = ({ setActiveTabIndex }: Props) => {
  const { data: stabilityPoolAssets } = useStabilityAssetPool()
  const { deposits = [] } = stabilityPoolAssets || {}

  const { bidState, setBidState } = useBidState()

  const changeTab = () => {
    setBidState({placeBid: {...bidState?.placeBid, premium: 10}})
    setActiveTabIndex(0)
  };

  if (deposits.length === 0) {
    return (
      <Card p="8" alignItems="center" gap={5}>
        <Text variant="title" fontSize="24px">
        My Omni-Bids
        </Text>
        <Text color="gray">You don't have any deposits in the omni-asset pool.</Text>
        <Button onClick={changeTab}>
          Bid in Omni-Pool - Set Premium to 10%
        </Button>
      </Card>
    )
  }

  return (
    <Card p="8" alignItems="center" gap={5}>
      <Text variant="title" fontSize="24px">
        My Omni-Bids
      </Text>

      <Stack py="5" w="full" gap="5">
        {deposits.map((deposit, index) => (
          <DepositAsset key={index} deposit={deposit} index={index + 1} />
        ))}
      </Stack>
    </Card>
  )
}

export default StabilityPool
