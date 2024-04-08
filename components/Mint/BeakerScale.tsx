import { num } from '@/helpers/num'
import { Box, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React, { Fragment, useMemo } from 'react'
import useMintState from './hooks/useMintState'
import useVaultSummary from './hooks/useVaultSummary'

export const BeakerLiquid = () => {
  const { mintState } = useMintState()

  const { ltv, borrowLTV } = useVaultSummary()

  const health = num(1).minus(num(ltv).dividedBy(borrowLTV)).times(100).dp(0).toNumber()

  const percent = useMemo(() => {
    const ltvSlider = mintState?.ltvSlider || 0
    const value = num(ltvSlider).isLessThan(5) ? num(ltvSlider).times(2.6) : num(ltvSlider)
    return num(health).times(336).div(100).toNumber()
  }, [mintState.ltvSlider, health])

  if (!num(percent).isGreaterThan(0)) return null

  return (
    <motion.div
      style={{
        position: 'absolute',
        // bottom: -17,
        top: 505,
        left: 117,
        maxHeight: percent,
        transform: 'scale(1.17) rotate(180deg)',
        height: percent,
        overflow: 'hidden',
        transformOrigin: 'top',
        // zIndex: 2,
      }}
      initial={{ height: 0 }}
      animate={{ height: percent }}
      transition={{ type: 'spring', stiffness: 1000 }}
    >
      <Image src="/images/beaker_liquid.svg" transform="rotate(180deg)" />
    </motion.div>
  )
}

const BeakerScale = () => {
  return <BeakerLiquid />
}
// const BeakerScale = () => {
//   return (
//     <Fragment>
//       <Box position="absolute" left="889px" top="391px" zIndex={2} transform="scale(0.85)">
//         <Image src="/images/beaker_lines.svg" />
//       </Box>
//       <BeakerLiquid />
//     </Fragment>
//   )
// }

export default BeakerScale