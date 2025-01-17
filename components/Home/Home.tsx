import { Card, Stack, Text } from '@chakra-ui/react'
import { StatsCard } from '../StatsCard'
import ConfirmModal from '../ConfirmModal'
import useCollateralAssets from '../Bid/hooks/useCollateralAssets'
import useBalance from '@/hooks/useBalance'
import useQuickActionState from './hooks/useQuickActionState'
import { useEffect, useState } from 'react'
import { num, shiftDigits } from '@/helpers/num'
import { Coin } from '@cosmjs/stargate'
import { calcSliderValue } from '../Mint/TakeAction'
import { useOraclePrice } from '@/hooks/useOracle'
import { QuickActionLTVWithSlider } from './QuickActionLTVWithSlider'
import useQuickActionVaultSummary from './hooks/useQuickActionVaultSummary'
import useQuickAction from './hooks/useQuickAction'
import { QASummary } from './QASummary'
import useWallet from '@/hooks/useWallet'
import { ConnectButton } from '../WallectConnect'
import { SliderWithInputBox } from './QuickActionSliderInput'
import Divider from '../Divider'

const Home = () => {
  const { isWalletConnected } = useWallet()
  const { data: walletBalances } = useBalance()
  const { quickActionState, setQuickActionState } = useQuickActionState()
  const assets = useCollateralAssets()
  const { data: prices } = useOraclePrice()
  const quickAction = useQuickAction()
  
  const [ inputAmount, setInputAmount ] = useState(0);  
  
  ////Get all assets that have a wallet balance///////
  //List of all denoms in the wallet
  const walletDenoms = (walletBalances??[]).map((coin: Coin) => {
    if (num(coin.amount).isGreaterThan(0)) return coin.denom
    else return ""
  }).filter((asset: string) => asset != "");

  //Create an object of assets that only holds assets that have a walletBalance
  useEffect(() => {    
    if (prices && walletBalances && assets){
        const assetsWithBalance = assets?.filter((asset) => {
          if (asset !== undefined) return walletDenoms.includes(asset.base)
          else return false
        }).map((asset) => {
          if (!asset) return
          
          return {
            ...asset,
            value: asset?.symbol,
            label: asset?.symbol,
            sliderValue: 0,
            balance: num(shiftDigits((walletBalances?.find((b: any) => b.denom === asset.base)?.amount??0), -(asset?.decimal??6))).toNumber(),
            price: Number(prices?.find((p: any) => p.denom === asset.base)?.price??"0"),
            combinUsdValue: num(num(shiftDigits((walletBalances?.find((b: any) => b.denom === asset.base)?.amount??0), -(asset?.decimal??6))).times(num(prices?.find((p: any) => p.denom === asset.base)?.price??"0"))).toNumber()
          }
        }).filter((asset) => {
          if (!asset) return false
           //This helps us decrease the menu size by removing dust
           //Technically we could do anything under $110 as that's the minimum but for new users that adds confusion
          if (asset.combinUsdValue < 5) return false
          else return true
        })

        setQuickActionState({
          assets: (assetsWithBalance??[])
        })
      }
  }, [assets, walletBalances, prices])

  useEffect(() => {
    if (!quickActionState?.selectedAsset && (quickActionState?.assets??[]).length > 0) {
      setQuickActionState({
        selectedAsset:  quickActionState?.assets[0], 
      })
    }
  }, [quickActionState?.assets, walletBalances])
  //
  
  const onMenuChange = (value: string) => {
    setQuickActionState({
      selectedAsset: value
    })
  }

  //Use mintState to update the deposit state
  const { debtAmount, maxMint } = useQuickActionVaultSummary()
  const sliderValue = calcSliderValue(debtAmount, quickActionState.mint, 0)

  useEffect(() => {

    if (quickActionState?.assets && quickActionState?.selectedAsset?.symbol != undefined) {
      setQuickActionState({
        selectedAsset: quickActionState?.assets.find((asset) => asset.symbol === quickActionState?.selectedAsset?.symbol),
      })
    }
    
  }, [quickActionState?.assets, quickActionState?.selectedAsset?.symbol])

  return (
    <Stack >
      <StatsCard />      
      <Card w="384px" alignItems="center" justifyContent="space-between" p="8" gap="0">
        <Text variant="title" fontSize="16px">
          Mint & LP
        </Text>
        {!isWalletConnected ? 
          <ConnectButton marginTop={6}/>
        : quickActionState.assets.length === 0 ? 
          <Text variant="body" fontSize="16px" marginTop={6}>
            Loading your available collateral...
          </Text>
        : 
        <>
        {/* //Action */}
        {/* Asset Menu + Input Box/Slider*/}        
        <Stack py="5" w="full" gap="2">
          <SliderWithInputBox
            max={quickActionState?.selectedAsset?.combinUsdValue??0}
            inputBoxWidth='42%'
            QAState={quickActionState}
            setQAState={setQuickActionState}
            onMenuChange={onMenuChange}
            inputAmount={inputAmount}
            setInputAmount={setInputAmount}
          />    
          <Text fontSize="14px" fontWeight="700" marginBottom={"1%"}>
            Mint CDT to  <a style={{textDecoration: "underline"}} href="https://app.osmosis.zone/pool/1268">LP</a>
          </Text> 
        <Divider mx="0" mt="0" mb="4%"/>
          <QuickActionLTVWithSlider label="Your Debt" value={sliderValue}/>
          { maxMint < 100 ? <Text fontSize="sm" color="red.500" mt="2" minH="21px">
             Minimum debt is 100, deposit more to increase your available mint amount: ${(maxMint??0).toFixed(2)}
          </Text>: null}
        </Stack>

        {/* Deposit-Mint-LP Button */}
        <ConfirmModal 
          action={quickAction}
          label={'LP'}
          isDisabled={quickAction?.simulate.isError || !quickAction?.simulate.data || (!quickActionState.summary?.length && !quickActionState?.mint)}>
          <QASummary/>
        </ConfirmModal></>}
      </Card>
    </Stack>
  )
}

export default Home
