import React from 'react'
import RiskChart from './RiskChart'
import { Card, Text } from '@chakra-ui/react'
import Select from './Select'

const Risk = () => {
  return (
    <Card p="8" alignItems="center" gap={5}>
      <Text variant="title">Liquidation TVL For</Text>

      <Select />

      <RiskChart />
    </Card>
  )
}

export default Risk
