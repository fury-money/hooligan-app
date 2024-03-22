import useExecute from '@/hooks/useExecute'
import useWallet from '@/hooks/useWallet'
import { getSigningStakingClient } from '@/services/staking'

const useClaim = (restake = false) => {
  const { address, getSigningCosmWasmClient } = useWallet()

  return useExecute({
    onSubmit: async () => {
      if (!address) return Promise.reject('No address found')
      const signingClient = await getSigningCosmWasmClient()
      const client = getSigningStakingClient(signingClient, address)
      return client.claimRewards({ restake })
    },
  })
}

export default useClaim
