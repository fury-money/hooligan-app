import useSimulateAndBroadcast from '@/hooks/useSimulateAndBroadcast'
import useWallet from '@/hooks/useWallet'
import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@/pages/_app'
import useCheckSPClaims from '@/components/Bid/hooks/useCheckSPClaims'
import useCheckClaims from '@/components/Bid/hooks/useCheckClaims'
import useClaimLiquidation from '@/components/Bid/hooks/useClaimLiquidation'
import { useStakingClaim } from '@/components/Stake/hooks/useStakingClaim'
import useStaked from '@/components/Stake/hooks/useStaked'
import { getTimeLeft } from '@/components/Stake/Unstaking'
import { useAssetBySymbol } from '@/hooks/useAssets'
import { useMemo } from 'react'
import { shiftDigits } from '@/helpers/math'
import { isGreaterThanZero } from '@/helpers/num'
import useClaimFees from '@/components/Lockdrop/hooks/useClaimFees'
import useWithdrawStabilityPool from '@/components/Bid/hooks/useWithdrawStabilityPool'
import useStabilityAssetPool from '@/components/Bid/hooks/useStabilityAssetPool'
import { getSPTimeLeft } from '@/components/Bid/StabilityPool'
import useClaimUnstake from '@/components/Stake/hooks/useClaimUnstake'

const useProtocolClaims = () => {
  const { address } = useWallet()
  var msgsToSend = false

  const { data: msgs } = useQuery<MsgExecuteContractEncodeObject[] | undefined>({
    queryKey: ['msg all protocol claims', address],
    queryFn: () => {
        var msgs = [] as MsgExecuteContractEncodeObject[]

        /////Add Liquidation claims/////        
        const { data: claims } = useCheckClaims()
        const { data: SP_claims } = useCheckSPClaims()
        const claimLiq = useClaimLiquidation(claims, SP_claims)
        if (!claimLiq?.action.simulate.isError){
          msgs.concat(claimLiq.msgs ?? [])
          msgsToSend = true
        }
        /////Add Staking reward and Stake Claims////
        const { data } = useStaked()        
        const { staked = [] } = data || {}
        const { unstaking = [] } = data || {}
        const mbrnAsset = useAssetBySymbol('MBRN')
        const claimable = useMemo(() => {
            if (!staked?.rewards || !mbrnAsset) return '0.00'
        
            return shiftDigits(staked?.rewards?.accrued_interest, -mbrnAsset?.decimal).toString()
          }, [staked, mbrnAsset])

        //If there is anything to claim, claim
        if (isGreaterThanZero(claimable)) {
          const stakingClaim = useStakingClaim(false)
          if (!stakingClaim?.action.simulate.isError){
            msgs.concat(stakingClaim.msgs ?? [])
            msgsToSend = true
          }
        }
        //If there is anything to unstake, unstake
        if (unstaking?.find((unstake: any, index: number) => {            
            const { minutesLeft } = getTimeLeft(unstake?.unstake_start_time)
            minutesLeft <= 0
        })){
          const unstakeClaim = useClaimUnstake()
          if (!unstakeClaim?.action.simulate.isError){
            msgs.concat(unstakeClaim.msgs ?? [])         
            msgsToSend = true 
          }
        }
        /////Add Vesting Claims////
        const claimFees = useClaimFees()
        if (!claimFees?.action.simulate.isError){
          msgs.concat(claimFees.msgs ?? [])
          msgsToSend = true
        }

        ///Add SP Unstaking////
        const { data: stabilityPoolAssets } = useStabilityAssetPool()
        const { deposits = [] } = stabilityPoolAssets || {}
        //sum the deposits that are ready to be withdrawn
        const totalwithdrawableDeposits = deposits.reduce((acc, deposit) => {
            if (deposit.unstake_time) {
              //How much time left
              const { daysLeft, hoursLeft, minutesLeft } = getSPTimeLeft(deposit.unstake_time)
              if (minutesLeft <= 0) {
                return acc + Number(deposit.amount)
              }
            }
            return acc
        }, 0)
        if (totalwithdrawableDeposits > 0){
            const SPwithdraw = useWithdrawStabilityPool(totalwithdrawableDeposits.toString())
            if (!SPwithdraw?.action.simulate.isError){
                msgs.concat(SPwithdraw.msgs ?? [])
                msgsToSend = true
            }
        }

      return msgs as MsgExecuteContractEncodeObject[]
    },
    enabled: !!address,
  })

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['liquidation claims'] })
    queryClient.invalidateQueries({ queryKey: ['liquidation info'] })
    queryClient.invalidateQueries({ queryKey: ['user bids'] })
    queryClient.invalidateQueries({ queryKey: ['staked'] })
    queryClient.invalidateQueries({ queryKey: ['allocations'] })
    queryClient.invalidateQueries({ queryKey: ['stability asset pool'] })
    queryClient.invalidateQueries({ queryKey: ['balances'] })
  }

  return {action: useSimulateAndBroadcast({
    msgs,
    enabled: !!msgs,
    onSuccess,
  }), msgsToSend}
}

export default useProtocolClaims
