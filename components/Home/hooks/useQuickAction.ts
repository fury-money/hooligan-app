import { getDepostAndWithdrawMsgs, getMintAndRepayMsgs } from '@/helpers/mint'
import { useBasket, useUserPositions } from '@/hooks/useCDP'
import useSimulateAndBroadcast from '@/hooks/useSimulateAndBroadcast'
import useWallet from '@/hooks/useWallet'
import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { useQuery } from '@tanstack/react-query'
import useQuickActionState from './useQuickActionState'
import { queryClient } from '@/pages/_app'
import { useEffect, useMemo } from 'react'

const useQuickAction = () => {
  const { quickActionState } = useQuickActionState()
  const { summary = [] } = quickActionState
  const { address } = useWallet()
  const { data: basketPositions, ...basketErrors } = useUserPositions()
  const { data: basket } = useBasket()

  /////First we'll do new positions only, but these actions will be usable by all positions & multiple per user in the future//////

  //Use first position id or use the basket's next position ID (for new positions)
  const positionId = useMemo(() => basket?.current_position_id ?? "", [basket])

  const { data: msgs } = useQuery<MsgExecuteContractEncodeObject[] | undefined>({
    queryKey: [
      'mint',
      address,
      positionId,
      summary?.map((s: any) => String(s.amount)) || '0',
      quickActionState?.mint,
    ],
    queryFn: () => {
      if (!address || !basket) return
      console.log(quickActionState?.mint, summary)
      const deposit = getDepostAndWithdrawMsgs({ summary, address, positionId, hasPosition: basketPositions !== undefined })
      const mint = getMintAndRepayMsgs({
        address,
        positionId,
        mintAmount: quickActionState?.mint,
        repayAmount: 0,
      })
      return [...deposit, ...mint] as MsgExecuteContractEncodeObject[]
    },
    enabled: !!address,
  })

  const onSuccess = () => {    
    queryClient.invalidateQueries({ queryKey: ['positions'] })
    queryClient.invalidateQueries({ queryKey: ['balances'] })
  }

  return useSimulateAndBroadcast({
    msgs,
    queryKey: [
      String(quickActionState?.mint) || '0',
      ...summary?.map((s: any) => String(s.amount)),
    ],
    enabled: !!msgs,
    onSuccess,
  })
}

export default useQuickAction
