import { Card, HStack, Input, Stack, Text } from '@chakra-ui/react'
import { StatsCard } from '../StatsCard'
import ConfirmModal from '../ConfirmModal'
import useCollateralAssets from '../Bid/hooks/useCollateralAssets'
import useBalance, { useBalanceByAsset } from '@/hooks/useBalance'
import QASelect from '@/components/QuickActionSelect'
import useQuickActionState, { QuickActionState } from './hooks/useQuickActionState'
import { SliderWithState } from '../Mint/SliderWithState'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { num, shiftDigits } from '@/helpers/num'
import { delayTime } from "@/config/defaults"
import { Asset } from '@/helpers/chain'
import { Coin } from '@cosmjs/stargate'
import { LTVWithSlider } from '../Mint/LTVWithSlider'
import useVaultSummary from '../Mint/hooks/useVaultSummary'
import useMintState from '../Mint/hooks/useMintState'
import { calcSliderValue } from '../Mint/TakeAction'
import { useOraclePrice } from '@/hooks/useOracle'
import { QuickActionAssetWithSlider } from './QuickActionAssetSlider'
import { AssetWithBalance } from '../Mint/hooks/useCombinBalance'
import { QuickActionLTVWithSlider } from './QuickActionLTVWithSlider'
import useQuickActionVaultSummary from './hooks/useQuickActionVaultSummary'
import useQuickAction from './hooks/useQuickAction'
import { QASummary } from './QASummary'
import useWallet from '@/hooks/useWallet'

type Props = {
  value: string
  onChange: (value: string) => void
  assets: AssetWithBalance[]
}

const AssetsWithBalanceMenu = ({ value, onChange, assets }: Props) => {
    return <QASelect options={assets} onChange={onChange} value={value} />
}

type SliderWithInputProps = {
  max: number
  inputBoxWidth?: string
  QAState: QuickActionState
  setQAState: (partialState: Partial<QuickActionState>) => void
  onMenuChange: (value: string) => void
  inputAmount: number
  setInputAmount: (value: number) => void
}

const SliderWithInputBox = ({ max, inputBoxWidth = "38%", QAState, setQAState, onMenuChange, inputAmount, setInputAmount }: SliderWithInputProps) => {

    const onSliderChange = (value: number) => {      
      if (inputAmount != value) setInputAmount(value)
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      const newAmount = e.target.value
      if (num(newAmount).isGreaterThan(max)) setInputAmount(max)
        else setInputAmount(parseInt(e.target.value))

      setTimeout(() => {
        if (num(newAmount).isGreaterThan(max)) setQAState({ selectedAsset: { ...QAState?.selectedAsset, sliderValue: max }})
          else setQAState({ selectedAsset: { ...QAState?.selectedAsset, sliderValue: (parseInt(e.target.value)) }})
      }, delayTime);  
    }

    useEffect(() => {
      //If the selected asset has a different slider value than the inputAmount, set the inputAmount to the slider value
      if (QAState?.selectedAsset?.sliderValue != inputAmount) {
        setInputAmount(QAState?.selectedAsset?.sliderValue??0)
      }
    }, [QAState?.selectedAsset?.sliderValue])
    


    return (
    <Stack py="5" w="full" gap="5">     
      <Text fontSize="14px" fontWeight="700">
        Choose Collateral
      </Text> 
      {QAState?.selectedAsset != undefined ? <><HStack justifyContent="space-between">
        <AssetsWithBalanceMenu 
          value={QAState?.selectedAsset} 
          onChange={onMenuChange}
          assets={QAState?.assets}
        />
        <Input 
          width={inputBoxWidth} 
          textAlign={"center"} 
          placeholder="0" 
          type="number" 
          value={inputAmount} 
          onChange={handleInputChange}
        />
      </HStack>
      <QuickActionAssetWithSlider onChangeExt={onSliderChange} key={QAState?.selectedAsset?.base} asset={QAState?.selectedAsset} label={QAState?.selectedAsset?.symbol} />
      </> : null}

  </Stack>)
}


const Home = () => { 
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
          <QuickActionLTVWithSlider label="Your Debt" value={sliderValue}/>
          { maxMint < 100 ? <Text fontSize="sm" color="red.500" mt="2" minH="21px">
             Minimum debt is 100, deposit more to increase your available mint amount: ${(maxMint??0).toFixed(2)}
          </Text>: null}
        </Stack>

        {/* Deposit-Mint-LP Button */}
        <ConfirmModal action={quickAction} label={'LP'}>
          <QASummary/>
        </ConfirmModal>
      </Card>
    </Stack>
  )
}

export default Home
