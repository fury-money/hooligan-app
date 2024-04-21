import { getDepostAndWithdrawMsgs, getMintAndRepayMsgs } from '@/helpers/mint'
import { useBasket, useBasketPositions } from '@/hooks/useCDP'
import useSimulateAndBroadcast from '@/hooks/useSimulateAndBroadcast'
import useWallet from '@/hooks/useWallet'
import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { useQuery } from '@tanstack/react-query'
import useMintState from './useMintState'
import { queryClient } from '@/pages/_app'
import { decodeMsgs } from '@/helpers/decodeMsg'

const useMint = () => {
  const { mintState, setMintState } = useMintState()
  const { summary = [] } = mintState
  const { address } = useWallet()
  const { data: basketPositions, ...basketErrors } = useBasketPositions()

  //Use first position id or use the basket's next position ID
  var positionId = "";
  if (basketPositions !== undefined) {
    positionId = basketPositions?.[0]?.positions?.[0]?.position_id
  } else {
    //Invalidate Basket query to get the latest positionID
    queryClient.invalidateQueries({ queryKey: ['basket'] })

    //Use the next position ID
    const { data: basket } = useBasket()
    positionId = basket?.current_position_id ?? ""    
  }

  const { data: msgs } = useQuery<MsgExecuteContractEncodeObject[] | undefined>({
    queryKey: [
      'mint',
      address,
      positionId,
      summary?.map((s: any) => String(s.amount)) || '0',
      mintState?.mint,
      mintState?.repay,
    ],
    queryFn: () => {
      if (!address) return
      const depositAndWithdraw = getDepostAndWithdrawMsgs({ summary, address, positionId, hasPosition: basketPositions !== undefined })
      const mintAndRepay = getMintAndRepayMsgs({
        address,
        positionId,
        mintAmount: mintState?.mint,
        repayAmount: mintState?.repay,
      })
      return [...depositAndWithdraw, ...mintAndRepay] as MsgExecuteContractEncodeObject[]
    },
    enabled: !!address && !mintState.overdraft,
  })

  const onSuccess = () => {    
    queryClient.invalidateQueries({ queryKey: ['positions'] })
    queryClient.invalidateQueries({ queryKey: ['balances'] })
  }

  return useSimulateAndBroadcast({
    msgs,
    queryKey: [
      String(mintState?.mint) || '0',
      String(mintState?.repay) || '0',
      ...summary?.map((s: any) => String(s.amount)),
    ],
    onSuccess,
  })
}

export default useMint
