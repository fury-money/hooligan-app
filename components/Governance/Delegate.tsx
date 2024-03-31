import { Card, HStack, Spinner, Text } from '@chakra-ui/react'
import DelegateList from './DelegateList'
import BecomeDelegate from './BecomeDelegate'
import useWallet from '@/hooks/useWallet'
import useDelegations from './hooks/useDelegations'

const Delegate = () => {
  const { isWalletConnected } = useWallet()

  const { isLoading } = useDelegations()

  if (!isWalletConnected) return null

  if (isLoading)
    return (
      <Card w="full" alignItems="center" h="full" justifyContent="center" minH="530px">
        <Spinner />
      </Card>
    )

  return (
    <Card w="full" p="8" alignItems="center" gap={5} h="full" justifyContent="space-between">
      <HStack justifyContent="space-between" w="full">
        <Text variant="value">Delegate</Text>
        <BecomeDelegate />
      </HStack>
      <DelegateList />
    </Card>
  )
}

export default Delegate
