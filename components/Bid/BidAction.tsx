import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react'
import React, { PropsWithChildren } from 'react'
import PlaceBid from './PlaceBid'
import MyBid from './MyBid'

type Props = {}

const CustomTab = ({ children }: PropsWithChildren) => (
  <Tab
    color="white"
    fontWeight="normal"
    _selected={{ fontWeight: 'normal', color: 'white', bg: 'primary.200', border: 'none' }}
  >
    {children}
  </Tab>
)

const BidAction = (props: Props) => {
  return (
    <Tabs variant="soft-rounded" size="sm" colorScheme="primary">
      <TabList gap="2">
        <CustomTab>Place Bid</CustomTab>
        <CustomTab>My Bid</CustomTab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <PlaceBid />
        </TabPanel>
        <TabPanel>
          <MyBid />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default BidAction
