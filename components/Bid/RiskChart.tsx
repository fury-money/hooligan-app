import { Box, HStack, Spinner, Stack, Text } from '@chakra-ui/react'
import {
  Bar,
  BarChart,
  Label,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import useLiquidation from './hooks/useLiquidation'
import { useMemo } from 'react'
import { num } from '@/helpers/num'
import useBidState from './hooks/useBidState'
import { shiftDigits } from '@/helpers/math'

const CustomTooltip = ({ active, payload, label }) => {
  const { tvl, premium } = payload[0]?.payload || {}

  if (active && payload && payload.length) {
    return (
      <Stack bg="black" p={4} borderRadius="md" minW="200px">
        <HStack
          justifyContent="space-between"
          borderBottom="1px solid"
          borderColor="whiteAlpha.300"
          pb={1}
        >
          <Text fontSize="xs" color="whiteAlpha.600">
            TVL
          </Text>
          <Text fontSize="xs" color="whiteAlpha.800">
            {tvl} CDT
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="xs" color="whiteAlpha.600">
            Primium
          </Text>
          <Text fontSize="xs" color="whiteAlpha.800">
            {label}%
          </Text>
        </HStack>
      </Stack>
    )
  }

  return null
}

const RiskChart = () => {
  const { bidState } = useBidState()
  const { data: liqudation, isLoading } = useLiquidation(bidState?.selectedAsset)

  const data = useMemo(() => {
    return liqudation
      ?.map((item) => ({
        premium: num(item?.liq_premium).times(100).toNumber(),
        tvl: shiftDigits(item?.total_bid_amount, -6).toNumber(),
      }))
      .reverse()
      .sort((a, b) => a.premium - b.premium)
      .slice(0, 10)
  }, [liqudation])

  console.log({
    liqudation,
  })

  if (isLoading) {
    return (
      <Box w="420px" h="180px" display="flex" justifyContent="center" alignItems="center">
        <Spinner color="primary.200" />
      </Box>
    )
  }

  return (
    <Box w="420px" h="200px">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={420}
          height={200}
          data={data}
          margin={{
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorTVL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00A3F9" />
              <stop offset="100%" stopColor="#00F1EF" />
            </linearGradient>
          </defs>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'none' }} />
          <XAxis
            dataKey="premium"
            tick={{ fill: '#FFF' }}
            tickMargin={10}
            axisLine={{ stroke: '#FFF' }}
            tickLine={false}
            height={50}
            label={{
              value: 'Premium %',
              position: 'insideBottom',
              offset: -5,
              fill: 'gray',
              fontSize: 13,
            }}
          />
          <Bar
            dataKey="tvl"
            fill="url(#colorTVL)"
            barSize={24}
            shape={<Rectangle radius={[10, 10, 0, 0]} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default RiskChart
